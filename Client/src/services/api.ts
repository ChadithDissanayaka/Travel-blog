import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
});

let csrfToken: string | null = null;
let csrfPromise: Promise<string> | null = null;

const getCsrfToken = async (): Promise<string> => {
  if (csrfToken) return csrfToken;
  if (csrfPromise) return csrfPromise;

  const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/csrf-token`;

  csrfPromise = axios
    .get(url, { withCredentials: true })
    .then((res) => {
      csrfToken = res.data.csrfToken;
      return csrfToken || '';
    })
    .catch((err) => {
      console.error('Failed to fetch CSRF token:', err);
      return '';
    })
    .finally(() => {
      csrfPromise = null;
    });

  return csrfPromise;
};

api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Mutating methods require CSRF validation
    if (config.method && ['post', 'put', 'delete', 'patch'].includes(config.method.toLowerCase())) {
      const csrf = await getCsrfToken();
      if (csrf) {
        config.headers['X-CSRF-Token'] = csrf;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
