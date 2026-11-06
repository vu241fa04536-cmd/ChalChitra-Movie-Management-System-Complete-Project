import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import MovieCard from '../components/MovieCard';

const FavoritesPage = () => {
  const { favorites, user } = useAuth();
  const { t } = useLanguage();
  const [filterText, setFilterText] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  const filteredFavorites = useMemo(() => {
    if (!favorites) return [];
    let list = [...favorites];

    if (filterText.trim()) {
      const q = filterText.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          (m.genre && m.genre.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'ratingDesc') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'titleAsc') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'yearDesc') {
      list.sort((a, b) => (b.releaseYear || 0) - (a.releaseYear || 0));
    }

    return list;
  }, [favorites, filterText, sortBy]);

  if (!user) {
    return (
      <div className="section-container auth-gate-screen">
        <div className="catalog-empty-card auth-gate-card">
          <div className="empty-icon-halo" style={{ borderColor: 'rgba(229, 9, 20, 0.4)', background: 'rgba(229, 9, 20, 0.12)' }}>
            <i className="fas fa-heart text-[#e50914]"></i>
          </div>
          <span className="badge badge-crimson mb-2">HALL OF FAME</span>
          <h2 className="empty-title">Sign In to View Your Favorites</h2>
          <p className="empty-desc">
            Keep track of your highest-rated cinema masterpieces, timeless all-time classics, and unforgettable performances.
          </p>
          <div className="flex gap-3 mt-2">
            <Link to="/login" className="btn-primary">
              <i className="fas fa-arrow-right-to-bracket"></i> Sign In Now
            </Link>
            <Link to="/movies" className="btn-outline">
              Explore Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-container favorites-page">
      {/* 1. Theatrical Header Banner */}
      <div className="catalog-hero-banner favorites-hero-banner">
        <div className="catalog-hero-content">
          <div className="flex items-center gap-2 mb-2">
            <span className="badge badge-crimson">
              <i className="fas fa-heart"></i> HALL OF FAME
            </span>
            <span className="badge badge-gold">
              <i className="fas fa-crown"></i> {user.username || 'VIP Cinephile'}
            </span>
          </div>
          <h1 className="catalog-title">
            {t('favMovies')}
          </h1>
          <p className="catalog-subtitle">
            Your personal collection of 5-star cinematic wonders, unforgettable directors' cuts, and cherished motion pictures.
          </p>
        </div>

        <div className="catalog-meta-badge" style={{ borderColor: 'rgba(229, 9, 20, 0.35)' }}>
          <span className="count-number" style={{ color: '#e50914' }}>{favorites?.length || 0}</span>
          <span className="count-label">LOVED TITLES</span>
        </div>
      </div>

      {/* 2. Quick Search & Sort Toolbar for Favorites */}
      {favorites && favorites.length > 0 && (
        <div className="watchlist-toolbar">
          <div className="watchlist-search-box">
            <i className="fas fa-search watchlist-search-icon"></i>
            <input
              type="text"
              placeholder="Search your favorites..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="watchlist-search-input"
              aria-label="Filter favorites"
            />
            {filterText && (
              <button
                type="button"
                className="watchlist-search-clear"
                onClick={() => setFilterText('')}
                aria-label="Clear filter"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>

          <div className="watchlist-sort-box">
            <label htmlFor="fav-sort-select" className="watchlist-sort-label">
              <i className="fas fa-arrow-down-wide-short"></i> Sort:
            </label>
            <select
              id="fav-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="recent">Recently Added</option>
              <option value="ratingDesc">Highest Rated</option>
              <option value="yearDesc">Release Year</option>
              <option value="titleAsc">Title (A-Z)</option>
            </select>
          </div>
        </div>
      )}

      {/* 3. Empty State or Movie Grid */}
      {!favorites || favorites.length === 0 ? (
        <div className="catalog-empty-card">
          <div className="empty-icon-halo" style={{ borderColor: 'rgba(229, 9, 20, 0.4)', background: 'rgba(229, 9, 20, 0.12)' }}>
            <i className="far fa-heart text-[#e50914]"></i>
          </div>
          <h3 className="empty-title">{t('emptyFavorites')}</h3>
          <p className="empty-desc">
            You haven't added any motion pictures to your Hall of Fame yet. Click the heart icon on any movie poster to crown your favorites.
          </p>
          <Link to="/movies" className="btn-primary" style={{ marginTop: '12px' }}>
            <i className="fas fa-fire"></i> Discover Trending Movies
          </Link>
        </div>
      ) : filteredFavorites.length === 0 ? (
        <div className="catalog-empty-card">
          <div className="empty-icon-halo">
            <i className="fas fa-search text-gray-400"></i>
          </div>
          <h3 className="empty-title">No Matching Favorites</h3>
          <p className="empty-desc">
            None of your {favorites.length} favorite titles match "{filterText}".
          </p>
          <button type="button" className="btn-outline" onClick={() => setFilterText('')}>
            Clear Search
          </button>
        </div>
      ) : (
        <div className="movies-grid catalog-grid">
          {filteredFavorites.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
