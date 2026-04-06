This `ux-design.md` represents the senior-level implementation strategy for the Icarus Production Planner. It focuses on a **node-based workspace** architecture to handle the complex directed acyclic graph (DAG) of Icarus crafting.

---

# UX Design — Icarus Production Planner

## 1. Purpose and Context
The **Icarus Production Planner** is a specialized tool for players to manage complex, multi-stage crafting projects (primarily Tier 4 and Tier 5). The design emphasizes **spatial logic**: visualizing how raw materials transform into final products through an interactive workspace.

### Primary Use Cases:
*   **Targeted Building:** Planning the exact roadmap for advanced items (e.g., Electric Furnaces, Solar Panels, Extractors).
*   **Visual Logic:** Understanding the "tree" of intermediate crafts required for a final output.
*   **Resource Aggregation:** Seeing the single "Total Cost" of a complex multi-item build in real-time.

---

## 2. Architecture & Stack
To maintain a zero-cost, high-performance infrastructure, the application uses a decoupled static architecture.

*   **Hosting:** Cloudflare Pages (CDN-backed SPA).
*   **Frontend:** React + TypeScript (Vite).
*   **Canvas Engine:** React Flow (XYFlow) for interactive node management.
*   **Data Layer:** Minified JSON (`data_calculator_min.json`) fetched from a GitHub Pages repository.
*   **State Persistence:** Local storage for workspace state; exportable `.icarus` JSON files for session sharing.

---

## 3. The Dual-Pane Workspace Strategy
The UI is divided into two primary panes that share state via a reactive "dependency sink."

### 3.1 Pane 1: Recipe Workspace (The "Graph")
*   **Infinite Canvas:** A node-based editor (Left Pane) where users search for and add items.
*   **Automated Expansion:** Adding a recipe node recursively spawns its sub-tree of requirements down to raw materials.
*   **Control Nodes:** Each node includes:
    *   **Quantity Selector:** Adjusting the pro-rata requirements of the entire sub-tree.
    *   **Recipe Toggle:** Switching between alternate recipes (e.g., opting for Carbon Paste vs. Charcoal).
    *   **Done Toggle:** "Rolling up" a node, which collapses its children and marks that segment of the plan as satisfied.

### 3.2 Pane 2: Material Sidebar (The "Sink")
*   **Aggregated Totals:** A persistent list (Right Pane) that sums all raw materials needed by the terminal branches in the workspace.
*   **Dynamic Connectivity:** Visual SVG "Bezier" lines connect nodes in the workspace to their corresponding requirements in the sidebar. These lines move dynamically as the user pans or scrolls.
*   **Visual Feedback:** Items in the sidebar update instantly as quantities or recipe choices change in the workspace.

### 3.3 The Command Palette (⌘ + K)
*   **Access:** Global hotkey to open a fuzzy-search dialog.
*   **Filtering:** Items can be filtered by Tier (1–5) to reduce search noise.
*   **Immediate Action:** Selecting an item injects a new root node into the workspace and triggers the recursive tree builder.

---

## 4. Technical Logic & UX Flow

### 4.1 "Leaf" Connectivity
The system differentiates between "Intermediate" nodes and "Leaf" (Terminal) nodes.
*   A node is a **Leaf** if it is a raw material, a generic category, or is marked as **Done**.
*   **Only Leaf nodes** draw connections to the Material Sidebar. This ensures the user is always focused on what they *currently* need to gather, not what they have already processed.

### 4.2 State Management
*   **The Store:** Manages `itemsRequested`, `recipeOverrides`, and `checkedNodes`.
*   **Coordinate Registry:** Tracks DOM bounding boxes of workspace nodes and sidebar items to calculate SVG path points in real-time.

### 4.3 Visual Principles
*   **Premium Aesthetic:** Dark-mode/High-contrast (Slate/Obsidian base) with **vibrant accent colors** (Blue/Purple) and **glassmorphism** blur effects.
*   **Micro-animations:** Edges in the tree are animated (dashed flow) when the production path is "active" and solid/dimmed when satisfied.

---

## 5. Implementation Guidelines
*   **Data Adaptation:** Use a singleton `DataAdapter` to index and resolve item/recipe relationships from the ~3MB JSON dataset.
*   **Performance:** Use a `requestAnimationFrame` loop for drawing the Dynamic Linker paths to ensure zero-lag scrolling.
*   **Modularity:** Keep the `WorkspacePane` (React Flow) decoupled from the `MaterialPane` (Checklist) logic, communicating only via the global state store.