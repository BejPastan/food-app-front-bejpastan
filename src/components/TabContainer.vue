<script setup lang="ts">
import Header from './PageComponents/Header.vue'
import BottomNavigation from './Navigation/BottomNavigation.vue'
</script>

<template>
  <div class="tab-container">
    <Header />
    <div class="content-container">
      <slot />
    </div>
    <BottomNavigation />
  </div>
</template>

<style scoped>
.tab-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background-color: var(--primary);
  overflow: hidden;
}

.content-container {
  flex: 1;
  padding: var(--spacing-sm);
  padding-top: var(--spacing-sm);
  padding-bottom: var(--spacing-xl);
  overflow-y: auto;
  scrollbar-width: none;
}
</style>