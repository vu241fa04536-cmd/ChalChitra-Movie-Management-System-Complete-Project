import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { movieService } from '../services/movieService';
import { useLanguage } from '../context/LanguageContext';
import { getEmbedUrl, formatRating } from '../utils/helpers';

const TrailersPage = () => {
  const [trailers, setTrailers] = useState([]);
  const [selectedTrailer, setSelectedTrailer] = useState(null);
  const [sortOption, setSortOption] = useState('recent');
  const [loading, setLoading] = useState(true);
  const theaterStageRef = useRef(null);
  const { t } = useLanguage();

  useEffect(() => {
    const controller = new AbortController();

    movieService
      .getAll({ sort: sortOption })
      .then((data) => {
        if (!controller.signal.aborted) {
          const valid = (data || []).filter((m) => m.trailer && m.trailer.trim() !== '');
          setTrailers(valid);
          if (valid.length > 0) {
            setSelectedTrailer((prev) => (prev ? valid.find((m) => m._id === prev._id) || valid[0] : valid[0]));
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          console.error('Error fetching trailers:', err);
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [sortOption]);

  const handleSelectTrailer = (movie) => {
    setSelectedTrailer(movie);
    if (theaterStageRef.current) {
      theaterStageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const activeEmbedUrl = selectedTrailer ? getEmbedUrl(selectedTrailer.trailer) : null;

  return (
    <div className="section-container trailers-experience-page">
      {/* 1. Theatrical Header */}
      <div className="catalog-hero-banner trailers-hero-banner">
        <div className="catalog-hero-content">
          <div className="flex items-center gap-2 mb-2">
            <span className="badge badge-gold">
              <i className="fas fa-film"></i> 4K THEATER STAGE
            </span>
            <span className="badge badge-cyan">
              <i className="fas fa-volume-high"></i> DOLBY ATMOS PREVIEWS
            </span>
          </div>
          <h1 className="catalog-title">
            {t('trailers')}
          </h1>
          <p className="catalog-subtitle">
            Experience official motion picture teasers, IMAX theatrical trailers, and exclusive first-looks in high fidelity without redirects.
          </p>
        </div>

        {/* Sort Controls */}
        <div className="trailers-sort-wrap">
          <span className="trailers-sort-label">
            <i className="fas fa-arrow-down-wide-short"></i> {t('sort')}:
          </span>
          <select
            value={sortOption}
            onChange={(e) => {
              setLoading(true);
              setSortOption(e.target.value);
            }}
            className="filter-select trailers-sort-select"
            aria-label="Sort trailers"
          >
            <option value="recent">{t('recent')}</option>
            <option value="ratingDesc">{t('ratingDesc')}</option>
            <option value="ratingAsc">{t('ratingAsc')}</option>
            <option value="titleAsc">{t('titleAsc')}</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="trailers-stage-skeleton" aria-busy="true">
          <div className="skeleton-theater-screen" />
          <div className="catalog-grid-skeleton" style={{ marginTop: '36px' }}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="skeleton-movie-card" style={{ height: '280px' }}>
                <div className="skeleton-card-poster" style={{ height: '170px' }} />
                <div className="skeleton-card-info">
                  <div className="skeleton-line" style={{ width: '60%', height: '16px' }} />
                  <div className="skeleton-line" style={{ width: '40%', height: '12px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : trailers.length === 0 ? (
        <div className="catalog-empty-card">
          <div className="empty-icon-halo">
            <i className="fas fa-video-slash"></i>
          </div>
          <h3 className="empty-title">No Trailers Available</h3>
          <p className="empty-desc">
            We are actively synchronizing official trailer streams from studio archives. Please check back shortly.
          </p>
          <Link to="/movies" className="btn-primary">
            <i className="fas fa-film"></i> Browse Movie Catalog
          </Link>
        </div>
      ) : (
        <>
          {/* 2. Cinema Projection Theater Stage (Featured Trailer) */}
          {selectedTrailer && activeEmbedUrl && (
            <div className="theater-stage-container" ref={theaterStageRef}>
              <div className="theater-stage-ambient-glow" />

              <div className="theater-screen-frame">
                <div className="theater-projector-light" />
                <div className="theater-aspect-wrapper">
                  <iframe
                    src={`${activeEmbedUrl}${activeEmbedUrl.includes('?') ? '&' : '?'}rel=0&modestbranding=1`}
                    title={`${selectedTrailer.title} - Official Trailer`}
                    className="theater-screen-iframe"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>

              {/* Theater Marquee Bar for Active Film */}
              <div className="theater-marquee-bar">
                <div className="theater-marquee-info">
                  <div className="theater-now-playing-pill">
                    <span className="blinking-dot" /> NOW SCREENING
                  </div>
                  <h2 className="theater-active-title">
                    {selectedTrailer.title}
                  </h2>
                  <div className="theater-active-meta">
                    <span className="badge badge-gold">
                      <i className="fas fa-star"></i> {formatRating(selectedTrailer.rating)}
                    </span>
                    <span className="badge">{selectedTrailer.releaseYear}</span>
                    <span className="badge">{selectedTrailer.genre}</span>
                    <span className="badge">{selectedTrailer.language}</span>
                  </div>
                </div>

                <div className="theater-marquee-actions">
                  <Link to={`/movie/${selectedTrailer._id}`} className="btn-primary">
                    <i className="fas fa-circle-info"></i> View Full Title
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* 3. Trailer Selection Grid */}
          <div className="trailer-reel-header">
            <div className="flex items-center gap-2">
              <h3 className="section-title" style={{ fontSize: '26px' }}>
                <i className="fas fa-clapperboard text-[#f5c518]"></i> ALL TRAILER REELS
              </h3>
              <span className="badge badge-cyan">{trailers.length} PREVIEWS</span>
            </div>
            <p className="trailer-reel-subtitle">
              Click any reel below to launch projection on the theater stage above.
            </p>
          </div>

          <div className="trailers-grid">
            {trailers.map((movie) => {
              const isSelected = selectedTrailer?._id === movie._id;
              const embedUrl = getEmbedUrl(movie.trailer);

              return (
                <div
                  key={movie._id}
                  className={`trailer-card ${isSelected ? 'trailer-card-active' : ''}`}
                  onClick={() => handleSelectTrailer(movie)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectTrailer(movie);
                    }
                  }}
                  aria-label={`Select trailer for ${movie.title}`}
                >
                  <div className="trailer-iframe-wrap">
                    {embedUrl ? (
                      <div className="trailer-card-preview-thumb">
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          className="trailer-thumb-img"
                          loading="lazy"
                        />
                        <div className="trailer-play-overlay">
                          <div className="trailer-play-button">
                            <i className="fas fa-play"></i>
                          </div>
                          <span className="trailer-quality-badge">4K HDR</span>
                        </div>
                      </div>
                    ) : (
                      <div className="trailer-unavailable-box">
                        <i className="fas fa-film text-gray-500"></i>
                        <span>Trailer Unavailable</span>
                      </div>
                    )}
                  </div>

                  <div className="trailer-info">
                    <div className="flex items-center justify-between mb-1">
                      <span className="badge badge-rating" style={{ fontSize: '11px', padding: '2px 8px' }}>
                        ★ {formatRating(movie.rating)}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {movie.releaseYear} • {movie.genre}
                      </span>
                    </div>

                    <h4 className="trailer-title">
                      {movie.title}
                    </h4>

                    <div className="trailer-card-footer">
                      <span className="trailer-select-hint">
                        {isSelected ? (
                          <span className="text-[#f5c518] font-bold">
                            <i className="fas fa-compact-disc fa-spin"></i> Playing on Stage
                          </span>
                        ) : (
                          <span>
                            <i className="fas fa-play text-gray-400"></i> Click to Project
                          </span>
                        )}
                      </span>
                      <Link
                        to={`/movie/${movie._id}`}
                        className="trailer-card-detail-link"
                        onClick={(e) => e.stopPropagation()}
                        title="View details"
                      >
                        <i className="fas fa-arrow-up-right-from-square"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default TrailersPage;
