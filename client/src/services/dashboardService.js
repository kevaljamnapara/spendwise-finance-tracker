import api from './axios.js';

const getSummary = async () => {
  const { data } = await api.get('/dashboard/summary');
  return data;
};

const dashboardService = {
  getSummary,
};

export default dashboardService;
