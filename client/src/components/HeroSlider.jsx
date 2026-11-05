import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { formatRating } from '../utils/helpers';

const HeroSlider = ({ featuredMovies = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    if (featuredMovies.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [featuredMovies]);

  if (!featuredMovies || featuredMovies.length === 0) return null;

  const currentMovie = featuredMovies[currentIndex] || featuredMovies[0];
  const upNextList = featuredMovies
    .filter((_, idx) => idx !== currentIndex)
    .slice(0, 3);

  return (
    <section className="hero-slider-section">
      {/* Main Slide Card */}
      <div className="hero-featured-card">
        <img
          src={currentMovie.poster}
          alt={currentMovie.title}
          className="hero-backdrop"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&auto=format&fit=crop&q=80';
          }}
        />

        <div className="hero-overlay">
          <span className="hero-tag">{currentMovie.genre} • {currentMovie.status}</span>
          <h1 className="hero-title">{currentMovie.title}</h1>

          <div className="hero-meta">
            <span><i className="fas fa-star" style={{ color: '#f5c518' }}></i> {formatRating(currentMovie.rating)}</span>
            <span><i className="fas fa-calendar-alt"></i> {currentMovie.releaseYear}</span>
            <span><i className="fas fa-clock"></i> {currentMovie.duration || '120 min'}</span>
            <span><i className="fas fa-globe"></i> {currentMovie.language}</span>
          </div>

          <p className="hero-desc">{currentMovie.description}</p>

          <div className="hero-actions">
            <button
              className="btn-primary"
              onClick={() => navigate(`/movie/${currentMovie._id}`)}
            >
              <i className="fas fa-info-circle"></i> {t('details')}
            </button>

            <button
              className="btn-danger"
              onClick={() => navigate(`/trailers`)}
            >
              <i className="fas fa-play"></i> {t('watchTrailer')}
            </button>
          </div>
        </div>
      </div>

      {/* Up Next Sidebar */}
      <div className="hero-up-next">
        <div className="up-next-header">
          <i className="fas fa-play-circle"></i>
          <span>{t('upNext')}</span>
        </div>

        <div className="up-next-list">
          {upNextList.map((movie, idx) => (
            <div
              key={movie._id || idx}
              className="up-next-item"
              onClick={() => {
                const targetIdx = featuredMovies.findIndex((m) => m._id === movie._id);
                if (targetIdx !== -1) setCurrentIndex(targetIdx);
              }}
            >
              <img
                src={movie.poster}
                alt={movie.title}
                className="up-next-thumb"
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
