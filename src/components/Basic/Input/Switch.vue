<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  value: boolean
  onValueChange?: (v: boolean) => void
  size?: 'small' | 'default' | 'large'
  disabled?: boolean
}>(), {
  value: false,
  size: 'default',
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:value', v: boolean): void
}>()

const btnHeight = computed(() => {
  const heights = { small: 'var(--btn-height-small)', default: 'var(--btn-height-default)', large: 'var(--btn-height-large)' }
  return heights[props.size]
})

const paddingV = computed(() => {
  const pads = { small: 'var(--btn-padding-vertical-small)', default: 'var(--btn-padding-vertical-default)', large: 'var(--btn-padding-vertical-large)' }
  return pads[props.size]
})

const trackHeight = computed(() => `calc(${paddingV.value} * 2 + 8px)`)
const thumbSize = computed(() => `calc(${trackHeight.value} - 6px)`)
const trackWidth = computed(() => `calc(${thumbSize.value} * 2 + 18px)`)

const thumbTranslate = computed(() => props.value ? `calc(${trackWidth.value} - ${thumbSize.value} - 6px)` : '3px')

const trackBg = computed(() => props.value ? 'var(--btn-prim)' : 'var(--btn-disabled)')

const handlePress = () => {
  if (props.disabled) return
  emit('update:value', !props.value)
  props.onValueChange?.(!props.value)
}
</script>

<template>
  <button
    class="switch"
    :class="{ 'switch-disabled': disabled }"
    :disabled="disabled"
    role="switch"
    :aria-checked="value"
    @click="handlePress"
  >
    <span
      class="track"
      :style="{ width: trackWidth, height: trackHeight, backgroundColor: trackBg }"
    >
      <span
        class="thumb"
        :style="{ width: thumbSize, height: thumbSize, transform: `translateX(${thumbTranslate})` }"
      />
    </span>
  </button>
</template>

<style scoped>
.switch {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}

.switch-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.track {
  display: flex;
  align-items: center;
  border-radius: 999px;
  transition: background-color var(--transition-medium);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.thumb {
  border-radius: 50%;
  background-color: var(--text-prim-prim);
  transition: transform var(--transition-medium);
  margin: 3px;
}
</style>