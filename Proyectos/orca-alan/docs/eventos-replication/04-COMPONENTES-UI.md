# Componentes UI - Módulo Eventos

## Estructura de Páginas

```
/src/app/pages/
├── eventos/                          # Lista de eventos (RISK, INCIDENT, DEFECT)
│   ├── eventos.ts
│   ├── eventos.html
│   └── eventos.scss
│
├── eventos-crear/                    # Crear/Editar evento
│   ├── eventos-crear.ts
│   ├── eventos-crear.html
│   └── eventos-crear.scss
│
├── eventos-detalle/                  # Detalle de evento
│   ├── eventos-detalle.ts
│   ├── eventos-detalle.html
│   └── eventos-detalle.scss
│
├── evento-subtipos/                  # Lista de subtipos (plantillas)
│   ├── evento-subtipos.ts
│   ├── evento-subtipos.html
│   └── evento-subtipos.scss
│
└── evento-subtipo-crear/             # Crear/Editar subtipo con form builder
    ├── evento-subtipo-crear.ts
    ├── evento-subtipo-crear.html
    └── evento-subtipo-crear.scss
```

---

## 1. EventosComponent (Lista de Eventos)

### Archivo: `eventos/eventos.ts`

```typescript
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MenuModule } from 'primeng/menu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TabViewModule } from 'primeng/tabview';

import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';

import { EventosService } from '../../services/eventos.service';
import { EventSubTypesService } from '../../services/evento-subtipos.service';
import {
  Event,
  EventType,
  EventStatus,
  EVENT_TYPES,
  EVENT_STATUS_OPTIONS,
  SEVERITY_OPTIONS,
  getEventTypeLabel,
  getEventStatusLabel,
  getEventStatusSeverity,
  getSeverityLabel,
  getSeveritySeverity
} from '../../models/eventos.models';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    CardModule,
    ButtonModule,
    ToolbarModule,
    InputTextModule,
    SelectModule,
    MultiSelectModule,
    TagModule,
    TooltipModule,
    MenuModule,
    ConfirmDialogModule,
    ToastModule,
    TabViewModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './eventos.html',
  styleUrl: './eventos.scss'
})
export class EventosComponent implements OnInit {
  private router = inject(Router);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  eventosService = inject(EventosService);
  subTypesService = inject(EventSubTypesService);

  // Tab activo (0=Riesgos, 1=Incidentes, 2=Defectos)
  activeTab = signal(0);

  // Tipo de evento actual basado en tab
  currentEventType = computed(() => {
    switch (this.activeTab()) {
      case 0: return EventType.RISK;
      case 1: return EventType.INCIDENT;
      case 2: return EventType.DEFECT;
      default: return EventType.RISK;
    }
  });

  // Eventos filtrados por tipo actual
  filteredEvents = computed(() =>
    this.eventosService.events().filter(e => e.eventType === this.currentEventType())
  );

  // Subtipos del tipo actual
  currentSubTypes = computed(() =>
    this.subTypesService.eventSubTypes().filter(
      st => st.eventType === this.currentEventType() && st.isActive
    )
  );

  // Stats del tipo actual
  currentStats = computed(() =>
    this.eventosService.getStatsByType(this.currentEventType())
  );

  // Opciones para filtros
  eventTypeOptions = EVENT_TYPES;
  statusOptions = EVENT_STATUS_OPTIONS;
  severityOptions = SEVERITY_OPTIONS;

  // Context menu
  menuItems: MenuItem[] = [];
  selectedEvent: Event | null = null;

  async ngOnInit(): Promise<void> {
    await this.eventosService.loadEvents();
    await this.subTypesService.loadEventSubTypes();
  }

  // ============ Navegación ============

  navigateToCreate(): void {
    this.router.navigate(['/eventos/crear'], {
      queryParams: { type: this.currentEventType() }
    });
  }

  navigateToDetail(event: Event): void {
    this.router.navigate(['/eventos', event.id]);
  }

  navigateToEdit(event: Event): void {
    this.router.navigate(['/eventos', event.id, 'editar']);
  }

  onRowSelect(event: any): void {
    if (event.data) {
      this.navigateToDetail(event.data as Event);
    }
  }

  // ============ Acciones ============

  async changeStatus(event: Event, newStatus: EventStatus): Promise<void> {
    const result = await this.eventosService.changeStatus(event.id, newStatus);
    if (result) {
      this.messageService.add({
        severity: 'success',
        summary: 'Estado actualizado',
        detail: `El evento "${event.title}" ahora está ${getEventStatusLabel(newStatus)}`
      });
    }
  }

  confirmDelete(event: Event, clickEvent: globalThis.Event): void {
    clickEvent.stopPropagation();
    this.confirmationService.confirm({
      target: clickEvent.target as EventTarget,
      message: `¿Está seguro de eliminar el evento "${event.title}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        const deleted = await this.eventosService.deleteEvent(event.id);
        if (deleted) {
          this.messageService.add({
            severity: 'success',
            summary: 'Evento eliminado',
            detail: `El evento "${event.title}" ha sido eliminado`
          });
        }
      }
    });
  }

  showMenu(event: Event, menu: any, clickEvent: globalThis.Event): void {
    clickEvent.stopPropagation();
    this.selectedEvent = event;
    this.menuItems = [
      {
        label: 'Ver detalle',
        icon: 'pi pi-eye',
        command: () => this.navigateToDetail(event)
      },
      {
        label: 'Editar',
        icon: 'pi pi-pencil',
        command: () => this.navigateToEdit(event)
      },
      { separator: true },
      {
        label: 'Cambiar estado',
        icon: 'pi pi-sync',
        items: EVENT_STATUS_OPTIONS.map(status => ({
          label: status.label,
          command: () => this.changeStatus(event, status.value)
        }))
      },
      { separator: true },
      {
        label: 'Eliminar',
        icon: 'pi pi-trash',
        styleClass: 'text-red-500',
        command: () => this.confirmDelete(event, clickEvent)
      }
    ];
    menu.toggle(clickEvent);
  }

  // ============ Helpers ============

  getEventTypeLabel = getEventTypeLabel;
  getEventStatusLabel = getEventStatusLabel;
  getEventStatusSeverity = getEventStatusSeverity;
  getSeverityLabel = getSeverityLabel;
  getSeveritySeverity = getSeveritySeverity;

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}
```

### Template: `eventos/eventos.html`

```html
<p-toast />
<p-confirmDialog />

<div class="eventos-container">
  <!-- Page Header -->
  <div class="page-header">
    <h1>Eventos</h1>
    <p class="page-subtitle">Gestión de Riesgos, Incidentes y Defectos</p>
  </div>

  <!-- Stats Cards -->
  <div class="stats-cards">
    <p-card styleClass="stat-card">
      <div class="stat-content">
        <span class="stat-value">{{ currentStats().total }}</span>
        <span class="stat-label">Total</span>
      </div>
    </p-card>
    <p-card styleClass="stat-card open">
      <div class="stat-content">
        <span class="stat-value">{{ currentStats().open }}</span>
        <span class="stat-label">Abiertos</span>
      </div>
    </p-card>
    <p-card styleClass="stat-card progress">
      <div class="stat-content">
        <span class="stat-value">{{ currentStats().inProgress }}</span>
        <span class="stat-label">En Progreso</span>
      </div>
    </p-card>
    <p-card styleClass="stat-card resolved">
      <div class="stat-content">
        <span class="stat-value">{{ currentStats().resolved }}</span>
        <span class="stat-label">Resueltos</span>
      </div>
    </p-card>
  </div>

  <!-- Tabs por tipo de evento -->
  <p-tabView [(activeIndex)]="activeTab">
    <p-tabPanel header="Riesgos" leftIcon="pi pi-exclamation-triangle">
      <ng-container *ngTemplateOutlet="eventTable"></ng-container>
    </p-tabPanel>
    <p-tabPanel header="Incidentes" leftIcon="pi pi-bolt">
      <ng-container *ngTemplateOutlet="eventTable"></ng-container>
    </p-tabPanel>
    <p-tabPanel header="Defectos" leftIcon="pi pi-bug">
      <ng-container *ngTemplateOutlet="eventTable"></ng-container>
    </p-tabPanel>
  </p-tabView>
</div>

<!-- Template de tabla reutilizable -->
<ng-template #eventTable>
  <p-card>
    <p-toolbar styleClass="mb-4">
      <ng-template #start>
        <span class="text-xl font-semibold">{{ getEventTypeLabel(currentEventType()) }}s</span>
      </ng-template>
      <ng-template #end>
        <p-button
          label="Nuevo"
          icon="pi pi-plus"
          (onClick)="navigateToCreate()"
        />
      </ng-template>
    </p-toolbar>

    @if (eventosService.loading()) {
      <div class="loading-container">
        <p-progressSpinner strokeWidth="4" />
        <span>Cargando eventos...</span>
      </div>
    }

    @if (!eventosService.loading() && filteredEvents().length === 0) {
      <div class="empty-state">
        <i class="pi pi-inbox empty-icon"></i>
        <h3>No hay eventos</h3>
        <p>Crea tu primer {{ getEventTypeLabel(currentEventType()).toLowerCase() }}</p>
        <p-button
          label="Crear Evento"
          icon="pi pi-plus"
          (onClick)="navigateToCreate()"
        />
      </div>
    }

    @if (!eventosService.loading() && filteredEvents().length > 0) {
      <p-table
        #dt
        [value]="filteredEvents()"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[5, 10, 25, 50]"
        [showCurrentPageReport]="true"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords}"
        [globalFilterFields]="['title', 'description']"
        styleClass="p-datatable-striped"
        [selectionMode]="'single'"
        (onRowSelect)="onRowSelect($event)"
      >
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="title">
              Título
              <p-sortIcon field="title" />
            </th>
            <th pSortableColumn="eventSubType.name">Subtipo</th>
            <th pSortableColumn="eventStatus">
              Estado
              <p-sortIcon field="eventStatus" />
            </th>
            <th pSortableColumn="initialSeverity">
              Severidad
              <p-sortIcon field="initialSeverity" />
            </th>
            <th pSortableColumn="initialDate">
              Fecha
              <p-sortIcon field="initialDate" />
            </th>
            <th style="width: 6rem">Acciones</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-event>
          <tr [pSelectableRow]="event" class="cursor-pointer">
            <td>
              <div class="event-title-cell">
                <span class="event-title">{{ event.title }}</span>
                @if (event.description) {
                  <span class="event-description">{{ event.description }}</span>
                }
              </div>
            </td>
            <td>
              @if (event.eventSubType) {
                <span class="subtype-badge">{{ event.eventSubType.name }}</span>
              } @else {
                <span class="text-muted">-</span>
              }
            </td>
            <td>
              <p-tag
                [value]="getEventStatusLabel(event.eventStatus)"
                [severity]="getEventStatusSeverity(event.eventStatus)"
              />
            </td>
            <td>
              @if (event.initialSeverity) {
                <p-tag
                  [value]="getSeverityLabel(event.initialSeverity)"
                  [severity]="getSeveritySeverity(event.initialSeverity)"
                  [rounded]="true"
                />
              } @else {
                <span class="text-muted">-</span>
              }
            </td>
            <td>
              <span class="date-text">{{ formatDate(event.initialDate) }}</span>
            </td>
            <td>
              <p-button
                icon="pi pi-ellipsis-v"
                [rounded]="true"
                [text]="true"
                (onClick)="showMenu(event, menu, $event)"
              />
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="footer">
          <tr class="table-footer">
            <td colspan="6">
              <div class="footer-summary">
                <span class="footer-label">Total:</span>
                <span class="footer-value">{{ filteredEvents().length }} eventos</span>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    }
  </p-card>
</ng-template>

<p-menu #menu [model]="menuItems" [popup]="true" appendTo="body" />
```

---

## 2. EventSubtiposComponent (Lista de Plantillas)

### Características principales:

- Lista todas las plantillas de eventos
- Filtrado por tipo de evento (RISK, INCIDENT, DEFECT)
- CRUD completo de plantillas
- Clonar plantilla existente
- Importar/Exportar JSON
- Establecer plantilla como default

### Template resumido:

```html
<div class="evento-subtipos-container">
  <div class="page-header">
    <h1>Plantillas de Eventos</h1>
    <p class="page-subtitle">Configura los tipos de eventos con campos personalizados</p>
  </div>

  <p-toolbar>
    <ng-template #start>
      <p-select
        [options]="eventTypeOptions"
        [(ngModel)]="selectedEventType"
        optionLabel="label"
        optionValue="value"
        placeholder="Filtrar por tipo"
      />
    </ng-template>
    <ng-template #end>
      <p-button label="Nueva Plantilla" icon="pi pi-plus" (onClick)="navigateToCreate()" />
    </ng-template>
  </p-toolbar>

  <p-table [value]="filteredSubTypes()">
    <!-- Columnas: Nombre, Tipo, Propiedades, Default, Estado, Acciones -->
  </p-table>
</div>
```

---

## 3. EventoSubtipoCrearComponent (Form Builder)

### Características principales:

- Wizard de 3 pasos:
  1. Información básica (nombre, código, descripción, tipo)
  2. Grupos de propiedades
  3. Propiedades con drag & drop

- Editor de propiedades:
  - Tipo de dato
  - Validaciones (requerido, readonly, oculto)
  - Valores por defecto
  - Opciones para selects
  - Lógica condicional
  - Fórmulas

### Estructura del componente:

```typescript
export class EventoSubtipoCrearComponent implements OnInit {
  // Modo edición
  isEditMode = signal(false);
  editingId = signal<string | null>(null);

  // Paso actual del wizard
  activeStep = signal(0);

  // Step 1: Info básica
  name = signal('');
  code = signal('');
  description = signal('');
  eventType = signal<EventType>(EventType.RISK);
  iconPath = signal('');
  color = signal('#10b981');

  // Step 2: Grupos
  propertyGroups = signal<EventSubTypePropertyGroup[]>([]);

  // Step 3: Propiedades
  properties = signal<EventSubTypeProperty[]>([]);

  // Propiedad seleccionada para editar
  selectedProperty = signal<EventSubTypeProperty | null>(null);
  showPropertyEditor = signal(false);

  // Validaciones
  isStep1Valid = computed(() =>
    this.name().trim().length > 0 &&
    this.code().trim().length > 0
  );

  isStep2Valid = computed(() => true); // Grupos son opcionales

  isStep3Valid = computed(() =>
    this.properties().every(p => p.name.trim().length > 0 && p.code.trim().length > 0)
  );

  canSave = computed(() =>
    this.isStep1Valid() && this.isStep2Valid() && this.isStep3Valid()
  );

  // Métodos
  addGroup(): void { ... }
  removeGroup(groupId: string): void { ... }
  addProperty(): void { ... }
  editProperty(property: EventSubTypeProperty): void { ... }
  removeProperty(propertyId: string): void { ... }
  onPropertyDrop(event: CdkDragDrop<EventSubTypeProperty[]>): void { ... }
  savePropertyEdit(): void { ... }
  async save(): Promise<void> { ... }
}
```

---

## 4. EventosCrearComponent (Crear/Editar Evento)

### Características:

- Formulario dinámico basado en el subtipo seleccionado
- Renderiza propiedades custom según su tipo de dato
- Validación de campos requeridos
- Selección de activos/procesos afectados

### Template resumido:

```html
<div class="eventos-crear-container">
  <div class="page-header">
    <h1>{{ isEditMode() ? 'Editar' : 'Nuevo' }} {{ getEventTypeLabel(eventType()) }}</h1>
  </div>

  <p-card>
    <form>
      <!-- Campos básicos -->
      <div class="field">
        <label>Título *</label>
        <input pInputText [(ngModel)]="title" />
      </div>

      <div class="field">
        <label>Descripción</label>
        <textarea pTextarea [(ngModel)]="description"></textarea>
      </div>

      <div class="field">
        <label>Subtipo</label>
        <p-select
          [options]="availableSubTypes()"
          [(ngModel)]="selectedSubTypeId"
          (ngModelChange)="onSubTypeChange($event)"
        />
      </div>

      <div class="field">
        <label>Estado</label>
        <p-select [options]="statusOptions" [(ngModel)]="status" />
      </div>

      <div class="field">
        <label>Severidad</label>
        <p-select [options]="severityOptions" [(ngModel)]="severity" />
      </div>

      <!-- Propiedades dinámicas del subtipo -->
      @if (selectedSubType()) {
        <p-divider />
        <h3>Campos Personalizados</h3>

        @for (property of selectedSubType()!.properties; track property.id) {
          <div class="field" [class.hidden]="property.isHidden">
            <label>
              {{ property.name }}
              @if (property.isRequired) { <span class="required">*</span> }
            </label>

            @switch (property.dataType) {
              @case ('TEXT') {
                <input pInputText [(ngModel)]="propertyValues()[property.id]" />
              }
              @case ('INTEGER') {
                <p-inputNumber [(ngModel)]="propertyValues()[property.id]" />
              }
              @case ('DECIMAL') {
                <p-inputNumber [(ngModel)]="propertyValues()[property.id]" mode="decimal" />
              }
              @case ('DATE') {
                <p-calendar [(ngModel)]="propertyValues()[property.id]" />
              }
              @case ('BOOLEAN') {
                <p-checkbox [(ngModel)]="propertyValues()[property.id]" [binary]="true" />
              }
            }
          </div>
        }
      }

      <!-- Acciones -->
      <div class="actions">
        <p-button label="Cancelar" severity="secondary" (onClick)="cancel()" />
        <p-button label="Guardar" icon="pi pi-check" (onClick)="save()" [disabled]="!isValid()" />
      </div>
    </form>
  </p-card>
</div>
```

---

## 5. Rutas

### Archivo: `app.routes.ts`

Agregar las siguientes rutas:

```typescript
// Eventos
{
  path: 'eventos',
  loadComponent: () => import('./pages/eventos/eventos').then(m => m.EventosComponent)
},
{
  path: 'eventos/crear',
  loadComponent: () => import('./pages/eventos-crear/eventos-crear').then(m => m.EventosCrearComponent)
},
{
  path: 'eventos/:id',
  loadComponent: () => import('./pages/eventos-detalle/eventos-detalle').then(m => m.EventosDetalleComponent)
},
{
  path: 'eventos/:id/editar',
  loadComponent: () => import('./pages/eventos-crear/eventos-crear').then(m => m.EventosCrearComponent)
},

// Subtipos de eventos (plantillas)
{
  path: 'evento-subtipos',
  loadComponent: () => import('./pages/evento-subtipos/evento-subtipos').then(m => m.EventoSubtiposComponent)
},
{
  path: 'evento-subtipos/crear',
  loadComponent: () => import('./pages/evento-subtipo-crear/evento-subtipo-crear').then(m => m.EventoSubtipoCrearComponent)
},
{
  path: 'evento-subtipos/:id/editar',
  loadComponent: () => import('./pages/evento-subtipo-crear/evento-subtipo-crear').then(m => m.EventoSubtipoCrearComponent)
},
```

---

## 6. Actualizar Sidebar

### Archivo: `components/sidebar/sidebar.ts`

Agregar entradas de menú:

```typescript
{
  label: 'Gestión de Eventos',
  icon: 'pi pi-exclamation-circle',
  items: [
    { label: 'Eventos', icon: 'pi pi-list', routerLink: '/eventos' },
    { label: 'Riesgos', icon: 'pi pi-exclamation-triangle', routerLink: '/eventos', queryParams: { tab: 0 } },
    { label: 'Incidentes', icon: 'pi pi-bolt', routerLink: '/eventos', queryParams: { tab: 1 } },
    { label: 'Defectos', icon: 'pi pi-bug', routerLink: '/eventos', queryParams: { tab: 2 } },
    { separator: true },
    { label: 'Plantillas', icon: 'pi pi-cog', routerLink: '/evento-subtipos' }
  ]
}
```
