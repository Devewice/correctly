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

### Variables

```env
NODE_ENV=production
CLIENT_URL=https://jeisson.click
DATABASE_HOST=localhost
DATABASE_NAME=u301973293_correctly
DATABASE_USER=u301973293_admin
DATABASE_PASSWORD_B64=dTtEb0tRfiYy
JWT_SECRET=cambia-esta-clave
```

Opcional: `SERVE_SPA=false` solo si algún día cambias a `PassengerBaseURI /api`.

---

## Tras redesplegar

1. https://jeisson.click/api/health → `"mode":"passenger+spa"`, `"ui":true`
2. Login → `/onboarding`
3. **F5** en `/onboarding` → sigue la app (no `Cannot GET`)
