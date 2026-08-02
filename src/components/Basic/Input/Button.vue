<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import Text from '../Text.vue'
import type { TextVariants } from '../Text.vue'

export type ButtonType = 'prim' | 'sec' | 'warning'

const props = withDefaults(defineProps<{
  leadingIcon?: string
  endIcon?: string
  label?: string
  onPress?: () => void
  onPressIn?: () => void
  onPressOut?: () => void
  size?: 'small' | 'default' | 'large'
  buttonType?: ButtonType
  toggle?: boolean
  startState?: boolean
  externalControll?: boolean
  disabled?: boolean
}>(), {
  size: 'default',
  buttonType: 'prim',
  toggle: false,
  startState: false,
  externalControll: false,
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:startState', v: boolean): void
}>()

const isPressed = ref(props.startState)

watch(() => props.startState, (val) => {
  if (props.externalControll) {
    isPressed.value = val
  }
})

const currentPressState = computed(() =>
  (isPressed.value && !props.externalControll) || (props.externalControll && props.startState)
)

const selectTextStyle = computed((): TextVariants => {
  if (props.toggle || props.externalControll) {
    switch (props.buttonType) {
      case 'prim': return currentPressState.value ? 'prim-prim' : 'sec-prim'
      case 'sec': return currentPressState.value ? 'sec-sec' : 'prim-sec'
      case 'warning': return 'warning'
      default: return currentPressState.value ? 'prim-prim' : 'sec-prim'
    }
  } else {
    switch (props.buttonType) {
      case 'prim': return 'prim-prim'
      case 'sec': return 'sec-sec'
      case 'warning': return 'warning'
      default: return 'prim-prim'
    }
  }
})

const textColorVar = computed(() => `var(--text-${selectTextStyle.value.replace('-', '-')})`)

const selectButtonStyle = computed((): ButtonType => {
  if (props.toggle || props.externalControll) {
    switch (props.buttonType) {
      case 'prim': return currentPressState.value ? 'prim' : 'sec'
      case 'sec': return currentPressState.value ? 'sec' : 'prim'
      case 'warning': return 'warning'
      default: return currentPressState.value ? 'prim' : 'sec'
    }
  } else {
    return props.buttonType
  }
})

const btnColor = computed(() => `var(--btn-${selectButtonStyle.value})`)
const shadowColor = computed(() => `var(--bxshd-btn-${selectButtonStyle.value})`)

const btnHeight = computed(() => {
  const heights = { small: 'var(--btn-height-small)', default: 'var(--btn-height-default)', large: 'var(--btn-height-large)' }
  return heights[props.size]
})

const shadowOffset = computed(() => {
  const offsets = { small: 'var(--btn-shadow-released-small)', default: 'var(--btn-shadow-released-default)', large: 'var(--btn-shadow-released-large)' }
  return offsets[props.size]
})

const pressedOffset = computed(() => {
  const offsets = { small: 'var(--btn-shadow-pressed-small)', default: 'var(--btn-shadow-pressed-default)', large: 'var(--btn-shadow-pressed-large)' }
  return offsets[props.size]
})

const translateY = computed(() => currentPressState.value ? pressedOffset.value : '0px')

const handlePressIn = () => {
  if (!props.externalControll) {
    isPressed.value = true
  } else {
    isPressed.value = props.startState
  }
  props.onPressIn?.()
}

const handlePressOut = () => {
  if (!props.externalControll) {
    isPressed.value = false
  } else {
    isPressed.value = props.startState
  }
  props.onPressOut?.()
}

const handlePress = () => {
  if (props.toggle) {
    if (isPressed.value) {
      handlePressOut()
    } else {
      handlePressIn()
    }
  }
  props.onPress?.()
}
</script>

<template>
  <button
    class="btn-container"
    :class="{ 'btn-disabled': disabled }"
    :disabled="disabled"
    @click="handlePress"
    @mousedown="!toggle && handlePressIn()"
    @mouseup="!toggle && handlePressOut()"
    @mouseleave="!toggle && isPressed && handlePressOut()"
  >
    <!-- Shadow base layer -->
    <span
      class="btn-base-layer"
      :style="{
        backgroundColor: shadowColor,
        top: shadowOffset,
      }"
    />

    <!-- Button face -->
    <span
      class="btn-face"
      :style="{
        backgroundColor: btnColor,
        transform: `translateY(${translateY})`,
        height: btnHeight,
      }"
    >
      <span class="btn-content">
        <Icon
          v-if="leadingIcon"
          :icon="`ion:${leadingIcon}`"
          width="24"
          height="24"
          :style="{ color: `var(--text-${selectTextStyle})` }"
        />
        <Text
          v-if="label !== ''"
          :content="label || ''"
          type="body"
          :variant="selectTextStyle"
          mode="typed"
        />
        <Icon
          v-if="endIcon"
          :icon="`ion:${endIcon}`"
          width="24"
          height="24"
          :style="{ color: `var(--text-${selectTextStyle})` }"
        />
      </span>
    </span>
  </button>
</template>

<style scoped>
.btn-container {
  position: relative;
  display: flex;
  flex: 1 1 auto;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  max-height: var(--btn-height-large);
  -webkit-tap-highlight-color: transparent;
  padding-inline: 0;
  width: 100%;
}

.btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-base-layer {
  position: absolute;
  left: 0;
  right: 0;
  border-radius: var(--border-radius-md);
  z-index: 0;
  height: 100%;
}

.btn-face {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  border-radius: var(--border-radius-md);
  width: 100%;
  transition: transform var(--transition-fast) ease;
}

.btn-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  height: 100%;
  padding: var(--spacing-sm);
  box-sizing: border-box;
}
</style>