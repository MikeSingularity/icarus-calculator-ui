import React, { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import { Search, Command } from 'lucide-react';
import { dataAdapter } from '../../services/dataAdapter';
import { usePlanStore } from '../../store/usePlanStore';

/**
 * CommandPalette Component
 *
 * An accessible Cmd+K dialog for searching and adding recipes to the workspace.
 */
export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<string | null>(null);
  const addItem = usePlanStore((state) => state.addItem);

  // Initialize Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    const items = dataAdapter.getAllItems();
    return new Fuse(items, {
      keys: ['display_name', 'id'],
      threshold: 0.35,
    });
  }, []);

  const results = useMemo(() => {
    if (!query) {
      return dataAdapter.getAllItems(tierFilter || undefined).slice(0, 10);
    }
    let res = fuse.search(query).map((r) => r.item);
    if (tierFilter) {
      res = res.filter((r) => String(r.tier).startsWith(tierFilter));
    }
    return res.slice(0, 10);
  }, [fuse, query, tierFilter]);

  // Key listeners for Cmd+K and Esc
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Open with Cmd+K, Ctrl+K, or Alt+K
      if (e.key === 'k' && (e.metaKey || e.ctrlKey || e.altKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh',
      }}
      onClick={() => setIsOpen(false)}
    >
      <div
        className="glass"
        style={{
          width: '600px',
          background: 'var(--bg-sidebar)',
          padding: '0',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Area */}
        <header
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <Search size={22} className="text-muted" />
          <input
            autoFocus
            type="text"
            placeholder="Search recipes (e.g. Steel Pickaxe)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '1.1rem',
              fontWeight: 500,
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.5 }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '2px 6px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '4px',
              }}
            >
              ESC
            </span>
          </div>
        </header>

        {/* Tier Filter Area */}
        <div
          style={{
            padding: '8px 20px',
            display: 'flex',
            gap: '8px',
            background: 'rgba(255,255,255,0.02)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          {['1', '2', '3', '4', '5'].map((tier) => (
            <button
              key={tier}
              onClick={() => setTierFilter(tierFilter === tier ? null : tier)}
              style={{
                background:
                  tierFilter === tier ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                color: tierFilter === tier ? '#fff' : 'rgba(255,255,255,0.5)',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Tier {tier}
            </button>
          ))}
        </div>

        {/* Search Results */}
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {results.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
              No results found for "{query}"
            </div>
          ) : (
            results.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  addItem(item.id, 1);
                  setIsOpen(false);
                  setQuery('');
                }}
                style={{
                  padding: '12px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  transition: '0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      padding: '8px',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '8px',
                    }}
                  >
                    <Command size={16} className="text-primary" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{item.display_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
                      {item.id}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '4px 8px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '6px',
                    color: 'rgba(255,255,255,0.4)',
                  }}
                >
                  Tier {item.tier}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
