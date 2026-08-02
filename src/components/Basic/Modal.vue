<script setup lang="ts">
import { watch } from 'vue'

const props = withDefaults(defineProps<{
  isOpen: boolean
}>(), {
  isOpen: false,
})

const emit = defineEmits<{
  (e: 'open'): void
  (e: 'close'): void
}>()

watch(() => props.isOpen, (val) => {
  if (val) {
    emit('open')
  } else {
    emit('close')
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click.self="emit('close')">
        <div class="modal-content">
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Overlay fade animation */
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--transition-medium) ease-out;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: var(--modal-shadow);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: var(--spacing-xxl);
}

/* Content scale animation */
.modal-content {
  background-color: var(--primary);
  width: 100%;
  height: 100%;
  border-width: var(--border-size-md);
  border-radius: var(--border-radius-xl);
  border-color: var(--paper-line);
  padding: var(--spacing-md);
  overflow-y: auto;
  box-sizing: border-box;
  transform: scale(1);
  transition: transform var(--transition-medium) ease-out;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0);
}
</style>
