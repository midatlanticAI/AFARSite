// @ts-nocheck
import axios from 'axios';

function normalizeBaseUrl(input?: string): string {
  let raw = (input || '').trim();
  if (!raw) return 'http://localhost:8000';
  // If starts with a colon like ":8000", prepend localhost
  if (raw.startsWith(':')) raw = `http://localhost${raw}`;
  // If missing protocol, add http://
  if (!/^https?:\/\//i.test(raw)) raw = `http://${raw}`;
  // Drop trailing slash
  return raw.replace(/\/$/, '');
}

const api = axios.create({
  baseURL: normalizeBaseUrl((import.meta as any).env?.VITE_API_URL),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Prevent caching sensitive GETs
  if (config.method?.toLowerCase() === 'get') {
    config.headers['Cache-Control'] = 'no-store';
  }
  // Attach an Idempotency-Key for mutating requests to make retries safe
  const method = (config.method || 'get').toLowerCase();
  if (['post','put','patch','delete'].includes(method)) {
    // Preserve an existing key if caller set one; otherwise generate
    if (!config.headers['Idempotency-Key']) {
      // Simple time-based key adequate for dev/testing
      const key = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      (config.headers as any)['Idempotency-Key'] = key;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      const detail = error?.response?.data?.detail;
      const code = error?.response?.status;
      const url = error?.config?.url || '';
      let message: any = detail || error?.message || 'Request failed';
      if (Array.isArray(detail)) {
        message = detail.map((it:any)=> {
          const loc = Array.isArray(it?.loc) ? it.loc.join('.') : '';
          return `${loc ? loc+': ' : ''}${it?.msg || JSON.stringify(it)}`;
        }).join('; ');
      } else if (typeof message === 'object') {
        message = JSON.stringify(message);
      }
      window.dispatchEvent(new CustomEvent('api-error', { detail: { message: String(message), code, url } }));
    } catch (_) { /* noop */ }
    return Promise.reject(error);
  }
);

export default api; 