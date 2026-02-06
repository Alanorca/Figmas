import { Component, signal, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { AccordionModule } from 'primeng/accordion';
import { MenuModule } from 'primeng/menu';
import { KnobModule } from 'primeng/knob';
import { Menu } from 'primeng/menu';
import { FormsModule } from '@angular/forms';
import { MessageService, MenuItem } from 'primeng/api';
import { DsPreviewComponent } from '../../../components/ds-preview/ds-preview.component';
import { DsCodeBlockComponent } from '../../../components/ds-code-block/ds-code-block.component';
import { DsCodeTabsComponent, CodeTab } from '../../../components/ds-code-tabs/ds-code-tabs.component';
import { DsPropsTableComponent, ComponentProp } from '../../../components/ds-props-table/ds-props-table.component';

// ============ Interfaces ============

interface LandingPage {
  title: string;
  date: string;
  status: string;
  image: string;
}

interface Project {
  name: string;
  description: string;
  status: string;
  timestamp: string;
  svgPath: string;
}

interface ProjectGroup {
  orgName: string;
  projects: Project[];
}

interface BrowserData {
  name: string;
  percentage: number;
  logo: string;
  opacity?: number;
}

interface Update {
  title: string;
  description: string;
  date: string;
}

interface TeamMember {
  name: string;
  role: string;
  avatar: string;
  isOnline: boolean;
  lastActive: string;
}

interface Invoice {
  company: string;
  dueDate: string;
  status: string;
  amount: string;
  currency: string;
}

interface App {
  name: string;
  logo: string;
  store: string;
  rating: number;
  reviews: string;
}

interface KpiItem {
  id: string;
  nombre: string;
  actual: number;
  meta: number;
  escala: string;
  umbralAlerta: number;
  direccion: 'mayor_mejor' | 'menor_mejor';
}

interface PersonaMini {
  id: string;
  nombre: string;
  email?: string;
  avatar?: string;
  rol?: string;
  completado?: boolean;
  aprobado?: boolean;
  rechazado?: boolean;
}

interface ModuloItem {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  habilitado: boolean;
  activo?: boolean;
  notificaciones?: number;
}

interface ObjetivoItem {
  id: string;
  nombre: string;
  descripcion?: string;
  tipo: 'estrategico' | 'operativo';
  progreso: number;
  selected?: boolean;
}

@Component({
  selector: 'app-ds-lists',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    AvatarModule,
    TagModule,
    BadgeModule,
    ToastModule,
    TooltipModule,
    CheckboxModule,
    AccordionModule,
    MenuModule,
    KnobModule,
    DsPreviewComponent,
    DsCodeBlockComponent,
    DsCodeTabsComponent,
    DsPropsTableComponent
  ],
  providers: [MessageService],
  templateUrl: './lists.component.html',
  styleUrl: './lists.component.scss'
})
export class ListsComponent {
  @ViewChildren(Menu) menus!: QueryList<Menu>;

  constructor(private messageService: MessageService) {}

  // ============ Collapsibles ============
  atomicDiagramOpen = signal(false);
  listsAccordion = signal<string | string[]>('0');

  // ============ Avatars with Links ============
  teamMembers = signal<TeamMember[]>([
    { name: 'Robert Fox', role: 'UI/UX Designer', avatar: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/stackedlist/robert.png', isOnline: true, lastActive: '' },
    { name: 'Theresa Webb', role: 'Scrum Master', avatar: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/stackedlist/theresa.png', isOnline: true, lastActive: '' },
    { name: 'Arlene McCoy', role: 'Software Development Manager', avatar: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/stackedlist/arlene.png', isOnline: false, lastActive: '2 hours ago' },
    { name: 'Jacob Jones', role: 'Software Developer', avatar: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/stackedlist/jacob.png', isOnline: false, lastActive: '7 hours ago' },
    { name: 'Jane Cooper', role: 'Team Leader', avatar: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/stackedlist/jane.png', isOnline: false, lastActive: '1 day ago' }
  ]);

  avatarsWithLinksProps: ComponentProp[] = [
    { name: 'name', type: 'string', required: true, description: 'Nombre del miembro del equipo' },
    { name: 'role', type: 'string', required: true, description: 'Rol o cargo del miembro' },
    { name: 'avatar', type: 'string', required: true, description: 'URL de la imagen de avatar' },
    { name: 'isOnline', type: 'boolean', required: true, description: 'Indica si el miembro está conectado' },
    { name: 'lastActive', type: 'string', description: 'Tiempo desde la última actividad (vacío si está online)' }
  ];

  avatarsWithLinksCodeTabs: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      icon: 'pi pi-code',
      code: `<div class="bg-surface-0 dark:bg-surface-900 p-6 shadow-sm rounded-2xl flex flex-col gap-8">
  <div class="font-medium text-xl text-surface-900 dark:text-surface-0 leading-tight">Team Members</div>

  <div class="flex flex-col gap-6">
    @for (member of teamMembers(); track member.name) {
      <div class="flex items-center gap-4">
        <div class="flex flex-1 items-center gap-4">
          <img [src]="member.avatar" class="w-[45px] h-[45px] rounded-full" />
          <div class="flex flex-col gap-2 flex-1">
            <div class="font-medium text-base text-surface-900 dark:text-surface-0">{{ member.name }}</div>
            <div class="text-sm text-surface-500 dark:text-surface-400">{{ member.role }}</div>
          </div>
        </div>
        <div class="flex flex-col items-end gap-2">
          <div class="text-sm font-medium text-surface-900 dark:text-surface-0">Last Active</div>
          @if (member.isOnline) {
            <div class="flex items-center gap-1">
              <span class="w-[7px] h-[7px] rounded-full bg-primary"></span>
              <span class="text-sm text-primary">Online</span>
            </div>
          }
          @if (!member.isOnline) {
            <div class="text-sm text-surface-500 dark:text-surface-400">{{ member.lastActive }}</div>
          }
        </div>
      </div>
    }
  </div>
</div>`
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      icon: 'pi pi-file',
      code: `interface TeamMember {
  name: string;
  role: string;
  avatar: string;
  isOnline: boolean;
  lastActive: string;
}

teamMembers = signal<TeamMember[]>([
  { name: 'Robert Fox', role: 'UI/UX Designer', avatar: '...', isOnline: true, lastActive: '' },
  { name: 'Theresa Webb', role: 'Scrum Master', avatar: '...', isOnline: true, lastActive: '' },
  { name: 'Arlene McCoy', role: 'Software Development Manager', avatar: '...', isOnline: false, lastActive: '2 hours ago' },
  { name: 'Jacob Jones', role: 'Software Developer', avatar: '...', isOnline: false, lastActive: '7 hours ago' },
  { name: 'Jane Cooper', role: 'Team Leader', avatar: '...', isOnline: false, lastActive: '1 day ago' }
]);`
    }
  ];

  // ============ KPI Items ============
  kpis = signal<KpiItem[]>([
    { id: '1', nombre: 'Indice de Satisfacción', actual: 85, meta: 100, escala: '%', umbralAlerta: 70, direccion: 'mayor_mejor' },
    { id: '2', nombre: 'Tiempo de Respuesta', actual: 2.5, meta: 5, escala: 'min', umbralAlerta: 80, direccion: 'menor_mejor' },
    { id: '3', nombre: 'Tasa de Conversión', actual: 12, meta: 20, escala: '%', umbralAlerta: 50, direccion: 'mayor_mejor' },
    { id: '4', nombre: 'Cumplimiento de SLA', actual: 92, meta: 95, escala: '%', umbralAlerta: 85, direccion: 'mayor_mejor' }
  ]);

  // ============ Persona Mini Items ============
  personas = signal<PersonaMini[]>([
    { id: '1', nombre: 'María García', email: 'maria.garcia@empresa.com', rol: 'Administrador', completado: true },
    { id: '2', nombre: 'Carlos López', email: 'carlos.lopez@empresa.com', rol: 'Analista', completado: false },
    { id: '3', nombre: 'Ana Martínez', email: 'ana.martinez@empresa.com', rol: 'Auditor', aprobado: true },
    { id: '4', nombre: 'Roberto Sánchez', email: 'roberto.sanchez@empresa.com', rol: 'Revisor', rechazado: true }
  ]);

  // ============ Modulo Items ============
  modulos = signal<ModuloItem[]>([
    { id: '1', nombre: 'Riesgos', descripcion: 'Gestión de riesgos operativos', icono: 'pi pi-exclamation-triangle', habilitado: true, activo: true, notificaciones: 3 },
    { id: '2', nombre: 'Cumplimiento', descripcion: 'Control de normativas', icono: 'pi pi-check-square', habilitado: true, activo: false, notificaciones: 0 },
    { id: '3', nombre: 'Incidentes', descripcion: 'Registro de incidentes', icono: 'pi pi-bolt', habilitado: true, activo: false, notificaciones: 5 },
    { id: '4', nombre: 'Auditorías', descripcion: 'Gestión de auditorías', icono: 'pi pi-file-check', habilitado: false, activo: false }
  ]);

  // ============ Objetivo Items ============
  objetivos = signal<ObjetivoItem[]>([
    { id: '1', nombre: 'Aumentar satisfacción del cliente', descripcion: 'Mejorar el NPS en un 20%', tipo: 'estrategico', progreso: 75, selected: true },
    { id: '2', nombre: 'Reducir tiempos de respuesta', descripcion: 'Optimizar procesos de atención', tipo: 'operativo', progreso: 45 },
    { id: '3', nombre: 'Implementar ISO 27001', descripcion: 'Certificación de seguridad', tipo: 'estrategico', progreso: 90 }
  ]);

  // ============ Props Tables ============
  kpiItemProps: ComponentProp[] = [
    { name: 'nombre', type: 'string', required: true, description: 'Nombre del indicador KPI' },
    { name: 'actual', type: 'number', required: true, description: 'Valor actual del KPI' },
    { name: 'meta', type: 'number', required: true, description: 'Valor objetivo/meta del KPI' },
    { name: 'escala', type: 'string', required: true, description: 'Unidad de medida (%, min, $, etc.)' },
    { name: 'umbralAlerta', type: 'number', description: 'Porcentaje mínimo antes de mostrar alerta' },
    { name: 'direccion', type: "'mayor_mejor' | 'menor_mejor'", description: 'Indica si valores mayores o menores son mejores' }
  ];

  personaMiniProps: ComponentProp[] = [
    { name: 'nombre', type: 'string', required: true, description: 'Nombre de la persona' },
    { name: 'email', type: 'string', description: 'Correo electrónico' },
    { name: 'avatar', type: 'string', description: 'URL de imagen o inicial para el avatar' },
    { name: 'rol', type: 'string', description: 'Rol o cargo de la persona' },
    { name: 'completado', type: 'boolean', description: 'Indica si completó la tarea asignada' },
    { name: 'aprobado/rechazado', type: 'boolean', description: 'Estado de aprobación' }
  ];

  moduloItemProps: ComponentProp[] = [
    { name: 'nombre', type: 'string', required: true, description: 'Nombre del módulo' },
    { name: 'descripcion', type: 'string', description: 'Descripción breve del módulo' },
    { name: 'icono', type: 'string', required: true, description: 'Clase de icono PrimeIcons (pi pi-*)' },
    { name: 'habilitado', type: 'boolean', required: true, description: 'Si el módulo está habilitado para uso' },
    { name: 'activo', type: 'boolean', description: 'Si está actualmente seleccionado/activo' },
    { name: 'notificaciones', type: 'number', description: 'Contador de notificaciones pendientes' }
  ];

  // ============ Helpers ============
  getKPIProgreso(kpi: KpiItem): number {
    const progreso = (kpi.actual / kpi.meta) * 100;
    return Math.min(Math.max(progreso, 0), 100);
  }

  getKPIProgresoColor(kpi: KpiItem): string {
    const progreso = this.getKPIProgreso(kpi);
    if (kpi.direccion === 'menor_mejor') {
      // Para "menor es mejor", invertir la lógica
      if (progreso <= 100) return 'success';
      if (progreso <= 120) return 'warn';
      return 'danger';
    }
    // Para "mayor es mejor"
    if (progreso >= 80) return 'success';
    if (progreso >= kpi.umbralAlerta) return 'warn';
    return 'danger';
  }

  tieneAlertaKPI(kpi: KpiItem): boolean {
    const progreso = this.getKPIProgreso(kpi);
    return progreso < kpi.umbralAlerta;
  }

  getProgresoColor(progreso: number): string {
    if (progreso >= 75) return 'success';
    if (progreso >= 50) return 'warn';
    return 'danger';
  }

  getPersonaAvatarStyle(persona: PersonaMini): Record<string, string> {
    if (persona.aprobado) {
      return { 'background-color': 'var(--green-100)', 'color': 'var(--green-600)' };
    }
    if (persona.rechazado) {
      return { 'background-color': 'var(--red-100)', 'color': 'var(--red-600)' };
    }
    if (persona.completado) {
      return { 'background-color': 'var(--green-100)', 'color': 'var(--green-600)' };
    }
    return { 'background-color': 'var(--yellow-100)', 'color': 'var(--yellow-600)' };
  }

  getPersonaStatusTag(persona: PersonaMini): { value: string; severity: 'success' | 'danger' | 'secondary' } {
    if (persona.aprobado) return { value: 'Aprobado', severity: 'success' };
    if (persona.rechazado) return { value: 'Rechazado', severity: 'danger' };
    if (persona.completado) return { value: 'Completado', severity: 'success' };
    return { value: 'Pendiente', severity: 'secondary' };
  }

  // ============ Actions ============
  selectModulo(modulo: ModuloItem): void {
    if (!modulo.habilitado) return;
    this.modulos.update(list =>
      list.map(m => ({ ...m, activo: m.id === modulo.id }))
    );
    this.messageService.add({
      severity: 'info',
      summary: 'Módulo seleccionado',
      detail: modulo.nombre
    });
  }

  toggleModuloHabilitado(modulo: ModuloItem): void {
    this.modulos.update(list =>
      list.map(m => m.id === modulo.id ? { ...m, habilitado: !m.habilitado } : m)
    );
  }

  selectObjetivo(objetivo: ObjetivoItem): void {
    this.objetivos.update(list =>
      list.map(o => ({ ...o, selected: o.id === objetivo.id }))
    );
  }

  // ============ Code Examples ============
  kpiItemCode = `<!-- KPI Item - Estructura Atómica -->
<div class="kpi-item" [class.has-alert]="tieneAlertaKPI(kpi)">
  <div class="kpi-info">
    <div class="kpi-nombre-row">
      <span class="kpi-nombre">{{ kpi.nombre }}</span>
      <span class="kpi-direccion-tag" [class]="kpi.direccion">
        <i [class]="kpi.direccion === 'mayor_mejor' ? 'pi pi-arrow-up' : 'pi pi-arrow-down'"></i>
        {{ getDireccionLabel(kpi.direccion) }}
      </span>
      @if (tieneAlertaKPI(kpi)) {
        <span class="kpi-alert-badge">
          <i class="pi pi-exclamation-triangle"></i>
          Alerta
        </span>
      }
    </div>
    <div class="kpi-progress">
      <div class="progress-bar">
        <div class="progress-fill"
             [class]="getProgresoColor(getKPIProgreso(kpi))"
             [style.width.%]="getKPIProgreso(kpi)">
        </div>
      </div>
      <span class="progress-text">
        {{ kpi.actual }}/{{ kpi.meta }} {{ kpi.escala }}
      </span>
    </div>
  </div>
  <div class="kpi-actions">
    <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" />
    <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" />
  </div>
</div>`;

  personaMiniCode = `<!-- Persona Mini - Composición de Átomos -->
<div class="persona-mini" [class.persona-con-menu]="showMenu">
  <!-- Átomo: Avatar -->
  <p-avatar
    [label]="persona.nombre.charAt(0)"
    shape="circle"
    size="normal"
    [style]="getPersonaAvatarStyle(persona)"
  />

  <!-- Molécula: Info Container -->
  <div class="persona-mini-info">
    <span class="persona-mini-nombre">{{ persona.nombre }}</span>
    @if (persona.email) {
      <span class="persona-mini-email">{{ persona.email }}</span>
    }
  </div>

  <!-- Átomo: Status Tag (opcional) -->
  @if (showStatus) {
    <p-tag
      [value]="getPersonaStatusTag(persona).value"
      [severity]="getPersonaStatusTag(persona).severity"
    />
  }

  <!-- Átomo: Menu Button (opcional) -->
  @if (showMenu) {
    <p-button
      icon="pi pi-ellipsis-v"
      [rounded]="true"
      [text]="true"
      size="small"
      severity="secondary"
    />
  }
</div>`;

  moduloItemCode = `<!-- Modulo Item - Lista Seleccionable -->
<div
  class="modulo-item"
  [class.active]="modulo.activo"
  [class.habilitado]="modulo.habilitado"
  [class.disabled]="!modulo.habilitado"
  (click)="selectModulo(modulo)"
>
  <!-- Átomo: Icon Container -->
  <div class="modulo-icon">
    <i [class]="modulo.icono"></i>
  </div>

  <!-- Molécula: Info Container -->
  <div class="modulo-info">
    <span class="modulo-nombre">{{ modulo.nombre }}</span>
    <span class="modulo-descripcion">{{ modulo.descripcion }}</span>
  </div>

  <!-- Átomo: Badge de Notificaciones -->
  @if (modulo.notificaciones > 0) {
    <p-badge [value]="modulo.notificaciones.toString()" severity="danger" />
  }

  <!-- Átomo: Toggle Switch -->
  <p-checkbox
    [(ngModel)]="modulo.habilitado"
    [binary]="true"
    (onClick)="$event.stopPropagation()"
  />
</div>`;

  objetivoItemCode = `<!-- Objetivo Item - Lista Master-Detail -->
<div
  class="objetivo-item"
  [class.selected]="objetivo.selected"
  (click)="selectObjetivo(objetivo)"
>
  <div class="objetivo-header">
    <span class="objetivo-nombre">{{ objetivo.nombre }}</span>
    <span class="objetivo-tipo" [class]="objetivo.tipo">
      {{ objetivo.tipo === 'estrategico' ? 'Estratégico' : 'Operativo' }}
    </span>
  </div>

  @if (objetivo.descripcion) {
    <p class="objetivo-descripcion">{{ objetivo.descripcion }}</p>
  }

  <div class="objetivo-progress">
    <div class="progress-bar">
      <div class="progress-fill"
           [class]="getProgresoColor(objetivo.progreso)"
           [style.width.%]="objetivo.progreso">
      </div>
    </div>
    <span class="progress-value">{{ objetivo.progreso }}%</span>
  </div>
</div>`;

  atomicDesignCode = `// Principios de Composición Atómica para Listas

// 1. ÁTOMOS - Componentes básicos reutilizables
// - Avatar (p-avatar)
// - Badge (p-badge)
// - Tag (p-tag)
// - Icon (i.pi-*)
// - Button (p-button)
// - Progress Bar (.progress-bar + .progress-fill)

// 2. MOLÉCULAS - Combinación de átomos con propósito específico
// - persona-mini-info: Avatar + Nombre + Email
// - kpi-info: Nombre + Progress + Value
// - modulo-info: Icon + Nombre + Descripción

// 3. ORGANISMOS - Estructuras completas de lista
// - kpi-item: kpi-info + actions + alert-badge
// - persona-mini: avatar + info + status + menu
// - modulo-item: icon + info + badge + toggle
// - objetivo-item: header + descripcion + progress

// 4. REGLAS DE COMPOSICIÓN
interface ListItemStructure {
  // Zona izquierda: Identificador visual
  leadingElement: 'avatar' | 'icon' | 'checkbox';

  // Zona central: Contenido principal
  content: {
    primary: string;    // Siempre presente
    secondary?: string; // Descripción o subtítulo
    metadata?: string;  // Info adicional (fecha, estado)
  };

  // Zona derecha: Acciones o indicadores
  trailingElements: ('badge' | 'tag' | 'button' | 'toggle' | 'chevron')[];
}`;

  // ============ Images Tags and Actions with Search ============
  searchTerm = '';

  landingPages = signal<LandingPage[]>([
    { title: 'Portal to Eternity', date: 'November 17, 2025', status: 'published', image: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/stackedlist/stacked-item-1.jpg' },
    { title: 'Pathway Beyond The Cube', date: 'October 28, 2025', status: 'published', image: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/stackedlist/stacked-item-2.jpg' },
    { title: 'Gateway to Infinity', date: 'December 5, 2025', status: 'draft', image: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/stackedlist/stacked-item-3.jpg' }
  ]);

  getLandingPageTagSeverity(status: string): 'success' | 'secondary' {
    return status === 'published' ? 'success' : 'secondary';
  }

  imagesTagsSearchProps: ComponentProp[] = [
    { name: 'title', type: 'string', required: true, description: 'Titulo de la landing page' },
    { name: 'date', type: 'string', required: true, description: 'Fecha de creacion o publicacion' },
    { name: 'status', type: "'published' | 'draft'", required: true, description: 'Estado de la landing page' },
    { name: 'image', type: 'string', required: true, description: 'URL de la imagen de preview' }
  ];

  imagesTagsSearchCodeTabs: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      icon: 'pi pi-code',
      code: `<div class="p-8 bg-surface-0 dark:bg-surface-950 rounded-2xl shadow-md">
  <!-- Search Bar -->
  <div class="border border-surface-200 dark:border-surface-700 rounded-xl flex items-center w-full overflow-hidden">
    <div class="flex-1 p-3 flex items-center gap-2 border-r border-surface-200 dark:border-surface-700">
      <i class="pi pi-search text-surface-400"></i>
      <input class="flex-1 bg-transparent outline-hidden placeholder:text-surface-400"
             placeholder="Search" [(ngModel)]="searchTerm" />
    </div>
    <button class="flex items-center gap-2 p-3 text-surface-500 border-r border-surface-200 dark:border-surface-700">
      <i class="pi pi-filter"></i>
      <span>Filter</span>
    </button>
    <button class="flex items-center gap-2 p-3 text-surface-500">
      <span>Sort</span>
      <i class="pi pi-chevron-down"></i>
    </button>
  </div>

  <!-- Results -->
  <div class="mt-8">
    <div class="text-lg font-medium text-surface-900 dark:text-surface-0">
      Displaying {{ landingPages().length }} Landing Pages
    </div>
    <div class="mt-6 flex flex-col gap-6">
      @for (item of landingPages(); track item.title) {
        <div class="flex items-start sm:flex-row flex-col gap-6">
          <div class="w-full sm:w-32 aspect-video sm:aspect-auto sm:h-20 rounded-xl overflow-hidden">
            <img class="w-full h-full object-cover" [src]="item.image" />
          </div>
          <div class="sm:flex-1 w-full flex items-start justify-between gap-6">
            <div class="flex-1">
              <div class="flex items-center gap-4">
                <h4 class="text-lg font-semibold text-surface-900 dark:text-surface-0">{{ item.title }}</h4>
                <i class="pi pi-link text-surface-400"></i>
              </div>
              <p class="mt-2 text-base text-surface-500 dark:text-surface-400">{{ item.date }}</p>
            </div>
            <p-tag [severity]="item.status === 'published' ? 'success' : 'secondary'" [value]="item.status === 'published' ? 'Published' : 'Draft'" />
          </div>
        </div>
      }
    </div>
  </div>
</div>`
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      icon: 'pi pi-file',
      code: `interface LandingPage {
  title: string;
  date: string;
  status: string;
  image: string;
}

searchTerm = '';

landingPages = signal<LandingPage[]>([
  { title: 'Portal to Eternity', date: 'November 17, 2025', status: 'published', image: '...' },
  { title: 'Pathway Beyond The Cube', date: 'October 28, 2025', status: 'published', image: '...' },
  { title: 'Gateway to Infinity', date: 'December 5, 2025', status: 'draft', image: '...' }
]);`
    }
  ];

  // ============ Image Meta and Rating ============
  apps = signal<App[]>([
    { name: '1Password', logo: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/render/image/public/block.images/blocks/logos/logo-pwd.png', store: 'App Store', rating: 5, reviews: '10K' },
    { name: 'Evernote', logo: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/render/image/public/block.images/blocks/logos/logo-evernote.png', store: 'App Store', rating: 5, reviews: '2K' },
    { name: 'Dropbox', logo: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/render/image/public/block.images/blocks/logos/logo-dropbox.png', store: 'Microsoft Store', rating: 4, reviews: '3K' },
    { name: 'Slack', logo: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/render/image/public/block.images/blocks/logos/logo-slack.png', store: 'Microsoft Store', rating: 2, reviews: '5K' },
    { name: 'Spotify', logo: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/render/image/public/block.images/blocks/logos/logo-spotify.png', store: 'Play Store', rating: 3, reviews: '5K' }
  ]);

  getRatingArray(rating: number): number[] {
    return Array.from({ length: rating }, (_, i) => i + 1);
  }

  imageMetaRatingProps: ComponentProp[] = [
    { name: 'name', type: 'string', required: true, description: 'Nombre de la aplicacion' },
    { name: 'logo', type: 'string', required: true, description: 'URL del logo de la aplicacion' },
    { name: 'store', type: 'string', required: true, description: 'Tienda donde esta disponible (App Store, Play Store, etc.)' },
    { name: 'rating', type: 'number', required: true, description: 'Calificacion en estrellas (1-5)' },
    { name: 'reviews', type: 'string', required: true, description: 'Cantidad de reviews formateada (ej: 10K)' }
  ];

  imageMetaRatingCodeTabs: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      icon: 'pi pi-code',
      code: `<div class="bg-surface-0 dark:bg-surface-900 p-6 shadow-sm rounded-2xl flex flex-col gap-8">
  <div class="text-xl font-medium text-surface-900 dark:text-surface-0 leading-tight">Top Downloads</div>

  <div class="flex flex-col gap-6">
    @for (app of apps(); track app.name) {
      <div class="flex items-center gap-4">
        <div class="p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl">
          <img [src]="app.logo" class="w-[30px] h-[30px]" />
        </div>
        <div class="flex-1 flex flex-col gap-2">
          <div class="text-xl font-medium text-surface-900 dark:text-surface-0 leading-tight">{{ app.name }}</div>
          <div class="text-base text-zinc-500 dark:text-zinc-400 leading-tight">{{ app.store }}</div>
        </div>
        <div class="flex flex-col items-end gap-2">
          <div class="flex text-green-500 gap-1">
            @for (n of getRatingArray(app.rating); track n) {
              <i class="pi pi-star-fill"></i>
            }
          </div>
          <div class="text-sm text-zinc-500 dark:text-zinc-400">{{ app.reviews }} Reviews</div>
        </div>
      </div>
    }
  </div>
</div>`
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      icon: 'pi pi-file',
      code: `interface App {
  name: string;
  logo: string;
  store: string;
  rating: number;
  reviews: string;
}

apps = signal<App[]>([
  { name: '1Password', logo: '...', store: 'App Store', rating: 5, reviews: '10K' },
  { name: 'Evernote', logo: '...', store: 'App Store', rating: 5, reviews: '2K' },
  { name: 'Dropbox', logo: '...', store: 'Microsoft Store', rating: 4, reviews: '3K' },
  { name: 'Slack', logo: '...', store: 'Microsoft Store', rating: 2, reviews: '5K' },
  { name: 'Spotify', logo: '...', store: 'Play Store', rating: 3, reviews: '5K' }
]);

getRatingArray(rating: number): number[] {
  return Array.from({ length: rating }, (_, i) => i + 1);
}`
    }
  ];

  // ============ With Filters (Projects) ============
  projectSearchTerm = '';

  projectGroups = signal<ProjectGroup[]>([
    {
      orgName: 'Mistranet',
      projects: [
        { name: 'budget-tracker', description: 'Tool for tracking budgets.', status: 'Deployed', timestamp: '1 hour ago', svgPath: 'M11.2217 0C9.41656 0 7.68544 0.71707 6.40905 1.99346L2.24348 6.159C0.967076 7.4354 0.25 9.16657 0.25 10.9717C0.25 12.9634 1.10555 14.7554 2.46921 16C1.10555 17.2446 0.25 19.0366 0.25 21.0283C0.25 22.8334 0.967075 24.5646 2.24348 25.841L6.40905 30.0066C7.68544 31.283 9.41656 32 11.2217 32C13.2134 32 15.0054 31.1445 16.25 29.7808C17.4946 31.1445 19.2866 32 21.2783 32C23.0834 32 24.8146 31.283 26.091 30.0066L30.2565 25.841C31.5329 24.5646 32.25 22.8334 32.25 21.0283C32.25 19.0366 31.3945 17.2446 30.0308 16C31.3945 14.7554 32.25 12.9634 32.25 10.9717C32.25 9.16657 31.5329 7.4354 30.2565 6.159L26.091 1.99346C24.8146 0.71707 23.0834 0 21.2783 0C19.2866 0 17.4946 0.85555 16.25 2.21921C15.0054 0.85555 13.2134 0 11.2217 0ZM20.6313 16.2157C20.7498 16.0971 20.7498 15.9028 20.6313 15.7843L18.3713 13.5244C17.1997 12.3528 15.3003 12.3528 14.1287 13.5244L11.8687 15.7843C11.7502 15.9028 11.7502 16.0971 11.8687 16.2157L14.1287 18.4756C15.3003 19.6472 17.1997 19.6472 18.3713 18.4756L20.6313 16.2157ZM18.9798 22.8955C18.3702 23.5051 18.0278 24.3318 18.0278 25.1939C18.0278 26.9891 19.4831 28.4445 21.2783 28.4445C22.1404 28.4445 22.9672 28.102 23.5768 27.4924L27.7424 23.3268C28.352 22.7172 28.6945 21.8904 28.6945 21.0283C28.6945 19.2331 27.2391 17.7778 25.4439 17.7778C24.5818 17.7778 23.755 18.1202 23.1454 18.7298L18.9798 22.8955ZM14.4722 25.1939C14.4722 24.3318 14.1298 23.5051 13.5202 22.8955L9.35456 18.7298C8.74496 18.1202 7.91819 17.7778 7.0561 17.7778C5.26087 17.7778 3.80555 19.2331 3.80555 21.0283C3.80555 21.8904 4.14801 22.7172 4.7576 23.3268L8.9232 27.4924C9.5328 28.102 10.3596 28.4445 11.2217 28.4445C13.0169 28.4445 14.4722 26.9891 14.4722 25.1939ZM14.4722 6.8061C14.4722 7.66817 14.1298 8.49493 13.5202 9.1045L9.35456 13.2702C8.74496 13.8798 7.91819 14.2222 7.0561 14.2222C5.26087 14.2222 3.80555 12.7669 3.80555 10.9717C3.80555 10.1096 4.14801 9.28281 4.7576 8.67322L8.9232 4.50762C9.5328 3.89802 10.3596 3.55556 11.2217 3.55556C13.0169 3.55556 14.4722 5.01087 14.4722 6.8061ZM23.1454 13.2702L18.9798 9.10451C18.3702 8.49493 18.0278 7.66817 18.0278 6.8061C18.0278 5.01087 19.4831 3.55556 21.2783 3.55556C22.1404 3.55556 22.9672 3.89802 23.5768 4.50762L27.7424 8.67323C28.352 9.28281 28.6945 10.1096 28.6945 10.9717C28.6945 12.7669 27.2391 14.2222 25.4439 14.2222C24.5818 14.2222 23.755 13.8798 23.1454 13.2702Z' }
      ]
    },
    {
      orgName: 'Trimzales',
      projects: [
        { name: 'investment-dashboard', description: 'Advanced dashboard to monitor and analyze.', status: 'In Progress', timestamp: '30 minutes ago', svgPath: 'M7.09219 2.87829C5.94766 3.67858 4.9127 4.62478 4.01426 5.68992C7.6857 5.34906 12.3501 5.90564 17.7655 8.61335C23.5484 11.5047 28.205 11.6025 31.4458 10.9773C31.1517 10.087 30.7815 9.23135 30.343 8.41791C26.6332 8.80919 21.8772 8.29127 16.3345 5.51998C12.8148 3.76014 9.71221 3.03521 7.09219 2.87829ZM28.1759 5.33332C25.2462 2.06 20.9887 0 16.25 0C14.8584 0 13.5081 0.177686 12.2209 0.511584C13.9643 0.987269 15.8163 1.68319 17.7655 2.65781C21.8236 4.68682 25.3271 5.34013 28.1759 5.33332ZM32.1387 14.1025C28.2235 14.8756 22.817 14.7168 16.3345 11.4755C10.274 8.44527 5.45035 8.48343 2.19712 9.20639C2.0292 9.24367 1.86523 9.28287 1.70522 9.32367C1.2793 10.25 0.939308 11.2241 0.695362 12.2356C0.955909 12.166 1.22514 12.0998 1.50293 12.0381C5.44966 11.161 11.0261 11.1991 17.7655 14.5689C23.8261 17.5991 28.6497 17.561 31.9029 16.838C32.0144 16.8133 32.1242 16.7877 32.2322 16.7613C32.2441 16.509 32.25 16.2552 32.25 16C32.25 15.358 32.2122 14.7248 32.1387 14.1025ZM31.7098 20.1378C27.8326 20.8157 22.5836 20.5555 16.3345 17.431C10.274 14.4008 5.45035 14.439 2.19712 15.1619C1.475 15.3223 0.825392 15.5178 0.252344 15.7241C0.250782 15.8158 0.25 15.9078 0.25 16C0.25 24.8366 7.41344 32 16.25 32C23.6557 32 29.8862 26.9687 31.7098 20.1378Z' },
        { name: 'loan-calculator', description: 'Tool for calculating loan repayment plans.', status: 'In Progress', timestamp: '2 hours ago', svgPath: 'M7.09219 2.87829C5.94766 3.67858 4.9127 4.62478 4.01426 5.68992C7.6857 5.34906 12.3501 5.90564 17.7655 8.61335C23.5484 11.5047 28.205 11.6025 31.4458 10.9773C31.1517 10.087 30.7815 9.23135 30.343 8.41791C26.6332 8.80919 21.8772 8.29127 16.3345 5.51998C12.8148 3.76014 9.71221 3.03521 7.09219 2.87829ZM28.1759 5.33332C25.2462 2.06 20.9887 0 16.25 0C14.8584 0 13.5081 0.177686 12.2209 0.511584C13.9643 0.987269 15.8163 1.68319 17.7655 2.65781C21.8236 4.68682 25.3271 5.34013 28.1759 5.33332ZM32.1387 14.1025C28.2235 14.8756 22.817 14.7168 16.3345 11.4755C10.274 8.44527 5.45035 8.48343 2.19712 9.20639C2.0292 9.24367 1.86523 9.28287 1.70522 9.32367C1.2793 10.25 0.939308 11.2241 0.695362 12.2356C0.955909 12.166 1.22514 12.0998 1.50293 12.0381C5.44966 11.161 11.0261 11.1991 17.7655 14.5689C23.8261 17.5991 28.6497 17.561 31.9029 16.838C32.0144 16.8133 32.1242 16.7877 32.2322 16.7613C32.2441 16.509 32.25 16.2552 32.25 16C32.25 15.358 32.2122 14.7248 32.1387 14.1025ZM31.7098 20.1378C27.8326 20.8157 22.5836 20.5555 16.3345 17.431C10.274 14.4008 5.45035 14.439 2.19712 15.1619C1.475 15.3223 0.825392 15.5178 0.252344 15.7241C0.250782 15.8158 0.25 15.9078 0.25 16C0.25 24.8366 7.41344 32 16.25 32C23.6557 32 29.8862 26.9687 31.7098 20.1378Z' }
      ]
    },
    {
      orgName: 'Limerantz',
      projects: [
        { name: 'payment-integration-api', description: 'API for integrating secure payment gateways.', status: 'Released', timestamp: '1 day ago', svgPath: 'M8.25 0C12.6682 0 16.25 3.58172 16.25 8V2C16.25 0.895431 17.1454 0 18.25 0H24.25C28.6682 0 32.25 3.58172 32.25 8C32.25 12.4182 28.6682 16 24.25 16C28.6682 16 32.25 19.5818 32.25 24C32.25 26.1938 31.3669 28.1814 29.9368 29.6267L29.9069 29.6569L29.8803 29.6833C28.4347 31.1154 26.4457 32 24.25 32C22.0693 32 20.0923 31.1274 18.6492 29.7124C18.6305 29.694 18.6118 29.6754 18.5931 29.6569C18.5756 29.6394 18.5582 29.6218 18.5408 29.6041C17.1239 28.1607 16.25 26.1824 16.25 24C16.25 28.4182 12.6682 32 8.25 32C3.83172 32 0.25 28.4182 0.25 24V18C0.25 16.8954 1.14543 16 2.25 16H8.25C3.83172 16 0.25 12.4182 0.25 8C0.25 3.58172 3.83172 0 8.25 0ZM14.65 8C14.65 11.5346 11.7846 14.4 8.25 14.4V1.6C11.7846 1.6 14.65 4.46538 14.65 8ZM30.65 24C30.65 20.4654 27.7846 17.6 24.25 17.6C20.7154 17.6 17.85 20.4654 17.85 24H30.65ZM2.35 17.6C2.07386 17.6 1.85 17.8239 1.85 18.1V24C1.85 27.5346 4.71538 30.4 8.25 30.4C11.7846 30.4 14.65 27.5346 14.65 24V17.6H2.35ZM17.85 14.4V2.1C17.85 1.82386 18.0739 1.6 18.35 1.6H24.25C27.7846 1.6 30.65 4.46538 30.65 8C30.65 11.5346 27.7846 14.4 24.25 14.4H17.85Z' }
      ]
    }
  ]);

  projectMenuItems = signal<MenuItem[]>([
    { label: 'View Details', icon: 'pi pi-eye' },
    { label: 'Edit Project', icon: 'pi pi-pencil' },
    { label: 'Deploy', icon: 'pi pi-cloud-upload' },
    { separator: true },
    { label: 'Share', icon: 'pi pi-share-alt' },
    { label: 'Clone', icon: 'pi pi-copy' },
    { separator: true },
    { label: 'Archive', icon: 'pi pi-inbox' },
    { label: 'Delete', icon: 'pi pi-trash', styleClass: 'text-red-500' }
  ]);

  getMenuIndex(groupIndex: number, projectIndex: number): number {
    let totalIndex = 0;
    for (let i = 0; i < groupIndex; i++) {
      totalIndex += this.projectGroups()[i].projects.length;
    }
    return totalIndex + projectIndex;
  }

  toggleMenu(event: Event, index: number): void {
    const menuArray = this.menus.toArray();
    if (menuArray[index]) {
      menuArray[index].toggle(event);
    }
  }

  withFiltersProps: ComponentProp[] = [
    { name: 'name', type: 'string', required: true, description: 'Nombre del proyecto' },
    { name: 'description', type: 'string', required: true, description: 'Descripcion breve del proyecto' },
    { name: 'status', type: 'string', required: true, description: 'Estado del proyecto (Deployed, In Progress, Released)' },
    { name: 'timestamp', type: 'string', required: true, description: 'Tiempo transcurrido desde la ultima actualizacion' },
    { name: 'svgPath', type: 'string', required: true, description: 'Path SVG del icono del proyecto' }
  ];

  withFiltersCodeTabs: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      icon: 'pi pi-code',
      code: `<div>
  <!-- Search Bar -->
  <div class="border border-surface-200 dark:border-surface-700 rounded-xl flex items-center w-full overflow-hidden">
    <div class="flex-1 p-3 flex items-center gap-2 border-r border-surface-200 dark:border-surface-700">
      <i class="pi pi-search text-surface-400"></i>
      <input class="flex-1 bg-transparent outline-hidden" placeholder="Search" [(ngModel)]="searchTerm" />
    </div>
    <button class="flex items-center gap-2 p-3 text-surface-500 border-r border-surface-200 dark:border-surface-700">
      <i class="pi pi-filter"></i><span>Filter</span>
    </button>
    <button class="flex items-center gap-2 p-3 text-surface-500">
      <span>Sort</span><i class="pi pi-chevron-down"></i>
    </button>
  </div>

  <!-- Grouped Projects -->
  <div class="mt-8 flex flex-col gap-8">
    @for (group of projectGroups(); track group.orgName; let groupIndex = \\$index) {
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <i class="pi pi-github text-surface-900 dark:text-surface-0"></i>
          <span class="text-base font-medium text-surface-900 dark:text-surface-0">{{ group.orgName }}</span>
        </div>
        @for (project of group.projects; track project.name; let projectIndex = \\$index) {
          <div class="border border-surface-200 dark:border-surface-700 rounded-2xl p-4 bg-surface-0 dark:bg-surface-950">
            <div class="flex items-center gap-4 w-full">
              <div class="p-4 bg-surface-100 dark:bg-surface-800 rounded-xl">
                <svg width="33" height="32" viewBox="0 0 33 32" fill="none">
                  <path [attr.d]="project.svgPath" class="fill-surface-700 dark:fill-surface-200" />
                </svg>
              </div>
              <div class="flex-1">
                <h5 class="text-base font-medium text-surface-900 dark:text-surface-0">{{ project.name }}</h5>
                <p class="text-base text-surface-500 dark:text-surface-400">{{ project.description }}</p>
              </div>
              <div>
                <div class="text-base font-medium text-surface-900 dark:text-surface-0">{{ project.status }}</div>
                <div class="text-sm text-surface-500 dark:text-surface-400">{{ project.timestamp }}</div>
              </div>
              <button pButton text severity="secondary" (click)="toggleMenu(\\$event, getMenuIndex(groupIndex, projectIndex))">
                <i class="pi pi-ellipsis-v"></i>
              </button>
              <p-menu [popup]="true" [model]="projectMenuItems()" appendTo="body" />
            </div>
          </div>
        }
      </div>
    }
  </div>
</div>`
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      icon: 'pi pi-file',
      code: `interface Project {
  name: string;
  description: string;
  status: string;
  timestamp: string;
  svgPath: string;
}

interface ProjectGroup {
  orgName: string;
  projects: Project[];
}

@ViewChildren(Menu) menus!: QueryList<Menu>;

projectGroups = signal<ProjectGroup[]>([
  { orgName: 'Mistranet', projects: [{ name: 'budget-tracker', description: '...', status: 'Deployed', timestamp: '1 hour ago', svgPath: '...' }] },
  { orgName: 'Trimzales', projects: [{ name: 'investment-dashboard', ... }, { name: 'loan-calculator', ... }] },
  { orgName: 'Limerantz', projects: [{ name: 'payment-integration-api', ... }] }
]);

projectMenuItems = signal<MenuItem[]>([
  { label: 'View Details', icon: 'pi pi-eye' },
  { label: 'Edit Project', icon: 'pi pi-pencil' },
  { label: 'Deploy', icon: 'pi pi-cloud-upload' },
  { separator: true },
  { label: 'Share', icon: 'pi pi-share-alt' },
  { label: 'Clone', icon: 'pi pi-copy' },
  { separator: true },
  { label: 'Archive', icon: 'pi pi-inbox' },
  { label: 'Delete', icon: 'pi pi-trash' }
]);

getMenuIndex(groupIndex: number, projectIndex: number): number {
  let totalIndex = 0;
  for (let i = 0; i < groupIndex; i++) {
    totalIndex += this.projectGroups()[i].projects.length;
  }
  return totalIndex + projectIndex;
}

toggleMenu(event: Event, index: number): void {
  const menuArray = this.menus.toArray();
  if (menuArray[index]) {
    menuArray[index].toggle(event);
  }
}`
    }
  ];

  // ============ Colored Rows (Invoices) ============
  invoices = signal<Invoice[]>([
    { company: 'TechSolutions Ltd.', dueDate: '20/02/2026', status: 'PAID', amount: '1,250.00', currency: 'EUR' },
    { company: 'CloudInnovate Inc.', dueDate: '22/02/2026', status: 'PAID', amount: '890.00', currency: 'EUR' },
    { company: 'DateSync Systems', dueDate: '18/02/2026', status: 'PAID', amount: '1,500.00', currency: 'EUR' },
    { company: 'AIStream Co.', dueDate: '24/01/2026', status: 'PENDING', amount: '750.00', currency: 'EUR' }
  ]);

  getStatusColorClass(status: string): string {
    switch (status) {
      case 'PAID': return 'bg-green-500';
      case 'PENDING': return 'bg-amber-500';
      case 'UNPAID': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  }

  getTagSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (status) {
      case 'PAID': return 'success';
      case 'PENDING': return 'warn';
      case 'UNPAID': return 'danger';
      default: return 'info';
    }
  }

  coloredRowsProps: ComponentProp[] = [
    { name: 'company', type: 'string', required: true, description: 'Nombre de la empresa' },
    { name: 'dueDate', type: 'string', required: true, description: 'Fecha de vencimiento de la factura' },
    { name: 'status', type: "'PAID' | 'PENDING' | 'UNPAID'", required: true, description: 'Estado de la factura' },
    { name: 'amount', type: 'string', required: true, description: 'Monto de la factura formateado' },
    { name: 'currency', type: 'string', required: true, description: 'Moneda (EUR, USD, etc.)' }
  ];

  coloredRowsCodeTabs: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      icon: 'pi pi-code',
      code: `<div class="bg-surface-0 dark:bg-surface-900 p-6 shadow-sm rounded-2xl flex flex-col gap-8">
  <div class="text-xl font-medium text-surface-900 dark:text-surface-0">Recent Invoices</div>

  <div class="flex flex-col gap-4">
    @for (invoice of invoices(); track invoice.company) {
      <div class="flex items-center overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
        <div class="sm:block hidden w-3.5 h-[75px]" [class]="getStatusColorClass(invoice.status)"></div>
        <div class="flex flex-1 sm:items-center justify-between p-4 gap-4">
          <div class="flex flex-col gap-2">
            <div class="text-xl font-medium text-surface-900 dark:text-surface-0">{{ invoice.company }}</div>
            <div class="text-base text-zinc-500 dark:text-zinc-400">Due {{ invoice.dueDate }}</div>
          </div>
          <div class="flex sm:flex-row flex-col sm:items-center gap-4">
            <p-tag [severity]="getTagSeverity(invoice.status)" [value]="invoice.status" />
            <div class="flex sm:flex-col items-end gap-2 sm:gap-1 w-[98px]">
              <div class="font-bold text-base text-surface-900 dark:text-surface-0">{{ invoice.amount }}</div>
              <div class="text-base text-surface-900 dark:text-surface-0">{{ invoice.currency }}</div>
            </div>
          </div>
        </div>
      </div>
    }
  </div>
</div>`
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      icon: 'pi pi-file',
      code: `interface Invoice {
  company: string;
  dueDate: string;
  status: string;
  amount: string;
  currency: string;
}

invoices = signal<Invoice[]>([
  { company: 'TechSolutions Ltd.', dueDate: '20/02/2026', status: 'PAID', amount: '1,250.00', currency: 'EUR' },
  { company: 'CloudInnovate Inc.', dueDate: '22/02/2026', status: 'PAID', amount: '890.00', currency: 'EUR' },
  { company: 'DateSync Systems', dueDate: '18/02/2026', status: 'PAID', amount: '1,500.00', currency: 'EUR' },
  { company: 'AIStream Co.', dueDate: '24/01/2026', status: 'PENDING', amount: '750.00', currency: 'EUR' }
]);

getStatusColorClass(status: string): string {
  switch (status) {
    case 'PAID': return 'bg-green-500';
    case 'PENDING': return 'bg-amber-500';
    case 'UNPAID': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
}

getTagSeverity(status: string): string {
  switch (status) {
    case 'PAID': return 'success';
    case 'PENDING': return 'warning';
    case 'UNPAID': return 'danger';
    default: return 'info';
  }
}`
    }
  ];

  // ============ With Graph (Browsers) ============
  browsers = signal<BrowserData[]>([
    { name: 'Google Chrome', percentage: 71, logo: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/render/image/public/block.images/blocks/logos/chrome.svg' },
    { name: 'Mozilla Firefox', percentage: 41, logo: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/render/image/public/block.images/blocks/logos/firefox.svg' },
    { name: 'Apple Safari', percentage: 20, logo: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/render/image/public/block.images/blocks/logos/safari.svg', opacity: 0.7 },
    { name: 'Opera', percentage: 10, logo: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/render/image/public/block.images/blocks/logos/opera.svg' },
    { name: 'Edge', percentage: 8, logo: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/stackedlist/edge.png' }
  ]);

  browserMenuItems = signal<MenuItem[]>([
    { label: 'Add New', icon: 'pi pi-fw pi-plus' },
    { label: 'Remove', icon: 'pi pi-fw pi-minus' }
  ]);

  withGraphProps: ComponentProp[] = [
    { name: 'name', type: 'string', required: true, description: 'Nombre del navegador' },
    { name: 'percentage', type: 'number', required: true, description: 'Porcentaje de uso del navegador' },
    { name: 'logo', type: 'string', required: true, description: 'URL del logo del navegador' },
    { name: 'opacity', type: 'number', description: 'Opacidad opcional del knob (ej: 0.7)' }
  ];

  withGraphCodeTabs: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      icon: 'pi pi-code',
      code: `<div class="bg-surface-0 dark:bg-surface-900 shadow rounded-2xl p-6">
  <div class="flex justify-between items-center">
    <span class="text-lg text-surface-900 dark:text-surface-0 font-medium">Browser Distributions</span>
    <div>
      <button pButton text rounded severity="secondary" (click)="menu.toggle($event)">
        <i class="pi pi-ellipsis-v"></i>
      </button>
      <p-menu #menu [popup]="true" [model]="browserMenuItems()" appendTo="body" />
    </div>
  </div>
  <ul class="list-none p-0 m-0 mt-8">
    @for (browser of browsers(); track browser.name; let isLast = $last) {
      <li [class.border-b]="!isLast" class="border-surface-200 dark:border-surface-700 py-2 flex items-center justify-between">
        <div class="flex items-center flex-1 gap-4">
          <img [src]="browser.logo" class="w-12 h-12" [alt]="browser.name" />
          <span class="text-surface-900 dark:text-surface-0 font-medium">{{ browser.name }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-surface-900 dark:text-surface-0">%{{ browser.percentage }}</span>
          <p-knob [ngModel]="browser.percentage" [readonly]="true" [size]="32"
                  valueColor="#10B981" [showValue]="false"
                  [class.opacity-70]="browser.opacity === 0.7" />
        </div>
      </li>
    }
  </ul>
</div>`
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      icon: 'pi pi-file',
      code: `interface BrowserData {
  name: string;
  percentage: number;
  logo: string;
  opacity?: number;
}

browsers = signal<BrowserData[]>([
  { name: 'Google Chrome', percentage: 71, logo: '...' },
  { name: 'Mozilla Firefox', percentage: 41, logo: '...' },
  { name: 'Apple Safari', percentage: 20, logo: '...', opacity: 0.7 },
  { name: 'Opera', percentage: 10, logo: '...' },
  { name: 'Edge', percentage: 8, logo: '...' }
]);

browserMenuItems = signal<MenuItem[]>([
  { label: 'Add New', icon: 'pi pi-fw pi-plus' },
  { label: 'Remove', icon: 'pi pi-fw pi-minus' }
]);`
    }
  ];

  // ============ Content Links with Actions ============
  updates = signal<Update[]>([
    { title: 'AI Optimization Rollout', description: 'Enhanced machine learning models improve prediction accuracy by 15%.', date: 'Deployed February 20, 2026' },
    { title: 'Cloud Storage Upgrade', description: 'Increased capacity by 200TB, reducing latency for users.', date: 'Implemented February 18, 2026' },
    { title: 'User Interface Refresh', description: 'New dashboard design boosts user engagement by 25%.', date: 'Launched February 15, 2026' }
  ]);

  contentLinksProps: ComponentProp[] = [
    { name: 'title', type: 'string', required: true, description: 'Titulo de la actualizacion' },
    { name: 'description', type: 'string', required: true, description: 'Descripcion breve del cambio' },
    { name: 'date', type: 'string', required: true, description: 'Fecha de implementacion' }
  ];

  contentLinksCodeTabs: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      icon: 'pi pi-code',
      code: `<div class="bg-surface-0 dark:bg-surface-900 p-6 shadow-sm rounded-2xl flex flex-col gap-8">
  <div class="flex justify-between items-start sm:flex-row flex-col gap-2">
    <div class="text-xl font-medium text-surface-900 dark:text-surface-0">Recent Platform Updates</div>
    <p-tag icon="pi pi-calendar" value="Q4 2026" />
  </div>

  <div class="flex flex-col gap-4">
    @for (update of updates(); track update.title; let index = $index) {
      <div class="flex flex-col gap-2">
        <div class="font-medium text-base text-surface-900 dark:text-surface-0">{{ update.title }}</div>
        <div class="flex flex-col">
          <p class="text-base text-zinc-500 dark:text-zinc-400">{{ update.description }}</p>
          <span class="text-zinc-500 dark:text-zinc-400">{{ update.date }}</span>
        </div>
        @if (index < updates().length - 1) {
          <div class="h-px bg-zinc-200 dark:bg-zinc-700 mt-2"></div>
        }
      </div>
    }
  </div>

  <div class="flex flex-col md:flex-row items-center md:gap-6 gap-4 w-full">
    <button pButton class="flex-1 w-full md:w-auto" severity="secondary">
      <span pButtonLabel>View All Updates</span>
    </button>
    <button pButton class="flex-1 w-full md:w-auto">
      <span pButtonLabel>Subscribe to Updates</span>
    </button>
  </div>
</div>`
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      icon: 'pi pi-file',
      code: `interface Update {
  title: string;
  description: string;
  date: string;
}

updates = signal<Update[]>([
  { title: 'AI Optimization Rollout', description: 'Enhanced machine learning models...', date: 'Deployed February 20, 2026' },
  { title: 'Cloud Storage Upgrade', description: 'Increased capacity by 200TB...', date: 'Implemented February 18, 2026' },
  { title: 'User Interface Refresh', description: 'New dashboard design boosts...', date: 'Launched February 15, 2026' }
]);`
    }
  ];
}
