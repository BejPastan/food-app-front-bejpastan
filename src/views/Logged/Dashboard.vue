<script setup lang="ts">
import LoadingIndicator from '@/components/Basic/LoadingIndicator.vue';
import WeekPicker from '@/components/Navigation/WeekPicker.vue';
import ExpandedModal from '@/components/PageComponents/ExpandedModal.vue';
import MealSelector from '@/components/PageComponents/MealSelector.vue';
import MealView, { type MealViewData } from '@/components/PageComponents/MealView.vue';
import TabContainer from '@/components/TabContainer.vue';
import { getCachedMealOrder, getCachedMeals, getCachedMealsSync } from '@/models/Meal';
import { getCurrentUserSync } from '@/models/User';
import { getCurrentKitchenRoleSync, getCurrentKitchenSync, initKitchen, subscribeCurrentKitchen } from '@/models/Kitchen';
import { kitchenMealService, type CreateKitchenMeal, type KitchenMealListParams, type KitchenMealWithData } from '@/models/KitchenMeal';
import { hasKitchenRoleAtLeast } from '@/models/KitchenRole';
import { computed, onMounted, onUnmounted, ref } from 'vue';

const haveMealOrder = ref(false);
const haveInitialDate = ref(false);
const haveKitchen = ref(false);

// Roles that may change the meals of the kitchen ('inspector' is read only)
const canEditMeals = ref(false);

const refreshMealPermissions = () => {
    var role = getCurrentKitchenRoleSync();
    console.log("Current kitchen role:", role);
    canEditMeals.value = hasKitchenRoleAtLeast(role, 'editor');
};

const allReady = () => haveMealOrder.value && haveInitialDate.value && haveKitchen.value;

onMounted(async () => {
    mealOrder.value = await getCachedMealOrder();
    haveMealOrder.value = true;

    var userId = getCurrentUserSync()?.id;
    if(userId != null)
    {
        await initKitchen(userId);
    }
    haveKitchen.value = getCurrentKitchenSync() != null;
    refreshMealPermissions();

    unsubscribeKitchen = subscribeCurrentKitchen(handleKitchenChange);

    if(allReady())
    {
        fetchMealsForWeek();
    }
});

onUnmounted(() => {
    unsubscribeKitchen?.();
    unsubscribeKitchen = null;
});

//#region Current kitchen (selected in the header KitchenSelector)
let unsubscribeKitchen: (() => void) | null = null;
let lastFetchedKitchenId = '';

// The header re-selects the stored kitchen when it refreshes, so the id is compared to avoid loading the same week twice
const handleKitchenChange = () => {
    refreshMealPermissions();

    var kitchenId = getCurrentKitchenSync()?.id ?? '';
    haveKitchen.value = kitchenId !== '';
    if(kitchenId === lastFetchedKitchenId || !allReady())
    {
        return;
    }
    fetchMealsForWeek();
};
//#endregion

//#region Week handling
const weekStart = ref(new Date());
const weekEnd = ref(new Date());
const isLoading = ref(false);

const handleWeekChange = (start: Date, end: Date) => {
    weekStart.value = start;
    weekEnd.value = end;
    haveInitialDate.value = true;
    if(allReady())
    {
        fetchMealsForWeek();
    }
};

const mealsForWeek = ref<MealViewData[]>([]);

const mealOrder = ref<Map<string, number>>(new Map());

const bucketsNum = computed(() => {
    return mealOrder.value.size * 7; // 7 days in a week
});

const fetchMealsForWeek = async () => {
    // Fetch the meals planned in the kitchen selected in the header for the given week
    var kitchen = getCurrentKitchenSync();
    if(kitchen == null)
    {
        mealsForWeek.value = [];
        return;
    }

    isLoading.value = true;
    lastFetchedKitchenId = kitchen.id;

    try
    {
        var params:KitchenMealListParams = {
            kitchenId: kitchen.id,
            startDate: weekStart.value,
            endDate: weekEnd.value
        }
        var kitchenMeals = await kitchenMealService.getAll(params);

        console.log("Fetched meals for week:", kitchenMeals);

        //sort meals by meal order
        var mealNum = mealOrder.value.size;
        var mealBuckets: KitchenMealWithData[][] = new Array(bucketsNum.value).fill(0).map(() => []);

        for(var i=0; i<kitchenMeals.length; i++)
        {
            var mealorderId = mealOrder.value.get(kitchenMeals[i].meal)??mealNum;
            var dayIndex = kitchenMeals[i].mealDate.getDay();
            var bucketIndex = mealNum * ((dayIndex+6)%7) + mealorderId;
            mealBuckets[bucketIndex].push(kitchenMeals[i]);
        }

        var data: MealViewData[] = [];
        for(var i=0; i<bucketsNum.value; i++)
        {
            var mealIndex = i % mealNum;
            var dayIndex = Math.floor(i / mealNum);
            var mealData:MealViewData = {
                meals: mealBuckets[i],
                meal: Array.from(mealOrder.value.keys())[mealIndex] ?? '',
                mealDate: new Date(weekStart.value.getTime() + dayIndex * 24 * 60 * 60 * 1000)
            }
            data.push(mealData);
        }
        mealsForWeek.value = data
    }
    catch(error)
    {
        console.error("Failed to load the meals of the kitchen:", error);
    }
    finally
    {
        isLoading.value = false;
    }
};
//#endregion

//#region Add Meal Handler
const openAddMealModal = ref(false);

const selectedDate = ref<Date | null>(null);
const selectedMealName = ref<string | null>(null);
const selectedMealId = computed(() => {
    var meals = getCachedMealsSync();
    return meals.find(m => m.name === selectedMealName.value)?.id ?? "";
})

const handleAddMeal = (date: Date, mealName: string) => {
    console.log("Add meal for date:", date);
    selectedDate.value = date;
    selectedMealName.value = mealName;
    openAddMealModal.value = true;
};

const handleCloseAddMealModal = () => {
    openAddMealModal.value = false;
    selectedDate.value = null;
    selectedMealName.value = null;
};

const handleRemoveMeal = async (recordId: string) => {
    var kitchen = getCurrentKitchenSync();
    if(kitchen == null || !canEditMeals.value)
    {
        return;
    }
    try
    {
        await kitchenMealService.delete(kitchen.id, recordId);
    }
    catch(error)
    {
        console.error("Failed to remove the meal:", error);
        return;
    }
    fetchMealsForWeek(); // Refresh the meals for the week after removing
};

const handleSaveMeal = async (payload:{recipeId:string, mealDate: Date, mealName: string}) => {
    // Save the meal to the database or store
    console.log("Saving meal:", payload.recipeId, payload.mealDate, payload.mealName);
    handleCloseAddMealModal();

    var kitchen = getCurrentKitchenSync();
    if(kitchen == null || !canEditMeals.value)
    {
        return;
    }
    
    var meals = await getCachedMeals();

    var params:CreateKitchenMeal = {
        recipeId: payload.recipeId,
        mealId: meals.find(m => m.name === payload.mealName)?.id ?? "",
        mealDate: payload.mealDate,
    }
    try
    {
        await kitchenMealService.create(kitchen.id, params);
    }
    catch(error)
    {
        console.error("Failed to add the meal to the kitchen:", error);
        return;
    }
    fetchMealsForWeek(); // Refresh the meals for the week after saving
};



//#endregion
</script>

<template>
    <TabContainer>
        <WeekPicker @week-change="handleWeekChange" :initial-date="weekStart"/>
        <div class="meal-view-container">
            <LoadingIndicator v-if="isLoading"/>
            <div v-else v-for="recipesForDay in mealsForWeek">
                <MealView
                    :meals="recipesForDay.meals"
                    :meal="recipesForDay.meal"
                    :meal-date="recipesForDay.mealDate"
                    :can-edit="canEditMeals"
                    @add-meal="handleAddMeal"
                    @remove-meal="handleRemoveMeal"
                />
            </div>
        </div>
        <ExpandedModal
            :is-open="openAddMealModal"
            :external-controlled="true"
            label="Close"
            @close="handleCloseAddMealModal"
        >
            <div class="meal-selector-container">
                <MealSelector
                    v-if="selectedDate!= null && selectedMealName !=null"
                    :mealDate="selectedDate"
                    :mealName="selectedMealName"
                    :mealId="selectedMealId"
                    @save="handleSaveMeal"
                />
            </div>
        </ExpandedModal>
    </TabContainer>
</template>

<style scoped>
.meal-view-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  overflow-y: auto;
  scrollbar-width: none;
}
.meal-selector-container {
    padding: var(--spacing-md);
    width: 100%;
    height: 100%;
    box-sizing: border-box;

}
</style>