<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import Input, { type InputVariant } from '../Input/Input.vue'

export interface DropdownItem<T = any> {
  value: T
  label: string
}

const props = withDefaults(defineProps<{
  placeholder: string
  items: DropdownItem[]
  onSearch: (query: string) => void
  onSelect: (item: DropdownItem) => void
  onConfirm?: (value: string) => void
  selectedValue?: DropdownItem
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
})

const emit = defineEmits<{
  (e: 'update:selectedValue', v: DropdownItem | undefined): void
}>()

const isFocused = ref(false)
const searchQuery = ref('')
const displayValue = ref(props.selectedValue?.label || '')
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const dropdownRef = ref<HTMLElement | null>(null)

watch(() => props.selectedValue, (val) => {
  if (!isFocused.value) {
    displayValue.value = val?.label || ''
  }
})

// Click outside handler
const handleClickOutside = (e: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    handleBlur()
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  if (debounceTimer) clearTimeout(debounceTimer)
})

const handleSearch = (query: string) => {
  searchQuery.value = query
  displayValue.value = query

  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    props.onSearch(query)
  }, props.debounceTime)
}

const handleSelect = (item: DropdownItem) => {
  props.onSelect(item)
  displayValue.value = item.label
  searchQuery.value = ''
  handleBlur()
}

const handleFocus = () => {
  if (!props.disabled) {
    isFocused.value = true
    props.onSearch(displayValue.value)
    props.onFocus?.()
  }
}

const handleBlur = () => {
  if (isFocused.value) {
    if (searchQuery.value === '') {
      displayValue.value = props.selectedValue?.label || ''
    }
    isFocused.value = false
    props.onBlur?.()
  }
}

const handleConfirm = (value: string) => {
  props.onConfirm?.(value)
  isFocused.value = false
  props.onBlur?.()
}
</script>

<template>
  <div ref="dropdownRef" class="dropdown-container">
    <Input
      :value="displayValue"
      :placeholder="placeholder"
      :onChangeText="handleSearch"
      :disabled="disabled"
      :variant="inputStyle"
      :onFocus="handleFocus"
    />

    <!-- Dropdown overlay -->
    <Teleport to="body">
      <div v-if="isFocused" class="modal-overlay" @mousedown="handleBlur">
        <div class="modal-card" @mousedown.stop>
          <Input
            :value="displayValue"
            :placeholder="placeholder"
            :onChangeText="handleSearch"
            :disabled="disabled"
            :onConfirm="onConfirm ? handleConfirm : undefined"
            :variant="inputStyle"
            :onFocus="handleFocus"
          />
          <div class="dropdown-content">
            <div class="items-scroll">
              <div v-if="isSearching" class="message-text">Searching...</div>
              <div v-else-if="items.length === 0" class="message-text">Results not found</div>
              <button
                v-for="(item, index) in items"
                :key="index"
                class="dropdown-item"
                @click="handleSelect(item)"
                :aria-label="`Select ${item.label}`"
              >
                {{ item.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.dropdown-container {
  position: relative;
  z-index: 10;
  background: transparent;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: flex-start;
  padding-top: 150px;
  background-color: var(--modal-shadow);
  z-index: 1000;
}

.modal-card {
  background-color: var(--secondary);
  border-radius: var(--border-radius-md);
  margin: 0 var(--spacing-md);
  padding: var(--spacing-sm);
  width: calc(100% - var(--spacing-md) * 2);
  max-width: 400px;
  box-shadow: var(--modal-shadow) 0 4px 8px;
}

.dropdown-content {
  background-color: var(--secondary);
  border: 1px solid var(--input-brdr);
  border-radius: var(--border-radius-sm);
  margin-top: var(--spacing-xs);
  max-height: 200px;
  overflow: hidden;
}

.items-scroll {
  max-height: 200px;
  overflow-y: auto;
  background: transparent;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  border-bottom: 1px solid var(--input-brdr);
  background: transparent;
  color: var(--text-sec-prim);
  font-family: var(--font-family-typed-regular);
  font-size: var(--font-size-typed-body);
  text-align: left;
  cursor: pointer;
  min-height: 40px;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  opacity: 0.8;
}

.message-text {
  padding: var(--spacing-sm) var(--spacing-lg);
  text-align: center;
  color: var(--text-sec-prim);
  font-family: var(--font-family-typed-regular);
  font-size: var(--font-size-typed-body);
}
</style>