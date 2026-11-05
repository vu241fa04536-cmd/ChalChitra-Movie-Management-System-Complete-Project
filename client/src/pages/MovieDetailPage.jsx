import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { movieService } from '../services/movieService';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getEmbedUrl, formatRating } from '../utils/helpers';

const MovieDetailPage = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toggleWatchlist, toggleFavorites, isInWatchlist, isInFavorites } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await movieService.getById(id);
        setMovie(data);
      } catch (err) {
        setError(err.message || 'Failed to load movie details');
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', color: '#f5c518' }}>
        <i className="fas fa-spinner fa-spin fa-3x"></i>
        <p style={{ marginTop: '16px', fontSize: '18px' }}>{t('loading')}</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', color: '#e50914' }}>
        <h2>Movie Not Found</h2>
        <p style={{ color: '#aaa', margin: '12px 0 24px' }}>{error || 'Unable to locate this title.'}</p>
        <Link to="/movies" className="btn-primary">
          Back to Movies
        </Link>
      </div>
    );
  }

  const inWatchlist = isInWatchlist(movie._id);
  const inFavorites = isInFavorites(movie._id);
  const embedUrl = getEmbedUrl(movie.trailer);

  return (
    <div>
      {/* Backdrop & Info Section */}
      <div
        className="detail-hero-backdrop"
        style={{
          backgroundImage: `url(${movie.poster})`,
        }}
      >
        <div className="detail-backdrop-overlay"></div>

        <div className="detail-content-wrap">
          <img src={movie.poster} alt={movie.title} className="detail-poster-img" />

          <div className="detail-details">
            <h1 className="detail-title">{movie.title}</h1>

            <div className="detail-badges">
              <span className="badge badge-rating">
                <i className="fas fa-star" style={{ color: '#f5c518' }}></i> {formatRating(movie.rating)} / 10
              </span>
              <span className="badge">{movie.releaseYear}</span>
              <span className="badge">{movie.duration || 'N/A'}</span>
              <span className="badge">{movie.genre}</span>
              <span className="badge">{movie.language}</span>
              <span className="badge" style={{ textTransform: 'uppercase' }}>
                {movie.status}
              </span>
            </div>

            <p className="detail-desc">{movie.description}</p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <button
                className={`btn-primary ${inWatchlist ? 'btn-outline' : ''}`}
                onClick={() => toggleWatchlist(movie)}
              >
                <i className={inWatchlist ? 'fas fa-check' : 'fas fa-plus'}></i>
                <span>{inWatchlist ? t('removeFromWatchlist') : t('addToWatchlist')}</span>
              </button>

              <button
                className="btn-danger"
                onClick={() => toggleFavorites(movie)}
                style={{ background: inFavorites ? '#e50914' : '#222', border: '1px solid #444' }}
              >
                <i className="fas fa-heart"></i>
                <span>{inFavorites ? t('removeFromFavorites') : t('addToFavorites')}</span>
              </button>
            </div>

            {/* OTT Providers */}
            <div style={{ marginTop: '14px' }}>
              <span style={{ fontSize: '13px', color: '#aaa', fontWeight: 'bold' }}>
                {t('availableOn')}:
              </span>
              <div className="ott-platforms">
                {movie.watchLinks?.youtube && (
                  <a
                    href={movie.watchLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ott-btn ott-youtube"
                  >
                    <i className="fab fa-youtube"></i> YouTube
                  </a>
                )}
                {movie.watchLinks?.netflix && (
                  <a
                    href={movie.watchLinks.netflix}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ott-btn ott-netflix"
                  >
                    <i className="fas fa-play"></i> Netflix
                  </a>
                )}
                {movie.watchLinks?.hotstar && (
                  <a
                    href={movie.watchLinks.hotstar}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ott-btn ott-hotstar"
                  >
                    <i className="fas fa-star"></i> Hotstar
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Trailer Section */}
      {embedUrl && (
        <section className="section-container" style={{ paddingBottom: '60px' }}>
          <div className="section-title-wrap">
            <h2 className="section-title">Official Trailer</h2>
          </div>

          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '960px',
              margin: '0 auto',
              paddingTop: '54%',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
              background: '#000',
            }}
          >
            <iframe
              src={embedUrl}
              title={`${movie.title} Trailer`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none',
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </section>
      )}
    </div>
  );
};

export default MovieDetailPage;
