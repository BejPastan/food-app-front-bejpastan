<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Form from './Form.vue'
import Button from '@/components/Basic/Input/Button.vue'
import Input from '@/components/Basic/Input/Input.vue'
import Text from '@/components/Basic/Text.vue'
import ErrorMessage from '@/components/Basic/ErrorMessage.vue'
import LoadingIndicator from '@/components/Basic/LoadingIndicator.vue'
import { unitService, mapUnitToCreate, mapUnitToUpdate, type Unit } from '@/models/Unit'
import type { ValidationMessage } from '@/models/UtilityModels'
import type { GenericFormProp } from './GenericForm.ts'

interface UnitFormProps extends GenericFormProp<Unit>{}

const props = withDefaults(defineProps<UnitFormProps>(), {
  data: () => ({ id: "", name: '', volumeEquivalent: 0, desc: '' })
})

type fieldTypes = 'name' | 'volumeEquivalent'

const unitId = ref(props.data.id || "")
const currentUnit = ref<Unit>(props.data)
const isLoading = ref(false)
const isSaving = ref(false)
const errorMessage = ref('')
const validationMessages = ref<ValidationMessage<fieldTypes>[]>([])
// kept as text so an empty field stays distinguishable from a real 0
const volumeEquivalentInput = ref(props.data.volumeEquivalent != null ? String(props.data.volumeEquivalent) : '')

async function fetchUnit() {
  console.log('Fetching unit with ID:', unitId.value)
  if (isLoading.value) return
  isLoading.value = true
  const unitIdValue = unitId.value
  if (unitIdValue != "" && unitIdValue != null) {
    const unit = await unitService.getById(unitIdValue)
    currentUnit.value = unit
    volumeEquivalentInput.value = unit.volumeEquivalent != null ? String(unit.volumeEquivalent) : ''
  } else {
    currentUnit.value = { id: "", name: '', volumeEquivalent: 0, desc: '' }
    volumeEquivalentInput.value = ''
  }
  isLoading.value = false
}

onMounted(() => {
  fetchUnit()
})

watch(() => props.data, (newData) => {
  console.log('Props data changed:', newData)
  unitId.value = newData.id || ""
  fetchUnit()
}, { deep: true })

const onValueChange = (key: 'name' | 'desc', value: any) => {
  currentUnit.value = { ...currentUnit.value, [key]: value }
}

const handleVolumeChange = (value: string) => {
  volumeEquivalentInput.value = value
  currentUnit.value = { ...currentUnit.value, volumeEquivalent: parseFloat(value) || 0 }
}

// Validation
function validateUnit(): boolean {
  const errors: ValidationMessage<fieldTypes>[] = []
  if (!currentUnit.value.name || currentUnit.value.name.trim() === '') {
    errors.push({ key: 'name', message: 'Unit name is required' })
  }
  if (volumeEquivalentInput.value.trim() === '') {
    errors.push({ key: 'volumeEquivalent', message: 'Volume equivalent is required' })
  } else if (Number.isNaN(parseFloat(volumeEquivalentInput.value))) {
    errors.push({ key: 'volumeEquivalent', message: 'Volume equivalent must be a number' })
  }
  validationMessages.value = errors
  return errors.length === 0
}

const handleSave = async () => {
  if (isSaving.value) return
  isSaving.value = true
  errorMessage.value = ''

  try {
    if (!validateUnit()) {
      errorMessage.value = 'Please fill in all required fields'
      return
    }

    if (currentUnit.value.id != "" && currentUnit.value.id != null) {
      await unitService.update(currentUnit.value.id, mapUnitToUpdate(currentUnit.value))
    } else {
      const createdUnit = await unitService.create(mapUnitToCreate(currentUnit.value))
      currentUnit.value = { ...currentUnit.value, id: createdUnit.id }
    }
    props.onSubmit?.(currentUnit.value)
  } catch (error) {
    errorMessage.value = 'Failed to save unit'
    console.error('Save error:', error)
  } finally {
    isSaving.value = false
  }
}

function getValidationMessage(key: fieldTypes): string | null {
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
        <Text type="title" variant="prim-prim" content="Unit" />

        <div class="input-container">
          <Text type="body" content="Unit Name" />
          <Input
            :value="currentUnit.name"
            placeholder="Unit name"
            :onChangeText="(v: string) => onValueChange('name', v)"
            :disabled="isSaving"
            variant="paper"
          />
          <Text v-if="getValidationMessage('name')" type="caption" variant="warning" :content="getValidationMessage('name') || ''" />
        </div>

        <div class="input-container">
          <Text type="body" content="Volume equivalent (l)" />
          <Input
            :value="volumeEquivalentInput"
            placeholder="Volume equivalent"
            :onChangeText="handleVolumeChange"
            inputType="number"
            :disabled="isSaving"
            variant="paper"
          />
          <Text v-if="getValidationMessage('volumeEquivalent')" type="caption" variant="warning" :content="getValidationMessage('volumeEquivalent') || ''" />
        </div>

        <div class="input-container">
          <Text type="body" content="Description" />
          <Input
            :value="currentUnit.desc"
            placeholder="Description"
            :onChangeText="(v: string) => onValueChange('desc', v)"
            multiline
            :disabled="isSaving"
            variant="paper"
          />
        </div>
      </div>

      <div class="button-container">
        <Button
          :label="isSaving ? 'Saving...' : 'Save Unit'"
          :onPress="handleSave"
          :disabled="isSaving"
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

.input-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.button-container {
  margin-top: var(--spacing-lg);
  padding-bottom: var(--spacing-xl);
}
</style>