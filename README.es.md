# Consola Web MaintOps

[Inglés](README.md) | Español

MaintOps Web Console es un frontend en Vue 3 para una plataforma de operaciones de mantenimiento vehicular. Está diseñado como el punto de entrada web de un ecosistema de nivel portafolio que también incluye APIs backend, comunicación realtime y servicios de analítica.

Este repositorio está documentado intencionalmente como pieza de portafolio de ingeniería. El foco no está solo en la UI que aparece en pantalla, sino también en las decisiones detrás del stack, la estructura de carpetas, el modelo de ejecución y las fronteras de integración.

## Puntos Destacados De Portafolio

- Shell administrativo responsive construido con Vue 3, Vite, Tailwind CSS 4 y Pinia.
- Branding propio `MaintOps Console` sobre una base visual administrativa probada.
- Desarrollo Docker-first para ejecutar el proyecto sin Node instalado en el host.
- Separación clara entre shell visual, rutas, estado compartido y componentes reutilizables.
- Configuración de API mediante variables de entorno en vez de URLs de servicio fijas.
- UX frontend diseñada alrededor de autorización controlada por backend, manteniendo Laravel como frontera de seguridad.
- Navegación y disponibilidad de acciones según rol, alineadas con las policies backend para una UX más clara.

## Por Qué Admin One

Los dashboards operativos necesitan un shell confiable antes de que los flujos de dominio se sientan profesionales: navegación lateral, comportamiento de topbar, responsividad móvil, modo oscuro, cards, tablas, formularios y estados vacíos deben funcionar de forma consistente.

Admin One Vue Tailwind se usa como base visual porque aporta esa experiencia administrativa común con Vue 3, Vite, Tailwind CSS 4, componentes reutilizables, soporte de modo oscuro y licencia MIT.

El template no se trata como arquitectura de producto. Se eliminan páginas demo, datos de ejemplo, enlaces promocionales y branding propio del template. MaintOps conserva la base UI responsive y define su propio lenguaje de producto, rutas, configuración de ejecución y modelo de integración.

## Alcance Actual

El bootstrap actual incluye:

- Vue 3, Vite, Tailwind CSS 4 y Pinia.
- Metadata, favicon, título, sidebar y header con branding `MaintOps Console`.
- Grupos de navegación MaintOps para operaciones, mantenimiento, órdenes y acceso.
- Topbar responsive con títulos contextuales y placeholder de notificaciones.
- Patrones de layout para dashboard, listado, formulario, detalle y estado vacío.
- Componentes UI base para páginas, badges, dropdowns, tablas responsive y estados vacíos.
- Cliente Axios compartido con inyección de token Bearer y normalización de errores estilo Laravel.
- Helpers de consulta para filtros, búsqueda, página y payloads de paginación.
- Contratos JSDoc para respuestas de API, paginación, roles, usuarios y errores normalizados.
- Login, logout, `/auth/me`, hidratación de sesión con Pinia, guards de rutas privadas y bloqueo de roles no interactivos.
- Matrices frontend de permisos para rutas, acciones CRUD, roles asignables, acceso a auditoría, visibilidad de Analytics y acciones de estado de órdenes.
- Módulo de usuarios con servicio HTTP, filtros, paginación, detalle, formularios, acciones según rol y búsqueda paginada de talleres.
- Módulo de propietarios con servicio HTTP, filtros por búsqueda y estado, paginación, detalle, formularios y acciones de eliminación según permisos.
- Archivos Docker y Docker Compose para ejecución local.
- `.env.example` con `VITE_API_BASE_URL`.
- Documentación README en inglés y español.

## Decisiones De Arquitectura

### Estrategia De Carpetas

La estructura actual es compacta y separa primitivas UI reutilizables, shells de layout, definición de rutas, estado compartido y vistas de página.

```text
src/
  api/         Cliente Axios, normalización de errores, helpers de consulta y exports de API.
  auth/        Matrices de permisos por rol y helpers de UX frontend.
  components/  Primitivas UI reutilizables y piezas de layout.
  components/ui/  Componentes MaintOps para páginas, tablas, badges, dropdowns y estados vacíos.
  config/      Configuración runtime de API derivada de variables de entorno de Vite.
  css/         Punto de entrada de Tailwind y variantes de estilo.
  layouts/     Shells autenticado e invitado.
  router/      Definiciones de rutas de la consola.
  stores/      Estado compartido con Pinia.
  modules/auth/  Servicio de autenticación y vista de login.
  modules/owners/  Servicio de propietarios, listado, detalle y formularios.
  modules/users/  Servicio de usuarios, listado, detalle y formularios.
  types/       Contratos JSDoc de dominio y API.
  views/       Vistas de página.
```

Esta estructura mantiene el bootstrap fácil de revisar: el comportamiento de layout vive en `layouts`, la navegación y el mapeo de rutas viven en `router` y archivos de menú, y el contenido de pantalla permanece en `views`.

### Frontera De Integración

El frontend lee la URL base de API desde `VITE_API_BASE_URL`. Eso mantiene la app web portable entre entornos locales, Docker y despliegues.

El comportamiento sensible a autorización pertenece al backend. El frontend puede mejorar la usabilidad ocultando rutas y acciones no disponibles, pero no reemplaza políticas ni validaciones del backend.

La capa de permisos frontend refleja la intención del backend para visibilidad de rutas, acciones de crear/actualizar/eliminar, roles asignables, acceso a auditoría, visibilidad de Analytics y acciones de estado de órdenes e ítems. Esto mantiene la consola consciente del rol sin mover la fuente de verdad fuera de la API.

### Idioma De La Interfaz

El panel administrativo se construyó intencionalmente en inglés para reflejar el idioma usado comúnmente en equipos internacionales de software y aplicaciones empresariales. La documentación en español se mantiene por separado para que el razonamiento técnico sea accesible en ambos idiomas.

### Ejecución Docker-First

El repositorio incluye `Dockerfile`, `docker-compose.yml`, `.dockerignore` y `.env.example` para revisar y ejecutar la app con Docker como flujo principal. Node local queda disponible como alternativa, no como requisito.

## Contexto Del Ecosistema

MaintOps está organizado como un sistema multiservicio:

- Consola web para la experiencia operativa.
- API Laravel para autenticación, datos de negocio, políticas y auditoría.
- Servicio realtime para actualizaciones operativas en vivo.
- Servicio de analítica para métricas operativas y recomendaciones.

Este repositorio se encarga de la consola web y de la superficie de integración frontend.

## Requisitos

- Docker Engine o Docker Desktop con Docker Compose.

No necesitas Node ni npm instalados en el host si usas Docker.

## Variables De Entorno

Crea un `.env` local desde `.env.example` y ajusta la URL de la API si el backend usa otro puerto:

```dotenv
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Ejecutar Con Docker

Levanta la consola:

```bash
docker compose up -d --build
```

Abre:

```text
http://localhost:5173
```

Ver logs:

```bash
docker compose logs -f frontend
```

Detener:

```bash
docker compose down
```

## Alternativa Con Node Local

```bash
npm install
npm run dev
```

Build de producción:

```bash
npm run build
```

## Atribución

La base visual usa Admin One Vue Tailwind, distribuido bajo licencia MIT por JustBoil.me.
