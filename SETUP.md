# Guía de Configuración del Proyecto ORCA

## Requisitos Previos

- Node.js v18 o superior
- npm v9 o superior
- Git

## Instalación Inicial

### 1. Clonar el repositorio

```bash
git clone https://github.com/Alanorca/Figmas.git
cd Figmas/Proyectos/orca-alan
```

### 2. Cambiar a la rama de trabajo

```bash
git checkout notificaciones
```

### 3. Instalar dependencias

```bash
npm install
```

> ⚠️ **IMPORTANTE**: Este paso es obligatorio cada vez que se clona el repositorio o se cambia de rama. La carpeta `node_modules/` no se incluye en el repositorio.

### 4. Ejecutar el proyecto

```bash
npm start
```

El proyecto estará disponible en `http://localhost:4200`

---

## Solución de Problemas Comunes

### Error: Property 'rows/cols/x/y' does not exist on type 'DashboardWidget'

**Causa**: Falta la dependencia `angular-gridster2`

**Solución**:
```bash
npm install
```

### Error: Cannot find module 'html2canvas' or 'jspdf'

**Causa**: Faltan las dependencias de exportación

**Solución**:
```bash
npm install
```

### Los errores persisten después de npm install

**Solución**: Limpiar e instalar desde cero
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Dependencias Principales

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `@angular/core` | ^20.3.0 | Framework principal |
| `primeng` | ^20.3.0 | Componentes UI |
| `angular-gridster2` | ^20.2.4 | Dashboard con grid drag & drop |
| `html2canvas` | ^1.4.1 | Captura de pantalla |
| `jspdf` | ^3.0.4 | Exportar a PDF |
| `ngx-vflow` | ^1.16.4 | Editor de flujos/procesos |
| `apexcharts` | ^5.3.6 | Gráficas interactivas |

---

## Estructura del Proyecto

```
Figmas/
├── Proyectos/
│   └── orca-alan/          # Proyecto Angular principal
│       ├── src/
│       │   ├── app/
│       │   │   ├── components/   # Componentes reutilizables
│       │   │   ├── pages/        # Páginas/vistas
│       │   │   ├── services/     # Servicios
│       │   │   └── models/       # Interfaces y tipos
│       │   └── styles.scss       # Estilos globales
│       ├── backend/              # API Backend (Node.js + Prisma)
│       └── package.json          # Dependencias del proyecto
├── Modulos/                # Documentación por módulo
├── Recursos/               # Assets y recursos
└── SETUP.md               # Este archivo
```

---

## Comandos Útiles

```bash
# Desarrollo
npm start                 # Iniciar servidor de desarrollo
npm run build             # Compilar para producción

# Backend
cd backend
npm install
npm run dev               # Iniciar servidor backend

# Git
git pull origin notificaciones    # Obtener últimos cambios
git status                        # Ver estado de cambios
```

---

## Contacto

Si tienes problemas con la configuración, contacta al equipo de desarrollo.
