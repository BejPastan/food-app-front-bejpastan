<script setup lang="ts">
import { computed } from 'vue'
import RecipeTile from '@/components/Tiles/RecipeTile.vue'
import Text from '@/components/Basic/Text.vue'
import type { UserMealWithData } from '@/models/UserMeal'
import type { RecipeSimplified } from '@/models/Recipe'
import Button from '../Basic/Input/Button.vue'


export interface MealViewData {
    meals: UserMealWithData[];
    meal: string;
    mealDate: Date;
}

const props = withDefaults(defineProps<{
  meals: UserMealWithData[]
  meal: string
  mealDate: Date
  onAddMeal?: (date: Date, mealName: string) => void
  onRemoveMeal?: (recordid: string) => void
}>(), {})

function mapUserMealsToRecipes(meal: UserMealWithData): RecipeSimplified {
  return ({
    id: meal.recipeId,
    name: meal.name,
    time: meal.time,
    portion: meal.portion,
  })
}

const handleAddMeal = () => {
  props.onAddMeal?.(props.mealDate, props.meal)
}
</script>

<template>
  <div class="meal-view">
    <Text :content="meal" type="subtitle" variant="prim-prim" />
    <div class="scroll-container">
      <RecipeTile
        v-for="(recipe, index) in props.meals"
        :key="index"
        :data="mapUserMealsToRecipes(recipe)"
        @magnet-press="props.onRemoveMeal?.(recipe.recordId)"
      />
      <div v-if="onAddMeal" class="add-meal-button">
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