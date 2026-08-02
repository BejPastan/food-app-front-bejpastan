<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Form from '@/components/Forms/Form.vue'
import Button from '@/components/Basic/Input/Button.vue'
import Input from '@/components/Basic/Input/Input.vue'
import Text from '@/components/Basic/Text.vue'
import ErrorMessage from '@/components/Basic/ErrorMessage.vue'
import { signUp, type SignUpRequest } from '@/models/User'
import { isErrorResponse } from '@/models/UtilityModels'

const router = useRouter()
const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

const handleRegister = async () => {
  error.value = ''
  isLoading.value = true

  try {
    const signUpInput: SignUpRequest = {
      name: name.value,
      email: email.value,
      password: password.value,
    }
    await signUp(signUpInput)
    router.push('/registerConfirm')
  } catch (err) {
    error.value = isErrorResponse(err) ? err.message : 'Registration failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="container">
    <Form>
      <Text content="Create Account" variant="prim-prim" type="title" />

      <Input
        :value="name"
        placeholder="Name"
        :onChangeText="(v: string) => name = v"
        inputType="text"
        :disabled="isLoading"
        variant="paper"
      />

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

      <Button
        :label="isLoading ? 'Creating Account...' : 'Sign Up'"
        :onPress="handleRegister"
      />
    </Form>

    <div class="signup-container">
      <Text content="Already have an account? Log in" variant="prim-sec" type="body" />
      <Button
        label="Login"
        :onPress="() => router.push('/')"
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