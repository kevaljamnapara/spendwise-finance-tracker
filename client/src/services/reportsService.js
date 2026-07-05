import api from './axios.js';

const getReports = async (startDate, endDate) => {
  let url = '/reports';
  const params = new URLSearchParams();
  
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  const { data } = await api.get(url);
  return data;
};

const reportsService = {
  getReports,
};

export default reportsService;
