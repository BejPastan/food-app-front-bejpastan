// FoodType model
// Converted from C# model in test/FoodType.cs

import httpService, { type DeleteResponse } from '../services/http_service';

// Request parameter types
export interface FoodTypeListParams {
  name?: string;
  page?: number;
  perPage?: number;
}

export interface CreateFoodType {
  name: string;
}

export interface UpdateFoodType {
  name?: string;
}

export interface FoodType {
  id: string;
  name: string;
}

// Helper function for string representation (equivalent to ToString() in C#)
export const foodTypeToString = (foodType: FoodType): string => {
  return `FoodType { id = ${foodType.id}, name = ${foodType.name} }`;
};

// Service methods
export const foodTypeService = {
  getAll: async (params?: FoodTypeListParams): Promise<FoodType[]> => {
    const response = await httpService.get<FoodType[]>('/food_type', params || {});
    return response;
  },

  getById: async (id: string): Promise<FoodType> => {
    const response = await httpService.get<FoodType>(`/food_type/${id}`, {});
    return response;
  },

  create: async (data: CreateFoodType): Promise<FoodType> => {
    const response = await httpService.post<FoodType>('/food_type', data);
    return response;
  },

  update: async (id: string, data: UpdateFoodType): Promise<FoodType> => {
    const response = await httpService.patch<FoodType>(`/food_type/${id}`, data);
    return response;
  },

  delete: async (id: string): Promise<DeleteResponse> => {
    const response = await httpService.delete(`/food_type/${id}`);
    return response;
  }
};
