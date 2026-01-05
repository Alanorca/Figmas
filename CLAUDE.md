# CLAUDE.md - Instrucciones para Claude Code

## Estructura del Proyecto

Este repositorio contiene el proyecto ORCA con la siguiente estructura:
- `Proyectos/orca-alan/` - Aplicación Angular + Backend Node.js
  - Frontend: Angular 20 con PrimeNG
  - Backend: Express + Prisma + SQLite

## Comandos Frecuentes

### "sube a vercel" o "deploy a vercel"
Para hacer deploy automático a Vercel:
1. Verificar cambios con `git status`
2. Si hay cambios, hacer commit con mensaje descriptivo
3. Push a la rama `main`: `git push origin main`
4. Vercel detecta automáticamente el push y hace deploy

### Arrancar el proyecto
- Backend: `cd Proyectos/orca-alan/backend && npm run dev` (puerto 3000)
- Frontend: `cd Proyectos/orca-alan && npm start` (puerto 4200)

### Base de datos
- Reset: `cd Proyectos/orca-alan/backend && npm run db:reset`
- Migraciones: `npm run db:migrate`
- Seed: `npm run db:seed`
- Studio: `npm run db:studio`

## Archivos a Ignorar en Commits
- `prisma/dev.db` - Base de datos de desarrollo local
- `node_modules/.prisma/` - Cliente Prisma generado

## URLs de Producción
- Vercel despliega automáticamente desde la rama `main`
