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

//login
export const login = async (loginRequest: LoginRequest): Promise<ExtendedUser | null> => {
  await userService.login(loginRequest);
  await authMe();
  return currentUser;
}

export const refreshToken = async (): Promise<ExtendedUser | null> => {
  await userService.refresh();
  await authMe();
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
export const authMe = async (): Promise<ExtendedUser> => {
  await getCurrentUser();
  const user = await userService.getCurrent();
  console.log("current user", user);
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
  currentUser = null;
  router.push({ path: "/" });
  var userInStorage = await getCurrentUser()
  if(userInStorage != null)
  {
    console.log("Logging out user");
    console.log("user in storage", userInStorage);
    await storageService.deleteItem(STORAGE_KEYS.CURRENT_USER);
    await userService.logout();
  }
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
    return currentUser;
  }
  else{
    //try to get from local storage
    try {
    const userString = await storageService.getItem('currentUser');
    if (userString) {

        const user = JSON.parse(userString) as ExtendedUser;
        currentUser = user;
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
