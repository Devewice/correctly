# Correctly en Hostinger — Opción A (recomendada)

```
Navegador
   │
   ├─ / , /login , /onboarding , /assets/*  →  Apache (public_html) + index.html
   │
   └─ /api/*                                 →  Node (Express)
```

Así **no hay enredo**: Vue usa rutas normales (`/onboarding`) y Apache las resuelve con `.htaccess`.

---

## 1. Ajustes en el panel Node

| Campo | Valor |
|-------|--------|
| Preajuste | `Other` |
| Build | `npm run build` |
| **Directorio de salida** | `server/public` |
| **Archivo de entrada** | `server/src/index.js` |

**No** pongas `SERVE_SPA=true` (Node solo API).

---

## 2. Variables de entorno

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

- **Sin** `PORT`
- **Sin** `DATABASE_PASSWORD` con `&` (usa B64)
- **Sin** `SERVE_SPA`

---

## 3. Paso crítico tras el primer deploy (File Manager)

Hostinger a veces **sobrescribe** `.htaccess` para mandar todo a Node.  
Hay que dejarlo así (Opción A):

1. hPanel → **Archivos** → `domains/jeisson.click/public_html/`
2. Edita (o crea) `.htaccess` con **exactamente**:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

  RewriteRule ^api(?:/|$) - [L]

  RewriteRule ^ index.html [L]
</IfModule>
```

3. Guarda.

> La regla `^api` con `[L]` deja que el proxy de Node de Hostinger (que suelen añadir ellos) maneje `/api`.  
> Si `/api/health` deja de funcionar, abre el `.htaccess` que Hostinger generó, copia **solo** su línea de proxy `api → 127.0.0.1:PUERTO`, y ponla **antes** del `RewriteRule ^ index.html`.

Ejemplo combinado si hace falta:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

  # Pegar aquí la línea proxy de Hostinger, ej:
  # RewriteRule ^api/(.*)$ http://127.0.0.1:XXXX/api/$1 [P,L]

  RewriteRule ^ index.html [L]
</IfModule>
```

---

## 4. Comprobar

| URL | Esperado |
|-----|----------|
| https://jeisson.click/ | HTML login (no JSON) |
| https://jeisson.click/onboarding | HTML (tras login), **F5 no da 404** |
| https://jeisson.click/api/health | `{"ok":true,"mode":"api-only",...}` |

---

## Local

```bash
npm run dev          # API + Vite (proxy /api)
# o
SERVE_SPA=true npm run start --prefix server   # Express sirve el build
```
