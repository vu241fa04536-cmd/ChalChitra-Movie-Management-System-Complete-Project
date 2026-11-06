import React, { useState, useEffect, useCallback } from 'react';

/**
 * CinematicIntro
 * An atmospheric 3D opening reveal for ChalChitra • The Cinematic Universe.
 * Shown once per session; can be skipped with Escape or the Skip button.
 * Fully respectful of prefers-reduced-motion.
 */
const CinematicIntro = () => {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    const prefersReducedMotion =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return false;
    return !sessionStorage.getItem('chalchitra_intro_seen');
  });

  const [animatingOut, setAnimatingOut] = useState(false);

  const dismissIntro = useCallback(() => {
    setAnimatingOut(true);
    sessionStorage.setItem('chalchitra_intro_seen', 'true');
    setTimeout(() => {
      setVisible(false);
    }, 600);
  }, []);

  useEffect(() => {
    if (!visible) return;

    // Auto-dismiss after 4 seconds
    const timer = setTimeout(() => {
      dismissIntro();
    }, 3800);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        dismissIntro();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible, dismissIntro]);

  if (!visible) return null;

  return (
    <div
      className={`cinematic-intro-overlay ${animatingOut ? 'fade-out' : ''}`}
      role="dialog"
      aria-label="Cinematic Universe Introduction"
      onClick={dismissIntro}
    >
      <div className="cinematic-intro-content" onClick={(e) => e.stopPropagation()}>
        <div className="intro-light-beam" aria-hidden="true" />
        <div className="intro-reel-icon">
          <i className="fas fa-film"></i>
        </div>

        <p className="intro-tagline">PRESENTS A NEW DIMENSION IN ENTERTAINMENT</p>
        <h1 className="intro-title">CHALCHITRA</h1>
        <p className="intro-sub-title">THE CINEMATIC UNIVERSE</p>

        <div className="intro-divider">
          <span></span>
          <i className="fas fa-star text-[#f5c518]"></i>
          <span></span>
        </div>

        <button
          type="button"
          className="intro-skip-btn"
          onClick={dismissIntro}
          aria-label="Enter ChalChitra platform"
        >
          <span>ENTER UNIVERSE</span>
          <i className="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  );
};

export default React.memo(CinematicIntro);
