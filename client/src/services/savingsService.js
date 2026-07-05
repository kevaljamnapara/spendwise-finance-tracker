import api from './axios.js';

const getSavingsGoals = async () => {
  const { data } = await api.get('/savings');
  return data;
};

const createSavingsGoal = async (goalData) => {
  const { data } = await api.post('/savings', goalData);
  return data;
};

const updateSavingsGoal = async (id, goalData) => {
  const { data } = await api.put(`/savings/${id}`, goalData);
  return data;
};

const deleteSavingsGoal = async (id) => {
  const { data } = await api.delete(`/savings/${id}`);
  return data;
};

const savingsService = {
  getSavingsGoals,
  createSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
};

export default savingsService;
