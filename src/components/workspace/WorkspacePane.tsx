import React, { useMemo, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  NodeTypes,
  ReactFlowProvider,
  NodeChange,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { RecipeNode } from './RecipeNode';
import { usePlanStore } from '../../store/usePlanStore';
import { buildGraph } from '../../utils/graphBuilder';

const nodeTypes: NodeTypes = {
  recipe: RecipeNode,
};

/**
 * WorkspacePane Component
 *
 * The node-based graph editor for planning recipes.
 * Supports manual dragging and persistent positions.
 */
export const WorkspacePane: React.FC = () => {
  const itemsRequested = usePlanStore((state) => state.itemsRequested);
  const recipeOverrides = usePlanStore((state) => state.recipeOverrides);
  const checkedNodes = usePlanStore((state) => state.checkedNodes);
  const nodePositions = usePlanStore((state) => state.nodePositions);
  const setNodePosition = usePlanStore((state) => state.setNodePosition);

  // Recursively build the node and edge graph
  const { nodes, edges } = useMemo(() => {
    return buildGraph(itemsRequested, recipeOverrides, checkedNodes, nodePositions);
  }, [itemsRequested, recipeOverrides, checkedNodes, nodePositions]);

  // Handle node dragging and other changes
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      changes.forEach((change) => {
        if (change.type === 'position' && change.position) {
          setNodePosition(change.id, change.position.x, change.position.y);
        }
      });
      // Note: React Flow will update the UI automatically if nodes are reactive
    },
    [setNodePosition]
  );

  return (
    <ReactFlowProvider>
      <div style={{ height: '100%', width: '100%' }}>
        <ReactFlow
          nodes={nodes}
          nodeTypes={nodeTypes}
          edges={edges}
          onNodesChange={onNodesChange}
          fitView
          style={{ background: 'var(--bg-main)' }}
          minZoom={0.1}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#1e293b" variant={BackgroundVariant.Dots} gap={32} size={1} />
          <Controls />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
};
