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
    genre: searchParams.get('genre') || 'all',
    language: searchParams.get('language') || 'all',
    type: searchParams.get('type') || 'all',
    sort: searchParams.get('sort') || 'recent',
    search: searchParams.get('search') || '',
  });

  useEffect(() => {
    // Sync URL search param
    const searchFromUrl = searchParams.get('search') || '';
    const typeFromUrl = searchParams.get('type') || 'all';
    setFilters((prev) => ({
      ...prev,
      search: searchFromUrl,
      type: typeFromUrl !== 'all' ? typeFromUrl : prev.type,
    }));
  }, [searchParams]);

  useEffect(() => {
    const fetchFilteredMovies = async () => {
      setLoading(true);
      try {
        const params = {};
        if (filters.genre && filters.genre !== 'all') params.genre = filters.genre;
        if (filters.language && filters.language !== 'all') params.language = filters.language;
        if (filters.type && filters.type !== 'all') params.type = filters.type;
        if (filters.sort) params.sort = filters.sort;
        if (filters.search) params.search = filters.search;

        const data = await movieService.getAll(params);
        setMovies(data);
      } catch (err) {
        console.error('Error fetching movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredMovies();
  }, [filters]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFilters({
      genre: 'all',
      language: 'all',
      type: 'all',
      sort: 'recent',
      search: '',
    });
    setSearchParams({});
  };

  return (
    <div className="section-container">
      <div className="section-title-wrap" style={{ marginTop: '10px' }}>
        <h1 className="section-title">
          {filters.search ? `Search Results for "${filters.search}"` : t('allMovies')}
        </h1>
        <span style={{ color: '#aaa', fontSize: '14px' }}>
          Showing {movies.length} titles
        </span>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />

      {/* Movies Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#f5c518' }}>
          <i className="fas fa-spinner fa-spin fa-2x"></i>
          <p style={{ marginTop: '12px' }}>{t('loading')}</p>
        </div>
      ) : movies.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
          <i className="fas fa-film fa-3x" style={{ marginBottom: '16px', color: '#444' }}></i>
          <h3>{t('noMoviesFound')}</h3>
          <button className="btn-primary" onClick={handleReset} style={{ marginTop: '16px' }}>
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="movies-grid">
          {movies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MoviesPage;
