# ORCA Design System

Guía de estilos y patrones de diseño para mantener la consistencia visual del proyecto.

## Estructura de Archivos

```
src/
├── styles/
│   ├── _design-tokens.scss    # Variables de diseño (colores, tipografía, espaciado)
│   └── _mixins.scss           # Mixins SCSS reutilizables
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

## Checklist de Consistencia

Antes de crear un nuevo componente, verificar:

- [ ] ¿Usa variables de `_design-tokens.scss` en lugar de colores hardcoded?
- [ ] ¿Usa los mixins apropiados para el tipo de componente?
- [ ] ¿Las severidades usan el mapeo de `design-system.constants.ts`?
- [ ] ¿Los dialogs/drawers usan dimensiones estándar?
- [ ] ¿Los empty states usan el componente `EmptyStateComponent`?
- [ ] ¿Los iconos vienen de las constantes `ENTITY_ICONS` o `ACTION_ICONS`?
- [ ] ¿La estructura de página sigue el patrón establecido?

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

---

## Contacto

Mantener este documento actualizado conforme evoluciona el diseño del sistema.

**Última actualización:** Diciembre 2025
