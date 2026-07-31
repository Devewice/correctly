# Correctly en Hostinger — Opción A

```
/ , /login , /onboarding , /assets/*  →  Apache (public_html) + .htaccess
/api/*                                 →  Node (Express)
```

## Panel Node

| Campo | Valor |
|-------|--------|
| Build | `npm run build` |
| **Directorio de salida** | `server/public` |
| **Archivo de entrada** | `server/src/index.js` |

El comando `npm run build` **genera solo** el `.htaccess` dentro de `server/public/`.  
Hostinger lo copia a `public_html/.htaccess` con el resto del front.

No hace falta crearlo a mano **si** tras el deploy sigue ahí.

---

## Variables

```env
NODE_ENV=production
CLIENT_URL=https://jeisson.click
ALLOW_DEMO_LOGIN=true
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=u301973293_correctly
DATABASE_USER=u301973293_admin
DATABASE_PASSWORD_B64=dTtEb0tRfiYy
JWT_SECRET=cambia-esta-clave
GOOGLE_CALLBACK_URL=https://jeisson.click/api/auth/google/callback
```

Sin `PORT`, sin `SERVE_SPA`, sin `DATABASE_PASSWORD` con `&`.

---

## Si Hostinger machaca el `.htaccess`

A veces, al activar Node, Hostinger **regenera** `.htaccess` y manda todo al proceso Node (vuelve el 404 JSON en `/onboarding`).

Comprueba en File Manager → `public_html/.htaccess` que tenga algo como:

```apache
RewriteCond %{REQUEST_FILENAME} -f
RewriteRule ^ - [L]
RewriteRule ^api(?:/|$) - [L]
RewriteRule ^ index.html [L]
```

Si lo reemplazaron por solo un `RewriteRule ^(.*)$ http://127.0.0.1:PUERTO/$1 [P,L]`:

1. Copia la línea del proxy `/api` (con el puerto que pongan ellos).
2. Deja el bloque Opción A (archivos → api proxy → index.html).

El contenido “bueno” también está en el repo: `client/public/.htaccess` (se vuelve a escribir en cada build).

---

## Comprobar

| URL | OK |
|-----|-----|
| `/` | HTML login |
| `/onboarding` + F5 | sigue HTML, no `{"error":"Not Found"}` |
| `/api/health` | `"mode":"api-only"` |
