import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const LoginPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isRegister && password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

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

  const handleFillDemo = () => {
    setIsRegister(false);
    setUsername('Ranjna Ray');
    setPassword('ranjna123');
    setError('');
  };

  return (
    <div className="user-login-screen">
      <div className="auth-stage-glow" />

      <div className="auth-card-wrapper">
        <div className="auth-card">
          {/* Brand Header */}
          <div className="auth-brand-header">
            <div className="auth-brand-logo">
              <span className="auth-logo-icon">
                <i className="fas fa-clapperboard"></i>
              </span>
            </div>
            <h1 className="auth-brand-title">CHALCHITRA</h1>
            <p className="auth-brand-subtitle">
              {isRegister
                ? 'Join our global community of cinema lovers'
                : 'Enter the cinematic streaming universe'}
            </p>
          </div>

          {/* Interactive Switch Tabs */}
          <div className="auth-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={!isRegister}
              className={`auth-tab ${!isRegister ? 'active' : ''}`}
              onClick={() => {
                setIsRegister(false);
                setError('');
              }}
            >
              <i className="fas fa-arrow-right-to-bracket mr-2"></i>
              {t('signin')}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isRegister}
              className={`auth-tab ${isRegister ? 'active' : ''}`}
              onClick={() => {
                setIsRegister(true);
                setError('');
              }}
            >
              <i className="fas fa-user-plus mr-2"></i>
              {t('signup')}
            </button>
          </div>

          {error && (
            <div className="auth-error-banner" role="alert">
              <i className="fas fa-circle-exclamation auth-error-icon"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-field">
              <label htmlFor="auth-username">
                <i className="fas fa-user text-gray-400 mr-1"></i> Username
              </label>
              <div className="auth-input-wrapper">
                <input
                  id="auth-username"
                  type="text"
                  placeholder="e.g. Ranjna Ray"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {isRegister && (
              <div className="form-field">
                <label htmlFor="auth-email">
                  <i className="fas fa-envelope text-gray-400 mr-1"></i> Email (Optional)
                </label>
                <div className="auth-input-wrapper">
                  <input
                    id="auth-email"
                    type="email"
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>
            )}

            <div className="form-field">
              <label htmlFor="auth-password">
                <i className="fas fa-lock text-gray-400 mr-1"></i> Password
              </label>
              <div className="auth-input-wrapper">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
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

            <button
              type="submit"
              className="btn-primary auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span>
                  <i className="fas fa-spinner fa-spin mr-2"></i> Authenticating...
                </span>
              ) : isRegister ? (
                <span>
                  <i className="fas fa-user-plus mr-2"></i> {t('signup')}
                </span>
              ) : (
                <span>
                  <i className="fas fa-play mr-2"></i> {t('signin')}
                </span>
              )}
            </button>
          </form>

          {/* Quick Demo Access & Secondary Links */}
          <div className="auth-footer-shelf">
            {!isRegister ? (
              <div className="auth-demo-box">
                <div className="flex items-center justify-between">
                  <span className="auth-demo-label">
                    <i className="fas fa-wand-magic-sparkles text-[#f5c518] mr-1"></i> Quick Test Account
                  </span>
                  <button
                    type="button"
                    className="auth-demo-autofill-btn"
                    onClick={handleFillDemo}
                  >
                    Auto-Fill
                  </button>
                </div>
                <div className="auth-demo-creds">
                  User: <code>Ranjna Ray</code> • Pass: <code>ranjna123</code>
                </div>
              </div>
            ) : (
              <p className="auth-switch-prompt">
                Already registered with ChalChitra?{' '}
                <button
                  type="button"
                  className="auth-inline-link"
                  onClick={() => {
                    setIsRegister(false);
                    setError('');
                  }}
                >
                  Sign in here
                </button>
              </p>
            )}

            <div className="auth-admin-link-row">
              <Link to="/admin" className="auth-admin-link">
                <i className="fas fa-shield-halved mr-1"></i> Studio Admin Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;



