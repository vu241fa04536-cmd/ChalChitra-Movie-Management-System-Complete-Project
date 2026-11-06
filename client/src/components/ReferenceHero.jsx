import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { formatRating } from '../utils/helpers';

// Curated flagship showpieces matching the reference UI
const FLAGSHIP_HEROES = [
  {
    _id: 'crimson-horizon',
    title: 'Crimson Horizon',
    rating: 9.1,
    genre: 'Action',
    subGenre: 'Thriller',
    type: 'movie',
    releaseYear: 2025,
    description: 'A relentless operative races against time across three continents to prevent a catastrophic global event.',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2000&auto=format&fit=crop',
  },
  {
    _id: 'neon-requiem',
    title: 'Neon Requiem',
    rating: 8.8,
    genre: 'Sci-Fi',
    subGenre: 'Drama',
    type: 'movie',
    releaseYear: 2025,
    description: 'In a rain-drenched megalopolis, an augmented detective unearths a conspiracy spanning biological cognition and artificial memory.',
    poster: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=2000&auto=format&fit=crop',
  },
  {
    _id: 'void-protocol',
    title: 'Void Protocol',
    rating: 9.4,
    genre: 'Mystery',
    subGenre: 'Thriller',
    type: 'movie',
    releaseYear: 2025,
    description: 'When deep space deep-relay signals abruptly cease, an elite exploratory crew investigates a derelict craft near a silent singularity.',
    poster: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000&auto=format&fit=crop',
  },
];

// Helper to format title into two lines for two-tone color display
const formatTitleParts = (title = '') => {
  const words = title.trim().split(' ');
  if (words.length <= 1) {
    return { first: words[0], accent: '' };
  }
  if (words.length === 2) {
    return { first: words[0], accent: words[1] };
  }
  const mid = Math.ceil(words.length / 2);
  return {
    first: words.slice(0, mid).join(' '),
    accent: words.slice(mid).join(' '),
  };
};

const ReferenceHero = ({ movies = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();

  // Combine flagship heroes with real MongoDB movies
  const heroList = useMemo(() => {
    if (!movies || movies.length === 0) {
      return FLAGSHIP_HEROES;
    }
    const additional = movies
      .filter((m) => !FLAGSHIP_HEROES.some((f) => f.title.toLowerCase() === m.title.toLowerCase()))
      .slice(0, 5);
    return [...FLAGSHIP_HEROES, ...additional];
  }, [movies]);

  const activeMovie = heroList[activeIndex] || heroList[0];

  // The 3 floating cards on the right showcase the 3 flagship titles
  const recommendationCards = useMemo(() => {
    return FLAGSHIP_HEROES.map((flagship) => ({
      ...flagship,
      targetIndex: heroList.findIndex((item) => item._id === flagship._id),
    }));
  }, [heroList]);

  // Gentle auto-advance (pauses on hover)
  useEffect(() => {
    if (heroList.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 3);
    }, 9000);
    return () => clearInterval(timer);
  }, [heroList.length, isPaused]);

  const handleSelectCard = useCallback((targetIndex) => {
    if (targetIndex >= 0) {
      setActiveIndex(targetIndex);
    }
  }, []);

  const { first: titleFirst, accent: titleAccent } = formatTitleParts(activeMovie.title);

  return (
    <div
      className="ref-hero-section"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 1. Large Cinematic Landscape Artwork Backdrop */}
      <img
        src={activeMovie.backdrop || activeMovie.poster}
        alt={activeMovie.title}
        className="ref-hero-bg-img"
        key={activeMovie._id}
      />

      {/* 2. Cinematic Gradient Vignette Overlay (Dark fade on left, smooth fade at bottom) */}
      <div className="ref-hero-overlay" />

      {/* 3. Hero Content Grid */}
      <div className="ref-hero-content-grid">
        {/* Left Column: Movie Info & CTAs */}
        <div className="ref-hero-left">
          {/* Release Badge & Metadata Row */}
          <div className="ref-hero-badge-row">
            <span className="ref-badge-release">NEW RELEASE</span>
            <div className="ref-hero-meta-inline">
              <span className="ref-meta-star"><i className="fas fa-star"></i> {formatRating(activeMovie.rating)}</span>
              <span className="ref-meta-dot">·</span>
              <span>{activeMovie.genre || 'Action'}</span>
              <span className="ref-meta-dot">·</span>
              <span>{activeMovie.subGenre || (activeMovie.type === 'webseries' ? 'TV Series' : 'Thriller')}</span>
              <span className="ref-meta-dot">·</span>
              <span>{activeMovie.releaseYear || 2025}</span>
            </div>
          </div>

          {/* Large Bold Two-Tone Title */}
          <h1 className="ref-hero-title">
            <span>{titleFirst}</span>
            {titleAccent && <span> <span className="ref-hero-title-accent">{titleAccent}</span></span>}
          </h1>

          {/* Short Description */}
          <p className="ref-hero-desc">
            {activeMovie.description || 'A relentless operative races against time across three continents to prevent a catastrophic global event.'}
          </p>

          {/* Action CTAs */}
          <div className="ref-hero-actions-row">
            <div className="ref-hero-cta-wrapper">
              <button
                type="button"
                className="ref-hero-btn-primary"
                onClick={() => {
                  if (activeMovie._id.startsWith('crimson') || activeMovie._id.startsWith('neon') || activeMovie._id.startsWith('void')) {
                    navigate('/movies');
                  } else {
                    navigate(`/movie/${activeMovie._id}`);
                  }
                }}
              >
                <i className="fas fa-play"></i> Start Watching
              </button>
              <div className="ref-hero-cta-glow" />
            </div>

            <Link to="/movies" className="ref-hero-btn-secondary">
              <i className="fas fa-book-open"></i> Browse Library
            </Link>
          </div>
        </div>

        {/* Right Column: 3 Floating Recommendation Cards Stacked Vertically */}
        <div className="ref-hero-right">
          <div className="ref-hero-cards-stack">
            {recommendationCards.map((card) => {
              const isActive = activeMovie._id === card._id;
              return (
                <div
                  key={card._id}
                  className={`ref-floating-card ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelectCard(card.targetIndex)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectCard(card.targetIndex);
                    }
                  }}
                  aria-label={`Switch hero to ${card.title}`}
                >
                  <img
                    src={card.poster}
                    alt={card.title}
                    className="ref-floating-thumb"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400';
                    }}
                  />
                  <div className="ref-floating-info">
                    <h4 className="ref-floating-title truncate">{card.title}</h4>
                    <div className="ref-floating-genre">
                      {card.genre} · {card.subGenre || (card.type === 'webseries' ? 'Series' : 'Thriller')}
                    </div>
                    <div className="ref-floating-rating">
                      <i className="fas fa-star"></i> {formatRating(card.rating)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferenceHero;
