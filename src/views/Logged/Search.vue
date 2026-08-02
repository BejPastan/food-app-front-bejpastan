<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import ButtonSelect from '@/components/Basic/Input/ButtonSelect.vue'
import SearchableList from '@/components/Basic/Search/SearchableList.vue'
import TabContainer from '@/components/TabContainer.vue'
import RecipeTile from '@/components/Tiles/RecipeTile.vue'
import MealTile from '@/components/Tiles/MealTile.vue'
import { DebouncTime } from '@/constants/Search'
import { SearchingItems } from '@/services/search_service'

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

const handleSearch = (query:string) =>
{
  searchQuery.value = query
  isSearching.value = true
  SearchingItems(query, selectedObjectType.value).then((response) => {
    searchData.value = response
    isSearching.value = false
  }).catch((error) => {
    console.error('Error fetching search results:', error)
    isSearching.value = false
  })
}

const handleTilePress = (item: any) => {
  console.log('Tile pressed:', item)
}
</script>

<template>
  <TabContainer>
    <ButtonSelect
      :options="objectsTypesToOptions"
      :modelValue="selectedObjectType"
      @update:model-value="handleSelect"
    />
    <div class ="searchable-list-container">
      <SearchableList
        :data="searchData"
        :listItem="currentTileComponent"
        :onSearch="handleSearch"
        :debounceTime="DebouncTime.short"
        :isSearching="isSearching"
        :onTilePress="handleTilePress"
      />
    </div>
  </TabContainer>
</template>

<style scoped>
.searchable-list-container {
  overflow-x: auto;
  height: 100%;
}
</style>