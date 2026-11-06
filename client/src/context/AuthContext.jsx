import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('chalchitra_token') || null);
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem('chalchitra_admin_auth') === 'true');
  const [watchlist, setWatchlist] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define logout before useEffect to prevent Temporal Dead Zone ReferenceError
  const logout = useCallback(() => {
    localStorage.removeItem('chalchitra_token');
    setToken(null);
    setUser(null);
    setWatchlist([]);
    setFavorites([]);
  }, []);

  // Load user profile on startup if token exists
  useEffect(() => {
    let isMounted = true;
    const loadUser = async () => {
      if (token) {
        try {
          const profile = await authService.getMe();
          if (isMounted) {
            setUser(profile);
            setWatchlist(profile.watchlist || []);
            setFavorites(profile.favorites || []);
          }
        } catch (err) {
          console.warn('[Auth Notice] Session token expired or invalid, clearing state:', err.message);
          if (isMounted) {
            logout();
          }
        }
      }
      if (isMounted) {
        setLoading(false);
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [token, logout]);

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
    const movieId = movie && movie._id ? movie._id : movie;
    const res = await authService.toggleWatchlist(movieId);
    if (res.isAdded) {
      setWatchlist((prev) => [...prev, movie]);
    } else {
      setWatchlist((prev) => prev.filter((m) => (m && (m._id || m)) !== movieId));
    }
    return res.isAdded;
  };

  const toggleFavorites = async (movie) => {
    if (!token) {
      alert('Please sign in to manage your favorites!');
      return false;
    }
    const movieId = movie && movie._id ? movie._id : movie;
    const res = await authService.toggleFavorites(movieId);
    if (res.isAdded) {
      setFavorites((prev) => [...prev, movie]);
    } else {
      setFavorites((prev) => prev.filter((m) => (m && (m._id || m)) !== movieId));
    }
    return res.isAdded;
  };

  const isInWatchlist = (movieId) => {
    if (!movieId || !Array.isArray(watchlist)) return false;
    return watchlist.some((m) => (m && m._id ? m._id === movieId : m === movieId));
  };

  const isInFavorites = (movieId) => {
    if (!movieId || !Array.isArray(favorites)) return false;
    return favorites.some((m) => (m && m._id ? m._id === movieId : m === movieId));
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
