<script setup lang="ts">
import Text from '../Basic/Text.vue'
import KitchenSelector from './KitchenSelector.vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import { getCurrentUserSync } from '@/models/User'
import { ROUTES } from '@/constants/Routes'

const router = useRouter()

const handleManageKitchens = () => {
  router.push(ROUTES.KITCHENS)
}

</script>

<template>
  <header class="header-container">
    <Text
      variant="sec-sec"
      type="title"
      :content="`Hello ${getCurrentUserSync()?.name || '-'}`"
    />
    <div class="kitchen-container">
      <KitchenSelector />
      <button class="icon-btn" aria-label="Manage kitchens" @click="handleManageKitchens">
        <Icon icon="ion:settings-outline" width="24" height="24" :style="{ color: 'var(--text-sec-prim)' }" />
      </button>
    </div>
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

.kitchen-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--spacing-sm);
  min-width: 0;
  max-width: 60%;
}

.icon-btn {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  padding: var(--spacing-xs);
  cursor: pointer;
  flex-shrink: 0;
}
</style>