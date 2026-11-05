import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import MovieCard from '../components/MovieCard';

const FavoritesPage = () => {
  const { favorites, user } = useAuth();
  const { t } = useLanguage();

  if (!user) {
    return (
      <div className="section-container" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <i className="fas fa-heart fa-3x" style={{ color: '#e50914', marginBottom: '16px' }}></i>
        <h2>Sign In to View Your Favorites</h2>
        <p style={{ color: '#aaa', margin: '12px 0 24px' }}>
          Keep track of your top-rated and most-loved movies.
        </p>
        <Link to="/login" className="btn-primary">
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <div className="section-container">
      <div className="section-title-wrap" style={{ marginTop: '10px' }}>
        <h1 className="section-title">{t('favMovies')}</h1>
        <span style={{ color: '#aaa', fontSize: '14px' }}>
          {favorites?.length || 0} Favorited Titles
        </span>
      </div>

      {!favorites || favorites.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#888' }}>
          <i className="far fa-heart fa-3x" style={{ marginBottom: '16px', color: '#444' }}></i>
          <h3>{t('emptyFavorites')}</h3>
          <Link to="/movies" className="btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>
            Browse Movies
          </Link>
        </div>
      ) : (
        <div className="movies-grid">
          {favorites.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
