<script setup lang="ts">
import { Messages } from '@/constants/Messages.ts';
import Text from './Text.vue'

withDefaults(defineProps<{
  message?: string
  size?: 'small' | 'medium' | 'large'
}>(), {
  message: Messages.loadingMessage,
  size: 'large',
})
</script>

<template>
  <div class="centered-container">
    <div class="center-content">
      <div class="spinner" :class="`spinner-${size}`" />
      <Text :content="message" variant="prim-prim" type="body" />
    </div>
  </div>
</template>

<style scoped>
.centered-container {
  flex: 1;
  display: flex;
}

.center-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-md);
  padding: 0 var(--spacing-md);
}

.spinner {
  border: 4px solid var(--primary);
  border-top: 4px solid var(--text-prim-prim);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner-small {
  width: var(--loading-size-small);
  height: var(--loading-size-small);
  border-width: 3px;
}

.spinner-medium {
  width: var(--loading-size-medium);
  height: var(--loading-size-medium);
}

.spinner-large {
  width: var(--loading-size-large);
  height: var(--loading-size-large);
  border-width: 6px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>