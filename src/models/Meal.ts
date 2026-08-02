import httpService, { type DeleteResponse } from '../services/http_service';

// Request parameter types
export interface MealListParams {
  name?: string;
  page?: number;
  perPage?: number;
}

export interface CreateMeal {
  name: string;
  order?: number;
}

export interface UpdateMeal {
  name?: string;
  order?: number;
}

export interface Meal {
  id: string;
  name: string;
  order: number;
}

// Helper function for string representation (equivalent to ToString() in C#)
export const mealToString = (meal: Meal): string => {
  return `Meal: ${meal.name} (ID: ${meal.id})`;
};

// Service methods
export const mealService = {
  getAll: async (params?: MealListParams): Promise<Meal[]> => {
    const response = await httpService.get<Meal[]>('/meals', params || {});
    return response;
  },

  getById: async (id: string): Promise<Meal> => {
    const response = await httpService.get<Meal>(`/meals/${id}`, {});
    return response;
  },

  create: async (data: CreateMeal): Promise<Meal> => {
    const response = await httpService.post<Meal>('/meals', data);
    return response;
  },

  update: async (id: string, data: UpdateMeal): Promise<Meal> => {
    const response = await httpService.patch<Meal>(`/meals/${id}`, data);
    return response;
  },

  delete: async (id: string): Promise<DeleteResponse> => {
    const response = await httpService.delete(`/meals/${id}`);
    return response;
  }
};

let mealCache: Meal[] | null = null;
let mealOrderCache:Map<string, number>;

export const getCachedMealOrder = async (): Promise<Map<string, number>> => {
  if(mealCache == null)
  {
    await getCachedMeals();
  }
  return mealOrderCache;
}

export const getCachedMeals = async (): Promise<Meal[]> => {
  if (mealCache === null) {
    mealCache = await mealService.getAll();
    mealCache.sort((a, b) => a.order - b.order); // Sort by order
    mealOrderCache = new Map<string, number>();
    mealCache.forEach((meal, index) => {
      mealOrderCache.set(meal.name, index); // Store the index as the order
    });
  }
  return mealCache;
};

export const getCachedMealsSync = (): Meal[] => {
  if (mealCache === null) {
    throw new Error("Meal cache is not initialized. Call getCachedMeals() first.");
  }
  return mealCache;
}