<script setup lang="ts">
import { ref, watch } from 'vue'
import Text from '../Basic/Text.vue'

const props = withDefaults(defineProps<{
  label: string
  isOpen?: boolean
  externalControlled?: boolean
}>(), {
  isOpen: false,
  externalControlled: false,
})

const emit = defineEmits<{
  (e: 'open'): void
  (e: 'close'): void
}>()

const isExpanded = ref(false)

watch(() => props.isOpen, (val) => {
  if (props.externalControlled) {
    isExpanded.value = val
  }
})

const toggleModal = () => {
  isExpanded.value = !isExpanded.value
  if (!isExpanded.value) {
    emit('close')
  } else {
    emit('open')
  }
}
</script>

<template>
  <div
    class="modal"
    :class="{ expanded: isExpanded }"
  >
    <!-- Shadow overlay -->
    <div class="block-view"></div>

    <!-- Modal content -->
    <div class="modal-container">
      <div class="toggle-container">
        <button class="label-container" @click="toggleModal">
          <Text :content="label" />
        </button>
      </div>
      <div class="modal-content-container">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 1000;
  background-color: transparent;
  height: 100vh;
  width: 100vw;
  transform: translateY(100vh);
  transition: transform var(--transition-medium) ease-out;
}

.modal.expanded {
  transform: translateY(calc(100vh - var(--modal-size)));
}

/* Shadow overlay - fades in when expanded */
.block-view {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: -1;
  transform: translateY(0vh);
  background-color: rgba(0, 0, 0, 0);
  transition: translateY var(--transition-medium) ease-out, background-color var(--transition-medium) ease-out;
}

.modal.expanded .block-view {
  background-color: var(--modal-shadow);
  transform: translateY(calc(-100vh + var(--modal-size)));
  transition: translateY var(--transition-medium) ease-out, background-color var(--transition-medium) ease-out;
}

.modal-container {
  background-color: transparent;
  height: var(--modal-size);
  padding-bottom: var(--elements-nav);
  padding-left: var(--spacing-md);
  padding-right: var(--spacing-md);
}

.modal-content-container {
  background-color: var(--paper);
  width: 100%;
  min-height: 100%;
  height: calc(var(--modal-size) - var(--spacing-xl));
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
}

.toggle-container {
  align-items:end;
  background-color: transparent;
  width: 100%;
}

.label-container {
  height: var(--spacing-xl);
  background-color: var(--paper);
  padding: var(--spacing-sm);
  padding-top: var(--spacing-sm);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  align-self: flex-end;
  margin-left: auto;
}
</style>