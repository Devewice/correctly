# Despliegue en Hostinger — jeisson.click

## Ajustes correctos en el panel

| Campo | Valor |
|-------|--------|
| Preajuste | `Other` o `Express` |
| Rama | `main` |
| Node | `20.x` / `22.x` / `24.x` |
| Directorio raíz | `./` |
| Comando de build | `npm run build` |
| Directorio de salida | `client/dist` |
| Archivo de entrada | `server/src/index.js` |

---

## Variables de entorno (copia esto)

**Importante:**
1. **NO pongas `PORT`** — Hostinger lo asigna solo. Si fijas `PORT=3000`, la web da **404**.
2. `DATABASE_URL` debe llevar la contraseña **codificada**, no la palabra `PASSWORD`.
3. `GOOGLE_CALLBACK_URL` **sin** `:3000`.

```env
NODE_ENV=production
CLIENT_URL=https://jeisson.click

DATABASE_HOST=srv1855.hstgr.io
DATABASE_PORT=3306
DATABASE_NAME=u301973293_correctly
DATABASE_USER=u301973293_admin
DATABASE_PASSWORD=y:Zz3L?>p6

DATABASE_URL=mysql://u301973293_admin:y%3AZz3L%3F%3Ep6@srv1855.hstgr.io:3306/u301973293_correctly

JWT_SECRET=pon-aqui-una-clave-larga-aleatoria

GOOGLE_CALLBACK_URL=https://jeisson.click/api/auth/google/callback
```

> Contraseña URL-encoded: `y:Zz3L?>p6` → `y%3AZz3L%3F%3Ep6`  
> (`:` = `%3A`, `?` = `%3F`, `>` = `%3E`)

### Quitar del panel
- ~~`PORT=3000`~~ ← bórrala
- ~~`DATABASE_URL=...PASSWORD@...`~~ ← cámbiala por la de arriba
- ~~`GOOGLE_CALLBACK_URL=https://jeisson.click:3000/...`~~ ← quita el `:3000`

---

## Después de guardar
1. Guarda variables
2. **Redesplegar**
3. Prueba:
   - https://jeisson.click/api/health → `{"ok":true,...}`
   - https://jeisson.click/ → login Correctly

Si `/api/health` falla, el Node no arrancó (mira logs del despliegue / runtime).
