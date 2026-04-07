import { useRef, useLayoutEffect, useMemo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { usePlanStore } from '../../store/usePlanStore';
import { useRegistryStore } from '../../store/useRegistryStore';
import { dataAdapter } from '../../services/dataAdapter';
import { CheckCircle, Circle, Hammer, Trash2, ChevronDown } from 'lucide-react';
import { formatQuantity } from '../../utils/quantityFormatter';

/**
 * RecipeNode Component
 *
 * A custom React Flow node representing a craftable item or a raw material.
 * Oriented for Left-to-Right layout.
 */
export const RecipeNode: React.FC<NodeProps> = ({ id, data, xPos, yPos }) => {
  const { itemId, quantity, isRoot } = data;
  const nodeRef = useRef<HTMLDivElement>(null);

  const isDone = usePlanStore((state) => state.checkedNodes.has(id));
  const toggleDone = usePlanStore((state) => state.toggleDone);
  const removeItem = usePlanStore((state) => state.removeItem);
  const setRecipe = usePlanStore((state) => state.setRecipe);

  const registerNode = useRegistryStore((state) => state.registerNode);
  const unregisterNode = useRegistryStore((state) => state.unregisterNode);

  const item = dataAdapter.getItem(itemId);
  const displayName = dataAdapter.getDisplayName(itemId);
  const recipes = item?.recipes || [];

  const activeRecipeId = usePlanStore((state) => state.recipeOverrides[itemId] || recipes[0]);
  const activeRecipe = activeRecipeId ? dataAdapter.getRecipe(activeRecipeId) : null;

  // Resolve bench name
  const benchName = useMemo(() => {
    if (!activeRecipe) return null;
    const benchId = activeRecipe.benches[0];
    const benchItem = dataAdapter.getItem(benchId);
    return benchItem?.display_name || benchId.replace(/_/g, ' ').toUpperCase();
  }, [activeRecipe]);

  // Track DOM position for Dynamic Linker
  // xPos and yPos are included in dependencies to ensure the registry
  // updates in real-time as the node is dragged.
  useLayoutEffect(() => {
    if (nodeRef.current) {
      registerNode(id, itemId, nodeRef.current.getBoundingClientRect());
    }
    return () => unregisterNode(id);
  }, [id, itemId, xPos, yPos, registerNode, unregisterNode]);

  return (
    <div
      ref={nodeRef}
      className={`glass node-container ${isDone ? 'done' : ''}`}
      style={{
        width: '240px',
        padding: '12px',
        background: 'var(--bg-node)',
        border: isDone ? '1px solid var(--accent-success)' : '1px solid var(--border-color)',
        transition: 'box-shadow 0.2s ease', // Avoid transition on border/background during drags
        borderRadius: '12px',
      }}
    >
      {/* Input Handle (Left) */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: 'var(--accent-primary)', width: '8px', height: '8px' }}
      />

      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isDone ? (
            <CheckCircle
              size={16}
              style={{ color: 'var(--accent-success)', cursor: 'pointer' }}
              onClick={() => toggleDone(id)}
            />
          ) : (
            <Circle
              size={16}
              style={{ color: 'var(--text-muted)', cursor: 'pointer' }}
              onClick={() => toggleDone(id)}
            />
          )}
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: isDone ? 'var(--accent-success)' : 'var(--accent-primary)',
            }}
          >
            {formatQuantity(itemId, quantity)}
          </span>
        </div>

        {isRoot && (
          <button
            onClick={() => removeItem(itemId)}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.2)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}
          >
            <Trash2 size={14} />
          </button>
        )}
      </header>

      <div
        style={{
          fontSize: '0.95rem',
          fontWeight: 600,
          color: '#fff',
          marginBottom: '4px',
          lineHeight: 1.2,
        }}
      >
        {displayName}
      </div>

      {recipes.length > 1 && !isDone && !dataAdapter.isLeaf(itemId) && (
        <div style={{ margin: '8px 0 4px 0', position: 'relative' }}>
          <select
            value={activeRecipeId}
            onChange={(e) => setRecipe(itemId, e.target.value)}
            style={{
              width: '100%',
              background: '#1a1a1a', // Dark solid background for contrast
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '0.7rem',
              color: 'rgba(255,255,255,0.8)',
              appearance: 'none',
              cursor: 'pointer',
            }}
          >
            {recipes.map((rId) => (
              <option
                key={rId}
                value={rId}
                style={{ background: '#1a1a1a', color: '#fff' }} // Explicit option coloring
              >
                Recipe: {rId.split('_').pop()}
              </option>
            ))}
          </select>
          <ChevronDown
            size={10}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              opacity: 0.5,
            }}
          />
        </div>
      )}

      {benchName && !isDone && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.65rem',
            color: 'rgba(255,255,255,0.3)',
            marginTop: '8px',
          }}
        >
          <Hammer size={10} />
          {benchName}
        </div>
      )}

      {/* Output Handles (Right) */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: 'var(--accent-primary)', width: '8px', height: '8px' }}
      />

      {/* Sink Handle (Right Center for Dynamic Linker) */}
      <Handle
        type="source"
        position={Position.Right}
        id="sink"
        style={{ background: 'transparent', opacity: 0, right: -4 }}
      />
    </div>
  );
};
