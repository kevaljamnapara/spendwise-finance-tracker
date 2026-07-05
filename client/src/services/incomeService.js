import api from './axios.js';

const getIncomes = async () => {
  const { data } = await api.get('/incomes');
  return data;
};

const createIncome = async (incomeData) => {
  const { data } = await api.post('/incomes', incomeData);
  return data;
};

const updateIncome = async (id, incomeData) => {
  const { data } = await api.put(`/incomes/${id}`, incomeData);
  return data;
};

const deleteIncome = async (id) => {
  const { data } = await api.delete(`/incomes/${id}`);
  return data;
};

const incomeService = {
  getIncomes,
  createIncome,
  updateIncome,
  deleteIncome,
};

export default incomeService;
