# Correctly — Especificación del Producto

> **Sistema integral de seguimiento de bienestar diario**  
> Login con Google · Dashboard personalizado · Registro de comidas, sueño, hábitos y más  
> Documento de planificación — v1.1 · Julio 2026  
> **Repo:** https://github.com/Devewice/correctly.git · **100% gratis** · **ES / EN / PT**

---

## Tabla de contenidos

1. [Visión y propuesta de valor](#1-visión-y-propuesta-de-valor)
2. [Análisis de plataformas competidoras](#2-análisis-de-plataformas-competidoras)
3. [Stack tecnológico propuesto](#3-stack-tecnológico-propuesto)
4. [Autenticación y usuarios](#4-autenticación-y-usuarios)
5. [Módulos funcionales](#5-módulos-funcionales)
6. [Dashboard principal](#6-dashboard-principal)
7. [Diseño UI/UX y paleta de colores](#7-diseño-uiux-y-paleta-de-colores)
8. [Gamificación y motivación](#8-gamificación-y-motivación)
9. [Notificaciones y recordatorios](#9-notificaciones-y-recordatorios)
10. [Insights, correlaciones e IA](#10-insights-correlaciones-e-ia)
11. [Modelo de datos (borrador)](#11-modelo-de-datos-borrador)
12. [API REST (borrador)](#12-api-rest-borrador)
13. [Estructura del proyecto](#13-estructura-del-proyecto)
14. [Fases de desarrollo](#14-fases-de-desarrollo)
15. [Privacidad, seguridad y cumplimiento](#15-privacidad-seguridad-y-cumplimiento)
16. [Métricas de éxito (KPIs)](#16-métricas-de-éxito-kpis)
17. [Decisiones de producto (cerradas)](#17-decisiones-de-producto-cerradas)

---

## 1. Visión y propuesta de valor

**Correctly** es una plataforma web de bienestar personal que ayuda al usuario a registrar, visualizar y mejorar su día a día de forma sencilla y agradable. A diferencia de apps que se especializan en una sola cosa (solo calorías, solo ánimo, solo hábitos), Correctly unifica el seguimiento diario en un solo lugar con una experiencia visual cálida, calmada y motivadora.

### Problema que resuelve

- Las personas quieren cuidar su bienestar pero usan 4–5 apps distintas (comida, agua, sueño, ánimo, ejercicio).
- Registrar datos se siente como "tarea" — muchas apps son frías, complejas o abrumadoras.
- No hay una vista clara de "¿cómo va mi día?" en un solo vistazo.

### Propuesta única de Correctly

| Diferenciador | Descripción |
|---------------|-------------|
| **Timeline del día** | Vista cronológica visual: desayuno → almuerzo → cena → dormir, con hora marcada automáticamente |
| **Registro en 2 toques** | Inspirado en Daylio: iconos, presets, sin fricción |
| **Estética wellness** | Colores suaves, animaciones fluidas, sensación de calma (no clínica ni gamificada excesiva) |
| **Correlaciones inteligentes** | "Duermes mejor los días que haces ejercicio" — insights accionables |
| **Todo en uno, sin sobrecarga** | Módulos activables según lo que le importe al usuario |

### Público objetivo

- Adultos 25–45 que buscan mejorar rutinas diarias
- Personas que quieren orden en su día sin obsesionarse con números
- Usuarios que valoran diseño bonito y experiencia fluida

### Nombre del producto

**Correctly** — "Hazlo correctamente, un día a la vez."

---

## 2. Análisis de plataformas competidoras

Investigación de referentes para decidir qué incluir, qué mejorar y qué evitar.

### 2.1 Mapa competitivo

| Plataforma | Fortaleza principal | Qué tomamos | Qué evitamos |
|------------|--------------------|--------------|--------------|
| **MyFitnessPal** | Base de alimentos enorme, macros, barcode scan | Registro de comidas con hora, macros opcionales, hidratación integrada | UI abrumadora, enfoque 100% calorías, paywall agresivo |
| **Daylio** | Registro de ánimo en <10 seg con emojis | Logging ultra-rápido, "Year in Pixels", actividades custom | Sin módulo nutricional profundo |
| **Fabulous** | Rutinas matutinas guiadas, ciencia del comportamiento | Ritual matutino/nocturno, onboarding progresivo | Coaching muy prescritivo, suscripción cara |
| **Habitica** | Gamificación RPG profunda | XP, logros, rachas (versión suave) | Estética cartoon, presión social excesiva |
| **Sleep Cycle** | Análisis de sueño, smart alarm | Registro de hora de acostarse/despertar, calidad del sueño | Requiere hardware/micrófono |
| **Headspace / Calm** | Meditación guiada | Timer de mindfulness, sesiones cortas | Contenido premium costoso |
| **Apple Health / Google Fit** | Hub central de datos de salud | Visión holística, integración futura con wearables | No es una app standalone amigable |
| **Noom** | Coaching psicológico de hábitos | Tips contextuales según patrones | Modelo de suscripción pesado |
| **Bearable** | Correlaciones avanzadas (síntomas, meds, ánimo) | Motor de correlaciones entre sueño ↔ ánimo ↔ comida | UI compleja para usuario casual |
| **loggd.life / Selv** | Dashboard unificado + gamificación adulta | Heatmaps, radar de "atributos de vida", XP sin culpa | Demasiado orientado a productividad |

### 2.2 Funcionalidades "must have" (consenso del mercado)

Extraídas de lo que las apps más exitosas comparten:

- ✅ Registro rápido con hora automática
- ✅ Dashboard con progreso del día en %
- ✅ Rachas (streaks) con protección de "día libre"
- ✅ Recordatorios configurables
- ✅ Gráficos semanales/mensuales
- ✅ Modo oscuro
- ✅ Exportación de datos (CSV/PDF)
- ✅ Metas personalizables
- ✅ Onboarding que personaliza qué módulos ver

### 2.3 Funcionalidades diferenciadoras para Correctly

- 🌅 **Timeline visual del día** — línea temporal con bloques de color por actividad
- 🎨 **Micro-animaciones de celebración** al completar comidas/hábitos (confetti suave, no arcade)
- 🔗 **Correlaciones en lenguaje humano** — no solo gráficos, sino frases: *"Esta semana dormiste 40 min más cuando cenaste antes de las 8pm"*
- 🧩 **Módulos activables** — el usuario elige qué quiere trackear (no todos ven todo)
- 📋 **Plantillas de día** — "Día de oficina", "Día de gym", "Fin de semana"

---

## 3. Stack tecnológico propuesto

### Backend

| Tecnología | Uso |
|------------|-----|
| **Node.js + Express** | API REST |
| **MySQL** (Hostinger) | Base de datos remota: `u301973293_correctly` en `srv1855.hstgr.io` |
| **Prisma ORM** | Migraciones y queries type-safe (`provider = "mysql"`) |
| **Passport.js + Google OAuth 2.0** | Autenticación con Google |
| **JWT + httpOnly cookies** | Sesiones seguras |
| **node-cron** | Tareas programadas (recordatorios, resúmenes) |
| **Zod** | Validación de requests |

### Frontend

| Tecnología | Uso |
|------------|-----|
| **Vue 3 + Vite** | SPA reactiva |
| **Vue Router** | Navegación |
| **Pinia** | Estado global |
| **Tailwind CSS** | Estilos utility-first |
| **@vueuse/motion** | Animaciones declarativas (transiciones, hover, scroll) |
| **GSAP** (opcional fase 2) | Animaciones complejas (timeline del día, celebraciones) |
| **Chart.js / ApexCharts** | Gráficos del dashboard |
| **VueUse** | Composables utilitarios |
| **vue-i18n** | Internacionalización ES / EN / PT |
| **date-fns** | Manejo de fechas |

### Infraestructura (futuro)

| Tecnología | Uso |
|------------|-----|
| **Hostinger MySQL** | DB de producción/dev: host `srv1855.hstgr.io` / IP `82.197.82.134` · dominio `jeisson.click` |
| **phpMyAdmin** | Administración visual de la BD (panel Hostinger) |
| **Railway / Render / Fly.io / VPS** | Deploy backend (cuando corresponda) |
| **Vercel / Netlify / Hostinger** | Deploy frontend |
| **Cloudinary** | Fotos de comidas (fase 2) |

---

## 4. Autenticación y usuarios

### 4.1 Login con Google

- OAuth 2.0 via Google Identity Services
- Scopes mínimos: `openid`, `email`, `profile`
- Creación automática de cuenta en primer login
- Avatar y nombre importados de Google

### 4.2 Perfil de usuario

| Campo | Descripción |
|-------|-------------|
| Nombre / Apellido | De Google o editable |
| Email | De Google (no editable) |
| Avatar | De Google o custom |
| Zona horaria | Auto-detectada, editable |
| Idioma preferido | ES / EN / PT (i18n completo desde el inicio) |
| Unidades | Métrico / Imperial |
| Meta principal | Bienestar general, perder peso, dormir mejor, etc. |
| Módulos activos | Qué secciones tiene habilitadas |
| Hora de despertar objetivo | Para calcular rutina |
| Hora de dormir objetivo | Para recordatorios nocturnos |

### 4.3 Onboarding (primer uso)

Flujo de 5 pasos post-login:

1. **Bienvenida** — animación suave, mensaje cálido
2. **¿Qué quieres mejorar?** — selección múltiple (comida, sueño, ánimo, ejercicio, agua, hábitos)
3. **Tu rutina** — hora despertar, hora dormir, horarios típicos de comidas
4. **Tus metas** — opcional, ej: "Beber 2L agua", "Dormir 8h", "Meditar 10 min"
5. **Tour del dashboard** — highlight animado de las secciones activas

---

## 5. Módulos funcionales

Cada módulo es independiente pero se refleja en el dashboard y timeline unificados.

---

### 5.1 🍳 Nutrición y comidas

**Inspirado en:** MyFitnessPal, pero más simple y visual.

#### Comidas del día

| Comida | Icono | Hora sugerida (configurable) |
|--------|-------|------------------------------|
| Desayuno | 🌅 | 07:00 – 10:00 |
| Media mañana | ☕ | 10:00 – 12:00 |
| Almuerzo | 🍽️ | 12:00 – 15:00 |
| Merienda | 🍎 | 15:00 – 18:00 |
| Cena | 🌙 | 18:00 – 21:00 |
| Snack nocturno | 🌃 | 21:00 – 23:00 |

#### Datos por comida

- **Hora exacta** — auto-registrada al guardar, editable
- **Descripción** — texto libre o selección rápida
- **Presets rápidos** — "Café con leche", "Ensalada", "Pollo con arroz" (personalizables)
- **Foto opcional** — adjuntar imagen (fase 2)
- **Nivel de saciedad** — emoji scale: 😫 hambriento → 😊 satisfecho → 🤢 exceso
- **Calidad percibida** — ⭐ 1–5 (¿qué tan saludable fue?)
- **Macros opcionales** — calorías, proteína, carbs, grasa (no obligatorio)
- **Etiquetas** — casero, restaurante, delivery, vegetariano, etc.
- **Notas** — campo libre

#### Funciones extra

- Copiar comida de otro día ("Comí lo mismo que ayer")
- Favoritos / comidas frecuentes
- Resumen nutricional del día (si se registran macros)
- Alerta si falta registrar una comida según horario habitual

---

### 5.2 💧 Hidratación

**Inspirado en:** WaterMinder, integración MyFitnessPal.

| Feature | Detalle |
|---------|---------|
| Meta diaria | Vasos o ml (default: 2000 ml) |
| Registro rápido | Botones: +250ml, +500ml, +1 vaso |
| Tipos de bebida | Agua, té, café, jugo, otro |
| Progreso visual | Vaso/barra que se llena con animación líquida |
| Recordatorio | Cada X horas si no ha registrado |

---

### 5.3 😴 Sueño

**Inspirado en:** Sleep Cycle, Apple Health.

| Feature | Detalle |
|---------|---------|
| Hora de acostarse | Registro con timestamp ("Me fui a la cama") |
| Hora de despertar | Registro o auto al abrir app en la mañana |
| Duración calculada | Automática |
| Calidad del sueño | Escala 1–5 o emojis: 😴 😐 😫 |
| Interrupciones | Número de veces que despertó (opcional) |
| Factores | Cafeína tarde, alcohol, estrés, ejercicio, pantallas (tags) |
| Rutina pre-sueño | Checklist: sin pantallas, lectura, meditación, etc. |
| Meta | Ej: 7.5h por noche |
| Gráfico semanal | Barras de duración + línea de calidad |

---

### 5.4 😊 Ánimo y energía

**Inspirado en:** Daylio, Bearable.

| Feature | Detalle |
|---------|---------|
| Registro de ánimo | 5 niveles con emoji: 😢 😕 😐 🙂 😄 |
| Nivel de energía | Baja / Media / Alta |
| Nivel de estrés | Bajo / Medio / Alto |
| Momento del día | Mañana, tarde, noche (auto según hora) |
| Actividades del momento | Tags: trabajo, gym, familia, descanso, etc. |
| Nota opcional | Diario breve |
| "Year in Pixels" | Cuadrícula anual de colores por ánimo |
| Correlaciones | Ánimo vs sueño, vs ejercicio, vs comida |

---

### 5.5 🏃 Actividad física

**Inspirado en:** Strava (simplificado), Google Fit.

| Feature | Detalle |
|---------|---------|
| Tipo de actividad | Caminar, correr, gym, yoga, natación, ciclismo, otro |
| Duración | Minutos |
| Intensidad | Ligera / Moderada / Intensa |
| Pasos (opcional) | Número manual o futuro sync con wearable |
| Calorías quemadas (opcional) | Estimación |
| Notas | "Rutina de piernas", "Caminata en el parque" |
| Meta semanal | Ej: 150 min de actividad moderada (OMS) |

---

### 5.6 🧘 Mindfulness y pausas

**Inspirado en:** Headspace, Calm.

| Feature | Detalle |
|---------|---------|
| Meditación | Timer configurable (5, 10, 15, 20 min) |
| Respiración guiada | Animación visual de inhalar/exhalar |
| Pausa activa | Recordatorio de levantarse cada X minutos |
| Registro post-sesión | Cómo se sintió: más calmado, igual, inquieto |
| Racha de meditación | Días consecutivos |
| Tipos | Meditación libre, body scan, gratitud, visualización |

---

### 5.7 ✅ Hábitos diarios

**Inspirado en:** Habitica (versión suave), Fabulous.

#### Hábitos predefinidos (activables)

| Hábito | Categoría |
|--------|-----------|
| Tomar vitaminas | Salud |
| Leer 15 minutos | Crecimiento |
| Estiramiento matutino | Cuerpo |
| Sin redes sociales 1h antes de dormir | Bienestar digital |
| Escribir gratitud (3 cosas) | Mental |
| Tidy desk / ordenar espacio | Productividad |
| Llamar a alguien querido | Social |
| No tomar alcohol | Salud |
| Preparar comida casera | Nutrición |

#### Datos por hábito

- Nombre custom
- Icono y color
- Frecuencia: diario, días específicos, X veces/semana
- Recordatorio a hora específica
- Racha actual y mejor racha
- "Streak freeze" — 1 día de protección por semana

---

### 5.8 ⚖️ Peso y medidas corporales

**Inspirado en:** MyFitnessPal, apps de fitness.

| Feature | Detalle |
|---------|---------|
| Peso | Registro con fecha, gráfico de tendencia |
| Medidas opcionales | Cintura, cadera, brazo |
| Frecuencia sugerida | 1x/semana (no obsesivo) |
| IMC calculado | Automático si hay altura en perfil |
| Notas | "Post-vacaciones", "Me siento hinchado" |

---

### 5.9 💊 Medicamentos y suplementos

**Inspirado en:** Bearable.

| Feature | Detalle |
|---------|---------|
| Medicamento | Nombre, dosis, frecuencia |
| Recordatorio | Hora(s) del día |
| Registro de toma | Check con timestamp |
| Efectos secundarios (opcional) | Tags: somnolencia, náusea, etc. |
| Correlación con ánimo/sueño | Insight automático |

---

### 5.10 📝 Diario / Journal

**Inspirado en:** Daylio, Notion (simplificado).

| Feature | Detalle |
|---------|---------|
| Entrada libre | Texto enriquecido básico |
| Prompts sugeridos | "¿Qué salió bien hoy?", "¿Qué aprendí?" |
| Entrada matutina | Intención del día (1 frase) |
| Entrada nocturna | Reflexión del día (1–3 frases) |
| Adjuntar foto | Opcional |
| Búsqueda | Por texto o fecha |
| Privacidad | Solo visible para el usuario |

---

### 5.11 🌤️ Contexto ambiental (fase 2)

| Feature | Detalle |
|---------|---------|
| Clima | Auto via API según ubicación |
| Correlación | "Los días lluviosos tu ánimo baja un 15%" |

---

## 6. Dashboard principal

El corazón de Correctly. Debe responder en 3 segundos: **"¿Cómo va mi día?"**

### 6.1 Layout del dashboard

```
┌─────────────────────────────────────────────────────┐
│  👋 Buenos días, [Nombre]          [Avatar] [⚙️]    │
│  Jueves, 30 de Julio 2026                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─── Progreso del día ────────────────────────┐   │
│  │  ████████████░░░░░░░░  68% completado       │   │
│  │  6 de 9 registros · Racha: 🔥 12 días       │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─── Timeline del día ────────────────────────┐   │
│  │  07:30 🌅 Desayuno ✅  "Avena con frutas"   │   │
│  │  10:00 ☕ Snack     ⬜  (pendiente)          │   │
│  │  13:15 🍽️ Almuerzo  ✅  "Pollo y ensalada"  │   │
│  │  15:30 💧 Agua      ✅  +500ml              │   │
│  │  18:00 🏃 Gym       ✅  45 min              │   │
│  │  20:00 🌙 Cena      ⬜  (pendiente)          │   │
│  │  22:30 😴 Dormir    ⬜  (pendiente)          │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─ Comidas ─┐ ┌─ Agua ──┐ ┌─ Ánimo ─┐ ┌─ Sueño ─┐│
│  │  3/5 ✅   │ │ 1.5/2L  │ │  😊     │ │  -- h   ││
│  └───────────┘ └─────────┘ └─────────┘ └─────────┘│
│                                                     │
│  ┌─── Insight del día ─────────────────────────┐   │
│  │  💡 "Llevas 3 días registrando desayuno      │   │
│  │      antes de las 8am. ¡Buen ritmo!"          │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─── Hábitos de hoy ──────────────────────────┐   │
│  │  ✅ Vitaminas  ✅ Leer  ⬜ Estiramiento      │   │
│  │  ✅ Gratitud   ⬜ Sin pantallas              │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  [+ Registrar algo]                                 │
└─────────────────────────────────────────────────────┘
```

### 6.2 Widgets del dashboard (reordenables)

| Widget | Contenido |
|--------|-----------|
| **Progreso del día** | Barra circular/lineal con % de registros completados |
| **Timeline** | Línea temporal vertical con eventos del día |
| **Tarjetas rápidas** | Mini-resumen por módulo activo |
| **Ánimo actual** | Último registro de ánimo con emoji grande |
| **Agua** | Vaso animado con progreso |
| **Hábitos** | Checklist del día |
| **Insight** | Tip/correlación personalizada |
| **Racha** | Días consecutivos con registro |
| **Calorías** (opcional) | Resumen si se trackean macros |
| **Sueño anoche** | Duración + calidad |
| **Mini calendario** | Heatmap del mes |

### 6.3 Acciones rápidas (FAB / botón flotante)

Botón "+" con menú radial animado:

- 🍳 Registrar comida
- 💧 Agregar agua
- 😊 Registrar ánimo
- 🏃 Registrar actividad
- ✅ Marcar hábito
- 😴 Me voy a dormir
- 🧘 Meditar
- 📝 Escribir en diario

---

## 7. Diseño UI/UX y paleta de colores

### 7.1 Principios de diseño

1. **Calma** — nada agresivo, nada clínico
2. **Calidez** — tonos tierra, pasteles, naturaleza
3. **Claridad** — jerarquía visual clara, poco texto
4. **Delicia** — micro-animaciones que dan placer al usar
5. **Accesibilidad** — contraste WCAG AA, soporte reduced-motion

### 7.2 Paleta de colores propuesta

#### Colores primarios

| Nombre | Hex | Uso |
|--------|-----|-----|
| **Sage Green** | `#8BA888` | Primary — botones, acentos, progreso |
| **Sage Light** | `#B5CFB5` | Hover, backgrounds suaves |
| **Sage Dark** | `#5E7A5B` | Texto sobre fondos claros, active states |

#### Colores secundarios

| Nombre | Hex | Uso |
|--------|-----|-----|
| **Warm Sand** | `#F5EDE3` | Background principal |
| **Soft Peach** | `#F4CBA8` | Acentos cálidos, desayuno, celebraciones |
| **Lavender Mist** | `#D4C5E2` | Acentos fríos, sueño, mindfulness |
| **Sky Blue** | `#A8D4E6` | Agua, hidratación |
| **Blush Pink** | `#E8B4B8` | Ánimo, corazón, gamificación suave |

#### Colores funcionales

| Nombre | Hex | Uso |
|--------|-----|-----|
| **Success** | `#7CB88F` | Completado, hábito hecho |
| **Warning** | `#E8C468` | Pendiente, alerta suave |
| **Error** | `#D98880` | Error (suave, no rojo agresivo) |
| **Text Primary** | `#3D3D3D` | Texto principal |
| **Text Secondary** | `#7A7A7A` | Texto secundario |
| **Surface** | `#FFFFFF` | Tarjetas, modals |
| **Background** | `#FAF8F5` | Fondo general |

#### Modo oscuro

| Nombre | Hex | Uso |
|--------|-----|-----|
| **Dark BG** | `#1A1A2E` | Fondo |
| **Dark Surface** | `#252540` | Tarjetas |
| **Dark Sage** | `#6B9E68` | Primary en dark |
| **Dark Text** | `#E8E8E8` | Texto |

### 7.3 Tipografía

| Uso | Fuente | Peso |
|-----|--------|------|
| Headings | **Nunito** o **Quicksand** | 600–700 |
| Body | **Inter** o **DM Sans** | 400–500 |
| Números/stats | **Tabular nums** | 600 |

> Fuentes redondeadas y amigables — evitar serif formales o sans-serif corporativas.

### 7.4 Animaciones (@vueuse/motion + CSS)

| Momento | Animación |
|---------|-----------|
| Entrada al dashboard | Fade-in escalonado de widgets (stagger 100ms) |
| Registrar comida | Tarjeta se desliza al timeline con spring |
| Completar hábito | Checkmark con bounce + confetti suave (partículas pastel) |
| Llenar agua | Onda líquida que sube |
| Cambio de ánimo | Emoji con scale bounce |
| "Me voy a dormir" | Transición a modo nocturno (dark + estrellas sutiles) |
| Cambio de página | Slide suave entre vistas |
| Hover en tarjetas | Elevación sutil (shadow + translateY -2px) |
| Progreso del día | Barra que se llena con easing |
| Logros desbloqueados | Modal con shimmer dorado suave |

### 7.5 Iconografía

- Estilo: **outline rounded** (Lucide Icons o Phosphor Icons)
- Emojis nativos para ánimo, comida rápida
- Ilustraciones custom para empty states (persona meditando, cocinando, durmiendo)

---

## 8. Gamificación y motivación

Inspirado en Habitica/Selv pero **sin culpa ni presión excesiva**.

### 8.1 Sistema de XP y niveles

| Acción | XP |
|--------|-----|
| Registrar comida | +10 XP |
| Registrar ánimo | +10 XP |
| Completar hábito | +15 XP |
| Registrar sueño | +10 XP |
| Sesión de meditación | +20 XP |
| Completar todo el día | +50 XP bonus |
| Racha de 7 días | +100 XP bonus |

**Niveles:** Semilla → Brote → Planta → Árbol → Bosque → Maestro del Bienestar (6 niveles)

### 8.2 Logros / Badges

| Badge | Condición |
|-------|-----------|
| 🌅 Madrugador | 7 desayunos registrados antes de las 8am |
| 💧 Hidratado | 7 días cumpliendo meta de agua |
| 🔥 Racha de fuego | 30 días consecutivos con registro |
| 🧘 Zen Master | 30 sesiones de meditación |
| 📝 Escritor | 30 entradas de diario |
| 🍳 Chef | 20 comidas caseras registradas |
| 😴 Dormilón pro | 7 noches con 7+ horas de sueño |
| ⭐ Semana perfecta | 7 días al 100% de registros |

### 8.3 Rachas (Streaks)

- Contador visible en dashboard
- **Streak freeze:** 1 por semana — protege la racha si un día no registras
- Notificación amable (no culpabilizante): *"Tu racha de 12 días sigue viva. ¿Tienes 30 segundos para registrar tu cena?"*

### 8.4 Frases motivacionales

Rotativas según contexto (no genéricas):

- Mañana: *"Un buen desayuno es el primer regalo del día."*
- Noche: *"Registrar tu día es un acto de amor propio."*
- Racha rota: *"Las plantas no crecen en línea recta. Mañana es un nuevo día."*

---

## 9. Notificaciones y recordatorios

| Tipo | Trigger | Mensaje ejemplo |
|------|---------|-----------------|
| Comida | Hora habitual sin registro | "¿Ya almorzaste? Regístralo en 2 toques 🍽️" |
| Agua | Cada 2h sin registro | "Un vaso de agua haría bien ahora 💧" |
| Hábito | Hora configurada | "Hora de tu hábito: Leer 15 minutos 📖" |
| Sueño | 30 min antes de hora objetivo | "Es hora de empezar tu rutina nocturna 🌙" |
| Ánimo | Si no ha registrado hoy | "¿Cómo te sientes hoy? 😊" |
| Resumen | 21:00 | "Tu día va al 75%. ¿Completamos juntos?" |
| Semanal | Domingo 10:00 | "Tu resumen semanal está listo 📊" |

**Canales:** In-app (campana), push web (fase 2), email semanal (opt-in).

---

## 10. Insights, correlaciones e IA

### 10.1 Correlaciones automáticas (Fase 2)

Motor que analiza patrones y genera frases:

| Correlación | Ejemplo de insight |
|-------------|-------------------|
| Sueño ↔ Ánimo | "Duermes 45 min más los días que haces ejercicio" |
| Comida ↔ Energía | "Tu energía es más alta cuando desayunas antes de las 8am" |
| Agua ↔ Concentración | "Los días que bebes 2L+, registras mejor ánimo" |
| Cena tarde ↔ Sueño | "Cenar después de las 9pm reduce tu calidad de sueño un 20%" |

### 10.2 Resumen semanal/mensual

- PDF/web con gráficos
- Mejor/peor día
- Promedios de sueño, agua, ánimo
- Hábitos más/menos cumplidos
- Comparativa con semana anterior

### 10.3 IA generativa (Fase 3 — opcional)

- Sugerencias de comidas basadas en historial
- Tips personalizados de bienestar
- Análisis de diario con sentimiento

---

## 11. Modelo de datos (borrador)

```
User
├── id, googleId, email, name, avatar
├── timezone, language, units
├── wakeTime, sleepTime, onboardingCompleted
├── activeModules[], createdAt, updatedAt
│
├── Goals[]
│   ├── id, userId, type, target, unit, active
│
├── MealLogs[]
│   ├── id, userId, type (breakfast|lunch|dinner|snack)
│   ├── timestamp, description, photoUrl
│   ├── satisfaction, quality, calories?, macros?
│   ├── tags[], notes
│
├── WaterLogs[]
│   ├── id, userId, amount, unit, beverageType, timestamp
│
├── SleepLogs[]
│   ├── id, userId, bedTime, wakeTime, duration
│   ├── quality, interruptions, factors[], notes
│
├── MoodLogs[]
│   ├── id, userId, mood (1-5), energy, stress
│   ├── timestamp, activities[], notes
│
├── ActivityLogs[]
│   ├── id, userId, type, duration, intensity
│   ├── calories?, steps?, notes, timestamp
│
├── HabitDefinitions[]
│   ├── id, userId, name, icon, color
│   ├── frequency, reminderTime, active
│
├── HabitCompletions[]
│   ├── id, habitId, userId, date, completed, timestamp
│
├── MeditationLogs[]
│   ├── id, userId, duration, type, feeling, timestamp
│
├── WeightLogs[]
│   ├── id, userId, weight, unit, measurements{}, timestamp
│
├── Medications[]
│   ├── id, userId, name, dosage, frequency, reminderTimes[]
│
├── MedicationLogs[]
│   ├── id, medicationId, userId, taken, timestamp
│
├── JournalEntries[]
│   ├── id, userId, content, type (free|morning|evening)
│   ├── prompt?, photoUrl?, timestamp
│
├── Achievements[]
│   ├── id, userId, badgeId, unlockedAt
│
└── UserStats
    ├── userId, totalXP, level, currentStreak, bestStreak
    ├── streakFreezesRemaining, lastLogDate
```

---

## 12. API REST (borrador)

### Auth

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/auth/google` | Iniciar OAuth |
| GET | `/api/auth/google/callback` | Callback OAuth |
| POST | `/api/auth/logout` | Cerrar sesión |
| GET | `/api/auth/me` | Usuario actual |

### Usuario

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/user/profile` | Perfil |
| PUT | `/api/user/profile` | Actualizar perfil |
| PUT | `/api/user/onboarding` | Completar onboarding |
| GET | `/api/user/stats` | XP, nivel, rachas |
| GET | `/api/user/achievements` | Logros desbloqueados |

### Logs (patrón común)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/meals?date=YYYY-MM-DD` | Comidas del día |
| POST | `/api/meals` | Registrar comida |
| PUT | `/api/meals/:id` | Editar comida |
| DELETE | `/api/meals/:id` | Eliminar comida |
| GET | `/api/water?date=` | Agua del día |
| POST | `/api/water` | Registrar agua |
| GET | `/api/sleep?date=` | Sueño |
| POST | `/api/sleep` | Registrar sueño |
| GET | `/api/mood?date=` | Ánimo |
| POST | `/api/mood` | Registrar ánimo |
| GET | `/api/activities?date=` | Actividades |
| POST | `/api/activities` | Registrar actividad |
| GET | `/api/habits` | Definiciones de hábitos |
| POST | `/api/habits/:id/complete` | Marcar hábito |
| GET | `/api/journal?date=` | Diario |
| POST | `/api/journal` | Nueva entrada |
| GET | `/api/weight?from=&to=` | Historial de peso |
| POST | `/api/weight` | Registrar peso |

### Dashboard

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/dashboard/today` | Resumen completo del día |
| GET | `/api/dashboard/timeline?date=` | Timeline del día |
| GET | `/api/dashboard/weekly?week=` | Resumen semanal |
| GET | `/api/dashboard/insights` | Correlaciones e insights |

---

## 13. Estructura del proyecto

```
correctly/
├── ESPECIFICACION.md          ← este documento
├── README.md
├── package.json               ← scripts root (dev, build)
├── .env.example               ← plantilla (sin secretos)
│
├── server/
│   ├── package.json
│   ├── .env                   ← MySQL Hostinger (NO subir a git)
│   ├── prisma/
│   │   └── schema.prisma      ← provider = "mysql"
│   ├── src/
│   │   ├── index.js
│   │   ├── config/
│   │   │   ├── passport.js
│   │   │   └── database.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── validate.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── meals.routes.js
│   │   │   ├── water.routes.js
│   │   │   ├── sleep.routes.js
│   │   │   ├── mood.routes.js
│   │   │   ├── habits.routes.js
│   │   │   ├── activities.routes.js
│   │   │   ├── journal.routes.js
│   │   │   └── dashboard.routes.js
│   │   ├── controllers/
│   │   ├── services/
│   │   └── utils/
│   └── .env.example
│
├── client/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── index.html
│   ├── public/
│   └── src/
│       ├── main.js
│       ├── App.vue
│       ├── assets/
│       │   └── styles/
│       │       └── main.css
│       ├── router/
│       │   └── index.js
│       ├── stores/
│       │   ├── auth.js
│       │   ├── dashboard.js
│       │   └── user.js
│       ├── composables/
│       │   ├── useMeals.js
│       │   ├── useWater.js
│       │   └── useAnimations.js
│       ├── components/
│       │   ├── layout/
│       │   │   ├── AppHeader.vue
│       │   │   ├── AppSidebar.vue
│       │   │   └── AppFab.vue
│       │   ├── dashboard/
│       │   │   ├── DayProgress.vue
│       │   │   ├── DayTimeline.vue
│       │   │   ├── QuickCards.vue
│       │   │   ├── HabitChecklist.vue
│       │   │   └── InsightCard.vue
│       │   ├── meals/
│       │   │   ├── MealForm.vue
│       │   │   ├── MealCard.vue
│       │   │   └── MealPresets.vue
│       │   ├── mood/
│       │   │   └── MoodPicker.vue
│       │   ├── water/
│       │   │   └── WaterTracker.vue
│       │   ├── sleep/
│       │   │   └── SleepTracker.vue
│       │   ├── habits/
│       │   │   └── HabitItem.vue
│       │   └── shared/
│       │       ├── BaseButton.vue
│       │       ├── BaseCard.vue
│       │       ├── BaseModal.vue
│       │       └── EmojiScale.vue
│       ├── views/
│       │   ├── LoginView.vue
│       │   ├── OnboardingView.vue
│       │   ├── DashboardView.vue
│       │   ├── MealsView.vue
│       │   ├── WaterView.vue
│       │   ├── SleepView.vue
│       │   ├── MoodView.vue
│       │   ├── HabitsView.vue
│       │   ├── ActivityView.vue
│       │   ├── JournalView.vue
│       │   ├── StatsView.vue
│       │   ├── ProfileView.vue
│       │   └── SettingsView.vue
│       └── utils/
│           ├── api.js
│           └── dates.js
│
└── docs/
    └── wireframes/            ← (futuro)
```

---

## 14. Fases de desarrollo

### 🟢 Fase 1 — MVP (4–6 semanas)

**Objetivo:** App funcional con lo esencial.

| Feature | Incluido |
|---------|----------|
| Login Google | ✅ |
| Onboarding básico | ✅ |
| Dashboard con timeline | ✅ |
| Registro de comidas (6 tipos + hora) | ✅ |
| Hidratación | ✅ |
| Ánimo (emoji picker) | ✅ |
| Sueño (acostarse/despertar) | ✅ |
| Hábitos básicos (checklist) | ✅ |
| Progreso del día (%) | ✅ |
| Rachas simples | ✅ |
| Modo claro | ✅ |
| Animaciones básicas (Motion) | ✅ |
| API REST completa | ✅ |
| MySQL (Hostinger) + Prisma | ✅ |

### 🟡 Fase 2 — Expansión (4–6 semanas)

| Feature | Incluido |
|---------|----------|
| Actividad física | ✅ |
| Diario / Journal | ✅ |
| Meditación con timer | ✅ |
| Peso y medidas | ✅ |
| Gamificación (XP, badges) | ✅ |
| Gráficos semanales/mensuales | ✅ |
| Modo oscuro | ✅ |
| Recordatorios in-app | ✅ |
| Presets de comidas / favoritos | ✅ |
| Year in Pixels (ánimo) | ✅ |
| Export CSV | ✅ |
| Correlaciones básicas | ✅ |
| Responsive mobile | ✅ |

### 🔵 Fase 3 — Premium (6+ semanas)

| Feature | Incluido |
|---------|----------|
| Medicamentos | ✅ |
| Fotos en comidas | ✅ |
| Push notifications web | ✅ |
| Resumen semanal por email | ✅ |
| IA: sugerencias personalizadas | ✅ |
| Integración Google Fit / Apple Health | ✅ |
| Macros detallados + barcode | ✅ |
| Plantillas de día | ✅ |
| Compartir logros (social) | ✅ |
| Multi-idioma (ES / EN / PT) | ✅ (desde inicio) |
| PWA (instalar como app) | ✅ |

> **Nota de alcance:** el producto es **100% gratis** (sin freemium ni paywalls). No hay “Premium” de pago: la Fase 3 son features avanzadas del producto gratuito.

---

## 15. Privacidad, seguridad y cumplimiento

| Aspecto | Medida |
|---------|--------|
| Datos de salud | Encriptados at-rest (MySQL Hostinger) y in-transit (HTTPS / SSL a MySQL) |
| Auth | JWT en httpOnly cookies, CSRF protection |
| Google OAuth | Solo scopes mínimos (email, profile) |
| Datos del usuario | Nunca vendidos ni compartidos |
| Exportación | El usuario puede exportar todos sus datos |
| Eliminación | "Borrar mi cuenta" elimina todo permanentemente |
| GDPR/LGPD | Consentimiento explícito, política de privacidad |
| Rate limiting | Protección contra abuso de API |

---

## 16. Métricas de éxito (KPIs)

| Métrica | Objetivo MVP | Objetivo 6 meses |
|---------|-------------|-------------------|
| Usuarios registrados | 50 (beta) | 5,000 |
| DAU/MAU ratio | 30% | 40% |
| Registros por usuario/día | 3+ | 5+ |
| Retención D7 | 40% | 55% |
| Retención D30 | 20% | 35% |
| Tiempo promedio en app | 2 min/día | 3 min/día |
| NPS | > 40 | > 50 |

---

## 17. Decisiones de producto (cerradas)

| # | Pregunta | Decisión |
|---|----------|----------|
| 1 | **Nombre** | **Correctly** (fijo) |
| 2 | **Idiomas** | **Español, Inglés y Portugués** desde el día 1 (vue-i18n) |
| 3 | **Monetización** | **Totalmente gratis** — sin freemium, sin suscripción, sin paywalls |
| 4 | **Alcance** | **Producto completo** — no un MVP reducido. Se construye por fases de entrega, pero el objetivo es todo lo especificado (Fases 1 + 2 + 3 como producto gratuito) |
| 5 | **Repositorio** | https://github.com/Devewice/correctly.git |
| 6 | **Base de datos** | **MySQL Hostinger** — DB `u301973293_correctly`, host `srv1855.hstgr.io` (IP `82.197.82.134`), usuario `u301973293_admin`, panel `jeisson.click` / phpMyAdmin |
| 7 | **Deploy** | Local primero (API apuntando a MySQL remoto); front/API según Hostinger o Vercel/Render |
| 8 | **Macros/calorías** | Incluidos (modo simple primero; barcode/macros avanzados después) |
| 9 | **Medicamentos** | Incluidos en el alcance completo (fase de entrega posterior) |
| 10 | **Usuarios** | Individual (sin multi-familiar en v1) |
| 11 | **Mobile** | Web responsive + PWA en el alcance completo |

### i18n — idiomas soportados

| Código | Idioma | Default |
|--------|--------|---------|
| `es` | Español | ✅ Default |
| `en` | English | |
| `pt` | Português | |

- Selector de idioma en onboarding y en ajustes
- Detección opcional por `Accept-Language` del navegador
- Todas las UI strings, emails y notificaciones traducidas

### Modelo gratuito

- Todas las features del producto son gratis para siempre
- Sin anuncios invasivos en la experiencia principal
- Sin “Premium” de pago (el nombre “Fase 3” solo indica orden de construcción)

---

## Resumen ejecutivo

**Correctly** será un sistema de bienestar diario completo, **gratis**, en **ES / EN / PT**, que combina:

- 🍳 **Nutrición** con registro por comida y hora
- 💧 **Hidratación** visual y gamificada
- 😴 **Sueño** con rutina nocturna
- 😊 **Ánimo** ultra-rápido estilo Daylio
- ✅ **Hábitos** con rachas sin culpa
- 🏃 **Actividad física**
- 🧘 **Mindfulness**
- 📝 **Diario**
- 📊 **Dashboard** unificado con timeline del día
- 🎮 **Gamificación suave** (XP, badges, rachas)
- 🎨 **UI cálida** con paleta sage green + sand + peach
- ✨ **Animaciones fluidas** con Motion/GSAP
- 🔐 **Login con Google**
- 🌍 **Multidioma** ES · EN · PT

Stack: **Express + Vue 3 + MySQL (Hostinger)**. Repo: [Devewice/correctly](https://github.com/Devewice/correctly.git).

### Credenciales MySQL (referencia — secretos solo en `.env`)

| Campo | Valor |
|-------|--------|
| Host | `srv1855.hstgr.io` (alt. IP `82.197.82.134`) |
| Base de datos | `u301973293_correctly` |
| Usuario | `u301973293_admin` |
| Panel / dominio | `jeisson.click` · phpMyAdmin |
| Cuota | 1 MB (ampliar si hace falta al crecer datos) |
| Contraseña | **Solo en `server/.env` — nunca en git ni en este MD** |

Connection string Prisma (ejemplo):

```env
DATABASE_URL="mysql://u301973293_admin:PASSWORD@srv1855.hstgr.io:3306/u301973293_correctly"
```

---

> **Siguiente paso:** Scaffold del monorepo (`server/` + `client/`), i18n y auth Google, y arrancar la entrega completa por fases.
