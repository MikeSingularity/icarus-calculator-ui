import { Node, Edge, Position } from 'reactflow';
import { dataAdapter } from '../services/dataAdapter';

/**
 * buildGraph
 *
 * Recursively builds the node and edge structures for a given set of requested items.
 * Uses a Left-to-Right layout logic.
 */
export function buildGraph(
  itemsRequested: Record<string, number>,
  recipeOverrides: Record<string, string>,
  checkedNodes: Set<string>,
  manualPositions: Record<string, { x: number; y: number }>
) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let error: string | null = null;
  const MAX_DEPTH = 20;

  // Track global state for the DAG
  const totalQuantities: Record<string, number> = {};
  const nodeDepths: Record<string, number> = {};
  const adjacency: Record<string, Set<string>> = {};

  /**
   * aggregate
   * First pass: Sum up requirements and discover all active connections.
   */
  function aggregate(itemId: string, quantity: number, depth: number, parentId: string) {
    if (depth > MAX_DEPTH) {
      error = `Maximum recursion depth (${MAX_DEPTH}) exceeded at item: ${itemId}. Possible recipe cycle detected.`;
      console.error(error);
      return;
    }

    // Accumulate total quantity needed across all paths
    totalQuantities[itemId] = (totalQuantities[itemId] || 0) + quantity;
    // Set depth to the maximum distance from root to ensure it stays to the right of its parents
    nodeDepths[itemId] = Math.max(nodeDepths[itemId] || 0, depth);

    if (parentId) {
      if (!adjacency[parentId]) adjacency[parentId] = new Set();
      adjacency[parentId].add(itemId);
    }

    // Stop recursion if item is a leaf or marked as done
    const isDone = checkedNodes.has(itemId);
    if (dataAdapter.isLeaf(itemId) || isDone) return;

    const item = dataAdapter.getItem(itemId);
    const recipeId = recipeOverrides[itemId] || item?.recipes?.[0];
    const recipe = recipeId ? dataAdapter.getRecipe(recipeId) : null;

    if (recipe) {
      const outputCount = recipe.outputs.find((o) => o.id === itemId)?.count || 1;
      const factor = Math.ceil(quantity / outputCount);

      recipe.inputs.forEach((input) => {
        // Multi-path recursion: we visit each path to ensure correct quantity sum
        aggregate(input.id, input.count * factor, depth + 1, itemId);
      });
    }
  }

  // Pass 1: Build the requirement map
  Object.entries(itemsRequested).forEach(([id, count]) => {
    aggregate(id, count, 0, '');
  });

  if (error) return { nodes: [], edges: [], error };

  // Calculate global max depth for the "Shopping List" column
  const maxDepth = Math.max(0, ...Object.values(nodeDepths));
  const columnCounters: Record<number, number> = {};

  // Pass 2: Create Nodes with unified IDs and layout
  Object.keys(totalQuantities).forEach((itemId) => {
    const isLeaf = dataAdapter.isLeaf(itemId);
    const isDone = checkedNodes.has(itemId);
    const isTerminal = isLeaf || isDone;

    const depth = nodeDepths[itemId];
    // Terminal items go to the Shopping List (MaxDepth + 1)
    const column = isTerminal ? maxDepth + 1 : depth;

    // Auto-layout positioning
    const x = column * 320; // Slightly tighter horizontal spacing
    const y = (columnCounters[column] || 0) * 160;
    columnCounters[column] = (columnCounters[column] || 0) + 1;

    const storedPos = manualPositions[itemId];
    const position = storedPos || { x, y };

    nodes.push({
      id: itemId, // Unified ID
      type: 'recipe',
      position,
      data: {
        itemId,
        quantity: totalQuantities[itemId],
        isRoot: !!itemsRequested[itemId],
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    });
  });

  // Pass 3: Create Edges based on unique connections discovered in Pass 1
  Object.entries(adjacency).forEach(([parentId, children]) => {
    children.forEach((childId) => {
      const isParentDone = checkedNodes.has(parentId);
      const isChildDone = checkedNodes.has(childId);
      const isDone = isParentDone || isChildDone;

      edges.push({
        id: `e-${parentId}-to-${childId}`,
        source: parentId,
        target: childId,
        animated: !isDone,
        style: {
          stroke: isDone ? 'var(--accent-success)' : 'var(--accent-primary)',
          opacity: isDone ? 0.3 : 0.8,
        },
      });
    });
  });

  return { nodes, edges, error };
}
