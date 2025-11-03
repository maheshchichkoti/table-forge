# Cosmos Realm User Directory

A production-ready full-stack React + Express application for exploring and organizing user data. The app ships with a polished drag-and-drop table experience, persistent ordering, advanced filtering, and responsive layouts.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, TailwindCSS, Radix UI, Lucide Icons
- **State & Data:** React Query, React Hook Form
- **Backend:** Express 5 (integrated with the Vite dev server)
- **Tooling:** pnpm, PostCSS, SWC, Vitest, TypeScript

## Project Structure

```text
client/                     # SPA source (routes live in client/pages)
  pages/                    # Page-level components (Index.tsx = User Directory)
  components/               # Reusable UI primitives and composite components
  global.css                # Tailwind theme tokens & global styles

server/                     # Express server integrated with Vite
  index.ts                  # Server bootstrap and middleware wiring
  routes/                   # API route handlers

shared/                     # Shared TypeScript types for client/server parity

public/                     # Static assets served by Vite

vite.config.ts              # Dev server config (Express middleware + aliases)
vite.config.server.ts       # Server bundle build config
tailwind.config.ts          # Tailwind theme configuration
```

## Prerequisites

- Node.js 18+
- pnpm (preferred package manager)

## Setup

1. **Install pnpm** (if needed)
   ```bash
   npm install -g pnpm
   ```
2. **Install dependencies**
   ```bash
   pnpm install
   ```
3. **Start the dev server (SPA + API)**
   ```bash
   pnpm dev
   ```
   The app runs on [http://localhost:8080](http://localhost:8080), serving both the Vite SPA and the Express API.
4. **Run the test suite**
   ```bash
   pnpm test
   ```
5. **Type-check & format**
   ```bash
   pnpm typecheck
   pnpm format.fix
   ```

## Production Build

```bash
pnpm build         # Runs client and server builds
pnpm start         # Starts the compiled Express server (uses dist/)
```

- `pnpm build:client` bundles the SPA into `dist/spa`
- `pnpm build:server` outputs the Express server to `dist/server`

## Key Features

- Drag-and-drop table rows with hover-only handles and subtle drop cues
- Persisted row order via `localStorage`
- Advanced filtering (search, gender, country) and column sorting
- Responsive layout with mobile card views and accessible interactions
- Express middleware composed directly into the Vite dev server for unified DX

## Packaging for Delivery

- **Zip archive:** ensure the lockfile is current (`pnpm install`), then zip the project directory (you may omit `node_modules/`).
- **GitHub repository:** `git init`, commit the source, and push to your remote.

Deliverables should include:
- Full source code (client, server, shared, configuration files)
- This `README.md`
- `pnpm-lock.yaml` for deterministic installs

## Future Improvements

- Extract table and drag/drop logic into reusable components backed by unit tests
- Add error boundaries and loading skeletons for improved resiliency
- Expand the API layer with pagination/caching backed by a real datastore
- Integrate automated accessibility checks (e.g., axe) into CI
- Add Storybook or visual regression coverage for the design system

## Notes

Environment variables can be managed via `.env` files—avoid committing secrets. When deploying, run `pnpm build` so the compiled server (`dist/server`) and SPA assets (`dist/spa`) are ready for hosting.
