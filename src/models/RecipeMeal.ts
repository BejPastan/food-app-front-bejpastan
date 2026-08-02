// RecipeMeal model
// Converted from C# model in test/RecipeMeal.cs

import httpService from '../services/http_service';

// Request parameter types
export interface RecipeMealListParams {
  recipeId?: string;
  mealId?: string;
}

export interface CreateRecipeMeal {
  recipeId: string;
  mealId: string;
}

export interface UpdateRecipeMeal {
  recipeId?: string;
  mealId?: string;
}

export interface RecipeMeal {
  id: string;
  recipeId: string;
  mealId: string;
}

// Helper function for string representation (equivalent to ToString() in C#)
export const recipeMealToString = (recipeMeal: RecipeMeal): string => {
  return `RecipeMeal { id = ${recipeMeal.id}, recipeId = ${recipeMeal.recipeId}, mealId = ${recipeMeal.mealId} }`;
};

// Service methods
export const recipeMealService = {
  getAll: async (params?: RecipeMealListParams): Promise<RecipeMeal[]> => {
    const response = await httpService.get<RecipeMeal[]>('/recipe_meals', params || {});
    return response;
  },

  getById: async (id: string): Promise<RecipeMeal> => {
    const response = await httpService.get<RecipeMeal>(`/recipe_meals/${id}`, {});
    return response;
  },

  create: async (data: CreateRecipeMeal): Promise<RecipeMeal> => {
    const response = await httpService.post<RecipeMeal>('/recipe_meals', data);
    return response;
  },

  delete: async (id: string): Promise<void> => {
    await httpService.delete(`/recipe_meals/${id}`);
  }
};
