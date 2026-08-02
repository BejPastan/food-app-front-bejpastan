<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Form from '@/components/Forms/Form.vue'
import Button from '@/components/Basic/Input/Button.vue'
import Input from '@/components/Basic/Input/Input.vue'
import Text from '@/components/Basic/Text.vue'
import ErrorMessage from '@/components/Basic/ErrorMessage.vue'
import { confirmSignUp, type ConfirmSignUpRequest } from '@/models/User'
import { isErrorResponse } from '@/models/UtilityModels'

const router = useRouter()
const code = ref('')
const error = ref('')
const isLoading = ref(false)

const handleConfirm = async () => {
  error.value = ''
  isLoading.value = true

  try {
    const signUpInput: ConfirmSignUpRequest = {
      token: code.value,
    }
    await confirmSignUp(signUpInput)
    router.push('/')
  } catch (err) {
    error.value = isErrorResponse(err) ? err.message : 'Confirmation failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="container">
    <Form>
      <Text content="Confirm Email" variant="prim-prim" type="title" />

      <Input
        :value="code"
        placeholder="Code"
        :onChangeText="(v: string) => code = v"
        inputType="text"
        :disabled="isLoading"
        variant="paper"
      />

      <ErrorMessage :message="error" :visible="!!error" />

      <Button
        :label="isLoading ? 'Confirming...' : 'Confirm Registration'"
        :onPress="handleConfirm"
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
  justify-content: center;
  align-items: center;
  background-color: var(--primary);
  padding: var(--spacing-lg);
  height: 100%;
  max-height: 100%;
  flex-direction: column;
}

.signup-container {
  margin-top: var(--spacing-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}
</style>