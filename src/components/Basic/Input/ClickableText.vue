<script setup lang="ts">
import Text from '../Text.vue'

defineProps<{
  text: string
  onClick: () => void
}>()
</script>

<template>
  <button class="clickable-text" @click="onClick">
    <Text :content="text" type="caption" />
  </button>
</template>

<style scoped>
.clickable-text {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: inline;
}

.clickable-text:hover {
  opacity: 0.7;
}
</style>