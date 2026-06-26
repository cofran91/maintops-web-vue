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
- Topbar responsive con títulos contextuales, estado realtime y centro persistente de notificaciones.
- Patrones de layout para dashboard, listado, formulario, detalle y estado vacío.
- Componentes UI base para páginas, badges, dropdowns, tablas responsive y estados vacíos.
- Cliente Axios compartido con inyección de token Bearer y normalización de errores estilo Laravel.
- Helpers de consulta para filtros, búsqueda, página y payloads de paginación.
- Contratos JSDoc para respuestas de API, paginación, roles, usuarios y errores normalizados.
- Login, logout, `/auth/me`, hidratación de sesión con Pinia, guards de rutas privadas y bloqueo de roles no interactivos.
- Matrices frontend de permisos para rutas, acciones CRUD, roles asignables, acceso a auditoría, visibilidad de Analytics y acciones de estado de órdenes.
- Dashboard operacional con métricas desde Laravel, órdenes del día, próximas órdenes, conteos por estado y secciones de carga según rol.
- Ciclo realtime autenticado con tokens cortos emitidos por Laravel, estado Socket.IO, renovación, limpieza y presencia.
- Eventos operativos realtime que refrescan dashboard, listados de órdenes y detalle de orden sin exponer administración de rooms en el navegador.
- Centro persistente de notificaciones para eventos de órdenes e ítems, con acciones individuales y marcar todas como leídas.
- Módulo administrativo de Analytics con tokens de servicio emitidos por Laravel, consumo de FastAPI, métricas observadas, pronósticos de carga, alertas de riesgo y recomendaciones.
- Módulo de usuarios con servicio HTTP, filtros, paginación, detalle, formularios, acciones según rol y búsqueda paginada de talleres.
- Módulo de propietarios con servicio HTTP, filtros por búsqueda y estado, paginación, detalle, formularios y acciones de eliminación según permisos.
- Módulo de vehículos con servicio HTTP, filtros avanzados, paginación, detalle, formularios, búsqueda paginada de propietarios y acciones de eliminación según permisos.
- Módulo de talleres con servicio HTTP, filtros avanzados, búsqueda de administrador, sistemas de vehículo, asignación de técnicos, horario semanal y acciones según permisos.
- Módulo de tareas de mantenimiento con servicio HTTP, filtros por estado, consulta de sistemas de vehículo, búsqueda paginada de vehículos, alcance reutilizable, restricciones para advisors y acciones según permisos.
- Módulo de planes de mantenimiento con servicio HTTP, búsqueda paginada de tareas, selección de tareas agrupadas, intervalos recomendados, detalle, filtros y acciones según permisos.
- Módulo de órdenes de mantenimiento con servicios HTTP, filtros avanzados, detalle de asignaciones, listados paginados, visibilidad de ítems dentro de cada orden y transiciones de estado según rol.
- Acciones de estado de ítems filtradas por rol, estado actual y disponibilidad de endpoints públicos desde el detalle de la orden.
- Módulo de auditoría con servicio HTTP, filtros, paginación, inspección de cambios y visibilidad exclusiva para super admin.
- Archivos Docker y Docker Compose para ejecución local.
- `.env.example` con `VITE_API_BASE_URL`, `VITE_REALTIME_URL` y `VITE_ANALYTICS_BASE_URL`.
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
  modules/audits/  Servicio de auditoría y vista de trazabilidad para super admin.
  modules/analytics/  Servicio de token Analytics, cliente FastAPI y vista administrativa de analítica.
  modules/dashboard/  Servicio del dashboard operacional.
  modules/maintenance-orders/  Servicios, reglas de estado, listado, detalle y formulario de órdenes e ítems.
  modules/maintenance-plans/  Servicio de planes, listado, detalle y formularios.
  modules/maintenance-tasks/  Servicio de tareas, listado, detalle y formularios.
  modules/realtime/  Token realtime, ciclo Socket.IO, listeners de eventos, notificaciones, estado y presencia.
  modules/owners/  Servicio de propietarios, listado, detalle y formularios.
  modules/users/  Servicio de usuarios, listado, detalle y formularios.
  modules/vehicles/  Servicio de vehículos, listado, detalle y formularios.
  modules/vehicle-systems/  Servicio de consulta de sistemas de vehículo.
  modules/workshops/  Servicio de talleres, listado, detalle y formularios.
  types/       Contratos JSDoc de dominio y API.
  views/       Vistas de página.
```

Esta estructura mantiene el bootstrap fácil de revisar: el comportamiento de layout vive en `layouts`, la navegación y el mapeo de rutas viven en `router` y archivos de menú, y el contenido de pantalla permanece en `views`.

### Frontera De Integración

El frontend lee URLs de servicios desde `VITE_API_BASE_URL`, `VITE_REALTIME_URL` y `VITE_ANALYTICS_BASE_URL`. Eso mantiene la app web portable entre entornos locales, Docker y despliegues.

El comportamiento sensible a autorización pertenece al backend. El frontend puede mejorar la usabilidad ocultando rutas y acciones no disponibles, pero no reemplaza políticas ni validaciones del backend.

La capa de permisos frontend refleja la intención del backend para visibilidad de rutas, acciones de crear/actualizar/eliminar, roles asignables, acceso a auditoría, visibilidad de Analytics y acciones de estado de órdenes e ítems. Esto mantiene la consola consciente del rol sin mover la fuente de verdad fuera de la API.

Realtime usa tokens cortos emitidos por Laravel a través de la API autenticada. El navegador no envía el token Sanctum a Socket.IO; solicita un token realtime dedicado y lo envía al gateway durante el handshake Socket.IO.

Los payloads de eventos operativos se tratan como hechos controlados por backend. El frontend parsea eventos autorizados de órdenes e ítems, los deduplica por id de evento y refresca las vistas afectadas en vez de mutar estado complejo de dominio localmente.

Las notificaciones realtime se almacenan por usuario autenticado en el navegador y permanecen visibles hasta marcarlas como leídas. Los eventos de órdenes e ítems se diferencian visualmente, y las notificaciones de ítems incluyen el nombre de la tarea cuando el evento backend lo entrega.

Analytics usa tokens de servicio cortos emitidos por Laravel mediante la API autenticada. El navegador llama FastAPI Analytics con ese token dedicado, nunca con el token principal de sesión Laravel. La pantalla de Analytics queda disponible solo por la matriz de permisos frontend para usuarios `super_admin` y `admin`, mientras Laravel y Analytics conservan la frontera real de autorización.

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

Crea un `.env` local desde `.env.example` y ajusta las URLs de servicios si el backend, el gateway realtime o Analytics usan otros puertos:

```dotenv
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_REALTIME_URL=http://localhost:3000
VITE_ANALYTICS_BASE_URL=http://localhost:8001
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
