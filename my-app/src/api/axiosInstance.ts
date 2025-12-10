import axios from 'axios';

// Базовый axios-инстанс для всех axios-запросов (сессионные cookie)
const apiBase = (import.meta as any).env?.VITE_API_BASE as string | undefined;
const baseURL = apiBase && /^https?:\/\//.test(apiBase) ? apiBase : '/api';

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const m = document.cookie.match(new RegExp('(^|; )' + encodeURIComponent(name) + '=([^;]*)'));
  return m ? decodeURIComponent(m[2]) : undefined;
}

axiosInstance.interceptors.request.use((config) => {
  const method = (config.method || 'get').toUpperCase();
  if (method !== 'GET') {
    const token = getCookie('csrftoken') || getCookie('csrf') || getCookie('CSRF-TOKEN');
    if (token) {
      if (config.headers) {
        (config.headers as any)['X-CSRFToken'] = token;
        (config.headers as any)['X-Requested-With'] = 'XMLHttpRequest';
      } else {
        config.headers = { 'X-CSRFToken': token, 'X-Requested-With': 'XMLHttpRequest' } as any;
      }
    }
  }
  return config;
});

export default axiosInstance;


