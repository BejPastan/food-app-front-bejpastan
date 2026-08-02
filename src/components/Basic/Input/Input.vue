<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'

export type InputTypes = 'text' | 'hidden' | 'number'
export type InputVariant = 'normal' | 'paper'

const props = withDefaults(defineProps<{
  value: string
  placeholder: string
  onChangeText?: (text: string) => void
  inputType?: InputTypes
  disabled?: boolean
  onConfirm?: (text: string) => void
  variant?: InputVariant
  onFocus?: () => void
  onBlur?: () => void
  multiline?: boolean
}>(), {
  inputType: 'text',
  disabled: false,
  variant: 'normal',
  multiline: false,
})

const emit = defineEmits<{
  (e: 'update:value', v: string): void
}>()

const showPassword = ref(false)
const isFocused = ref(false)
const inputRef = ref<HTMLInputElement | HTMLTextAreaElement | null>(null)

const isPassword = computed(() => props.inputType === 'hidden')
const inputMode = computed(() => props.inputType === 'number' ? 'decimal' : 'text')

const containerStyle = computed(() => ({
  backgroundColor: props.disabled
    ? (props.variant === 'paper' ? 'transparent' : 'var(--input-brdr-disbl)')
    : 'var(--input-brdr)',
  borderColor: props.variant === 'paper' ? 'var(--paper-line)' : 'transparent',
}))

const inputClass = computed(() => props.variant === 'paper' ? 'input-paper' : 'input-normal')

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  let text = target.value

  if (props.inputType === 'number') {
    const match = text.match(/^\d*\.?\d*/)
    text = match?.[0] || ''
    target.value = text
  }

  emit('update:value', text)
  props.onChangeText?.(text)
}

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const handleConfirm = () => {
  props.onConfirm?.(props.value)
}

const handleFocus = () => {
  if (!props.disabled) {
    isFocused.value = true
    props.onFocus?.()
  }
}

const handleBlur = () => {
  isFocused.value = false
  props.onBlur?.()
}
</script>

<template>
  <div
    class="input-container"
    :class="[variant === 'paper' ? 'container-paper' : 'container-normal']"
    :style="containerStyle"
  >
    <component
      :is="multiline ? 'textarea' : 'input'"
      :ref="(el: any) => inputRef = el"
      :class="['input-base', inputClass]"
      :value="value"
      :placeholder="placeholder"
      :disabled="disabled"
      :type="isPassword && !showPassword ? 'password' : 'text'"
      :inputmode="inputMode"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
    />

    <!-- Password toggle icon -->
    <div v-if="isPassword" class="icon-container">
      <button class="icon-btn" :disabled="disabled" @click="togglePassword" :aria-label="showPassword ? 'Hide password' : 'Show password'">
        <Icon :icon="showPassword ? 'ion:eye' : 'ion:eye-off'" width="24" height="24" :style="{ color: 'var(--text-prim-prim)' }" />
      </button>
    </div>

    <!-- Confirm icon -->
    <div v-if="onConfirm" class="icon-container">
      <button class="icon-btn" :disabled="disabled" @click="handleConfirm" aria-label="Confirm">
        <Icon icon="ion:checkmark" width="24" height="24" :style="{ color: 'var(--text-prim-prim)' }" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.container-normal {
  border-radius: var(--border-radius-md);
}

.container-paper {
  border-radius: 0;
}

.input-base {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: var(--text-prim-prim);
  font-family: var(--font-family-typed-regular);
  font-size: var(--font-size-typed-small);
  line-height: 1.4;
  resize: none;
}

.input-base::placeholder {
  color: var(--text-placeholder);
}

.input-base:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.input-normal {
  margin: var(--border-size-md);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: calc(var(--border-radius-md) / 2);
  background-color: var(--primary);
}

.input-paper {
  margin: 0;
  margin-bottom: var(--border-size-sm);
  padding: var(--spacing-sm);
  background-color: var(--paper);
  color: var(--text-paper-prim);
}

.icon-container {
  position: absolute;
  right: var(--spacing-sm);
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--spacing-sm);
}

.icon-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.icon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>