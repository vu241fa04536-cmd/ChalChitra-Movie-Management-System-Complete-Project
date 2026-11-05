import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('chalchitra_token') || null);
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem('chalchitra_admin_auth') === 'true');
  const [watchlist, setWatchlist] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load user profile on startup if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const profile = await authService.getMe();
          setUser(profile);
          setWatchlist(profile.watchlist || []);
          setFavorites(profile.favorites || []);
        } catch (err) {
          console.error('[Auth Error] Token expired or invalid', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (username, password) => {
    const data = await authService.login(username, password);
    localStorage.setItem('chalchitra_token', data.token);
    setToken(data.token);
    setUser(data);
    setWatchlist(data.watchlist || []);
    setFavorites(data.favorites || []);
    return data;
  };

  const register = async (username, password, email) => {
    const data = await authService.register(username, password, email);
    localStorage.setItem('chalchitra_token', data.token);
    setToken(data.token);
    setUser(data);
    setWatchlist([]);
    setFavorites([]);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('chalchitra_token');
    setToken(null);
    setUser(null);
    setWatchlist([]);
    setFavorites([]);
  };

  const adminLogin = async (password) => {
    const data = await authService.adminLogin(password);
    sessionStorage.setItem('chalchitra_admin_auth', 'true');
    sessionStorage.setItem('chalchitra_admin_token', data.token);
    setIsAdmin(true);
    return data;
  };

  const adminLogout = () => {
    sessionStorage.removeItem('chalchitra_admin_auth');
    sessionStorage.removeItem('chalchitra_admin_token');
    setIsAdmin(false);
  };

  const toggleWatchlist = async (movie) => {
    if (!token) {
      alert('Please sign in to manage your watchlist!');
      return false;
    }
    const res = await authService.toggleWatchlist(movie._id);
    if (res.isAdded) {
      setWatchlist((prev) => [...prev, movie]);
    } else {
      setWatchlist((prev) => prev.filter((m) => (m._id || m) !== movie._id));
    }
    return res.isAdded;
  };

  const toggleFavorites = async (movie) => {
    if (!token) {
      alert('Please sign in to manage your favorites!');
      return false;
    }
    const res = await authService.toggleFavorites(movie._id);
    if (res.isAdded) {
      setFavorites((prev) => [...prev, movie]);
    } else {
      setFavorites((prev) => prev.filter((m) => (m._id || m) !== movie._id));
    }
    return res.isAdded;
  };

  const isInWatchlist = (movieId) => {
    return watchlist.some((m) => (m._id ? m._id === movieId : m === movieId));
  };

  const isInFavorites = (movieId) => {
    return favorites.some((m) => (m._id ? m._id === movieId : m === movieId));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAdmin,
        watchlist,
        favorites,
        loading,
        login,
        register,
        logout,
        adminLogin,
        adminLogout,
        toggleWatchlist,
        toggleFavorites,
        isInWatchlist,
        isInFavorites,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
