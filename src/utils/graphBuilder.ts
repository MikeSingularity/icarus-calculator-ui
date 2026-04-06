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
  manualPositions: Record<string, { x: number, y: number }>
) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  function traverse(itemId: string, quantity: number, depth = 0, yOffset = 0, parentId = '') {
    // Generate a unique path-based ID: e.g. "axe.0_stick.0_wood"
    // For root nodes, the ID is just the itemId.
    const nodeId = parentId ? `${parentId}.${yOffset}_${itemId}` : itemId;
    
    // Position logic: Root on left, children expand rightwards
    const defaultX = depth * 400;
    const defaultY = yOffset * 300;

    const storedPos = manualPositions[nodeId];
    const position = storedPos || { x: defaultX, y: defaultY };

    const isDone = checkedNodes.has(nodeId);

    nodes.push({
      id: nodeId,
      type: 'recipe',
      position,
      data: { 
        itemId, 
        quantity, 
        nodeId,
        isRoot: !parentId 
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    });

    if (parentId) {
      edges.push({
        id: `e-${parentId}-to-${nodeId}`,
        source: parentId,
        target: nodeId,
        animated: !isDone,
        style: { stroke: isDone ? 'var(--accent-success)' : 'var(--accent-primary)' }
      });
    }

    // Smart Leaf Detection: generics, raw materials, or no-recipe items stop recursion
    if (dataAdapter.isLeaf(itemId) || isDone) return;

    const item = dataAdapter.getItem(itemId);
    const recipeId = recipeOverrides[itemId] || item?.recipes?.[0];
    const recipe = recipeId ? dataAdapter.getRecipe(recipeId) : null;

    if (recipe) {
      const outputCount = recipe.outputs.find(o => o.id === itemId)?.count || 1;
      const factor = Math.ceil(quantity / outputCount);

      recipe.inputs.forEach((input, index) => {
        // Spread children vertically for layout, but use index for path uniqueness
        const childYOffset = yOffset + (index - (recipe.inputs.length - 1) / 2);
        traverse(input.id, input.count * factor, depth + 1, childYOffset, nodeId);
      });
    }
  }

  Object.entries(itemsRequested)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([id, count], index) => {
      // Root nodes use their own ID and start at a vertical offset
      traverse(id, count, 0, index * 3);
    });

  return { nodes, edges };
}
