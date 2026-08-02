<script setup lang="ts">
import Text from '../Basic/Text.vue'
import { getCurrentUserSync } from '@/models/User'

</script>

<template>
  <header class="header-container">
    <Text
      variant="sec-sec"
      type="title"
      :content="`Hello ${getCurrentUserSync()?.name || '-'}`"
    />
  </header>
</template>

<style scoped>
.header-container {
  height: var(--elements-header);
  display: flex;
  flex-direction: row;
  padding: var(--spacing-md);
  padding-top: calc(var(--spacing-md));
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  background-color: var(--secondary);
}
</style>