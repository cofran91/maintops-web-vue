# MaintOps Web Vue 3

Frontend Vue 3 de MaintOps, preparado para trabajar con Vuetify y ejecutarse completamente dentro de Docker.

## Requisitos

- Docker
- Docker Compose

No es necesario instalar Node.js, npm ni dependencias en el equipo local. El `Dockerfile` instala las dependencias con `npm ci` dentro de la imagen y Compose conserva `node_modules` en un volumen administrado por Docker.

## Desarrollo

```bash
docker compose up -d --build
```

La aplicación queda disponible en <http://localhost:5173>.

El login usa `POST /auth/login`, conserva la sesión según la opción seleccionada y protege la ruta `/dashboard`. El dashboard consume `GET /dashboard` para sus métricas, estados y agenda; la gráfica histórica semanal continúa siendo demostrativa hasta contar con un endpoint de histórico.

```bash
docker compose logs -f frontend
docker compose down
```

Para ejecutar validaciones dentro del contenedor:

```bash
docker compose exec frontend npm run build
docker compose exec frontend npm run test:unit -- --run
docker compose exec frontend npm run lint
```

## Configuración

Copiar `.env.example` a `.env` únicamente si es necesario cambiar puertos, hosts o URLs de servicios:

```dotenv
FRONTEND_PORT=5173
FRONTEND_ALLOWED_HOSTS=localhost,127.0.0.1
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_REALTIME_URL=http://localhost:3000
VITE_ANALYTICS_BASE_URL=http://localhost:8001
```

## Librerías

La aplicación incluye las librerías funcionales del frontend base: Axios, Pinia, Vue Router, Vue I18n, Socket.IO Client, Chart.js, Numeral y los iconos MDI.

La interfaz se construirá desde cero con Vuetify. No se incluyen AdminLTE, Admin One, Tailwind CSS ni sus plugins.
