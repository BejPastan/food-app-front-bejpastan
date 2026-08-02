<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Form from '@/components/Forms/Form.vue'
import Button from '@/components/Basic/Input/Button.vue'
import Input from '@/components/Basic/Input/Input.vue'
import Text from '@/components/Basic/Text.vue'
import ClickableText from '@/components/Basic/Input/ClickableText.vue'
import ErrorMessage from '@/components/Basic/ErrorMessage.vue'
import { login, type LoginRequest } from '@/models/User'
import { isErrorResponse } from '@/models/UtilityModels'

const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  error.value = ''
  isLoading.value = true

  try {
    const loginInput: LoginRequest = {
      email: email.value,
      password: password.value,
    }
    await login(loginInput)
    router.push('/dashboard')
  } catch (err) {
    console.log('Login error in component', err)//error from here
    error.value = isErrorResponse(err) ? err.message : 'Login failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="container">
    <Form>
      <Text content="Welcome Back" variant="prim-prim" type="title" />

      <Input
        :value="email"
        placeholder="Email"
        :onChangeText="(v: string) => email = v"
        inputType="text"
        :disabled="isLoading"
        variant="paper"
      />

      <Input
        :value="password"
        placeholder="Password"
        :onChangeText="(v: string) => password = v"
        inputType="hidden"
        :disabled="isLoading"
        variant="paper"
      />

      <ErrorMessage :message="error" :visible="!!error" />

      <ClickableText text="Don't remember password?" :onClick="() => router.push('/forgetPassword')" />

      <Button
        :label="isLoading ? 'Logging in...' : 'Login'"
        :onPress="handleLogin"
      />
    </Form>

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