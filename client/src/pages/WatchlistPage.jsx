import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import MovieCard from '../components/MovieCard';

const WatchlistPage = () => {
  const { watchlist, user } = useAuth();
  const { t } = useLanguage();
  const [filterText, setFilterText] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  const filteredWatchlist = useMemo(() => {
    if (!watchlist) return [];
    let list = [...watchlist];

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
  }, [watchlist, filterText, sortBy]);

  if (!user) {
    return (
      <div className="section-container auth-gate-screen">
        <div className="catalog-empty-card auth-gate-card">
          <div className="empty-icon-halo">
            <i className="fas fa-bookmark text-[#f5c518]"></i>
          </div>
          <span className="badge badge-gold mb-2">PERSONAL VAULT</span>
          <h2 className="empty-title">Sign In to Access Your Watchlist</h2>
          <p className="empty-desc">
            Synchronize your personal cinematic queue across all devices, save upcoming premieres, and pick up right where you left off.
          </p>
          <div className="flex gap-3 mt-2">
            <Link to="/login" className="btn-primary">
              <i className="fas fa-arrow-right-to-bracket"></i> Sign In Now
            </Link>
            <Link to="/movies" className="btn-outline">
              Browse Movies First
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-container watchlist-page">
      {/* 1. Theatrical Header Banner */}
      <div className="catalog-hero-banner watchlist-hero-banner">
        <div className="catalog-hero-content">
          <div className="flex items-center gap-2 mb-2">
            <span className="badge badge-gold">
              <i className="fas fa-bookmark"></i> CURATED QUEUE
            </span>
            <span className="badge badge-cyan">
              <i className="fas fa-user-astronaut"></i> {user.username || 'Cinephile'}
            </span>
          </div>
          <h1 className="catalog-title">
            {t('watchlist')}
          </h1>
          <p className="catalog-subtitle">
            Your personal cinematic repository of must-watch motion pictures, upcoming releases, and serialized epics.
          </p>
        </div>

        <div className="catalog-meta-badge">
          <span className="count-number">{watchlist?.length || 0}</span>
          <span className="count-label">SAVED TITLES</span>
        </div>
      </div>

      {/* 2. Quick Search & Sort Bar for Watchlist */}
      {watchlist && watchlist.length > 0 && (
        <div className="watchlist-toolbar">
          <div className="watchlist-search-box">
            <i className="fas fa-search watchlist-search-icon"></i>
            <input
              type="text"
              placeholder="Filter your saved titles..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="watchlist-search-input"
              aria-label="Filter watchlist"
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
            <label htmlFor="watchlist-sort-select" className="watchlist-sort-label">
              <i className="fas fa-arrow-down-wide-short"></i> Sort:
            </label>
            <select
              id="watchlist-sort-select"
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
      {!watchlist || watchlist.length === 0 ? (
        <div className="catalog-empty-card">
          <div className="empty-icon-halo">
            <i className="fas fa-folder-open text-[#f5c518]"></i>
          </div>
          <h3 className="empty-title">{t('emptyWatchlist')}</h3>
          <p className="empty-desc">
            Your personal vault is waiting for its first blockbuster. Browse our 4K cinematic collection and click the bookmark button on any movie card to add it here.
          </p>
          <Link to="/movies" className="btn-primary" style={{ marginTop: '12px' }}>
            <i className="fas fa-compass"></i> Discover Movies & Series
          </Link>
        </div>
      ) : filteredWatchlist.length === 0 ? (
        <div className="catalog-empty-card">
          <div className="empty-icon-halo">
            <i className="fas fa-search text-gray-400"></i>
          </div>
          <h3 className="empty-title">No Matching Titles in Watchlist</h3>
          <p className="empty-desc">
            None of your {watchlist.length} saved titles match "{filterText}".
          </p>
          <button type="button" className="btn-outline" onClick={() => setFilterText('')}>
            Clear Search
          </button>
        </div>
      ) : (
        <div className="movies-grid catalog-grid">
          {filteredWatchlist.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WatchlistPage;
