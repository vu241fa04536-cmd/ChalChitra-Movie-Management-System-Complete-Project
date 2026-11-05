import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Navbar = () => {
  const { user, isAdmin, logout, adminLogout, watchlist } = useAuth();
  const { language, changeLanguage, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  return (
    <header className="navbar">
      <div className="nav-left">
        <Link to="/" className="logo">
          <i className="fas fa-film"></i>
          <span>{t('brand')}</span>
        </Link>

        {/* Menu Dropdown */}
        <div className="menu-dropdown">
          <button className="menu-btn" onClick={() => setShowMenu(!showMenu)}>
            <i className="fas fa-bars"></i>
            <span>{t('menu')}</span>
            <i className="fas fa-caret-down"></i>
          </button>

          {showMenu && (
            <div className="menu-menu" onClick={() => setShowMenu(false)}>
              <Link to="/movies">
                <i className="fas fa-clapperboard"></i> {t('movies')}
              </Link>
              <Link to="/webseries">
                <i className="fas fa-tv"></i> {t('webseries')}
              </Link>
              <Link to="/trailers">
                <i className="fas fa-play-circle"></i> {t('trailers')}
              </Link>
              <Link to="/movies?type=cartoon">
                <i className="fas fa-child"></i> {t('cartoons')}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="nav-center">
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            className="search-input"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="search-btn">
            <i className="fas fa-search"></i>
          </button>
        </form>
      </div>

      {/* Nav Right */}
      <div className="nav-right">
        {/* Language Selector */}
        <div className="lang-selector">
          <button
            className={`lang-btn ${language === 'en' ? 'active' : ''}`}
            onClick={() => changeLanguage('en')}
          >
            EN
          </button>
          <button
            className={`lang-btn ${language === 'hi' ? 'active' : ''}`}
            onClick={() => changeLanguage('hi')}
          >
            हिन्दी
          </button>
          <button
            className={`lang-btn ${language === 'te' ? 'active' : ''}`}
            onClick={() => changeLanguage('te')}
          >
            తెలుగు
          </button>
        </div>

        {/* Watchlist & Favorites Links */}
        <Link to="/watchlist" className="nav-link">
          <i className="fas fa-bookmark"></i>
          <span>{t('watchlist')}</span>
          {watchlist?.length > 0 && (
            <span className="nav-link-badge">{watchlist.length}</span>
          )}
        </Link>

        <Link to="/favorites" className="nav-link">
          <i className="fas fa-heart" style={{ color: '#e50914' }}></i>
          <span>{t('favMovies')}</span>
        </Link>

        {/* User Account / Sign In */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#f5c518' }}>
              <i className="fas fa-user-circle"></i> {user.username}
            </span>
            <button className="btn-outline" onClick={logout} style={{ padding: '5px 12px', fontSize: '12px' }}>
              {t('signout')}
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn-primary">
            <i className="fas fa-sign-in-alt"></i>
            <span>{t('signin')}</span>
          </Link>
        )}

        {/* Admin Link / Badge */}
        {isAdmin ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link to="/admin" className="btn-primary" style={{ background: '#28a745', color: '#fff' }}>
              <i className="fas fa-shield-alt"></i> Dashboard
            </Link>
            <button className="btn-danger" onClick={adminLogout} style={{ padding: '6px 12px', fontSize: '12px' }}>
              {t('logout')}
            </button>
          </div>
        ) : (
          <Link to="/admin" className="nav-link" style={{ color: '#aaa', fontSize: '13px' }}>
            <i className="fas fa-lock"></i> {t('admin')}
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
