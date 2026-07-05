import api from './axios.js';

const register = async (userData) => {
  const { data } = await api.post('/auth/register', userData);
  return data;
};

const login = async (credentials) => {
  const { data } = await api.post('/auth/login', credentials);
  return data;
};

const logout = async () => {
  const { data } = await api.post('/auth/logout');
  return data;
};

const getMe = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};

const updateProfile = async (profileData) => {
  const { data } = await api.put('/auth/profile', profileData);
  return data;
};

const changePassword = async (passwordData) => {
  const { data } = await api.put('/auth/password', passwordData);
  return data;
};

const authService = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
};

export default authService;
