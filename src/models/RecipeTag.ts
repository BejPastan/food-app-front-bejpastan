
// RecipeTag model
// Converted from C# model in test/RecipeTag.cs

import httpService from '../services/http_service';

// Request parameter types
export interface RecipeTagListParams {
  recipeId?: string;
  tagId?: string;
}

export interface CreateRecipeTag {
  recipeId: string;
  tagId: string;
}

export interface RecipeTag {
  recipeId: string;
  tagId: string;
}

// Helper function for string representation (equivalent to ToString() in C#)
export const recipeTagToString = (recipeTag: RecipeTag): string => {
  return `RecipeTag { recipeId = ${recipeTag.recipeId}, tagId = ${recipeTag.tagId} }`;
};

// Service methods
export const recipeTagService = {
  getAll: async (params?: RecipeTagListParams): Promise<RecipeTag[]> => {
    const response = await httpService.get<RecipeTag[]>('/recipe_tags', params || {});
    return response;
  },

  create: async (data: CreateRecipeTag): Promise<RecipeTag> => {
    const response = await httpService.post<RecipeTag>('/recipe_tags', data);
    return response;
  },

  delete: async (recipeId: string, tagId: string): Promise<void> => {
    await httpService.delete(`/recipe_tags?recipeId=${recipeId}&tagId=${tagId}`);
  }
};
