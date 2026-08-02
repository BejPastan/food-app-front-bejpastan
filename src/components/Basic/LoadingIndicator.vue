<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  size?: 'small' | 'medium' | 'large'
}>(), {
  size: 'medium',
})

const dotSize = computed(() => {
  const sizes = { small: 'var(--loading-size-small)', medium: 'var(--loading-size-medium)', large: 'var(--loading-size-large)' }
  return sizes[props.size]
})

const bounceDistance = computed(() => {
  const distances = { small: 'var(--loading-size-small)', medium: 'var(--loading-size-medium)', large: 'var(--loading-size-large)' }
  return `calc(-1 * ${distances[props.size]})`
})

const spacing = computed(() => props.size === 'small' ? 'var(--spacing-xs)' : 'var(--spacing-sm)')
</script>

<template>
  <div class="loading-container">
    <div
      v-for="i in 3"
      :key="i"
      class="dot"
      :class="`dot-${i}`"
      :style="{
        width: dotSize,
        height: dotSize,
        marginLeft: i > 1 ? spacing : '0',
        '--dot-bounce-distance': bounceDistance,
      }"
    />
  </div>
</template>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-sm);
}

.dot {
  border-radius: 50%;
  background-color: var(--secondary);
  animation: bounce 1.2s ease-in-out infinite;
}

.dot-1 {
  animation-delay: 0s;
}

.dot-2 {
  animation-delay: 0.2s;
}

.dot-3 {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(var(--dot-bounce-distance));
  }
}
</style>