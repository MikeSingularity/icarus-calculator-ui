import { create } from 'zustand';

interface RegistryState {
  nodes: Record<string, { itemId: string; rect: DOMRect }>;
  materials: Record<string, { itemId: string; rect: DOMRect }>;
  
  registerNode: (id: string, itemId: string, rect: DOMRect) => void;
  registerMaterial: (itemId: string, rect: DOMRect) => void;
  unregisterNode: (id: string) => void;
  unregisterMaterial: (itemId: string) => void;
}

/**
 * useRegistryStore
 * 
 * Tracks DOM positions of nodes and material list items to draw connections across panes.
 */
export const useRegistryStore = create<RegistryState>((set) => ({
  nodes: {},
  materials: {},

  registerNode: (id, itemId, rect) => set(state => ({
    nodes: { ...state.nodes, [id]: { itemId, rect } }
  })),

  registerMaterial: (itemId, rect) => set(state => ({
    materials: { ...state.materials, [itemId]: { itemId, rect } }
  })),

  unregisterNode: (id) => set(state => {
    const next = { ...state.nodes };
    delete next[id];
    return { nodes: next };
  }),

  unregisterMaterial: (itemId) => set(state => {
    const next = { ...state.materials };
    delete next[itemId];
    return { materials: next };
  })
}));
