import api from './axios.js';

const getExpenses = async () => {
  const { data } = await api.get('/expenses');
  return data;
};

const createExpense = async (expenseData) => {
  const { data } = await api.post('/expenses', expenseData);
  return data;
};

const updateExpense = async (id, expenseData) => {
  const { data } = await api.put(`/expenses/${id}`, expenseData);
  return data;
};

const deleteExpense = async (id) => {
  const { data } = await api.delete(`/expenses/${id}`);
  return data;
};

const expenseService = {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
};

export default expenseService;
