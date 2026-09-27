// User model
// Converted from C# model in test/User.cs

import { STORAGE_KEYS } from '@/constants/Routes';
import httpService from '../services/http_service';
import { storageService } from '../services/storage_service';
import { type SuccessResponse } from './UtilityModels';
import { router } from '@/router';
export type UserStatus = 'active' | 'inactive' | 'timeout';

//#region models
export interface User {
  id: string;
  name: string;
  password: string; // This is the hashed password
  email: string;
  last_login?: Date | null;
  userStatus: UserStatus
}

export interface ExtendedUser extends User {
  roleName: string;
  role: number;
}

export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
}

export interface ConfirmSignUpRequest {
  token:string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserUpdateRequest {
  name?: string;
  email?: string;
}

// Service methods
export interface LoginResponse {
  token: string,
}

export interface StartPasswordReset {
  email:string
}

export interface ConfirmPasswordReset{
  token: string,
  newPassword:string
}
//#endregion

//#region services
let currentUser: ExtendedUser | null = null;
let lastValidatedAt = 0;
const AUTH_VALIDATION_TTL = 5 * 60 * 1000; // ms - revalidate /auth/me at most this often

//login
export const login = async (loginRequest: LoginRequest): Promise<ExtendedUser | null> => {
  await userService.login(loginRequest);
  await authMe(true);
  return currentUser;
}

export const refreshToken = async (): Promise<ExtendedUser | null> => {
  await userService.refresh();
  await authMe(true);
  return currentUser;
}

//#region sign up
export const signUp = async (signUpRequest: SignUpRequest): Promise<User | null> => {
  await userService.signUp(signUpRequest);
  return currentUser;
}

export const confirmSignUp = async (signUpRequest: ConfirmSignUpRequest): Promise<User | null> => {
  await userService.signUpConfirm(signUpRequest);
  return currentUser;
}
//#endregion

//get current user and store in memory and local storage
export const authMe = async (force = false): Promise<ExtendedUser | null> => {
  const cached = await getCurrentUser();
  if (!force && cached != null && Date.now() - lastValidatedAt < AUTH_VALIDATION_TTL) {
    console.log("Using cached user, skipping /auth/me");
    return cached;
  }
  const user = await userService.getCurrent();
  console.log("current user", user);
  lastValidatedAt = Date.now();
  await setCurrentUser(user);
  return user;
}
//#region password reset
export const startPasswordReset = async(tokenRequest: StartPasswordReset): Promise<SuccessResponse> => {
  return await userService.startResetPassword(tokenRequest);
}

export const confirmPasswordReset = async(request: ConfirmPasswordReset):Promise<SuccessResponse> =>{
  return await userService.resetPassword(request);
}
//#endregion

//#region Update user data
export const updateUserData = async (updateRequest: UserUpdateRequest): Promise<ExtendedUser> => {
  return await userService.updateUserData(updateRequest);
}
//#endregion

//logout
export const logout = async (): Promise<void> => {
  const hadSession = currentUser != null || (await storageService.getItem(STORAGE_KEYS.CURRENT_USER)) != null;
  currentUser = null;
  lastValidatedAt = 0;
  await storageService.deleteItem(STORAGE_KEYS.CURRENT_USER);
  if(hadSession)
  {
    console.log("Logging out user");
    try {
      await userService.logout();
    } catch (error) {
      console.error("Failed to log out on the server:", error);
    }
  }
  router.push({ path: "/" });
}

//#endregion

//#region Current user 
//singleton for current user, stored in memory and local storage
export const setCurrentUser = async (user: ExtendedUser): Promise<void> => {
  currentUser = user;
  await storageService.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

export const getCurrentUserSync = (): ExtendedUser | null => {
  return currentUser;
}

export const getCurrentUser = async (): Promise<ExtendedUser | null> => {
  if (currentUser) {
    console.log("Returning current user from memory");
    return currentUser;
  }
  else{
    //try to get from local storage
    try {
      console.log("Trying to get current user from local storage");
    const userString = await storageService.getItem(STORAGE_KEYS.CURRENT_USER);
    if (userString) {
        console.log("Found current user in local storage");
        const user = JSON.parse(userString) as ExtendedUser;
        currentUser = user;
        console.log("Returning current user from local storage");
        return user;
    }
    } catch (error) {
      console.error('Failed to parse user data:', error);
      return null;
    }
    return null;
  }
}
//#endregion

const userService = {
  login: async (loginRequest: LoginRequest): Promise<SuccessResponse> => {
      const response = await httpService.post<SuccessResponse>('/auth/login', loginRequest);
      return response;
  },

  refresh: async (): Promise<SuccessResponse> => {
    const response = await httpService.get<SuccessResponse>('/auth/refresh', {});
    return response;
  },

  logout: async (): Promise<SuccessResponse> => {
    const response = await httpService.post<SuccessResponse>('/auth/logout', {});
    return response;
  },

  signUp: async (signUpRequest: SignUpRequest): Promise<SuccessResponse> => {
    const response = await httpService.post<SuccessResponse>('/users/signup', signUpRequest);
    return response;
  },

  signUpConfirm: async (signUpRequest: ConfirmSignUpRequest): Promise<SuccessResponse> => {
    const response = await httpService.post<SuccessResponse>('/users/signup/confirm', signUpRequest);
    return response;
  },

  getCurrent: async (): Promise<ExtendedUser> => {
    const response = await httpService.get<ExtendedUser>('/auth/me', []);
    return response;
  },

  startResetPassword: async(tokenRequest: StartPasswordReset): Promise<SuccessResponse> =>{
    const response = await httpService.post<SuccessResponse>('/users/reset-password', tokenRequest);
    return response;
  },
  resetPassword: async(request:ConfirmPasswordReset):Promise<SuccessResponse>=>{
    const response = await httpService.post<SuccessResponse>('/users/reset-password/confirm', request);
    return response;
  },

  updateUserData: async (updateRequest: UserUpdateRequest): Promise<ExtendedUser> => {
    const response = await httpService.patch<ExtendedUser>('/users/profile', updateRequest);
    await setCurrentUser(response);
    return response;
  }
};
