# Correctly en Hostinger (Passenger)

## Por qué veías `Cannot GET /onboarding`

Hostinger usa **Passenger** con:

```apache
PassengerBaseURI /
```

Eso manda **casi todas** las URLs a Node (Express), no a Apache.  
Las reglas `RewriteRule ^ index.html` **no ganan** a Passenger → Express responde `Cannot GET /onboarding`.

Por eso el server vuelve a servir el HTML de Vue (`server/ui`) cuando llega `/onboarding`.

---

## `.htaccess` recomendado

**Deja el bloque Passenger** que crea Hostinger (no lo borres).  
Puede quedar así:

```apache
PassengerAppRoot /home/u301973293/domains/jeisson.click/.builds/current/nodejs
PassengerAppType node
PassengerNodejs /opt/alt/alt-nodejs24/root/bin/node
PassengerStartupFile server/src/index.js
PassengerBaseURI /
PassengerRestartDir /home/u301973293/domains/jeisson.click/.builds/current/nodejs/tmp
SetEnv NODE_OPTIONS "--require /home/u301973293/domains/jeisson.click/.builds/config/preload-timestamp.js"
SetEnv LSNODE_CONSOLE_LOG console.log

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  RewriteCond %{REQUEST_FILENAME} -f
  RewriteRule ^ - [L]
</IfModule>
```

No hace falta el `RewriteRule ^ index.html` si Passenger apunta a `/` — lo resuelve Node.

---

## Panel Node

| Campo | Valor |
|-------|--------|
| Output | `server/public` |
| Entry | `server/src/index.js` |
| Build | `npm run build` |

### Variables (panel Node / Environment)

Ponlas en el **panel de Hostinger** (Environment variables), no en un `.env` dentro del repo que se borra al redesplegar.

```env
NODE_ENV=production
CLIENT_URL=https://jeisson.click

# MySQL (en Passenger suele ser localhost hacia la DB del hosting)
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=u301973293_correctly
DATABASE_USER=u301973293_admin
DATABASE_PASSWORD_B64=TU_PASSWORD_EN_BASE64

# Sesión
JWT_SECRET=una-cadena-larga-aleatoria

# Google OAuth (producción)
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
GOOGLE_CALLBACK_URL=https://jeisson.click/api/auth/google/callback

# Web Push (opcional si ya las guardaste en Admin → Web Push)
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:admin@jeisson.click
```

**No definas** `PORT` en Hostinger (Passenger lo gestiona).  
`SERVE_SPA=false` solo si algún día usas `PassengerBaseURI /api`.

### Qué se borra al redesplegar y qué no

| Dónde lo guardaste | ¿Sobrevive al redeploy? |
|--------------------|-------------------------|
| Variables del **panel** Hostinger | Sí |
| Filas en MySQL (`AppSetting`) vía wizard Admin | Sí |
| Archivo `.env` dentro de `.builds/current/...` | **No** (se pisa en cada deploy) |

Google y VAPID se pueden guardar **solo con el wizard Admin** (van a la DB). El `.env`/panel es respaldo o para el primer arranque.

### Google Cloud (debe coincidir)

- Orígenes JS: `https://jeisson.click`
- Redirect URI: `https://jeisson.click/api/auth/google/callback`
- Mismo Client ID / Secret que en el panel o en Admin → Google login

---

## Tras redesplegar

1. https://jeisson.click/api/health → `"mode":"passenger+spa"`, `"ui":true`
2. Si el login Google falla: Admin → Google login → vuelve a pegar ID/Secret/Callback y guardar
3. Login → `/onboarding` o `/dashboard`
4. **F5** en `/onboarding` → sigue la app (no `Cannot GET`)
