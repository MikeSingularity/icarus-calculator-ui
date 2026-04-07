import React from 'react';

/**
 * MainLayout Component
 *
 * Provides the core split-screen structure for the application.
 */
export const MainLayout: React.FC<{
  workspace: React.ReactNode;
  sidebar: React.ReactNode;
}> = ({ workspace, sidebar }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 360px',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <main style={{ position: 'relative', overflow: 'hidden' }}>{workspace}</main>
      <aside
        style={{
          borderLeft: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(17, 20, 27, 0.95)',
          backdropFilter: 'blur(20px)',
          zIndex: 10,
          overflowY: 'auto',
        }}
      >
        {sidebar}
      </aside>
    </div>
  );
};
