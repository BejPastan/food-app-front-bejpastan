// UserMeal model
// Converted from C# model in test/UserMeal.cs

import httpService, { type DeleteResponse } from '../services/http_service';

//#region models
// Request parameter types
export interface UserMealListParams {
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}

interface SanitizedUserMealListParams {
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateUserMeal {
  recipeId: string;
  mealId: string;
  mealDate: Date;
  portion?: number;
}

export interface SanitizedCreateUserMeal {
  recipeId: string;
  mealId: string;
  mealDate: string;
  portion?: number;
}

export interface UpdateUserMeal {
  recipeId?: string;
  mealId?: string;
  mealDate?: Date;
}

export interface UserMeal {
  id: string;
  userId: string;
  recipeId: string;
  mealId: string;
  mealDate: Date;
}

export interface UserMealWithData {
  recordId: string,
  recipeId: string,
  name:string,
  time:number,
  portion:number,
  meal:string,
  mealDate: Date
}
//#endregion
// Helper function for string representation (equivalent to ToString() in C#)
export const userMealToString = (userMeal: UserMeal): string => {
  return `UserMeal { id = ${userMeal.id}, userId = ${userMeal.userId}, recipeId = ${userMeal.recipeId}, mealId = ${userMeal.mealId}, mealDate = ${userMeal.mealDate} }`;
};

// Service methods
export const userMealService = {
  getAll: async (params: UserMealListParams): Promise<UserMealWithData[]> => {
    let sanitizedParams:SanitizedUserMealListParams = {};
    if (params.startDate) {
      sanitizedParams.startDate = params.startDate.toISOString().split('T')[0];
    }
    if (params.endDate) {
      sanitizedParams.endDate = params.endDate.toISOString().split('T')[0];
    }
    if (params.userId) {
      sanitizedParams.userId = params.userId;
    }
    let response = await httpService.get<UserMealWithData[]>('/user_meals', sanitizedParams);
    response = response.map(r=>{
      return mapResponseToUserMealWithData(r);
    })
    return response;
  },

  getById: async (id: string): Promise<UserMeal> => {
    const response = await httpService.get<UserMeal>(`/user_meals/${id}`, {});
    return response;
  },

  create: async (data: CreateUserMeal): Promise<UserMeal> => {
    var sanitizedData:SanitizedCreateUserMeal = {
      recipeId: data.recipeId,
      mealId: data.mealId,
      mealDate: data.mealDate.toISOString().split('T')[0],
      portion: data.portion
    }
    const response = await httpService.post<UserMeal>('/user_meals', sanitizedData);
    return response;
  },

  delete: async (id: string): Promise<DeleteResponse> => {
    const response = await httpService.delete(`/user_meals/${id}`);
    return response;
  }
};


function mapResponseToUserMealWithData(data:any):UserMealWithData{
  return {
    recordId: data.id,
    recipeId: data.recipeId,
    name: data.name,
    time: data.time,
    portion: data.portion,
    meal: data.meal,
    mealDate: new Date(data.mealDate)
  }
}