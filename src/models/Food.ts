// Food model
// Converted from C# model in test/Food.cs

import httpService, { type DeleteResponse } from '../services/http_service';
import type { FoodType } from './FoodType';

// Request parameter types
export interface FoodListParams {
  typeId?: string;
  name?: string;
  page?: number;
  perPage?: number;
}

import type { CreateFoodType } from './FoodType';

export interface CreateFood {
  name: string;
  foodTypeId?: string;
  foodType?: CreateFoodType;
}

export interface UpdateFood {
  name?: string;
  foodTypeId?: string;
  foodType?: CreateFoodType;
}

export interface Food {
  id: string;
  name: string;
  foodTypeId: string;
  foodType: FoodType;
}

//#region mapping functions
export function mapFoodToCreate(food: Food): CreateFood {
  return {
    name: food.name,
    foodTypeId: food.foodTypeId,
    foodType: {
      name: food.foodType?.name || '',
    },
  };
}

export function mapFoodToUpdate(food: Food): UpdateFood {
  return {
    name: food.name,
    foodTypeId: food.foodTypeId,
    foodType: {
      name: food.foodType?.name || '',
    },
  };
}


//#endregion

// Helper function for string representation (equivalent to ToString() in C#)
export const foodToString = (food: Food): string => {
  return `Food: ${food.name} (ID: ${food.id}, TypeID: ${food.foodTypeId})`;
};

// Service methods
export const foodService = {
  getAll: async (params?: FoodListParams): Promise<Food[]> => {
    const response = await httpService.get<Food[]>('/food', params || {});
    return response;
  },

  getById: async (id: string): Promise<Food> => {
    const response = await httpService.get<Food>(`/food/${id}`, {});
    return response;
  },

  create: async (data: CreateFood): Promise<Food> => {
    const response = await httpService.post<Food>('/food', data);
    return response;
  },

  update: async (id: string, data: UpdateFood): Promise<Food> => {
    const response = await httpService.patch<Food>(`/food/${id}`, data);
    return response;
  },

  delete: async (id: string): Promise<DeleteResponse> => {
    const response = await httpService.delete(`/food/${id}`);
    return response;
  }
};
