# Despliegue en Hostinger (jeisson.click)

El **403** aparece si Hostinger busca `index.html` en la raíz y el build real está en `client/dist`, o si el tipo de app no arranca Express.

## Configuración recomendada (API + Vue juntos)

En **Sitios web → Node.js / Deploy**:

| Campo | Valor |
|-------|--------|
| **Tipo / Framework** | `Express` o `Other` (no solo Vite/Vue estático) |
| **Directorio raíz** | `./` |
| **Versión Node** | `20.x` o `22.x` (24.x también ok) |
| **Comando de build** | `npm run build` |
| **Directorio de salida** | `client/dist` |
| **Entry file / archivo de entrada** | `server/src/index.js` |
| **Start** (si pide) | `npm start` |

Luego **Redesplegar**.

## Variables de entorno (obligatorias)

En el panel de Hostinger → Environment variables:

```env
NODE_ENV=production
PORT=3000
CLIENT_URL=https://jeisson.click
DATABASE_URL=mysql://u301973293_admin:TU_PASSWORD@srv1855.hstgr.io:3306/u301973293_correctly
JWT_SECRET=una-cadena-larga-aleatoria
```

> Codifica caracteres especiales de la contraseña en la URL (`:` → `%3A`, `?` → `%3F`, `>` → `%3E`).

Opcional Google:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://jeisson.click/api/auth/google/callback
```

## Si solo usas front estático (sin API Node)

| Campo | Valor |
|-------|--------|
| Framework | `Vue` o `Vite` |
| Build | `npm run build` |
| **Output directory** | **`client/dist`** ← crítico |

Sin Express, `/api/*` no funcionará en el mismo dominio.

## Comprobar

1. `https://jeisson.click/api/health` → `{"ok":true,"db":"up",...}`
2. `https://jeisson.click/` → login de Correctly

## 403 tras redesplegar

Hostinger a veces deja un `.htaccess` viejo. **Redesplega** de nuevo con el entry `server/src/index.js` para regenerarlo.
