# Correctly

Sistema integral de seguimiento de bienestar diario.

**100% gratis** · **Español / English / Português** · Login con Google

📄 Ver [`ESPECIFICACION.md`](./ESPECIFICACION.md) para el alcance completo.

## Stack

- **Backend:** Node.js + Express + MySQL (Hostinger) + Prisma
- **Frontend:** Vue 3 + Vite + Tailwind + Motion + vue-i18n
- **Auth:** Google OAuth 2.0 (+ login demo en desarrollo)
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

Sin Google OAuth configurado, usa **Entrar en modo demo** en el login.

### Google OAuth (opcional)

En `server/.env`:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

## Repo

https://github.com/Devewice/correctly.git
