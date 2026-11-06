import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { movieService } from '../services/movieService';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getEmbedUrl, formatRating } from '../utils/helpers';
import MovieCard from '../components/MovieCard';

const MovieDetailPage = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const trailerRef = useRef(null);
  const { toggleWatchlist, toggleFavorites, isInWatchlist, isInFavorites } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    const controller = new AbortController();

    movieService
      .getById(id)
      .then((data) => {
        if (!controller.signal.aborted) {
          setMovie(data);
          setLoading(false);
          // Fetch similar titles in the same genre
          if (data && data.genre) {
            movieService
              .getAll({ genre: data.genre })
              .then((allSimilar) => {
                if (!controller.signal.aborted) {
                  const filtered = (allSimilar || []).filter((m) => m._id !== data._id).slice(0, 8);
                  setSimilarMovies(filtered);
                }
              })
              .catch((err) => console.warn('Could not load similar titles:', err));
          }
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err.message || 'Failed to load movie details');
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [id]);

  const scrollToTrailer = () => {
    if (trailerRef.current) {
      trailerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (loading) {
    return (
      <div className="detail-loading-screen" aria-busy="true">
        <div className="detail-skeleton-hero">
          <div className="skeleton-detail-poster" />
          <div className="skeleton-detail-body">
            <div className="skeleton-line" style={{ width: '180px', height: '24px' }} />
            <div className="skeleton-line" style={{ width: '70%', height: '56px', marginTop: '16px' }} />
            <div className="skeleton-line" style={{ width: '40%', height: '28px', marginTop: '12px' }} />
            <div className="skeleton-line" style={{ width: '90%', height: '80px', marginTop: '20px' }} />
            <div className="skeleton-line" style={{ width: '320px', height: '46px', marginTop: '24px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="section-container detail-error-screen">
        <div className="catalog-empty-card">
          <div className="empty-icon-halo" style={{ borderColor: 'rgba(229, 9, 20, 0.4)', background: 'rgba(229, 9, 20, 0.12)' }}>
            <i className="fas fa-film text-[#e50914]"></i>
          </div>
          <h2 className="empty-title">Title Not Found</h2>
          <p className="empty-desc">{error || 'Unable to locate this title in our cinematic archive.'}</p>
          <Link to="/movies" className="btn-primary">
            <i className="fas fa-arrow-left"></i> Return to Movie Archive
          </Link>
        </div>
      </div>
    );
  }

  const inWatchlist = isInWatchlist(movie._id);
  const inFavorites = isInFavorites(movie._id);
  const embedUrl = getEmbedUrl(movie.trailer);

  return (
    <div className="detail-page-wrapper">
      {/* 1. Backdrop & Spatial Hero Section */}
      <div
        className="detail-hero-backdrop"
        style={{
          backgroundImage: `url(${movie.poster})`,
        }}
      >
        <div className="detail-backdrop-overlay" />
        <div className="detail-vignette-radial" />

        <div className="detail-content-wrap">
          {/* 3D Floating Glass Poster Presentation */}
          <div className="detail-poster-stage">
            <div className="detail-poster-card">
              <img
                src={movie.poster}
                alt={movie.title}
                className="detail-poster-img"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500';
                }}
              />
              <div className="detail-poster-sheen" />
              {movie.status === 'upcoming' && (
                <div className="detail-poster-upcoming-badge">
                  <i className="fas fa-clock"></i> COMING SOON
                </div>
              )}
            </div>
          </div>

          {/* Details & Editorial Info */}
          <div className="detail-details">
            <div className="detail-breadcrumbs">
              <Link to="/" className="detail-crumb-link">Home</Link>
              <span className="detail-crumb-sep">/</span>
              <Link to={movie.type === 'webseries' ? '/webseries' : '/movies'} className="detail-crumb-link">
                {movie.type === 'webseries' ? 'Web Series' : 'Movies'}
              </Link>
              <span className="detail-crumb-sep">/</span>
              <span className="detail-crumb-current">{movie.title}</span>
            </div>

            <h1 className="detail-title">{movie.title}</h1>

            {/* Badges Matrix */}
            <div className="detail-badges">
              <span className="badge badge-rating">
                <i className="fas fa-star" style={{ color: '#f5c518' }}></i> {formatRating(movie.rating)} / 10
              </span>
              <span className="badge">
                <i className="fas fa-calendar-alt"></i> {movie.releaseYear}
              </span>
              {movie.duration && (
                <span className="badge">
                  <i className="fas fa-clock"></i> {movie.duration}
                </span>
              )}
              <span className="badge badge-genre">
                <i className="fas fa-masks-theater"></i> {movie.genre}
              </span>
              <span className="badge">
                <i className="fas fa-language"></i> {movie.language}
              </span>
              <span className={`badge ${movie.status === 'upcoming' ? 'badge-cyan' : 'badge-green'}`} style={{ textTransform: 'uppercase' }}>
                {movie.status || 'released'}
              </span>
              <span className="badge" style={{ textTransform: 'uppercase' }}>
                {movie.type || 'movie'}
              </span>
            </div>

            {/* Synopsis */}
            <div className="detail-synopsis-box">
              <h3 className="detail-synopsis-label">SYNOPSIS</h3>
              <p className="detail-desc">{movie.description}</p>
            </div>

            {/* Action Buttons Matrix */}
            <div className="detail-actions-row">
              {embedUrl && (
                <button
                  type="button"
                  className="btn-primary detail-trailer-cta"
                  onClick={scrollToTrailer}
                >
                  <i className="fas fa-play"></i>
                  <span>Watch Trailer</span>
                </button>
              )}

              <button
                type="button"
                className={`btn-outline ${inWatchlist ? 'btn-active-watchlist' : ''}`}
                onClick={() => toggleWatchlist(movie)}
                aria-label={inWatchlist ? t('removeFromWatchlist') : t('addToWatchlist')}
              >
                <i className={inWatchlist ? 'fas fa-check text-[#f5c518]' : 'fas fa-plus'}></i>
                <span>{inWatchlist ? t('removeFromWatchlist') : t('addToWatchlist')}</span>
              </button>

              <button
                type="button"
                className={`btn-outline ${inFavorites ? 'btn-active-favorite' : ''}`}
                onClick={() => toggleFavorites(movie)}
                aria-label={inFavorites ? t('removeFromFavorites') : t('addToFavorites')}
              >
                <i className={`fas fa-heart ${inFavorites ? 'text-[#e50914]' : ''}`}></i>
                <span>{inFavorites ? t('removeFromFavorites') : t('addToFavorites')}</span>
              </button>
            </div>

            {/* OTT Providers Shelf */}
            {(movie.watchLinks?.youtube || movie.watchLinks?.netflix || movie.watchLinks?.hotstar) && (
              <div className="detail-ott-shelf">
                <span className="detail-ott-heading">
                  <i className="fas fa-satellite-dish"></i> {t('availableOn')}:
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
                      <i className="fas fa-star"></i> Disney+ Hotstar
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Embedded Widescreen Theater Stage */}
      {embedUrl && (
        <section className="section-container detail-trailer-section" ref={trailerRef}>
          <div className="section-title-wrap">
            <div>
              <div className="badge badge-gold mb-1">
                <i className="fas fa-clapperboard"></i> THEATRICAL PREVIEW
              </div>
              <h2 className="section-title">Official Widescreen Trailer</h2>
            </div>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              1080p / 4K UHD Direct Stream
            </span>
          </div>

          <div className="detail-theater-stage">
            <div className="detail-theater-screen">
              <iframe
                src={`${embedUrl}${embedUrl.includes('?') ? '&' : '?'}rel=0&modestbranding=1`}
                title={`${movie.title} Official Trailer`}
                className="detail-trailer-iframe"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      )}

      {/* 3. Similar Motion Pictures Carousel */}
      {similarMovies.length > 0 && (
        <section className="section-container detail-similar-section">
          <div className="section-title-wrap">
            <div>
              <div className="badge badge-cyan mb-1">
                <i className="fas fa-film"></i> MORE LIKE THIS
              </div>
              <h2 className="section-title">Similar {movie.genre} Titles</h2>
            </div>
            <Link to={`/movies?genre=${encodeURIComponent(movie.genre)}`} className="section-view-all">
              <span>View All</span>
              <i className="fas fa-arrow-right"></i>
            </Link>
          </div>

          <div className="movies-carousel-row">
            {similarMovies.map((similar) => (
              <MovieCard key={similar._id} movie={similar} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default MovieDetailPage;
