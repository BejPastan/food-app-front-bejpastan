<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Form from './Form.vue'
import Button from '@/components/Basic/Input/Button.vue'
import Input from '@/components/Basic/Input/Input.vue'
import Text from '@/components/Basic/Text.vue'
import ErrorMessage from '@/components/Basic/ErrorMessage.vue'
import LoadingIndicator from '@/components/Basic/LoadingIndicator.vue'
import { recipeService, type CreateRecipe, type Recipe, type UpdateRecipe } from '@/models/Recipe'
import { mealService, type Meal } from '@/models/Meal'
import type { ValidationMessage } from '@/models/UtilityModels'
import type { GenericFormProp } from './GenericForm.ts'

interface RecipeFormProps extends GenericFormProp<Recipe>{}

const props = withDefaults(defineProps<RecipeFormProps>(), {
})

type fieldTypes = 'name' | 'time'

console.log('RecipeForm props:', props.data)

const recipeId = ref(props.data.id || "")
const currentRecipe = ref<Recipe>(props.data)
const isLoading = ref(false)
const isSaving = ref(false)
const errorMessage = ref('')
const validationMessages = ref<ValidationMessage<fieldTypes>[]>([])

// Meal search
const meals = ref<Meal[]>([])
const isMealsLoading = ref(false)

async function fetchRecipe() {
  console.log('Fetching recipe with ID:', recipeId.value)
  if (isLoading.value) return
  isLoading.value = true
  const recipeIdNum = recipeId.value
  if (recipeIdNum != "" && recipeIdNum != null) {
    const recipe = await recipeService.getById(recipeIdNum)
    currentRecipe.value = recipe
  } else {
    currentRecipe.value = {
      id: "",
      name: '',
      time: 0,
      portion: 1,
      ingredients: [],
      steps: [],
      meals: [],
      tags: [],
    }
  }
  isLoading.value = false
}

async function searchMeals(query: string) {
  if (isMealsLoading.value) return
  isMealsLoading.value = true
  try {
    const response = await mealService.getAll({
      name: query,
      page: 1,
      perPage: 10,
    })
    meals.value = response
  } catch (error) {
    console.error('Failed to search meals:', error)
  }
  isMealsLoading.value = false
}

onMounted(() => {
  console.log('Mounted RecipeForm with props:', props.data)
  fetchRecipe()
  searchMeals('')
})

watch(() => props.data.id, (newData) => {
  console.log('Props data changed:', newData)
  recipeId.value = newData
  fetchRecipe()
}, { deep: true, immediate: true })

const onValueChange = (key: 'name' | 'time', value: any) => {
  currentRecipe.value = { ...currentRecipe.value, [key]: value }
}

// Meal selection
const toggleMeal = (meal: Meal) => {
  currentRecipe.value = {
    ...currentRecipe.value,
    meals: currentRecipe.value.meals.some(m => m.id === meal.id)
      ? currentRecipe.value.meals.filter(m => m.id !== meal.id)
      : [...currentRecipe.value.meals, meal],
  }
}

// Validation
function validateRecipe(): boolean {
  const errors: ValidationMessage<fieldTypes>[] = []
  if (!currentRecipe.value.name || currentRecipe.value.name.trim() === '') {
    errors.push({ key: 'name', message: 'Recipe name is required' })
  }
  if (!currentRecipe.value.time || currentRecipe.value.time <= 0) {
    errors.push({ key: 'time', message: 'Cooking time is required and must be greater than 0' })
  }
  validationMessages.value = errors
  return errors.length === 0
}

const handleSave = async () => {
  if (isSaving.value) return
  isSaving.value = true
  errorMessage.value = ''

  try {
    if (!validateRecipe()) {
      errorMessage.value = 'Please fill in all required fields'
      return
    }

    if (currentRecipe.value.id != "" && currentRecipe.value.id != null) {
      const recipeUpdateData: UpdateRecipe = {
        name: currentRecipe.value.name,
        time: currentRecipe.value.time,
        portion: currentRecipe.value.portion,
        mealIds: currentRecipe.value.meals.map(m => m.id).filter(id => id != "" && id != null),
      }
      await recipeService.update(currentRecipe.value.id, recipeUpdateData)
    } else {
      const recipeCreateData: CreateRecipe = {
        name: currentRecipe.value.name,
        time: currentRecipe.value.time,
        portion: currentRecipe.value.portion,
        mealIds: currentRecipe.value.meals.map(m => m.id).filter(id => id != "" && id != null),
      }
      await recipeService.create(recipeCreateData)
    }
    props.onSubmit?.(currentRecipe.value)
  } catch (error) {
    errorMessage.value = 'Failed to save recipe'
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
        <Text :type="'title'" :variant="'prim-prim'" :content="'Recipe'" />

        <div class="input-container">
          <Text :type="'body'" :content="'Recipe Name'" />
          <Input
            :value="currentRecipe.name"
            placeholder="Recipe name"
            :onChangeText="(v: string) => onValueChange('name', v)"
            variant="paper"
          />
          <Text v-if="getValidationMessage('name')" type="caption" variant="warning" :content="getValidationMessage('name') || ''" />
        </div>

        <div class="input-container">
          <Text type="body" content="Prepare time (minutes)" />
          <Input
            :value="currentRecipe.time?.toString() || ''"
            placeholder="Time"
            :onChangeText="(v: string) => onValueChange('time', parseInt(v) || 0)"
            inputType="number"
            variant="paper"
          />
          <Text v-if="getValidationMessage('time')" type="caption" variant="warning" :content="getValidationMessage('time') || ''" />
        </div>
      </div>

      <div class="section-container">
        <Text type="subtitle" variant="prim-prim" content="Associated Meals" />
        <div class="meals-container">
          <Button
            v-for="meal in meals"
            :key="`meal-${meal.id}`"
            :label="meal.name"
            :onPress="() => toggleMeal(meal)"
            size="small"
            buttonType="prim"
            toggle
            :startState="currentRecipe.meals.some(m => m.id === meal.id)"
            externalControll
          />
        </div>
        <Text v-if="meals.length === 0" type="caption" variant="sec-sec" content="No meals available." />
      </div>

      <div class="button-container">
        <Button
          :label="isSaving ? 'Saving...' : 'Save Recipe'"
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

.meals-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.button-container {
  margin-top: var(--spacing-lg);
  padding-bottom: var(--spacing-xl);
}
</style>