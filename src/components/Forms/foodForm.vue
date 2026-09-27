<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Form from './Form.vue'
import Button from '@/components/Basic/Input/Button.vue'
import Input from '@/components/Basic/Input/Input.vue'
import Text from '@/components/Basic/Text.vue'
import ErrorMessage from '@/components/Basic/ErrorMessage.vue'
import LoadingIndicator from '@/components/Basic/LoadingIndicator.vue'
import SearchableDropdown, { type DropdownItem } from '@/components/Basic/Search/SearchableDropdown.vue'
import { foodService, type CreateFood, type Food, type UpdateFood } from '@/models/Food'
import { foodTypeService, type FoodType } from '@/models/FoodType'
import { DebouncTime } from '@/constants/Search'
import type { ValidationMessage } from '@/models/UtilityModels'
import type { GenericFormProp } from './GenericForm.ts'

interface FoodFormProps extends GenericFormProp<Food>{}

const props = withDefaults(defineProps<FoodFormProps>(), {
  data: () => ({ id: "", name: '', foodTypeId: '', foodType: { id: '', name: '' } })
})

type fieldTypes = 'name' | 'foodType'

const foodId = ref(props.data.id || "")
const currentFood = ref<Food>(props.data)
const isLoading = ref(false)
const isSaving = ref(false)
const errorMessage = ref('')
const validationMessages = ref<ValidationMessage<fieldTypes>[]>([])

// Food type search
const foodTypeItems = ref<DropdownItem<FoodType>[]>([])
const isFoodTypesLoading = ref(false)
const isAddingFoodType = ref(false)
const selectedFoodType = ref<DropdownItem<FoodType> | undefined>(undefined)

async function fetchFood() {
  console.log('Fetching food with ID:', foodId.value)
  if (isLoading.value) return
  isLoading.value = true
  const foodIdValue = foodId.value
  if (foodIdValue != "" && foodIdValue != null) {
    const food = await foodService.getById(foodIdValue)
    currentFood.value = food
    selectedFoodType.value = food.foodType && food.foodType.name !== ''
      ? { value: food.foodType, label: food.foodType.name }
      : undefined
  } else {
    currentFood.value = { id: "", name: '', foodTypeId: '', foodType: { id: '', name: '' } }
    selectedFoodType.value = undefined
  }
  isLoading.value = false
}

async function searchFoodTypes(query: string) {
  if (isFoodTypesLoading.value) return
  isFoodTypesLoading.value = true
  try {
    const response = await foodTypeService.getAll({ name: query, page: 1, perPage: 10 })
    foodTypeItems.value = response.map(t => ({ value: t, label: t.name }))
  } catch (error) {
    console.error('Failed to search food types:', error)
  }
  isFoodTypesLoading.value = false
}

onMounted(() => {
  fetchFood()
  searchFoodTypes('')
})

watch(() => props.data, (newData) => {
  console.log('Props data changed:', newData)
  foodId.value = newData.id || ""
  fetchFood()
}, { deep: true })

const onValueChange = (key: 'name', value: any) => {
  currentFood.value = { ...currentFood.value, [key]: value }
}

// Food type selection
const handleFoodTypeSelect = (item: DropdownItem) => {
  const foodType = item.value as FoodType
  selectedFoodType.value = { value: foodType, label: item.label }
  currentFood.value = { ...currentFood.value, foodTypeId: foodType.id, foodType: foodType }
}

// The dropdown's confirm (checkmark) action creates a new food type from the typed text
const handleAddFoodType = async (name: string) => {
  const trimmedName = name.trim()
  if (trimmedName === '' || isAddingFoodType.value) return

  const existing = foodTypeItems.value.find(i => i.label.toLowerCase() === trimmedName.toLowerCase())
  if (existing) {
    handleFoodTypeSelect(existing) // reuse the existing type instead of creating a duplicate
    return
  }

  isAddingFoodType.value = true
  errorMessage.value = ''
  try {
    const created = await foodTypeService.create({ name: trimmedName }) // POST /food_type
    const item: DropdownItem<FoodType> = { value: created, label: created.name }
    foodTypeItems.value = [item, ...foodTypeItems.value]
    handleFoodTypeSelect(item) // select the new type straight away
  } catch (error) {
    console.error('Failed to add food type:', error)
    errorMessage.value = 'Failed to add food type'
  }
  isAddingFoodType.value = false
}

// Validation
function validateFood(): boolean {
  const errors: ValidationMessage<fieldTypes>[] = []
  if (!currentFood.value.name || currentFood.value.name.trim() === '') {
    errors.push({ key: 'name', message: 'Food name is required' })
  }
  if (!currentFood.value.foodTypeId || currentFood.value.foodTypeId === '') {
    errors.push({ key: 'foodType', message: 'Food type is required' })
  }
  validationMessages.value = errors
  return errors.length === 0
}

const handleSave = async () => {
  if (isSaving.value) return
  isSaving.value = true
  errorMessage.value = ''

  try {
    if (!validateFood()) {
      errorMessage.value = 'Please fill in all required fields'
      return
    }

    if (currentFood.value.id != "" && currentFood.value.id != null) {
      const foodUpdateData: UpdateFood = {
        name: currentFood.value.name,
        foodTypeId: currentFood.value.foodTypeId,
      }
      await foodService.update(currentFood.value.id, foodUpdateData)
    } else {
      const foodCreateData: CreateFood = {
        name: currentFood.value.name,
        foodTypeId: currentFood.value.foodTypeId,
      }
      await foodService.create(foodCreateData)
    }
    props.onSubmit?.(currentFood.value)
  } catch (error) {
    errorMessage.value = 'Failed to save food'
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
        <Text type="title" variant="prim-prim" content="Food" />

        <div class="input-container">
          <Text type="body" content="Food Name" />
          <Input
            :value="currentFood.name"
            placeholder="Food name"
            :onChangeText="(v: string) => onValueChange('name', v)"
            :disabled="isSaving"
            variant="paper"
          />
          <Text v-if="getValidationMessage('name')" type="caption" variant="warning" :content="getValidationMessage('name') || ''" />
        </div>

        <div class="input-container">
          <Text type="body" content="Food Type" />
          <SearchableDropdown
            placeholder="Search food type"
            :items="foodTypeItems"
            :onSearch="searchFoodTypes"
            :onSelect="handleFoodTypeSelect"
            :onConfirm="handleAddFoodType"
            :selectedValue="selectedFoodType"
            :debounceTime="DebouncTime.short"
            :isSearching="isFoodTypesLoading"
            :disabled="isSaving"
            inputStyle="paper"
          />
          <Text type="caption" variant="sec-sec" content="Type a new type name and press the checkmark to add it" />
          <Text v-if="getValidationMessage('foodType')" type="caption" variant="warning" :content="getValidationMessage('foodType') || ''" />
        </div>
      </div>

      <div class="button-container">
        <Button
          :label="isSaving ? 'Saving...' : 'Save Food'"
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