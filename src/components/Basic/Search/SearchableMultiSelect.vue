<script setup lang="ts" generic="T">
import { ref } from 'vue'
import Button from '../Input/Button.vue'
import SearchableDropdown, { type DropdownItem } from './SearchableDropdown.vue'
import type { InputVariant } from '../Input/Input.vue'

const props = withDefaults(defineProps<{
  placeholder: string
  items: DropdownItem<T>[]
  onSearch: (query: string) => void
  selectedItems: DropdownItem<T>[]
  onSelectionChange: (items: DropdownItem<T>[]) => void
  onConfirm?: (value: string) => void
  debounceTime?: number
  isSearching?: boolean
  disabled?: boolean
  inputStyle?: InputVariant
  onFocus?: () => void
  onBlur?: () => void
}>(), {
  debounceTime: 300,
  isSearching: false,
  disabled: false,
  inputStyle: 'normal',
  onFocus: () => {},
  onBlur: () => {},
})

const isFocused = ref(false)

const handleSelect = (item: DropdownItem<T>) => {
  const isAlreadySelected = props.selectedItems.some(
    (selected) => selected.value === item.value
  )
  if (!isAlreadySelected) {
    props.onSelectionChange([...props.selectedItems, item])
  }
}

const handleRemove = (index: number) => {
  const newSelection = [...props.selectedItems]
  newSelection.splice(index, 1)
  props.onSelectionChange(newSelection)
}

const handleFocus = () => {
  if (!props.disabled) {
    isFocused.value = true
    props.onFocus?.()
  }
}

const handleBlur = () => {
  if (isFocused.value) {
    props.onBlur?.()
    isFocused.value = false
  }
}
</script>

<template>
  <div class="multiselect-container">
    <!-- Selected Items -->
    <div v-if="selectedItems.length > 0" class="selected-container">
      <div class="selected-row">
        <div
          v-for="(item, index) in selectedItems"
          :key="index"
          class="selected-button-wrapper"
        >
          <Button
            :label="item.label"
            size="small"
            :toggle="true"
            :startState="true"
            :onPress="() => handleRemove(index)"
          />
        </div>
      </div>
    </div>

    <!-- Searchable Dropdown -->
    <SearchableDropdown
      :placeholder="placeholder"
      :items="items"
      :onSearch="onSearch"
      :onSelect="handleSelect"
      :onConfirm="onConfirm"
      :debounceTime="debounceTime"
      :isSearching="isSearching"
      :disabled="disabled"
      :inputStyle="inputStyle"
      :onFocus="handleFocus"
      :onBlur="handleBlur"
    />
  </div>
</template>

<style scoped>
.multiselect-container {
  width: 100%;
}

.selected-container {
  height: calc(var(--btn-height-small) + var(--spacing-sm));
  margin-bottom: var(--spacing-sm);
  overflow: hidden;
}

.selected-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  overflow-x: auto;
  padding: 0 var(--spacing-xs);
  gap: var(--spacing-xs);
}

.selected-button-wrapper {
  flex-shrink: 0;
}
</style>