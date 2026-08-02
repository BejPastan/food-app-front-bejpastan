<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Form from './Form.vue'
import Button from '@/components/Basic/Input/Button.vue'
import Input from '@/components/Basic/Input/Input.vue'
import Text from '@/components/Basic/Text.vue'
import ErrorMessage from '@/components/Basic/ErrorMessage.vue'
import LoadingIndicator from '@/components/Basic/LoadingIndicator.vue'
import { mealService, type CreateMeal, type Meal, type UpdateMeal } from '@/models/Meal'
import type { ValidationMessage } from '@/models/UtilityModels'
import type { GenericFormProp } from './GenericForm.ts'

export interface MealFormProps extends GenericFormProp<Meal>{}

const props = withDefaults(defineProps<MealFormProps>(), {
  data: () => ({ id: "", name: '', order: 0 })
})

const mealId = ref(props.data.id || "")
const currentMeal = ref<Meal>(props.data)
const isLoading = ref(false)
const isSaving = ref(false)
const errorMessage = ref('')
const validationMessages = ref<ValidationMessage<'name'>[]>([])

async function fetchMeal() {
  console.log('Fetching meal with ID:', mealId.value)
  if (isLoading.value) return
  isLoading.value = true
  const mealIdNum = mealId.value
  if (mealIdNum != "" && mealIdNum != null) {
    const meal = await mealService.getById(mealIdNum)
    currentMeal.value = meal
  } else {
    currentMeal.value = { id: "", name: '', order: 0 } as Meal
  }
  isLoading.value = false
}

onMounted(() => {
  fetchMeal()
})

watch(() => props.data, (newData) => {
  console.log('Props data changed:', newData)
  mealId.value = newData.id || ""
  fetchMeal()
}, { deep: true })

const onValueChange = (key: 'name' | 'order', value: any) => {
  currentMeal.value = { ...currentMeal.value, [key]: value }
}

function validateUpdate(data: UpdateMeal): boolean {
  const errors: ValidationMessage<'name'>[] = []
  if (!data.name) {
    errors.push({ key: 'name', message: 'meal name is required' })
  }
  validationMessages.value = errors
  return errors.length === 0
}

function validateCreate(data: CreateMeal): boolean {
  const errors: ValidationMessage<'name'>[] = []
  if (!data.name) {
    errors.push({ key: 'name', message: 'meal name is required' })
  }
  validationMessages.value = errors
  return errors.length === 0
}

const handleSave = async () => {
  isSaving.value = true
  if (currentMeal.value.id != "" && currentMeal.value.id != null) {
    const mealUpdateData: UpdateMeal = { name: currentMeal.value.name, order: currentMeal.value.order }
    if (validateUpdate(mealUpdateData)) {
      await mealService.update(currentMeal.value.id, mealUpdateData)
      props.onSubmit?.(currentMeal.value)
    } else {
      errorMessage.value = 'Some required field are not filled'
    }
  } else {
    const mealCreateData: CreateMeal = { name: currentMeal.value.name, order: currentMeal.value.order }
    if (validateCreate(mealCreateData)) {
      await mealService.create(mealCreateData)
      props.onSubmit?.(currentMeal.value)
    } else {
      errorMessage.value = 'Some required field are not filled'
    }
  }
  isSaving.value = false
}

function getValidationMessage(key: 'name'): string | null {
  const vm = validationMessages.value.find(v => v.key === key)
  if (vm == null || vm == undefined) {
    return null
  } else {
    return vm.message
  }
}
</script>

<template>
  <div v-if="isLoading">
    <LoadingIndicator />
  </div>
  <div v-else>
    <Form>
      <div class="section-container">
        <Text type="title" variant="prim-prim" content="Meal" />
        <Text variant="prim-prim" content="Meal Information" />
        <Input
          :value="currentMeal.name"
          placeholder="name"
          :onChangeText="(v: string) => onValueChange('name', v)"
          :disabled="isSaving"
          variant="paper"
        />
        <Text v-if="getValidationMessage('name')" type="caption" variant="warning" :content="getValidationMessage('name') || ''" />
        <Input
          :inputType="'number'"
          :value="currentMeal.order.toString()"
          placeholder="meal order"
          :onChangeText="(v: string) => onValueChange('order', Number(v))"
          :disabled="isSaving"
          variant="paper"
        />
      </div>
      <div class="button-container">
        <Button
          :label="isSaving ? 'Saving...' : 'Save'"
          :onPress="handleSave"
        />
      </div>
    </Form>
    <ErrorMessage :message="errorMessage" :visible="errorMessage !== ''" />
  </div>
</template>

<style scoped>
.section-container {
  display: flex;
  flex-direction: column;
  gap: var(--form-element-gap);
}

.button-container {
  margin-top: var(--spacing-lg);
  padding-bottom: var(--spacing-xl);
}
</style>