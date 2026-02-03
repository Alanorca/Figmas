import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DsPreviewComponent } from '../../../components/ds-preview/ds-preview.component';
import { DsCodeBlockComponent } from '../../../components/ds-code-block/ds-code-block.component';
import { DsPropsTableComponent, ComponentProp } from '../../../components/ds-props-table/ds-props-table.component';

// ============ Interfaces ============

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
    DsPreviewComponent,
    DsCodeBlockComponent,
    DsPropsTableComponent
  ],
  providers: [MessageService],
  templateUrl: './lists.component.html',
  styleUrl: './lists.component.scss'
})
export class ListsComponent {
  constructor(private messageService: MessageService) {}

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
}
