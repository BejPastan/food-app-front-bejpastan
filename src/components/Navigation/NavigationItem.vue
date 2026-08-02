<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import type { ValidRoute } from '@/constants/Routes'

const props = defineProps<{
  icon: string
  route: ValidRoute
}>()

const router = useRouter()
const route = useRoute()

const isActive = computed(() => route.path === props.route)

const bgColor = computed(() => isActive.value ? 'var(--primary)' : 'var(--secondary)')
const iconColor = computed(() => isActive.value ? 'var(--text-prim-prim)' : 'var(--text-sec-prim)')

const handlePress = () => {
  router.push(props.route)
}
</script>

<template>
  <button class="nav-item-border" @click="handlePress">
    <div class="nav-item" :style="{ backgroundColor: bgColor }">
      <Icon :icon="`ion:${icon}`" width="24" height="24" :style="{ color: iconColor }" />
    </div>
  </button>
</template>

<style scoped>
.nav-item-border {
  flex: 1;
  width: 100%;
  height: 100%;
  border: none;
  padding: 0;
  background-color: var(--bxshd-btn-prim);
  cursor: pointer;
}

.nav-item {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}
</style>