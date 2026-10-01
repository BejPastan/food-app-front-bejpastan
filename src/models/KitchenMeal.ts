// KitchenMeal model
// Converted from C# models in FoodApp/Models/KitchenMeal.cs
// and FoodApp/Controllers/KitchenMealController.cs (route: api/kitchen)
// Meal records are now stored per kitchen instead of per user.

import httpService, { type DeleteResponse } from '../services/http_service';
import type { RecipeSimplified } from './Recipe';

//#region models
// Route parameter is the kitchen id, dates are optional query parameters
export interface KitchenMealListParams {
  kitchenId: string;
  startDate?: Date;
  endDate?: Date;
}

interface SanitizedKitchenMealListParams {
  startDate?: string;
  endDate?: string;
}

export interface CreateKitchenMeal {
  recipeId: string;
  mealId: string;
  mealDate: Date;
}

export interface SanitizedCreateKitchenMeal {
  recipeId: string;
  mealId: string;
  mealDate: string;
}

// Body of PATCH /kitchen/{kitchen_id} - only the recipe can be swapped
export interface UpdateKitchenMeal {
  kitchenMealId: string;
  recipeId: string;
}

export interface KitchenMeal {
  id: string;
  kitchenId: string;
  recipeId: string;
  mealId: string;
  mealDate: Date;
}

// Model with data for the kitchen meal list (KitchenMealWithData in C#).
// "recordId" is the id of the meal record, mapped from the "id" field of the response.
export interface KitchenMealWithData {
  recordId: string;
  recipeId: string;
  name: string;
  time: number;
  portion: number;
  meal: string;
  mealDate: Date;
}

export interface KitchenMealChoicesParams {
  mealId: string;
  excludeWeeks: number;
}
//#endregion

//#region mapping functions
export function mapResponseToKitchenMeal(data: any): KitchenMeal {
  return {
    id: data.id,
    kitchenId: data.kitchenId,
    recipeId: data.recipeId,
    mealId: data.mealId,
    mealDate: new Date(data.mealDate),
  };
}

export function mapResponseToKitchenMealWithData(data: any): KitchenMealWithData {
  return {
    recordId: data.id,
    recipeId: data.recipeId,
    name: data.name,
    time: data.time,
    portion: data.portion,
    meal: data.meal,
    mealDate: new Date(data.mealDate),
  };
}
//#endregion

// Helper function for string representation (equivalent to ToString() in C#)
export const kitchenMealToString = (kitchenMeal: KitchenMeal): string => {
  return `KitchenMeal { id = ${kitchenMeal.id}, kitchenId = ${kitchenMeal.kitchenId}, recipeId = ${kitchenMeal.recipeId}, mealId = ${kitchenMeal.mealId}, mealDate = ${kitchenMeal.mealDate} }`;
};

// Service methods
export const kitchenMealService = {
  // Requires at least the "inspector" role on the kitchen
  getAll: async (params: KitchenMealListParams): Promise<KitchenMealWithData[]> => {
    const sanitizedParams: SanitizedKitchenMealListParams = {};
    if (params.startDate) {
      sanitizedParams.startDate = params.startDate.toISOString().split('T')[0];
    }
    if (params.endDate) {
      sanitizedParams.endDate = params.endDate.toISOString().split('T')[0];
    }
    const response = await httpService.get<KitchenMealWithData[]>(
      `/kitchen/${params.kitchenId}/meals`,
      sanitizedParams
    );
    return (response ?? []).map(mapResponseToKitchenMealWithData);
  },

  // Requires at least the "editor" role on the kitchen
  getById: async (id: string): Promise<KitchenMeal> => {
    const response = await httpService.get<KitchenMeal>(`/kitchen/meals/${id}`, {});
    return mapResponseToKitchenMeal(response);
  },

  // Requires at least the "editor" role on the kitchen
  create: async (kitchenId: string, data: CreateKitchenMeal): Promise<KitchenMeal> => {
    const sanitizedData: SanitizedCreateKitchenMeal = {
      recipeId: data.recipeId,
      mealId: data.mealId,
      mealDate: data.mealDate.toISOString().split('T')[0],
    };
    const response = await httpService.post<KitchenMeal>(`/kitchen/${kitchenId}/meals`, sanitizedData);
    return mapResponseToKitchenMeal(response);
  },

  // Requires at least the "editor" role on the kitchen
  update: async (kitchenId: string, data: UpdateKitchenMeal): Promise<KitchenMeal> => {
    const response = await httpService.patch<KitchenMeal>(`/kitchen/${kitchenId}`, data);
    return mapResponseToKitchenMeal(response);
  },

  // Requires at least the "editor" role on the kitchen
  // NOTE: the backend endpoint is not implemented yet (throws NotImplementedException)
  delete: async (kitchenId: string, id: string): Promise<DeleteResponse> => {
    const response = await httpService.delete(`/kitchen/${kitchenId}/meals/${id}`);
    return response;
  },

  // Requires at least the "inspector" role on the kitchen
  // Returns up to 3 recipes for the given meal that were not used in the last excludeWeeks weeks
  // NOTE: the backend endpoint is not implemented yet (throws NotImplementedException)
  getChoices: async (kitchenId: string, params: KitchenMealChoicesParams): Promise<RecipeSimplified[]> => {
    const response = await httpService.get<RecipeSimplified[]>(`/kitchen/${kitchenId}/choices`, params);
    return response ?? [];
  },
};
