<script setup lang="ts" generic="T">
import { ref, watch } from 'vue'
import Input from '../Input/Input.vue'
import LoadingIndicator from '../LoadingIndicator.vue'
import type { GenericTile } from './GenericTile'
import { Messages } from '@/constants/Messages'

const props = withDefaults(defineProps<{
  data: T[]
  listItem: GenericTile<T>
  searchPlaceholder?: string
  onSearch: (search: string) => void
  debounceTime: number
  isSearching?: boolean
  onTilePress?: (item: T) => void
  onMagnetPress?: (item: T) => void
}>(), {
  searchPlaceholder: Messages.searchPlaceholder,
  isSearching: false,
})

const searchTerm = ref('')
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(searchTerm, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    props.onSearch(val)
  }, props.debounceTime)
})

const handleTextChange = (newText: string) => {
  searchTerm.value = newText
}
</script>

<template>
  <div class="list-container">
    <Input
      :value="searchTerm"
      :placeholder="searchPlaceholder"
      :onChangeText="handleTextChange"
    />

    <div v-if="isSearching" class="loading-container">
      <LoadingIndicator />
    </div>

    <div v-else class="scroll-container">
      <div class="items-container">
        <component
          :is="listItem"
          v-for="(item, index) in data"
          :key="index"
          :data="item"
          :onPress="() => onTilePress ? onTilePress(item) : undefined"
          :onMagnetPress="() => onMagnetPress ? onMagnetPress(item) : undefined"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-container {
  padding: var(--spacing-md) 0;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  background: transparent;
}

.scroll-container {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: transparent;
  scrollbar-width: none;
}

.items-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  background: transparent;
}

.loading-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  background: transparent;
}
</style>