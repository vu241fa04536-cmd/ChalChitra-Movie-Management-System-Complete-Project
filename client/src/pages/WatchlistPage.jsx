import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import MovieCard from '../components/MovieCard';

const WatchlistPage = () => {
  const { watchlist, user } = useAuth();
  const { t } = useLanguage();

  if (!user) {
    return (
      <div className="section-container" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <i className="fas fa-bookmark fa-3x" style={{ color: '#f5c518', marginBottom: '16px' }}></i>
        <h2>Sign In to Access Your Watchlist</h2>
        <p style={{ color: '#aaa', margin: '12px 0 24px' }}>
          Save movies and shows you want to watch later across all your devices.
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
        <h1 className="section-title">{t('watchlist')}</h1>
        <span style={{ color: '#aaa', fontSize: '14px' }}>
          {watchlist?.length || 0} Saved Titles
        </span>
      </div>

      {!watchlist || watchlist.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#888' }}>
          <i className="fas fa-folder-open fa-3x" style={{ marginBottom: '16px', color: '#444' }}></i>
          <h3>{t('emptyWatchlist')}</h3>
          <Link to="/movies" className="btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>
            Explore Movies
          </Link>
        </div>
      ) : (
        <div className="movies-grid">
          {watchlist.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WatchlistPage;
