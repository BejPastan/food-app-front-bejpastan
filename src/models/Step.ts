// Step model
// Converted from C# model in test/Step.cs

import httpService, { type DeleteResponse } from '../services/http_service';

// Request parameter types
export interface StepListParams {
  recipeId?: string;
  page?: number;
  perPage?: number;
}

export interface CreateStep {
  recipeId?: string;
  instruction: string;
  stepNumber: number;
}

export interface UpdateStep {
  recipeId?: string;
  instruction?: string;
  stepNumber?: number;
}

export interface Step {
  id: string;
  recipeId: string;
  instruction: string;
  stepNumber: number;
}

// Helper function for string representation (equivalent to ToString() in C#)
export const stepToString = (step: Step): string => {
  return `id = ${step.id}, recipeId = ${step.recipeId}, instruction = ${step.instruction}, stepNumber = ${step.stepNumber}`;
};

// Service methods
export const stepService = {
  getAll: async (params?: StepListParams): Promise<Step[]> => {
    const response = await httpService.get<Step[]>('/steps', params || {});
    return response;
  },

  getById: async (id: string): Promise<Step> => {
    const response = await httpService.get<Step>(`/steps/${id}`, {});
    return response;
  },

  create: async (data: CreateStep): Promise<Step> => {
    const response = await httpService.post<Step>('/steps', data);
    return response;
  },

  update: async (id: string, data: UpdateStep): Promise<Step> => {
    const response = await httpService.patch<Step>(`/steps/${id}`, data);
    return response;
  },

  delete: async (id: string): Promise<DeleteResponse> => {
    const response = await httpService.delete(`/steps/${id}`);
    return response;
  }
};
