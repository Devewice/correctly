# Despliegue en Hostinger — jeisson.click

## Diagnóstico actual

| URL | Resultado | Significado |
|-----|-----------|-------------|
| `/api/auth/status` | OK | Node Express **sí corre** |
| `/api/health` | `ui:true` + `db:down` | Front copiado en Node; MySQL rechaza credenciales |
| `/` | **404** | Apache mira `public_html` vacío; **no** pasa `/` a Node |

## Configuración correcta

| Campo | Valor |
|-------|--------|
| Preajuste | `Other` |
| Build | `npm run build` |
| **Directorio de salida** | **`server/public`** (Apache / public_html) |
| Archivo de entrada | `server/src/index.js` |

Hostinger copia el “output” a `public_html`. Ahí debe estar el Vue.  
Node sigue atendiendo `/api/*`.

---

## Variables de entorno

Usa el **host remoto** (el login con `localhost` falló):

```env
NODE_ENV=production
CLIENT_URL=https://jeisson.click

DATABASE_HOST=srv1855.hstgr.io
DATABASE_PORT=3306
DATABASE_NAME=u301973293_correctly
DATABASE_USER=u301973293_admin
DATABASE_PASSWORD=TU_PASSWORD_AQUI
DATABASE_URL=mysql://u301973293_admin:PASSWORD_ENCODED@srv1855.hstgr.io:3306/u301973293_correctly

JWT_SECRET=cambia-esta-clave
GOOGLE_CALLBACK_URL=https://jeisson.click/api/auth/google/callback
ALLOW_DEMO_LOGIN=true
```

- **NO** pongas `PORT`
- Caracteres especiales en la contraseña van **URL-encoded** en `DATABASE_URL` (`;`→`%3B`, `&`→`%26`, `:`→`%3A`, `?`→`%3F`, `>`→`%3E`)
- MySQL remoto con acceso `%` ya está bien para `u301973293_correctly`

---

## Pasos

1. **Directorio de salida** = `server/public`
2. Variables como arriba (host `srv1855.hstgr.io`)
3. Redesplegar
4. Probar:
   - https://jeisson.click/ → login
   - https://jeisson.click/api/health → `"ok":true,"db":"up","ui":true`
