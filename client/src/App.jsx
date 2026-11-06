import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Cinematic3DBackground from './components/Cinematic3DBackground';

// Pages
import HomePage from './pages/HomePage';
import MoviesPage from './pages/MoviesPage';
import WebSeriesPage from './pages/WebSeriesPage';
import TrailersPage from './pages/TrailersPage';
import MovieDetailPage from './pages/MovieDetailPage';
import WatchlistPage from './pages/WatchlistPage';
import FavoritesPage from './pages/FavoritesPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';

function AppContent() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <div className="chalchitra-universe-app">
      {/* 1. Global Cinematic Canvas */}
      <Cinematic3DBackground />

      {/* 2. Compact Modern Navigation */}
      <Navbar />

      {/* 4. Main Page Container with Route Transitions */}
      <main className="main-content-flow">
        <div key={location.pathname} className="page-transition-wrap">
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/movies" element={<MoviesPage />} />
            <Route path="/webseries" element={<WebSeriesPage />} />
            <Route path="/trailers" element={<TrailersPage />} />
            <Route path="/movie/:id" element={<MovieDetailPage />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      {/* 5. Spatial Marquee Footer */}
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;
