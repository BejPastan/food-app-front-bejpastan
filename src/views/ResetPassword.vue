<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Form from '@/components/Forms/Form.vue'
import Button from '@/components/Basic/Input/Button.vue'
import Text from '@/components/Basic/Text.vue'
import ErrorMessage from '@/components/Basic/ErrorMessage.vue'
import NewPasswordForm from '@/components/Forms/NewPasswordForm.vue'

const router = useRouter()
const error = ref('')
</script>

<template>
  <div class="container">
    <Form>
      <Text content="Set New Password" variant="prim-prim" type="title" />

      <ErrorMessage :message="error" :visible="!!error" />

      <NewPasswordForm :tokenRequired="true" />
    </Form>

    <div class="signup-container">
      <Text content="Remember your password?" variant="prim-sec" type="body" />
      <Button
        label="Login"
        :onPress="() => router.push('/')"
        size="small"
        buttonType="sec"
      />
    </div>

    <div class="signup-container">
      <Text content="Don't have an account?" variant="prim-sec" type="body" />
      <Button
        label="Sign Up"
        :onPress="() => router.push('/register')"
        size="small"
        buttonType="sec"
      />
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: var(--primary);
  padding: var(--spacing-lg);
  height: 100%;
  max-height: 100%;
}

.signup-container {
  margin-top: var(--spacing-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}
</style>