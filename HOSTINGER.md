# Despliegue en Hostinger — jeisson.click

## Configuración recomendada

| Campo | Valor |
|-------|--------|
| Preajuste | `Other` o `Express` |
| Rama | `main` |
| Node | `24.x` |
| Directorio raíz | `./` |
| Build | `npm run build` |
| **Directorio de salida** | **déjalo VACÍO** (borra `client/dist`) |
| Archivo de entrada | `server/src/index.js` |

> Si pones `client/dist` como output, Hostinger mueve el front a `public_html` y Express ya no lo encuentra → **404 en /**.  
> El build ahora copia el front a `server/public` y Express lo sirve.

---

## Variables de entorno

```env
NODE_ENV=production
CLIENT_URL=https://jeisson.click

DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=u301973293_correctly
DATABASE_USER=u301973293_admin
DATABASE_PASSWORD=y:Zz3L?>p6
DATABASE_URL=mysql://u301973293_admin:y%3AZz3L%3F%3Ep6@localhost:3306/u301973293_correctly

JWT_SECRET=cambia-esta-clave
GOOGLE_CALLBACK_URL=https://jeisson.click/api/auth/google/callback
```

### Cambios clave
| Antes | Ahora |
|-------|--------|
| `DATABASE_HOST=srv1855.hstgr.io` | **`localhost`** (Node corre en el mismo Hostinger) |
| `PORT=3000` | **no poner PORT** |
| Output `client/dist` | **vacío** |

Si MySQL solo acepta el host remoto, pon:
```env
DATABASE_HOST_REMOTE=true
DATABASE_HOST=srv1855.hstgr.io
DATABASE_URL=mysql://u301973293_admin:y%3AZz3L%3F%3Ep6@srv1855.hstgr.io:3306/u301973293_correctly
```

---

## Comprobar

1. https://jeisson.click/api/health → `{"ok":true,"db":"up"}`
2. https://jeisson.click/ → pantalla de login Correctly
