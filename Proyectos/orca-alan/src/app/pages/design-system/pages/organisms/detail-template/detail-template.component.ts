import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { DsPreviewComponent } from '../../../components/ds-preview/ds-preview.component';
import { DsCodeBlockComponent } from '../../../components/ds-code-block/ds-code-block.component';
import { DsCodeTabsComponent, CodeTab } from '../../../components/ds-code-tabs/ds-code-tabs.component';
import { DsGuidelinesComponent } from '../../../components/ds-guidelines/ds-guidelines.component';
import { DsUsageListComponent, UsageItem } from '../../../components/ds-usage-list/ds-usage-list.component';
import { DsPropsTableComponent, ComponentProp } from '../../../components/ds-props-table/ds-props-table.component';

@Component({
  selector: 'app-ds-detail-template',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TagModule,
    AvatarModule,
    DividerModule,
    DsPreviewComponent,
    DsCodeBlockComponent,
    DsCodeTabsComponent,
    DsGuidelinesComponent,
    DsUsageListComponent,
    DsPropsTableComponent
  ],
  templateUrl: './detail-template.component.html',
  styleUrl: './detail-template.component.scss'
})
export class DetailTemplateComponent {
  // Demo state
  mainTab = signal<string>('general');
  secondaryTab = signal<string>('info');

  // Entity type selector
  selectedEntityType = signal<'activo' | 'riesgo' | 'incidente' | 'defecto'>('activo');

  entityTypes = [
    { id: 'activo', label: 'Activo', icon: 'pi pi-box' },
    { id: 'riesgo', label: 'Riesgo', icon: 'pi pi-exclamation-triangle' },
    { id: 'incidente', label: 'Incidente', icon: 'pi pi-bolt' },
    { id: 'defecto', label: 'Defecto', icon: 'pi pi-wrench' }
  ];

  // Entity-specific configurations
  entityConfigs: Record<string, {
    title: string;
    subtitle: string;
    code: string;
    description: string;
    mainTabs: { id: string; label: string; icon: string }[];
    secondaryTabs: { id: string; label: string; icon: string }[];
    statusCard: { title: string; status: string; severity: 'success' | 'warn' | 'danger' | 'info'; icon: string; color: string };
    stats: { label: string; value: string; indicator: string }[];
  }> = {
    activo: {
      title: 'Detalle del Activo',
      subtitle: 'Visualiza y gestiona la información del activo',
      code: 'ACT-001',
      description: 'El sistema GRC optimiza la gestión financiera mediante un enfoque integral.',
      mainTabs: [
        { id: 'general', label: 'Información general', icon: 'pi pi-info-circle' },
        { id: 'reglas', label: 'Reglas', icon: 'pi pi-check-square' },
        { id: 'riesgos', label: 'Riesgos', icon: 'pi pi-exclamation-triangle' },
        { id: 'auditoria', label: 'Auditoría', icon: 'pi pi-history' }
      ],
      secondaryTabs: [
        { id: 'info', label: 'Información General', icon: 'pi pi-info-circle' },
        { id: 'salud', label: 'Estado de Salud', icon: 'pi pi-heart-fill' },
        { id: 'config', label: 'Configuración', icon: 'pi pi-sliders-h' },
        { id: 'propiedades', label: 'Propiedades', icon: 'pi pi-th-large' }
      ],
      statusCard: { title: 'Salud del Activo', status: 'Saludable', severity: 'success', icon: 'pi pi-heart-fill', color: 'green' },
      stats: [
        { label: 'Riesgos', value: '12', indicator: 'riesgos' },
        { label: 'Criticidad', value: 'Alta', indicator: 'nivel' },
        { label: 'Incidentes', value: '5', indicator: 'incidentes' },
        { label: 'Valor', value: '$50K', indicator: 'valor' }
      ]
    },
    riesgo: {
      title: 'Detalle del Riesgo',
      subtitle: 'Gestiona y evalúa el riesgo identificado',
      code: 'RSK-042',
      description: 'Riesgo de pérdida de datos sensibles por acceso no autorizado a sistemas críticos.',
      mainTabs: [
        { id: 'general', label: 'Información general', icon: 'pi pi-info-circle' },
        { id: 'controles', label: 'Controles', icon: 'pi pi-shield' },
        { id: 'costos', label: 'Costos', icon: 'pi pi-dollar' },
        { id: 'historial', label: 'Historial', icon: 'pi pi-history' }
      ],
      secondaryTabs: [
        { id: 'info', label: 'Información General', icon: 'pi pi-info-circle' },
        { id: 'analisis', label: 'Análisis de Riesgo', icon: 'pi pi-chart-bar' },
        { id: 'propiedades', label: 'Propiedades', icon: 'pi pi-th-large' }
      ],
      statusCard: { title: 'Nivel de Riesgo', status: 'Alto', severity: 'warn', icon: 'pi pi-exclamation-triangle', color: 'orange' },
      stats: [
        { label: 'Probabilidad', value: 'Alta', indicator: 'probabilidad' },
        { label: 'Impacto', value: 'Mayor', indicator: 'impacto' },
        { label: 'Controles', value: '4', indicator: 'controles' },
        { label: 'Activos', value: '8', indicator: 'activos' }
      ]
    },
    incidente: {
      title: 'Detalle del Incidente',
      subtitle: 'Gestiona la respuesta y resolución del incidente',
      code: 'INC-127',
      description: 'Interrupción del servicio de autenticación que afectó a múltiples usuarios.',
      mainTabs: [
        { id: 'general', label: 'General', icon: 'pi pi-info-circle' },
        { id: 'impacto', label: 'Impacto', icon: 'pi pi-chart-line' },
        { id: 'historial', label: 'Historial', icon: 'pi pi-history' }
      ],
      secondaryTabs: [
        { id: 'info', label: 'Información', icon: 'pi pi-info-circle' },
        { id: 'respuesta', label: 'Respuesta', icon: 'pi pi-reply' },
        { id: 'propiedades', label: 'Propiedades', icon: 'pi pi-th-large' }
      ],
      statusCard: { title: 'Estado del Incidente', status: 'En Proceso', severity: 'warn', icon: 'pi pi-clock', color: 'yellow' },
      stats: [
        { label: 'Tiempo Resp.', value: '2h', indicator: 'tiempo' },
        { label: 'Downtime', value: '45min', indicator: 'downtime' },
        { label: 'Usuarios', value: '150', indicator: 'usuarios' },
        { label: 'Activos', value: '3', indicator: 'activos' }
      ]
    },
    defecto: {
      title: 'Detalle del Defecto',
      subtitle: 'Gestiona la corrección del defecto identificado',
      code: 'DEF-089',
      description: 'Vulnerabilidad en validación de entrada que permite inyección SQL.',
      mainTabs: [
        { id: 'general', label: 'General', icon: 'pi pi-info-circle' },
        { id: 'activos', label: 'Activos', icon: 'pi pi-box' },
        { id: 'historial', label: 'Historial', icon: 'pi pi-history' }
      ],
      secondaryTabs: [
        { id: 'info', label: 'Información', icon: 'pi pi-info-circle' },
        { id: 'solucion', label: 'Solución', icon: 'pi pi-check-circle' },
        { id: 'propiedades', label: 'Propiedades', icon: 'pi pi-th-large' }
      ],
      statusCard: { title: 'Estado del Defecto', status: 'Abierto', severity: 'danger', icon: 'pi pi-exclamation-circle', color: 'red' },
      stats: [
        { label: 'Días Abierto', value: '12', indicator: 'dias' },
        { label: 'Severidad', value: 'Crítico', indicator: 'severidad' },
        { label: 'Activos', value: '5', indicator: 'activos' },
        { label: 'Procesos', value: '2', indicator: 'procesos' }
      ]
    }
  };

  // Computed current config
  currentConfig = () => this.entityConfigs[this.selectedEntityType()];

  mainTabs = [
    { id: 'general', label: 'Información general', icon: 'pi pi-info-circle' },
    { id: 'reglas', label: 'Reglas', icon: 'pi pi-check-square' },
    { id: 'riesgos', label: 'Riesgos', icon: 'pi pi-exclamation-triangle' },
    { id: 'auditoria', label: 'Auditoría', icon: 'pi pi-history' }
  ];

  secondaryTabs = [
    { id: 'info', label: 'Información General', icon: 'pi pi-info-circle' },
    { id: 'salud', label: 'Estado de Salud', icon: 'pi pi-heart-fill' },
    { id: 'config', label: 'Configuración', icon: 'pi pi-sliders-h' },
    { id: 'propiedades', label: 'Propiedades', icon: 'pi pi-th-large' }
  ];

  // Reset tabs when entity type changes
  onEntityTypeChange(type: 'activo' | 'riesgo' | 'incidente' | 'defecto') {
    this.selectedEntityType.set(type);
    this.mainTab.set('general');
    this.secondaryTab.set('info');
  }

  // Props documentation
  layoutProps: ComponentProp[] = [
    { name: 'detalle-page', type: 'class', description: 'Contenedor principal de la página de detalle (full width)' },
    { name: 'page-header', type: 'class', description: 'Cabecera con título, subtítulo y tabs principales' },
    { name: 'main-layout', type: 'class', description: 'Grid de 2 columnas: contenido + sidebar' },
    { name: 'main-content', type: 'class', description: 'Columna izquierda con información principal' },
    { name: 'sidebar', type: 'class', description: 'Columna derecha con stats y visualizaciones' }
  ];

  headerProps: ComponentProp[] = [
    { name: 'header-left', type: 'class', description: 'Sección izquierda con título y subtítulo' },
    { name: 'header-right', type: 'class', description: 'Sección derecha con tabs de navegación principal' },
    { name: 'page-title', type: 'class', description: 'Título principal de la página (h1)' },
    { name: 'page-subtitle', type: 'class', description: 'Subtítulo descriptivo' },
    { name: 'main-nav-tabs', type: 'class', description: 'Contenedor de tabs principales (p-button)' }
  ];

  contentProps: ComponentProp[] = [
    { name: 'entity-header-row', type: 'class', description: 'Fila con nombre de entidad + card de estado' },
    { name: 'entity-header', type: 'class', description: 'Nombre y descripción de la entidad' },
    { name: 'status-card', type: 'class', description: 'Card compacto con estado/salud' },
    { name: 'secondary-tabs', type: 'class', description: 'Tabs internos del contenido' },
    { name: 'tab-content', type: 'class', description: 'Área de contenido del tab activo' },
    { name: 'tab-panel', type: 'class', description: 'Panel individual de cada tab' }
  ];

  sidebarProps: ComponentProp[] = [
    { name: 'stats-section', type: 'class', description: 'Sección de tarjetas de estadísticas' },
    { name: 'stat-row', type: 'class', description: 'Fila de 2 stat cards' },
    { name: 'stat-card', type: 'class', description: 'Tarjeta individual de estadística' },
    { name: 'graph-section', type: 'class', description: 'Sección de visualización de relaciones' }
  ];

  // Guidelines
  guidelinesDos = [
    'Usar layout de 2 columnas: contenido principal + sidebar',
    'Incluir tabs principales en el header para navegación',
    'Mostrar nombre y descripción de la entidad prominentemente',
    'Incluir card de estado/salud junto al nombre',
    'Usar tabs secundarios para organizar información detallada',
    'Sidebar con métricas clave y visualizaciones'
  ];

  guidelinesDonts = [
    'No usar más de 5 tabs principales en el header',
    'No omitir el estado/salud de la entidad',
    'No hacer el sidebar más ancho que 440px',
    'No mezclar navegación principal con secundaria',
    'No ocultar información crítica en tabs secundarios'
  ];

  // Usage items
  usageItems: UsageItem[] = [
    { title: 'Detalle de Activo', path: '/activos/:id/detalle', icon: 'pi pi-box', description: 'Vista detallada de activos' },
    { title: 'Detalle de Proceso', path: '/procesos/:id/detalle', icon: 'pi pi-sitemap', description: 'Vista detallada de procesos' },
    { title: 'Detalle de Riesgo', path: '/riesgos/:id', icon: 'pi pi-exclamation-triangle', description: 'Vista detallada de riesgos' },
    { title: 'Detalle de Incidente', path: '/incidentes/:id', icon: 'pi pi-bolt', description: 'Vista detallada de incidentes' },
    { title: 'Detalle de Defecto', path: '/defectos/:id', icon: 'pi pi-wrench', description: 'Vista detallada de defectos' }
  ];

  // Tokens used
  tokens = [
    { name: '--surface-ground', value: 'var(--surface-ground)', description: 'Fondo de la página' },
    { name: '--surface-card', value: 'var(--surface-card)', description: 'Fondo de cards y contenido' },
    { name: '--surface-border', value: 'var(--surface-border)', description: 'Bordes de elementos' },
    { name: '--text-color', value: 'var(--text-color)', description: 'Título y texto principal' },
    { name: '--text-color-secondary', value: 'var(--text-color-secondary)', description: 'Subtítulos y labels' },
    { name: '--primary-color', value: 'var(--primary-color)', description: 'Tab activo y acciones primarias' }
  ];

  // Code examples
  htmlLayoutCode = `<!-- Estructura principal del Detail Template -->
<div class="detalle-page">
  <!-- Header con título y navegación principal -->
  <div class="page-header">
    <div class="header-left">
      <h1 class="page-title">Detalle del [Entidad]</h1>
      <span class="page-subtitle">Descripción de la página</span>
    </div>
    <div class="header-right">
      <div class="main-nav-tabs">
        @for (tab of mainTabs; track tab.id) {
          <p-button
            [label]="tab.label"
            [icon]="tab.icon"
            [outlined]="mainTab() !== tab.id"
            [severity]="mainTab() === tab.id ? 'primary' : 'secondary'"
            (onClick)="mainTab.set(tab.id)"
          />
        }
      </div>
    </div>
  </div>

  <p-divider />

  <!-- Layout Principal: Contenido + Sidebar -->
  <div class="main-layout">
    <!-- Contenido Principal -->
    <div class="main-content">
      <!-- Header de la Entidad -->
      <div class="entity-header-row">
        <div class="entity-header">
          <h2 class="entity-nombre">{{ entidad.nombre }}</h2>
          <p class="entity-descripcion">{{ entidad.descripcion }}</p>
        </div>
        <div class="status-card">
          <!-- Card de estado/salud -->
        </div>
      </div>

      <!-- Tabs Secundarios -->
      <div class="secondary-tabs">
        @for (tab of secondaryTabs; track tab.id) {
          <button class="tab-btn"
                  [class.active]="secondaryTab() === tab.id"
                  (click)="secondaryTab.set(tab.id)">
            <i [class]="tab.icon"></i>
            {{ tab.label }}
          </button>
        }
      </div>

      <!-- Contenido del Tab -->
      <div class="tab-content">
        @switch (secondaryTab()) {
          @case ('info') { <div class="tab-panel">...</div> }
          @case ('salud') { <div class="tab-panel">...</div> }
        }
      </div>
    </div>

    <!-- Sidebar -->
    <div class="sidebar">
      <div class="stats-section">
        <div class="stat-row">
          <div class="stat-card">...</div>
          <div class="stat-card">...</div>
        </div>
      </div>
      <div class="graph-section">...</div>
    </div>
  </div>
</div>`;

  scssLayoutCode = `// ========== LAYOUT PRINCIPAL (Full Width) ==========
.detalle-page {
  min-height: 100vh;
  background: var(--surface-ground);
  padding: 1.5rem 2rem;
  // NO usar max-width - debe ser full width
}

// ========== PAGE HEADER ==========
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;

  .header-left {
    .page-title {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0;
      color: var(--text-color);
    }

    .page-subtitle {
      font-size: 0.875rem;
      color: var(--text-color-secondary);
      margin-top: 0.25rem;
    }
  }

  .header-right {
    .main-nav-tabs {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
  }
}

// ========== MAIN LAYOUT (2 Columnas) ==========
.main-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 1.5rem;
  align-items: start;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
}

// ========== MAIN CONTENT ==========
.main-content {
  background: var(--surface-card);
  border-radius: var(--border-radius-xl);
  border: 1px solid var(--surface-border);
  overflow: hidden;
}

// ========== ENTITY HEADER ROW ==========
.entity-header-row {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  border-bottom: 1px solid var(--surface-border);
  align-items: stretch;

  .entity-header {
    flex: 1;

    .entity-nombre {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 0.5rem;
      color: var(--text-color);
    }

    .entity-descripcion {
      font-size: 0.9rem;
      color: var(--text-color-secondary);
      margin: 0;
      line-height: 1.6;
    }
  }

  .status-card {
    flex: 1;
    max-width: 50%;
  }
}

// ========== SECONDARY TABS ==========
.secondary-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--surface-border);
  overflow-x: auto;

  .tab-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 1.25rem;
    border: none;
    background: transparent;
    color: var(--text-color-secondary);
    font-size: 0.875rem;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;

    &:hover {
      color: var(--text-color);
      background: var(--surface-hover);
    }

    &.active {
      color: var(--primary-color);
      border-bottom-color: var(--primary-color);
    }
  }
}

// ========== TAB CONTENT ==========
.tab-content {
  padding: 1.5rem;
}

// ========== SIDEBAR ==========
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.stats-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stat-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stat-card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: var(--border-radius-lg);
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.graph-section {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: var(--border-radius-lg);
  padding: 1rem;
}`;

  // Code tabs
  codeTabs: CodeTab[] = [
    { label: 'HTML', language: 'html', icon: 'pi pi-code', code: this.htmlLayoutCode },
    { label: 'SCSS', language: 'scss', icon: 'pi pi-palette', code: this.scssLayoutCode }
  ];
}
