import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatRating } from '../utils/helpers';

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const { toggleWatchlist, toggleFavorites, isInWatchlist, isInFavorites } = useAuth();

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

  const inWatchlist = isInWatchlist(movie._id);
  const inFavorites = isInFavorites(movie._id);

  return (
    <div className="movie-card" onClick={handleCardClick}>
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

        {/* Watchlist Bookmark Icon */}
        <button
          className={`card-bookmark-btn ${inWatchlist ? 'active' : ''}`}
          onClick={handleWatchlist}
          title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
        >
          <i className={inWatchlist ? 'fas fa-check' : 'fas fa-bookmark'}></i>
        </button>

        {/* Favorite Heart Icon */}
        <button
          className={`card-fav-btn ${inFavorites ? 'active' : ''}`}
          onClick={handleFavorites}
          title={inFavorites ? 'Remove from Favorites' : 'Add to Favorites'}
        >
          <i className={inFavorites ? 'fas fa-heart' : 'far fa-heart'}></i>
        </button>
      </div>

      <div className="movie-card-info">
        <div className="card-rating-badge">
          <i className="fas fa-star"></i>
          <span>{formatRating(movie.rating)}</span>
        </div>

        <h3 className="card-title" title={movie.title}>
          {movie.title}
        </h3>

        <div className="card-meta-line">
          <span>{movie.releaseYear}</span>
          <span className="card-type-tag">{movie.type || 'movie'}</span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
