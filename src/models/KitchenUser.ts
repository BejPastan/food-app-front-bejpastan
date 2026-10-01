// KitchenUser model
// Converted from C# models in FoodApp/Models/KitchenUsers.cs
// and FoodApp/Controllers/KitchenUsersController.cs (route: api/kitchen/{kitchenId}/users)

import { STORAGE_KEYS } from '@/constants/Routes';
import httpService, { type DeleteResponse } from '../services/http_service';
import { storageService } from '../services/storage_service';
import { kitchenRoleToValue, type KitchenRoleName } from './KitchenRole';

//#region models
// Raw membership record (kitchens_users table)
export interface KitchenUser {
  id: string;
  kitchenId: string;
  userId: string;
  roleId: string;
  updated_at: Date;
}

// Detailed response returned by the kitchen users endpoints
// roleName is the name of the role from the database ("owner", "admin", "editor", "inspector"), or "unknown" when it cannot be resolved
export interface KitchenUserDetail {
  id: string;
  kitchenId: string;
  userId: string;
  roleId: string;
  roleName: KitchenRoleName | null;
  userName: string;
}

export interface AddKitchenUser {
  userId: string;
  role?: KitchenRoleName;
}

// Request body actually sent to the API - the C# KitchenRoles enum is numeric
export interface SanitizedAddKitchenUser {
  userId: string;
  role: number;
}

export interface UpdateKitchenUserRole {
  role: KitchenRoleName;
}

// Request body actually sent to the API - the C# KitchenRoles enum is numeric
export interface SanitizedUpdateKitchenUserRole {
  role: number;
}

export interface GetKitchenUsersRequest{
  requestedUserId?: string;
}
//#endregion



//#region mapping functions
export function mapResponseToKitchenUser(data: any): KitchenUser {
  return {
    id: data.id,
    kitchenId: data.kitchenId,
    userId: data.userId,
    roleId: data.roleId,
    updated_at: data.updated_at ? new Date(data.updated_at) : new Date(0),
  };
}

export function mapResponseToKitchenUserDetail(data: any): KitchenUserDetail {
  return {
    id: data.id,
    kitchenId: data.kitchenId,
    userId: data.userId,
    roleId: data.roleId,
    roleName: data.roleName ?? 'unknown',
    userName: data.userName ?? '',
  };
}

// Finds the membership record of a user in a list of kitchen members
export function findMemberByUserId(members: KitchenUserDetail[], userId: string | null | undefined): KitchenUserDetail | null {
  if (userId == null) {
    return null;
  }
  return members.find((member) => member.userId === userId) ?? null;
}

// Name to display for a member - the API returns an empty name when the user record is missing
export function memberDisplayName(member: KitchenUserDetail): string {
  return member.userName !== '' ? member.userName : 'Unknown user';
}
//#endregion

// Helper function for string representation (equivalent to ToString() in C#)
export const kitchenUserToString = (kitchenUser: KitchenUser): string => {
  return `KitchenUsers { id: ${kitchenUser.id}, kitchenId: ${kitchenUser.kitchenId}, userId: ${kitchenUser.userId}, roleId: ${kitchenUser.roleId} }`;
};

// Service methods
export const kitchenUserService = {
  // Requires at least the "inspector" role on the kitchen
  getMembers: async (kitchenId: string, request:GetKitchenUsersRequest): Promise<KitchenUserDetail[]> => {
    const response = await httpService.get<KitchenUserDetail[]>(`/kitchen/${kitchenId}/users`, {requestedUserId: request.requestedUserId});
    return (response ?? []).map(mapResponseToKitchenUserDetail);
  },

  // Requires at least the "admin" role on the kitchen (only the owner can grant "owner")
  changeRole: async (kitchenId: string, userId: string, role: KitchenRoleName): Promise<KitchenUserDetail> => {
    const sanitizedData: SanitizedUpdateKitchenUserRole = {
      role: kitchenRoleToValue(role),
    };
    const response = await httpService.patch<KitchenUserDetail>(`/kitchen/${kitchenId}/users/${userId}/role`, sanitizedData);
    return mapResponseToKitchenUserDetail(response);
  },

  // user may remove themselves
  removeUser: async (kitchenId: string, userId: string): Promise<DeleteResponse> => {
    const response = await httpService.delete(`/kitchen/${kitchenId}/users/${userId}`);
    return response;
  },
};

//#region current kitchen user
// Singleton for the membership of the current user in the current kitchen
// (mirrors the currentUser in User.ts and the currentKitchen in Kitchen.ts), stored in memory and local storage
let currentKitchenUser: KitchenUserDetail | null = null;

// Simple listeners (no vue reactivity) so other views can follow the current membership
const currentKitchenUserListeners = new Set<() => void>();

// Subscribes to current kitchen user changes and returns the function used to unsubscribe
export const subscribeCurrentKitchenUser = (listener: () => void): (() => void) => {
  currentKitchenUserListeners.add(listener);
  return () => {
    currentKitchenUserListeners.delete(listener);
  };
};

const notifyCurrentKitchenUser = (): void => {
  currentKitchenUserListeners.forEach((listener) => listener());
};

// Stores the current kitchen user in memory and local storage
export const setCurrentKitchenUser = async (member: KitchenUserDetail | null): Promise<void> => {
  currentKitchenUser = member;
  if (member == null) {
    await storageService.deleteItem(STORAGE_KEYS.CURRENT_KITCHEN_USER);
  } else {
    await storageService.setItem(STORAGE_KEYS.CURRENT_KITCHEN_USER, JSON.stringify(member));
  }
  notifyCurrentKitchenUser();
};

export const getCurrentKitchenUserSync = (): KitchenUserDetail | null => {
  return currentKitchenUser;
};

export const getCurrentKitchenUser = async (): Promise<KitchenUserDetail | null> => {
  if (currentKitchenUser) {
    return currentKitchenUser;
  }
  try {
    const memberString = await storageService.getItem(STORAGE_KEYS.CURRENT_KITCHEN_USER);
    if (memberString) {
      currentKitchenUser = JSON.parse(memberString) as KitchenUserDetail;
      return currentKitchenUser;
    }
  } catch (error) {
    console.error('Failed to parse kitchen membership data:', error);
  }
  return null;
};

export const clearCurrentKitchenUser = async (): Promise<void> => {
  await setCurrentKitchenUser(null);
};
//#endregion
