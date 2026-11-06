import React, { useState, useEffect } from 'react';
import { movieService } from '../services/movieService';
import { useLanguage } from '../context/LanguageContext';
import FilterBar from '../components/FilterBar';
import MovieCard from '../components/MovieCard';

const WebSeriesPage = () => {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  const [filters, setFilters] = useState({
    genre: 'all',
    language: 'all',
    type: 'webseries',
    sort: 'recent',
  });

  useEffect(() => {
    const controller = new AbortController();

    const params = { type: 'webseries' };
    if (filters.genre !== 'all') params.genre = filters.genre;
    if (filters.language !== 'all') params.language = filters.language;
    if (filters.sort) params.sort = filters.sort;

    movieService
      .getAll(params)
      .then((data) => {
        if (!controller.signal.aborted) {
          setSeries(data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          console.error('Error fetching web series:', err);
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [filters]);

  const handleFilterChange = (name, value) => {
    setLoading(true);
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setLoading(true);
    setFilters({
      genre: 'all',
      language: 'all',
      type: 'webseries',
      sort: 'recent',
    });
  };

  return (
    <div className="section-container webseries-page">
      {/* 1. Theatrical Header Banner */}
      <div className="catalog-hero-banner webseries-hero-banner">
        <div className="catalog-hero-content">
          <div className="flex items-center gap-2 mb-2">
            <span className="badge badge-cyan">
              <i className="fas fa-tv"></i> EPISODIC SAGAS
            </span>
            <span className="badge badge-gold">
              <i className="fas fa-fire"></i> BINGE-WORTHY
            </span>
          </div>
          <h1 className="catalog-title">
            {t('webseries')}
          </h1>
          <p className="catalog-subtitle">
            Immerse yourself in multi-part cinematic seasons, gripping serialized dramas, and critically acclaimed episodic epics.
          </p>
        </div>

        <div className="catalog-meta-badge">
          <span className="count-number">{series.length}</span>
          <span className="count-label">SEASONS & SERIES</span>
        </div>
      </div>

      {/* 2. Spatial Filter Console */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />

      {/* 3. Series Grid Content / Loading / Empty */}
      {loading ? (
        <div className="catalog-grid-skeleton" aria-busy="true">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((idx) => (
            <div key={idx} className="skeleton-movie-card">
              <div className="skeleton-card-poster" />
              <div className="skeleton-card-info">
                <div className="skeleton-line skeleton-card-badge" />
                <div className="skeleton-line skeleton-card-title" />
                <div className="skeleton-line skeleton-card-meta" />
              </div>
            </div>
          ))}
        </div>
      ) : series.length === 0 ? (
        <div className="catalog-empty-card">
          <div className="empty-icon-halo">
            <i className="fas fa-tv"></i>
          </div>
          <h3 className="empty-title">{t('noMoviesFound')}</h3>
          <p className="empty-desc">
            No episodic series match your selected filter criteria. Try resetting your filters to explore our full serial repertoire.
          </p>
          <button type="button" className="btn-primary" onClick={handleReset}>
            <i className="fas fa-rotate-left"></i> Reset All Filters
          </button>
        </div>
      ) : (
        <div className="movies-grid catalog-grid">
          {series.map((item) => (
            <MovieCard key={item._id} movie={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WebSeriesPage;
