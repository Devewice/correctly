# Arquitectura Hostinger — Opción A

## Modelo

- **Apache (`public_html`)**: HTML/JS/CSS de Vue + `.htaccess` SPA  
- **Node**: solo rutas `/api/*`  
- **MySQL**: Hostinger (`localhost` desde el mismo plan)

## Por qué no un solo Express sirviendo el HTML

En Hostinger el proxy Apache↔Node pisa las rutas Vue (`/onboarding` → JSON 404).  
Separar estático (Apache) y API (Node) evita ese conflicto.

## URLs

- App: `https://jeisson.click/login`, `/onboarding`, `/dashboard`  
- API: `https://jeisson.click/api/...`
