<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Button from '@/components/Basic/Input/Button.vue'
import SearchableList from '@/components/Basic/Search/SearchableList.vue'
import RecipeTile from '@/components/Tiles/RecipeTile.vue'
import { recipeService } from '@/models/Recipe'
import type { RecipeSimplified } from '@/models/Recipe'
import Modal from '../Basic/Modal.vue'
import RandomMealSelector from './RandomMealSelector.vue'

const props = withDefaults(defineProps<{
  mealDate: Date
  mealName: string
  mealId: string
}>(), {})

const emit = defineEmits<{
  (e: 'save', payload: { recipeId: string; mealDate: Date; mealName: string }): void
  (e: 'remove', recordid: string): void
}>()

const searchData = ref<RecipeSimplified[]>([])
const isSearching = ref(false)
const selectedRecipe = ref<RecipeSimplified | null>(null)

onMounted(() => {
  handleSearch('')
})

const handleSearch = async (query: string) => {
  isSearching.value = true
  try {
    const response = await recipeService.getAll({ name: query, page: 1, perPage: 10, mealNames: [props.mealName] })
    searchData.value = response
  } catch (error) {
    console.error('Search error:', error)
  }
  isSearching.value = false
}

const handleTilePress = (item: RecipeSimplified) => {
  selectedRecipe.value = item
}

const saveButtonLabel = computed(() => {
  return selectedRecipe.value
    ? `Add ${selectedRecipe.value.name}`
    : 'Select recipe'
})

const handleSave = () => {
  if (selectedRecipe.value) {
    emit('save', {
      recipeId: selectedRecipe.value.id,
      mealDate: props.mealDate,
      mealName: props.mealName,
    })
  }
}

//#region Random selection
const openSelectRandom = ref(false)

const handleSelectRandom = () => {
  openSelectRandom.value = true
}

const handleCloseSelectRandom = () => {
  openSelectRandom.value = false
}

const handleRandomSelect = (payload: { recipeId: string; mealDate: Date; mealName: string }) => {
  emit('save', payload)
  handleCloseSelectRandom()
}
//#endregion

</script>

<template>
  <div class="meal-selector">
    <div class="action-bar">
      <Button label="Select Random" :onPress="handleSelectRandom" size="small" buttonType="sec" />
      <Button :label="saveButtonLabel" :onPress="handleSave" size="small" :disabled="!selectedRecipe" />
    </div>
    <SearchableList
      :data="searchData"
      :listItem="RecipeTile"
      :onSearch="handleSearch"
      :debounceTime="300"
      :isSearching="isSearching"
      :onTilePress="handleTilePress"
    />
    <Modal
      :isOpen="openSelectRandom"
      @close="handleCloseSelectRandom"
      >
      <RandomMealSelector
        :mealId="props.mealId"
        :mealDate="props.mealDate"
        :mealName="props.mealName"
        @select="handleRandomSelect"
        />
    </Modal>
  </div>
</template>

<style scoped>
.meal-selector {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  width: 100%;
  height: 100%;
}

.action-bar {
  display: flex;
  flex-direction: row;
  gap: var(--spacing-sm);
}
</style>