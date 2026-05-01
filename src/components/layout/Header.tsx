import React from 'react';
import { dataAdapter } from '../../services/dataAdapter';

/**
 * Header Component
 *
 * Displays the application title and game data version information.
 */
export const Header: React.FC = () => {
  const metadata = dataAdapter.getMetadata();

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        height: '64px',
        background: 'rgba(17, 20, 27, 0.8)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        zIndex: 10,
        position: 'relative',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <h1
          style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
          }}
        >
          Icarus Production Planner
        </h1>
      </div>

      {metadata && (
        <div
          style={{
            fontSize: '0.85rem',
            color: 'rgba(255, 255, 255, 0.6)',
            fontWeight: 400,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>Icarus Version</span>
          <a
            href={metadata.patchnotes_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#3b82f6',
              textDecoration: 'none',
              fontWeight: 600,
              transition: 'color 0.2s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = '#60a5fa')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#3b82f6')}
          >
            {metadata.client_version}
          </a>
          <span style={{ opacity: 0.3 }}>·</span>
          <span>Update Date {metadata.generated_date}</span>
        </div>
      )}
    </header>
  );
};
