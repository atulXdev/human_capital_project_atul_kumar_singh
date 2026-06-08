const BASE_URL = 'https://human-capital-api.onrender.com/api/v1';

export const api = {
  async get(endpoint) {
    const res = await fetch(`${BASE_URL}${endpoint}`);
    const json = await res.json();
    return json.data;
  },
  getPrices: () => api.get('/prices?limit=50'),
  getStats: () => api.get('/stats/prices'),
  getYearlyAverage: () => api.get('/stats/yearly-average'),
  getTopCountries: () => api.get('/stats/top-countries'),
  getCountryStats: (code) => api.get(`/stats/country/${code}`),
  getCountryPrices: (code) => api.get(`/prices/country/${code}?limit=50`),
  getCountries: () => api.get('/countries'),
  search: (query) => api.get(`/search/prices?q=${query}`),
};