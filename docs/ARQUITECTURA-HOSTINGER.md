# ¿Un solo proceso o dos? (Hostinger)

## Respuesta corta

**No**, el 404 al refrescar `/login` **no** se debe a que front y back compartan un hilo.

Es el comportamiento normal de una **SPA (Vue)**:

1. Entras a `/` → el servidor manda `index.html` → Vue arranca.
2. Vue te lleva a `/login` **en el navegador** (sin pedir esa página al servidor).
3. Das F5 en `/login` → el navegador pide al servidor el archivo `/login`.
4. Ese archivo **no existe** en disco → Hostinger/Express responde `{"error":"Not Found"}`.

Front y API en un solo proceso Node es **correcto y habitual**.

## ¿Dos procesos ayudan?

| Enfoque | Qué es | ¿Arregla el F5 en /login? |
|---------|--------|---------------------------|
| **1 proceso** (Express sirve API + `index.html`) | Lo que tenemos | Sí, **si** Express hace fallback SPA |
| **2 procesos** (Vite/Nginx + API aparte) | Más ops, 2 Puertos/servicios | Solo si el front también tiene fallback SPA |
| **Apache estático + Node API** (Hostinger híbrido) | `public_html` + Node | Sí, con `.htaccess` → `index.html` |

Separar en dos procesos **no evita** el enredo: el servidor del front igual debe devolver `index.html` para `/login`, `/dashboard`, etc.

## Qué usamos en Correctly

1. **Un solo Node** (`server/src/index.js`): `/api/*` + archivos estáticos.
2. **Hash routes** (`#/login`): al refrescar, el servidor solo ve `/`, Vue lee el `#`.
3. **`.htaccess`**: por si Apache atiende el estático en `public_html`.

URLs quedan así: `https://jeisson.click/#/login` (normal en apps en hosting compartido).
