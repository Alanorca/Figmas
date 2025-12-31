# ORCA Design System

Guía de estilos y patrones de diseño para mantener la consistencia visual del proyecto.

## Estructura de Archivos

```
src/
├── styles/
│   ├── _design-tokens.scss    # Variables de diseño (colores, tipografía, espaciado)
│   ├── _mixins.scss           # Mixins SCSS reutilizables (con dark mode automático)
│   └── _dark-mode.scss        # Mixins específicos para dark mode
├── app/
│   ├── core/
│   │   └── constants/
│   │       └── design-system.constants.ts  # Constantes TypeScript
│   └── shared/
│       └── components/
│           └── empty-state/   # Componente EmptyState
```

---

## Colores

### Paleta Principal

Usar siempre las variables CSS de PrimeNG:

```scss
// Primarios
var(--primary-color)       // Color principal de la marca
var(--primary-50)          // Variación clara (fondos de selección)
var(--primary-100)         // Variación más clara

// Superficies
var(--surface-0)           // Fondo oscuro (sidebar)
var(--surface-ground)      // Fondo principal de la app
var(--surface-card)        // Fondo de cards
var(--surface-border)      // Color de bordes
var(--surface-500)         // Texto secundario
var(--surface-900)         // Texto principal
```

### Colores Semánticos

```scss
var(--green-500)   // Success
var(--orange-500)  // Warning
var(--red-500)     // Danger/Error
var(--blue-500)    // Info
```

### Colores para Gráficos

Importar desde `design-system.constants.ts`:

```typescript
import { CHART_COLORS, CHART_PALETTE } from '@core/constants/design-system.constants';

// Uso individual
backgroundColor: CHART_COLORS.blue  // '#42A5F5'

// Uso en serie
colors: CHART_PALETTE  // Array de 10 colores ordenados
```

---

## Tipografía

### Font Family

```scss
$font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
$font-family-mono: 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace;
```

### Tamaños

| Token | Tamaño | Uso |
|-------|--------|-----|
| `$font-size-xs` | 12px | Etiquetas pequeñas, hints |
| `$font-size-sm` | 12.8px | Labels, texto secundario |
| `$font-size-base` | 14px | Texto body principal |
| `$font-size-md` | 16px | Texto destacado |
| `$font-size-lg` | 18px | Subtítulos |
| `$font-size-xl` | 20px | Títulos de sección |
| `$font-size-2xl` | 24px | Valores KPI |
| `$font-size-3xl` | 28px | Títulos de página |

### Pesos

```scss
$font-weight-normal: 400;    // Texto regular
$font-weight-medium: 500;    // Labels
$font-weight-semibold: 600;  // Títulos
$font-weight-bold: 700;      // Énfasis fuerte
```

---

## Espaciado

Sistema basado en múltiplos de 4px:

| Token | Valor | Uso |
|-------|-------|-----|
| `$spacing-1` | 4px | Gaps mínimos |
| `$spacing-2` | 8px | Entre elementos cercanos |
| `$spacing-3` | 12px | Padding interno |
| `$spacing-4` | 16px | Gap estándar |
| `$spacing-6` | 24px | Padding de contenedores |
| `$spacing-8` | 32px | Separación de secciones |

### Valores Específicos

```scss
$page-padding: 24px;     // Padding de página
$card-padding: 16px;     // Padding interno de cards
$dialog-padding: 24px;   // Padding de dialogs
$form-gap: 16px;         // Gap entre campos de formulario
```

---

## Dimensiones de Componentes

### Dialogs

| Tamaño | Ancho | Uso |
|--------|-------|-----|
| Small | 400px | Confirmaciones, formularios simples |
| Medium | 500px | Formularios de creación **[ESTÁNDAR]** |
| Large | 650px | Formularios complejos |
| XL | 800px | Vistas de detalle |

```typescript
import { DIALOG_WIDTHS } from '@core/constants/design-system.constants';

// En template
[style]="{ width: '500px' }"  // o usar DIALOG_WIDTHS.md
```

### Drawers

| Tamaño | Ancho | Uso |
|--------|-------|-----|
| Small | 350px | Acciones rápidas |
| Medium | 400px | Acciones masivas **[ESTÁNDAR]** |
| Large | 450px | Detalles **[ESTÁNDAR]** |
| XL | 550px | Vistas complejas |

---

## Componentes PrimeNG

### Tablas (p-table)

```html
<p-table
  [value]="data()"
  [paginator]="true"
  [rows]="10"
  [rowsPerPageOptions]="[5, 10, 25, 50]"
  [showCurrentPageReport]="true"
  currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords}"
  [globalFilterFields]="['nombre', 'descripcion']"
  styleClass="p-datatable-sm p-datatable-striped"
>
```

**Clases estándar:** `p-datatable-sm p-datatable-striped`

### Tags de Severidad

```typescript
import { CRITICALITY_SEVERITY, getSeverityFromValue } from '@core/constants/design-system.constants';

// En componente
getSeverity(criticidad: string): string {
  return CRITICALITY_SEVERITY[criticidad] ?? 'secondary';
}
```

```html
<p-tag [value]="item.criticidad" [severity]="getSeverity(item.criticidad)" />
```

### Botones

| Variante | Uso |
|----------|-----|
| `severity="primary"` | Acción principal (Guardar, Crear) |
| `severity="secondary"` | Acción secundaria (Cancelar) |
| `severity="danger"` | Acciones destructivas (Eliminar) |
| `[text]="true"` | Botones en toolbars |
| `[outlined]="true"` | Acciones alternativas |

---

## Patrones de Diseño

### Estructura de Página con Tabla

```html
<div class="page-container">
  <!-- Header -->
  <div class="page-header">
    <h1>Título de Página</h1>
    <p class="page-subtitle">Descripción breve</p>
  </div>

  <!-- Toolbar -->
  <p-toolbar>
    <ng-template pTemplate="start">
      <div class="flex align-items-center gap-3">
        <!-- Acciones masivas (extremo izquierdo, condicional) -->
        @if (seleccionados().length > 0) {
          <p-button label="Acciones masivas" icon="pi pi-check-square"
                    [badge]="seleccionados().length.toString()" severity="success" [outlined]="true" />
        }
        <p-iconfield>
          <p-inputicon styleClass="pi pi-search" />
          <input pInputText placeholder="Buscar..." style="width: 280px" />
        </p-iconfield>
      </div>
    </ng-template>
    <ng-template pTemplate="end">
      <p-button label="Nuevo" icon="pi pi-plus" />
    </ng-template>
  </p-toolbar>

  <!-- Tabla -->
  <p-card>
    <p-table>...</p-table>
  </p-card>
</div>
```

**Distribución del Toolbar:**
| Posición | Elementos |
|----------|-----------|
| Extremo izquierdo | Botón de acciones masivas (condicional, aparece al seleccionar) |
| Izquierda (`pTemplate="start"`) | Buscador, filtros |
| Derecha (`pTemplate="end"`) | Botón de acción principal (Nuevo, Crear, etc.) |

**SCSS:**
```scss
@use 'styles/mixins' as *;

:host {
  @include table-page;
  @include table-editable;
}
```

### Empty States

Usar el componente `EmptyStateComponent`:

```html
<app-empty-state
  icon="pi pi-inbox"
  title="No hay registros"
  message="Comienza creando tu primer registro"
  actionLabel="Crear nuevo"
  [actionClick]="onCreate.bind(this)"
/>
```

**Variantes:**
- `variant="default"` - Estándar con padding completo
- `variant="compact"` - Para dentro de tablas
- `variant="card"` - Con fondo y borde

### Edición In-Place en Tablas

```html
<ng-template #body let-item let-editing="editing" let-ri="rowIndex">
  @if (editing) {
    <input pInputText [(ngModel)]="item.nombre" />
  } @else {
    {{ item.nombre }}
  }
</ng-template>
```

**Estilos para fila en edición:**
```scss
tr.editing-row {
  background: var(--primary-50);

  td {
    padding: 0.5rem;
  }
}
```

### Barras de Progreso en Tablas

Usar el patrón nativo de HTML/CSS en lugar del componente `p-progressBar` para mantener consistencia y mejor rendimiento:

```html
<td>
  <div class="flex align-items-center gap-2">
    <div class="w-5rem bg-gray-200 border-round" style="height: 4px;">
      <div class="bg-primary border-round" [style.width.%]="valor" style="height: 100%;"></div>
    </div>
    <span class="text-sm">{{ valor }}%</span>
  </div>
</td>
```

**Especificaciones:**
- **Ancho barra:** `w-5rem` (5rem)
- **Alto barra:** `4px`
- **Fondo:** `bg-gray-200`
- **Progreso:** `bg-primary`
- **Bordes:** `border-round`
- **Texto:** `text-sm` sin negrita

**Ejemplo con valores numéricos (1-5):**
```html
<!-- Para probabilidad/impacto (valor 1-5, multiplicar por 20 para %) -->
<div class="w-5rem bg-gray-200 border-round" style="height: 4px;">
  <div class="bg-primary border-round" [style.width.%]="item.probabilidad * 20" style="height: 100%;"></div>
</div>
<span class="text-sm">{{ item.probabilidad }}/5</span>
```

---

## Mapeo de Severidades

### Criticidad → Severidad

| Valor | Severidad | Color |
|-------|-----------|-------|
| `critica` | danger | Rojo |
| `alta` | danger | Rojo |
| `media` | warn | Naranja |
| `baja` | success | Verde |

### Estados de Proceso

| Valor | Severidad | Color |
|-------|-----------|-------|
| `activo` | success | Verde |
| `borrador` | secondary | Gris |
| `inactivo` | warn | Naranja |
| `archivado` | danger | Rojo |

### Nivel de Riesgo (calculado)

```typescript
import { getRiskLevelSeverity } from '@core/constants/design-system.constants';

// score = probabilidad × impacto
const severity = getRiskLevelSeverity(score);
// >= 15 → 'danger' (Crítico)
// >= 10 → 'warn' (Alto)
// >= 5  → 'info' (Medio)
// < 5   → 'success' (Bajo)
```

---

## Iconos Estandarizados

### Por Entidad

```typescript
import { ENTITY_ICONS } from '@core/constants/design-system.constants';

ENTITY_ICONS.activo       // 'pi pi-box'
ENTITY_ICONS.riesgo       // 'pi pi-exclamation-triangle'
ENTITY_ICONS.incidente    // 'pi pi-bolt'
ENTITY_ICONS.proceso      // 'pi pi-sitemap'
```

### Por Acción

```typescript
import { ACTION_ICONS } from '@core/constants/design-system.constants';

ACTION_ICONS.add      // 'pi pi-plus'
ACTION_ICONS.edit     // 'pi pi-pencil'
ACTION_ICONS.delete   // 'pi pi-trash'
ACTION_ICONS.search   // 'pi pi-search'
ACTION_ICONS.menu     // 'pi pi-ellipsis-v'
```

---

## Uso de Mixins SCSS

### Importación

```scss
@use 'styles/mixins' as *;
@use 'styles/design-tokens' as *;
```

### Mixins Disponibles

```scss
// Layout de página
@include page-container;
@include page-toolbar;
@include table-page;

// Tablas
@include table-editable;
@include table-footer;

// Cards
@include card-with-accent($color);
@include kpi-card;

// Selección (con dark mode automático)
@include selectable-card;       // Cards clickeables
@include selectable-chip;       // Chips/tags clickeables
@include selectable-list-item;  // Items de lista/menú
@include option-card;           // Cards de wizard

// Dialogs y Drawers
@include form-dialog;
@include side-drawer;

// Formularios
@include form-grid;
@include form-field;

// Estados
@include empty-state;
@include loading-overlay;

// Utilidades
@include text-truncate;
@include text-mono;
@include custom-scrollbar;
@include hover-lift;
@include focus-ring;

// Responsive
@include mobile { ... }
@include tablet { ... }
@include desktop { ... }
```

---

## Dark Mode

### Arquitectura

El sistema de dark mode se basa en:

1. **Clase `.dark`** en el elemento `<html>` que activa el tema oscuro
2. **Variables CSS de PrimeNG** que cambian automáticamente (ej: `--surface-card`, `--text-color`)
3. **Mixins SCSS personalizados** para componentes que necesitan overrides específicos

### Archivos del Sistema

```
src/styles/
├── _dark-mode.scss     # Mixins y utilidades de dark mode
└── _mixins.scss        # Mixins con soporte dark mode automático
```

### Importación

```scss
// Opción 1: Usar mixins que ya incluyen dark mode automático
@use 'styles/mixins' as *;

// Opción 2: Para dark mode manual/específico
@use 'styles/dark-mode' as dark;
```

### Patrón Principal: `:host-context(.dark)`

**IMPORTANTE:** Siempre usar `:host-context(.dark)` para estilos de dark mode en componentes Angular:

```scss
// ✅ CORRECTO
:host-context(.dark) {
  .my-card {
    background: var(--surface-800);
  }
}

// ❌ INCORRECTO - No funciona en componentes
.dark .my-card {
  background: var(--surface-800);
}

// ❌ INCORRECTO - Selector obsoleto
:host-context(html.dark-mode) { ... }
```

### Tokens de Color para Dark Mode

| Contexto | Light Mode | Dark Mode |
|----------|------------|-----------|
| **Fondo página** | `--surface-ground` | `--surface-950` |
| **Fondo card** | `--surface-card` | `--surface-900` |
| **Fondo elevado** | `--surface-100` | `--surface-800` |
| **Fondo hover** | `--surface-hover` | `--surface-700` |
| **Borde estándar** | `--surface-border` | `--surface-700` |
| **Texto principal** | `--text-color` | `--surface-0` |
| **Texto secundario** | `--text-color-secondary` | `--surface-400` |

### Mixins con Dark Mode Automático

Los siguientes mixins ya incluyen soporte de dark mode (no necesitas agregar estilos adicionales):

```scss
// Layout
@include page-container;   // Fondo, headers
@include table-editable;   // Tablas completas

// Cards
@include kpi-card;         // Cards de métricas
@include selectable-card;  // Cards clickeables
@include option-card;      // Cards de wizard

// Dialogs/Drawers
@include form-dialog;
@include side-drawer;

// Estados
@include empty-state;
@include loading-overlay;

// Formularios
@include form-grid;
@include form-field;
```

### Mixins para Dark Mode Manual

Para casos específicos, usar los mixins de `_dark-mode.scss`:

```scss
@use 'styles/dark-mode' as dark;

.mi-componente {
  // Estilos light...

  @include dark.dark-mode {
    // Estilos dark...
  }
}
```

**Mixins disponibles:**

```scss
// Wrapper principal
@include dark.dark-mode { ... }

// Cards
@include dark.card-dark;
@include dark.card-elevated-dark;
@include dark.card-selectable-dark;

// Tablas
@include dark.table-dark;

// Estados
@include dark.empty-state-dark;
@include dark.loading-overlay-dark;

// Formularios
@include dark.form-elements-dark;

// Listas
@include dark.list-item-dark;

// Cajas de información
@include dark.info-box-dark;
@include dark.warning-box-dark;
@include dark.success-box-dark;
@include dark.error-box-dark;

// Grid de permisos
@include dark.grid-dark;

// Scrollbar
@include dark.scrollbar-dark;
```

### Cards Seleccionables

El patrón más problemático. Usar el mixin `selectable-card`:

```scss
.rol-card {
  @include selectable-card;
}
```

Esto maneja automáticamente:
- Fondo light/dark
- Bordes
- Estados hover
- Estados seleccionado/activo
- Estado disabled

### Colores de Selección en Dark Mode

Para fondos de elementos seleccionados en dark mode, usar `color-mix()`:

```scss
// ✅ CORRECTO - Mezcla color primario con fondo oscuro
&.selected {
  background: color-mix(in srgb, var(--primary-color) 20%, var(--surface-900));
}

// ❌ INCORRECTO - primary-50 no existe en dark mode
&.selected {
  background: var(--primary-50);
}
```

### Colores Problemáticos a Evitar

Estos colores funcionan en light mode pero fallan en dark mode:

| Evitar | Reemplazar con |
|--------|----------------|
| `var(--primary-50)` | `color-mix(in srgb, var(--primary-color) 20%, var(--surface-900))` |
| `var(--surface-50)` | `var(--surface-800)` en dark |
| `var(--surface-100)` | `var(--surface-700)` en dark |
| `$surface-50` | Usar variables CSS con override |
| Colores hardcoded | Variables CSS semánticas |

### Ejemplo Completo

```scss
@use 'styles/mixins' as *;
@use 'styles/dark-mode' as dark;

:host {
  // Opción A: Usar mixin con dark mode incluido
  @include page-container;
  @include table-editable;
}

// Estilos específicos del componente
.mi-card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);

  .card-title {
    color: var(--text-color);
  }

  .card-subtitle {
    color: var(--text-color-secondary);
  }

  &.seleccionado {
    background: var(--primary-50);
    border-color: var(--primary-color);
  }
}

// Dark mode overrides
:host-context(.dark) {
  .mi-card {
    background: var(--surface-900);
    border-color: var(--surface-700);

    &.seleccionado {
      background: color-mix(in srgb, var(--primary-color) 20%, var(--surface-900));
    }
  }
}
```

---

## Estados de Selección - WCAG 2.1 AA Compliant

### Problema

Los estados de selección (`.selected`, `.active`) son problemáticos porque:
1. Suelen usar `primary-50` que no se ve bien en dark mode
2. El texto sobre fondos con tinte de color primario puede no cumplir con WCAG 2.1 AA (ratio de contraste mínimo 4.5:1)

### Solución Aprobada

El patrón correcto usa:
- **Light mode:** `color-mix(primary 10%, surface-card)` con texto normal
- **Dark mode:** `color-mix(primary 15%, surface-900)` con **texto blanco** para garantizar contraste

### Mixins Recomendados

| Mixin | Uso | Dark Mode | WCAG AA |
|-------|-----|-----------|---------|
| `selectable-card` | Cards clickeables que se pueden seleccionar | ✅ | ✅ |
| `selectable-chip` | Tags, filtros, badges clickeables | ✅ | ✅ |
| `selectable-list-item` | Items de lista, menús de navegación | ✅ | ✅ |
| `option-card` | Cards en wizards con icono + título + descripción | ✅ | ✅ |

### Uso Básico

```scss
@use 'styles/mixins' as *;

// Card seleccionable
.rol-card {
  @include selectable-card;

  // Estilos adicionales específicos...
  .rol-nombre { ... }
}

// Chip/tag seleccionable
.filtro-chip {
  @include selectable-chip;
}

// Item de lista
.menu-item {
  @include selectable-list-item;
}
```

### Estructura HTML Esperada

```html
<!-- Card seleccionable -->
<div class="rol-card" [class.selected]="isSelected" (click)="select()">
  <div class="rol-nombre">...</div>
</div>

<!-- Chip seleccionable -->
<span class="filtro-chip" [class.selected]="isActive">Activo</span>

<!-- List item -->
<div class="menu-item" [class.active]="isActive">
  <i class="pi pi-home"></i>
  <span>Inicio</span>
</div>
```

### Estados Soportados

Los mixins manejan automáticamente:

| Estado | Clase | Light Mode | Dark Mode |
|--------|-------|------------|-----------|
| **Default** | - | `--surface-ground` | `--surface-800` |
| **Hover** | `:hover` | `--surface-hover` | `--surface-700` |
| **Selected** | `.selected`, `.active` | `color-mix(primary 10%, surface-card)` | `color-mix(primary 15%, surface-900)` |
| **Disabled** | `.disabled`, `[disabled]` | opacity 0.5 | opacity 0.5 |

### Colores de Texto en Estado Seleccionado (WCAG 2.1 AA)

| Elemento | Light Mode | Dark Mode |
|----------|------------|-----------|
| **Texto título** | `--text-color` | `#FFFFFF` (blanco puro) |
| **Texto descripción** | `--text-color-secondary` | `rgba(255,255,255,0.85)` |

Los mixins aplican automáticamente los colores de texto correctos a elementos con clases que contengan:
- `-nombre`, `-title`, `.item-title`, `.item-name` → Texto principal blanco
- `-descripcion`, `-subtitle`, `.item-subtitle`, `.item-description` → Texto secundario blanco con opacidad

### Mixins Avanzados (de _dark-mode.scss)

Para casos donde necesitas más control:

```scss
@use 'styles/dark-mode' as dark;

.mi-elemento {
  // Aplicar estados interactivos completos
  @include dark.interactive-states;
}

// O usar mixins individuales
.mi-card {
  // Solo hover
  @include dark.with-hover-state;

  // Solo selección
  @include dark.with-selection-state;
}
```

### Ejemplo Completo: Wizard de Selección

```scss
@use 'styles/mixins' as *;

.wizard-opciones {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.opcion-card {
  @include selectable-card;
  padding: 1.5rem;
  text-align: center;

  .opcion-icono {
    width: 48px;
    height: 48px;
    margin: 0 auto 1rem;
    border-radius: 50%;
    background: var(--surface-100);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &.selected .opcion-icono {
    background: var(--primary-color);
    color: white;
  }
}
```

### NO Hacer (Anti-patterns)

```scss
// ❌ INCORRECTO - primary-50 no funciona en dark mode
.mi-card.selected {
  background: var(--primary-50);
}

// ❌ INCORRECTO - surface-50 no funciona en dark mode
.mi-card:hover {
  background: var(--surface-50);
}

// ❌ INCORRECTO - Sin override de dark mode
.mi-card.active {
  background: #e3f2fd; // Color hardcoded
}
```

---

## Checklist de Consistencia

Antes de crear un nuevo componente, verificar:

- [ ] ¿Usa variables de `_design-tokens.scss` en lugar de colores hardcoded?
- [ ] ¿Usa los mixins apropiados para el tipo de componente?
- [ ] ¿Las severidades usan el mapeo de `design-system.constants.ts`?
- [ ] ¿Los dialogs/drawers usan dimensiones estándar?
- [ ] ¿Los empty states usan el componente `EmptyStateComponent`?
- [ ] ¿Los iconos vienen de las constantes `ENTITY_ICONS` o `ACTION_ICONS`?
- [ ] ¿La estructura de página sigue el patrón establecido?

### Checklist Dark Mode

- [ ] ¿Usa mixins que incluyen dark mode automático (`page-container`, `selectable-card`, etc.)?
- [ ] ¿Las cards seleccionables usan el mixin `selectable-card`?
- [ ] ¿Evita colores problemáticos (`primary-50`, `surface-50`, `surface-100` sin override)?
- [ ] ¿Usa `:host-context(.dark)` para overrides personalizados (NO `.dark` ni `html.dark-mode`)?
- [ ] ¿Los fondos de selección en dark usan `color-mix()` en lugar de `primary-50`?
- [ ] ¿Los textos usan `var(--text-color)` y `var(--text-color-secondary)`?
- [ ] ¿Los bordes usan `var(--surface-border)`?

### Checklist Estados de Selección (WCAG 2.1 AA)

- [ ] ¿Los elementos con `.selected` o `.active` usan los mixins apropiados?
- [ ] ¿Cards seleccionables usan `@include selectable-card`?
- [ ] ¿Chips/tags clickeables usan `@include selectable-chip`?
- [ ] ¿Items de lista/menú usan `@include selectable-list-item`?
- [ ] ¿El hover usa `--surface-hover` en lugar de `--surface-50`?
- [ ] ¿El estado seleccionado tiene override de dark mode con `color-mix()`?
- [ ] ¿El texto en estado seleccionado en dark mode es blanco (`#FFFFFF`)?
- [ ] ¿El ratio de contraste cumple WCAG 2.1 AA (mínimo 4.5:1)?
- [ ] ¿Las clases de texto siguen el patrón (`-nombre`, `-title`, `-descripcion`, `-subtitle`)?

---

## Migración de Código Existente

### Reemplazar colores hardcoded

```diff
- background: #42A5F5;
+ background: var(--blue-500);
```

```diff
- color: #666;
+ color: var(--surface-500);
```

### Reemplazar severidades inline

```diff
- [severity]="item.criticidad === 'alta' ? 'danger' : 'success'"
+ [severity]="getSeverity(item.criticidad)"
```

### Usar constantes de dimensiones

```diff
- [style]="{ width: '450px' }"
+ [style]="{ width: DRAWER_WIDTHS.lg }"
```

### Migrar Dark Mode a Nuevo Sistema

```diff
// Reemplazar selector obsoleto
- :host-context(html.dark-mode) { ... }
+ :host-context(.dark) { ... }

// Usar mixins con dark mode automático
- .my-card {
-   background: var(--surface-card);
- }
- :host-context(.dark) .my-card {
-   background: var(--surface-900);
- }
+ .my-card {
+   @include selectable-card;
+ }

// Reemplazar primary-50 en selección
- &.selected { background: var(--primary-50); }
+ &.selected { background: color-mix(in srgb, var(--primary-color) 20%, var(--surface-900)); }
```

---

## Contacto

Mantener este documento actualizado conforme evoluciona el diseño del sistema.

**Última actualización:** Diciembre 2025 (Dark Mode System + WCAG 2.1 AA Selection States)
