# 🛰️ Icarus Calculator UI

> **Advanced Crafting Intelligence for the Icarus Ecosystem (2026 Edition)**

Welcome to the modernized **Icarus Calculator UI**, a high-performance React application designed to streamline resource planning and recipe analysis for planetary survival.

## 🚀 Tech Stack (ADR-001 Ready)

This project has been upgraded to the modern **2026 Toolchain** to ensure maximum stability and performance:

- **Core:** [React 19](https://react.dev) (Standard)
- **Bundler:** [Vite 8](https://vitejs.dev) (Turbocharged)
- **Linting:** [ESLint 10](https://eslint.org) (Flat-Config Architecture)
- **Testing:** [Vitest v4](https://vitest.dev) (Vite-Native)
- **Styling:** Vanilla CSS (Glassmorphism & Rich Aesthetics)
- **Deployment:** [Cloudflare Pages](https://pages.cloudflare.com/) (Edge Optimized)
- **Node Graph:** [React Flow](https://reactflow.dev/) (DAG Architecture)

## ✨ Features (2026 Edition)

- **Goal Quantity Editing:** Directly set the quantity of top-level items in the workspace. All dependencies scale automatically.
- **Refined Tier Filtering:** Tier filters now correctly include fractional game tiers (e.g., Tier 3.5 items appear in the Tier 3 filter).
- **DAG Layout:** Professional hierarchical layout using the Dagre engine for balanced vertical centering.
- **Recipe Filtering:** Automatically filters out mission-specific and quest recipes for a clean production experience.

## 🛠 Usage

### Development

```bash
# Start the dev server
npm run dev
```

### Verification

```bash
# Run the 2026 standard linting suite
bash scripts/lint.sh

# Execute the Vitest test suite with coverage
bash scripts/test.sh
```

## 🛠 Configuration

This project supports dynamic data sourcing via environment variables:

- **`VITE_DATA_URL`**: (Optional) The full URL (`https://` or `file:///`) to the `data_calculator_min.json` file. Defaults to the local `/data_source/` path.

## 🏗 Architecture & Design

- **[Software Design Document](docs/software-design-document.md)**: Detailed overview of the node-based workspace and reactive dependency sink.
- **[ADR-001](docs/architecture-decisions/ADR-001.md)**: Metadata on the React 19 / Vite 8 infrastructure overhaul.

---

© 2026 Icarus Mission Control
