import React, { useState, useEffect } from 'react';
import { movieService } from '../services/movieService';
import { useLanguage } from '../context/LanguageContext';
import { getEmbedUrl, formatRating } from '../utils/helpers';

const TrailersPage = () => {
  const [trailers, setTrailers] = useState([]);
  const [sortOption, setSortOption] = useState('recent');
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchTrailers = async () => {
      setLoading(true);
      try {
        const data = await movieService.getAll({ sort: sortOption });
        // Keep movies that have a trailer link
        const validTrailers = data.filter((m) => m.trailer && m.trailer.trim() !== '');
        setTrailers(validTrailers);
      } catch (err) {
        console.error('Error fetching trailers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrailers();
  }, [sortOption]);

  return (
    <div className="section-container">
      <div className="section-title-wrap" style={{ marginTop: '10px' }}>
        <div>
          <h1 className="section-title">{t('trailers')}</h1>
          <p style={{ color: '#aaa', fontSize: '14px', marginTop: '4px' }}>
            Watch the latest cinematic trailers inline without redirects
          </p>
        </div>

        {/* Sort Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '13px', color: '#aaa' }}>{t('sort')}:</label>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="filter-select"
          >
            <option value="recent">{t('recent')}</option>
            <option value="ratingDesc">{t('ratingDesc')}</option>
            <option value="ratingAsc">{t('ratingAsc')}</option>
            <option value="titleAsc">{t('titleAsc')}</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#f5c518' }}>
          <i className="fas fa-spinner fa-spin fa-2x"></i>
          <p style={{ marginTop: '12px' }}>{t('loading')}</p>
        </div>
      ) : trailers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
          <h3>No trailers available right now.</h3>
        </div>
      ) : (
        <div className="trailers-grid">
          {trailers.map((movie) => {
            const embedUrl = getEmbedUrl(movie.trailer);
            return (
              <div key={movie._id} className="trailer-card">
                <div className="trailer-iframe-wrap">
                  {embedUrl ? (
                    <iframe
                      src={embedUrl}
                      title={`${movie.title} Trailer`}
                      className="trailer-iframe"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                      Trailer not available
                    </div>
                  )}
                </div>

                <div className="trailer-info">
                  <h3 className="trailer-title">{movie.title} - Official Trailer</h3>
                  <div className="trailer-meta">
                    <span>
                      <i className="fas fa-calendar-alt"></i> {movie.releaseYear} • {movie.genre}
                    </span>
                    <span style={{ color: '#f5c518', fontWeight: 'bold' }}>
                      <i className="fas fa-star"></i> {formatRating(movie.rating)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TrailersPage;
