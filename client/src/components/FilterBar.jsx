import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const FilterBar = ({ filters, onFilterChange, onReset }) => {
  const { t } = useLanguage();

  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange(name, value);
  };

  return (
    <div className="filter-bar-container">
      {/* Genre Filter */}
      <div className="filter-group">
        <label>{t('genre')}:</label>
        <select
          name="genre"
          value={filters.genre || 'all'}
          onChange={handleChange}
          className="filter-select"
        >
          <option value="all">{t('allGenres')}</option>
          <option value="Sci-Fi">Sci-Fi</option>
          <option value="Action">Action</option>
          <option value="Drama">Drama</option>
          <option value="Thriller">Thriller</option>
          <option value="Comedy">Comedy</option>
          <option value="Romance">Romance</option>
          <option value="Animation">Animation</option>
        </select>
      </div>

      {/* Language Filter */}
      <div className="filter-group">
        <label>{t('language')}:</label>
        <select
          name="language"
          value={filters.language || 'all'}
          onChange={handleChange}
          className="filter-select"
        >
          <option value="all">{t('allLanguages')}</option>
          <option value="English">English</option>
          <option value="Hindi">Hindi</option>
          <option value="Telugu">Telugu</option>
        </select>
      </div>

      {/* Category / Interest */}
      <div className="filter-group">
        <label>{t('yourInterest')}:</label>
        <select
          name="type"
          value={filters.type || 'all'}
          onChange={handleChange}
          className="filter-select"
        >
          <option value="all">{t('allTypes')}</option>
          <option value="movie">{t('movies')}</option>
          <option value="webseries">{t('webseries')}</option>
          <option value="cartoon">{t('cartoons')}</option>
          <option value="short">{t('shortMovies')}</option>
        </select>
      </div>

      {/* Sort Option */}
      <div className="filter-group">
        <label>{t('sort')}:</label>
        <select
          name="sort"
          value={filters.sort || 'recent'}
          onChange={handleChange}
          className="filter-select"
        >
          <option value="recent">{t('recent')}</option>
          <option value="ratingDesc">{t('ratingDesc')}</option>
          <option value="ratingAsc">{t('ratingAsc')}</option>
          <option value="yearDesc">{t('yearDesc')}</option>
          <option value="titleAsc">{t('titleAsc')}</option>
        </select>
      </div>

      {/* Reset Button */}
      {onReset && (
        <button
          className="btn-outline"
          onClick={onReset}
          style={{ padding: '6px 12px', fontSize: '12px', marginLeft: 'auto' }}
        >
          <i className="fas fa-rotate-left"></i> Reset
        </button>
      )}
    </div>
  );
};

export default FilterBar;
