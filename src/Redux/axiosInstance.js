import axios from 'axios';

// const baseURL = 'http://127.0.0.1:8000/api';
const baseURL = 'http://0.0.0.0:8000/api';

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach token
axiosInstance.interceptors.request.use((config) => {
  const access = localStorage.getItem('access');
  if (access) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired and refresh is available
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem('refresh');

      if (refresh) {
        try {
          const response = await axios.post(`${baseURL}/token/refresh/`, {
            refresh: refresh,
          });

          const newAccess = response.data.access;
          localStorage.setItem('access', newAccess);

          // Update the header and retry
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Refresh token expired or invalid — logout
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          window.location.href = '/login'; // or dispatch logout
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
