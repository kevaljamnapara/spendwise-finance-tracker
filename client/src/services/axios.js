import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true, // Important for cookies (JWT)
});

// Global response interceptor to handle 401 Unauthorized errors globally.
// This prevents duplicating the 401 check in every API call.
// If the JWT token expires, this intercepts the 401 error and redirects to login.
api.interceptors.response.use(
  (response) => {
    // Any status code that lies within the range of 2xx causes this function to trigger
    return response;
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx causes this function to trigger
    if (error.response && error.response.status === 401) {
      // Avoid redirecting to login if user is already on a public route (avoids infinite loops)
      const publicPaths = ['/', '/login', '/register', '/forgot-password'];
      const isPublicPath = publicPaths.includes(window.location.pathname) || 
                          window.location.pathname.startsWith('/reset-password');
      
      if (!isPublicPath) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
