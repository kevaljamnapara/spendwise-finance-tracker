import api from './axios.js';

const getCategories = async () => {
  const { data } = await api.get('/categories');
  return data;
};

const createCategory = async (categoryData) => {
  const { data } = await api.post('/categories', categoryData);
  return data;
};

const updateCategory = async (id, categoryData) => {
  const { data } = await api.put(`/categories/${id}`, categoryData);
  return data;
};

const deleteCategory = async (id) => {
  const { data } = await api.delete(`/categories/${id}`);
  return data;
};

const categoryService = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};

export default categoryService;
