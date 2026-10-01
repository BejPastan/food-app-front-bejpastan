<script setup lang="ts">
//#region Imports
import { computed, ref, onMounted, watch } from 'vue'
import Form from './Form.vue'
import Button from '@/components/Basic/Input/Button.vue'
import Input from '@/components/Basic/Input/Input.vue'
import Text from '@/components/Basic/Text.vue'
import ErrorMessage from '@/components/Basic/ErrorMessage.vue'
import LoadingIndicator from '@/components/Basic/LoadingIndicator.vue'
import { recipeService, type CreateRecipe, type Recipe, type UpdateRecipe } from '@/models/Recipe'
import { mealService, type Meal } from '@/models/Meal'
import SearchableDropdown, { type DropdownItem } from '@/components/Basic/Search/SearchableDropdown.vue'
import { foodService, type Food } from '@/models/Food'
import { unitService, type Unit } from '@/models/Unit'
import { ingredientService, mapIngredientToUpdate, type CreateIngredient, type Ingredient } from '@/models/Ingredient'
import { stepService, type CreateStep, type Step } from '@/models/Step'
import { DebouncTime } from '@/constants/Search'
import type { ValidationMessage } from '@/models/UtilityModels'
import type { GenericFormProp } from './GenericForm.ts'
//#endregion

//#region Props & local state

interface RecipeFormProps extends GenericFormProp<Recipe>{}

const props = withDefaults(defineProps<RecipeFormProps>(), {
})

type fieldTypes = 'name' | 'time' | 'ingredients' | 'steps'

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

const ingredientDrafts = ref<IngredientDraft[]>([])
const pendingIngredientDeletes = ref<PendingIngredientDelete[]>([])

let nextIngredientDraftKey = 0
const newIngredientDraftKey = () => `new-${++nextIngredientDraftKey}`

const stepDrafts = ref<StepDraft[]>([])
const pendingStepDeletes = ref<PendingStepDelete[]>([])

let nextStepDraftKey = 0
const newStepDraftKey = () => `new-step-${++nextStepDraftKey}`
//#endregion

//#region Ingredient draft model (types + factories)

// Ingredient changes stay local until Save: new rows travel with the recipe
// payload, persisted edits use PATCH /ingredients/:id and persisted removals
// use DELETE /ingredients/:id. The recipe payload only ever carries new rows:
// the backend treats nested ingredients as INSERT-only, so re-sending a
// persisted row would duplicate it.
interface IngredientValues {
  foodId: string
  unitId: string
  unitAmount: number
}

interface IngredientDraft extends IngredientValues {
  key: string
  ingredientId: string
  synced: IngredientValues | null
  hasBeenSentWithRecipe: boolean
  selectedFood?: DropdownItem<Food>
  selectedUnit?: DropdownItem<Unit>
  foodItems: DropdownItem<Food>[]
  unitItems: DropdownItem<Unit>[]
  isFoodsLoading: boolean
  isUnitsLoading: boolean
}

interface PendingIngredientDelete {
  ingredientId: string
  label: string
}

const snapshotIngredientValues = (values: IngredientValues): IngredientValues => ({
  foodId: values.foodId,
  unitId: values.unitId,
  unitAmount: values.unitAmount,
})

function createEmptyIngredientDraft(): IngredientDraft {
  return {
    key: newIngredientDraftKey(),
    ingredientId: '',
    foodId: '',
    unitId: '',
    unitAmount: 0,
    synced: null,
    hasBeenSentWithRecipe: false,
    selectedFood: undefined,
    selectedUnit: undefined,
    foodItems: [],
    unitItems: [],
    isFoodsLoading: false,
    isUnitsLoading: false,
  }
}

const seedIngredientDrafts = (ingredients: Ingredient[]): IngredientDraft[] => {
  // nextIngredientDraftKey can only grow; seeded drafts use their server ids
  // as stable keys, while locally added rows use new-<n> keys from the counter.
  return ingredients.map(ingredient => {
    const draft = createEmptyIngredientDraft()
    draft.key = ingredient.id !== '' ? `stored-${ingredient.id}` : newIngredientDraftKey()
    draft.ingredientId = ingredient.id
    draft.foodId = ingredient.foodId
    draft.unitId = ingredient.unitId
    draft.unitAmount = ingredient.unitAmount
    draft.synced = snapshotIngredientValues(ingredient)
    draft.hasBeenSentWithRecipe = false
    if (ingredient.food) {
      draft.selectedFood = { value: ingredient.food, label: ingredient.food.name }
      draft.foodItems = [draft.selectedFood]
    }
    if (ingredient.unit) {
      draft.selectedUnit = { value: ingredient.unit, label: ingredient.unit.name }
      draft.unitItems = [draft.selectedUnit]
    }
    return draft
  })
}

const describeIngredientDraft = (draft: IngredientDraft): string => {
  const foodName = draft.selectedFood?.label?.trim() || draft.foodId || 'ingredient'
  const unitName = draft.selectedUnit?.label?.trim()
  const amount = draft.unitAmount > 0 ? draft.unitAmount : null
  if (unitName && amount !== null) return `${foodName} - ${amount} ${unitName}`
  if (unitName) return `${foodName} - ${unitName}`
  return foodName
}
//#endregion

//#region Step draft model (types + factories)

// Steps work as PUT: the recipe payload carries the full ordered list of the
// visible rows, so persisted rows are overwritten in place. Deletions are the
// only exception: a removed persisted row is deleted separately through
// DELETE /steps/:id instead of being left out of the list.
interface StepDraft {
  key: string
  stepId: string
  instruction: string
}

interface PendingStepDelete {
  stepId: string
  label: string
}

function createEmptyStepDraft(): StepDraft {
  return {
    key: newStepDraftKey(),
    stepId: '',
    instruction: '',
  }
}

const seedStepDrafts = (steps: Step[]): StepDraft[] => {
  // stepNumber is positional, so sort by it and never store it in the draft.
  return [...steps]
    .sort((a, b) => a.stepNumber - b.stepNumber)
    .map(step => ({
      key: step.id !== '' ? `stored-step-${step.id}` : newStepDraftKey(),
      stepId: step.id,
      instruction: step.instruction,
    }))
}

const describeStepDraft = (draft: StepDraft, position: number): string => {
  const text = draft.instruction.trim()
  const short = text.length > 40 ? `${text.slice(0, 40)}...` : text
  return short !== '' ? `Step ${position}: ${short}` : `Step ${position}`
}

//#endregion

//#region Derived state
const pendingIngredientDeleteCount = computed(() => pendingIngredientDeletes.value.length)

const pendingIngredientDeleteSummary = computed(() =>
  pendingIngredientDeletes.value.map(item => item.label).join(', ')
)

const pendingStepDeleteCount = computed(() => pendingStepDeletes.value.length)

const pendingStepDeleteSummary = computed(() =>
  pendingStepDeletes.value.map(item => item.label).join(', ')
)
//#endregion

//#region Recipe & meal UI handlers
const onValueChange = (key: 'name' | 'time', value: any) => {
  currentRecipe.value = { ...currentRecipe.value, [key]: value }
}

const toggleMeal = (meal: Meal) => {
  currentRecipe.value = {
    ...currentRecipe.value,
    meals: currentRecipe.value.meals.some(m => m.id === meal.id)
      ? currentRecipe.value.meals.filter(m => m.id !== meal.id)
      : [...currentRecipe.value.meals, meal],
  }
}
//#endregion

//#region Ingredient UI handlers (local-only until Save)
const handleAddIngredient = () => {
  ingredientDrafts.value = [...ingredientDrafts.value, createEmptyIngredientDraft()]
}

const handleFoodSelect = (draft: IngredientDraft, item: DropdownItem) => {
  const food = item.value as Food
  draft.foodId = food.id
  draft.selectedFood = { value: food, label: item.label }
}

const handleUnitSelect = (draft: IngredientDraft, item: DropdownItem) => {
  const unit = item.value as Unit
  draft.unitId = unit.id
  draft.selectedUnit = { value: unit, label: item.label }
}

const handleIngredientAmountChange = (draft: IngredientDraft, value: string) => {
  draft.unitAmount = parseFloat(value) || 0
}

const handleRemoveIngredient = (index: number) => {
  const draft = ingredientDrafts.value[index]
  if (draft === undefined) return
  if (draft.ingredientId !== '' && !pendingIngredientDeletes.value.some(item => item.ingredientId === draft.ingredientId)) {
    pendingIngredientDeletes.value = [
      ...pendingIngredientDeletes.value,
      { ingredientId: draft.ingredientId, label: describeIngredientDraft(draft) },
    ]
  }
  ingredientDrafts.value = ingredientDrafts.value.filter((_, i) => i !== index)
}
//#endregion

//#region Step UI handlers (local-only until Save)
const handleAddStep = () => {
  stepDrafts.value = [...stepDrafts.value, createEmptyStepDraft()]
}

const handleStepInstructionChange = (draft: StepDraft, value: string) => {
  draft.instruction = value
}

const handleRemoveStep = (index: number) => {
  const draft = stepDrafts.value[index]
  if (draft === undefined) return
  if (draft.stepId !== '' && !pendingStepDeletes.value.some(item => item.stepId === draft.stepId)) {
    pendingStepDeletes.value = [
      ...pendingStepDeletes.value,
      { stepId: draft.stepId, label: describeStepDraft(draft, index + 1) },
    ]
  }
  stepDrafts.value = stepDrafts.value.filter((_, i) => i !== index)
}
//#endregion

//#region Ingredient draft predicates & payloads
// (and only once per draft, so a later Save or retry cannot duplicate them).
// Persisted rows are sent through the ingredient endpoints only when they are
// edited or removed.
const isUnsentNewIngredientDraft = (draft: IngredientDraft) =>
  draft.synced === null && !draft.hasBeenSentWithRecipe

// Drafts seeded from the stored recipe keep their id; only freshly added ones
// are sent with the recipe payload. Persisted rows are sent through the
// ingredient endpoints only when they are edited or removed.
const isStoredIngredientDraft = (draft: IngredientDraft): boolean =>
  draft.synced !== null && draft.ingredientId !== ''

const isIngredientDraftEdited = (draft: IngredientDraft): boolean => {
  if (draft.synced === null) return false
  return (
    draft.foodId !== draft.synced.foodId ||
    draft.unitId !== draft.synced.unitId ||
    draft.unitAmount !== draft.synced.unitAmount
  )
}

const hasIncompleteIngredientValues = (draft: IngredientDraft): boolean =>
  draft.foodId === '' || draft.unitId === '' || !(draft.unitAmount > 0)

const isIngredientDraftIncomplete = (draft: IngredientDraft) =>
  hasIncompleteIngredientValues(draft)

const getNewIngredientsPayload = (): CreateIngredient[] =>
  ingredientDrafts.value
    .filter(isUnsentNewIngredientDraft)
    .map(draft => ({ foodId: draft.foodId, unitId: draft.unitId, unitAmount: draft.unitAmount }))

const isStepDraftIncomplete = (draft: StepDraft): boolean =>
  draft.instruction.trim() === ''

// stepNumber always follows the visible position, so no renumbering is needed
// when rows are added or removed in the middle of the list.
const getStepPayload = (recipeId: string): Step[] =>
  stepDrafts.value.map((draft, index) => ({
    id: draft.stepId,
    recipeId,
    instruction: draft.instruction,
    stepNumber: index + 1,
  }))

const getNewStepsPayload = (): CreateStep[] =>
  stepDrafts.value.map((draft, index) => ({
    instruction: draft.instruction,
    stepNumber: index + 1,
  }))
//#endregion

//#region Data fetching
async function fetchRecipe() {
  console.log('Fetching recipe with ID:', recipeId.value)
  if (isLoading.value) return
  isLoading.value = true
  try {
    const recipeIdNum = recipeId.value
    if (recipeIdNum != "" && recipeIdNum != null) {
      const recipe = await recipeService.getById(recipeIdNum)
      currentRecipe.value = recipe
      ingredientDrafts.value = seedIngredientDrafts(Array.isArray(recipe.ingredients) ? recipe.ingredients : [])
      pendingIngredientDeletes.value = []
      stepDrafts.value = seedStepDrafts(Array.isArray(recipe.steps) ? recipe.steps : [])
      pendingStepDeletes.value = []
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
      ingredientDrafts.value = []
      pendingIngredientDeletes.value = []
      stepDrafts.value = []
      pendingStepDeletes.value = []
    }
  } catch (error) {
    console.error('Failed to load recipe:', error)
    errorMessage.value = 'Failed to load recipe'
    ingredientDrafts.value = []
    pendingIngredientDeletes.value = []
    stepDrafts.value = []
    pendingStepDeletes.value = []
  } finally {
    isLoading.value = false
  }
}

async function searchFoodsFor(draft: IngredientDraft, query: string) {
  if (draft.isFoodsLoading) return
  draft.isFoodsLoading = true
  try {
    const response = await foodService.getAll({ name: query, page: 1, perPage: 10 })
    draft.foodItems = response.map(f => ({ value: f, label: f.name }))
  } catch (error) {
    console.error('Failed to search foods:', error)
  }
  draft.isFoodsLoading = false
}

async function searchUnitsFor(draft: IngredientDraft, query: string) {
  if (draft.isUnitsLoading) return
  draft.isUnitsLoading = true
  try {
    const response = await unitService.getAll({ search: query, page: 1, perPage: 10 })
    draft.unitItems = response.map(u => ({ value: u, label: u.name }))
  } catch (error) {
    console.error('Failed to search units:', error)
  }
  draft.isUnitsLoading = false
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
    meals.value.sort((a, b) => a.order - b.order)
  } catch (error) {
    console.error('Failed to search meals:', error)
  }
  isMealsLoading.value = false
}
//#endregion

//#region Validation
function validateRecipe(): boolean {
  const errors: ValidationMessage<fieldTypes>[] = []
  if (!currentRecipe.value.name || currentRecipe.value.name.trim() === '') {
    errors.push({ key: 'name', message: 'Recipe name is required' })
  }
  if (!currentRecipe.value.time || currentRecipe.value.time <= 0) {
    errors.push({ key: 'time', message: 'Cooking time is required and must be greater than 0' })
  }
  if (ingredientDrafts.value.some(isIngredientDraftIncomplete)) {
    errors.push({ key: 'ingredients', message: 'Each added ingredient needs a food, a unit and an amount' })
  }
  if (stepDrafts.value.some(isStepDraftIncomplete)) {
    errors.push({ key: 'steps', message: 'Each step needs an instruction' })
  }
  validationMessages.value = errors
  return errors.length === 0
}

function getValidationMessage(key: fieldTypes): string | null {
  const vm = validationMessages.value.find(v => v.key === key)
  if (vm == null || vm == undefined) {
    return null
  } else {
    return vm.message
  }
}
//#endregion

//#region Save & sync (sending data)
const hydrateIngredientDraftsFromRecipe = (recipe: Recipe) => {
  const storedIngredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : []
  const claimedIds = new Set(
    ingredientDrafts.value
      .map(draft => draft.ingredientId)
      .filter(id => id !== '')
  )

  ingredientDrafts.value = ingredientDrafts.value.map(draft => {
    if (draft.synced !== null || draft.ingredientId !== '') return draft

    draft.hasBeenSentWithRecipe = true
    const match = storedIngredients.find(ingredient =>
      !claimedIds.has(ingredient.id) &&
      ingredient.foodId === draft.foodId &&
      ingredient.unitId === draft.unitId &&
      ingredient.unitAmount === draft.unitAmount
    )

    if (match !== undefined) {
      claimedIds.add(match.id)
      draft.ingredientId = match.id
      if (match.id !== '') draft.key = `stored-${match.id}`
      draft.synced = snapshotIngredientValues(match)
    }
    return draft
  })
}

const syncPendingIngredientDeletes = async (): Promise<string[]> => {
  const failures: string[] = []
  for (const pendingDelete of pendingIngredientDeletes.value) {
    try {
      await ingredientService.delete(pendingDelete.ingredientId)
      pendingIngredientDeletes.value = pendingIngredientDeletes.value.filter(
        item => item.ingredientId !== pendingDelete.ingredientId
      )
    } catch (error) {
      console.error(`Failed to delete ingredient ${pendingDelete.ingredientId}:`, error)
      failures.push(pendingDelete.label)
    }
  }
  return failures
}

const syncEditedIngredientDrafts = async (): Promise<string[]> => {
  const failures: string[] = []
  for (const draft of ingredientDrafts.value) {
    if (!isStoredIngredientDraft(draft) || !isIngredientDraftEdited(draft)) continue
    try {
      await ingredientService.update(draft.ingredientId, mapIngredientToUpdate(draft))
      draft.synced = snapshotIngredientValues(draft)
    } catch (error) {
      console.error(`Failed to update ingredient ${draft.ingredientId}:`, error)
      failures.push(describeIngredientDraft(draft))
    }
  }
  return failures
}

const hydrateStepDraftsFromRecipe = (recipe: Recipe) => {
  const storedSteps = Array.isArray(recipe.steps) ? recipe.steps : []
  const claimedIds = new Set(
    stepDrafts.value
      .map(draft => draft.stepId)
      .filter(id => id !== '')
  )

  // Persisted rows keep their ids through the PUT, so claim them first and
  // assign leftover response rows positionally to the new drafts.
  stepDrafts.value = stepDrafts.value.map((draft, index) => {
    if (draft.stepId !== '') {
      claimedIds.add(draft.stepId)
      return draft
    }
    const match = storedSteps.find(step =>
      !claimedIds.has(step.id) && step.stepNumber === index + 1
    ) ?? storedSteps.find(step => !claimedIds.has(step.id))
    if (match !== undefined) {
      claimedIds.add(match.id)
      draft.stepId = match.id
      if (match.id !== '') draft.key = `stored-step-${match.id}`
    }
    return draft
  })
}

const syncPendingStepDeletes = async (): Promise<string[]> => {
  const failures: string[] = []
  for (const pendingDelete of pendingStepDeletes.value) {
    try {
      await stepService.delete(pendingDelete.stepId)
      pendingStepDeletes.value = pendingStepDeletes.value.filter(
        item => item.stepId !== pendingDelete.stepId
      )
    } catch (error) {
      console.error(`Failed to delete step ${pendingDelete.stepId}:`, error)
      failures.push(pendingDelete.label)
    }
  }
  return failures
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

    // Step deletions run before the recipe payload, because the PUT carries
    // the final list: anything removed must already be deleted separately.
    // A failed step DELETE aborts the whole save, so the PUT cannot silently
    // recreate or renumber rows whose deletion did not go through.
    const failedStepDeletes = await syncPendingStepDeletes()
    if (failedStepDeletes.length > 0) {
      errorMessage.value = `Could not delete steps: ${failedStepDeletes.join(', ')}. They are still pending - please try Save again.`
      console.error('Step delete failures:', { failedStepDeletes })
      return
    }

    const newIngredients = getNewIngredientsPayload()
    const isExistingRecipe = currentRecipe.value.id != "" && currentRecipe.value.id != null

    if (isExistingRecipe) {
      const recipeUpdateData: UpdateRecipe = {
        name: currentRecipe.value.name,
        time: currentRecipe.value.time,
        portion: currentRecipe.value.portion,
        mealIds: currentRecipe.value.meals.map(m => m.id).filter(id => id != "" && id != null),
        steps: getStepPayload(currentRecipe.value.id),
      }
      // New ingredient rows are INSERT-only, so this payload carries only rows
      // that were never persisted. Omitting the key when there is nothing new
      // keeps the stored ingredients untouched.
      if (newIngredients.length > 0) recipeUpdateData.ingredients = newIngredients
      const updatedRecipe = await recipeService.update(currentRecipe.value.id, recipeUpdateData)
      hydrateIngredientDraftsFromRecipe(updatedRecipe)
      hydrateStepDraftsFromRecipe(updatedRecipe)
    } else {
      const recipeCreateData: CreateRecipe = {
        name: currentRecipe.value.name,
        time: currentRecipe.value.time,
        portion: currentRecipe.value.portion,
        mealIds: currentRecipe.value.meals.map(m => m.id).filter(id => id != "" && id != null),
      }
      if (newIngredients.length > 0) recipeCreateData.ingredients = newIngredients
      if (stepDrafts.value.length > 0) recipeCreateData.steps = getNewStepsPayload()
      const createdRecipe = await recipeService.create(recipeCreateData)
      currentRecipe.value = { ...currentRecipe.value, id: createdRecipe.id }
      hydrateIngredientDraftsFromRecipe(createdRecipe)
      hydrateStepDraftsFromRecipe(createdRecipe)
    }

    // Recipe metadata (and any newly added rows) are now safely stored, so the
    // queued ingredient operations can run. Each success is committed locally,
    // so a retry only re-sends the operations that are still pending.
    const failedDeletes = await syncPendingIngredientDeletes()
    const failedUpdates = await syncEditedIngredientDrafts()

    if (failedDeletes.length > 0 || failedUpdates.length > 0) {
      const failedParts: string[] = []
      if (failedDeletes.length > 0) failedParts.push(`could not delete: ${failedDeletes.join(', ')}`)
      if (failedUpdates.length > 0) failedParts.push(`could not update: ${failedUpdates.join(', ')}`)
      errorMessage.value = `Recipe was saved, but some ingredient changes failed (${failedParts.join('; ')}). They are still pending - please try Save again.`
      console.error('Ingredient sync failures:', { failedDeletes, failedUpdates })
      return
    }

    props.onSubmit?.(currentRecipe.value)
  } catch (error) {
    errorMessage.value = 'Failed to save recipe'
    console.error('Save error:', error)
  } finally {
    isSaving.value = false
  }
}
//#endregion

//#region Lifecycle
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
//#endregion
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

      <div class="section-container">
        <Text type="subtitle" variant="prim-prim" content="Ingredients" />
        <div class="ingredients-container">
          <div v-for="(draft, index) in ingredientDrafts" :key="draft.key" class="ingredient-card" :class="{ 'ingredient-card-incomplete': isIngredientDraftIncomplete(draft), 'ingredient-card-edited': isIngredientDraftEdited(draft) }">
            <div class="ingredient-row">
              <div class="ingredient-food">
                <SearchableDropdown
                  placeholder="Search food"
                  :items="draft.foodItems"
                  :onSearch="(query) => searchFoodsFor(draft, query)"
                  :onSelect="(item) => handleFoodSelect(draft, item)"
                  :selectedValue="draft.selectedFood"
                  :debounceTime="DebouncTime.short"
                  :isSearching="draft.isFoodsLoading"
                  :disabled="isSaving"
                  inputStyle="paper"
                />
              </div>
              <div class="ingredient-unit">
                <SearchableDropdown
                  placeholder="Search unit"
                  :items="draft.unitItems"
                  :onSearch="(query) => searchUnitsFor(draft, query)"
                  :onSelect="(item) => handleUnitSelect(draft, item)"
                  :selectedValue="draft.selectedUnit"
                  :debounceTime="DebouncTime.short"
                  :isSearching="draft.isUnitsLoading"
                  :disabled="isSaving"
                  inputStyle="paper"
                />
                <div class="ingredient-amount">
                  <Input
                    :value="draft.unitAmount ? draft.unitAmount.toString() : ''"
                    placeholder="Amount"
                    :onChangeText="(v: string) => handleIngredientAmountChange(draft, v)"
                    inputType="number"
                    :disabled="isSaving"
                    variant="paper"
                  />
                </div>
              </div>
            </div>
            <div class="ingredient-card-actions">
              <div class="ingredient-remove">
                <Button
                  label=""
                  leading-icon="close"
                  size="small"
                  buttonType="warning"
                  :onPress="() => handleRemoveIngredient(index)"
                  :disabled="isSaving"
                />
              </div>
            </div>
          </div>
          <Text v-if="pendingIngredientDeleteCount > 0" type="caption" variant="sec-sec" :content="`${pendingIngredientDeleteCount} ingredient${pendingIngredientDeleteCount === 1 ? '' : 's'} will be removed on save: ${pendingIngredientDeleteSummary}`" />
          <Text v-if="ingredientDrafts.length === 0 && pendingIngredientDeleteCount === 0" type="caption" variant="sec-sec" content="No ingredients yet." />
          <Text v-if="getValidationMessage('ingredients')" type="caption" variant="warning" :content="getValidationMessage('ingredients') || ''" />
        </div>
        <div class="ingredient-add-container">
          <Button
            label="Add Ingredient"
            :onPress="handleAddIngredient"
            size="small"
            buttonType="sec"
            :disabled="isSaving"
          />
        </div>
      </div>

      <div class="section-container">
        <Text type="subtitle" variant="prim-prim" content="Steps" />
        <div class="steps-container">
          <div v-for="(draft, index) in stepDrafts" :key="draft.key" class="step-card" :class="{ 'ingredient-card-incomplete': isStepDraftIncomplete(draft) }">
            <Text type="body" :content="`Step ${index + 1}`" />
            <Input
              :value="draft.instruction"
              :placeholder="`Describe step ${index + 1}`"
              :onChangeText="(v: string) => handleStepInstructionChange(draft, v)"
              multiline
              :disabled="isSaving"
              variant="paper"
            />
            <div class="ingredient-card-actions">
              <div class="ingredient-remove">
                <Button
                  label=""
                  leading-icon="close"
                  size="small"
                  buttonType="warning"
                  :onPress="() => handleRemoveStep(index)"
                  :disabled="isSaving"
                />
              </div>
            </div>
          </div>
          <Text v-if="pendingStepDeleteCount > 0" type="caption" variant="sec-sec" :content="`${pendingStepDeleteCount} step${pendingStepDeleteCount === 1 ? '' : 's'} will be removed on save: ${pendingStepDeleteSummary}`" />
          <Text v-if="stepDrafts.length === 0 && pendingStepDeleteCount === 0" type="caption" variant="sec-sec" content="No steps yet." />
          <Text v-if="getValidationMessage('steps')" type="caption" variant="warning" :content="getValidationMessage('steps') || ''" />
        </div>
        <div class="ingredient-add-container">
          <Button
            label="Add Step"
            :onPress="handleAddStep"
            size="small"
            buttonType="sec"
            :disabled="isSaving"
          />
        </div>
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
.ingredients-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.ingredient-card {
  border: var(--border-size-sm) solid var(--paper-line);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  background: transparent;
}

/* desktop: food and unit share a line, wraps to stacked when there is not enough room */
.ingredient-row {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.ingredient-food {
  flex: 1 1 140px;
  min-width: 0;
}

/* unit dropdown and its amount field always share a line */
.ingredient-unit {
  flex: 1 1 170px;
  min-width: 0;
  display: flex;
  flex-direction: row;
  gap: var(--spacing-sm);
  align-items: flex-start;
}

.ingredient-amount {
  flex: 0 0 64px;
}

.ingredient-add-container {
  margin-top: var(--spacing-sm);
  padding-bottom: var(--spacing-sm);
}

.ingredient-card-incomplete {
  border-color: var(--brdr-warn);
  background-color: var(--warn);
}

/* locally edited (but not yet saved) persisted row */
.ingredient-card-edited {
  border-style: dashed;
}

.ingredient-card-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--spacing-xs);
}

.ingredient-remove {
  width: 36px;
}

.steps-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.step-card {
  border: var(--border-size-sm) solid var(--paper-line);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  background: transparent;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.step-card :deep(textarea) {
  min-height: 72px;
}
</style>