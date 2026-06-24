# MaintOps Web Console

English | [Spanish](README.es.md)

MaintOps Web Console is a Vue 3 frontend for a vehicle maintenance operations platform. It is designed as the web entry point of a portfolio-grade ecosystem that also includes backend APIs, realtime communication, and analytics services.

This repository is intentionally documented as an engineering portfolio piece. The focus is not only the UI that appears on screen, but also the decisions behind the stack, folder structure, execution model, and integration boundaries.

## Portfolio Highlights

- Responsive admin shell built with Vue 3, Vite, Tailwind CSS 4, and Pinia.
- Product-specific `MaintOps Console` branding on top of a proven admin UI foundation.
- Docker-first development so the project can run without Node installed on the host.
- Clear separation between visual shell, routing, shared state, and reusable components.
- API configuration through environment variables instead of hardcoded service URLs.
- Frontend UX designed around backend-owned authorization, keeping Laravel as the security boundary.
- Role-aware navigation and action availability that mirrors backend policies for a clearer console UX.

## Why Admin One

Operational dashboards need a dependable shell before domain workflows can feel professional: sidebar navigation, topbar behavior, mobile responsiveness, dark mode, cards, tables, forms, and empty states all have to work consistently.

Admin One Vue Tailwind is used as the visual foundation because it provides that commodity admin experience with Vue 3, Vite, Tailwind CSS 4, reusable components, dark mode support, and an MIT license.

The template is not treated as product architecture. Demo pages, sample data, promotional links, and template-specific branding are removed. MaintOps keeps the responsive UI foundation and defines its own product language, routes, execution setup, and integration model.

## Current Scope

The current bootstrap includes:

- Vue 3, Vite, Tailwind CSS 4, and Pinia.
- `MaintOps Console` metadata, favicon, title, sidebar, and header branding.
- MaintOps navigation groups for operations, maintenance, orders, and access.
- Responsive topbar with contextual titles and a notification placeholder.
- Dashboard, list, form, detail, and empty-state layout patterns.
- Base UI components for pages, badges, dropdowns, responsive tables, and empty states.
- Shared Axios client with Bearer token injection and Laravel-style error normalization.
- Query helpers for filters, search, page, and pagination payloads.
- JSDoc contracts for API responses, pagination, roles, users, and normalized errors.
- Login, logout, `/auth/me`, Pinia session hydration, private route guards, and non-interactive role blocking.
- Frontend permission matrices for routes, CRUD actions, assignable roles, audit access, Analytics visibility, and order status actions.
- Users module with HTTP service, filters, pagination, detail view, create form, edit form, role-aware actions, and searchable paginated workshop lookup.
- Owners module with HTTP service, search and status filters, pagination, detail view, create form, edit form, and policy-aware delete actions.
- Docker and Docker Compose files for local execution.
- `.env.example` with `VITE_API_BASE_URL`.
- English and Spanish README documentation.

## Architecture Decisions

### Folder Strategy

The current structure is compact and separates reusable UI primitives, layout shells, route definitions, shared state, and page-level views.

```text
src/
  api/         Axios client, error normalization, query helpers, and API exports.
  auth/        Role permission matrices and frontend UX helpers.
  components/  Reusable UI primitives and layout pieces.
  components/ui/  MaintOps-specific page, table, badge, dropdown, and empty-state components.
  config/      Runtime API configuration derived from Vite environment variables.
  css/         Tailwind entrypoint and style variants.
  layouts/     Authenticated and guest shells.
  router/      Console route definitions.
  stores/      Shared Pinia state.
  modules/auth/  Authentication service and login view.
  modules/owners/  Owner service, list, detail, and form views.
  modules/users/  User service, list, detail, and form views.
  types/       JSDoc domain and API contracts.
  views/       Page-level views.
```

This structure keeps the bootstrap easy to inspect: layout behavior lives in `layouts`, navigation and route mapping live in `router` and menu files, and view content stays in `views`.

### Integration Boundary

The frontend reads its API base URL from `VITE_API_BASE_URL`. That keeps the web app portable across local, Docker, and deployed environments.

Authorization-sensitive behavior belongs to the backend. The frontend can improve usability by hiding unavailable routes and actions, but it does not replace backend policies or validation.

The frontend permission layer mirrors backend intent for route visibility, create/update/delete actions, assignable roles, audit access, Analytics visibility, and order/order-item status actions. That keeps the console role-aware while preserving the API as the source of truth.

### Interface Language

The administrative panel was intentionally built in English to reflect the language commonly used in international software teams and enterprise applications. Spanish documentation is provided separately so the technical rationale remains accessible in both languages.

### Docker-First Execution

The repository includes a `Dockerfile`, `docker-compose.yml`, `.dockerignore`, and `.env.example` so the app can be reviewed and run with Docker as the primary workflow. Local Node remains available as an alternative, not a requirement.

## Ecosystem Context

MaintOps is organized as a multi-service system:

- Web console for the operational user experience.
- Laravel API for authentication, business data, policies, and audit trails.
- Realtime service for live operational updates.
- Analytics service for operational metrics and recommendations.

This repository owns the web console and the frontend integration surface.

## Requirements

- Docker Engine or Docker Desktop with Docker Compose.

You do not need Node or npm installed on the host when using Docker.

## Environment Variables

Create a local `.env` from `.env.example` and adjust the API URL if the backend uses a different port:

```dotenv
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Run With Docker

Start the console:

```bash
docker compose up -d --build
```

Open:

```text
http://localhost:5173
```

View logs:

```bash
docker compose logs -f frontend
```

Stop:

```bash
docker compose down
```

## Local Node Alternative

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## Attribution

The visual foundation uses Admin One Vue Tailwind, distributed under the MIT license by JustBoil.me.
