import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { movieService } from '../services/movieService';
import { useLanguage } from '../context/LanguageContext';
import FilterBar from '../components/FilterBar';
import MovieCard from '../components/MovieCard';

const MoviesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  const [filters, setFilters] = useState({
    genre: 'all',
    language: 'all',
    sort: 'recent',
  });

  const activeSearch = searchParams.get('search') || '';
  const activeType = searchParams.get('type') || 'all';

  const combinedFilters = {
    ...filters,
    search: activeSearch,
    type: activeType,
  };

  useEffect(() => {
    const controller = new AbortController();

    const params = {};
    if (combinedFilters.genre && combinedFilters.genre !== 'all') params.genre = combinedFilters.genre;
    if (combinedFilters.language && combinedFilters.language !== 'all') params.language = combinedFilters.language;
    if (combinedFilters.type && combinedFilters.type !== 'all') params.type = combinedFilters.type;
    if (combinedFilters.sort) params.sort = combinedFilters.sort;
    if (combinedFilters.search) params.search = combinedFilters.search;

    movieService
      .getAll(params)
      .then((data) => {
        if (!controller.signal.aborted) {
          setMovies(data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          console.error('Error fetching movies:', err);
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [
    combinedFilters.genre,
    combinedFilters.language,
    combinedFilters.sort,
    combinedFilters.type,
    combinedFilters.search,
  ]);

  const handleFilterChange = (name, value) => {
    setLoading(true);
    if (name === 'search' || name === 'type') {
      const nextParams = new URLSearchParams(searchParams);
      if (value && value !== 'all') {
        nextParams.set(name, value);
      } else {
        nextParams.delete(name);
      }
      setSearchParams(nextParams);
    } else {
      setFilters((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleReset = () => {
    setLoading(true);
    setFilters({
      genre: 'all',
      language: 'all',
      sort: 'recent',
    });
    setSearchParams({});
  };

  return (
    <div className="section-container movies-catalog-page">
      {/* 1. Theatrical Header Banner */}
      <div className="catalog-hero-banner">
        <div className="catalog-hero-content">
          <div className="flex items-center gap-2 mb-2">
            <span className="badge badge-gold">
              <i className="fas fa-clapperboard"></i> CINEMA ARCHIVE
            </span>
            {combinedFilters.type !== 'all' && (
              <span className="badge badge-cyan">
                {combinedFilters.type.toUpperCase()}
              </span>
            )}
          </div>
          <h1 className="catalog-title">
            {combinedFilters.search ? (
              <>
                RESULTS FOR <span className="text-[#f5c518]">"{combinedFilters.search}"</span>
              </>
            ) : (
              t('allMovies')
            )}
          </h1>
          <p className="catalog-subtitle">
            Explore our curated high-definition streaming titles, blockbusters, and award-winning motion pictures.
          </p>
        </div>

        <div className="catalog-meta-badge">
          <span className="count-number">{movies.length}</span>
          <span className="count-label">TITLES LOADED</span>
        </div>
      </div>

      {/* 2. Spatial Filter Console */}
      <FilterBar
        filters={combinedFilters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />

      {/* 3. Movie Grid Content / Loading / Empty */}
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
      ) : movies.length === 0 ? (
        <div className="catalog-empty-card">
          <div className="empty-icon-halo">
            <i className="fas fa-search"></i>
          </div>
          <h3 className="empty-title">{t('noMoviesFound')}</h3>
          <p className="empty-desc">
            No cinematic titles match your active filter combination. Try resetting filters or exploring our full catalog.
          </p>
          <button type="button" className="btn-primary" onClick={handleReset}>
            <i className="fas fa-rotate-left"></i> Reset All Filters
          </button>
        </div>
      ) : (
        <div className="movies-grid catalog-grid">
          {movies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MoviesPage;
