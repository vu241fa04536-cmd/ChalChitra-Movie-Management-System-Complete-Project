import React from 'react';

const FeaturesStrip = () => {
  return (
    <div className="ref-features-strip">
      <div className="ref-feature-item">
        <div className="ref-feature-icon">
          <i className="fas fa-layer-group"></i>
        </div>
        <div className="ref-feature-text">
          <div className="ref-feature-title">10,000+</div>
          <div className="ref-feature-sub">Movies & Shows</div>
        </div>
      </div>

      <div className="ref-feature-item">
        <div className="ref-feature-icon">
          <i className="fas fa-tv"></i>
        </div>
        <div className="ref-feature-text">
          <div className="ref-feature-title">4K HDR</div>
          <div className="ref-feature-sub">Ultra HD Quality</div>
        </div>
      </div>

      <div className="ref-feature-item">
        <div className="ref-feature-icon">
          <i className="fas fa-mobile-screen"></i>
        </div>
        <div className="ref-feature-text">
          <div className="ref-feature-title">Any Device</div>
          <div className="ref-feature-sub">Watch Anywhere</div>
        </div>
      </div>

      <div className="ref-feature-item">
        <div className="ref-feature-icon">
          <i className="fas fa-cloud-arrow-down"></i>
        </div>
        <div className="ref-feature-text">
          <div className="ref-feature-title">Offline</div>
          <div className="ref-feature-sub">Download & Go</div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(FeaturesStrip);
