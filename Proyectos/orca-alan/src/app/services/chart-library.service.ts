import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/**
 * Template de gráfica predefinido
 */
export interface ChartTemplate {
  id: string;
  name: string;
  description: string;
  businessValue: string;
  icon: string;
  chartType: string;
  categoryColumn: string;
  mappedColumn?: string;
  series?: { column: string; aggregation: string; label?: string }[];
  decisionLevel: 'executive' | 'tactical' | 'operational' | 'analytical';
  isExecutive?: boolean;
  palette?: string;
  paleta?: string; // legacy
  tags?: string[];
  drillDowns?: { targetColumn: string; label: string }[];
}

/**
 * Reporte ejecutivo compuesto
 */
export interface ExecutiveReport {
  id: string;
  name: string;
  description: string;
  businessValue: string;
  icon: string;
  chartType: string;
  decisionLevel: 'executive';
  isExecutive: true;
  palette: string;
  tags: string[];
  components: { templateId: string; position: string }[];
}

/**
 * Paleta de colores
 */
export interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
  description: string;
}

/**
 * Categoría de templates por entidad
 */
export interface TemplateCategory {
  entity: string;
  label: string;
  icon: string;
  description: string;
  templates: ChartTemplate[];
}

/**
 * Servicio que provee una biblioteca de templates de gráficas predefinidos
 * organizados por tipo de entidad y nivel de decisión.
 */
@Injectable({
  providedIn: 'root'
})
export class ChartLibraryService {

  // Templates organizados por entidad
  private readonly templateCategories: TemplateCategory[] = [
    {
      entity: 'RISKS',
      label: 'Riesgos',
      icon: 'pi pi-exclamation-triangle',
      description: 'Visualizaciones para análisis y gestión de riesgos',
      templates: [
        {
          id: 'risk-by-status',
          name: 'Riesgos por Estado',
          description: 'Distribución de riesgos según su estado actual (Abierto, En Tratamiento, Cerrado)',
          businessValue: 'Identifica cuellos de botella en el ciclo de vida de riesgos',
          icon: 'pi pi-chart-pie',
          chartType: 'donut',
          categoryColumn: 'eventStatus.name',
          decisionLevel: 'executive',
          paleta: 'semaforo'
        },
        {
          id: 'risk-by-severity',
          name: 'Riesgos por Severidad',
          description: 'Cantidad de riesgos agrupados por nivel de severidad',
          businessValue: 'Prioriza recursos hacia riesgos de mayor impacto',
          icon: 'pi pi-chart-bar',
          chartType: 'bar',
          categoryColumn: 'severity.name',
          decisionLevel: 'executive',
          paleta: 'semaforo'
        },
        {
          id: 'risk-by-owner',
          name: 'Riesgos por Responsable',
          description: 'Distribución de riesgos asignados por responsable',
          businessValue: 'Balancea la carga de trabajo del equipo',
          icon: 'pi pi-users',
          chartType: 'bar',
          categoryColumn: 'owner.fullName',
          decisionLevel: 'tactical',
          paleta: 'corporate'
        },
        {
          id: 'risk-by-category',
          name: 'Riesgos por Categoría',
          description: 'Clasificación de riesgos por categoría temática',
          businessValue: 'Identifica áreas con mayor concentración de riesgos',
          icon: 'pi pi-tags',
          chartType: 'donut',
          categoryColumn: 'category.name',
          decisionLevel: 'tactical',
          paleta: 'vibrant'
        },
        {
          id: 'risk-trend-monthly',
          name: 'Tendencia Mensual de Riesgos',
          description: 'Evolución de riesgos identificados por mes',
          businessValue: 'Detecta patrones estacionales y tendencias',
          icon: 'pi pi-chart-line',
          chartType: 'line',
          categoryColumn: 'createdAt',
          decisionLevel: 'analytical',
          paleta: 'ocean'
        },
        {
          id: 'risk-matrix-impact-prob',
          name: 'Matriz de Riesgo',
          description: 'Distribución de riesgos por probabilidad e impacto',
          businessValue: 'Visualiza la exposición global al riesgo',
          icon: 'pi pi-th-large',
          chartType: 'riskMatrix',
          categoryColumn: 'probability',
          series: [{ column: 'impact', aggregation: 'count' }],
          decisionLevel: 'executive',
          paleta: 'semaforo'
        },
        {
          id: 'risk-by-asset',
          name: 'Riesgos por Activo',
          description: 'Distribución de riesgos por activo afectado',
          businessValue: 'Identifica activos críticos con mayor exposición',
          icon: 'pi pi-server',
          chartType: 'bar',
          categoryColumn: 'asset.name',
          decisionLevel: 'operational',
          paleta: 'corporate'
        },
        {
          id: 'risk-residual-vs-inherent',
          name: 'Riesgo Residual vs Inherente',
          description: 'Comparación del nivel de riesgo antes y después de controles',
          businessValue: 'Evalúa la efectividad de los controles implementados',
          icon: 'pi pi-chart-bar',
          chartType: 'groupedBar',
          categoryColumn: 'category.name',
          series: [
            { column: 'inherentRisk', aggregation: 'avg' },
            { column: 'residualRisk', aggregation: 'avg' }
          ],
          decisionLevel: 'tactical',
          paleta: 'semaforo'
        }
      ]
    },
    {
      entity: 'INCIDENTS',
      label: 'Incidentes',
      icon: 'pi pi-bolt',
      description: 'Visualizaciones para seguimiento y análisis de incidentes',
      templates: [
        {
          id: 'incident-by-status',
          name: 'Incidentes por Estado',
          description: 'Estado actual de los incidentes (Nuevo, En Progreso, Resuelto)',
          businessValue: 'Monitorea el avance en la resolución de incidentes',
          icon: 'pi pi-chart-pie',
          chartType: 'donut',
          categoryColumn: 'status.name',
          decisionLevel: 'executive',
          paleta: 'semaforo'
        },
        {
          id: 'incident-by-priority',
          name: 'Incidentes por Prioridad',
          description: 'Clasificación de incidentes según su prioridad',
          businessValue: 'Asegura atención a incidentes críticos primero',
          icon: 'pi pi-chart-bar',
          chartType: 'bar',
          categoryColumn: 'priority.name',
          decisionLevel: 'executive',
          paleta: 'semaforo'
        },
        {
          id: 'incident-by-type',
          name: 'Incidentes por Tipo',
          description: 'Distribución de incidentes por tipo/categoría',
          businessValue: 'Identifica patrones recurrentes de incidentes',
          icon: 'pi pi-tags',
          chartType: 'donut',
          categoryColumn: 'incidentType.name',
          decisionLevel: 'tactical',
          paleta: 'vibrant'
        },
        {
          id: 'incident-trend-weekly',
          name: 'Tendencia Semanal',
          description: 'Incidentes reportados por semana',
          businessValue: 'Detecta picos y anomalías en la ocurrencia',
          icon: 'pi pi-chart-line',
          chartType: 'area',
          categoryColumn: 'createdAt',
          decisionLevel: 'analytical',
          paleta: 'ocean'
        },
        {
          id: 'incident-mttr',
          name: 'Tiempo de Resolución (MTTR)',
          description: 'Tiempo promedio de resolución por categoría',
          businessValue: 'Optimiza los tiempos de respuesta',
          icon: 'pi pi-clock',
          chartType: 'bar',
          categoryColumn: 'incidentType.name',
          series: [{ column: 'resolutionTime', aggregation: 'avg' }],
          decisionLevel: 'operational',
          paleta: 'corporate'
        },
        {
          id: 'incident-by-source',
          name: 'Incidentes por Fuente',
          description: 'Origen de los incidentes reportados',
          businessValue: 'Mejora los canales de detección',
          icon: 'pi pi-sitemap',
          chartType: 'donut',
          categoryColumn: 'source.name',
          decisionLevel: 'tactical',
          paleta: 'pastel'
        },
        {
          id: 'incident-by-assignee',
          name: 'Incidentes por Asignado',
          description: 'Carga de trabajo por persona asignada',
          businessValue: 'Balancea la carga del equipo de respuesta',
          icon: 'pi pi-users',
          chartType: 'bar',
          categoryColumn: 'assignee.fullName',
          decisionLevel: 'operational',
          paleta: 'corporate'
        }
      ]
    },
    {
      entity: 'ASSETS',
      label: 'Activos',
      icon: 'pi pi-server',
      description: 'Visualizaciones para gestión de activos',
      templates: [
        {
          id: 'asset-by-type',
          name: 'Activos por Tipo',
          description: 'Distribución de activos según su clasificación',
          businessValue: 'Inventario visual de la infraestructura',
          icon: 'pi pi-chart-pie',
          chartType: 'donut',
          categoryColumn: 'assetType.name',
          decisionLevel: 'executive',
          paleta: 'vibrant'
        },
        {
          id: 'asset-by-criticality',
          name: 'Activos por Criticidad',
          description: 'Clasificación de activos por nivel de criticidad',
          businessValue: 'Prioriza la protección de activos críticos',
          icon: 'pi pi-chart-bar',
          chartType: 'bar',
          categoryColumn: 'criticality.name',
          decisionLevel: 'executive',
          paleta: 'semaforo'
        },
        {
          id: 'asset-by-status',
          name: 'Activos por Estado',
          description: 'Estado operacional de los activos',
          businessValue: 'Monitorea la salud de la infraestructura',
          icon: 'pi pi-chart-pie',
          chartType: 'donut',
          categoryColumn: 'status.name',
          decisionLevel: 'operational',
          paleta: 'semaforo'
        },
        {
          id: 'asset-by-owner',
          name: 'Activos por Propietario',
          description: 'Distribución de activos por área/propietario',
          businessValue: 'Clarifica responsabilidades de activos',
          icon: 'pi pi-users',
          chartType: 'bar',
          categoryColumn: 'owner.department',
          decisionLevel: 'tactical',
          paleta: 'corporate'
        },
        {
          id: 'asset-risk-exposure',
          name: 'Exposición de Activos',
          description: 'Cantidad de riesgos asociados por activo',
          businessValue: 'Identifica activos con mayor exposición',
          icon: 'pi pi-chart-bar',
          chartType: 'bar',
          categoryColumn: 'name',
          series: [{ column: 'riskCount', aggregation: 'sum' }],
          decisionLevel: 'tactical',
          paleta: 'semaforo'
        }
      ]
    },
    {
      entity: 'CONTROLS',
      label: 'Controles',
      icon: 'pi pi-shield',
      description: 'Visualizaciones para gestión de controles',
      templates: [
        {
          id: 'control-by-status',
          name: 'Controles por Estado',
          description: 'Estado de implementación de controles',
          businessValue: 'Seguimiento de la madurez en controles',
          icon: 'pi pi-chart-pie',
          chartType: 'donut',
          categoryColumn: 'status.name',
          decisionLevel: 'executive',
          paleta: 'semaforo'
        },
        {
          id: 'control-by-type',
          name: 'Controles por Tipo',
          description: 'Clasificación de controles (Preventivo, Detectivo, Correctivo)',
          businessValue: 'Balance del enfoque de control',
          icon: 'pi pi-chart-bar',
          chartType: 'bar',
          categoryColumn: 'controlType.name',
          decisionLevel: 'tactical',
          paleta: 'corporate'
        },
        {
          id: 'control-effectiveness',
          name: 'Efectividad de Controles',
          description: 'Nivel de efectividad por categoría de control',
          businessValue: 'Identifica controles que requieren mejora',
          icon: 'pi pi-chart-bar',
          chartType: 'bar',
          categoryColumn: 'category.name',
          series: [{ column: 'effectiveness', aggregation: 'avg' }],
          decisionLevel: 'tactical',
          paleta: 'semaforo'
        },
        {
          id: 'control-coverage',
          name: 'Cobertura de Controles',
          description: 'Riesgos cubiertos vs no cubiertos por controles',
          businessValue: 'Identifica brechas en la cobertura',
          icon: 'pi pi-chart-pie',
          chartType: 'donut',
          categoryColumn: 'coverageStatus',
          decisionLevel: 'executive',
          paleta: 'semaforo'
        },
        {
          id: 'control-by-framework',
          name: 'Controles por Framework',
          description: 'Distribución de controles por marco normativo',
          businessValue: 'Visibilidad de cumplimiento por framework',
          icon: 'pi pi-book',
          chartType: 'bar',
          categoryColumn: 'framework.name',
          decisionLevel: 'analytical',
          paleta: 'vibrant'
        }
      ]
    },
    {
      entity: 'DEFECTS',
      label: 'Defectos',
      icon: 'pi pi-bug',
      description: 'Visualizaciones para seguimiento de defectos',
      templates: [
        {
          id: 'defect-by-status',
          name: 'Defectos por Estado',
          description: 'Estado actual de los defectos reportados',
          businessValue: 'Monitorea el progreso de correcciones',
          icon: 'pi pi-chart-pie',
          chartType: 'donut',
          categoryColumn: 'status.name',
          decisionLevel: 'executive',
          paleta: 'semaforo'
        },
        {
          id: 'defect-by-severity',
          name: 'Defectos por Severidad',
          description: 'Clasificación de defectos por severidad',
          businessValue: 'Prioriza correcciones críticas',
          icon: 'pi pi-chart-bar',
          chartType: 'bar',
          categoryColumn: 'severity.name',
          decisionLevel: 'executive',
          paleta: 'semaforo'
        },
        {
          id: 'defect-by-component',
          name: 'Defectos por Componente',
          description: 'Distribución de defectos por componente/módulo',
          businessValue: 'Identifica componentes problemáticos',
          icon: 'pi pi-sitemap',
          chartType: 'bar',
          categoryColumn: 'component.name',
          decisionLevel: 'tactical',
          paleta: 'vibrant'
        },
        {
          id: 'defect-trend',
          name: 'Tendencia de Defectos',
          description: 'Evolución de defectos en el tiempo',
          businessValue: 'Mide la calidad a lo largo del tiempo',
          icon: 'pi pi-chart-line',
          chartType: 'area',
          categoryColumn: 'createdAt',
          decisionLevel: 'analytical',
          paleta: 'ocean'
        },
        {
          id: 'defect-by-reporter',
          name: 'Defectos por Reportador',
          description: 'Quién está identificando más defectos',
          businessValue: 'Reconoce contribuciones a la calidad',
          icon: 'pi pi-users',
          chartType: 'bar',
          categoryColumn: 'reporter.fullName',
          decisionLevel: 'operational',
          paleta: 'pastel'
        }
      ]
    },
    {
      entity: 'PROCESSES',
      label: 'Procesos',
      icon: 'pi pi-sitemap',
      description: 'Visualizaciones para análisis de procesos',
      templates: [
        {
          id: 'process-by-status',
          name: 'Procesos por Estado',
          description: 'Estado de ejecución de los procesos',
          businessValue: 'Monitorea la operación de procesos',
          icon: 'pi pi-chart-pie',
          chartType: 'donut',
          categoryColumn: 'status.name',
          decisionLevel: 'executive',
          paleta: 'semaforo'
        },
        {
          id: 'process-by-type',
          name: 'Procesos por Tipo',
          description: 'Clasificación de procesos por categoría',
          businessValue: 'Inventario de procesos organizacionales',
          icon: 'pi pi-chart-bar',
          chartType: 'bar',
          categoryColumn: 'processType.name',
          decisionLevel: 'tactical',
          paleta: 'vibrant'
        },
        {
          id: 'process-risk-count',
          name: 'Riesgos por Proceso',
          description: 'Cantidad de riesgos asociados a cada proceso',
          businessValue: 'Identifica procesos con mayor exposición',
          icon: 'pi pi-chart-bar',
          chartType: 'bar',
          categoryColumn: 'name',
          series: [{ column: 'riskCount', aggregation: 'sum' }],
          decisionLevel: 'tactical',
          paleta: 'semaforo'
        },
        {
          id: 'process-compliance',
          name: 'Cumplimiento de Procesos',
          description: 'Nivel de cumplimiento por proceso',
          businessValue: 'Evalúa adherencia a procedimientos',
          icon: 'pi pi-check-circle',
          chartType: 'bar',
          categoryColumn: 'name',
          series: [{ column: 'complianceScore', aggregation: 'avg' }],
          decisionLevel: 'operational',
          paleta: 'semaforo'
        },
        {
          id: 'process-by-owner',
          name: 'Procesos por Propietario',
          description: 'Distribución de procesos por área responsable',
          businessValue: 'Clarifica responsabilidades de procesos',
          icon: 'pi pi-users',
          chartType: 'donut',
          categoryColumn: 'owner.department',
          decisionLevel: 'tactical',
          paleta: 'corporate'
        }
      ]
    }
  ];

  // Signals para estado reactivo
  private readonly _categories = signal<TemplateCategory[]>(this.templateCategories);
  private readonly _selectedCategory = signal<string | null>(null);
  private readonly _searchQuery = signal<string>('');
  private readonly _selectedLevel = signal<string | null>(null);

  // Computed: categorías disponibles
  readonly categories = computed(() => this._categories());

  // Computed: categoría seleccionada
  readonly selectedCategory = computed(() => this._selectedCategory());

  // Computed: templates filtrados
  readonly filteredTemplates = computed(() => {
    const category = this._selectedCategory();
    const query = this._searchQuery().toLowerCase();
    const level = this._selectedLevel();

    let templates: ChartTemplate[] = [];

    if (category) {
      const cat = this._categories().find(c => c.entity === category);
      templates = cat?.templates || [];
    } else {
      // Mostrar todos los templates de todas las categorías
      templates = this._categories().flatMap(c => c.templates);
    }

    // Filtrar por búsqueda
    if (query) {
      templates = templates.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.businessValue.toLowerCase().includes(query)
      );
    }

    // Filtrar por nivel de decisión
    if (level) {
      templates = templates.filter(t => t.decisionLevel === level);
    }

    return templates;
  });

  // Computed: templates destacados (ejecutivos)
  readonly featuredTemplates = computed(() => {
    return this._categories()
      .flatMap(c => c.templates)
      .filter(t => t.decisionLevel === 'executive')
      .slice(0, 6);
  });

  // Niveles de decisión disponibles
  readonly decisionLevels = [
    { value: 'executive', label: 'Ejecutivo', icon: 'pi pi-crown', description: 'Visión de alto nivel para dirección' },
    { value: 'tactical', label: 'Táctico', icon: 'pi pi-compass', description: 'Análisis para mandos medios' },
    { value: 'operational', label: 'Operativo', icon: 'pi pi-cog', description: 'Detalle para operaciones diarias' },
    { value: 'analytical', label: 'Analítico', icon: 'pi pi-chart-line', description: 'Análisis profundo de datos' }
  ];

  // Métodos públicos
  setSelectedCategory(entity: string | null): void {
    this._selectedCategory.set(entity);
  }

  setSearchQuery(query: string): void {
    this._searchQuery.set(query);
  }

  setDecisionLevel(level: string | null): void {
    this._selectedLevel.set(level);
  }

  getTemplateById(id: string): ChartTemplate | undefined {
    return this._categories()
      .flatMap(c => c.templates)
      .find(t => t.id === id);
  }

  getCategoryByEntity(entity: string): TemplateCategory | undefined {
    return this._categories().find(c => c.entity === entity);
  }

  getTemplatesByEntity(entity: string): ChartTemplate[] {
    return this.getCategoryByEntity(entity)?.templates || [];
  }

  getDecisionLevelLabel(level: string): string {
    return this.decisionLevels.find(l => l.value === level)?.label || level;
  }

  getDecisionLevelIcon(level: string): string {
    return this.decisionLevels.find(l => l.value === level)?.icon || 'pi pi-circle';
  }

  /**
   * Mapea el tipo de gráfica del template al tipo de ApexCharts/ChartJS
   */
  mapChartType(templateType: string): string {
    const mapping: Record<string, string> = {
      'doughnut': 'donut',
      'pie': 'pie',
      'bar': 'bar',
      'column': 'bar',
      'line': 'line',
      'area': 'area',
      'radar': 'radar',
      'scatter': 'scatter',
      'bubble': 'bubble',
      'heatmap': 'heatmap',
      'treemap': 'treemap',
      'funnel': 'funnel',
      'radialBar': 'radialBar',
      'riskMatrix': 'riskMatrix',
      'groupedBar': 'groupedBar',
      'stackedBar': 'stackedBar'
    };
    return mapping[templateType] || templateType;
  }

  /**
   * Mapea el campo de categoría del template al campo del componente
   */
  mapCategoryColumn(column: string): string {
    const mapping: Record<string, string> = {
      'eventStatus.name': 'estado',
      'status.name': 'estado',
      'severity.name': 'severidad',
      'priority.name': 'severidad',
      'owner.fullName': 'responsable',
      'assignee.fullName': 'responsable',
      'category.name': 'categoria',
      'incidentType.name': 'tipoEntidad',
      'assetType.name': 'tipoEntidad',
      'controlType.name': 'tipoEntidad',
      'processType.name': 'tipoEntidad',
      'createdAt': 'fecha',
      'probability': 'probabilidad',
      'impact': 'impacto',
      'name': 'contenedorNombre',
      'asset.name': 'contenedorNombre',
      'source.name': 'fuente',
      'component.name': 'componente',
      'framework.name': 'framework',
      'owner.department': 'departamento',
      'reporter.fullName': 'reportador'
    };
    return mapping[column] || 'estado';
  }

  // Paletas de colores disponibles
  readonly colorPalettes: ColorPalette[] = [
    {
      id: 'semaforo',
      name: 'Semáforo',
      colors: ['#22c55e', '#eab308', '#f97316', '#ef4444'],
      description: 'Verde-Amarillo-Naranja-Rojo para estados'
    },
    {
      id: 'corporate',
      name: 'Corporativo',
      colors: ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'],
      description: 'Tonos profesionales púrpura-rosa'
    },
    {
      id: 'vibrant',
      name: 'Vibrante',
      colors: ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
      description: 'Colores vivos y diferenciados'
    },
    {
      id: 'ocean',
      name: 'Océano',
      colors: ['#0ea5e9', '#06b6d4', '#14b8a6', '#22c55e', '#84cc16'],
      description: 'Tonos azul-verde refrescantes'
    },
    {
      id: 'pastel',
      name: 'Pastel',
      colors: ['#93c5fd', '#c4b5fd', '#f9a8d4', '#fcd34d', '#a7f3d0'],
      description: 'Colores suaves y agradables'
    },
    {
      id: 'sunset',
      name: 'Atardecer',
      colors: ['#f97316', '#fb923c', '#fbbf24', '#facc15', '#fde047'],
      description: 'Tonos cálidos naranja-amarillo'
    }
  ];

  /**
   * Obtiene los colores de una paleta
   */
  getPaletteColors(paletteId: string): string[] {
    const palette = this.colorPalettes.find(p => p.id === paletteId);
    return palette?.colors || this.colorPalettes[0].colors;
  }

  /**
   * Obtiene los templates ejecutivos (para reportes de comité)
   */
  getExecutiveTemplates(): ChartTemplate[] {
    return this._categories()
      .flatMap(c => c.templates)
      .filter(t => t.isExecutive || t.decisionLevel === 'executive');
  }

  /**
   * Busca templates por tags
   */
  searchByTags(tags: string[]): ChartTemplate[] {
    const lowerTags = tags.map(t => t.toLowerCase());
    return this._categories()
      .flatMap(c => c.templates)
      .filter(t => t.tags?.some(tag => lowerTags.includes(tag.toLowerCase())));
  }

  /**
   * Obtiene un template con su configuración de drill-down
   */
  getTemplateWithDrillDowns(templateId: string): { template: ChartTemplate; drillDowns: { targetColumn: string; label: string }[] } | undefined {
    const template = this.getTemplateById(templateId);
    if (!template) return undefined;

    return {
      template,
      drillDowns: template.drillDowns || []
    };
  }

  /**
   * Obtiene estadísticas de la biblioteca
   */
  getLibraryStats(): { totalTemplates: number; byDecisionLevel: Record<string, number>; byEntity: Record<string, number> } {
    const templates = this._categories().flatMap(c => c.templates);

    const byDecisionLevel: Record<string, number> = {
      executive: 0,
      tactical: 0,
      operational: 0,
      analytical: 0
    };

    const byEntity: Record<string, number> = {};

    templates.forEach(t => {
      byDecisionLevel[t.decisionLevel]++;
    });

    this._categories().forEach(c => {
      byEntity[c.entity] = c.templates.length;
    });

    return {
      totalTemplates: templates.length,
      byDecisionLevel,
      byEntity
    };
  }
}
