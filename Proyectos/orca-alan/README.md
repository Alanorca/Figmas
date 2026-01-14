# ORCA-Alan

Sistema GRC (Governance, Risk & Compliance) desarrollado con Angular 20 y PrimeNG.

## Requisitos

- Node.js 18+
- npm 9+

## Instalacion

### 1. Clonar el repositorio

```bash
git clone https://github.com/Alanorca/Figmas.git
cd Figmas/Proyectos/orca-alan
```

### 2. Instalar dependencias del frontend

```bash
npm install
```

### 3. Instalar dependencias del backend

```bash
cd backend
npm install
```

### 4. Configurar variables de entorno del backend

```bash
cp .env.example .env
```

Edita el archivo `.env` si necesitas cambiar la configuracion:
- `DATABASE_URL`: Ruta de la base de datos SQLite
- `PORT`: Puerto del servidor (default: 3000)
- `JWT_SECRET`: Clave secreta para tokens JWT (cambiar en produccion)

### 5. Inicializar la base de datos

```bash
npm run db:migrate
npm run db:seed
```

## Arrancar el proyecto

### Backend (Terminal 1)

```bash
cd backend
npm run dev
```

El backend estara disponible en http://localhost:3000

### Frontend (Terminal 2)

```bash
npm start
```

El frontend estara disponible en http://localhost:4200

## Scripts disponibles

### Frontend
- `npm start` - Servidor de desarrollo
- `npm run build` - Build de produccion
- `npm test` - Ejecutar tests

### Backend
- `npm run dev` - Servidor con hot reload (nodemon)
- `npm start` - Servidor de produccion
- `npm run db:migrate` - Ejecutar migraciones
- `npm run db:seed` - Poblar base de datos con datos de prueba
- `npm run db:reset` - Resetear base de datos
- `npm run db:studio` - Abrir Prisma Studio (UI para la BD)

## Tecnologias

### Frontend
- Angular 20
- PrimeNG 20
- PrimeFlex
- Chart.js / ApexCharts

### Backend
- Express.js
- Prisma ORM
- SQLite
- JWT para autenticacion

## Deploy

### Frontend (Vercel)
El frontend se puede desplegar en Vercel conectando el repositorio. Vercel detectara automaticamente la configuracion de Angular.

### Backend
El backend requiere un servidor Node.js. Opciones recomendadas:
- Railway
- Render
- Fly.io
- DigitalOcean App Platform
