# AVALON — Intelligent Financial Operating System

[![Next.js](https://img.shields.io/badge/Next.js-16_App_Router-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict_Mode-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/Neon-Serverless_Postgres-00E599?style=flat-square&logo=postgresql)](https://neon.tech/)
[![Auth.js](https://img.shields.io/badge/Auth.js-NextAuth_v5-purple?style=flat-square&logo=auth0)](https://authjs.dev/)

**AVALON** es una plataforma SaaS integral para la gestión financiera, tesorería corporativa y control operativo de profesionales y empresas de servicios. Diseñada bajo un estándar de ingeniería fintech, combina análisis predictivo de liquidez, conciliación de tarjetas con soporte para pagos parciales, agenda interactiva con tracking de clientes y una arquitectura multi-tenant con aislamiento de datos a nivel de base de datos.

---

## 🏛️ Decisiones de Arquitectura e Ingeniería

- **Full-Stack Next.js (App Router):** Rendimiento optimizado mediante React Server Components (RSC) para streaming de datos, Suspense boundaries para skeleton loaders y Server Actions protegidas contra CSRF para mutaciones atómicas.
- **Aislamiento Multi-Tenant Estricto (Data Isolation):** Todas las consultas e inserciones operan bajo un esquema de pertenencia directa `user_id` con índices compuestos (`idx_*_user_id`), asegurando que ningún usuario comparta datos ni contexto financiero.
- **Prevención de Vulnerabilidades IDOR:** Cada actualización (`UPDATE`) o eliminación (`DELETE`) valida criptográficamente la sesión activa y la titularidad del registro (`AND user_id = $userId`) antes de ejecutar la transacción.
- **Transaccionalidad Financiera (`ACID`):** Liquidación de resúmenes de tarjetas mediante bloqueos de fila (`FOR UPDATE`) y bloques transaccionales (`BEGIN ... COMMIT / ROLLBACK`), garantizando consistencia absoluta entre saldos bancarios y el libro contable de salidas.
- **Internationalization (i18n):** Enrutamiento localizado con `next-intl` (soporte completo ES / EN) y formato localizado de monedas y fechas.

---

## ⚡ Módulos del Sistema

### 1. Torre de Control Ejecutiva (`/dashboard`)
- **KPIs en Tiempo Real:** Liquidez disponible consolidada, ingresos facturados, piso de gastos fijos y runway proyectado en meses.
- **Cash Flow Analytics:** Visualización histórica de balance neto (entradas vs. salidas).
- **Foco Operativo:** Widget diario conectado a compromisos y cobranzas urgentes.

### 2. Conciliación y Tarjetas de Crédito (`/dashboard/finances/cards`)
- Representación realista con renderizado de chip EMV y detección dinámica de emisor (BIN).
- Soporte para **pagos parciales y acumulativos** sobre resúmenes consolidados, previniendo duplicación de pasivos al trasladar saldos al siguiente período.
- Conciliación directa con cuentas bancarias activas.

### 3. Facturación y Cartera de Clientes (`/dashboard/finances/invoices` & `/clients`)
- Directorio de clientes con métricas de salud comercial (volumen histórico, deuda en mora y saldos a percibir).
- Emisión, anulación y liquidación de cobros con asignación automática a cuentas de tesorería.

### 4. Control de Egresos y Costos Fijos (`/dashboard/finances/expenses`)
- Canvas unificado con filtrado dinámico por estado (`paid` / `pending`), categorías y proveedores.
- Detección de gastos recurrentes y monitoreo de estructura mensual.

### 5. Agenda & Bitácora Operativa (`/dashboard/agenda`)
- Vista de dos columnas: calendario interactivo mensual acoplado a un panel de tareas y notas.
- Vinculación directa con clientes de la cartera y niveles de prioridad (`Urgent`, `High`, `Medium`, `Low`).

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **Framework** | Next.js (App Router, Server Actions, RSC) |
| **Lenguaje** | TypeScript (Strict Mode) |
| **Base de Datos** | Neon Serverless PostgreSQL |
| **Seguridad & Auth** | Auth.js (NextAuth v5), Google OAuth, JWT Sessions, BCrypt |
| **Estilos & UI** | Tailwind CSS v4, Shadcn UI, Lucide Icons, Date-fns |
| **Infraestructura** | Vercel Serverless Edge Network |

---

## 🚀 Instalación y Puesta en Marcha

### Prerrequisitos
- Node.js 18.17 o superior
- Instancia activa de PostgreSQL (Neon recomendado)
- Credenciales de Google Cloud Console (OAuth 2.0)

### 1. Clonar el repositorio
```bash
git clone [https://github.com/tu-usuario/avalon.git](https://github.com/tu-usuario/avalon.git)
cd avalon