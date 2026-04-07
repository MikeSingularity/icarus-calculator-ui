import React from 'react';

/**
 * MainLayout Component
 *
 * Provides the core split-screen structure for the application.
 */
export const MainLayout: React.FC<{
  workspace: React.ReactNode;
}> = ({ workspace }) => {
  return (
    <div
      style={{
        display: 'block',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--bg-main)',
      }}
    >
      <main style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
        {workspace}
      </main>
    </div>
  );
};
