import axios from 'axios';
import {  API_TIMEOUT } from '@/constants/api';
import { setupInterceptors } from './interceptors';

export const apiClient = axios.create({
  baseURL: "/api",
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

setupInterceptors(apiClient);

export default {
  get: apiClient.get,
  post: apiClient.post,
  put: apiClient.put,
  patch: apiClient.patch,
  delete: apiClient.delete,
};