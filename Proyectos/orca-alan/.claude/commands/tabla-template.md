# Template de Tabla - Patrones de tabla-unificada

Este skill define los patrones de diseno y funcionalidades que deben seguir todas las tablas en orca-alan, basado en el componente `tabla-unificada`.

## Referencia: /tabla-unificada

URL: http://localhost:4200/tabla-unificada
Archivos:
- `src/app/pages/tabla-unificada/tabla-unificada.ts`
- `src/app/pages/tabla-unificada/tabla-unificada.html`
- `src/app/pages/tabla-unificada/tabla-unificada.scss`

---

## 1. ESTRUCTURA BASE DE COMPONENTE

### Imports Requeridos (PrimeNG)

```typescript
import { TableModule, Table } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MenuModule } from 'primeng/menu';
import { CheckboxModule } from 'primeng/checkbox';
import { SliderModule } from 'primeng/slider';
import { DatePickerModule } from 'primeng/datepicker';
import { PaginatorModule } from 'primeng/paginator';
import { DragDropModule } from 'primeng/dragdrop';
import { BadgeModule } from 'primeng/badge';
import { InputNumberModule } from 'primeng/inputnumber';
import { DrawerModule } from 'primeng/drawer';
import { ToolbarModule } from 'primeng/toolbar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
```

### Estructura del Componente

```typescript
@Component({
  selector: 'app-mi-tabla',
  standalone: true,
  imports: [/* imports de PrimeNG */],
  providers: [MessageService],
  templateUrl: './mi-tabla.html',
  styleUrl: './mi-tabla.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MiTablaComponent {
  // Referencia a la tabla
  @ViewChild('dt') dt!: Table;

  // Signals de estado
  datos = signal<MiModelo[]>([]);
  loading = signal(false);
  registrosSeleccionados = signal<MiModelo[]>([]);

  // Columnas configurables
  columnasConfig = signal<ColumnaConfig[]>([]);
  columnasVisibles = computed(() =>
    this.columnasConfig().filter(c => c.visible)
  );
}
```

---

## 2. TOOLBAR - Patron Obligatorio

### Regla: Toolbar pegado a la Tabla

El toolbar DEBE estar visualmente integrado con la tabla, sin espacio entre ellos. Esto se logra de dos formas:

#### Opcion A: Toolbar dentro del Card (RECOMENDADO)
```html
<p-card styleClass="table-card">
  <!-- Toolbar DENTRO del card, sin margin-bottom -->
  <p-toolbar styleClass="border-noround-bottom border-bottom-none">
    <!-- contenido del toolbar -->
  </p-toolbar>

  <p-table ...>
    <!-- tabla -->
  </p-table>
</p-card>
```

#### Opcion B: Toolbar fuera pero pegado
```html
<!-- Toolbar con border-radius solo arriba, sin margin-bottom -->
<p-toolbar styleClass="mb-0 border-noround-bottom">
  <!-- contenido del toolbar -->
</p-toolbar>

<!-- Card sin border-radius arriba -->
<p-card styleClass="table-card border-noround-top">
  <p-table ...>
    <!-- tabla -->
  </p-table>
</p-card>
```

### SCSS requerido para integracion visual
```scss
// Toolbar integrado con tabla
:host ::ng-deep {
  .p-toolbar {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);

    &.border-noround-bottom {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }
  }

  .table-card.border-noround-top {
    .p-card {
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }
  }

  // Cuando toolbar esta DENTRO del card
  .table-card .p-toolbar {
    margin: -1px -1px 0 -1px; // Compensa el padding del card
    border-top-left-radius: var(--border-radius-lg);
    border-top-right-radius: var(--border-radius-lg);
  }
}
```

### Estructura del Toolbar

```html
<p-toolbar styleClass="mb-0">
  <!-- IZQUIERDA: Acciones masivas + Filtro principal -->
  <ng-template pTemplate="start">
    <div class="flex align-items-center gap-3">
      <!-- Boton acciones masivas (solo si hay seleccion) -->
      @if (registrosSeleccionados().length > 0) {
        <p-button
          label="Acciones masivas"
          icon="pi pi-check-square"
          [badge]="registrosSeleccionados().length.toString()"
          badgeSeverity="contrast"
          severity="success"
          [outlined]="true"
          (onClick)="abrirAccionesMasivas()" />
      }

      <!-- Filtro principal (selector de entidad/tipo) -->
      <p-select
        [options]="tipoOptions"
        [(ngModel)]="tipoSeleccionado"
        optionLabel="label"
        optionValue="value"
        placeholder="Seleccionar tipo"
        [style]="{ minWidth: '200px' }"
        appendTo="body">
        <ng-template let-item pTemplate="item">
          <div class="flex align-items-center gap-2">
            <i [class]="item.icon"></i>
            <span>{{ item.label }}</span>
          </div>
        </ng-template>
      </p-select>
    </div>
  </ng-template>

  <!-- CENTRO: Buscador global -->
  <ng-template pTemplate="center">
    <p-iconfield>
      <p-inputicon styleClass="pi pi-search" />
      <input
        type="text"
        pInputText
        placeholder="Buscar en todos los campos..."
        (input)="dt.filterGlobal($any($event.target).value, 'contains')"
        style="width: 280px" />
    </p-iconfield>
  </ng-template>

  <!-- DERECHA: Acciones secundarias -->
  <ng-template pTemplate="end">
    <div class="flex gap-2 align-items-center">
      <!-- Graficas -->
      <p-button
        icon="pi pi-chart-bar"
        severity="secondary"
        [rounded]="true"
        [text]="true"
        (onClick)="abrirGraficas()"
        pTooltip="Graficas"
        tooltipPosition="bottom" />

      <!-- Exportar (con menu) -->
      <p-menu #exportMenu [model]="exportMenuItems" [popup]="true" appendTo="body" />
      <p-button
        icon="pi pi-download"
        severity="secondary"
        [rounded]="true"
        [text]="true"
        (onClick)="exportMenu.toggle($event)"
        pTooltip="Exportar"
        tooltipPosition="bottom" />

      <!-- Configuracion de columnas -->
      <p-button
        icon="pi pi-cog"
        severity="secondary"
        [rounded]="true"
        [text]="true"
        (onClick)="showColumnasDrawer.set(true)"
        pTooltip="Columnas"
        tooltipPosition="bottom" />
    </div>
  </ng-template>
</p-toolbar>
```

---

## 3. TABLA PRINCIPAL - Patron p-table

```html
<p-card styleClass="table-card">
  <p-table
    #dt
    [value]="datosFiltrados()"
    [columns]="columnasVisibles()"
    [paginator]="true"
    [rows]="10"
    [rowsPerPageOptions]="[10, 25, 50, 100]"
    [showCurrentPageReport]="true"
    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
    [globalFilterFields]="['campo1', 'campo2', 'campo3']"
    [filterDelay]="300"
    [rowHover]="true"
    [resizableColumns]="true"
    [reorderableColumns]="true"
    (onColReorder)="onColReorder($event)"
    columnResizeMode="expand"
    styleClass="p-datatable-sm p-datatable-reorderable"
    [tableStyle]="{ 'min-width': '60rem' }"
    [selection]="registrosSeleccionados()"
    (selectionChange)="onSelectionChange($event)"
    dataKey="id">

    <!-- TEMPLATES AQUI -->

  </p-table>
</p-card>
```

### Propiedades Obligatorias de p-table

| Propiedad | Valor | Descripcion |
|-----------|-------|-------------|
| `[paginator]` | `true` | Habilita paginacion |
| `[rows]` | `10` | Filas por pagina default |
| `[rowsPerPageOptions]` | `[10, 25, 50, 100]` | Opciones de paginacion |
| `[showCurrentPageReport]` | `true` | Muestra contador de registros |
| `currentPageReportTemplate` | `"Mostrando {first} a {last} de {totalRecords} registros"` | Formato del contador |
| `[filterDelay]` | `300` | Delay en filtros (ms) |
| `[rowHover]` | `true` | Highlight en hover |
| `[resizableColumns]` | `true` | Columnas redimensionables |
| `[reorderableColumns]` | `true` | Columnas reordenables |
| `styleClass` | `"p-datatable-sm p-datatable-reorderable"` | Clases CSS |
| `dataKey` | `"id"` | Campo unico para seleccion |

---

## 4. HEADER CON FILTROS - Patron de dos filas

```html
<ng-template pTemplate="header" let-columns>
  <!-- FILA 1: Titulos de columnas -->
  <tr>
    <!-- Checkbox de seleccion masiva -->
    <th style="width: 50px">
      <p-tableHeaderCheckbox />
    </th>

    <!-- Columnas dinamicas -->
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

    <!-- Columna de acciones -->
    <th style="width: 80px">
      <div class="flex align-items-center justify-content-between">
        <span>Acciones</span>
        <p-button
          icon="pi pi-ellipsis-v"
          [rounded]="true"
          [text]="true"
          severity="secondary"
          size="small"
          (onClick)="showColumnasDrawer.set(true)"
          pTooltip="Columnas" />
      </div>
    </th>
  </tr>

  <!-- FILA 2: Filtros por columna -->
  <tr>
    <th></th>
    @for (col of columns; track col.field) {
      <th>
        <!-- Filtro segun tipo de columna -->
        @switch (col.tipo) {
          @case ('select') {
            <p-columnFilter field="{{col.field}}" matchMode="in" [showMenu]="false">
              <ng-template pTemplate="filter" let-value let-filter="filterCallback">
                <p-multiSelect
                  [ngModel]="value"
                  (ngModelChange)="filter($event)"
                  [options]="col.opciones"
                  placeholder="Todos"
                  appendTo="body"
                  [showHeader]="false" />
              </ng-template>
            </p-columnFilter>
          }
          @case ('date') {
            <p-columnFilter type="date" field="{{col.field}}" display="menu" [showMenu]="true">
              <ng-template pTemplate="filter" let-value let-filter="filterCallback">
                <p-datePicker
                  [ngModel]="value"
                  (ngModelChange)="filter($event)"
                  dateFormat="dd/mm/yy"
                  placeholder="Filtrar fecha"
                  [showIcon]="true" />
              </ng-template>
            </p-columnFilter>
          }
          @case ('numeric') {
            <p-columnFilter type="numeric" field="{{col.field}}" display="menu" [showMenu]="true">
              <ng-template pTemplate="filter" let-value let-filter="filterCallback">
                <!-- Filtro con slider de rango -->
                <div class="flex flex-column gap-2">
                  <p-slider
                    [(ngModel)]="filtroRango"
                    [range]="true"
                    [min]="1"
                    [max]="10" />
                </div>
              </ng-template>
            </p-columnFilter>
          }
          @default {
            <p-columnFilter type="text" field="{{col.field}}" [showMenu]="false">
              <ng-template pTemplate="filter" let-value let-filter="filterCallback">
                <input
                  pInputText
                  type="text"
                  [ngModel]="value"
                  (ngModelChange)="filter($event)"
                  placeholder="Buscar..." />
              </ng-template>
            </p-columnFilter>
          }
        }
      </th>
    }
    <!-- Boton limpiar filtros -->
    <th>
      <p-button
        icon="pi pi-filter-slash"
        [rounded]="true"
        [text]="true"
        severity="secondary"
        (onClick)="dt.clear()"
        pTooltip="Limpiar filtros" />
    </th>
  </tr>
</ng-template>
```

---

## 5. BODY - Patron de renderizado

```html
<ng-template pTemplate="body" let-registro let-columns="columns">
  <tr
    (click)="verDetalle(registro)"
    class="row-clickable">

    <!-- Checkbox de seleccion -->
    <td (click)="$event.stopPropagation()">
      <p-tableCheckbox [value]="registro" />
    </td>

    <!-- Columnas dinamicas -->
    @for (col of columns; track col.field) {
      <td>
        @switch (col.field) {
          @case ('estado') {
            <p-tag
              [value]="formatearEstado(registro.estado)"
              [severity]="getEstadoSeverity(registro.estado)" />
          }
          @case ('fecha') {
            {{ formatearFecha(registro.fecha) }}
          }
          @case ('severidad') {
            <p-tag
              [value]="registro.severidad"
              [severity]="getSeveridadSeverity(registro.severidad)" />
          }
          @default {
            {{ registro[col.field] || '-' }}
          }
        }
      </td>
    }

    <!-- Columna de acciones -->
    <td class="text-center">
      <p-menu #menu [model]="getMenuItems(registro)" [popup]="true" appendTo="body" />
      <p-button
        icon="pi pi-ellipsis-v"
        [text]="true"
        size="small"
        (onClick)="menu.toggle($event); $event.stopPropagation()" />
    </td>
  </tr>
</ng-template>
```

---

## 6. FOOTER - Totales y estadisticas

```html
<ng-template pTemplate="footer" let-columns>
  <tr class="font-semibold surface-100">
    <td>
      @if (registrosSeleccionados().length > 0) {
        <span class="text-primary text-sm">{{ registrosSeleccionados().length }}</span>
      }
    </td>
    <td>
      <span class="text-900">Totales</span>
    </td>
    <td>
      <div class="flex gap-2">
        <p-tag value="Tipo A" severity="info" styleClass="text-xs" />
        <span>{{ contadores().tipoA }}</span>
        <p-tag value="Tipo B" severity="warn" styleClass="text-xs" />
        <span>{{ contadores().tipoB }}</span>
      </div>
    </td>
    <td>
      <span class="text-600">{{ contadores().total }} registros</span>
    </td>
    @for (col of columns.slice(3); track col.field) {
      <td></td>
    }
    <td></td>
  </tr>
</ng-template>
```

---

## 7. EMPTY STATE - Mensaje sin datos

```html
<ng-template pTemplate="emptymessage" let-columns>
  <tr>
    <td [attr.colspan]="columns.length + 2" class="text-center py-6">
      <div class="empty-state">
        <i class="pi pi-inbox text-4xl text-secondary mb-3"></i>
        <p class="text-secondary">No se encontraron registros</p>
        <p-button
          label="Limpiar filtros"
          [text]="true"
          (onClick)="dt.clear()" />
      </div>
    </td>
  </tr>
</ng-template>
```

---

## 8. DRAWER DE COLUMNAS - Configuracion

```html
<p-drawer
  [(visible)]="showColumnasDrawer"
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
          [(ngModel)]="busquedaColumna"
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
          pDraggable="columnas"
          pDroppable="columnas"
          (onDrop)="onDropColumna($event, col)">
          <div class="columna-item-content">
            <i class="pi pi-bars drag-handle-config"></i>
            <span class="columna-orden-badge">{{ i + 1 }}</span>
            <p-checkbox
              [(ngModel)]="col.visible"
              [binary]="true"
              [inputId]="col.field" />
            <label [for]="col.field" class="ml-2 flex-1">
              {{ col.header }}
            </label>
          </div>
        </div>
      }
    </div>
  </div>
</p-drawer>
```

---

## 9. DRAWER DE ACCIONES MASIVAS

```html
<p-drawer
  [(visible)]="showAccionesMasivasDrawer"
  position="right"
  [style]="{ width: '450px' }"
  header="Acciones Masivas">
  <div class="acciones-masivas-content">
    <!-- Header con contador -->
    <div class="acciones-masivas-header">
      <p-message
        severity="info"
        [text]="registrosSeleccionados().length + ' registros seleccionados'" />
    </div>

    <!-- Lista de campos editables -->
    <div class="acciones-masivas-fields">
      @for (col of columnasEditables(); track col.field) {
        <div class="accion-masiva-item" [class.active]="campoActivo(col.field)">
          <div
            class="accion-masiva-header"
            (click)="toggleCampoMasivo(col.field)">
            <div class="flex align-items-center gap-2">
              <span class="campo-nombre">{{ col.header }}</span>
              <span class="campo-tipo">{{ col.tipo }}</span>
            </div>
            <i class="pi" [class.pi-chevron-down]="!campoActivo(col.field)"
               [class.pi-chevron-up]="campoActivo(col.field)"></i>
          </div>

          @if (campoActivo(col.field)) {
            <div class="accion-masiva-control">
              <!-- Control segun tipo -->
              @switch (col.tipo) {
                @case ('select') {
                  <p-select
                    [options]="col.opciones"
                    [(ngModel)]="valoresMasivos[col.field]"
                    placeholder="Seleccionar..."
                    class="w-full" />
                }
                @case ('date') {
                  <p-datePicker
                    [(ngModel)]="valoresMasivos[col.field]"
                    dateFormat="dd/mm/yy"
                    class="w-full" />
                }
                @default {
                  <input
                    pInputText
                    [(ngModel)]="valoresMasivos[col.field]"
                    class="w-full" />
                }
              }
            </div>
          }
        </div>
      }
    </div>

    <!-- Footer con botones -->
    <div class="flex justify-content-end gap-2 mt-3">
      <p-button
        label="Cancelar"
        severity="secondary"
        (onClick)="showAccionesMasivasDrawer.set(false)" />
      <p-button
        label="Aplicar cambios"
        icon="pi pi-check"
        (onClick)="aplicarAccionesMasivas()" />
    </div>
  </div>
</p-drawer>
```

---

## 10. ESTILOS SCSS REQUERIDOS

```scss
// Contenedor principal
.tabla-container {
  padding: 1.5rem;
  max-width: 100%;
}

// Header de pagina
.page-header {
  margin-bottom: 1.5rem;

  h1 {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 600;
    color: var(--text-color);
  }

  .page-subtitle {
    margin: 0.25rem 0 0 0;
    font-size: 0.9rem;
    color: var(--text-color-secondary);
  }
}

// Table card sin padding
:host ::ng-deep .table-card {
  .p-card-body {
    padding: 0;
  }
  .p-card-content {
    padding: 0;
  }
}

// Column header con drag handle
.column-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  .drag-handle-grip {
    display: inline-block;
    width: 10px;
    height: 14px;
    cursor: grab;
    opacity: 0;
    transition: opacity 0.15s ease;
    background-image: radial-gradient(circle, #9ca3af 1.5px, transparent 1.5px);
    background-size: 5px 4px;
    background-repeat: repeat;

    &:hover {
      opacity: 1 !important;
      background-image: radial-gradient(circle, var(--primary-color) 1.5px, transparent 1.5px);
    }
  }
}

// Mostrar grip en hover del header
::ng-deep .p-datatable-thead > tr > th:hover {
  .column-header .drag-handle-grip {
    opacity: 0.7;
  }
}

// Quitar bordes verticales de tabla
:host ::ng-deep .p-datatable {
  .p-datatable-thead > tr > th,
  .p-datatable-tbody > tr > td {
    border-left: none;
    border-right: none;
  }
}

// Fila clickeable
.row-clickable {
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: var(--surface-hover) !important;
  }
}

// Empty state
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}

// Drawer de columnas
.columnas-drawer-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.columna-item {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: 8px;
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

// Acciones masivas
.accion-masiva-item {
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  margin-bottom: 0.75rem;
  overflow: hidden;
  transition: all 0.2s;
  background: var(--surface-ground);

  &:hover {
    border-color: var(--primary-color);
  }

  &.active {
    border-color: var(--primary-color);
    background: var(--highlight-bg);
  }
}

.accion-masiva-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1rem;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;

  &:hover {
    background: var(--surface-hover);
  }
}

.accion-masiva-control {
  padding: 0 1rem 1rem;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## 11. INTERFACE DE COLUMNA

```typescript
interface ColumnaConfig {
  field: string;        // Nombre del campo en el modelo
  header: string;       // Texto del header
  tipo: 'text' | 'select' | 'date' | 'numeric' | 'tag';
  width?: string;       // Ancho (ej: '150px')
  visible: boolean;     // Visible por defecto
  sortable: boolean;    // Permite ordenar
  filterable: boolean;  // Permite filtrar
  opciones?: { label: string; value: any }[];  // Para tipo select
}
```

---

## 12. MENU DE ACCIONES POR FILA

```typescript
getMenuItems(registro: MiModelo): MenuItem[] {
  return [
    {
      label: 'Ver detalle',
      icon: 'pi pi-eye',
      command: () => this.verDetalle(registro)
    },
    {
      label: 'Editar',
      icon: 'pi pi-pencil',
      command: () => this.editar(registro)
    },
    { separator: true },
    {
      label: 'Ver historial',
      icon: 'pi pi-history',
      command: () => this.verHistorial(registro)
    },
    { separator: true },
    {
      label: 'Eliminar',
      icon: 'pi pi-trash',
      styleClass: 'p-menuitem-danger',
      command: () => this.confirmarEliminar(registro)
    }
  ];
}
```

---

## 13. FUNCIONES HELPER DE FORMATO

```typescript
// Formatear estado con primera letra mayuscula
formatearEstado(estado: string): string {
  if (!estado) return '-';
  return estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase();
}

// Formatear fecha
formatearFecha(fecha: Date | string): string {
  if (!fecha) return '-';
  const d = new Date(fecha);
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// Obtener severity para tags de estado
getEstadoSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
  const map: Record<string, any> = {
    'activo': 'success',
    'pendiente': 'warn',
    'cerrado': 'secondary',
    'critico': 'danger'
  };
  return map[estado?.toLowerCase()] || 'info';
}

// Obtener severity para severidad
getSeveridadSeverity(severidad: string): 'success' | 'info' | 'warn' | 'danger' {
  const map: Record<string, any> = {
    'critica': 'danger',
    'alta': 'warn',
    'media': 'info',
    'baja': 'success'
  };
  return map[severidad?.toLowerCase()] || 'info';
}
```

---

## 14. TABLAS EMBEBIDAS EN PANELES

Para tablas dentro de paneles laterales, modales o secciones secundarias:

### Patron: Panel con Tabla Embebida

```html
<aside class="preview-panel">
  <!-- Header del panel -->
  <div class="preview-panel-header">
    <h3>Titulo del Panel</h3>
    <p-button
      icon="pi pi-times"
      [rounded]="true"
      [text]="true"
      severity="secondary"
      (onClick)="cerrarPanel()" />
  </div>

  <!-- Toolbar PEGADO a la tabla -->
  <div class="preview-panel-toolbar">
    <p-iconfield>
      <p-inputicon styleClass="pi pi-search" />
      <input pInputText placeholder="Buscar..." class="w-full" />
    </p-iconfield>
    <div class="flex gap-2">
      <p-button icon="pi pi-download" [text]="true" severity="secondary" pTooltip="Exportar" />
      <p-button icon="pi pi-refresh" [text]="true" severity="secondary" pTooltip="Refrescar" />
    </div>
  </div>

  <!-- Tabla SIN espacio superior -->
  <div class="preview-panel-body">
    <p-table
      [value]="datos()"
      [scrollable]="true"
      scrollHeight="flex"
      styleClass="p-datatable-sm p-datatable-gridlines">

      <ng-template pTemplate="header">
        <tr>
          @for (col of columnas(); track col) {
            <th>{{ col }}</th>
          }
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-row>
        <tr>
          @for (col of columnas(); track col) {
            <td>{{ row[col] }}</td>
          }
        </tr>
      </ng-template>

      <ng-template pTemplate="emptymessage">
        <tr>
          <td [attr.colspan]="columnas().length" class="text-center py-4">
            <i class="pi pi-inbox text-2xl text-secondary mb-2"></i>
            <p class="text-secondary m-0">Sin datos</p>
          </td>
        </tr>
      </ng-template>
    </p-table>
  </div>

  <!-- Footer con acciones (PEGADO a la tabla) -->
  <div class="preview-panel-footer">
    <p-button label="Cancelar" severity="secondary" [text]="true" />
    <p-button label="Aplicar" icon="pi pi-check" />
  </div>
</aside>
```

### SCSS para Panel con Tabla

```scss
.preview-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--surface-card);
  border-left: 1px solid var(--surface-border);
}

.preview-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--surface-border);
  background: var(--surface-50);

  h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-color);
  }
}

// Toolbar PEGADO a la tabla (sin borde inferior)
.preview-panel-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: var(--surface-ground);
  border-bottom: none; // SIN borde - se fusiona con la tabla
}

// Body con tabla - sin padding superior
.preview-panel-body {
  flex: 1;
  overflow: hidden;

  // Tabla sin borde superior (se fusiona con toolbar)
  :host ::ng-deep .p-datatable {
    .p-datatable-wrapper {
      border-top: none;
    }
  }
}

// Footer PEGADO a la tabla
.preview-panel-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--surface-border);
  background: var(--surface-50);
}
```

### Reglas para Tablas Embebidas

1. **Header del panel** - Separado visualmente con borde inferior
2. **Toolbar** - PEGADO a la tabla (sin borde inferior, sin margin-bottom)
3. **Tabla** - Sin borde superior cuando hay toolbar
4. **Footer** - PEGADO a la tabla (sin espacio, con borde superior)

### Anti-patrones (EVITAR)

```html
<!-- MAL: Espacio entre toolbar y tabla -->
<div class="toolbar mb-3">...</div>
<p-table>...</p-table>

<!-- MAL: Margen en el body -->
<div class="panel-body p-3">
  <p-table>...</p-table>
</div>

<!-- MAL: Footer separado -->
<p-table>...</p-table>
<div class="footer mt-3">...</div>
```

---

## 15. TOOLBAR CUSTOMIZADO (Sin p-toolbar)

En casos donde se necesita un toolbar mas flexible (ej: editores de procesos), usar estructura customizada pero MANTENIENDO la integracion visual:

```html
<div class="editor-toolbar">
  <div class="toolbar-start">
    <!-- Controles izquierda -->
  </div>
  <div class="toolbar-center">
    <!-- Buscador o controles centrales -->
  </div>
  <div class="toolbar-end">
    <!-- Acciones derecha -->
  </div>
</div>
```

### SCSS para Toolbar Customizado

```scss
.editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;

  // Si hay contenido debajo, quitar borde inferior
  &.toolbar-attached {
    border-bottom: none;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
}

.toolbar-start,
.toolbar-center,
.toolbar-end {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: var(--surface-border);
  margin: 0 0.5rem;
}
```

---

## CHECKLIST DE IMPLEMENTACION

Al crear una nueva tabla, verificar:

### Integracion Visual (CRITICO)
- [ ] **Toolbar PEGADO a la tabla** - Sin espacio/margin entre toolbar y tabla
- [ ] **Footer PEGADO a la tabla** - Sin espacio/margin entre tabla y footer
- [ ] Border-radius coherente (toolbar arriba, footer abajo)
- [ ] Misma anchura entre toolbar, tabla y footer

### Toolbar
- [ ] Toolbar con 3 secciones (start, center, end)
- [ ] Buscador global en el centro
- [ ] Boton de acciones masivas (condicional)
- [ ] Usar `p-toolbar` o estructura `.editor-toolbar` customizada
- [ ] `styleClass="mb-0"` o sin margin-bottom

### Tabla (p-table)
- [ ] p-table con todas las propiedades obligatorias
- [ ] Header con dos filas (titulos + filtros)
- [ ] Checkbox de seleccion masiva
- [ ] Columnas reordenables y redimensionables
- [ ] Filtros segun tipo de columna
- [ ] Body con renderizado condicional por tipo
- [ ] Menu contextual por fila
- [ ] Footer con totales/estadisticas
- [ ] Empty state con boton limpiar filtros
- [ ] Paginador con opciones [10, 25, 50, 100]

### Componentes Auxiliares
- [ ] Drawer de configuracion de columnas
- [ ] Drawer de acciones masivas

### Estilos
- [ ] Estilos SCSS siguiendo el patron
- [ ] Sin bordes duplicados entre toolbar/tabla/footer
- [ ] Variables CSS para colores, radios, sombras

---

## 16. CUANDO NO APLICA EL PATRON TOOLBAR-TABLA

El patron de "toolbar pegado a tabla" NO aplica en estos casos:

### Toolbars de Editor (Canvas/Diagramas)
```html
<!-- Este toolbar controla un canvas, NO una tabla -->
<div class="editor-toolbar">
  <div class="toolbar-left">
    <p-select [options]="nodeTypes" placeholder="Agregar nodo" />
    <div class="toolbar-divider"></div>
    <div class="toolbar-buttons">
      <p-button icon="pi pi-search-minus" [rounded]="true" [outlined]="true" />
      <p-button icon="pi pi-search-plus" [rounded]="true" [outlined]="true" />
    </div>
  </div>
  <div class="toolbar-center">
    <input pInputText placeholder="Buscar..." />
  </div>
  <div class="toolbar-right">
    <p-button icon="pi pi-play" label="Ejecutar" />
  </div>
</div>

<!-- Canvas del editor (NO es una tabla) -->
<div class="canvas-container">
  <!-- diagrama/editor visual -->
</div>
```

### Toolbars de Formularios
Cuando el toolbar controla un formulario y no una tabla:
```html
<p-toolbar>
  <ng-template pTemplate="start">
    <h3>Configuracion</h3>
  </ng-template>
  <ng-template pTemplate="end">
    <p-button label="Guardar" />
  </ng-template>
</p-toolbar>

<div class="form-container">
  <!-- formulario -->
</div>
```

### Resumen: Regla del Toolbar Pegado

| Contexto | Toolbar pegado? | Razon |
|----------|-----------------|-------|
| Toolbar + p-table | SI | Integracion visual obligatoria |
| Toolbar + Canvas/Editor | NO | Diferentes componentes |
| Toolbar + Formulario | NO | El formulario tiene su propio espacio |
| Panel lateral con tabla | SI | La tabla debe estar integrada |

---

## EJECUCION

Este skill debe ejecutarse cuando:
1. Se crea una nueva pagina con tabla de datos
2. Se refactoriza una tabla existente
3. Se agregan funcionalidades a una tabla
4. Se crea un panel lateral que contiene una tabla
