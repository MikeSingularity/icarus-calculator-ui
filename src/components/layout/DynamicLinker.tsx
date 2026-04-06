import React, { useEffect, useRef, useState } from 'react';
import { useRegistryStore } from '../../store/useRegistryStore';
import { usePlanStore } from '../../store/usePlanStore';
import { dataAdapter } from '../../services/dataAdapter';

/**
 * DynamicLinker Component
 * 
 * Renders an SVG overlay with precise Bezier curves between Leaf workspace nodes
 * and the corresponding items in the Material sidebar.
 */
export const DynamicLinker: React.FC = () => {
  const nodeRegistry = useRegistryStore(state => state.nodes);
  const materialRegistry = useRegistryStore(state => state.materials);
  const checkedNodes = usePlanStore(state => state.checkedNodes);
  const [, setTick] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);

  // High-frequency loop to keep SVG paths synced with scroll/pan animations
  useEffect(() => {
    let frameId: number;
    const loop = () => {
      setTick(_t => _t + 1);
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Compute paths for all active Leaf nodes
  const paths = Object.entries(nodeRegistry).map(([nodeId, nodeData]) => {
    const isLeaf = dataAdapter.isGeneric(nodeData.itemId) || 
                   !dataAdapter.getItem(nodeData.itemId)?.recipes || 
                   checkedNodes.has(nodeId);

    if (!isLeaf) return null;

    const materialData = materialRegistry[nodeData.itemId];
    if (!materialData) return null;

    // Start point: Right edge of the Recipe node
    const startX = nodeData.rect.right - 2; // Slight indent for better visuals
    const startY = nodeData.rect.top + nodeData.rect.height / 2;

    // End point: Left edge of the Material Sidebar item
    // We target the blue indicator dot roughly
    const endX = materialData.rect.left + 16; 
    const endY = materialData.rect.top + materialData.rect.height / 2;

    // Draw a smooth bezier curve flowing Left -> Right
    const cp1x = startX + (endX - startX) / 3;
    const cp2x = endX - (endX - startX) / 3;
    const path = `M ${startX} ${startY} C ${cp1x} ${startY}, ${cp2x} ${endY}, ${endX} ${endY}`;

    const isDone = checkedNodes.has(nodeId);

    return (
      <g key={`${nodeId}-${nodeData.itemId}`}>
        <path 
          d={path}
          stroke={isDone ? 'var(--accent-success)' : 'var(--accent-primary)'}
          strokeWidth={isDone ? 1 : 2}
          strokeDasharray={isDone ? '4, 4' : 'none'}
          fill="none"
          opacity={isDone ? 0.2 : 0.4}
          style={{ transition: 'stroke 0.3s ease' }}
        />
        {!isDone && (
          <circle cx={startX} cy={startY} r="3" fill="var(--accent-primary)" opacity="0.6" />
        )}
      </g>
    );
  }).filter(Boolean);

  return (
    <svg 
      ref={svgRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 5
      }}
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      {paths}
    </svg>
  );
};
