import axios from 'axios';

const api = axios.create({ baseURL: '/' });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('sdm_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem('sdm_token');
      localStorage.removeItem('sdm_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;