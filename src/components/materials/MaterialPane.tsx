import React, { useLayoutEffect } from 'react';
import { usePlanStore } from '../../store/usePlanStore';
import { useRegistryStore } from '../../store/useRegistryStore';
import { dataAdapter } from '../../services/dataAdapter';
import { Package } from 'lucide-react';

/**
 * MaterialItem Component
 *
 * Individual material entry that registers its position for dynamic linking.
 */
const MaterialItem: React.FC<{ id: string; count: number }> = ({ id, count }) => {
  const registerMaterial = useRegistryStore((state) => state.registerMaterial);
  const unregisterMaterial = useRegistryStore((state) => state.unregisterMaterial);
  const itemRef = React.useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (itemRef.current) {
      registerMaterial(id, itemRef.current.getBoundingClientRect());
    }
    return () => unregisterMaterial(id);
  }, [id, registerMaterial, unregisterMaterial]);

  return (
    <div
      ref={itemRef}
      key={id}
      className="glass"
      style={{
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'var(--transition-fast)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'var(--accent-primary)',
            boxShadow: '0 0 10px var(--accent-primary)',
          }}
        />
        <span style={{ fontSize: '0.925rem', fontWeight: 500 }}>
          {dataAdapter.getDisplayName(id)}
        </span>
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.925rem',
          fontWeight: 600,
          color: 'var(--accent-primary)',
        }}
      >
        x{count}
      </div>
    </div>
  );
};

/**
 * MaterialPane Component
 *
 * Shows the aggregated bill of materials (shopping list).
 */
export const MaterialPane: React.FC = () => {
  const getBOM = usePlanStore((state) => state.getBillOfMaterials);
  const itemsRequested = usePlanStore((state) => state.itemsRequested);
  const recipeOverrides = usePlanStore((state) => state.recipeOverrides);
  const checkedNodes = usePlanStore((state) => state.checkedNodes);

  const materials = React.useMemo(
    () => getBOM(),
    [getBOM, itemsRequested, recipeOverrides, checkedNodes]
  );

  return (
    <div className="scroll-hide" style={{ padding: '32px 24px' }}>
      <header style={{ marginBottom: '24px' }}>
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <Package size={20} className="text-primary" />
          Shopping List
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
          Total raw resources needed
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {materials.length === 0 ? (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              border: '1px dashed rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: 'rgba(255,255,255,0.3)',
              fontSize: '0.875rem',
            }}
          >
            Search and add recipes to see requirements.
          </div>
        ) : (
          materials.map((mat) => <MaterialItem key={mat.id} id={mat.id} count={mat.count} />)
        )}
      </div>
    </div>
  );
};
