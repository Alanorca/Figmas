# Pantallas del Modulo

## Pantalla 1: Lista de Usuarios (node-id=4001-28416)

### Estructura General
```
┌─────────────────────────────────────────────────────────────┐
│ Header                                                       │
│ [Breadcrumb: Home > Usuarios]  [Moon] [Bell] [Avatar]       │
├────────┬────────────────────────────────────────────────────┤
│        │ Toolbar                                             │
│        │ [Search] [+ Nuevo] [Print] [Upload]                │
│ Side   ├────────────────────────────────────────────────────┤
│ bar    │ DataTable                                           │
│        │ ┌──────┬────────┬───────┬────────┬────────┬──────┐ │
│        │ │ [ ]  │ Nombre │ Email │ Rol    │ Estado │ ...  │ │
│        │ ├──────┼────────┼───────┼────────┼────────┼──────┤ │
│        │ │ [ ]  │ User 1 │ @mail │ Admin  │ Active │ Edit │ │
│        │ │ [x]  │ User 2 │ @mail │ User   │ Warn   │ Edit │ │
│        │ └──────┴────────┴───────┴────────┴────────┴──────┘ │
│        ├────────────────────────────────────────────────────┤
│        │ Paginator                                           │
│        │ [<<] [<] [1] [2] [3] [>] [>>]  [10 v] por pagina   │
└────────┴────────────────────────────────────────────────────┘
```

### Wizard de Creacion de Usuario (Stepper)

**Paso 1: Informacion Basica**
- Nombre (InputText con Float Label)
- Email (InputText con Float Label)
- Telefono (InputText)

**Paso 2: Estado de la Cuenta**
- Estado (SelectButton: Activo/Inactivo)
- Fecha de expiracion (Calendar/DatePicker)

**Paso 3: Acceso de Activos**
- Arbol de activos (Tree con checkboxes)
  - Carpetas expandibles
  - Archivos seleccionables
  - Configuraciones (cog icon)

**Paso 4: Configuracion de Seguridad**
- Permisos (Checkboxes multiples)
- Roles asignados (MultiSelect)

**Acciones del Wizard:**
- Botones de navegacion: Anterior, Siguiente
- Boton de completar: Guardar

### Componentes Especificos
- File Upload con estados: Idle, Ready, Upload
- Progress Bar para carga de archivos
- Avatar con imagen de perfil

---

## Pantalla 2: Detalle de Rol (node-id=4001-12457)

### Estructura General
```
┌─────────────────────────────────────────────────────────────┐
│ Header                                                       │
│ [Breadcrumb: Home > Roles > Customer Client]                │
├────────┬────────────────────────────────────────────────────┤
│        │ Cover/Banner                                        │
│        │ ┌────────────────────────────────────────────────┐ │
│        │ │ ID: 01                                         │ │
│ Side   │ │ Title: Customer Client                         │ │
│ bar    │ │ Descripcion: Con tarea de remediacion...       │ │
│        │ │ Region: MX | Arbol de Activos                  │ │
│        │ └────────────────────────────────────────────────┘ │
│        ├────────────────────────────────────────────────────┤
│        │ [Tab: Roles y permisos]                            │
│        ├────────────────────────────────────────────────────┤
│        │ Content Area                                        │
│        │ - Configuracion de permisos                        │
│        │ - Lista de usuarios con este rol                   │
│        │ - Arbol de permisos                                │
│        ├────────────────────────────────────────────────────┤
│        │ Actions                                             │
│        │ [Editar] [Duplicar] [Eliminar]                     │
└────────┴────────────────────────────────────────────────────┘
```

### Secciones del Detalle

**1. Banner/Cover**
- Imagen de fondo (SVG/Pattern)
- ID del rol
- Titulo del rol
- Descripcion
- Metadata: Region, Tipo de arbol

**2. Tabs de Navegacion**
- SelectButton con opciones: "Roles y permisos", etc.

**3. Informacion del Rol**
- Nombre (InputText disabled o editable)
- Descripcion (Textarea)
- Nivel de acceso (Tag con severidad)

**4. Permisos Asignados**
- Tree de permisos con checkboxes
- Lineas conectoras verticales/horizontales
- Tooltips con descripcion de permisos

**5. Usuarios con este Rol**
- Lista de avatares (AvatarGroup)
- Boton para agregar usuarios (user-plus)
- Badge con contador

### Componentes Especificos
- Sidebar expandido con icono de shield (seguridad)
- Tooltip Plus con direccion
- Lineas de conexion (Settings Vertical/Horizontal Line)
- Boton de contraste para acciones principales

---

## Estados de Componentes por Pantalla

### Tags de Estado (Usuario)
| Estado | Severity | Color |
|--------|----------|-------|
| Activo | Success | Verde |
| Pendiente | Warn | Amarillo |
| Inactivo | Danger | Rojo |
| Info | Info | Azul |
| Default | Primary | Azul primario |

### Estados de Checkbox
| Estado | Visual |
|--------|--------|
| Unchecked | Borde vacio |
| Checked | Check con fondo |
| Disabled | Gris, no interactivo |
| Indeterminate | Linea horizontal |

### Estados de Boton
| Estado | Visual |
|--------|--------|
| Idle | Color base |
| Hover | Color mas oscuro |
| Active/Pressed | Color mas oscuro + sombra interna |
| Disabled | Gris, opacidad reducida |
