<script setup lang="ts">
import { computed } from 'vue'
import Text from './Text.vue'
import { Messages } from '@/constants/Messages'

const props = withDefaults(defineProps<{
  message: string
  visible: boolean
}>(), {
  visible: false,
})

const displayMessage = computed(() => `${Messages.errorMessage} ${props.message}`)
</script>

<template>
  <div v-if="visible" class="error-container">
    <Text :content="displayMessage" variant="warning" type="caption" />
  </div>
</template>

<style scoped>
.error-container {
  background-color: var(--warn);
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  margin-bottom: var(--spacing-sm);
  border: 1px solid var(--brdr-warn);
}
</style>