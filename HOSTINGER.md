# Despliegue en Hostinger — jeisson.click

## Configuración de build

| Campo | Valor |
|-------|--------|
| Preajuste | `Other` |
| Build | `npm run build` |
| Directorio de salida | `server/public` |
| Archivo de entrada | `server/src/index.js` |

## Variables de entorno (MySQL con caracteres especiales)

Hostinger **corta** valores con `&` en el panel.  
Tu password `u;DoKQ~&2` debe ir en **Base64**:

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

### Importante
1. Añade **`DATABASE_PASSWORD_B64`** = `dTtEb0tRfiYy` (es `u;DoKQ~&2` en base64)
2. Pon **`DATABASE_HOST=localhost`** (Node corre en el mismo Hostinger)
3. Puedes **borrar** `DATABASE_PASSWORD` y `DATABASE_URL` del panel (el server las reconstruye)
4. Si `localhost` falla, cambia solo a: `DATABASE_HOST=srv1855.hstgr.io`
5. **NO** pongas `PORT`

### Comprobar
https://jeisson.click/api/health

- `"ok":true` → DB bien  
- `"passLen":9` → password completa  
- `"passLen"` menor → sigue truncada; revisa `DATABASE_PASSWORD_B64`
