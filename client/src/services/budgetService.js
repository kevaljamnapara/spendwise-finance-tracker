import api from './axios.js';

const getBudgets = async (month) => {
  const { data } = await api.get(`/budgets${month ? `?month=${month}` : ''}`);
  return data;
};

const createBudget = async (budgetData) => {
  const { data } = await api.post('/budgets', budgetData);
  return data;
};

const updateBudget = async (id, budgetData) => {
  const { data } = await api.put(`/budgets/${id}`, budgetData);
  return data;
};

const deleteBudget = async (id) => {
  const { data } = await api.delete(`/budgets/${id}`);
  return data;
};

const budgetService = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
};

export default budgetService;
