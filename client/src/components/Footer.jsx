import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="footer">
      <div style={{ marginBottom: '8px' }}>
        <strong style={{ color: '#f5c518', fontSize: '16px' }}>{t('brand')}</strong> — Full-Stack MERN Movie Management & Streaming System
      </div>
      <div style={{ color: '#888', fontSize: '12px' }}>
        Built with MongoDB, Express.js, React.js, and Node.js • Multi-Lingual Architecture
      </div>
    </footer>
  );
};

export default Footer;
