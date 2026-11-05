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
    const fetchSeries = async () => {
      setLoading(true);
      try {
        const params = { type: 'webseries' };
        if (filters.genre !== 'all') params.genre = filters.genre;
        if (filters.language !== 'all') params.language = filters.language;
        if (filters.sort) params.sort = filters.sort;

        const data = await movieService.getAll(params);
        setSeries(data);
      } catch (err) {
        console.error('Error fetching web series:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSeries();
  }, [filters]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="section-container">
      <div className="section-title-wrap" style={{ marginTop: '10px' }}>
        <h1 className="section-title">{t('webseries')}</h1>
        <span style={{ color: '#aaa', fontSize: '14px' }}>
          {series.length} Series Available
        </span>
      </div>

      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={() => setFilters({ genre: 'all', language: 'all', type: 'webseries', sort: 'recent' })}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#f5c518' }}>
          <i className="fas fa-spinner fa-spin fa-2x"></i>
          <p style={{ marginTop: '12px' }}>{t('loading')}</p>
        </div>
      ) : series.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
          <h3>{t('noMoviesFound')}</h3>
        </div>
      ) : (
        <div className="movies-grid">
          {series.map((item) => (
            <MovieCard key={item._id} movie={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WebSeriesPage;
