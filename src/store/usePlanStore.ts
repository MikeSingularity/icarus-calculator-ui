import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { dataAdapter } from '../services/dataAdapter';
import { Ingredient } from '../types/data';

interface PlanState {
  itemsRequested: Record<string, number>; // itemId -> quantity
  recipeOverrides: Record<string, string>; // itemId -> recipeId
  checkedNodes: Set<string>; // nodeId -> isDone
  nodePositions: Record<string, { x: number; y: number }>; // nodeId -> position

  // Actions
  addItem: (id: string, count: number) => void;
  removeItem: (id: string) => void;
  setRecipe: (itemId: string, recipeId: string) => void;
  toggleDone: (id: string) => void;
  setNodePosition: (id: string, x: number, y: number) => void;
  clearPlan: () => void;

  // Computed
  getBillOfMaterials: () => Ingredient[];
}

/**
 * usePlanStore
 *
 * Global state store for the Icarus Production Planner.
 */
export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      itemsRequested: {},
      recipeOverrides: {},
      checkedNodes: new Set<string>(),
      nodePositions: {},

      addItem: (id, count) =>
        set((state) => ({
          itemsRequested: {
            ...state.itemsRequested,
            [id]: (state.itemsRequested[id] || 0) + count,
          },
        })),

      removeItem: (id) =>
        set((state) => {
          const next = { ...state.itemsRequested };
          delete next[id];
          return { itemsRequested: next };
        }),

      setRecipe: (itemId, recipeId) =>
        set((state) => ({
          recipeOverrides: { ...state.recipeOverrides, [itemId]: recipeId },
        })),

      toggleDone: (id) =>
        set((state) => {
          const next = new Set(state.checkedNodes);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return { checkedNodes: next };
        }),

      setNodePosition: (id, x, y) =>
        set((state) => ({
          nodePositions: { ...state.nodePositions, [id]: { x, y } },
        })),

      clearPlan: () =>
        set({
          itemsRequested: {},
          recipeOverrides: {},
          checkedNodes: new Set(),
          nodePositions: {},
        }),

      getBillOfMaterials: () => {
        const { itemsRequested, recipeOverrides, checkedNodes } = get();
        const totals: Record<string, number> = {};

        function resolve(id: string, count: number, yOffset: number, parentId = '') {
          const nodeId = parentId ? `${parentId}.${yOffset}_${id}` : id;

          // If user marked this specific node as "Done", we stop going down.
          if (checkedNodes.has(nodeId)) {
            return;
          }

          // Smart Leaf Detection: raw materials, ingots, generics, or no-recipe items
          if (dataAdapter.isLeaf(id)) {
            totals[id] = (totals[id] || 0) + count;
            return;
          }

          const item = dataAdapter.getItem(id);
          if (!item) return;

          // Select recipe: override or default.
          const recipeId = recipeOverrides[id] || item.recipes?.[0];
          const recipe = recipeId ? dataAdapter.getRecipe(recipeId) : null;

          if (!recipe) {
            totals[id] = (totals[id] || 0) + count;
            return;
          }

          // Pro-rata distribution (outputs vs inputs)
          const outputCount =
            recipe.outputs.find((o: { id: string; count: number }) => o.id === id)?.count || 1;
          const factor = Math.ceil(count / outputCount);

          recipe.inputs.forEach((input: Ingredient, index: number) => {
            const childYOffset = yOffset + (index - (recipe.inputs.length - 1) / 2);
            resolve(input.id, input.count * factor, childYOffset, nodeId);
          });
        }

        Object.entries(itemsRequested)
          .sort(([a], [b]) => a.localeCompare(b))
          .forEach(([id, count], index) => {
            resolve(id, count, index * 3);
          });

        return Object.entries(totals).map(([id, count]) => ({ id, count }));
      },
    }),
    {
      name: 'icarus-plan-storage',
      storage: {
        getItem: (name: string) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const data = JSON.parse(str);
          return {
            ...data,
            state: {
              ...data.state,
              checkedNodes: new Set(data.state.checkedNodes),
            },
          };
        },
        setItem: (name: string, value: any) => {
          const data = {
            ...value,
            state: {
              ...value.state,
              checkedNodes: Array.from(value.state.checkedNodes),
            },
          };
          localStorage.setItem(name, JSON.stringify(data));
        },
        removeItem: (name: string) => localStorage.removeItem(name),
      },
    }
  )
);
