import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const CURRENT_YEAR = new Date().getFullYear();

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="ref-footer" role="contentinfo">
      <div className="ref-footer-inner">
        {/* Main 4-Column Grid */}
        <div className="ref-footer-grid">
          {/* Column 1: Brand & Mission */}
          <div className="ref-footer-brand-col">
            <Link to="/" className="ref-footer-logo" aria-label="ChalChitra Home">
              <svg className="ref-brand-icon" width="28" height="28" viewBox="0 0 32 32" fill="none">
                <defs>
                  <linearGradient id="footerLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F04432" />
                    <stop offset="100%" stopColor="#FF783E" />
                  </linearGradient>
                </defs>
                <path
                  d="M6 8C6 6.89543 6.89543 6 8 6H16C17.1046 6 18 6.89543 18 8V16C18 17.1046 17.1046 18 16 18H8C6.89543 18 6 17.1046 6 16V8Z"
                  fill="url(#footerLogoGrad)"
                />
                <path
                  d="M14 14C14 12.8954 14.8954 12 16 12H24C25.1046 12 26 12.8954 26 14V22C26 23.1046 25.1046 24 24 24H16C14.8954 24 14 23.1046 14 22V14Z"
                  fill="url(#footerLogoGrad)"
                  fillOpacity="0.82"
                />
              </svg>
              <span className="ref-footer-brand-text">CHALCHITRA</span>
            </Link>

            <p className="ref-footer-tagline">
              The premier cinematic streaming experience. Discover timeless masterpieces, blockbuster epics, and groundbreaking series in calibrated Ultra HD.
            </p>

            <div className="ref-footer-tech-badges">
              <span className="ref-footer-pill">
                <i className="fas fa-film text-[#F04432]"></i> 4K Ultra HD
              </span>
              <span className="ref-footer-pill">
                <i className="fas fa-volume-high text-[#FF783E]"></i> Dolby Atmos
              </span>
              <span className="ref-footer-pill">
                <i className="fas fa-shield-halved text-[#F04432]"></i> DRM Protected
              </span>
            </div>
          </div>

          {/* Column 2: Discover */}
          <div className="ref-footer-col">
            <h4 className="ref-footer-col-heading">Discover</h4>
            <ul className="ref-footer-links">
              <li><Link to="/movies">{t('movies')}</Link></li>
              <li><Link to="/webseries">{t('webseries')}</Link></li>
              <li><Link to="/trailers">{t('trailers')}</Link></li>
              <li><Link to="/movies?type=cartoon">{t('cartoons')}</Link></li>
              <li><Link to="/movies?sort=ratingDesc">Top Rated</Link></li>
            </ul>
          </div>

          {/* Column 3: Cinephile Account */}
          <div className="ref-footer-col">
            <h4 className="ref-footer-col-heading">My Cinephile</h4>
            <ul className="ref-footer-links">
              <li><Link to="/watchlist">{t('watchlist')}</Link></li>
              <li><Link to="/favorites">{t('favMovies')}</Link></li>
              <li><Link to="/login">{t('signin')}</Link></li>
              <li><Link to="/admin">{t('admin')}</Link></li>
              <li><Link to="/admin/login">Admin Access</Link></li>
            </ul>
          </div>

          {/* Column 4: Platform & Support */}
          <div className="ref-footer-col">
            <h4 className="ref-footer-col-heading">Experience</h4>
            <p className="ref-footer-subtext">
              Calibrated for OLED true blacks, high dynamic range color mastering, and responsive cross-device playback.
            </p>
            <div className="ref-footer-socials">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="ref-social-btn">
                <i className="fab fa-github"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="ref-social-btn">
                <i className="fab fa-x-twitter"></i>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="ref-social-btn">
                <i className="fab fa-youtube"></i>
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" aria-label="Discord" className="ref-social-btn">
                <i className="fab fa-discord"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Status */}
        <div className="ref-footer-bottom">
          <div className="ref-footer-copy">
            © {CURRENT_YEAR} <strong className="text-white">ChalChitra</strong> Inc. All rights reserved.
          </div>
          <div className="ref-footer-status">
            <span className="ref-status-indicator" />
            <span>All Systems Operational · v2.5 Cinematic Edition</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default React.memo(Footer);
