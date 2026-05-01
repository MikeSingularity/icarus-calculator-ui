import React from 'react';

/**
 * Footer Component
 *
 * Displays legal disclaimer and community links.
 */
export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        height: '40px',
        background: 'rgba(10, 12, 16, 0.9)',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        fontSize: '0.75rem',
        color: 'rgba(255, 255, 255, 0.4)',
        zIndex: 10,
      }}
    >
      <div>Unofficial community tool — not affiliated with RocketWerkz Studios Limited</div>
      <div>
        <a
          href="https://github.com/MikeSingularity/icarus-calculator-ui/issues"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: 'rgba(255, 255, 255, 0.5)',
            textDecoration: 'none',
            transition: 'color 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = '#fff')}
          onMouseOut={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)')}
        >
          Issues?
        </a>
      </div>
    </footer>
  );
};
