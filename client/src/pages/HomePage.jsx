import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { movieService } from '../services/movieService';
import ReferenceHero from '../components/ReferenceHero';
import FeaturesStrip from '../components/FeaturesStrip';
import MovieCard from '../components/MovieCard';

// Popular Categories matching the reference screenshot
const POPULAR_CATEGORIES = [
  { key: 'Action', label: 'Action', icon: 'fas fa-clapperboard' },
  { key: 'Drama', label: 'Drama', icon: 'fas fa-masks-theater' },
  { key: 'Sci-Fi', label: 'Sci-Fi', icon: 'fas fa-atom' },
  { key: 'Comedy', label: 'Comedy', icon: 'fas fa-face-smile' },
  { key: 'Thriller', label: 'Thriller', icon: 'fas fa-eye' },
  { key: 'Animation', label: 'Animation', icon: 'fas fa-wand-magic-sparkles' },
];

const HomePage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Action');
  const [trendingIndex, setTrendingIndex] = useState(0);
  const trendingRowRef = useRef(null);
  const navigate = useNavigate();

  const loadMovies = useCallback(() => {
    setLoading(true);
    setError(null);
    movieService
      .getAll()
      .then((data) => {
        setMovies(data || []);
      })
      .catch((err) => {
        console.error('Error fetching home movies:', err);
        setError(err.message || 'Unable to connect to the ChalChitra streaming API');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let ignore = false;
    movieService
      .getAll()
      .then((data) => {
        if (!ignore) {
          setMovies(data || []);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error('Error fetching home movies:', err);
          setError(err.message || 'Unable to connect to the ChalChitra streaming API');
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const scrollTrending = (direction) => {
    if (!trendingRowRef.current) return;
    const scrollAmount = direction === 'left' ? -420 : 420;
    trendingRowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    setTrendingIndex((prev) => (direction === 'left' ? Math.max(0, prev - 1) : Math.min(2, prev + 1)));
  };

  if (loading) {
    return (
      <div className="ref-home-skeleton-wrapper" aria-busy="true">
        <div className="ref-skeleton-hero" />
        <div className="ref-skeleton-features" />
        <div className="ref-skeleton-section" />
      </div>
    );
  }

  // Filter lists based on real data
  const trendingList = movies.slice(0, 10);
  const categoryMovies = movies.filter((m) => {
    const genreMatch = (m.genre || '').toLowerCase() === activeCategory.toLowerCase();
    if (activeCategory === 'Animation') {
      return genreMatch || m.type === 'cartoon';
    }
    return genreMatch;
  });
  const topRatedMovies = [...movies].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 8);
  const webSeries = movies.filter((m) => m.type === 'webseries');

  return (
    <div className="ref-home-container">
      {/* 1. Large Cinematic Landscape Hero with Floating Recommendation Cards */}
      <ReferenceHero movies={movies} />

      {/* 2. Streaming Features Strip (10,000+ Movies, 4K HDR, Any Device, Offline) */}
      <FeaturesStrip />

      {/* Network / Connection Alert if backend is unreachable */}
      {error && movies.length === 0 && (
        <div className="ref-api-error-banner" role="alert" style={{
          margin: '24px auto',
          maxWidth: '1360px',
          padding: '16px 24px',
          background: 'rgba(240, 68, 50, 0.1)',
          border: '1px solid rgba(240, 68, 50, 0.3)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}>
          <div className="flex items-center gap-3">
            <i className="fas fa-circle-exclamation text-[#F04432] text-lg"></i>
            <span className="text-sm text-gray-300">
              {error}. Verify that the backend server is listening on port 5000 or your configured API URL.
            </span>
          </div>
          <button
            type="button"
            onClick={loadMovies}
            style={{
              padding: '6px 16px',
              borderRadius: '9999px',
              background: '#F04432',
              color: '#FFF',
              fontSize: '12px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <i className="fas fa-rotate-right mr-1"></i> Retry
          </button>
        </div>
      )}

      {/* 3. Trending Now Horizontal Movie Showcase */}
      <section className="ref-trending-section" aria-label="Trending Now">
        <div className="ref-section-header">
          <h2 className="ref-section-title">Trending Now</h2>

          <div className="ref-carousel-arrows">
            <button
              type="button"
              className="ref-arrow-btn"
              onClick={() => scrollTrending('left')}
              aria-label="Scroll trending left"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <button
              type="button"
              className="ref-arrow-btn"
              onClick={() => scrollTrending('right')}
              aria-label="Scroll trending right"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        <div className="ref-trending-carousel" ref={trendingRowRef}>
          {trendingList.map((movie) => (
            <div
              key={movie._id}
              className="ref-movie-poster-card"
              onClick={() => navigate(`/movie/${movie._id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/movie/${movie._id}`);
                }
              }}
              aria-label={`View ${movie.title}`}
            >
              <div className="ref-poster-frame">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="ref-poster-img"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400';
                  }}
                />
              </div>

              <div className="ref-card-details">
                <h3 className="ref-card-title truncate" title={movie.title}>
                  {movie.title}
                </h3>
                <div className="ref-card-meta">
                  {movie.genre || 'Action'} · {movie.type === 'webseries' ? 'Series' : 'Feature'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Minimal Pagination Dots */}
        <div className="ref-carousel-dots" aria-hidden="true">
          <span className={`ref-dot ${trendingIndex === 0 ? 'active' : ''}`} />
          <span className={`ref-dot ${trendingIndex === 1 ? 'active' : ''}`} />
          <span className={`ref-dot ${trendingIndex === 2 ? 'active' : ''}`} />
        </div>
      </section>

      {/* 4. Popular Categories Section */}
      <section className="ref-categories-section" aria-label="Popular Categories">
        <h2 className="ref-section-title">Popular Categories</h2>

        <div className="ref-categories-grid">
          {POPULAR_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <div
                key={cat.key}
                className={`ref-category-tile ${isActive ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.key)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveCategory(cat.key);
                  }
                }}
                aria-label={`Filter by ${cat.label}`}
              >
                <div className="ref-category-icon">
                  <i className={cat.icon}></i>
                </div>
                <div className="ref-category-label">{cat.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Category-Filtered Movies or Top Rated Collection */}
      <section className="ref-category-results-section" aria-label={`${activeCategory} Titles`}>
        <div className="ref-section-header">
          <div className="flex items-center gap-3">
            <h2 className="ref-section-title">{activeCategory} Titles</h2>
            <span className="ref-badge-count">{categoryMovies.length} Available</span>
          </div>

          <Link to={`/movies?genre=${encodeURIComponent(activeCategory)}`} className="ref-view-all-link">
            <span>View All {activeCategory}</span>
            <i className="fas fa-chevron-right ml-1"></i>
          </Link>
        </div>

        {categoryMovies.length > 0 ? (
          <div className="ref-standard-grid">
            {categoryMovies.slice(0, 6).map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="ref-empty-genre-box">
            <p className="text-gray-400 text-sm">No titles found in {activeCategory}. Exploring our full catalog below.</p>
          </div>
        )}
      </section>

      {/* 6. Top Rated Masterpieces */}
      <section className="ref-category-results-section" aria-label="Top Rated Movies">
        <div className="ref-section-header">
          <div className="flex items-center gap-3">
            <h2 className="ref-section-title">Top Rated Motion Pictures</h2>
            <span className="ref-badge-count">{topRatedMovies.length} Masterpieces</span>
          </div>

          <Link to="/movies?sort=ratingDesc" className="ref-view-all-link">
            <span>Explore All</span>
            <i className="fas fa-chevron-right ml-1"></i>
          </Link>
        </div>

        <div className="ref-standard-grid">
          {topRatedMovies.slice(0, 6).map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      </section>

      {/* 7. Web Series Sagas (if available) */}
      {webSeries.length > 0 && (
        <section className="ref-category-results-section" aria-label="Web Series Sagas">
          <div className="ref-section-header">
            <div className="flex items-center gap-3">
              <h2 className="ref-section-title">Serialized TV Sagas</h2>
              <span className="ref-badge-count">{webSeries.length} Series</span>
            </div>

            <Link to="/webseries" className="ref-view-all-link">
              <span>View All Series</span>
              <i className="fas fa-chevron-right ml-1"></i>
            </Link>
          </div>

          <div className="ref-standard-grid">
            {webSeries.slice(0, 6).map((item) => (
              <MovieCard key={item._id} movie={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
