const BASE_URL = import.meta.env.VITE_API_URL || 'https://human-capital-api.onrender.com/api/v1';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  async request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const headers = getHeaders();
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (response.status === 401) {
      // Clear local storage if token expired or unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    const json = await response.json();
    return json.data;
  },

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },
  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },

  // Public
  getPrices: (query = '') => api.get(`/prices${query}`),
  getPricesCount: () => api.get('/stats/records-count'),
  getStats: () => api.get('/stats/prices'),
  getTopCountries: () => api.get('/stats/top-countries'),
  getCountries: () => api.get('/countries'),
  getCountryStats: (code) => api.get(`/stats/country/${code}`),
  getCountryPrices: (code) => api.get(`/prices/country/${code}?limit=50`),
  search: (query) => api.get(`/search/prices?q=${query}`),

  // Auth
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout', {}),
  getMe: () => api.get('/auth/me'),

  // Admin Prices CRUD
  adminGetPrices: (query = '') => api.get(`/admin/prices${query}`),
  adminCreatePrice: (data) => api.post('/admin/prices', data),
  adminUpdatePrice: (id, data) => api.patch(`/admin/prices/${id}`, data),
  adminDeletePrice: (id) => api.delete(`/admin/prices/${id}`),
  adminGetDashboard: () => api.get('/admin/dashboard'),
  adminGetStats: () => api.get('/admin/stats'),

  // Admin Users CRUD (Mapped in our backend extension)
  adminGetUsers: () => api.get('/admin/users'),
  adminCreateUser: (data) => api.post('/admin/users', data),
  adminUpdateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
  adminDeleteUser: (id) => api.delete(`/admin/users/${id}`),
};