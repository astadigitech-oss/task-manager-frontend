import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { AuthResponse } from '@/types/api/user.api';
import { AxiosResponse } from 'axios';

export const authService = {
  login: async (email: string, password: string, role: string): Promise<AuthResponse> => {
  
    const response: AxiosResponse<AuthResponse> = await apiClient.post(
      API_ENDPOINTS.AUTH.LOGIN, 
      { email, password, role }
    );
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    return response.data;
  },
};