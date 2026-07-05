import api from './axios.js';

const getUsers = async () => {
  const { data } = await api.get('/admin/users');
  return data;
};

const getStats = async () => {
  const { data } = await api.get('/admin/stats');
  return data;
};

const deleteUser = async (id) => {
  const { data } = await api.delete(`/admin/users/${id}`);
  return data;
};

const adminService = {
  getUsers,
  getStats,
  deleteUser,
};

export default adminService;
