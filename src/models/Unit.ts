// Unit model
// Converted from C# model in test/Unit.cs

import httpService, { type DeleteResponse } from '../services/http_service';

// Request parameter types
export interface UnitListParams {
  search?: string;
  page?: number;
  perPage?: number;
}

export interface CreateUnit {
  name: string;
  volumeEquivalent: number;
  desc?: string;
}

export interface UnitConvertResp {
  unit: Unit;
  newUnitAmount: number;
}

export interface UpdateUnit {
  name?: string;
  volumeEquivalent?: number;
  desc?: string;
}

export interface Unit {
  id: string;
  name: string;
  volumeEquivalent: number;
  desc: string;
}

//#region mapping functions
export function mapUnitToCreate(unit: Unit): CreateUnit {
  return {
    name: unit.name,
    volumeEquivalent: unit.volumeEquivalent,
    desc: unit.desc,
  };
}

export function mapUnitToUpdate(unit: Unit): UpdateUnit {
  return {
    name: unit.name,
    volumeEquivalent: unit.volumeEquivalent,
    desc: unit.desc,
  };
}

//#endregion

// Helper function for string representation (equivalent to ToString() in C#)
export const unitToString = (unit: Unit): string => {
  return `${unit.name} (id: ${unit.id}, volumeEquivalent: ${unit.volumeEquivalent})`;
};

// Service methods
export const unitService = {
  getAll: async (params?: UnitListParams): Promise<Unit[]> => {
    const response = await httpService.get<Unit[]>('/units', params || {});
    return response;
  },

  getById: async (id: string): Promise<Unit> => {
    const response = await httpService.get<Unit>(`/units/${id}`, {});
    return response;
  },

  create: async (data: CreateUnit): Promise<Unit> => {
    const response = await httpService.post<Unit>('/units', data);
    return response;
  },

  update: async (id: string, data: UpdateUnit): Promise<Unit> => {
    const response = await httpService.patch<Unit>(`/units/${id}`, data);
    return response;
  },

  delete: async (id: string): Promise<DeleteResponse> => {
    const response = await httpService.delete(`/units/${id}`);
    return response;
  }
};
