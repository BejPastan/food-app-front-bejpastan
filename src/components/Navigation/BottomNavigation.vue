<script setup lang="ts">
import NavigationItem from './NavigationItem.vue'
import { userNavs } from '@/constants/Routes'

const navigationItems = userNavs
</script>

<template>
  <nav class="nav-container">
    <NavigationItem
      v-for="(item, index) in navigationItems"
      :key="index"
      :icon="item.icon"
      :route="item.route"
    />
  </nav>
</template>

<style scoped>
.nav-container {
  display: flex;
  flex-direction: row;
  height: var(--elements-nav);
  background-color: var(--secondary);
  padding: 0 var(--spacing-md);
}
</style>