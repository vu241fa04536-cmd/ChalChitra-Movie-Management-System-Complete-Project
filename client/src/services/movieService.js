import API from './api';

export const movieService = {
  // Get all movies with optional filters (search, genre, language, type, status, sort)
  getAll: async (params = {}) => {
    const res = await API.get('/movies', { params });
    return res.data;
  },

  // Get single movie by ID
  getById: async (id) => {
    const res = await API.get(`/movies/${id}`);
    return res.data;
  },

  // Admin Create movie
  create: async (movieData) => {
    const res = await API.post('/movies', movieData);
    return res.data;
  },

  // Admin Update movie
  update: async (id, movieData) => {
    const res = await API.put(`/movies/${id}`, movieData);
    return res.data;
  },

  // Admin Delete movie
  delete: async (id) => {
    const res = await API.delete(`/movies/${id}`);
    return res.data;
  },
};
