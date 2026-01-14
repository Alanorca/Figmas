# Proyecto: Asignacion de Roles y Usuarios

## Informacion General

- **Nombre del Proyecto:** Asignacion de Roles y Usuarios
- **Archivo Figma:** [Figma Design](https://www.figma.com/design/IwclNYlhuFaAyribbIGYtO/Asignaci%C3%B3n-de-Roles-y-Usuarios)
- **File Key:** `IwclNYlhuFaAyribbIGYtO`

## Pantallas Principales

### 1. Lista de Usuarios y Wizard de Creacion
- **Node ID:** `4001-28416`
- **URL:** https://www.figma.com/design/IwclNYlhuFaAyribbIGYtO/Asignaci%C3%B3n-de-Roles-y-Usuarios?node-id=4001-28416&m=dev
- **Descripcion:** Pantalla principal con tabla de usuarios y formulario wizard para crear nuevos usuarios

### 2. Detalle de Rol
- **Node ID:** `4001-12457`
- **URL:** https://www.figma.com/design/IwclNYlhuFaAyribbIGYtO/Asignaci%C3%B3n-de-Roles-y-Usuarios?node-id=4001-12457&m=dev
- **Descripcion:** Vista detallada de un rol con permisos y configuraciones

## Estructura de la Aplicacion

```
App
├── Header (navegacion superior)
│   ├── Breadcrumb
│   ├── Dark Mode Toggle (moon icon)
│   ├── Notifications (bell icon)
│   └── User Avatar
├── Sidebar (navegacion lateral colapsable)
│   ├── Dashboard
│   ├── Box (inventario)
│   ├── Share-alt (compartir)
│   ├── Users (usuarios)
│   ├── Book (documentacion)
│   ├── Orca-check (validaciones)
│   └── Power-off (cerrar sesion)
└── Content Area
    ├── Toolbar (acciones principales)
    ├── Data Table / Forms
    └── Pagination / Speed Dial
```

## Tecnologia Sugerida

- **Framework UI:** PrimeVue / PrimeReact / PrimeNG
- **Iconos:** PrimeIcons (FontAwesome compatible)
- **Temas:** Basado en el Design System de PrimeFaces
