<script setup lang="ts">
import { onMounted } from 'vue'
import { useTheme } from '@/utilities/useTheme'

const { initTheme } = useTheme()
onMounted(() => initTheme())
</script>

<template>

  <!-- The active route component renders here -->
  <main>
    <RouterView />
  </main>
</template>
