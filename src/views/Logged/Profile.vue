<script setup lang="ts">
import TabContainer from '@/components/TabContainer.vue';
import Switch from '@/components/Basic/Input/Switch.vue';
import { useTheme } from '@/utilities/useTheme';
import Button from '@/components/Basic/Input/Button.vue';
import { useRouter } from 'vue-router';
import { logout } from '@/models/User';

const { isDark, toggleTheme } = useTheme();


const router = useRouter()

const handleLogout = () => {
  logout()
  router.push('/')
}
</script>

<template>
  <TabContainer>
    <div class="theme-toggle">
      <label class="theme-label">Dark Mode</label>
      <Switch :value="isDark" :on-value-change="toggleTheme" />
    </div>
    <Button label="Logout" @click="handleLogout" />
  </TabContainer>
</template>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
}

.theme-label {
  font-family: var(--font-family-typed-regular);
  font-size: var(--font-size-typed-body);
  color: var(--text-prim-prim);
  cursor: pointer;
}
</style>
