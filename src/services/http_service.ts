import { logout, refreshToken } from '../models/User';
import axios, { type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = 'https://foodapptestv001-bhe7d9g7cxf9hke5.polandcentral-01.azurewebsites.net/api';
//const API_BASE_URL = 'https://e017-193-142-3-177.ngrok-free.app/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        "ngrok-skip-browser-warning": "true"
    },
    
});

apiClient.interceptors.response.use(
    async function onFulfilled(response) {
        return response;
    },
    async function onRejected(error)
    {
        const requestConfig = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        if(axios.isAxiosError(error) && error.response?.status==401)
        {
            if(requestConfig._retry)
            {
               logout(); 
               return Promise.reject(error);
            }
            else
            {
                try {
                    await refreshToken();
                    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
                    originalRequest._retry = true;
                    return apiClient(originalRequest);
                } catch (refreshError) {
                    logout()
                    return Promise.reject(refreshError)
                }
            }
        }
        throw(error);
    }
)

const httpService = {
    async get<T>(endpoint:string, params:any):Promise<T> {
        const urlParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                // If it's an array, append each item to the same key
                value.forEach(v => urlParams.append(key, String(v)));
            } else {
                // Otherwise, just set the value
                urlParams.set(key, String(value));
            }
        });
        const response = await apiClient.get(`${API_BASE_URL}${endpoint}`, { params: urlParams });
        return response.data as T;
    },
    async post<T>(endpoint:string, data:any):Promise<T> {
            const response = await apiClient.post(`${API_BASE_URL}${endpoint}`, data);
            return response.data as T;
    },
    async patch<T>(endpoint:string, data:any):Promise<T> {

        const response = await apiClient.patch(`${API_BASE_URL}${endpoint}`, data);
        return response.data as T;
    },
    async delete(endpoint:string):Promise<DeleteResponse> {
        const response = await apiClient.delete<DeleteResponse>(`${API_BASE_URL}${endpoint}`);
        return response.data as DeleteResponse;
    }
}

export default httpService;

//#region generic types

export interface DeleteResponse {
  deleted: boolean;
}
//#endregion