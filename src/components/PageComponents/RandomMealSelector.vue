<script setup lang="ts">
import { ref, onMounted } from 'vue'
import RecipeTile from '@/components/Tiles/RecipeTile.vue'
import LoadingIndicator from '@/components/Basic/LoadingIndicator.vue'
import { recipeService, type Recipe } from '@/models/Recipe'
import type { RecipeSimplified } from '@/models/Recipe'

const props = withDefaults(defineProps<{
  mealId: string
  mealDate: Date
  mealName: string
}>(), {})

const emit = defineEmits<{
  (e: 'select', payload: { recipeId: string; mealDate: Date; mealName: string }): void
}>()

const choices = ref<Recipe[]>([])
const isLoading = ref(false)

onMounted(async () => {
  isLoading.value = true
  try {
    choices.value = await recipeService.getChoices({ mealId: props.mealId })
  } catch (error) {
    console.error('Failed to load choices:', error)
  }
  isLoading.value = false
})

const selectedId = ref<string>("")

const handleTilePress = (item: RecipeSimplified) => {
  if (selectedId.value !== "") return

  selectedId.value = item.id

  setTimeout(() => {
    emit('select', {
      recipeId: item.id,
      mealDate: props.mealDate,
      mealName: props.mealName,
    })
  }, 1500)
}
</script>

<template>
  <div class="random-meal-selector">
    <LoadingIndicator v-if="isLoading" />
    <div v-else-if="choices.length === 0" class="empty">
      No choices available
    </div>
    <div v-else class="choices-column">
      <div
        v-for="(choice, index) in choices"
        :key="index"
        class="tile-wrapper"
        :class="{ 'tile-selected': selectedId === choice.id }"
      >
        <RecipeTile
          :data="choice"
          :onPress="handleTilePress"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.random-meal-selector {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: var(--spacing-md);
  box-sizing: border-box;
}

.choices-column {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  align-items: center;
}

.tile-wrapper {
  border-radius: var(--border-radius-md);
  transition: box-shadow var(--transition-medium) ease;
  width: fit-content;
  padding: var(--spacing-md);
}

.tile-wrapper.tile-selected {
  box-shadow: 0 0 0 var(--border-size-md) var(--btn-success);
}

.empty {
  text-align: center;
  color: var(--text-prim-sec);
  padding: var(--spacing-lg);
}
</style>