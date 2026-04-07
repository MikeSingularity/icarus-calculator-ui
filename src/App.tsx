import { useEffect, useState } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { WorkspacePane } from './components/workspace/WorkspacePane';
import { CommandPalette } from './components/palette/CommandPalette';
import { dataAdapter } from './services/dataAdapter';
import { Loader2 } from 'lucide-react';

/**
 * App Component
 *
 * Main entry point for the Icarus Production Planner.
 */
function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize game data on mount
    dataAdapter
      .init()
      .then(() => setIsLoading(false))
      .catch(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '20px',
          color: '#fff',
        }}
      >
        <Loader2 size={48} className="animate-spin text-primary" />
        <p style={{ fontWeight: 600, letterSpacing: '0.05em' }}>LOADING ICARUS DATA...</p>
      </div>
    );
  }

  return (
    <>
      <MainLayout workspace={<WorkspacePane />} />
      <CommandPalette />

      {/* Visual Instruction Overlay */}
      <div
        style={{
          position: 'fixed',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '12px 20px',
          background: 'rgba(26, 31, 41, 0.65)',
          backdropFilter: 'blur(16px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '0.85rem',
          color: 'rgba(255,255,255,0.7)',
          zIndex: 100,
          pointerEvents: 'none',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          letterSpacing: '0.02em',
        }}
      >
        Press <span style={{ color: '#fff', fontWeight: 700 }}>⌘ + K</span> or{' '}
        <span style={{ color: '#fff', fontWeight: 700 }}>Alt + K</span> to search recipes
      </div>
    </>
  );
}

export default App;
