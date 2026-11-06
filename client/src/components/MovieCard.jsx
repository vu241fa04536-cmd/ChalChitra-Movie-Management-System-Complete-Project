import React, { useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatRating } from '../utils/helpers';

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const { toggleWatchlist, toggleFavorites, isInWatchlist, isInFavorites } = useAuth();
  const cardRef = useRef(null);
  const rafId = useRef(null);

  const handleCardClick = () => {
    navigate(`/movie/${movie._id}`);
  };

  const handleWatchlist = (e) => {
    e.stopPropagation();
    toggleWatchlist(movie);
  };

  const handleFavorites = (e) => {
    e.stopPropagation();
    toggleFavorites(movie);
  };

  const handlePointerEnter = useCallback(() => {
    if (!cardRef.current) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
        !window.matchMedia('(hover: hover) and (pointer: fine)').matches)
    ) {
      return;
    }
    cardRef.current.classList.add('is-tilting');
    cardRef.current.classList.remove('is-resetting');
    cardRef.current.style.setProperty('--glare-opacity', '1');
    cardRef.current.style.setProperty('--lift-y', '-8px');
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!cardRef.current) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
        !window.matchMedia('(hover: hover) and (pointer: fine)').matches)
    ) {
      return;
    }

    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }

    const clientX = e.clientX;
    const clientY = e.clientY;

    rafId.current = requestAnimationFrame(() => {
      const card = cardRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Normalized offsets (-1 to 1)
      const normX = Math.max(-1, Math.min(1, (x - centerX) / centerX));
      const normY = Math.max(-1, Math.min(1, (y - centerY) / centerY));

      // Clamped tilt angles (max 9 degrees)
      const tiltX = (-normY * 9).toFixed(2);
      const tiltY = (normX * 9).toFixed(2);

      // Glare coordinates percentage
      const glareX = ((x / rect.width) * 100).toFixed(1);
      const glareY = ((y / rect.height) * 100).toFixed(1);

      card.style.setProperty('--tilt-x', `${tiltX}deg`);
      card.style.setProperty('--tilt-y', `${tiltY}deg`);
      card.style.setProperty('--glare-x', `${glareX}%`);
      card.style.setProperty('--glare-y', `${glareY}%`);
    });
  }, []);

  const handlePointerLeave = useCallback(() => {
    if (!cardRef.current) return;
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }

    const card = cardRef.current;
    card.classList.remove('is-tilting');
    card.classList.add('is-resetting');

    card.style.setProperty('--tilt-x', '0deg');
    card.style.setProperty('--tilt-y', '0deg');
    card.style.setProperty('--lift-y', '0px');
    card.style.setProperty('--glare-opacity', '0');
  }, []);

  const inWatchlist = isInWatchlist(movie._id);
  const inFavorites = isInFavorites(movie._id);

  return (
    <div
      ref={cardRef}
      className="movie-card"
      onClick={handleCardClick}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`View ${movie.title}, Rating ${movie.rating || 'N/A'}`}
    >
      <div className="movie-poster-wrap">
        <img
          src={movie.poster}
          alt={movie.title}
          className="movie-poster"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60';
          }}
        />

        {/* Dynamic Specular Glare Layer */}
        <div className="movie-card-glare" aria-hidden="true" />

        {/* Watchlist Bookmark Icon */}
        <button
          type="button"
          className={`card-bookmark-btn ${inWatchlist ? 'active' : ''}`}
          onClick={handleWatchlist}
          title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
          aria-label={inWatchlist ? `Remove ${movie.title} from watchlist` : `Add ${movie.title} to watchlist`}
        >
          <i className={inWatchlist ? 'fas fa-check' : 'fas fa-bookmark'}></i>
        </button>

        {/* Favorite Heart Icon */}
        <button
          type="button"
          className={`card-fav-btn ${inFavorites ? 'active' : ''}`}
          onClick={handleFavorites}
          title={inFavorites ? 'Remove from Favorites' : 'Add to Favorites'}
          aria-label={inFavorites ? `Remove ${movie.title} from favorites` : `Add ${movie.title} to favorites`}
        >
          <i className={inFavorites ? 'fas fa-heart' : 'far fa-heart'}></i>
        </button>

        {/* Cinematic Hover Reveal Sheet */}
        <div className="card-hover-reveal">
          <p className="reveal-synopsis">{movie.description || 'Experience this cinematic masterpiece in high fidelity.'}</p>
          <div className="reveal-actions">
            <span className="reveal-btn-mini">
              <i className="fas fa-play"></i> Watch
            </span>
            <span className="reveal-badge-pill">
              {movie.duration || '120 min'}
            </span>
          </div>
        </div>
      </div>

      <div className="movie-card-info">
        <div className="card-rating-badge">
          <i className="fas fa-star"></i>
          <span>{formatRating(movie.rating)}</span>
          <span className="rating-max">/10</span>
        </div>

        <h3 className="card-title" title={movie.title}>
          {movie.title}
        </h3>

        <div className="card-meta-line">
          <span className="card-year">{movie.releaseYear}</span>
          <span className="card-genre-pill">{movie.genre || 'Cinema'}</span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(MovieCard);
