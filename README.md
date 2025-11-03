# Cosmos Realm User Directory

A production-ready full-stack React + Express application for exploring and organizing user data. This project is built on the Fusion Starter template and includes a polished drag-and-drop table experience with persistent ordering, advanced filtering, and responsive layouts.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, TailwindCSS, Radix UI, Lucide Icons
- **State & Data:** React Query, React Hook Form
- **Backend:** Express 5 (integrated with Vite dev server)
- **Build Tooling:** pnpm, PostCSS, SWC, Vitest, TypeScript

## Project Structure

client/ # SPA source (routes in client/pages) pages/ # Page-level components (Index.tsx = User Directory) components/ # Reusable UI primitives and composite components global.css # Tailwind theme tokens & globals

server/ # Express server integrated with Vite index.ts # Server bootstrap and route wiring routes/ # API handlers

shared/ # Shared TypeScript types for client/server parity

public/ # Static assets served by Vite

vite.config.ts # Dev server config (Express middleware + aliases) vite.config.server.ts # Server bundle build config tailwind.config.ts # Tailwind theme configuration


## Getting Started

1. **Install pnpm** (if not already installed):
   ```bash
   npm install -g pnpm
Install dependencies:
bash
pnpm install
Start the dev server (client + API):
bash
pnpm dev
The app runs on http://localhost:8080 with both Vite SPA and Express API on a single port.
Build for production:
bash
pnpm build
pnpm build:client bundles the SPA into dist/spa
pnpm build:server builds the Express server into dist/server
Run production build locally:
bash
pnpm start
Run tests:
bash
pnpm test
Type-check & formatting:
bash
pnpm typecheck
pnpm format.fix
Key Features
Drag-and-drop table rows with hover-only handles, subtle drop cues, and persisted ordering via localStorage
Advanced filtering (search, gender, country) and column sorting
Responsive layout with mobile card view and accessible interactions
Express middleware composed directly into the Vite dev server for unified DX
Packaging for Delivery
Zip archive: run pnpm install to ensure lockfiles are up to date, then compress the entire project directory (excluding 
node_modules/
 if desired) into a .zip.
GitHub repository: initialize a repo (git init), commit the project files, and push to a GitHub remote.
Both delivery options must include:

Full source code (client, server, shared, configs)
This README.md
Lockfile (
pnpm-lock.yaml
 preferred) for deterministic installs
Future Improvements
Extract table and drag-drop logic into dedicated reusable components with unit tests
Add error boundaries and loading skeletons for improved resiliency
Expand API layer with caching or pagination endpoints, backed by a real datastore
Integrate automated accessibility checks (e.g., axe) into CI
Add Storybook or visual regression coverage for the design system