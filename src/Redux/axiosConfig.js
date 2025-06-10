import axios from 'axios';
import { store } from './store'
import { refreshAccessToken, clearAuthState } from './authSlice';
import { useNavigate } from 'react-router-dom'

const base_url = "http://192.168.29.56:8000/api/"
// const base_url = "http://127.0.0.1:8000/api/";

const navigate = useNavigate()

const apiClient = axios.create({
  baseURL: base_url,
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.accessToken;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await store.dispatch(refreshAccessToken()).unwrap();
        
        const state = store.getState();
        const newToken = state.auth.accessToken;
        
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        store.dispatch(clearAuthState());
        navigate('/login')
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;