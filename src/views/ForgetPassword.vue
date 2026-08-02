<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Form from '@/components/Forms/Form.vue'
import Button from '@/components/Basic/Input/Button.vue'
import Input from '@/components/Basic/Input/Input.vue'
import Text from '@/components/Basic/Text.vue'
import { startPasswordReset, type StartPasswordReset } from '@/models/User'

const router = useRouter()
const email = ref('')
const isLoading = ref(false)

const handleReset = async () => {
  const request: StartPasswordReset = {
    email: email.value,
  }
  await startPasswordReset(request)
  router.push('/resetPassword')
}
</script>

<template>
  <div class="container">
    <Form>
      <Text content="Reset Password" variant="prim-prim" type="title" />

      <Text
        content="Enter your email. If you are registered, we will send you a message with a token to reset your password."
        variant="prim-prim"
        type="caption"
      />

      <Input
        :value="email"
        placeholder="Email"
        :onChangeText="(v: string) => email = v"
        inputType="text"
        :disabled="isLoading"
        variant="paper"
      />

      <Button
        :label="isLoading ? 'Sending request...' : 'Reset password'"
        :onPress="handleReset"
      />
    </Form>

    <div class="signup-container">
      <Text content="Do you remember your password?" variant="prim-sec" type="body" />
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