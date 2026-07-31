# Correctly

Sistema integral de seguimiento de bienestar diario.

**100% gratis** · **Español / English / Português** · Login con Google

📄 Ver [`ESPECIFICACION.md`](./ESPECIFICACION.md) para el alcance completo.

## Stack

- **Backend:** Node.js + Express + MySQL (Hostinger) + Prisma
- **Frontend:** Vue 3 + Vite + Vuetify + Motion + vue-i18n
- **Auth:** Google OAuth 2.0
- **i18n:** ES / EN / PT

## Arranque local

```bash
# 1) Credenciales MySQL ya van en server/.env (no se sube a git)
cp server/.env.example server/.env   # si aún no existe

# 2) Instalar
npm install

# 3) Crear tablas en MySQL Hostinger
npm run db:push

# 4) Levantar API + Vue
npm run dev
```

- Front: http://localhost:5173  
- API: http://localhost:3000/api/health  

### Google OAuth (requerido para entrar)

En `server/.env`:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

## Deploy Hostinger (Opción A)

Front en Apache (`public_html`) + API Node solo en `/api`.  
Guía: [`HOSTINGER.md`](./HOSTINGER.md)

## Repo

https://github.com/Devewice/correctly.git
