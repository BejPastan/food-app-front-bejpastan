<script setup lang="ts">
import RecipeTile from '@/components/Tiles/RecipeTile.vue'
import Text from '@/components/Basic/Text.vue'
import type { KitchenMealWithData } from '@/models/KitchenMeal'
import type { RecipeSimplified } from '@/models/Recipe'
import Button from '../Basic/Input/Button.vue'
import { computed } from 'vue'


export interface MealViewData {
    meals: KitchenMealWithData[];
    meal: string;
    mealDate: Date;
}

const props = withDefaults(defineProps<{
  meals: KitchenMealWithData[]
  canEdit?: boolean
  meal: string
  mealDate: Date
  onAddMeal?: (date: Date, mealName: string) => void
  onRemoveMeal?: (recordid: string) => void
}>(), { canEdit: true })

function mapKitchenMealsToRecipes(meal: KitchenMealWithData): RecipeSimplified {
  return ({
    id: meal.recipeId,
    name: meal.name,
    time: meal.time,
    portion: meal.portion,
  })
}

// Removing is allowed only for members that may edit the meals of the kitchen
function handleMagnetPress(recordId: string): void {
  if (!props.canEdit) {
    return
  }
  props.onRemoveMeal?.(recordId)
}

const handleAddMeal = () => {
  props.onAddMeal?.(props.mealDate, props.meal)
}

const mealDay = computed(() => {
  const days = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota']
  return days[props.mealDate.getDay()]
})

</script>

<template>
  <div class="meal-view">
    <Text :content="`${mealDay} ${props.meal}`" type="subtitle" variant="prim-prim" />
    <div class="scroll-container">
      <RecipeTile
        v-for="(recipe, index) in props.meals"
        :key="index"
        :data="mapKitchenMealsToRecipes(recipe)"
        @magnet-press="handleMagnetPress(recipe.recordId)"
      />
      <div v-if="canEdit && onAddMeal" class="add-meal-button">
        <Button  @click="handleAddMeal" :label="'+'"/>
      </div>
    </div>
  </div>
</template>

<style scoped>
.meal-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.scroll-container {
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) 0;
}

.add-meal-button {
  width: var(--btn-height-default);
}
</style>