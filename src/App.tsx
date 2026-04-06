import { useEffect, useState } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { WorkspacePane } from './components/workspace/WorkspacePane';
import { MaterialPane } from './components/materials/MaterialPane';
import { CommandPalette } from './components/palette/CommandPalette';
import { DynamicLinker } from './components/layout/DynamicLinker';
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
    dataAdapter.init()
      .then(() => setIsLoading(false))
      .catch(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div style={{ 
        width: '100vw', 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '20px',
        color: '#fff'
      }}>
        <Loader2 size={48} className="animate-spin text-primary" />
        <p style={{ fontWeight: 600, letterSpacing: '0.05em' }}>LOADING ICARUS DATA...</p>
      </div>
    );
  }

  return (
    <>
      <MainLayout 
        workspace={<WorkspacePane />}
        sidebar={<MaterialPane />}
      />
      <CommandPalette />
      <DynamicLinker />
      
      {/* Visual Instruction Overlay */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        padding: '12px 16px',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.1)',
        fontSize: '0.8rem',
        color: 'rgba(255,255,255,0.5)',
        zIndex: 50,
        pointerEvents: 'none'
      }}>
        Press <span style={{ color: '#fff', fontWeight: 700 }}>⌘ + K</span> or <span style={{ color: '#fff', fontWeight: 700 }}>Alt + K</span> to search recipes
      </div>
    </>
  );
}

export default App;
