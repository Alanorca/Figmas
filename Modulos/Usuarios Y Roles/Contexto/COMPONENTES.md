# Componentes del Proyecto

## Componentes de Layout

### Header
- Componente de navegacion superior
- Incluye: breadcrumb, iconos de accion (dark mode, notificaciones), avatar de usuario

### Sidebar
- Navegacion lateral colapsable
- Estados: `Open`, `Closed`
- Iconos de menu: dashboard_2, box, share-alt, users, book, orca-check, power-off

### Breadcrumb
- Navegacion de ruta
- Items: Icon (home), Label con separador chevron-right

## Componentes de Formulario

### InputText
- **Estados:** Default, Hover, Focus, Disabled, Invalid
- **Variantes:**
  - Con/sin Float Label
  - Filled/Empty
  - Sizes: Normal
- **Component ID:** `4001:4653`

### Select/Dropdown
- Seleccion de opciones de una lista
- Float Label disponible
- **Component ID:** `4001:22151`

### MultiSelect
- Seleccion multiple de opciones
- Modo: Basic
- **Component ID:** `4001:9640`

### Checkbox
- **Estados:** Checked, Unchecked, Disabled, Hover, Focus
- Con texto asociado
- **Component ID:** `4001:9352`

### ToggleButton
- **Estados:** Checked/Unchecked, Idle, Disabled
- Con texto visible
- **Component ID:** `4001:1740`

### SelectButton
- Grupo de botones para seleccion
- Opciones: 2 o 4 items
- **Component ID:** `4001:2274`

### InputNumber
- Entrada numerica con botones de incremento/decremento
- Tipo: Stacked (botones apilados)
- **Component ID:** `4001:10504`

## Componentes de Accion

### Button
- **Severities:** Primary, Secondary, Plain, Contrast, Danger
- **Estados:** Idle, Hover, Active, Disabled
- **Variantes:**
  - Con/sin icono
  - Icon Only
  - Raised
  - Rounded
  - Text
  - Outlined
  - Link
- **Component ID:** `4001:2631`

### Button Small
- Version compacta del boton
- Mismas variantes que Button
- **Component ID:** `4001:10524`

### SplitButton
- Boton con dropdown de acciones adicionales
- **Component ID:** `4001:6738`

### SpeedDial
- Boton flotante con acciones multiples
- Direccion: Up Left
- Tipo: Quarter-Circle
- **Component ID:** `4001:22220`

## Componentes de Datos

### DataTable
- **Header Cell:** Sortable, con iconos de ordenamiento
- **Body Cell:** Texto, Tag, Row Toggle Button
- Grid lines opcionales
- **Component IDs:**
  - Header: `4001:6796`
  - Body: `4001:22754`

### Paginator
- Navegacion de paginas
- Botones: First, Prev, Pages, Next, Last
- Current Page Report opcional
- **Component ID:** `4001:22187`

### Tag
- Indicador de categoria/estado
- **Severities:** Primary, Success, Warn, Danger, Info
- Rounded opcional
- **Component ID:** `4001:10398`

### Chip
- Representa entidades con icono/imagen y label
- Removible (times-circle)
- **Component ID:** `4001:7025`

### Avatar
- Representa usuarios
- **Tipos:** Image, Icon, Label
- **Sizes:** Small, Normal, Large, X-Large
- Circle opcional
- **Component ID:** `4001:9951`

### AvatarGroup
- Grupo de avatares apilados
- **Component ID:** `4001:10363`

### Badge
- Indicador de estado pequeno
- **Component ID:** `4001:9673`

### OverlayBadge
- Badge superpuesto sobre otro elemento
- **Component ID:** `4001:9824`

## Componentes de Navegacion

### Stepper
- Wizard de pasos
- Orientacion: Horizontal
- Estados de paso: Active, Inactive
- **Component IDs:**
  - Step: `4001:25325`, `4001:25335`
  - Panel: `4001:25366`

### Tree (Arbol de Activos)
- Vista jerarquica de datos
- Con iconos: folder, file, cog
- Checkbox para seleccion
- Toggle para expandir/colapsar

## Componentes de Feedback

### Tooltip
- Informacion emergente
- Posiciones: Top, Bottom, Left, Right
- **Component ID:** `4001:22361`

### ProgressBar
- Indicador de progreso
- Tipo: Determinate, Indeterminate
- **Component ID:** `4001:25414`

## Componentes de Estructura

### Divider
- Separador de contenido
- Tipo: Solid
- Direccion: Horizontal, Vertical
- **Component ID:** `4001:10079`

### Toolbar
- Barra de herramientas con acciones
- **Component ID:** `4001:6763`

## Iconos Utilizados (PrimeIcons)

```
pi-home, pi-chevron-right, pi-chevron-down, pi-chevron-left
pi-plus, pi-times, pi-check, pi-search
pi-print, pi-upload, pi-download
pi-user, pi-users, pi-user-plus
pi-pencil, pi-cog, pi-wrench
pi-folder, pi-file, pi-file-excel, pi-file-arrow-up
pi-bell, pi-moon, pi-power-off
pi-ellipsis-v, pi-sort-alt
pi-angle-up, pi-angle-down, pi-angle-left, pi-angle-right
pi-angle-double-left, pi-angle-double-right
pi-arrow-right, pi-arrow-left, pi-arrow-right-arrow-left
pi-shield, pi-id-card, pi-building
pi-book, pi-box, pi-share-alt
pi-chart-line, pi-comments, pi-plus-circle
pi-times-circle, pi-clone
```
