import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Navbar = () => {
  const { user, isAdmin, logout, watchlist, favorites } = useAuth();
  const { language, changeLanguage, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchInputRef = useRef(null);
  const userDropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll detection for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close drawers and dropdowns on route change
  const prevPathRef = useRef(location.pathname);
  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      prevPathRef.current = location.pathname;
      const timer = setTimeout(() => {
        setMobileDrawerOpen(false);
        setUserDropdownOpen(false);
        setSearchOpen(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Hotkey: Ctrl+K or Cmd+K focuses search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setSearchOpen(false);
      setMobileDrawerOpen(false);
    }
  };

  const isNavActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header className={`ref-navbar ${isScrolled ? 'ref-navbar-scrolled' : ''}`}>
        <div className="ref-navbar-container">
          {/* Left: Brand Logo & Icon */}
          <div className="ref-nav-left">
            <button
              type="button"
              className="ref-mobile-toggle"
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              aria-label="Toggle navigation"
            >
              <i className={mobileDrawerOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
            </button>

            <Link to="/" className="ref-brand-link" aria-label="ChalChitra Home">
              <span className="ref-brand-mark">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 6.5C4 5.11929 5.11929 4 6.5 4H10.5C11.8807 4 13 5.11929 13 6.5V10.5C13 11.8807 11.8807 13 10.5 13H6.5C5.11929 13 4 11.8807 4 10.5V6.5Z" fill="url(#brandGrad1)"/>
                  <path d="M11 13.5C11 12.1193 12.1193 11 13.5 11H17.5C18.8807 11 20 12.1193 20 13.5V17.5C20 18.8807 18.8807 20 17.5 20H13.5C12.1193 20 11 18.8807 11 17.5V13.5Z" fill="url(#brandGrad2)"/>
                  <defs>
                    <linearGradient id="brandGrad1" x1="4" y1="4" x2="13" y2="13" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#F04432"/>
                      <stop offset="1" stopColor="#FF783E"/>
                    </linearGradient>
                    <linearGradient id="brandGrad2" x1="11" y1="11" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FF783E"/>
                      <stop offset="1" stopColor="#E02424"/>
                    </linearGradient>
                  </defs>
                </svg>
              </span>
              <span className="ref-brand-name">CHALCHITRA</span>
            </Link>
          </div>

          {/* Center: Clean Navigation Links */}
          <nav className="ref-nav-center">
            <Link to="/movies" className={`ref-nav-link ${isNavActive('/movies') && !location.search.includes('upcoming') ? 'active' : ''}`}>
              {t('movies')}
            </Link>
            <Link to="/webseries" className={`ref-nav-link ${isNavActive('/webseries') ? 'active' : ''}`}>
              {t('webseries')}
            </Link>
            <Link to="/movies?status=upcoming" className={`ref-nav-link ${location.search.includes('status=upcoming') ? 'active' : ''}`}>
              Originals
            </Link>
            <Link to="/movies" className="ref-nav-link">
              Categories
            </Link>
            <Link to="/trailers" className={`ref-nav-link ${isNavActive('/trailers') ? 'active' : ''}`}>
              {t('trailers')}
            </Link>
          </nav>

          {/* Right: Search, Language, Auth & Start Watching CTA */}
          <div className="ref-nav-right">
            {/* Search Box / Toggle */}
            <div className="ref-search-wrapper">
              {searchOpen ? (
                <form onSubmit={handleSearch} className="ref-search-form">
                  <i className="fas fa-search ref-search-icon"></i>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search movies & shows..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="ref-search-input"
                    autoFocus
                  />
                  <button
                    type="button"
                    className="ref-search-close"
                    onClick={() => setSearchOpen(false)}
                    aria-label="Close search"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  className="ref-icon-btn"
                  onClick={() => {
                    setSearchOpen(true);
                    setTimeout(() => searchInputRef.current?.focus(), 100);
                  }}
                  title="Search (Ctrl+K)"
                  aria-label="Open search bar"
                >
                  <i className="fas fa-search"></i>
                </button>
              )}
            </div>

            {/* Language Selector */}
            <div className="ref-lang-pills">
              <button
                type="button"
                className={`ref-lang-pill ${language === 'en' ? 'active' : ''}`}
                onClick={() => changeLanguage('en')}
                title="English"
              >
                EN
              </button>
              <button
                type="button"
                className={`ref-lang-pill ${language === 'hi' ? 'active' : ''}`}
                onClick={() => changeLanguage('hi')}
                title="Hindi"
              >
                HI
              </button>
              <button
                type="button"
                className={`ref-lang-pill ${language === 'te' ? 'active' : ''}`}
                onClick={() => changeLanguage('te')}
                title="Telugu"
              >
                TE
              </button>
            </div>

            {/* Auth: Sign In or User Menu */}
            {user ? (
              <div className="ref-user-menu-wrapper" ref={userDropdownRef}>
                <button
                  type="button"
                  className="ref-user-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  aria-expanded={userDropdownOpen}
                >
                  <div className="ref-user-avatar">
                    <i className="fas fa-user"></i>
                  </div>
                  <span className="ref-username truncate">{user.username}</span>
                  <i className="fas fa-chevron-down text-xs text-gray-400"></i>
                </button>

                {userDropdownOpen && (
                  <div className="ref-dropdown-menu">
                    <div className="ref-dropdown-header">
                      <span className="text-xs text-gray-400">Signed in as</span>
                      <span className="font-bold text-sm text-white">{user.username}</span>
                    </div>
                    <div className="ref-dropdown-divider" />
                    <Link to="/watchlist" className="ref-dropdown-item">
                      <i className="fas fa-bookmark text-[#F04432] mr-2"></i> Watchlist
                      {watchlist?.length > 0 && <span className="ref-badge ml-auto">{watchlist.length}</span>}
                    </Link>
                    <Link to="/favorites" className="ref-dropdown-item">
                      <i className="fas fa-heart text-[#F04432] mr-2"></i> Favorites
                      {favorites?.length > 0 && <span className="ref-badge ml-auto">{favorites.length}</span>}
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="ref-dropdown-item text-cyan-400">
                        <i className="fas fa-shield-halved mr-2"></i> Studio Admin
                      </Link>
                    )}
                    <div className="ref-dropdown-divider" />
                    <button type="button" className="ref-dropdown-item text-red-400 w-full text-left" onClick={logout}>
                      <i className="fas fa-sign-out-alt mr-2"></i> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="ref-signin-link">
                Sign In
              </Link>
            )}

            {/* Primary Action CTA Button: Start Watching */}
            <Link to="/movies" className="ref-cta-btn">
              Start Watching
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div className="ref-mobile-drawer-overlay" onClick={() => setMobileDrawerOpen(false)}>
          <div className="ref-mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="ref-mobile-drawer-header">
              <span className="ref-brand-name">CHALCHITRA</span>
              <button
                type="button"
                className="ref-icon-btn"
                onClick={() => setMobileDrawerOpen(false)}
                aria-label="Close menu"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <nav className="ref-mobile-nav-list">
              <Link to="/movies" className="ref-mobile-nav-item">
                <i className="fas fa-film text-[#F04432] mr-3"></i> {t('movies')}
              </Link>
              <Link to="/webseries" className="ref-mobile-nav-item">
                <i className="fas fa-tv text-[#F04432] mr-3"></i> {t('webseries')}
              </Link>
              <Link to="/movies?status=upcoming" className="ref-mobile-nav-item">
                <i className="fas fa-bolt text-[#F04432] mr-3"></i> Originals
              </Link>
              <Link to="/trailers" className="ref-mobile-nav-item">
                <i className="fas fa-play text-[#F04432] mr-3"></i> {t('trailers')}
              </Link>
              <Link to="/watchlist" className="ref-mobile-nav-item">
                <i className="fas fa-bookmark text-[#F04432] mr-3"></i> Watchlist
              </Link>
              <Link to="/favorites" className="ref-mobile-nav-item">
                <i className="fas fa-heart text-[#F04432] mr-3"></i> Favorites
              </Link>
              {isAdmin && (
                <Link to="/admin" className="ref-mobile-nav-item text-cyan-400">
                  <i className="fas fa-shield-halved mr-3"></i> Admin Control Room
                </Link>
              )}
            </nav>

            <div className="ref-mobile-drawer-footer">
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  className={`ref-lang-pill flex-1 ${language === 'en' ? 'active' : ''}`}
                  onClick={() => changeLanguage('en')}
                >
                  English
                </button>
                <button
                  type="button"
                  className={`ref-lang-pill flex-1 ${language === 'hi' ? 'active' : ''}`}
                  onClick={() => changeLanguage('hi')}
                >
                  हिन्दी
                </button>
                <button
                  type="button"
                  className={`ref-lang-pill flex-1 ${language === 'te' ? 'active' : ''}`}
                  onClick={() => changeLanguage('te')}
                >
                  తెలుగు
                </button>
              </div>

              {user ? (
                <button type="button" className="btn-outline w-full justify-center" onClick={logout}>
                  Sign Out ({user.username})
                </button>
              ) : (
                <Link to="/login" className="ref-cta-btn w-full text-center block">
                  Sign In to ChalChitra
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
