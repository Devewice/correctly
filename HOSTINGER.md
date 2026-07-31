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
DATABASE_PASSWORD=y:Zz3L?>p6
DATABASE_URL=mysql://u301973293_admin:y%3AZz3L%3F%3Ep6@srv1855.hstgr.io:3306/u301973293_correctly

JWT_SECRET=cambia-esta-clave
GOOGLE_CALLBACK_URL=https://jeisson.click/api/auth/google/callback

# Mientras no tengas Google OAuth (para poder entrar):
ALLOW_DEMO_LOGIN=true
```

- **NO** pongas `PORT`
- **NO** uses `localhost` en MySQL (salvo que Hostinger te lo indique)

Si la contraseña falla, en hPanel → MySQL → restablece la clave del usuario `u301973293_admin` y actualiza las dos variables.

---

## Pasos

1. **Directorio de salida** = `server/public`
2. Variables como arriba (host `srv1855.hstgr.io`)
3. Redesplegar
4. Probar:
   - https://jeisson.click/ → login
   - https://jeisson.click/api/health → `"ok":true,"db":"up","ui":true`
