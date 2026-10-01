<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SearchableDropdown, { type DropdownItem } from '../Basic/Search/SearchableDropdown.vue'
import Text from '../Basic/Text.vue'
import { DebouncTime } from '@/constants/Search'
import { Messages } from '@/constants/Messages'
import {
  getCurrentKitchenSync,
  getKitchensSync,
  initKitchen,
  kitchenService,
  selectKitchen,
  type Kitchen,
} from '@/models/Kitchen'
import { getCurrentUserSync } from '@/models/User'

const props = withDefaults(defineProps<{
  onSelect?: (kitchen: Kitchen) => void
}>(), {})

const emit = defineEmits<{
  (e: 'select', kitchen: Kitchen): void
}>()

const items = ref<DropdownItem<Kitchen>[]>([])
const selectedKitchen = ref<DropdownItem<Kitchen> | undefined>(undefined)
const isSearching = ref(false)
const isLoading = ref(true)
const hasAnyKitchen = ref(true)
const errorMessage = ref('')
let latestRequest = 0

const toItem = (kitchen: Kitchen): DropdownItem<Kitchen> => ({ value: kitchen, label: kitchen.name })

const toItems = (kitchens: Kitchen[]): DropdownItem<Kitchen>[] => kitchens.map(toItem)

// The dropdown triggers a search with its current text on focus - that would only match the selected kitchen
const toSearchTerm = (query: string): string => {
  const normalized = query.trim()
  return normalized.toLowerCase() === (selectedKitchen.value?.label.trim().toLowerCase() ?? '') ? '' : normalized
}

// Searching happens on the server: GET /api/kitchen?name=<term>
const runSearch = async (query: string) => {
  const term = toSearchTerm(query)
  const requestId = ++latestRequest
  isSearching.value = true
  errorMessage.value = ''
  try {
    const kitchens = await kitchenService.getAll(term === '' ? {name: ''} : { name: term })
    if (requestId !== latestRequest) return
    items.value = toItems(kitchens)
    if (term === '') {
      hasAnyKitchen.value = kitchens.length > 0
    }
  } catch (error) {
    if (requestId !== latestRequest) return
    console.error('Failed to search kitchens:', error)
    errorMessage.value = error instanceof Error ? error.message : String(error)
  } finally {
    if (requestId === latestRequest) {
      isSearching.value = false
    }
  }
}

// Selecting a kitchen loads the membership record of the user and stores both in local storage
const handleSelect = async (item: DropdownItem<Kitchen>) => {
  const userId = getCurrentUserSync()?.id
  if (userId == null) {
    return
  }
  errorMessage.value = ''
  try {
    await selectKitchen(item.value, userId)
    selectedKitchen.value = item
    props.onSelect?.(item.value)
    emit('select', item.value)
  } catch (error) {
    console.error('Failed to select kitchen:', error)
    errorMessage.value = error instanceof Error ? error.message : String(error)
  }
}

onMounted(async () => {
  const userId = getCurrentUserSync()?.id
  if (userId == null) {
    isLoading.value = false
    return
  }
  try {
    // forces a full fetch of the kitchens of the user and restores the stored selection
    
    var current = getCurrentKitchenSync()

    if(current == null){
      await initKitchen(userId, true)
      const kitchens = getKitchensSync()
      items.value = toItems(kitchens)
      hasAnyKitchen.value = kitchens.length > 0
      current = getCurrentKitchenSync()
    }
    selectedKitchen.value = current != null ? toItem(current) : undefined
  } catch (error) {
    console.error('Failed to load kitchens:', error)
    errorMessage.value = error instanceof Error ? error.message : String(error)
  }
  isLoading.value = false
})
</script>

<template>
  <div class="kitchen-selector">
    <Text
      v-if="errorMessage !== ''"
      :content="`${Messages.errorMessage} ${errorMessage}`"
      type="caption"
      variant="warning"
    />
    <Text
      v-else-if="!isLoading && !hasAnyKitchen"
      :content="Messages.noKitchensMessage"
      type="caption"
      variant="sec-sec"
    />
    <SearchableDropdown
      v-else
      :placeholder="Messages.kitchenPlaceholder"
      :items="items"
      :onSearch="runSearch"
      :onSelect="handleSelect"
      :selectedValue="selectedKitchen"
      :isSearching="isSearching"
      :debounceTime="DebouncTime.short"
      :disabled="isLoading"
    />
  </div>
</template>

<style scoped>
.kitchen-selector {
  min-width: 0;
}
</style>
