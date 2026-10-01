// KitchenRole model
// Converted from C# models in FoodApp/Models/KitchenRole.cs
// and the KitchenRoles enum from FoodApp/Utilities/Structs.cs

import httpService, { type DeleteResponse } from '../services/http_service';

//#region role enum
// The C# KitchenRoles enum is serialized as a number by the API
// (no JsonStringEnumConverter is registered on the backend), so request bodies
// must send KITCHEN_ROLE_VALUES[role] instead of the role name.
export type KitchenRoleName = 'owner' | 'admin' | 'editor' | 'inspector';

export const KITCHEN_ROLES: readonly KitchenRoleName[] = ['owner', 'admin', 'editor', 'inspector'] as const;

// Numeric values of the C# enum - owner = 0, admin = 1, editor = 2, inspector = 3
export const KITCHEN_ROLE_VALUES: Record<KitchenRoleName, number> = {
  owner: 0,
  admin: 1,
  editor: 2,
  inspector: 3,
};

// Mirrors KitchenUserService.GetRoleRank - higher number means more permissions
export const KITCHEN_ROLE_RANKS: Record<KitchenRoleName, number> = {
  owner: 4,
  admin: 3,
  editor: 2,
  inspector: 1,
};

// Display names for the roles (the database stores them lowercase)
export const KITCHEN_ROLE_LABELS: Record<KitchenRoleName, string> = {
  owner: 'Owner',
  admin: 'Admin',
  editor: 'Editor',
  inspector: 'Inspector',
};

export const kitchenRoleLabel = (role: KitchenRoleName | 'unknown' | null | undefined): string => {
  const parsed = kitchenRoleFromValue(role);
  return parsed != null ? KITCHEN_ROLE_LABELS[parsed] : 'Unknown';
};

export const kitchenRoleToValue = (role: KitchenRoleName): number => KITCHEN_ROLE_VALUES[role];

export const kitchenRoleFromValue = (value: number | string | null | undefined): KitchenRoleName | null => {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'string') {
    const normalized = value.toLowerCase() as KitchenRoleName;
    return KITCHEN_ROLES.includes(normalized) ? normalized : null;
  }
  return KITCHEN_ROLES.find((role) => KITCHEN_ROLE_VALUES[role] === value) ?? null;
};

// Compares roles using the same ranking rules as the backend
export const hasKitchenRoleAtLeast = (role: KitchenRoleName | null | undefined, minimalRole: KitchenRoleName): boolean => {
  if (role === null || role === undefined) {
    return false;
  }
  return KITCHEN_ROLE_RANKS[role] >= KITCHEN_ROLE_RANKS[minimalRole];
};
//#endregion

//#region models
export interface KitchenRoleListParams {
  name?: string;
}

export interface CreateKitchenRole {
  name: string;
}

export interface UpdateKitchenRole {
  name?: string;
}

export interface KitchenRole {
  id: string;
  name: string;
  updated_at: Date;
}
//#endregion

export const emptyKitchenRole: KitchenRole = {
  id: '',
  name: '',
  updated_at: new Date(0),
};

//#region mapping functions
export function mapResponseToKitchenRole(data: any): KitchenRole {
  return {
    id: data.id,
    name: data.name,
    updated_at: data.updated_at ? new Date(data.updated_at) : new Date(0),
  };
}
//#endregion

// Helper function for string representation (equivalent to ToString() in C#)
export const kitchenRoleToString = (role: KitchenRole): string => {
  return `KitchenRole { id: ${role.id}, name: "${role.name}" }`;
};

// Service methods
export const kitchenRoleService = {
  getAll: async (params?: KitchenRoleListParams): Promise<KitchenRole[]> => {
    const response = await httpService.get<KitchenRole[]>('/kitchen-role', params || {});
    return (response ?? []).map(mapResponseToKitchenRole);
  },

  getById: async (id: string): Promise<KitchenRole> => {
    const response = await httpService.get<KitchenRole>(`/kitchen-role/${id}`, {});
    return mapResponseToKitchenRole(response);
  },

  create: async (data: CreateKitchenRole): Promise<KitchenRole> => {
    const response = await httpService.post<KitchenRole>('/kitchen-role', data);
    return mapResponseToKitchenRole(response);
  },

  update: async (id: string, data: UpdateKitchenRole): Promise<KitchenRole> => {
    const response = await httpService.patch<KitchenRole>(`/kitchen-role/${id}`, data);
    return mapResponseToKitchenRole(response);
  },

  delete: async (id: string): Promise<DeleteResponse> => {
    const response = await httpService.delete(`/kitchen-role/${id}`);
    return response;
  },
};
