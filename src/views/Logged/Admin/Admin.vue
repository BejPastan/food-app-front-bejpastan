<script setup lang="ts">
import { ref, computed, onMounted, markRaw } from 'vue'
import ButtonSelect from '@/components/Basic/Input/ButtonSelect.vue'
import SearchableList from '@/components/Basic/Search/SearchableList.vue'
import TabContainer from '@/components/TabContainer.vue'
import RecipeTile from '@/components/Tiles/RecipeTile.vue'
import MealTile from '@/components/Tiles/MealTile.vue'
import { DebouncTime } from '@/constants/Search'
import { SearchingItems } from '@/services/search_service'
import ExpandedModal from '@/components/PageComponents/ExpandedModal.vue'
import MealForm from '@/components/Forms/mealForm.vue'
import RecipeForm from '@/components/Forms/recipeForm.vue'
import type { GenericForm } from '@/components/Forms/GenericForm'
import { emptyRecipe } from '@/models/Recipe'

const objectsTypes = ['Recipes', 'Meals']
const tileComponents: Record<string, any> = {
  Recipes: RecipeTile,
  Meals: MealTile,
}

const objectsTypesToOptions = objectsTypes.map((t) => ({ label: t, value: t }))
const selectedObjectType = ref(objectsTypes[0])

onMounted(() => {
  handleSearch(searchQuery.value) // Initial search on mount
})

const handleModalClose = () => {
  console.log('Modal closed')
  modalOpen.value = false
}

const handleModalOpen = () => {
  console.log('Modal opened')
  modalOpen.value = true
}

const handleSelect = (option: string) => {
  if(option === selectedObjectType.value) return // No change
  selectedObjectType.value = option
  handleSearch(searchQuery.value) // Trigger search with the current query when type changes
}

// Computed: returns the appropriate tile component based on selected type
const currentTileComponent = computed(() => {
  return tileComponents[selectedObjectType.value] || RecipeTile
})

// Placeholder data and handlers
const searchData = ref<any[]>([])
const isSearching = ref(false)
const searchQuery = ref('')

//empty tile for adding new items
const emptyTile = computed(() => {
  switch (selectedObjectType.value) {
    case 'Recipes':
      var recipe = emptyRecipe
      recipe.id = ""
      recipe.name = 'Add New Recipe'
      return recipe
    case 'Meals':
      return { id: '', name: 'Add New Meal', order: 0 }
    default:
      return { id: '', name: 'Add New Item' }
  }
})

const selectedItem = ref<any>(emptyTile.value)
const formVersion:GenericForm<any> = computed(() => {
  console.log('Determining form version for selected type:', selectedObjectType.value)
      selectedItem.value = emptyTile.value
  switch (selectedObjectType.value) {
    case 'Recipes':
      console.log('Form version for Recipes selected');
      return markRaw(RecipeForm)
    case 'Meals':

      console.log('Form version for Meals selected')
      return markRaw(MealForm)
    default:
      console.warn('No form version available for selected type:', selectedObjectType.value)
      return null
  }
})

const handleSearch = (query:string) =>
{
  searchQuery.value = query
  isSearching.value = true
  SearchingItems(query, selectedObjectType.value).then((response) => {
    searchData.value = [emptyTile.value, ...response]
    isSearching.value = false
  }).catch((error) => {
    console.error('Error fetching search results:', error)
    isSearching.value = false
  })
}

const modalOpen = ref(false)

const handleTilePress = (item: any) => {
  selectedItem.value = item
  console.log('Selected item:', item)
  modalOpen.value = true
}
</script>

<template>
  <TabContainer>
    <ButtonSelect
      :options="objectsTypesToOptions"
      :modelValue="selectedObjectType"
      @update:model-value="handleSelect"
    />
    <SearchableList
      :data="searchData"
      :listItem="currentTileComponent"
      :onSearch="handleSearch"
      :debounceTime="DebouncTime.short"
      :isSearching="isSearching"
      :onTilePress="handleTilePress"
    />
    <ExpandedModal
      :label="'Close'"
      :is-open="modalOpen"
      @open="handleModalOpen"
      @close="handleModalClose"
      :external-controlled="true"
    >
      <component v-if="selectedItem != null" :is="formVersion" :onSubmit="handleModalClose" :data="selectedItem"/>
    </ExpandedModal>
  </TabContainer>
</template>

<style scoped>
.scroll-container {
  overflow-x: auto;
  height: 100%;
}
</style>