<script setup lang="ts">
export interface FormContentProps {
  onSubmit?: () => void
  onCancel?: () => void
}

export type FormContent = new () => { $props: Record<string, any> }
</script>

<template>
  <div class="form-container">
    <slot />
  </div>
</template>

<style>
.form-container {
  width: 100%;
  max-width: var(--form-container-max-width);
  background-color: var(--paper);
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--form-element-gap);
}
</style>