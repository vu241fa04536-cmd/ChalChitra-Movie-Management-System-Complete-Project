import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const GENRES = [
  'all',
  'Sci-Fi',
  'Action',
  'Drama',
  'Thriller',
  'Comedy',
  'Romance',
  'Animation',
];

const FilterBar = ({ filters = {}, onFilterChange, onReset }) => {
  const { t } = useLanguage();

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    onFilterChange(name, value);
  };

  const handleGenrePill = (genre) => {
    onFilterChange('genre', genre);
  };

  const activeGenre = filters.genre || 'all';

  return (
    <div className="filter-console-card">
      {/* 1. Quick Genre Filter Pills */}
      <div className="filter-pills-row" role="tablist" aria-label="Genre quick filters">
        {GENRES.map((genre) => {
          const isActive = activeGenre === genre;
          return (
            <button
              key={genre}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`filter-pill-btn ${isActive ? 'active' : ''}`}
              onClick={() => handleGenrePill(genre)}
            >
              {genre === 'all' ? (
                <>
                  <i className="fas fa-layer-group"></i>
                  <span>{t('allGenres')}</span>
                </>
              ) : (
                <span>{genre}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* 2. Controls Grid */}
      <div className="filter-controls-grid">
        {/* Language Filter */}
        <div className="filter-field-wrap">
          <label className="filter-field-label">
            <i className="fas fa-globe text-cyan-400"></i>
            <span>{t('language')}</span>
          </label>
          <div className="filter-select-wrapper">
            <select
              name="language"
              value={filters.language || 'all'}
              onChange={handleSelectChange}
              className="filter-select-glass"
              aria-label="Filter by language"
            >
              <option value="all">{t('allLanguages')}</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Telugu">Telugu</option>
            </select>
            <i className="fas fa-chevron-down select-chevron" aria-hidden="true"></i>
          </div>
        </div>

        {/* Category / Interest */}
        <div className="filter-field-wrap">
          <label className="filter-field-label">
            <i className="fas fa-film text-[#f5c518]"></i>
            <span>{t('yourInterest')}</span>
          </label>
          <div className="filter-select-wrapper">
            <select
              name="type"
              value={filters.type || 'all'}
              onChange={handleSelectChange}
              className="filter-select-glass"
              aria-label="Filter by category"
            >
              <option value="all">{t('allTypes')}</option>
              <option value="movie">{t('movies')}</option>
              <option value="webseries">{t('webseries')}</option>
              <option value="cartoon">{t('cartoons')}</option>
              <option value="short">{t('shortMovies')}</option>
            </select>
            <i className="fas fa-chevron-down select-chevron" aria-hidden="true"></i>
          </div>
        </div>

        {/* Sort Option */}
        <div className="filter-field-wrap">
          <label className="filter-field-label">
            <i className="fas fa-arrow-down-wide-short text-amber-400"></i>
            <span>{t('sort')}</span>
          </label>
          <div className="filter-select-wrapper">
            <select
              name="sort"
              value={filters.sort || 'recent'}
              onChange={handleSelectChange}
              className="filter-select-glass"
              aria-label="Sort movies"
            >
              <option value="recent">{t('recent')}</option>
              <option value="ratingDesc">{t('ratingDesc')}</option>
              <option value="ratingAsc">{t('ratingAsc')}</option>
              <option value="yearDesc">{t('yearDesc')}</option>
              <option value="titleAsc">{t('titleAsc')}</option>
            </select>
            <i className="fas fa-chevron-down select-chevron" aria-hidden="true"></i>
          </div>
        </div>

        {/* Reset Filter Button */}
        {onReset && (
          <div className="filter-reset-wrap">
            <button
              type="button"
              className="btn-outline btn-reset"
              onClick={onReset}
              title="Reset all filters"
            >
              <i className="fas fa-rotate-left"></i>
              <span>Reset</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(FilterBar);
