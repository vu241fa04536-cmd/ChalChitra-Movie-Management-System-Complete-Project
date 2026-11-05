import API from './api';

export const authService = {
  login: async (username, password) => {
    const res = await API.post('/auth/login', { username, password });
    return res.data;
  },

  register: async (username, password, email) => {
    const res = await API.post('/auth/register', { username, password, email });
    return res.data;
  },

  adminLogin: async (password) => {
    const res = await API.post('/auth/admin-login', { password });
    return res.data;
  },

  getMe: async () => {
    const res = await API.get('/auth/me');
    return res.data;
  },

  getWatchlist: async () => {
    const res = await API.get('/users/watchlist');
    return res.data;
  },

  toggleWatchlist: async (movieId) => {
    const res = await API.post(`/users/watchlist/${movieId}`);
    return res.data;
  },

  getFavorites: async () => {
    const res = await API.get('/users/favorites');
    return res.data;
  },

  toggleFavorites: async (movieId) => {
    const res = await API.post(`/users/favorites/${movieId}`);
    return res.data;
  },
};
