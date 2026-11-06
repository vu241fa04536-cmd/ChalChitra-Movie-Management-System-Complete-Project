import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { formatRating } from '../utils/helpers';

const HeroSlider = ({ featuredMovies = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });
  const navigate = useNavigate();
  const { t } = useLanguage();
  const heroRef = useRef(null);

  // Subscribe to changes in prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const listener = (e) => setPrefersReducedMotion(e.matches);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(listener);
      return () => mediaQuery.removeListener(listener);
    }
  }, []);

  // IntersectionObserver to pause when outside viewport
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInView(entry.isIntersecting);
        });
      },
      { threshold: 0.25 }
    );

    const el = heroRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
      observer.disconnect();
    };
  }, []);

  // Auto-slide interval with pause guards and proper cleanup
  useEffect(() => {
    if (featuredMovies.length <= 1 || isPaused || !isInView || prefersReducedMotion) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [featuredMovies.length, isPaused, isInView, prefersReducedMotion]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length);
  }, [featuredMovies.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
  }, [featuredMovies.length]);

  if (!featuredMovies || featuredMovies.length === 0) return null;

  const currentMovie = featuredMovies[currentIndex] || featuredMovies[0];
  const upNextList = featuredMovies
    .map((movie, originalIndex) => ({ ...movie, originalIndex }))
    .filter((_, idx) => idx !== currentIndex)
    .slice(0, 3);

  return (
    <section
      ref={heroRef}
      className="hero-slider-section"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured Movies Carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      {/* Main Slide Card */}
      <div className="hero-featured-card">
        {/* Render stacked slides for seamless crossfade */}
        {featuredMovies.map((movie, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={movie._id || index}
              className={`hero-slide ${isActive ? 'hero-slide-active' : ''}`}
              aria-hidden={!isActive}
            >
              <img
                src={movie.poster}
                alt={movie.title}
                className="hero-backdrop"
                loading={index === 0 ? 'eager' : 'lazy'}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&auto=format&fit=crop&q=80';
                }}
              />
            </div>
          );
        })}

        {/* Ambient Overlay & Movie Details */}
        <div className="hero-overlay">
          <span className="hero-tag">
            {currentMovie.genre} • {currentMovie.status || 'Streaming'}
          </span>

          <h1 className="hero-title">{currentMovie.title}</h1>

          <div className="hero-meta">
            <span>
              <i className="fas fa-star" style={{ color: 'var(--accent-color)' }}></i> {formatRating(currentMovie.rating)}
            </span>
            <span>
              <i className="fas fa-calendar-alt"></i> {currentMovie.releaseYear}
            </span>
            <span>
              <i className="fas fa-clock"></i> {currentMovie.duration || '120 min'}
            </span>
            <span>
              <i className="fas fa-globe"></i> {currentMovie.language}
            </span>
          </div>

          <p className="hero-desc">{currentMovie.description}</p>

          <div className="hero-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate(`/movie/${currentMovie._id}`)}
              aria-label={`View details for ${currentMovie.title}`}
            >
              <i className="fas fa-info-circle"></i> {t('details')}
            </button>

            <button
              type="button"
              className="btn-danger"
              onClick={() => navigate(`/trailers`)}
              aria-label={`Watch trailer for ${currentMovie.title}`}
            >
              <i className="fas fa-play"></i> {t('watchTrailer')}
            </button>
          </div>
        </div>

        {/* Accessible Carousel Navigation Controls */}
        {featuredMovies.length > 1 && (
          <div className="hero-slider-controls">
            <button
              type="button"
              className="hero-nav-btn prev"
              onClick={handlePrev}
              aria-label="Previous slide"
              title="Previous slide"
            >
              <i className="fas fa-chevron-left" aria-hidden="true"></i>
            </button>
            <div className="hero-pagination-dots" role="tablist" aria-label="Slide indicators">
              {featuredMovies.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  role="tab"
                  className={`hero-dot ${dotIdx === currentIndex ? 'active' : ''}`}
                  onClick={() => setCurrentIndex(dotIdx)}
                  aria-label={`Go to slide ${dotIdx + 1}`}
                  aria-selected={dotIdx === currentIndex}
                />
              ))}
            </div>
            <button
              type="button"
              className="hero-nav-btn next"
              onClick={handleNext}
              aria-label="Next slide"
              title="Next slide"
            >
              <i className="fas fa-chevron-right" aria-hidden="true"></i>
            </button>
          </div>
        )}
      </div>

      {/* Up Next Sidebar */}
      <div className="hero-up-next">
        <div className="up-next-header">
          <i className="fas fa-play-circle"></i>
          <span>{t('upNext')}</span>
        </div>

        <div className="up-next-list">
          {upNextList.map((movie) => (
            <div
              key={movie._id || movie.originalIndex}
              className="up-next-item"
              onClick={() => setCurrentIndex(movie.originalIndex)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setCurrentIndex(movie.originalIndex);
                }
              }}
              aria-label={`Switch hero to ${movie.title}`}
            >
              <img
                src={movie.poster}
                alt={movie.title}
                className="up-next-thumb"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60';
                }}
              />
              <div className="up-next-info">
                <h4 className="up-next-title">{movie.title}</h4>
                <div className="up-next-meta">
                  <span>★ {formatRating(movie.rating)}</span>
                  <span>{movie.releaseYear}</span>
                  <span>{movie.genre}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;
