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
- Responsive topbar with contextual titles, realtime status, and a persistent notification center.
- Dashboard, list, form, detail, and empty-state layout patterns.
- Base UI components for pages, badges, dropdowns, responsive tables, and empty states.
- Shared Axios client with Bearer token injection and Laravel-style error normalization.
- Query helpers for filters, search, page, and pagination payloads.
- JSDoc contracts for API responses, pagination, roles, users, and normalized errors.
- Login, logout, password recovery, `/auth/me`, Pinia session hydration, private route guards, and non-interactive role blocking.
- Frontend permission matrices for routes, CRUD actions, assignable roles, audit access, Analytics visibility, and order status actions.
- Operational dashboard with Laravel-backed metrics, today's orders, upcoming orders, status counts, and role-scoped workload sections.
- Authenticated realtime lifecycle with Laravel-issued short-lived tokens, Socket.IO status, renewal, cleanup, and presence tracking.
- Operational realtime events that refresh dashboard, order lists, and order details without exposing room management in the browser.
- Persistent notification center for order and item events, with individual dismiss and mark-all-as-read actions.
- Administrative Analytics module with Laravel-issued service tokens, FastAPI consumption, observed metrics, workload forecasts, risk alerts, and recommendations.
- Users module with HTTP service, filters, pagination, detail view, create form, edit form, role-aware actions, and searchable paginated workshop lookup.
- Owners module with HTTP service, search and status filters, pagination, detail view, create form, edit form, and policy-aware delete actions.
- Vehicles module with HTTP service, advanced filters, pagination, detail view, create form, edit form, owner lookup, and policy-aware delete actions.
- Workshops module with HTTP service, advanced filters, manager lookup, vehicle systems, technician assignment, weekly schedule, and policy-aware actions.
- Maintenance tasks module with HTTP service, status filters, vehicle-system lookup, vehicle lookup, reusable task scope, advisor restrictions, and policy-aware actions.
- Maintenance plans module with HTTP service, task lookup, grouped task selection, recommended intervals, detail view, filters, and policy-aware actions.
- Maintenance orders module with HTTP services, advanced filters, assignment detail, paginated lists, item visibility inside each order, and role-safe status transitions.
- Order item status actions filtered by role, current state, and public endpoint availability from the order detail workflow.
- Audit log module with HTTP service, filters, pagination, change inspection, and super-admin-only visibility.
- Docker and Docker Compose files for local execution.
- `.env.example` with `FRONTEND_ALLOWED_HOSTS`, `VITE_API_BASE_URL`, `VITE_REALTIME_URL`, and `VITE_ANALYTICS_BASE_URL`.
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
  modules/auth/  Authentication service, login view, and password recovery views.
  modules/audits/  Audit service and super-admin traceability view.
  modules/analytics/  Analytics token service, FastAPI client, and administrative analytics view.
  modules/dashboard/  Operational dashboard service.
  modules/maintenance-orders/  Order and order-item services, status rules, list, detail, and form views.
  modules/maintenance-plans/  Maintenance plan service, list, detail, and form views.
  modules/maintenance-tasks/  Maintenance task service, list, detail, and form views.
  modules/realtime/  Realtime token, Socket.IO lifecycle, event listeners, notifications, status, and presence services.
  modules/owners/  Owner service, list, detail, and form views.
  modules/users/  User service, list, detail, and form views.
  modules/vehicles/  Vehicle service, list, detail, and form views.
  modules/vehicle-systems/  Vehicle system lookup service.
  modules/workshops/  Workshop service, list, detail, and form views.
  types/       JSDoc domain and API contracts.
  views/       Page-level views.
```

This structure keeps the bootstrap easy to inspect: layout behavior lives in `layouts`, navigation and route mapping live in `router` and menu files, and view content stays in `views`.

### Integration Boundary

The frontend reads service URLs from `VITE_API_BASE_URL`, `VITE_REALTIME_URL`, and `VITE_ANALYTICS_BASE_URL`. Vite development hosts are controlled through `FRONTEND_ALLOWED_HOSTS`. That keeps the web app portable across local, Docker, and deployed environments.

Authorization-sensitive behavior belongs to the backend. The frontend can improve usability by hiding unavailable routes and actions, but it does not replace backend policies or validation.

The frontend permission layer mirrors backend intent for route visibility, create/update/delete actions, assignable roles, audit access, Analytics visibility, and order/order-item status actions. That keeps the console role-aware while preserving the API as the source of truth.

Realtime uses short-lived tokens issued by Laravel through the authenticated API. The browser does not send the Sanctum token to Socket.IO; it requests a dedicated realtime token and sends it to the gateway during the Socket.IO handshake.

Operational event payloads are treated as backend-owned facts. The frontend parses authorized order and order-item events, deduplicates them by event id, and refetches the affected views instead of mutating complex domain state locally.

Realtime notifications are stored per authenticated user in the browser and remain visible until marked as read. Order and item events are visually differentiated, and item notifications include the task name when the backend event provides it.

Analytics uses short-lived service tokens issued by Laravel through the authenticated API. The browser calls FastAPI Analytics with that dedicated token, never with the main Laravel session token. The Analytics screen is available only through the frontend permission matrix for `super_admin` and `admin` users, while Laravel and Analytics still enforce the real authorization boundary.

Password recovery uses the public Laravel auth endpoints. The browser requests a reset email through `/auth/forgot-password`, receives the reset token through the email link, and submits the new password to `/auth/reset-password`. The frontend supports both hash URLs and direct `/reset-password` links generated by the API.

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

Create a local `.env` from `.env.example` and adjust service URLs if the backend, realtime gateway, or Analytics service use different ports:

```dotenv
FRONTEND_ALLOWED_HOSTS=localhost,127.0.0.1
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_REALTIME_URL=http://localhost:3000
VITE_ANALYTICS_BASE_URL=http://localhost:8001
```

For a public demo deployment, replace the local URLs with externally reachable service URLs and set `FRONTEND_ALLOWED_HOSTS` to the hostnames that should be accepted by the Vite dev server.

## Public Demo Notes

- Use sample data only. Public demo environments should not receive real personal, customer, workshop, or vehicle data.
- The browser talks to Laravel, the realtime gateway, and Analytics through the public URLs configured above.
- Laravel remains the authorization source of truth; frontend role checks only improve navigation and action visibility.
- Connectivity failures are normalized into clear API availability messages so reviewers can distinguish a service outage from an application error.

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
