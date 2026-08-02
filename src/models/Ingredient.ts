// Ingredient model
// Converted from C# model in test/Ingredient.cs

import { mapFoodToCreate, type Food } from './Food';
import { mapUnitToCreate, type Unit } from './Unit';
import httpService, { type DeleteResponse } from '../services/http_service';

// Request parameter types
export interface IngredientListParams {
  recipeId?: string;
  foodId?: string;
  page?: number;
  perPage?: number;
}

import type { CreateFood } from './Food';
import type { CreateUnit } from './Unit';

export interface CreateIngredient {
  foodId?: string;
  unitId?: string;
  unitAmount: number;
  recipeId?: string;
  food?: CreateFood;
  unit?: CreateUnit;
}

export interface UpdateIngredient {
  foodId?: string;
  unitId?: string;
  unitAmount?: number;
  recipeId?: string;
  food?: CreateFood;
  unit?: CreateUnit;
}

export interface ExternalIngredientUpdateRequest extends UpdateIngredient {
  id: string;
}

export interface Ingredient {
  id: string;
  foodId: string;
  unitId: string;
  unitAmount: number;
  recipeId: string;
  food?: Food | null;
  unit?: Unit | null;
}

//#region mapping functions
export function mapIngredientToCreate(ingredient: Ingredient): CreateIngredient {
  return {
    foodId: ingredient.foodId,
    unitId: ingredient.unitId,
    unitAmount: ingredient.unitAmount,
    recipeId: ingredient.recipeId,
    food: ingredient.food ? mapFoodToCreate(ingredient.food) : undefined,
    unit: ingredient.unit ? mapUnitToCreate(ingredient.unit) : undefined,
  };
}

//#endregion

// Helper function for string representation (equivalent to ToString() in C#)
export const ingredientToString = (ingredient: Ingredient): string => {
  const unitStr = ingredient.unit ? `${ingredient.unit.name} (id: ${ingredient.unit.id}, volumeEquivalent: ${ingredient.unit.volumeEquivalent})` : 'null';
  const foodStr = ingredient.food ? `Food: ${ingredient.food.name} (ID: ${ingredient.food.id}, TypeID: ${ingredient.food.foodTypeId})` : 'null';
  return `Ingredient { id = ${ingredient.id}, foodId = ${ingredient.foodId}, unitId = ${ingredient.unitId}, unitAmount = ${ingredient.unitAmount}, recipeId = ${ingredient.recipeId}, unit = ${unitStr}, food = ${foodStr} }`;
};

// Type guards for optional properties
export const hasFood = (ingredient: Ingredient): ingredient is Ingredient & { food: Food } => {
  return ingredient.food !== null && ingredient.food !== undefined;
};

export const hasUnit = (ingredient: Ingredient): ingredient is Ingredient & { unit: Unit } => {
  return ingredient.unit !== null && ingredient.unit !== undefined;
};

// Service methods
export const ingredientService = {
  getAll: async (params?: IngredientListParams): Promise<Ingredient[]> => {
    const response = await httpService.get<Ingredient[]>('/ingredients', params || {});
    return response;
  },

  getById: async (id: string): Promise<Ingredient> => {
    const response = await httpService.get<Ingredient>(`/ingredients/${id}`, {});
    return response;
  },

  create: async (data: CreateIngredient): Promise<Ingredient> => {
    const response = await httpService.post<Ingredient>('/ingredients', data);
    return response;
  },

  update: async (id: string, data: UpdateIngredient): Promise<Ingredient> => {
    const response = await httpService.patch<Ingredient>(`/ingredients/${id}`, data);
    return response;
  },

  delete: async (id: string): Promise<DeleteResponse> => {
    const response = await httpService.delete(`/ingredients/${id}`);
    return response;
  }
};
