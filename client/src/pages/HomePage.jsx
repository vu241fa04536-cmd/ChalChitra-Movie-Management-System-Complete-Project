import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { movieService } from '../services/movieService';
import { useLanguage } from '../context/LanguageContext';
import HeroSlider from '../components/HeroSlider';
import MovieCard from '../components/MovieCard';

const HomePage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await movieService.getAll();
        setMovies(data);
      } catch (err) {
        console.error('Error fetching home movies:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', color: '#f5c518' }}>
        <i className="fas fa-spinner fa-spin fa-3x"></i>
        <p style={{ marginTop: '16px', fontSize: '18px' }}>{t('loading')}</p>
      </div>
    );
  }

  const featured = movies.slice(0, 5);
  const trendingMovies = movies.filter((m) => m.type === 'movie');
  const webSeries = movies.filter((m) => m.type === 'webseries');
  const cartoons = movies.filter((m) => m.type === 'cartoon');
  const upcoming = movies.filter((m) => m.status === 'upcoming');

  return (
    <div>
      {/* Hero Slider */}
      <HeroSlider featuredMovies={featured} />

      {/* Section: Trending Movies */}
      <section className="section-container">
        <div className="section-title-wrap">
          <h2 className="section-title">{t('exploreMovies')}</h2>
          <Link to="/movies" className="section-view-all">
            {t('browseTrailer')}
          </Link>
        </div>
        <div className="movies-carousel-row">
          {trendingMovies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      </section>

      {/* Section: Web Series */}
      {webSeries.length > 0 && (
        <section className="section-container">
          <div className="section-title-wrap">
            <h2 className="section-title">{t('webseries')}</h2>
            <Link to="/webseries" className="section-view-all">
              View All &gt;
            </Link>
          </div>
          <div className="movies-carousel-row">
            {webSeries.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </section>
      )}

      {/* Section: Cartoons & Animation */}
      {cartoons.length > 0 && (
        <section className="section-container">
          <div className="section-title-wrap">
            <h2 className="section-title">{t('cartoons')}</h2>
            <Link to="/movies?type=cartoon" className="section-view-all">
              View All &gt;
            </Link>
          </div>
          <div className="movies-carousel-row">
            {cartoons.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </section>
      )}

      {/* Section: Upcoming Movies */}
      {upcoming.length > 0 && (
        <section className="section-container">
          <div className="section-title-wrap">
            <h2 className="section-title">{t('upcomingMovies')}</h2>
          </div>
          <div className="movies-carousel-row">
            {upcoming.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;

