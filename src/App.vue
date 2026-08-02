<script setup lang="ts">
import { onMounted } from 'vue'
import { useTheme } from '@/utilities/useTheme'
import { RouterView } from 'vue-router';

const { initTheme } = useTheme()
onMounted(() => initTheme())
</script>

<template>

  <!-- The active route component renders here -->
<div id="app">
    <!-- If this tag is missing, Vue Router renders nothing! -->
    <RouterView /> 
  </div>
</template>
