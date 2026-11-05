import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import bgImage from '../assets/bg.jpg';

const LoginPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(username, password, email);
      } else {
        await login(username, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-login-screen">
      <div className="auth-card">
        {/* Tabs */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${!isRegister ? 'active' : ''}`}
            onClick={() => {
              setIsRegister(false);
              setError('');
            }}
          >
            {t('signin')}
          </button>
          <button
            type="button"
            className={`auth-tab ${isRegister ? 'active' : ''}`}
            onClick={() => {
              setIsRegister(true);
              setError('');
            }}
          >
            {t('signup')}
          </button>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(229, 9, 20, 0.2)',
              border: '1px solid #e50914',
              color: '#ff6b6b',
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            <i className="fas fa-exclamation-circle" style={{ marginRight: '6px' }}></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Username</label>
            <input
              type="text"
              placeholder="e.g. Ranjna Ray"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {isRegister && (
            <div className="form-field">
              <label>Email (Optional)</label>
              <input
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          <div className="form-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', marginTop: '14px', justifyContent: 'center', padding: '11px' }}
            disabled={loading}
          >
            {loading ? (
              <span><i className="fas fa-spinner fa-spin"></i> Processing...</span>
            ) : isRegister ? (
              t('signup')
            ) : (
              t('signin')
            )}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#aaa' }}>
          {!isRegister ? (
            <p>
              Demo credentials: <strong>Ranjna Ray</strong> / <strong>ranjna123</strong>
            </p>
          ) : (
            <p>Already have an account? Switch to Sign In above.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;



