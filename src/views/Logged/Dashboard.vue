<script setup lang="ts">
import LoadingIndicator from '@/components/Basic/LoadingIndicator.vue';
import WeekPicker from '@/components/Navigation/WeekPicker.vue';
import ExpandedModal from '@/components/PageComponents/ExpandedModal.vue';
import MealSelector from '@/components/PageComponents/MealSelector.vue';
import MealView, { type MealViewData } from '@/components/PageComponents/MealView.vue';
import TabContainer from '@/components/TabContainer.vue';
import { getCachedMealOrder, getCachedMeals, getCachedMealsSync } from '@/models/Meal';
import { getCurrentUserSync } from '@/models/User';
import { userMealService, type CreateUserMeal, type UserMealListParams, type UserMealWithData } from '@/models/UserMeal';
import { computed, onMounted, ref } from 'vue';

onMounted(async () => {
    mealOrder.value = await getCachedMealOrder();
});

//#region Week handling
const weekStart = ref(new Date());
const weekEnd = ref(new Date());
const isLoading = ref(false);

const handleWeekChange = (start: Date, end: Date) => {
    weekStart.value = start;
    weekEnd.value = end;
    fetchMealsForWeek();
};

const mealsForWeek = ref<MealViewData[]>([]);

const mealOrder = ref<Map<string, number>>(new Map());

const bucketsNum = computed(() => {
    return mealOrder.value.size * 7; // 7 days in a week
});

const fetchMealsForWeek = async () => {
    // Fetch meals for the given week from the API or store
    isLoading.value = true;

    var userId = getCurrentUserSync()?.id;

    var params:UserMealListParams = {
        userId: userId,
        startDate: weekStart.value,
        endDate: weekEnd.value
    }
    var userMeals = await userMealService.getAll(params);

    console.log("Fetched meals for week:", userMeals);

    //sort meals by meal order
    var mealNum = mealOrder.value.size;
    var mealBuckets: UserMealWithData[][] = new Array(bucketsNum.value).fill(0).map(() => []);

    for(var i=0; i<userMeals.length; i++)
    {
        var mealorderId = mealOrder.value.get(userMeals[i].meal)??mealNum;
        var dayIndex = userMeals[i].mealDate.getDay();
        var bucketIndex = mealNum * (dayIndex-1) + mealorderId;
        console.log("Placing meal", userMeals[i], "in bucket", bucketIndex);
        console.log("mealBucket length:", mealBuckets.length);
        mealBuckets[bucketIndex].push(userMeals[i]);
    }

    console.log("Meal buckets:", mealBuckets);

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
    console.log("Meals for week:", data);
    mealsForWeek.value = data
    isLoading.value = false;
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
    console.log("Removing meal with recordId:", recordId);
    await userMealService.delete(recordId);
    fetchMealsForWeek(); // Refresh the meals for the week after removing
};

const handleSaveMeal = async (payload:{recipeId:string, mealDate: Date, mealName: string}) => {
    // Save the meal to the database or store
    console.log("Saving meal:", payload.recipeId, payload.mealDate, payload.mealName);
    handleCloseAddMealModal();
    
    var meals = await getCachedMeals();

    var params:CreateUserMeal = {
        recipeId: payload.recipeId,
        mealId: meals.find(m => m.name === payload.mealName)?.id ?? "",
        mealDate: payload.mealDate,
    }
    await userMealService.create(params);
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