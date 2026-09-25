# AnchorNode Console

> **Self-Healing Distributed Storage System for AI/ML Workloads**

AnchorNode is an enterprise-grade distributed storage cluster dashboard designed for high-performance AI infrastructure. It manages training datasets, model checkpoints, embedding indexes, and evaluation artifacts with 3x quorum replication, continuous SHA-256 integrity scrubbing, and automated self-healing failover.

![AnchorNode Logo](/public/anchornode-logo.png)

---

## Features

- **Interactive Topology Visualization**: 6-node distributed mesh layout with real-time replication links and animated data packet streams.
- **Automated Self-Healing Engine**: 6-phase reconstruction pipeline (`Detecting failure` → `Selecting healthy replica` → `Streaming data` → `Verifying checksum` → `Finalizing replica` → `Marking node synchronized`).
- **Interactive Demo Controls**:
  - 1-Click failure & auto-healing demo
  - Kill Node simulation
  - Bit-Rot / Checksum mismatch simulation
  - Pause / Resume repair streams
  - Dynamic health checks (SHA-256 scrub sweep)
  - 1-Click environment reset
- **AI Storage Explorer**: Browse model checkpoints, datasets, embeddings, and artifacts with cryptographic hashes and 3x replica distribution maps.
- **N/W/R Quorum Configurator**: Dynamo-style tunable consistency with interactive latency vs. safety mathematical analyzer ($R + W > N$).
- **Hybrid Cloud Storage**: Policy-driven tiering between Vault Hot NVMe cluster and AWS S3 Cold archival buckets.
- **Audit Activity Ledger**: Comprehensive filterable event logs with JSON export.

---

## Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom Glassmorphism design system
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **State Management**: Centralized React Context Engine with simulated demo loop and REST/WebSocket API abstraction

---

## Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/anchornode-console.git
cd anchornode-console
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Production Build

To test and build the production bundle:
```bash
npm run build
npm run preview
```

---

## Project Structure

```
src/
├── components/
│   ├── cluster/       # 6-Node SVG mesh topology & animated particle streams
│   ├── common/        # Badges, Tooltips, Modals, Buttons, GlassCards, Toasts
│   ├── demo/          # Demo controls toolbar, Kill node modal, Corrupt data modal
│   ├── drawers/       # Node telemetry drawer & AI artifact inspector drawer
│   └── overview/      # Circular health hero gauge, Metric cards, Workload & Performance charts
├── layouts/           # AppLayout, Header with live clock, Sidebar navigation
├── pages/             # Overview, Nodes, Storage, Repairs, Consistency, Hybrid Cloud, Activity Log
├── services/          # REST API & WebSocket/SSE event stream abstraction
├── store/             # ClusterContext state machine & self-healing automation tick
├── types/             # Domain TypeScript interfaces
├── mock/              # Datasets, metrics time-series, and telemetry logs
└── utils/             # Quorum consistency formulas, formatters, SHA-256 helpers
```

---

## License

MIT
