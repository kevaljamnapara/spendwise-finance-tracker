import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true, // Important for cookies (JWT)
});

// ==========================================
// VIVA TIP - AXIOS INTERCEPTORS
// ==========================================
// What is an interceptor? It's a function that Axios runs on every request or response 
// BEFORE it reaches the calling component.
// Why use it here? Instead of checking for a 401 (Unauthorized) error in every single API call 
// (which violates the DRY principle), we catch it globally here. If the JWT token expires, 
// the server returns 401, and this interceptor automatically redirects the user to the login page.

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
