import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

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
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--bg-main)',
      }}
    >
      <Header />
      <main style={{ position: 'relative', flex: 1, width: '100%', overflow: 'hidden' }}>
        {workspace}
      </main>
      <Footer />
    </div>
  );
};
