// Kitchen model
// Converted from C# models in FoodApp/Models/Kitchen.cs
// and FoodApp/Controllers/KitchenController.cs (route: api/kitchen)

import { STORAGE_KEYS } from '@/constants/Routes';
import httpService, { type DeleteResponse } from '../services/http_service';
import { storageService } from '../services/storage_service';
import {
  kitchenUserService,
  getCurrentKitchenUser,
  getCurrentKitchenUserSync,
  setCurrentKitchenUser,
  clearCurrentKitchenUser,
  subscribeCurrentKitchenUser,
  mapResponseToKitchenUserDetail,
  type KitchenUserDetail,
} from './KitchenUser';
import { type KitchenRoleName } from './KitchenRole';

//#region models
// GET /api/kitchen - "name" is an optional server side filter for the kitchens of the user
export interface KitchenListParams {
  name: string;
}

export interface CreateKitchen {
  name: string;
}

export interface UpdateKitchen {
  name?: string;
  accessCode?: string;
}

// POST /api/kitchen/users - joins the current user to the kitchen located by the access code
export interface JoinKitchen {
  userId: string;
  accessCode: string;
}

export interface Kitchen {
  id: string;
  name: string;
  owner_id: string;
  updated_at: Date;
}
//#endregion

export const emptyKitchen: Kitchen = {
  id: '',
  name: '',
  owner_id: '',
  updated_at: new Date(0),
};

//#region mapping functions
export function mapResponseToKitchen(data: any): Kitchen {
  return {
    id: data.id,
    name: data.name,
    owner_id: data.owner_id,
    updated_at: data.updated_at ? new Date(data.updated_at) : new Date(0),
  };
}
//#endregion

// Helper function for string representation (equivalent to ToString() in C#)
export const kitchenToString = (kitchen: Kitchen): string => {
  return `Kitchen { id: ${kitchen.id}, name: "${kitchen.name}", owner_id: ${kitchen.owner_id} }`;
};

// The backend always grants full permissions to the direct owner of the kitchen
export const isKitchenOwner = (kitchen: Kitchen, userId: string | null | undefined): boolean => {
  return userId != null && kitchen.owner_id === userId;
};

// Service methods
export const kitchenService = {
  // Returns the kitchens accessible by the current user (owner or member).
  // Omit the parameters (or pass an empty name) to get every accessible kitchen, "name" filters them on the server
  getAll: async (params: KitchenListParams): Promise<Kitchen[]> => {
    const response = await httpService.get<Kitchen[]>('/kitchen', params || {});
    return (response ?? []).map(mapResponseToKitchen);
  },

  getById: async (id: string): Promise<Kitchen> => {
    const response = await httpService.get<Kitchen>(`/kitchen/${id}`, {});
    return mapResponseToKitchen(response);
  },

  create: async (data: CreateKitchen): Promise<Kitchen> => {
    const response = await httpService.post<Kitchen>('/kitchen', data);
    return mapResponseToKitchen(response);
  },

  // Joins the current user to the kitchen located by the access code (grants the "inspector" role)
  // and returns the created membership
  join: async (data: JoinKitchen): Promise<KitchenUserDetail> => {
    const response = await httpService.post<KitchenUserDetail>('/kitchen/users', data);
    return mapResponseToKitchenUserDetail(response);
  },

  update: async (id: string, data: UpdateKitchen): Promise<Kitchen> => {
    const response = await httpService.patch<Kitchen>(`/kitchen/${id}`, data);
    return mapResponseToKitchen(response);
  },

  delete: async (id: string): Promise<DeleteResponse> => {
    const response = await httpService.delete(`/kitchen/${id}`);
    return response;
  },
};

//#region kitchen cache
// Keeps the kitchens of the user in memory (same approach as the meal cache in Meal.ts)
let kitchenCache: Kitchen[] | null = null;

export const getKitchens = async ( params: KitchenListParams, force = false): Promise<Kitchen[]> => {
  if (kitchenCache === null || force) {
    kitchenCache = await kitchenService.getAll(params);
    kitchenCache.sort((a, b) => a.name.localeCompare(b.name));
  }
  return kitchenCache;
};

export const getKitchensSync = (): Kitchen[] => {
  return kitchenCache ?? [];
};


//#endregion

//#region current kitchen
//singleton for the current kitchen, stored in memory and local storage (mirrors the current user in User.ts)
//the membership of the current user in that kitchen is held by KitchenUser.ts and is bridged below
let currentKitchen: Kitchen | null = null;

// Simple listeners (no vue reactivity) so other views can follow the kitchen selected in the header
const currentKitchenListeners = new Set<() => void>();

// Subscribes to current kitchen changes and returns the function used to unsubscribe
export const subscribeCurrentKitchen = (listener: () => void): (() => void) => {
  currentKitchenListeners.add(listener);
  return () => {
    currentKitchenListeners.delete(listener);
  };
};

const notifyCurrentKitchen = (): void => {
  currentKitchenListeners.forEach((listener) => listener());
};

// The membership lives in KitchenUser.ts - re-emit its changes so existing kitchen subscribers stay in sync
subscribeCurrentKitchenUser(() => notifyCurrentKitchen());



//#region current kitchen 
export const setCurrentKitchen = async (kitchen: Kitchen | null): Promise<void> => {
  currentKitchen = kitchen;
  if (kitchen == null) {
    await storageService.deleteItem(STORAGE_KEYS.CURRENT_KITCHEN);
  } else {
    await storageService.setItem(STORAGE_KEYS.CURRENT_KITCHEN, JSON.stringify(kitchen));
  }
  notifyCurrentKitchen();
};

export const getCurrentKitchenSync = (): Kitchen | null => {
  return currentKitchen;
};

export const clearCurrentKitchen = async (): Promise<void> => {
  await setCurrentKitchen(null);
  await clearCurrentKitchenUser();
};
//#endregion

//#region current kitchen accessors
export const getCurrentKitchen = async (): Promise<Kitchen | null> => {
  if (currentKitchen) {
    return currentKitchen;
  }
  try {
    const kitchenString = await storageService.getItem(STORAGE_KEYS.CURRENT_KITCHEN);
    if (kitchenString) {
      currentKitchen = mapResponseToKitchen(JSON.parse(kitchenString));
      return currentKitchen;
    }
  } catch (error) {
    console.error('Failed to parse kitchen data:', error);
  }
  return null;
};

// Role of the current user in the current kitchen.
// The direct owner always has full permissions on the backend, even if no membership record is returned.
// The membership itself is owned by KitchenUser.ts.
export const getCurrentKitchenRoleSync = (): KitchenRoleName | null => {
  return getCurrentKitchenUserSync()?.roleName ?? null;
};

export const getCurrentKitchenRole = async (): Promise<KitchenRoleName | null> => {
  await getCurrentKitchen();
  await getCurrentKitchenUser();
  return getCurrentKitchenRoleSync();
};
//#endregion

// Loads the membership record of the user in the given kitchen and stores it together with the kitchen
export const selectKitchen = async (kitchen: Kitchen, userId: string): Promise<KitchenUserDetail | null> => {
  let member: KitchenUserDetail | null = null;
  try {
    member = (await kitchenUserService.getMembers(kitchen.id, {requestedUserId: userId}))[0] ?? null;
  } catch (error) {
    console.error('Failed to load the kitchen membership:', error);
  }
  await setCurrentKitchen(kitchen);
  await setCurrentKitchenUser(member);
  return member;
};

// Restores the stored kitchen when the user still has access to it, otherwise selects the first available kitchen
export const initKitchen = async (userId: string, force = false): Promise<Kitchen | null> => {
  const kitchens = await getKitchens({name: ''}, force);
  const stored = await getCurrentKitchen();
  const storedIsAccessible = stored != null && kitchens.some((kitchen) => kitchen.id === stored.id);
  const kitchen = storedIsAccessible ? stored : (kitchens.length > 0 ? kitchens[0] : null);

  if (kitchen == null) {
    await clearCurrentKitchen();
    return null;
  }
  if (!storedIsAccessible || force) {
    await selectKitchen(kitchen, userId);
  } else {
    await getCurrentKitchenUser();
  }
  return kitchen;
};

// Updates the name (and optionally the access code) of the current kitchen and keeps the cache, the storage and the memory singletons in sync
export const updateCurrentKitchen = async (name: string, accessCode?: string): Promise<Kitchen | null> => {
  const kitchen = await getCurrentKitchen();
  if (kitchen == null) {
    return null;
  }
  const updated = await kitchenService.update(kitchen.id, accessCode == null ? { name } : { name, accessCode });
  await setCurrentKitchen(updated);
  if (kitchenCache != null) {
    kitchenCache = kitchenCache.map((item) => (item.id === updated.id ? updated : item));
    kitchenCache.sort((a, b) => a.name.localeCompare(b.name));
  }
  return updated;
};
//#endregion
