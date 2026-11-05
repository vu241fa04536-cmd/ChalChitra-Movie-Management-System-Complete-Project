import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { movieService } from '../services/movieService';
import adminLoginBg from '../assets/admin-login-bg.jpg';
import adminPanelBg from '../assets/admin-panel-bg.jpg';

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
  const [loginError, setLoginError] = useState('');
  const [movies, setMovies] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState('');

  const fetchAdminMovies = async () => {
    setLoading(true);
    try {
      const data = await movieService.getAll();
      setMovies(data);
    } catch (err) {
      console.error('Error loading admin movies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminMovies();
    }
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
      releaseYear: movie.releaseYear || 2024,
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

    try {
      if (editingId) {
        await movieService.update(editingId, formData);
        alert('Movie updated successfully!');
      } else {
        await movieService.create(formData);
        alert('New movie added successfully!');
      }
      setIsModalOpen(false);
      fetchAdminMovies();
    } catch (err) {
      setFormError(err.message || 'Failed to save movie');
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await movieService.delete(id);
        setMovies((prev) => prev.filter((m) => m._id !== id));
        alert('Content deleted successfully.');
      } catch (err) {
        alert(`Failed to delete: ${err.message}`);
      }
    }
  };

  // If NOT logged in as Admin, show Security Screen
  if (!isAdmin) {
    return (
      <div className="admin-login-screen">
        <div className="auth-card" style={{ maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <i className="fas fa-user-shield fa-3x" style={{ color: '#f5c518', marginBottom: '10px' }}></i>
            <h2>Admin Verification</h2>
            <p style={{ color: '#aaa', fontSize: '13px', marginTop: '6px' }}>
              Authorized personnel only. Enter key to manage database.
            </p>
          </div>

          {loginError && (
            <div
              style={{
                background: 'rgba(229, 9, 20, 0.2)',
                border: '1px solid #e50914',
                color: '#ff6b6b',
                padding: '10px',
                borderRadius: '6px',
                fontSize: '13px',
                marginBottom: '16px',
              }}
            >
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminAuth}>
            <div className="form-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter admin password (ranjna@123)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '12px', justifyContent: 'center' }}>
              <i className="fas fa-unlock"></i> Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filtered movies in table
  const displayedMovies = movies.filter((m) =>
    m.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    m.genre.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="admin-panel-screen">
      <div className="admin-container">
        {/* Header with Logout */}
        <div className="admin-header">
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#f5c518' }}>
              <i className="fas fa-tools"></i> Admin Control Center
            </h1>
            <p style={{ color: '#aaa', fontSize: '14px', marginTop: '4px' }}>
              Manage full CRUD operations directly on MongoDB
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-primary" onClick={handleOpenAdd}>
              <i className="fas fa-plus-circle"></i> Add New Content
            </button>
            <button className="btn-danger" onClick={adminLogout}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </div>

        {/* Live Statistics Cards */}
        <div className="admin-stats-row">
          <div className="stat-card">
            <div className="stat-icon"><i className="fas fa-database"></i></div>
            <div>
              <div className="stat-value">{movies.length}</div>
              <div className="stat-label">Total Titles</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon"><i className="fas fa-film"></i></div>
            <div>
              <div className="stat-value">{movies.filter((m) => m.type === 'movie').length}</div>
              <div className="stat-label">Movies</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon"><i className="fas fa-tv"></i></div>
            <div>
              <div className="stat-value">{movies.filter((m) => m.type === 'webseries').length}</div>
              <div className="stat-label">Web Series</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon"><i className="fas fa-clock"></i></div>
            <div>
              <div className="stat-value">{movies.filter((m) => m.status === 'upcoming').length}</div>
              <div className="stat-label">Upcoming Releases</div>
            </div>
          </div>
        </div>

        {/* Table & Search Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ width: '320px' }}>
            <input
              type="text"
              placeholder="Search table by title or genre..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="search-input"
              style={{ width: '100%', borderRadius: '6px', border: '1px solid #444', background: '#222', color: '#fff', padding: '9px 14px' }}
            />
          </div>
          <span style={{ color: '#aaa', fontSize: '13px', alignSelf: 'center' }}>
            Showing {displayedMovies.length} of {movies.length} records
          </span>
        </div>

        {/* Table */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Poster</th>
                <th>Title</th>
                <th>Category</th>
                <th>Genre</th>
                <th>Language</th>
                <th>Year</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#f5c518' }}>
                    <i className="fas fa-spinner fa-spin"></i> Loading MongoDB collection...
                  </td>
                </tr>
              ) : displayedMovies.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                    No matching records found.
                  </td>
                </tr>
              ) : (
                displayedMovies.map((movie) => (
                  <tr key={movie._id}>
                    <td>
                      <img src={movie.poster} alt={movie.title} className="table-thumb" />
                    </td>
                    <td style={{ fontWeight: '600' }}>{movie.title}</td>
                    <td style={{ textTransform: 'capitalize' }}>{movie.type || 'movie'}</td>
                    <td>{movie.genre}</td>
                    <td>{movie.language}</td>
                    <td>{movie.releaseYear}</td>
                    <td style={{ color: '#f5c518', fontWeight: 'bold' }}>★ {movie.rating}</td>
                    <td>
                      <span
                        style={{
                          background: movie.status === 'upcoming' ? 'rgba(2, 117, 216, 0.2)' : 'rgba(40, 167, 69, 0.2)',
                          color: movie.status === 'upcoming' ? '#0275d8' : '#28a745',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                        }}
                      >
                        {movie.status}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="action-btn-edit"
                          onClick={() => handleOpenEdit(movie)}
                          title="Edit movie"
                        >
                          <i className="fas fa-edit"></i> Edit
                        </button>
                        <button
                          className="action-btn-del"
                          onClick={() => handleDelete(movie._id, movie.title)}
                          title="Delete movie"
                        >
                          <i className="fas fa-trash"></i> Delete
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#f5c518' }}>
                {editingId ? 'Edit Content Record' : 'Add New Content to Database'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', color: '#aaa', fontSize: '18px' }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {formError && (
              <div
                style={{
                  background: 'rgba(229, 9, 20, 0.2)',
                  border: '1px solid #e50914',
                  color: '#ff6b6b',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  marginBottom: '14px',
                }}
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit}>
              <div className="form-grid-2">
                <div className="form-field">
                  <label>Title *</label>
                  <input
                    type="text"
                    name="title"
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
                <label>Description / Synopsis</label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleFormChange}
                ></textarea>
              </div>

              {/* Streaming Links */}
              <div style={{ marginTop: '10px', marginBottom: '14px' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#f5c518' }}>
                  Streaming Links (Optional)
                </span>
                <div className="form-grid-2" style={{ marginTop: '8px' }}>
                  <input
                    type="url"
                    name="watch_netflix"
                    placeholder="Netflix URL"
                    value={formData.watchLinks?.netflix || ''}
                    onChange={handleFormChange}
                  />
                  <input
                    type="url"
                    name="watch_hotstar"
                    placeholder="Hotstar URL"
                    value={formData.watchLinks?.hotstar || ''}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <i className="fas fa-save"></i> {editingId ? 'Save Changes' : 'Create Record'}
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



