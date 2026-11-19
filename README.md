# Útiles Express

Sistema local de ventas e inventario con interfaz React y API Express.

## Requisitos

- Node.js 20.19 o posterior
- npm

## Desarrollo

```sh
npm install
npm run dev
```

La interfaz queda en `http://localhost:3000` y la API en `http://localhost:3001`. Vite reenvía las peticiones `/api` al backend.

En PowerShell también se puede usar `npm.cmd` si la política de ejecución bloquea `npm.ps1`.

## Comprobaciones

```sh
npm run lint
npm run build
```

Para ejecutar el servidor con los archivos estáticos compilados:

```sh
npm run build
npm start
```

## Estructura

- `frontend/`: aplicación React, estilos y configuración de entrada de Vite.
- `backend/`: API Express y persistencia local en JSON.
- `shared/`: modelos TypeScript y datos iniciales utilizados por ambas capas.

El backend crea `backend/data/store.json` en el primer arranque. Ese archivo no se versiona; haz copias de seguridad antes de limpiar o mover los datos.

## Acceso de demostración

Las cuentas iniciales usan la contraseña `demo123`. Se puede cambiar con `DEMO_PASSWORD` en un archivo `.env`. Las opciones de acceso rápido y cambio de rol son solo para la demostración.

Esta configuración usa almacenamiento JSON y credenciales compartidas de demo; no debe exponerse a Internet ni considerarse un despliegue de producción. Para producción hace falta autenticación por usuario con contraseñas hasheadas, autorización en cada endpoint y una base de datos con copias de seguridad.

## Revisión del 19 de noviembre de 2026

- Se verificó la estructura del proyecto y los modelos con `tsc --noEmit` (sin errores).
- Se corrigió la validación básica del estado recibido por la API: usuarios y productos deben contener campos esperados, precios y existencias no negativos.
- El servidor de demostración escucha únicamente en `127.0.0.1` y restringe orígenes externos en `/api/state`.
- **Limitación de las pruebas:** no se pudo ejecutar la compilación Vite ni arrancar la API en este entorno porque el ZIP original incluía dependencias binarias para Windows, mientras que el entorno de pruebas es Linux. Se intentó una instalación offline, pero faltaron paquetes en caché. Por ello **no se certifica el funcionamiento completo**.
- Instalar las dependencias desde cero en el equipo de destino con `npm ci`, después ejecutar `npm run lint`, `npm run build` y `npm run dev`.
- El documento de requisitos describe un **prototipo**: la implementación actual conserva React/Express/JSON y **no** es una migración a Angular 21/PHP/MySQL. Las credenciales compartidas, la autenticación de demostración, la sincronización de estado y los permisos de frontend **no son adecuados para producción**. No publicar este servidor en Internet ni utilizar información real.
- Las cuentas y operaciones se simulan para demostración. La API `/api/state` no implementa sesiones, autorización por rol ni operaciones transaccionales; la restricción de red local no sustituye esas protecciones.
