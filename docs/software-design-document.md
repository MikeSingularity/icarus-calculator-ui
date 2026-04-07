# 🗺 Software Design Document: Icarus Production Planner (UI)

## 1. Requirements & Scope

The **Icarus Production Planner** is a specialized tool for players to manage complex, multi-stage crafting projects. The primary goal is to provide a visual, interactive workspace for decomposing high-tier crafting requirements.

### Phase 1: Core Functionality

- **Node-Based Workspace:** Interactive canvas for visualizing the Recipe Graph.
- **Automated Tree Expansion:** Recursively resolve crafting requirements from a single root item.
- **Material Aggregation:** Real-time summation of "Leaf" (raw) requirements.
- **Dynamic Connection Overlay:** Visual links between the workspace and the material checklist.

### Phase 2: User Controls & Persistence

- **Recipe Overrides:** Support for alternate crafting recipes (e.g., choice of fuels).
- **Infinite Scroll/Pan:** High-performance workspace exploration.
- **Local Persistence:** Automatic workspace recovery via `localStorage`.
- **Export/Import:** `.icarus` session files for plan sharing.

## 2. High-Level Architecture

The application follows a **Decoupled Dual-Pane Architecture** with a reactive central state store.

### Workspace (Left Pane)

- **Engine:** `React Flow` (XYFlow).
- **Core Unit:** `RecipeNode.tsx` - Represents a single item in the crafting chain.
- **Logic:** `buildGraph.ts` - Maps requested items into a visual DAG (Directed Acyclic Graph).

### Material Sidebar (Right Pane)

- **Role:** The "Dependency Sink". Sums all materials flagged as "Leaf" nodes.
- **Logic:** `getBillOfMaterials` (Zustand selector) - Aggregates requirements from the current graph state.

### Dynamic Linker (SVG Overlay)

- **Function:** Draws smooth Bezier curves between workspace leaf nodes and sidebar items.
- **Update Frequency:** Runs on `requestAnimationFrame` for stutter-free scrolling.

---

## 3. Data Models & Interface

### 3.1 Game Data Source

- **Format:** `data_calculator_min.json` (approx. 3MB).
- **Provider:** `DataAdapter.ts` singleton.
- **Dynamic URL:** Fetched from `VITE_DATA_URL` (supports `https://` or `file:///` protocols).

### 3.2 State Store (`usePlanStore.ts`)

```typescript
interface PlanState {
  itemsRequested: Record<string, number>; // itemId -> total count
  recipeOverrides: Record<string, string>; // itemId -> forced recipeId
  checkedNodes: Set<string>; // nodeId -> completion status
  nodePositions: Record<string, { x: number; y: number }>;
}
```

### 3.3 Node Uniqueness

- **Path-Based IDs:** To handle cycles and multiple instances of the same item, nodes are identified by their path: `RootItemId.Index_ChildItemId.Index_...`.

---

## 4. Component Descriptions & Logic

### 4.1 DataAdapter

- Handles AST-like traversal and caching of game items/recipes.
- Implements **Smart Leaf Detection**:
  - Item is a "Leaf" if it is a Raw Material, Ingot, Generic Category, or has zero recipes.
  - Item is _temporarily_ a "Leaf" if the user has marked its node as **Done** in the graph.

### 4.2 Graph Builder

- **Recursion Safety:** Implements a `MAX_DEPTH = 20` threshold.
- **Algorithm:** Depth-First Search (DFS) that expands nodes based on the active recipe selection.
- **Layout:** Horizontal expansion (Left-to-Right) based on depth.

### 4.3 Workspace Navigation

- Uses standard React Flow pan/zoom.
- `CommandPalette` (⌘ + K) for fuzzy-searching items and injecting new root nodes.

---

## 5. Associated Decisions

- **ADR-001:** Upgraded tech stack to React 19 / Vite 8 for ESM compatibility.
- **Design Decision (2026-04-06):** Adopted `VITE_DATA_URL` for flexible deployment across Cloudflare Pages and Local Dev.
- **Security:** Strict `isLeaf` checks stop the plan from expanding into infinite cycles (e.g., recursive bio-fuel loops).
