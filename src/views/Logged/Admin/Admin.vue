<script setup lang="ts">
import { ref, computed, onMounted, markRaw } from 'vue'
import ButtonSelect from '@/components/Basic/Input/ButtonSelect.vue'
import SearchableList from '@/components/Basic/Search/SearchableList.vue'
import TabContainer from '@/components/TabContainer.vue'
import RecipeTile from '@/components/Tiles/RecipeTile.vue'
import MealTile from '@/components/Tiles/MealTile.vue'
import FoodTile from '@/components/Tiles/FoodTile.vue'
import UnitTile from '@/components/Tiles/UnitTile.vue'
import { DebouncTime } from '@/constants/Search'
import { SearchingItems } from '@/services/search_service'
import Modal from '@/components/Basic/Modal.vue'
import Button from '@/components/Basic/Input/Button.vue'
import Text from '@/components/Basic/Text.vue'
import { Messages } from '@/constants/Messages'
import ExpandedModal from '@/components/PageComponents/ExpandedModal.vue'
import MealForm from '@/components/Forms/mealForm.vue'
import RecipeForm from '@/components/Forms/recipeForm.vue'
import FoodForm from '@/components/Forms/foodForm.vue'
import UnitForm from '@/components/Forms/unitForm.vue'
import type { GenericForm } from '@/components/Forms/GenericForm'
import { emptyRecipe, recipeService } from '@/models/Recipe'
import { mealService } from '@/models/Meal'
import { emptyFood, foodService } from '@/models/Food'
import { emptyUnit, unitService } from '@/models/Unit'

const objectsTypes = ['Recipes', 'Meals', 'Foods', 'Units']
const tileComponents: Record<string, any> = {
  Recipes: RecipeTile,
  Meals: MealTile,
  Foods: FoodTile,
  Units: UnitTile,
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
    case 'Foods':
      return { ...emptyFood, id: '', name: 'Add New Food' }
    case 'Units':
      return { ...emptyUnit, id: '', name: 'Add New Unit' }
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
    case 'Foods':
      console.log('Form version for Foods selected')
      return markRaw(FoodForm)
    case 'Units':
      console.log('Form version for Units selected')
      return markRaw(UnitForm)
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

// Optimistic upsert: patch the local list instead of re-fetching everything
const handleFormSubmit = (submitted: any) => {
  if (submitted == null) {
    handleModalClose()
    return
  }

  const list = [...searchData.value]
  // index 0 is the "Add New ..." placeholder tile, so only match on a real id
  const index = submitted.id ? list.findIndex((item: any) => item.id === submitted.id) : -1

  if (index >= 0) {
    list[index] = { ...list[index], ...submitted } // edit: same position, updated data
  } else {
    list.push(submitted) // add (or an edit of an item outside the current page): at the end
  }

  searchData.value = list
  handleModalClose()
}

const deleteModalOpen = ref(false)
const itemToDelete = ref<any | null>(null)

const deleteMessage = computed(() =>
  `${Messages.deleteConfirmation} ${itemToDelete.value?.name}?`
)

const handleDeleteItem = (item_id: string): Promise<any> => {
  switch (selectedObjectType.value) {
    case 'Recipes':
      console.log(`Deleting recipe with ID: ${item_id}`)
      return recipeService.delete(item_id)
    case 'Meals':
      console.log(`Deleting meal with ID: ${item_id}`)
      return mealService.delete(item_id)
    case 'Foods':
      console.log(`Deleting food with ID: ${item_id}`)
      return foodService.delete(item_id)
    case 'Units':
      console.log(`Deleting unit with ID: ${item_id}`)
      return unitService.delete(item_id)
    default:
      console.warn('No delete action defined for selected type:', selectedObjectType.value)
      return Promise.resolve()
  }
}

const handleStartDeletingItem = (item: any) => {
  if (item == null || !item.id) return // ignore the "Add New ..." placeholder tile
  itemToDelete.value = item
  deleteModalOpen.value = true
}

const handleDeleteModalClose = () => {
  deleteModalOpen.value = false
  itemToDelete.value = null
}

const handleDeleteConfirm = async () => {
  const item = itemToDelete.value
  if (item == null) return

  const previousList = searchData.value
  searchData.value = previousList.filter((i: any) => i.id !== item.id) // remove right away
  handleDeleteModalClose()

  try {
    await handleDeleteItem(item.id)
  } catch (error) {
    console.error('Failed to delete item:', error)
    searchData.value = previousList // roll back so the list matches the server again
  }
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
      :onMagnetPress="handleStartDeletingItem"
    />
    <ExpandedModal
      :label="'Close'"
      :is-open="modalOpen"
      @open="handleModalOpen"
      @close="handleModalClose"
      :external-controlled="true"
    >
      <component v-if="selectedItem != null" :is="formVersion" :onSubmit="handleFormSubmit" :data="selectedItem"/>
    </ExpandedModal>
    <Modal
      :isOpen="deleteModalOpen"
      @close="handleDeleteModalClose"
    >
      <div class="delete-modal-content">
        <Text :content="deleteMessage" type="title" variant="paper-prim" />
        <div class="delete-modal-actions">
          <Button label="Yes" buttonType="warning" :onPress="handleDeleteConfirm" />
          <Button label="No" buttonType="sec" :onPress="handleDeleteModalClose" />
        </div>
      </div>
    </Modal>
  </TabContainer>
</template>

<style scoped>
.scroll-container {
  overflow-x: auto;
  height: 100%;
}

.delete-modal-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
  height: 100%;
  width: 100%;
  text-align: center;
}

.delete-modal-actions {
  display: flex;
  flex-direction: row;
  gap: var(--spacing-md);
  width: 100%;
  max-width: 320px;
}
</style>