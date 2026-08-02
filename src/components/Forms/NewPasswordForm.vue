<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from '@/components/Basic/Input/Button.vue'
import Input from '@/components/Basic/Input/Input.vue'
import Text from '@/components/Basic/Text.vue'
import ErrorMessage from '@/components/Basic/ErrorMessage.vue'
import { confirmPasswordReset } from '@/models/User'

const props = withDefaults(defineProps<{
  tokenRequired?: boolean
}>(), {
  tokenRequired: false,
})

const router = useRouter()
const password = ref('')
const confirmPassword = ref('')
const token = ref('')
const errors = ref('')
const success = ref(false)

const validateForm = (): boolean => {
  if (props.tokenRequired && !token.value) {
    errors.value = 'Token is required'
    return false
  }
  if (!password.value) {
    errors.value = 'Password is required'
    return false
  }
  if (!confirmPassword.value) {
    errors.value = 'Please confirm password'
    return false
  } else if (password.value !== confirmPassword.value) {
    errors.value = 'Passwords do not match'
    return false
  }
  return true
}

const handleSubmit = async () => {
  if (validateForm()) {
    await confirmPasswordReset({
      token: token.value,
      newPassword: password.value,
    })
    errors.value = ''
    success.value = true
  }
}
</script>

<template>
  <div>
    <div v-if="tokenRequired" class="field">
      <Input
        :value="token"
        placeholder="Reset token"
        :onChangeText="(v: string) => token = v"
      />
    </div>

    <div class="field">
      <Input
        :value="password"
        placeholder="New password"
        :onChangeText="(v: string) => password = v"
        inputType="hidden"
        variant="paper"
      />
    </div>

    <div class="field">
      <Input
        :value="confirmPassword"
        placeholder="Confirm password"
        :onChangeText="(v: string) => confirmPassword = v"
        inputType="hidden"
        variant="paper"
      />
    </div>

    <div v-if="!success">
      <Button
        label="Set New Password"
        :onPress="handleSubmit"
        :disabled="!password || !confirmPassword || (tokenRequired && !token)"
      />
    </div>

    <div v-if="success" class="success-container">
      <Text content="Password reset successful!" variant="prim-prim" type="caption" />
      <Button
        label="Go to Login"
        :onPress="() => router.push('/')"
        buttonType="sec"
      />
    </div>

    <ErrorMessage :message="errors" :visible="!!errors" />
  </div>
</template>

<style scoped>
.field {
  margin-bottom: var(--spacing-md);
}

.success-container {
  margin-top: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  align-items: center;
}
</style>