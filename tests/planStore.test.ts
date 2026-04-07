import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usePlanStore } from '../src/store/usePlanStore';
import { dataAdapter } from '../src/services/dataAdapter';

// Mock localStorage for Vitest
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
(globalThis as any).localStorage = localStorageMock;

describe('usePlanStore - Garbage Collection', () => {
  beforeEach(() => {
    // Reset store
    usePlanStore.getState().clearPlan();

    // Mock dataAdapter methods
    const items: any = {
      axe: { id: 'axe' },
      wood: { id: 'wood' },
      stone: { id: 'stone' },
      campfire: { id: 'campfire' },
    };

    const recipes: any = {
      axe_recipe: {
        id: 'axe_recipe',
        outputs: [{ id: 'axe', count: 1 }],
        inputs: [
          { id: 'wood', count: 1 },
          { id: 'stone', count: 1 },
        ],
      },
      campfire_recipe: {
        id: 'campfire_recipe',
        outputs: [{ id: 'campfire', count: 1 }],
        inputs: [{ id: 'wood', count: 5 }],
      },
    };

    dataAdapter.getItem = vi.fn((id) => items[id]);
    dataAdapter.getRecipe = vi.fn((id) => recipes[id]);
    dataAdapter.isLeaf = vi.fn((id) => id === 'wood' || id === 'stone');

    // Ensure default recipes
    items['axe'].recipes = ['axe_recipe'];
    items['campfire'].recipes = ['campfire_recipe'];
  });

  it('should clear detached node state when target is removed', () => {
    const store = usePlanStore.getState();

    store.addItem('axe', 1);
    store.setNodePosition('axe', 100, 100);
    store.setNodePosition('wood', 200, 200);
    store.toggleDone('wood');

    expect(usePlanStore.getState().nodePositions['wood']).toBeDefined();
    expect(usePlanStore.getState().checkedNodes.has('wood')).toBe(true);

    // Remove target
    usePlanStore.getState().removeItem('axe');

    const state = usePlanStore.getState();
    expect(state.itemsRequested['axe']).toBeUndefined();
    expect(state.nodePositions['axe']).toBeUndefined();
    expect(state.nodePositions['wood']).toBeUndefined();
    expect(state.checkedNodes.has('wood')).toBe(false);
  });

  it('should preserve shared nodes during partial removal', () => {
    const store = usePlanStore.getState();

    store.addItem('axe', 1);
    store.addItem('campfire', 1);

    store.setNodePosition('wood', 500, 500);
    store.toggleDone('wood');

    // Remove one parent
    store.removeItem('axe');

    const state = usePlanStore.getState();
    expect(state.itemsRequested['axe']).toBeUndefined();
    expect(state.itemsRequested['campfire']).toBe(1);
    // wood should still be reachable from campfire
    expect(state.nodePositions['wood']).toBeDefined();
    expect(state.checkedNodes.has('wood')).toBe(true);

    // Remove last parent
    store.removeItem('campfire');
    expect(usePlanStore.getState().nodePositions['wood']).toBeUndefined();
  });

  it('should update quantity and preserve children', () => {
    const store = usePlanStore.getState();

    store.addItem('axe', 1);
    store.setNodePosition('wood', 500, 500);
    store.toggleDone('wood');

    // Update quantity
    store.setItemQuantity('axe', 10);

    const state = usePlanStore.getState();
    expect(state.itemsRequested['axe']).toBe(10);
    // wood should still be reachable
    expect(state.nodePositions['wood']).toBeDefined();
    expect(state.checkedNodes.has('wood')).toBe(true);

    // Set to 0 (should be clamped to 1)
    store.setItemQuantity('axe', 0);
    expect(usePlanStore.getState().itemsRequested['axe']).toBe(1);
  });
});
