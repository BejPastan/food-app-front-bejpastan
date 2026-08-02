<script setup lang="ts" generic="T">
import Button from './Button.vue'

export interface ButtonSelectOption<T> {
  label: string
  value: T
}

const props = withDefaults(defineProps<{
  options: ButtonSelectOption<T>[]
  modelValue?: T
  direction?: 'horizontal' | 'vertical'
}>(), {
  direction: 'horizontal'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: T): void
  (e: 'select', option: T): void
}>()

const handlePress = (option: ButtonSelectOption<T>) => {
  emit('update:modelValue', option.value)
  emit('select', option.value)
}
</script>

<template>
  <div :class="(direction === 'horizontal' ? 'scroll-container-x' : 'scroll-container-y') + ' ' + 'scroll-container'">
      <div v-for="option in options" :key="option.label">
      <Button
        :label="option.label"
        :external-controll="true"
        :start-state="modelValue === option.value"
        :onPress="() => handlePress(option)"
      />
    </div>
  </div>
</template>

<style scoped>
.scroll-container{
  display: flex;
  scrollbar-width: none;
  gap: var(--spacing-sm);
}
.scroll-container-y {
  max-width: 100%;
  flex-direction: column;
  overflow-y: scroll;
  overflow-y: hidden;
}
.scroll-container-x {
  max-height: var(--btn-def);
  flex-direction: row;
  overflow-x: scroll;
  overflow-y: hidden;
}
</style>