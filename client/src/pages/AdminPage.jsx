import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { movieService } from '../services/movieService';

const initialForm = {
  title: '',
  genre: 'Action',
  language: 'English',
  releaseYear: new Date().getFullYear(),
  rating: 8.0,
  duration: '120 min',
  description: '',
  poster: '',
  trailer: '',
  status: 'released',
  type: 'movie',
  watchLinks: {
    youtube: 'https://www.youtube.com',
    netflix: 'https://www.netflix.com',
    hotstar: 'https://www.hotstar.com',
  },
};

const AdminPage = () => {
  const { isAdmin, adminLogin, adminLogout } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [movies, setMovies] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchAdminMovies = useCallback(async () => {
    setLoading(true);
    try {
      const data = await movieService.getAll();
      setMovies(data || []);
    } catch (err) {
      console.error('Error loading admin movies:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    const controller = new AbortController();
    movieService.getAll()
      .then((data) => {
        if (!controller.signal.aborted) {
          setMovies(data || []);
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          console.error('Error loading admin movies:', err);
        }
      });

    return () => {
      controller.abort();
    };
  }, [isAdmin]);

  const handleAdminAuth = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      await adminLogin(password);
      setPassword('');
    } catch (err) {
      setLoginError(err.message || 'Invalid admin security credentials!');
    }
  };

  // Open modal for Create
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(initialForm);
    setFormError('');
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (movie) => {
    setEditingId(movie._id);
    setFormData({
      title: movie.title || '',
      genre: movie.genre || 'Action',
      language: movie.language || 'English',
      releaseYear: movie.releaseYear || new Date().getFullYear(),
      rating: movie.rating || 0,
      duration: movie.duration || '120 min',
      description: movie.description || '',
      poster: movie.poster || '',
      trailer: movie.trailer || '',
      status: movie.status || 'released',
      type: movie.type || 'movie',
      watchLinks: movie.watchLinks || {
        youtube: 'https://www.youtube.com',
        netflix: 'https://www.netflix.com',
        hotstar: 'https://www.hotstar.com',
      },
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('watch_')) {
      const provider = name.replace('watch_', '');
      setFormData((prev) => ({
        ...prev,
        watchLinks: { ...prev.watchLinks, [provider]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.description || !formData.description.trim()) {
      setFormError('Movie description / synopsis is required.');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await movieService.update(editingId, formData);
      } else {
        await movieService.create(formData);
      }
      setIsModalOpen(false);
      fetchAdminMovies();
    } catch (err) {
      setFormError(err.message || 'Failed to save movie');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to permanently delete "${title}" from the database?`)) {
      try {
        await movieService.delete(id);
        setMovies((prev) => prev.filter((m) => m._id !== id));
      } catch (err) {
        alert(`Failed to delete: ${err.message}`);
      }
    }
  };

  // If NOT logged in as Admin, show Security Screen
  if (!isAdmin) {
    return (
      <div className="admin-login-screen">
        <div className="admin-auth-glow" />
        <div className="auth-card admin-auth-card">
          <div className="admin-auth-badge-wrap">
            <span className="badge badge-gold">
              <i className="fas fa-shield-halved"></i> RESTRICTED CLEARANCE
            </span>
          </div>

          <div className="auth-brand-header" style={{ marginBottom: '24px' }}>
            <div className="auth-brand-logo" style={{ borderColor: 'rgba(245, 197, 24, 0.5)' }}>
              <span className="auth-logo-icon">
                <i className="fas fa-user-shield"></i>
              </span>
            </div>
            <h1 className="auth-brand-title">STUDIO ARCHITECT</h1>
            <p className="auth-brand-subtitle">
              Enter authorized personnel encryption key to manage MongoDB collections.
            </p>
          </div>

          {loginError && (
            <div className="auth-error-banner" role="alert">
              <i className="fas fa-triangle-exclamation auth-error-icon"></i>
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminAuth} className="auth-form">
            <div className="form-field">
              <label htmlFor="admin-security-key">
                <i className="fas fa-key text-gray-400 mr-1"></i> Studio Master Key
              </label>
              <div className="auth-input-wrapper">
                <input
                  id="admin-security-key"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter admin password (ranjna@123)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary auth-submit-btn">
              <i className="fas fa-unlock mr-2"></i> Unlock Studio Console
            </button>
          </form>

          <div className="admin-demo-key-hint">
            <span>Demo Master Key: <code>ranjna@123</code></span>
            <button
              type="button"
              className="admin-fill-key-btn"
              onClick={() => {
                setPassword('ranjna@123');
                setLoginError('');
              }}
            >
              Autofill
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filtered movies in table
  const displayedMovies = movies.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      m.genre.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (m.language && m.language.toLowerCase().includes(searchFilter.toLowerCase()));
    const matchesType = typeFilter === 'all' || m.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalTitles = movies.length;
  const movieCount = movies.filter((m) => m.type === 'movie' || !m.type).length;
  const seriesCount = movies.filter((m) => m.type === 'webseries').length;
  const upcomingCount = movies.filter((m) => m.status === 'upcoming').length;

  return (
    <div className="admin-panel-screen">
      <div className="admin-container">
        {/* Command Header with Actions */}
        <div className="admin-command-header">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-gold">
                <i className="fas fa-terminal"></i> STUDIO ARCHITECT CONSOLE
              </span>
              <span className="badge badge-cyan">
                <span className="blinking-dot" /> LIVE MONGODB
              </span>
            </div>
            <h1 className="admin-heading">
              Studio Control Center
            </h1>
            <p className="admin-subheading">
              Real-time database operations, media asset staging, and catalog lifecycle management.
            </p>
          </div>

          <div className="admin-header-actions">
            <button type="button" className="btn-primary" onClick={handleOpenAdd}>
              <i className="fas fa-plus-circle"></i> Add New Motion Picture
            </button>
            <button type="button" className="btn-outline admin-logout-btn" onClick={adminLogout}>
              <i className="fas fa-sign-out-alt"></i> Exit Console
            </button>
          </div>
        </div>

        {/* Live Statistics Cards */}
        <div className="admin-stats-row">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-database"></i>
            </div>
            <div>
              <div className="stat-value">{totalTitles}</div>
              <div className="stat-label">Total Titles in Archive</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.12)', borderColor: 'rgba(6, 182, 212, 0.3)', color: '#06b6d4' }}>
              <i className="fas fa-film"></i>
            </div>
            <div>
              <div className="stat-value" style={{ color: '#06b6d4' }}>{movieCount}</div>
              <div className="stat-label">Feature Films</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(229, 9, 20, 0.12)', borderColor: 'rgba(229, 9, 20, 0.3)', color: '#e50914' }}>
              <i className="fas fa-tv"></i>
            </div>
            <div>
              <div className="stat-value" style={{ color: '#e50914' }}>{seriesCount}</div>
              <div className="stat-label">Web Series Sagas</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-clock"></i>
            </div>
            <div>
              <div className="stat-value">{upcomingCount}</div>
              <div className="stat-label">Upcoming Premieres</div>
            </div>
          </div>
        </div>

        {/* Table Filter & Search Toolbar */}
        <div className="admin-toolbar-row">
          <div className="admin-search-wrapper">
            <i className="fas fa-search admin-search-icon"></i>
            <input
              type="text"
              placeholder="Filter by title, genre, or audio language..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="admin-search-input"
            />
            {searchFilter && (
              <button
                type="button"
                className="admin-search-clear"
                onClick={() => setSearchFilter('')}
                aria-label="Clear filter"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>

          <div className="admin-filter-type-group">
            <button
              type="button"
              className={`admin-type-pill ${typeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setTypeFilter('all')}
            >
              All ({totalTitles})
            </button>
            <button
              type="button"
              className={`admin-type-pill ${typeFilter === 'movie' ? 'active' : ''}`}
              onClick={() => setTypeFilter('movie')}
            >
              Movies ({movieCount})
            </button>
            <button
              type="button"
              className={`admin-type-pill ${typeFilter === 'webseries' ? 'active' : ''}`}
              onClick={() => setTypeFilter('webseries')}
            >
              Series ({seriesCount})
            </button>
          </div>

          <span className="admin-count-indicator">
            Displaying <strong>{displayedMovies.length}</strong> of {movies.length} titles
          </span>
        </div>

        {/* Spatial Administrative Data Table */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '70px' }}>Poster</th>
                <th>Title</th>
                <th>Category</th>
                <th>Genre</th>
                <th>Language</th>
                <th>Year</th>
                <th>Rating</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '50px 20px', color: '#f5c518' }}>
                    <i className="fas fa-spinner fa-spin fa-2x"></i>
                    <p style={{ marginTop: '12px' }}>Synchronizing with MongoDB collection...</p>
                  </td>
                </tr>
              ) : displayedMovies.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '50px 20px', color: '#888' }}>
                    <i className="fas fa-film fa-2x" style={{ marginBottom: '10px', color: '#444' }}></i>
                    <p>No matching motion picture records found.</p>
                  </td>
                </tr>
              ) : (
                displayedMovies.map((movie) => (
                  <tr key={movie._id} className="admin-table-row">
                    <td>
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="table-thumb"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400';
                        }}
                      />
                    </td>
                    <td>
                      <div className="table-movie-title">{movie.title}</div>
                      <div className="table-movie-sub">{movie.duration || '120 min'}</div>
                    </td>
                    <td>
                      <span className="badge badge-category">
                        {movie.type || 'movie'}
                      </span>
                    </td>
                    <td>{movie.genre}</td>
                    <td>{movie.language}</td>
                    <td>{movie.releaseYear}</td>
                    <td>
                      <span className="table-rating-pill">
                        ★ {movie.rating}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${movie.status === 'upcoming' ? 'badge-cyan' : 'badge-green'}`} style={{ textTransform: 'uppercase' }}>
                        {movie.status || 'released'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="action-btn-edit"
                          onClick={() => handleOpenEdit(movie)}
                          title="Edit movie record"
                        >
                          <i className="fas fa-pen-to-square"></i> Edit
                        </button>
                        <button
                          type="button"
                          className="action-btn-del"
                          onClick={() => handleDelete(movie._id, movie.title)}
                          title="Delete movie record"
                        >
                          <i className="fas fa-trash-can"></i> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal Dialog */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="badge badge-gold mb-1">
                  <i className="fas fa-database"></i> METADATA EDITOR
                </span>
                <h3 style={{ margin: 0 }}>
                  {editingId ? `Edit Title: ${formData.title || 'Untitled'}` : 'Stage New Title to Catalog'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="modal-close-btn"
                aria-label="Close dialog"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {formError && (
              <div className="auth-error-banner" style={{ marginBottom: '16px' }}>
                <i className="fas fa-circle-exclamation auth-error-icon"></i>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="admin-modal-form">
              {/* Poster Live Preview Strip */}
              {formData.poster && (
                <div className="admin-poster-preview-strip">
                  <img
                    src={formData.poster}
                    alt="Poster Preview"
                    className="admin-preview-thumb"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="admin-preview-text">
                    <span className="text-xs text-gray-400">POSTER PREVIEW</span>
                    <h4 className="text-sm font-bold text-white">{formData.title || 'Title Preview'}</h4>
                    <span className="text-xs text-[#f5c518]">
                      {formData.releaseYear} • {formData.genre} • ★ {formData.rating}
                    </span>
                  </div>
                </div>
              )}

              <div className="form-grid-2">
                <div className="form-field">
                  <label>Title *</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="e.g. Oppenheimer"
                    value={formData.title}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Category (Type) *</label>
                  <select name="type" value={formData.type} onChange={handleFormChange}>
                    <option value="movie">Movie</option>
                    <option value="webseries">Web Series</option>
                    <option value="cartoon">Cartoon</option>
                    <option value="short">Short Film</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-field">
                  <label>Genre *</label>
                  <select name="genre" value={formData.genre} onChange={handleFormChange}>
                    <option value="Action">Action</option>
                    <option value="Sci-Fi">Sci-Fi</option>
                    <option value="Drama">Drama</option>
                    <option value="Thriller">Thriller</option>
                    <option value="Comedy">Comedy</option>
                    <option value="Romance">Romance</option>
                    <option value="Animation">Animation</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Language *</label>
                  <select name="language" value={formData.language} onChange={handleFormChange}>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Telugu">Telugu</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-field">
                  <label>Release Year *</label>
                  <input
                    type="number"
                    name="releaseYear"
                    value={formData.releaseYear}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Rating (0.0 to 10.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    name="rating"
                    value={formData.rating}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-field">
                  <label>Duration</label>
                  <input
                    type="text"
                    name="duration"
                    placeholder="e.g. 148 min"
                    value={formData.duration}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-field">
                  <label>Status</label>
                  <select name="status" value={formData.status} onChange={handleFormChange}>
                    <option value="released">Released</option>
                    <option value="upcoming">Upcoming</option>
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label>Poster Image URL *</label>
                <input
                  type="url"
                  name="poster"
                  placeholder="https://..."
                  value={formData.poster}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-field">
                <label>YouTube Trailer URL</label>
                <input
                  type="url"
                  name="trailer"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={formData.trailer}
                  onChange={handleFormChange}
                />
              </div>

              <div className="form-field">
                <label>Description / Synopsis *</label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Enter a brief synopsis of the motion picture or series..."
                  value={formData.description}
                  onChange={handleFormChange}
                  required
                />
              </div>

              {/* Streaming Links */}
              <div className="admin-ott-links-group">
                <span className="admin-ott-group-title">
                  <i className="fas fa-satellite-dish text-[#f5c518] mr-1"></i> Streaming Platforms (Optional)
                </span>
                <div className="form-grid-2" style={{ marginTop: '8px' }}>
                  <input
                    type="url"
                    name="watch_netflix"
                    placeholder="Netflix URL (https://netflix.com/...)"
                    value={formData.watchLinks?.netflix || ''}
                    onChange={handleFormChange}
                  />
                  <input
                    type="url"
                    name="watch_hotstar"
                    placeholder="Hotstar URL (https://hotstar.com/...)"
                    value={formData.watchLinks?.hotstar || ''}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? (
                    <span><i className="fas fa-spinner fa-spin mr-1"></i> Saving...</span>
                  ) : (
                    <span>
                      <i className="fas fa-save mr-1"></i> {editingId ? 'Save Changes' : 'Publish Title'}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;



