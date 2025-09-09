# Explicación de Cambios para Autenticación y Logout en SICaPSI

Este documento explica todos los archivos creados y las modificaciones realizadas para implementar un sistema de autenticación seguro y profesional en tu proyecto. Está pensado para que lo entienda cualquier persona que recién empieza en desarrollo web.

---

## 1. Archivos Nuevos

### `back/src/middlewares/authMiddleware.js`
- **¿Qué hace?**
  - Es un "portero" que revisa si el usuario tiene una sesión válida (token JWT en una cookie) antes de dejarlo pasar a rutas protegidas.
- **¿Por qué es importante?**
  - Así nadie puede acceder a información privada sin estar logueado.

### `Front/src/componentes/PrivateRoute.jsx`
- **¿Qué hace?**
  - Es un "guardia" en el frontend que solo deja entrar a ciertas páginas si el usuario está autenticado.
- **¿Por qué es importante?**
  - Evita que alguien vea el panel de usuario si no inició sesión.

---

## 2. Modificaciones en Archivos Existentes

### Backend

#### `back/src/controllers/authController.js`
- **Agregué:**
  - Método `logout`: borra la cookie de sesión para cerrar sesión.
  - Método `checkAuth`: responde si el usuario está autenticado.
- **¿Por qué?**
  - Permite cerrar sesión y verificar si el usuario sigue logueado.

#### `back/src/routes/authRoutes.js`
- **Agregué:**
  - Rutas `/logout` y `/check-auth` usando los métodos nuevos.
  - Uso del middleware `authMiddleware` para proteger `/check-auth`.

#### `back/src/app.js`
- **Agregué:**
  - Middleware `cookie-parser` para leer cookies.
  - Configuración de CORS para permitir cookies y peticiones solo desde el frontend.
  - Cambié las rutas a `/api/auth/...` para que coincidan con el frontend.

---

### Frontend

#### `Front/src/componentes/alumno/nvar.jsx`
- **Modifiqué:**
  - El botón "Cerrar sesión" ahora llama a la función `logout` desde `api/auth.js`.

#### `Front/src/api/auth.js`
- **Agregué:**
  - Función `logout` que hace la petición al backend para cerrar sesión.
  - Todas las peticiones de autenticación (login, logout, registro) están centralizadas aquí.

#### `Front/src/App.jsx`
- **Modifiqué:**
  - Usé el componente `PrivateRoute` para proteger las rutas del panel de usuario y otras páginas privadas.

#### `Front/vite.config.js`
- **Agregué:**
  - Proxy para que las peticiones `/api` del frontend se redirijan al backend automáticamente.

---

## 3. ¿Cómo funciona todo junto?

1. **Login:** El usuario inicia sesión y el backend le da una cookie segura con un token.
2. **Acceso protegido:** Solo puede entrar al panel si está autenticado (gracias a `PrivateRoute` y `authMiddleware`).
3. **Logout:** Al cerrar sesión, se borra la cookie y el usuario vuelve al inicio.
4. **Seguridad:** Nadie puede acceder a datos privados sin estar logueado y las cookies son seguras.

---

## 4. ¿Por qué es profesional y seguro?
- Las cookies son `httpOnly` y no se pueden leer desde JavaScript (evita robos).
- El backend solo acepta peticiones del frontend real.
- Las rutas privadas están protegidas tanto en el backend como en el frontend.

---

## 5. ¿Qué aprendiste?
- Cómo proteger rutas y manejar sesiones con JWT y cookies.
- Cómo conectar frontend y backend de forma segura.
- Cómo centralizar la lógica de autenticación para que el código sea más limpio y fácil de mantener.

---

¡Listo! Ahora tu app es mucho más segura y profesional. Si tienes dudas, puedes leer este documento o preguntar a tu profe.
