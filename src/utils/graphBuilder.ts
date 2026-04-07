import { Node, Edge, Position } from 'reactflow';
import dagre from 'dagre';
import { dataAdapter } from '../services/dataAdapter';

/**
 * buildGraph
 *
 * Uses Dagre for professional DAG layout (centering parents over children).
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

  const totalQuantities: Record<string, number> = {};
  const depthMap: Record<string, number> = {};
  const adjacency: Record<string, Set<string>> = {};

  /**
   * aggregate
   * Discovers all items, quantities, and connections.
   */
  function aggregate(itemId: string, quantity: number, depth: number, parentId: string) {
    if (depth > MAX_DEPTH) {
      error = `Maximum recursion depth (${MAX_DEPTH}) exceeded at item: ${itemId}. Possible recipe cycle detected.`;
      return;
    }

    totalQuantities[itemId] = (totalQuantities[itemId] || 0) + quantity;
    depthMap[itemId] = Math.max(depthMap[itemId] || 0, depth);

    if (parentId) {
      if (!adjacency[parentId]) adjacency[parentId] = new Set();
      adjacency[parentId].add(itemId);
    }

    const isDone = checkedNodes.has(itemId);
    if (dataAdapter.isLeaf(itemId) || isDone) return;

    const item = dataAdapter.getItem(itemId);
    const recipeId = recipeOverrides[itemId] || item?.recipes?.[0];
    const recipe = recipeId ? dataAdapter.getRecipe(recipeId) : null;

    if (recipe) {
      const outputCount = recipe.outputs.find((o) => o.id === itemId)?.count || 1;
      const factor = Math.ceil(quantity / outputCount);
      recipe.inputs.forEach((input) => {
        aggregate(input.id, input.count * factor, depth + 1, itemId);
      });
    }
  }

  // Pass 1: Build the requirement map
  Object.entries(itemsRequested).forEach(([id, count]) => {
    aggregate(id, count, 0, '');
  });

  if (error) return { nodes: [], edges: [], error };

  // Pass 2: Setup Dagre Graph
  const g = new dagre.graphlib.Graph();
  // rankdir: 'LR' (Left-to-Right)
  // align: 'UL' or undefined (defaults to centering)
  g.setGraph({ rankdir: 'LR', nodesep: 60, ranksep: 280, marginx: 40, marginy: 40 });
  g.setDefaultEdgeLabel(() => ({}));

  // Add nodes to Dagre
  Object.keys(totalQuantities).forEach((itemId) => {
    // Width/Height for layout purposes
    g.setNode(itemId, { width: 320, height: 140 });
  });

  // Add edges to Dagre
  Object.entries(adjacency).forEach(([parentId, children]) => {
    children.forEach((childId) => {
      // Force terminal nodes (shopping list) to be at least one rank further?
      // Dagre handles this naturally if they are leaves.
      g.setEdge(parentId, childId);
    });
  });

  // Re-rank items marked as "Done" or "Leaf" to be in the furthest possible column?
  // We can simulate the "Shopping List" by finding the max rank and shifting them.
  dagre.layout(g);

  // Pass 3: Map Dagre output to React Flow
  const maxRank = Math.max(...g.nodes().map((n) => (g.node(n) as any).rank || 0));

  Object.keys(totalQuantities).forEach((itemId) => {
    const isTerminal = dataAdapter.isLeaf(itemId) || checkedNodes.has(itemId);
    const dagreNode = g.node(itemId) as any;

    // Manual adjustment for "Shopping List" if we want to ensure they align far-right
    const x = dagreNode.x;
    if (isTerminal && dagreNode.rank !== undefined && dagreNode.rank < (maxRank as any)) {
      // Optional: We could shift them to maxRank here, but Dagre's layered sort
      // is usually smarter about keeping them near their parents.
    }

    const storedPos = manualPositions[itemId];
    nodes.push({
      id: itemId,
      type: 'recipe',
      position: storedPos || { x: x, y: dagreNode.y },
      data: {
        itemId,
        quantity: totalQuantities[itemId],
        isRoot: !!itemsRequested[itemId],
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    });
  });

  // Pass 4: Create Edges
  Object.entries(adjacency).forEach(([parentId, children]) => {
    children.forEach((childId) => {
      const isDone = checkedNodes.has(parentId) || checkedNodes.has(childId);
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
