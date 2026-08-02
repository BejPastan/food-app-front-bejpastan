// Recipe model
// Converted from C# model in test/Recipe.cs

import httpService, { type DeleteResponse } from '../services/http_service';
import type { CreateIngredient, Ingredient } from './Ingredient';
import type { Meal } from './Meal';
import type { CreateStep, Step } from './Step';
import type { Tag } from './Tag';

//#region  request models
export interface RecipeListParams {
  name?: string;
  page?: number;
  perPage?: number;
  mealNames?: string[];
  tags?: string[];
}

export interface RecipeChoicesParams {
  mealId?: string;
  userId?: string;
  excludeWeeks?: number;
}

export interface CreateRecipe {
  name: string;
  time: number;
  portion: number;
  ingredientIds?: string[];
  mealIds?: string[];
  tagIds?: string[];
  ingredients?: CreateIngredient[];
  steps?: CreateStep[];
  meals?: Meal[];
}

export interface UpdateRecipe {
  name?: string;
  time?: number;
  portion?: number;
  mealIds?: string[];
  tagIds?: string[];
  ingredients?: CreateIngredient[];
  steps?: Step[];
}
//#endregion
export interface Recipe extends RecipeSimplified{
  ingredients: Ingredient[];
  steps: Step[];
  meals: Meal[];
  tags: Tag[];
}

export interface RecipeSimplified {
  id: string;
  name: string;
  time: number;
  portion: number;
}

export const emptyRecipe: Recipe = {
  id: "",
  name: '',
  time: 0,
  portion: 1,
  ingredients: [],
  steps: [],
  meals: [],
  tags: [],
};

export const emptyRecipeSimplified: RecipeSimplified = {
  id: "",
  name: '',
  time: 0,
  portion: 1,
};

// Helper function for string representation (equivalent to ToString() in C#)
export const recipeToString = (recipe: Recipe): string => {
  const ingredientsStr = recipe.ingredients.map(ingredient => `    Ingredient { id = ${ingredient.id}, foodId = ${ingredient.foodId}, unitId = ${ingredient.unitId}, unitAmount = ${ingredient.unitAmount}, recipeId = ${ingredient.recipeId}, unit = ${ingredient.unit ? `${ingredient.unit.name} (id: ${ingredient.unit.id}, volumeEquivalent: ${ingredient.unit.volumeEquivalent})` : 'null'}, food = ${ingredient.food ? `Food: ${ingredient.food.name} (ID: ${ingredient.food.id}, TypeID: ${ingredient.food.foodTypeId})` : 'null'} }`).join('\n');
  const stepsStr = recipe.steps.map(step => `    id = ${step.id}, recipeId = ${step.recipeId}, instruction = ${step.instruction}, stepNumber = ${step.stepNumber}`).join('\n');
  const mealsStr = recipe.meals.map(meal => `    Meal: ${meal.name} (ID: ${meal.id})`).join('\n');
  return `id = ${recipe.id}, name = ${recipe.name}, ingredients = [\n${ingredientsStr}\n], steps = [\n${stepsStr}\n], meals = [\n${mealsStr}\n]`;
};

// Service methods
export const recipeService = {
  getAll: async (params: RecipeListParams): Promise<RecipeSimplified[]> => {
    const response = await httpService.get<RecipeSimplified[]>('/recipes', params);
    return response;
  },

  getById: async (id: string): Promise<Recipe> => {
    const response = await httpService.get<Recipe>(`/recipes/${id}`, {});
    return response;
  },

  create: async (data: CreateRecipe): Promise<Recipe> => {
    const response = await httpService.post<Recipe>('/recipes', data);
    return response;
  },

  update: async (id: string, data: UpdateRecipe): Promise<Recipe> => {
    console.log("Updating recipe with data:", data);
    const response = await httpService.patch<Recipe>(`/recipes/${id}`, data);
    return response;
  },

  delete: async (id: string): Promise<DeleteResponse> => {
    const response = await httpService.delete(`/recipes/${id}`);
    return response;
  },

  getChoices: async (params?: RecipeChoicesParams): Promise<Recipe[]> => {
    const response = await httpService.get<Recipe[]>('/recipes/choices', params || {});
    return response;
  }
};
