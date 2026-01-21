# Componentes y Patrones Reutilizables

Este documento describe los patrones y componentes complejos implementados en el proyecto para facilitar su reutilización.

---

## 1. Tabla con Drag and Drop de Columnas (Tabla Unificada)

### Descripción
Tabla PrimeNG con capacidad de reordenar columnas mediante drag and drop, tanto desde los headers de la tabla como desde un drawer de configuración.

### Archivos de referencia
- `src/app/pages/tabla-unificada/tabla-unificada.ts`
- `src/app/pages/tabla-unificada/tabla-unificada.html`
- `src/app/pages/tabla-unificada/tabla-unificada.scss`
- `src/app/services/tabla-unificada.service.ts`

### Dependencias
```typescript
import { DragDropModule } from 'primeng/dragdrop';
import { TableModule } from 'primeng/table';
```

### Implementación

#### 1.1 Configuración de la Tabla (HTML)

```html
<p-table
  [value]="datos()"
  [columns]="columnasVisibles()"
  [reorderableColumns]="true"
  (onColReorder)="onColReorder($event)"
  styleClass="p-datatable-sm p-datatable-reorderable">

  <ng-template pTemplate="header" let-columns>
    <tr>
      @for (col of columns; track col.field) {
        <th
          [pSortableColumn]="col.sortable ? col.field : undefined"
          [style.width]="col.width"
          pResizableColumn
          pReorderableColumn>
          <div class="column-header">
            <span class="drag-handle-grip" pTooltip="Arrastra para reordenar"></span>
            <span>{{ col.header }}</span>
            @if (col.sortable) {
              <p-sortIcon [field]="col.field" />
            }
          </div>
        </th>
      }
    </tr>
  </ng-template>
</p-table>
```

#### 1.2 Método para manejar el reorden (TypeScript)

```typescript
// Manejar reorden de columnas desde la tabla
onColReorder(event: any): void {
  const columns = event.columns as ColumnaConfig[];
  const nuevoOrden = columns.map(col => col.field);
  this.service.reordenarColumnas(nuevoOrden);
}
```

#### 1.3 Servicio para gestionar el estado de columnas

```typescript
// Estado de columnas
private estado = signal<EstadoTabla>({
  ordenColumnas: ['campo1', 'campo2', 'campo3'],
  // ... otros campos
});

columnasConfig = signal<ColumnaConfig[]>([
  { field: 'campo1', header: 'Campo 1', tipo: 'texto', visible: true, sortable: true, filterable: true, orden: 0, width: '150px' },
  // ... más columnas
]);

// Computed: Columnas visibles ordenadas
columnasVisibles = computed(() => {
  const config = this.columnasConfig();
  const orden = this.estado().ordenColumnas;
  return config
    .filter(c => c.visible)
    .sort((a, b) => orden.indexOf(a.field) - orden.indexOf(b.field));
});

// Reordenar columnas (preserva columnas ocultas)
reordenarColumnas(nuevoOrden: string[]): void {
  const todasLasColumnas = this.columnasConfig().map(c => c.field);
  const columnasEnNuevoOrden = new Set(nuevoOrden);
  const columnasFaltantes = todasLasColumnas.filter(c => !columnasEnNuevoOrden.has(c));
  const ordenCompleto = [...nuevoOrden, ...columnasFaltantes];
  this.estado.update(s => ({ ...s, ordenColumnas: ordenCompleto }));
}
```

#### 1.4 Estilos para el icono de 6 puntos (grip handle)

```scss
// Table Styles
.column-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  // Icono de 6 puntos (grip handle) - oculto por defecto
  .drag-handle-grip {
    display: inline-block;
    width: 10px;
    height: 14px;
    min-width: 10px;
    cursor: grab;
    opacity: 0;
    transition: opacity 0.15s ease;
    flex-shrink: 0;
    margin-right: 4px;

    // Crear 6 puntos usando background con gradiente radial
    background-image:
      radial-gradient(circle, #9ca3af 1.5px, transparent 1.5px);
    background-size: 5px 4px;
    background-repeat: repeat;

    &:active {
      cursor: grabbing;
    }

    &:hover {
      opacity: 1 !important;
      background-image:
        radial-gradient(circle, var(--primary-color) 1.5px, transparent 1.5px);
    }
  }
}

// Mostrar grip en hover del th
::ng-deep .p-datatable-thead > tr > th:hover {
  .column-header .drag-handle-grip {
    opacity: 0.7;
  }
}
```

---

## 2. Drawer de Configuración de Columnas con Drag and Drop

### Descripción
Panel lateral para mostrar/ocultar columnas y reordenarlas mediante drag and drop, sincronizado con la tabla.

### Implementación

#### 2.1 HTML del Drawer

```html
<p-drawer
  [(visible)]="showColumnasDialog"
  position="right"
  [style]="{ width: '380px' }"
  header="Configurar Columnas">
  <div class="columnas-drawer-content">
    <!-- Buscador -->
    <div class="columnas-search mb-3">
      <p-iconfield>
        <p-inputicon styleClass="pi pi-search" />
        <input
          type="text"
          pInputText
          placeholder="Buscar columna..."
          [ngModel]="busquedaColumna()"
          (ngModelChange)="busquedaColumna.set($event)"
          class="w-full" />
      </p-iconfield>
    </div>

    <p class="text-secondary text-sm mb-3">
      <i class="pi pi-info-circle mr-1"></i>
      Arrastra las columnas para cambiar su orden.
    </p>

    <!-- Lista de columnas con drag and drop -->
    <div class="columnas-list">
      @for (col of columnasFiltradas(); track col.field; let i = $index) {
        <div
          class="columna-item"
          [class.dragging]="draggedColumna?.field === col.field"
          [class.drop-target]="draggedColumna && draggedColumna.field !== col.field"
          pDraggable="columnas"
          pDroppable="columnas"
          [dragHandle]="'.drag-handle-config'"
          (onDragStart)="onDragStartEvent($event, col)"
          (onDragEnd)="onDragEnd()"
          (onDrop)="onDropColumnaEvent($event, col)">
          <div class="columna-item-content">
            <i class="pi pi-bars drag-handle-config" pTooltip="Arrastra para reordenar"></i>
            <span class="columna-orden-badge">{{ i + 1 }}</span>
            <p-checkbox
              [ngModel]="col.visible"
              (ngModelChange)="toggleColumnaVisibilidad(col.field)"
              [binary]="true"
              [inputId]="col.field" />
            <label [for]="col.field" class="ml-2 flex-1">
              <span>{{ col.header }}</span>
              <span class="text-secondary text-xs ml-1">({{ col.tipo }})</span>
            </label>
            @if (col.visible) {
              <i class="pi pi-eye text-primary" pTooltip="Visible en tabla"></i>
            } @else {
              <i class="pi pi-eye-slash text-secondary" pTooltip="Oculta"></i>
            }
          </div>
        </div>
      }
    </div>
  </div>

  <ng-template pTemplate="footer">
    <div class="flex justify-content-between w-full">
      <p-button
        label="Restaurar"
        icon="pi pi-refresh"
        [text]="true"
        severity="secondary"
        (onClick)="restaurarColumnas()" />
      <p-button
        label="Cerrar"
        icon="pi pi-check"
        (onClick)="showColumnasDialog.set(false)" />
    </div>
  </ng-template>
</p-drawer>
```

#### 2.2 Métodos del Componente

```typescript
// Columnas ordenadas según el estado actual (para el drawer)
columnasOrdenadas = computed(() => {
  const columnas = this.columnasConfig();
  const orden = this.estado().ordenColumnas;
  return [...columnas].sort((a, b) => {
    const indexA = orden.indexOf(a.field);
    const indexB = orden.indexOf(b.field);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
});

// Columnas filtradas por búsqueda
columnasFiltradas = computed(() => {
  const busqueda = this.busquedaColumna().toLowerCase().trim();
  const columnas = this.columnasOrdenadas();
  if (!busqueda) return columnas;
  return columnas.filter(col =>
    col.header.toLowerCase().includes(busqueda) ||
    col.field.toLowerCase().includes(busqueda)
  );
});

// Drag and drop en el drawer
draggedColumna: ColumnaConfig | null = null;

onDragStartEvent(event: DragEvent, columna: ColumnaConfig): void {
  this.draggedColumna = columna;
}

onDragEnd(): void {
  this.draggedColumna = null;
}

onDropColumnaEvent(event: DragEvent, targetColumna: ColumnaConfig): void {
  if (this.draggedColumna && this.draggedColumna.field !== targetColumna.field) {
    const columnas = [...this.columnasOrdenadas()];
    const draggedIndex = columnas.findIndex(c => c.field === this.draggedColumna!.field);
    const targetIndex = columnas.findIndex(c => c.field === targetColumna.field);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [removed] = columnas.splice(draggedIndex, 1);
      columnas.splice(targetIndex, 0, removed);
      const nuevoOrden = columnas.map(c => c.field);
      this.service.reordenarColumnasCompleto(nuevoOrden);
    }
  }
  this.draggedColumna = null;
}
```

#### 2.3 Estilos del Drawer

```scss
// Columnas Config Drawer
.columnas-drawer-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.columnas-list {
  flex: 1;
  overflow-y: auto;
}

.columna-item {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  border: 1px solid var(--surface-200);
  margin-bottom: 0.5rem;
  background: var(--surface-card);
  cursor: grab;

  &:hover {
    background: var(--surface-hover);
    border-color: var(--primary-200);
  }

  &.dragging {
    opacity: 0.5;
    border-color: var(--primary-color);
    background: var(--primary-50);
    cursor: grabbing;
  }

  &.drop-target {
    outline: 1px dashed var(--primary-color);
    outline-offset: -2px;
  }
}

.columna-item-content {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 0.5rem;
}

.drag-handle-config {
  color: var(--text-color-secondary);
  cursor: grab;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    color: var(--primary-color);
    background: var(--surface-100);
  }
}

.columna-orden-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.5rem;
  border-radius: 4px;
  background: var(--surface-200);
  color: var(--text-color-secondary);
  font-size: 0.75rem;
  font-weight: 600;
}
```

---

## 3. Barra de Progreso Personalizada con Colores Dinámicos

### Descripción
Barra de progreso con colores que cambian según el valor (verde/amarillo/rojo), útil para mostrar niveles de confianza, progreso, etc.

### Archivos de referencia
- `src/app/pages/results-ml/results-ml.html`
- `src/app/pages/results-ml/results-ml.scss`

### Implementación

#### 3.1 HTML - Inline (más simple)

```html
<!-- Barra de progreso con colores dinámicos -->
<div class="flex flex-column gap-1">
  <div style="width: 100%; height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden;">
    <div
      [style.width.%]="valor"
      [style.background]="valor >= 80 ? '#22c55e' : valor >= 50 ? '#eab308' : '#ef4444'"
      style="height: 100%; border-radius: 3px;">
    </div>
  </div>
  <span class="text-sm">{{ valor }}%</span>
</div>
```

#### 3.2 HTML - Con clases CSS

```html
<div class="confianza-cell">
  <div class="custom-progress-bar">
    <div
      class="custom-progress-value"
      [style.width.%]="valor"
      [ngClass]="{
        'bg-green': valor >= 80,
        'bg-yellow': valor >= 50 && valor < 80,
        'bg-red': valor < 50
      }">
    </div>
  </div>
  <span class="text-sm font-medium">{{ valor }}%</span>
</div>
```

#### 3.3 Estilos CSS

```scss
// Contenedor de celda de confianza/progreso
.confianza-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

// Barra de progreso personalizada
.custom-progress-bar {
  width: 100%;
  height: 6px;
  background: var(--surface-200);  // o #e5e7eb
  border-radius: 3px;
  overflow: hidden;
}

.custom-progress-value {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;

  // Colores según valor
  &.bg-green {
    background: #22c55e;  // Verde - >= 80%
  }

  &.bg-yellow {
    background: #eab308;  // Amarillo - 50-79%
  }

  &.bg-red {
    background: #ef4444;  // Rojo - < 50%
  }
}
```

#### 3.4 Variante con método en el componente

```typescript
// Método para obtener el color según el valor
getColorPorValor(valor: number): string {
  if (valor >= 80) return '#22c55e';  // Verde
  if (valor >= 50) return '#eab308';  // Amarillo
  return '#ef4444';                    // Rojo
}

// Método para obtener la clase CSS
getClasePorValor(valor: number): string {
  if (valor >= 80) return 'bg-green';
  if (valor >= 50) return 'bg-yellow';
  return 'bg-red';
}
```

```html
<!-- Uso con método -->
<div class="custom-progress-bar">
  <div
    class="custom-progress-value"
    [style.width.%]="valor"
    [style.background]="getColorPorValor(valor)">
  </div>
</div>
```

---

## 4. Interface ColumnaConfig

### Descripción
Interface reutilizable para configuración de columnas en tablas.

```typescript
export type TipoColumna = 'texto' | 'numero' | 'fecha' | 'seleccion' | 'contenedor';

export interface ColumnaConfig {
  field: string;           // Identificador único del campo
  header: string;          // Etiqueta visible
  tipo: TipoColumna;       // Tipo de columna
  visible: boolean;        // Mostrar/ocultar
  width?: string;          // Ancho (ej: '150px')
  sortable: boolean;       // Permite ordenar
  filterable: boolean;     // Permite filtrar
  orden: number;           // Orden de presentación
  opciones?: { label: string; value: string }[];  // Para tipo 'seleccion'
}
```

---

## 5. Chips de Estadísticas con Colores

### Descripción
Chips compactos para mostrar estadísticas con diferentes colores.

```html
<div class="resumen-panel-compact">
  <div class="stat-chip stat-chip-purple">
    <i class="pi pi-lightbulb"></i>
    <span class="stat-label">Total</span>
    <span class="stat-value">{{ total }}</span>
  </div>
  <div class="stat-chip stat-chip-orange">
    <i class="pi pi-clock"></i>
    <span class="stat-label">Pendientes</span>
    <span class="stat-value">{{ pendientes }}</span>
  </div>
  <div class="stat-chip stat-chip-green">
    <i class="pi pi-check"></i>
    <span class="stat-label">Completados</span>
    <span class="stat-value">{{ completados }}</span>
  </div>
</div>
```

```scss
.resumen-panel-compact {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.stat-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.8125rem;
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  transition: all 0.2s;

  .stat-label {
    color: var(--text-color-secondary);
  }

  .stat-value {
    font-weight: 600;
    color: var(--text-color);
  }
}

// Variantes de colores
.stat-chip-purple {
  background: rgba(139, 92, 246, 0.08);
  border-color: rgba(139, 92, 246, 0.2);
  i { color: #8b5cf6; }
  .stat-value { color: #7c3aed; }
}

.stat-chip-orange {
  background: rgba(249, 115, 22, 0.08);
  border-color: rgba(249, 115, 22, 0.2);
  i { color: #f97316; }
  .stat-value { color: #ea580c; }
}

.stat-chip-green {
  background: rgba(34, 197, 94, 0.08);
  border-color: rgba(34, 197, 94, 0.2);
  i { color: #22c55e; }
  .stat-value { color: #16a34a; }
}

.stat-chip-red {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.2);
  i { color: #ef4444; }
  .stat-value { color: #dc2626; }
}

.stat-chip-blue {
  background: rgba(59, 130, 246, 0.08);
  border-color: rgba(59, 130, 246, 0.2);
  i { color: #3b82f6; }
  .stat-value { color: #2563eb; }
}
```

---

## 6. Wizard Method Cards con Dark Mode

### Descripción
Cards seleccionables para wizards de selección de método (IA vs Manual, opciones múltiples, etc.) con soporte completo de dark mode, estados hover y selected, y stats cards internas.

### Archivos de referencia
- `src/app/pages/cuestionarios/cuestionarios.html`
- `src/app/pages/cuestionarios/cuestionarios.scss`

### Características
- Gradientes de color diferenciados por tipo (púrpura para IA, azul para Manual)
- Estados: default, hover, selected
- Stats cards internas con contraste adecuado
- Dark mode completo con WCAG 2.1 AA compliance
- Efecto "presionado" en estado selected (más oscuro, no más claro)

### Implementación

#### 6.1 HTML - Estructura de Cards

```html
<div class="grid">
  <!-- Card IA (púrpura) -->
  <div class="col-12 md:col-6">
    <div class="wizard-method-card wizard-method-ia h-full border-round-xl p-4 cursor-pointer transition-all"
         [class.wizard-method-selected]="metodoCreacion() === 'ia'"
         (click)="seleccionarMetodo('ia')">

      <!-- Icono decorativo -->
      <div class="flex justify-content-center mb-4">
        <div class="wizard-method-icon flex align-items-center justify-content-center border-circle bg-purple-100"
             style="width: 80px; height: 80px;">
          <span class="material-icons text-purple-500" style="font-size: 2.5rem;">psychology</span>
        </div>
      </div>

      <!-- Título y descripción -->
      <div class="text-center mb-4">
        <h3 class="text-xl font-bold m-0 mb-2 wizard-method-title">Título Card</h3>
        <p class="text-sm m-0 line-height-3 wizard-method-desc">Descripción de la opción</p>
      </div>

      <!-- Stats cards internas -->
      <div class="flex gap-2 mb-4">
        <div class="flex-1 wizard-stat-card border-round-lg p-3">
          <div class="text-center">
            <span class="text-xl font-bold wizard-stat-value">89%</span>
            <p class="text-xs m-0 mt-1 wizard-stat-label">Precisión</p>
          </div>
        </div>
        <div class="flex-1 wizard-stat-card border-round-lg p-3">
          <div class="text-center">
            <span class="text-xl font-bold wizard-stat-value">< 30s</span>
            <p class="text-xs m-0 mt-1 wizard-stat-label">Tiempo</p>
          </div>
        </div>
      </div>

      <!-- Botón de acción -->
      <p-button label="Seleccionar" icon="pi pi-arrow-right" iconPos="right"
                severity="help" styleClass="w-full" />
    </div>
  </div>

  <!-- Card Manual (azul) -->
  <div class="col-12 md:col-6">
    <div class="wizard-method-card wizard-method-manual h-full border-round-xl p-4 cursor-pointer transition-all"
         [class.wizard-method-selected]="metodoCreacion() === 'manual'"
         (click)="seleccionarMetodo('manual')">
      <!-- ... mismo patrón con bg-blue-100 y text-blue-500 ... -->
    </div>
  </div>
</div>
```

#### 6.2 SCSS - Estilos Base (Light Mode)

```scss
// ==================== WIZARD METHOD CARDS ====================

// Wizard step icon
.wizard-step-icon {
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

// Wizard method cards - Base
.wizard-method-card {
  transition: all 0.3s ease;
  border: 2px solid transparent;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.15);
  }

  &.wizard-method-selected {
    border-color: var(--primary-color);
    box-shadow: 0 8px 25px -5px rgba(var(--primary-color-rgb), 0.3);
  }

  // Card IA - púrpura (light mode)
  &.wizard-method-ia {
    background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);

    &.wizard-method-selected {
      background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
    }
  }

  // Card Manual - azul/gris (light mode)
  &.wizard-method-manual {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);

    &.wizard-method-selected {
      background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
    }
  }
}

// Textos dentro de wizard cards
.wizard-method-title {
  color: var(--text-color);
}

.wizard-method-desc {
  color: var(--text-color-secondary);
}

// Stats cards dentro del wizard
.wizard-stat-card {
  background-color: var(--surface-card);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.wizard-stat-value {
  color: var(--text-color);
}

.wizard-stat-label {
  color: var(--text-color-secondary);
}

// Efecto hover en el icono
.wizard-method-icon {
  transition: all 0.3s ease;
}

.wizard-method-card:hover .wizard-method-icon {
  transform: scale(1.1);
}
```

#### 6.3 SCSS - Dark Mode Overrides

```scss
// Card IA - Dark mode
.wizard-method-card.wizard-method-ia {
  // Dark mode override
  :host-context(.dark-mode) & {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(124, 58, 237, 0.18) 100%);
    border-color: var(--surface-border);

    &:hover {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(124, 58, 237, 0.14) 100%);
    }
  }

  // Dark mode selected - MÁS OSCURO (efecto "presionado")
  :host-context(.dark-mode) &.wizard-method-selected {
    background: linear-gradient(135deg, rgba(88, 28, 135, 0.6) 0%, rgba(76, 29, 149, 0.5) 100%) !important;
    border-color: var(--purple-400) !important;
    box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.4), 0 0 0 2px rgba(139, 92, 246, 0.3) !important;
  }
}

// Card Manual - Dark mode
.wizard-method-card.wizard-method-manual {
  // Dark mode override
  :host-context(.dark-mode) & {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.12) 100%);
    border-color: var(--surface-border);

    &:hover {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%);
    }
  }

  // Dark mode selected - MÁS OSCURO (efecto "presionado")
  :host-context(.dark-mode) &.wizard-method-selected {
    background: linear-gradient(135deg, rgba(30, 58, 138, 0.6) 0%, rgba(29, 78, 216, 0.5) 100%) !important;
    border-color: var(--blue-400) !important;
    box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.4), 0 0 0 2px rgba(59, 130, 246, 0.3) !important;
  }
}

// Stats cards - Dark mode
.wizard-stat-card {
  :host-context(.dark-mode) & {
    background-color: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(4px);
  }
}
```

### Colores de Referencia

| Elemento | Light Mode | Dark Mode Default | Dark Mode Selected |
|----------|-----------|-------------------|-------------------|
| **Card IA** | `#f5f3ff → #ede9fe` | `rgba(139,92,246,0.25)` | `rgba(88,28,135,0.6)` |
| **Card Manual** | `#f8fafc → #f1f5f9` | `rgba(59,130,246,0.2)` | `rgba(30,58,138,0.6)` |
| **Stats Card** | `var(--surface-card)` | `rgba(255,255,255,0.08)` | mismo |
| **Border Selected** | `var(--primary-color)` | `--purple-400` / `--blue-400` | + glow |

### Principios de Diseño

1. **Estado Selected = Más Oscuro**: En dark mode, el estado selected debe ser MÁS OSCURO que el default para dar sensación de "presionado/hundido".

2. **Contraste de Stats Cards**: Las stats cards internas usan fondo semi-transparente blanco (`rgba(255,255,255,0.08)`) para contrastar con el gradiente del parent.

3. **Glow en Selected**: Se agrega un `box-shadow` con `inset` + glow exterior para indicar claramente la selección.

4. **Colores Semánticos**: Púrpura para IA/automático, Azul para Manual/control.

### Variantes Adicionales

Para crear nuevas variantes de color, seguir el patrón:

```scss
// Card Verde (ejemplo: Automático)
&.wizard-method-auto {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);

  :host-context(.dark-mode) & {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.12) 100%);
  }

  :host-context(.dark-mode) &.wizard-method-selected {
    background: linear-gradient(135deg, rgba(6, 78, 59, 0.6) 0%, rgba(4, 120, 87, 0.5) 100%) !important;
    border-color: var(--green-400) !important;
    box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.4), 0 0 0 2px rgba(16, 185, 129, 0.3) !important;
  }
}
```

---

## Notas Importantes

1. **Angular Signals**: Este proyecto usa Angular Signals para el manejo de estado reactivo.

2. **PrimeNG**: Todos los componentes usan PrimeNG v17+.

3. **Encapsulamiento CSS**: Usa `::ng-deep` cuando necesites atravesar el encapsulamiento de Angular para estilos de componentes de PrimeNG.

4. **Variables CSS**: Usa las variables de PrimeNG (`--primary-color`, `--surface-border`, etc.) para mantener consistencia con el tema.

5. **Dark Mode**:
   - El proyecto usa la clase `.dark-mode` en `<html>`, NO `.dark`
   - Usar `:host-context(.dark-mode)` para estilos de dark mode en componentes
   - Para contenido en drawers/dialogs (renderizados en body), agregar estilos en `styles.scss` bajo `html.dark-mode`
   - Ver `src/styles/_dark-mode.scss` para mixins y utilidades
   - Ver `src/styles/_design-tokens.scss` para tokens de colores

6. **Principios de Dark Mode**:
   - Estado selected = más oscuro (efecto "presionado"), no más claro
   - Usar `rgba()` con opacidades para gradientes en dark mode
   - Mantener contraste WCAG 2.1 AA (4.5:1 mínimo para texto)
   - Stats cards internas usar fondo semi-transparente blanco para contrastar
