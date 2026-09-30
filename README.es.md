# Consola Web MaintOps

Documentación en inglés: [README.md](README.md).

MaintOps Web Console es la aplicación Vue 3 de navegador para la plataforma de operaciones de mantenimiento vehicular MaintOps. Entrega una consola operativa con alcance por rol para dashboard, registros de clientes y vehículos, talleres, catálogos de mantenimiento, órdenes, auditoría, actividad realtime y analítica.

Este proyecto está diseñado como la pieza frontend del stack completo de portafolio MaintOps. Puede ejecutarse solo para revisar UI, pero la experiencia completa depende de:

- `maintops-api-laravel` para autenticación, autorización, datos de negocio, recuperación de contraseña y emisión de service tokens.
- `maintops-realtime-node` para eventos operativos en vivo y presencia.
- `maintops-analytics-fastapi` para métricas, pronósticos, alertas de riesgo y recomendaciones.
- `maintops-stack` para el ambiente local replicable que ejecuta todos los servicios juntos.

## Qué Demuestra Este Proyecto

- Arquitectura Vue 3 con route guards, stores compartidos, feature modules y componentes UI reutilizables.
- Consola administrativa profesional diseñada desde cero con Vuetify y adaptada a un dominio real de mantenimiento.
- Ejecución Docker-first sin requerir Node.js en el host.
- Navegación y acciones por rol que reflejan la intención de las policies backend sin reemplazar la autorización real.
- Integración autenticada con Laravel API, normalización de errores y helpers de paginación/queries.
- Pantallas públicas de recuperación de contraseña que consumen endpoints Laravel y soportan links enviados por correo.
- Ciclo de vida Socket.IO autenticado con tokens realtime de corta duración emitidos por Laravel.
- Centro de notificaciones realtime que reacciona a eventos operativos sin permitir que el navegador gestione rooms.
- Integración con Analytics usando tokens dedicados emitidos por Laravel en vez del token principal de API.
- Interfaz de producto bilingüe en inglés y español con preferencia de idioma persistida por usuario y documentación técnica paralela.

## Stack Técnico

| Herramienta | Propósito |
| --- | --- |
| Vue 3 | Modelo de componentes y base reactiva de UI. |
| Vite | Servidor de desarrollo y pipeline de build. |
| Pinia | Estado compartido de sesión, usuario y UI. |
| Vue Router | Gestión de rutas públicas y autenticadas. |
| Axios | Cliente HTTP para integraciones con Laravel y FastAPI. |
| Socket.IO Client | Conexión realtime del navegador al gateway Node. |
| Chart.js | Gráficos para dashboard y vistas de analítica. |
| Vuetify 3 | Componentes UI accesibles y sistema de diseño de la aplicación. |
| TypeScript | Contratos tipados para dominio, servicios, composables y componentes. |
| Sass | Estilos modulares y responsive para vistas y componentes reutilizables. |
| ESLint y Prettier | Calidad y formato de código. |

## Rol Dentro Del Ecosistema MaintOps

El frontend es intencionalmente una capa de presentación e integración. Mejora la experiencia ocultando acciones no disponibles, agrupando flujos y refrescando datos después de eventos realtime, pero Laravel sigue siendo la fuente de verdad para autenticación, autorización, validación y decisiones de negocio.

El navegador se comunica con tres servicios de aplicación:

```text
Laravel API      VITE_API_BASE_URL
Realtime Gateway VITE_REALTIME_URL
Analytics API    VITE_ANALYTICS_BASE_URL
```

La ruta normal de revisión es ejecutar este proyecto mediante `maintops-stack`, donde esos servicios ya están conectados.

## Capacidades Implementadas

Shell de aplicación:

- Branding MaintOps, sidebar responsive, topbar, dark mode y layout autenticado.
- Selector de idioma inglés/español que resuelve defaults del navegador, local storage y la preferencia persistida del usuario autenticado.
- Metadata de rutas para títulos contextuales y grupos de navegación.
- Layout guest para login, forgot password y reset password.

Autenticación y permisos:

- Login, logout, `/auth/me`, hidratación de sesión, guards privados y bloqueo no interactivo por rol.
- Recuperación de contraseña con endpoints Laravel de forgot/reset.
- Matrices frontend de permisos para rutas, CRUD, roles asignables, auditoría, analytics y acciones de estado de órdenes.

Módulos operativos:

- Dashboard con workload, estados de órdenes, agenda, aprobaciones pendientes y actividad activa con alcance por rol.
- Vistas para users, owners, vehicles, workshops, maintenance tasks, maintenance plans, maintenance orders, order items, vehicle systems y audits.
- Patrones de list, detail, create, edit, lookup, filters, pagination, empty states y acciones conscientes de policies.

Realtime:

- Solicitud de token realtime dedicado a Laravel.
- Ciclo de conexión Socket.IO, reconexión, renovación de token, limpieza, status badge y presencia.
- Centro de notificaciones para eventos de órdenes e items con dismiss individual y mark-all-as-read.
- Refresco de datos ante eventos relevantes en vez de mutación compleja de estado de dominio local.

Analytics:

- Solicitud de token analytics dedicado a Laravel.
- Cliente FastAPI para métricas observadas, pronóstico de carga, alertas de riesgo y recomendaciones.
- Navegación y vistas Analytics solo para roles administrativos.

## Estructura Del Proyecto

El frontend usa una estructura por feature modules con una capa pequeña de módulo compartido para patrones reutilizables de dominio:

```text
src/
  api/          Cliente Axios, normalización de errores, query helpers y exports API.
  auth/         Matrices de permisos frontend y helpers de UX.
  components/   UI reutilizable basada en Vuetify, layout, dashboard, realtime, analytics y auditoría.
  config/       URLs de integración desde variables Vite.
  i18n/         Diccionarios en inglés y español y etiquetas de rutas.
  plugins/      Configuración de Vuetify.
  styles/       Estilos Sass de vistas, componentes, tema y responsive.
  modules/      Feature modules agrupados por capacidad de dominio.
  router/       Definición de rutas, guards y metadata.
  stores/       Estado compartido con Pinia.
  types/        Contratos TypeScript para payloads API y de dominio.
  views/        Pantallas a nivel de ruta.
```

Los feature modules siguen la misma separación de responsabilidades:

```text
modules/<feature>/
  components/   Componentes reutilizables específicos del feature cuando aplica.
  composables/   Helpers reactivos específicos del feature cuando aplica.
  services/     Clientes HTTP o servicios de integración.
  utils/        Formatters, labels o helpers puros específicos del feature cuando aplica.
  views/        Pantallas a nivel de ruta.
```

Los patrones de recursos reutilizables entre módulos viven en `modules/shared`:

```text
modules/shared/
  components/   Componentes reutilizables con conocimiento de dominio, como inputs async y controles de listados.
  composables/   Flujos reactivos compartidos para recursos.
  services/     Factories para comportamiento común de servicios.
  utils/        Helpers compartidos de queries, formatters y valores de formulario.
```

Esto mantiene las primitivas UI genéricas en `components`, los workflows reutilizables de dominio en `modules/shared`, los workflows específicos dentro de cada feature module y el acceso API fuera de los componentes de ruta.

## Decisiones De Arquitectura

El frontend refleja la intención de autorización del backend, pero no aplica seguridad real. Visibilidad de rutas, menús, botones y acciones de estado se filtran en el navegador para reducir fricción; Laravel valida cada request con policies y reglas.

El cliente API centraliza inyección del Bearer token, headers de locale, normalización de errores de validación Laravel, mensajes de fallos de red y serialización de queries. Los módulos consumen ese cliente a través de servicios pequeños en vez de llamar Axios directamente desde cada vista.

Los eventos realtime se tratan como hechos emitidos por el backend. El frontend deduplica por event id y vuelve a consultar dashboards, listas o detalles afectados. Esto evita mantener una segunda copia de la lógica de state machines de Laravel en el navegador.

Analytics se separa intencionalmente del cliente API principal. El navegador solicita a Laravel un analytics service token y luego llama FastAPI con ese token. El token principal de Laravel no se envía directamente a Analytics.

La localización se maneja con diccionarios Vue I18n para rutas, navegación, formularios, tablas, dashboard, auditoría, realtime, órdenes, analítica y mensajes fallback de API. Las peticiones envían `Accept-Language` y `X-Locale` para mantener respuestas Laravel y mensajes basados en códigos de Analytics alineados con el idioma seleccionado.

La interfaz se diseñó desde cero con Vuetify y Sass. MaintOps define su propio shell responsive, componentes, rutas, lenguaje de dominio y modelo de integración sin Admin One, AdminLTE ni Tailwind.

## Variables De Entorno

Crea un `.env` local desde `.env.example` solo cuando necesites sobrescribir URLs de servicio u hosts permitidos:

```dotenv
FRONTEND_PORT=5173
FRONTEND_ALLOWED_HOSTS=localhost,127.0.0.1
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_REALTIME_URL=http://localhost:3000
VITE_ANALYTICS_BASE_URL=http://localhost:8001
```

El demo local completo utiliza las URLs y credenciales de servicios configuradas por `maintops-stack`.

## Autenticación De Servicios Y CORS

El navegador nunca recibe credenciales compartidas de los servicios. Después del login, el frontend solicita un token de corta duración a `POST /auth/service-token` con la audiencia `realtime` o `analytics`. Laravel firma el token y el servicio de destino lo valida.

Para este frontend en el puerto 5173, configura el stack de servicios con:

```dotenv
FRONTEND_PASSWORD_RESET_URL=http://localhost:5173/reset-password
SANCTUM_STATEFUL_DOMAINS=localhost,localhost:5173,127.0.0.1,127.0.0.1:5173
REALTIME_CORS_ORIGIN=http://localhost:5173
ANALYTICS_CORS_ORIGINS=["http://localhost:5173"]
SERVICE_TOKEN_SECRET=maintops-local-development-service-token-secret
OPERATIONS_ANALYTICS_SERVICE_KEY=maintops-local-development-analytics-service-key
```

`SERVICE_TOKEN_SECRET` debe coincidir en Laravel, Realtime y Analytics. `OPERATIONS_ANALYTICS_SERVICE_KEY` debe coincidir entre Laravel y Analytics. Estas credenciales de servicio nunca deben exponerse mediante variables `VITE_*` ni versionarse con valores de producción.

## Ejecutar Con Docker

Revisión standalone del frontend:

```bash
docker compose up -d --build
docker compose logs -f frontend
```

Abrir:

```text
http://localhost:5173
```

Detener:

```bash
docker compose down
```

El frontend puede renderizar solo, pero los flujos autenticados requieren la API Laravel. Realtime y Analytics requieren sus servicios correspondientes.

## Validar Dentro De Docker

No se requiere Node.js ni npm en el host. Ejecuta todos los comandos del proyecto dentro del contenedor:

```bash
docker compose exec frontend npm run build
docker compose exec frontend npm run test:unit -- --run
docker compose exec frontend npm run lint
```

Reconstruye la imagen cuando cambien los manifests de paquetes o el Dockerfile:

```bash
docker compose up -d --build
```

## Notas Para Revisar El Demo

- Usa el repositorio `maintops-stack` para revisar el producto integrado.
- Usa solo datos de muestra. Ambientes demo no deberían recibir datos reales personales, de clientes, talleres o vehículos.
- Laravel sigue siendo la fuente de verdad de autorización; los checks frontend solo mejoran navegación y visibilidad de acciones.
- Los fallos de conectividad se normalizan en mensajes claros para distinguir una caída de servicio de un error de validación de aplicación.

## Diseño Visual

La interfaz de MaintOps está implementada desde cero con Vuetify, Sass y Material Design Icons. No incluye Admin One, AdminLTE ni Tailwind.
