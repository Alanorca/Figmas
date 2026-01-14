// ============================================================================
// DASHBOARD SERVICE
// ============================================================================
// Servicio para gestionar el estado del dashboard customizable
// Incluye persistencia en localStorage y gestión de widgets
// ============================================================================

import { Injectable, signal, computed } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import {
  DashboardConfig,
  DashboardState,
  DashboardWidget,
  WidgetCatalogItem,
  WIDGET_CATALOG,
  DEFAULT_DASHBOARD_CONFIG,
  GALLERY_DASHBOARD_CONFIG,
  generateWidgetId,
  createWidgetFromCatalog,
  TipoWidget
} from '../models/dashboard.models';
import { GridsterConfig, GridsterItem, DisplayGrid, CompactType, GridType } from 'angular-gridster2';

const STORAGE_KEY = 'orca_dashboard_config';
const STORAGE_STATE_KEY = 'orca_dashboard_state';

// Tipos de widget válidos para validación
const VALID_WIDGET_TYPES: TipoWidget[] = [
  'kpi-card',
  'kpi-grid',
  'graficas-interactivas',
  'graficas-guardadas',
  'table-mini',
  'actividad-reciente',
  'calendario'
];

// Migración de tipos de widget antiguos a los nuevos
const WIDGET_TYPE_MIGRATION: Record<string, TipoWidget> = {
  'chart-bar': 'graficas-interactivas',
  'chart-line': 'graficas-interactivas',
  'chart-pie': 'graficas-interactivas',
  'chart-donut': 'graficas-interactivas',
  'alertas-list': 'actividad-reciente',
  'chart': 'graficas-interactivas'
};

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  // ==================== ESTADO ====================

  private estado = signal<DashboardState>({
    configActual: null,
    configuraciones: [],
    modoEdicion: false,
    widgetSeleccionado: null,
    isDragging: false,
    isResizing: false,
    hasUnsavedChanges: false
  });

  // ==================== DEBOUNCE SUBJECTS ====================

  /** Subject para debounce de cambios de posición */
  private widgetChange$ = new Subject<DashboardWidget>();

  /** Subject para debounce de resize */
  private widgetResize$ = new Subject<DashboardWidget>();

  /** Signal público para notificar resize a widgets */
  private _widgetResized = signal<{ id: string; cols: number; rows: number } | null>(null);
  readonly widgetResized = this._widgetResized.asReadonly();

  // ==================== SELECTORES (COMPUTED) ====================

  /** Configuración actual del dashboard */
  configActual = computed(() => this.estado().configActual);

  /** Lista de todas las configuraciones guardadas */
  configuraciones = computed(() => this.estado().configuraciones);

  /** Widgets del dashboard actual */
  widgets = computed(() => this.estado().configActual?.widgets || []);

  /** Modo edición activo */
  modoEdicion = computed(() => this.estado().modoEdicion);

  /** Widget actualmente seleccionado */
  widgetSeleccionado = computed(() => {
    const id = this.estado().widgetSeleccionado;
    if (!id) return null;
    return this.widgets().find(w => w.id === id) || null;
  });

  /** Hay cambios sin guardar */
  hasUnsavedChanges = computed(() => this.estado().hasUnsavedChanges);

  /** Catálogo de widgets disponibles */
  catalogoWidgets = computed(() => WIDGET_CATALOG);

  /** Widgets agrupados por categoría */
  widgetsPorCategoria = computed(() => {
    const grupos: Record<string, WidgetCatalogItem[]> = {
      kpis: [],
      graficas: [],
      tablas: [],
      listas: [],
      otros: []
    };

    WIDGET_CATALOG.forEach(widget => {
      if (grupos[widget.categoria]) {
        grupos[widget.categoria].push(widget);
      }
    });

    return grupos;
  });

  // ==================== CONFIGURACIÓN DE GRIDSTER ====================

  /** Opciones de configuración para Gridster */
  gridsterOptions = computed<GridsterConfig>(() => {
    const modoEdicion = this.modoEdicion();
    const config = this.configActual();

    return {
      gridType: GridType.VerticalFixed,
      displayGrid: modoEdicion ? DisplayGrid.Always : DisplayGrid.None,
      compactType: CompactType.None,

      // Dimensiones
      minCols: config?.columns || 4,
      maxCols: config?.columns || 4,
      minRows: 1,
      maxRows: 100,

      // Tamaño de celdas
      fixedColWidth: 0,
      fixedRowHeight: config?.rowHeight || 120,

      // Márgenes
      margin: config?.gap || 16,
      outerMargin: true,
      outerMarginTop: config?.gap || 16,
      outerMarginRight: config?.gap || 16,
      outerMarginBottom: config?.gap || 16,
      outerMarginLeft: config?.gap || 16,

      // Comportamiento
      pushItems: true,
      swap: false,
      draggable: {
        enabled: modoEdicion,
        ignoreContentClass: 'widget-content',
        ignoreContent: false,
        dragHandleClass: 'drag-handle',
        dropOverItems: false
      },
      resizable: {
        enabled: modoEdicion,
        handles: { s: true, e: true, n: true, w: true, se: true, ne: true, sw: true, nw: true }
      },

      // Callbacks
      itemChangeCallback: (item: GridsterItem) => this.onWidgetChange(item as DashboardWidget),
      itemResizeCallback: (item: GridsterItem) => this.onWidgetResize(item as DashboardWidget),

      // Animaciones
      enableEmptyCellClick: false,
      enableEmptyCellDrop: modoEdicion,
      enableEmptyCellDrag: false,
      enableOccupiedCellDrop: false,

      // Scroll
      scrollSensitivity: 10,
      scrollSpeed: 20,

      // API
      api: {
        optionsChanged: () => {},
        resize: () => {}
      }
    };
  });

  // ==================== CONSTRUCTOR ====================

  constructor() {
    this.cargarConfiguracion();
    this.initDebounceSubscriptions();
  }

  /** Inicializar suscripciones con debounce para optimizar callbacks de Gridster */
  private initDebounceSubscriptions(): void {
    // Debounce para cambios de posición (100ms)
    this.widgetChange$.pipe(
      debounceTime(100)
    ).subscribe(widget => {
      this.actualizarWidget(widget.id, {
        x: widget.x,
        y: widget.y,
        cols: widget.cols,
        rows: widget.rows
      });
    });

    // Debounce para resize (100ms) con notificación a widgets
    this.widgetResize$.pipe(
      debounceTime(100)
    ).subscribe(widget => {
      this.actualizarWidget(widget.id, {
        cols: widget.cols,
        rows: widget.rows
      });

      // Notificar a widgets que se ha cambiado el tamaño
      this._widgetResized.set({
        id: widget.id,
        cols: widget.cols,
        rows: widget.rows
      });
    });
  }

  // ==================== MÉTODOS DE PERSISTENCIA ====================

  /** Cargar configuración desde localStorage */
  private cargarConfiguracion(): void {
    try {
      // Cargar configuraciones guardadas
      const savedConfigs = localStorage.getItem(STORAGE_KEY);
      let configuraciones: DashboardConfig[] = [];

      if (savedConfigs) {
        configuraciones = JSON.parse(savedConfigs);
        // Restaurar fechas y filtrar widgets con tipos inválidos
        configuraciones = configuraciones.map(c => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
          widgets: c.widgets
            .map(w => {
              // Migrar tipos de widget antiguos a los nuevos
              let tipo: TipoWidget = w.tipo as TipoWidget;
              const oldTipo = w.tipo as string;
              let config = { ...w.config };

              if (WIDGET_TYPE_MIGRATION[oldTipo]) {
                console.info(`Migrando widget tipo "${oldTipo}" a "${WIDGET_TYPE_MIGRATION[oldTipo]}"`);
                tipo = WIDGET_TYPE_MIGRATION[oldTipo];

                // Agregar config por defecto para gráficas migradas
                if (tipo === 'graficas-interactivas') {
                  config = {
                    ...config,
                    graficaTipo: oldTipo === 'chart-line' ? 'line' : oldTipo === 'chart-bar' ? 'column' : 'donut',
                    graficaFuenteDatos: config.graficaFuenteDatos || 'procesos',
                    graficaAgrupacion: config.graficaAgrupacion || 'estado',
                    graficaPaleta: config.graficaPaleta || 'vibrant',
                    graficaTema: config.graficaTema || 'light'
                  };
                }
              }
              return { ...w, tipo, config } as DashboardWidget;
            })
            .filter(w => {
              const isValid = VALID_WIDGET_TYPES.includes(w.tipo as TipoWidget);
              if (!isValid) {
                console.warn(`Widget con tipo inválido filtrado: ${w.tipo}`);
              }
              return isValid;
            })
            .map(w => ({
              ...w,
              createdAt: w.createdAt ? new Date(w.createdAt) : undefined,
              updatedAt: w.updatedAt ? new Date(w.updatedAt) : undefined
            }))
        }));
      }

      // Si no hay configuraciones, usar la por defecto
      if (configuraciones.length === 0) {
        configuraciones = [{ ...DEFAULT_DASHBOARD_CONFIG }];
      }

      // Agregar dashboard de galería de gráficas si no existe (para pruebas)
      if (!configuraciones.find(c => c.id === 'galeria-graficas')) {
        configuraciones.push({ ...GALLERY_DASHBOARD_CONFIG });
      }

      // Cargar el estado guardado (última configuración usada)
      const savedState = localStorage.getItem(STORAGE_STATE_KEY);
      let configActualId = 'default';

      if (savedState) {
        const state = JSON.parse(savedState);
        configActualId = state.lastConfigId || 'default';
      }

      // Encontrar la configuración actual
      let configActual = configuraciones.find(c => c.id === configActualId);
      if (!configActual) {
        configActual = configuraciones.find(c => c.isDefault) || configuraciones[0];
      }

      this.estado.set({
        configActual,
        configuraciones,
        modoEdicion: false,
        widgetSeleccionado: null,
        isDragging: false,
        isResizing: false,
        hasUnsavedChanges: false
      });

    } catch (error) {
      console.error('Error cargando configuración del dashboard:', error);
      // Usar configuración por defecto en caso de error
      this.estado.set({
        configActual: { ...DEFAULT_DASHBOARD_CONFIG },
        configuraciones: [{ ...DEFAULT_DASHBOARD_CONFIG }],
        modoEdicion: false,
        widgetSeleccionado: null,
        isDragging: false,
        isResizing: false,
        hasUnsavedChanges: false
      });
    }
  }

  /** Guardar configuración en localStorage */
  guardarConfiguracion(): void {
    try {
      const { configuraciones, configActual } = this.estado();

      // Actualizar la configuración actual en la lista
      if (configActual) {
        const index = configuraciones.findIndex(c => c.id === configActual.id);
        const updatedConfig = { ...configActual, updatedAt: new Date() };

        let updatedConfigs: DashboardConfig[];
        if (index >= 0) {
          updatedConfigs = [...configuraciones];
          updatedConfigs[index] = updatedConfig;
        } else {
          updatedConfigs = [...configuraciones, updatedConfig];
        }

        // Guardar en localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfigs));
        localStorage.setItem(STORAGE_STATE_KEY, JSON.stringify({ lastConfigId: configActual.id }));

        this.estado.update(s => ({
          ...s,
          configuraciones: updatedConfigs,
          configActual: updatedConfig,
          hasUnsavedChanges: false
        }));
      }
    } catch (error) {
      console.error('Error guardando configuración del dashboard:', error);
    }
  }

  /** Restaurar configuración por defecto */
  restaurarDefecto(): void {
    const defaultConfig = { ...DEFAULT_DASHBOARD_CONFIG, updatedAt: new Date() };

    this.estado.update(s => ({
      ...s,
      configActual: defaultConfig,
      hasUnsavedChanges: true
    }));
  }

  // ==================== MÉTODOS DE MODO EDICIÓN ====================

  /** Activar modo edición */
  activarModoEdicion(): void {
    this.estado.update(s => ({ ...s, modoEdicion: true }));
  }

  /** Desactivar modo edición */
  desactivarModoEdicion(): void {
    this.estado.update(s => ({
      ...s,
      modoEdicion: false,
      widgetSeleccionado: null
    }));
  }

  /** Toggle modo edición */
  toggleModoEdicion(): void {
    if (this.modoEdicion()) {
      this.desactivarModoEdicion();
    } else {
      this.activarModoEdicion();
    }
  }

  // ==================== MÉTODOS DE WIDGETS ====================

  /** Agregar widget al dashboard */
  agregarWidget(catalogItem: WidgetCatalogItem, position?: { x: number; y: number }): void {
    const config = this.configActual();
    if (!config) return;

    // Encontrar posición libre si no se especifica
    const pos = position || this.encontrarPosicionLibre(catalogItem);
    const nuevoWidget = createWidgetFromCatalog(catalogItem, pos);

    this.estado.update(s => ({
      ...s,
      configActual: s.configActual ? {
        ...s.configActual,
        widgets: [...s.configActual.widgets, nuevoWidget]
      } : null,
      hasUnsavedChanges: true
    }));
  }

  /** Agregar widget con configuración personalizada */
  agregarWidgetConConfig(
    catalogItem: WidgetCatalogItem,
    titulo: string,
    subtitulo: string,
    widgetConfig: Record<string, any>,
    position?: { x: number; y: number }
  ): void {
    const config = this.configActual();
    if (!config) return;

    // Encontrar posición libre si no se especifica
    const pos = position || this.encontrarPosicionLibre(catalogItem);
    const baseWidget = createWidgetFromCatalog(catalogItem, pos);

    // Sobrescribir con configuración personalizada
    const nuevoWidget: DashboardWidget = {
      ...baseWidget,
      titulo: titulo || baseWidget.titulo,
      subtitulo: subtitulo || undefined,
      config: {
        ...baseWidget.config,
        ...widgetConfig
      }
    };

    this.estado.update(s => ({
      ...s,
      configActual: s.configActual ? {
        ...s.configActual,
        widgets: [...s.configActual.widgets, nuevoWidget]
      } : null,
      hasUnsavedChanges: true
    }));
  }

  /** Eliminar widget del dashboard */
  eliminarWidget(widgetId: string): void {
    this.estado.update(s => ({
      ...s,
      configActual: s.configActual ? {
        ...s.configActual,
        widgets: s.configActual.widgets.filter(w => w.id !== widgetId)
      } : null,
      widgetSeleccionado: s.widgetSeleccionado === widgetId ? null : s.widgetSeleccionado,
      hasUnsavedChanges: true
    }));
  }

  /** Duplicar widget */
  duplicarWidget(widgetId: string): void {
    const config = this.configActual();
    if (!config) return;

    const widget = config.widgets.find(w => w.id === widgetId);
    if (!widget) return;

    const nuevoWidget: DashboardWidget = {
      ...widget,
      id: generateWidgetId(),
      x: widget.x + 1,
      y: widget.y,
      titulo: `${widget.titulo} (copia)`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.estado.update(s => ({
      ...s,
      configActual: s.configActual ? {
        ...s.configActual,
        widgets: [...s.configActual.widgets, nuevoWidget]
      } : null,
      hasUnsavedChanges: true
    }));
  }

  /** Actualizar configuración de widget */
  actualizarWidget(widgetId: string, changes: Partial<DashboardWidget>): void {
    this.estado.update(s => ({
      ...s,
      configActual: s.configActual ? {
        ...s.configActual,
        widgets: s.configActual.widgets.map(w =>
          w.id === widgetId ? { ...w, ...changes, updatedAt: new Date() } : w
        )
      } : null,
      hasUnsavedChanges: true
    }));
  }

  /** Seleccionar widget */
  seleccionarWidget(widgetId: string | null): void {
    this.estado.update(s => ({ ...s, widgetSeleccionado: widgetId }));
  }

  // ==================== CALLBACKS DE GRIDSTER ====================

  /** Callback cuando un widget cambia de posición - usa debounce */
  private onWidgetChange(widget: DashboardWidget): void {
    // Emitir al Subject con debounce para evitar múltiples actualizaciones
    this.widgetChange$.next(widget);
  }

  /** Callback cuando un widget se redimensiona - usa debounce */
  private onWidgetResize(widget: DashboardWidget): void {
    // Emitir al Subject con debounce para evitar múltiples actualizaciones
    this.widgetResize$.next(widget);
  }

  // ==================== MÉTODOS DE CONFIGURACIÓN ====================

  /** Crear nueva configuración de dashboard */
  crearNuevaConfiguracion(nombre: string, descripcion?: string): void {
    const nuevaConfig: DashboardConfig = {
      id: `dashboard-${Date.now()}`,
      nombre,
      descripcion,
      isDefault: false,
      isLocked: false,
      columns: 4,
      rowHeight: 120,
      gap: 16,
      widgets: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.estado.update(s => ({
      ...s,
      configuraciones: [...s.configuraciones, nuevaConfig],
      configActual: nuevaConfig,
      hasUnsavedChanges: true
    }));
  }

  /** Cambiar a otra configuración */
  cambiarConfiguracion(configId: string): void {
    const config = this.estado().configuraciones.find(c => c.id === configId);
    if (config) {
      this.estado.update(s => ({
        ...s,
        configActual: config,
        widgetSeleccionado: null,
        hasUnsavedChanges: false
      }));

      // Guardar última configuración usada
      localStorage.setItem(STORAGE_STATE_KEY, JSON.stringify({ lastConfigId: configId }));
    }
  }

  /** Eliminar configuración */
  eliminarConfiguracion(configId: string): void {
    const { configuraciones, configActual } = this.estado();

    // No permitir eliminar si solo hay una configuración
    if (configuraciones.length <= 1) return;

    // No permitir eliminar la configuración por defecto
    const config = configuraciones.find(c => c.id === configId);
    if (config?.isDefault) return;

    const nuevasConfigs = configuraciones.filter(c => c.id !== configId);

    // Si se elimina la actual, cambiar a otra
    let nuevaActual = configActual;
    if (configActual?.id === configId) {
      nuevaActual = nuevasConfigs.find(c => c.isDefault) || nuevasConfigs[0];
    }

    this.estado.update(s => ({
      ...s,
      configuraciones: nuevasConfigs,
      configActual: nuevaActual
    }));

    // Guardar cambios
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevasConfigs));
  }

  /** Renombrar configuración */
  renombrarConfiguracion(configId: string, nuevoNombre: string): void {
    this.estado.update(s => ({
      ...s,
      configuraciones: s.configuraciones.map(c =>
        c.id === configId ? { ...c, nombre: nuevoNombre, updatedAt: new Date() } : c
      ),
      configActual: s.configActual?.id === configId
        ? { ...s.configActual, nombre: nuevoNombre, updatedAt: new Date() }
        : s.configActual,
      hasUnsavedChanges: true
    }));
  }

  /** Actualizar opciones del layout */
  actualizarLayoutOptions(options: { columns?: number; rowHeight?: number; gap?: number }): void {
    this.estado.update(s => ({
      ...s,
      configActual: s.configActual ? {
        ...s.configActual,
        ...options,
        updatedAt: new Date()
      } : null,
      hasUnsavedChanges: true
    }));
  }

  // ==================== MÉTODOS AUXILIARES ====================

  /** Encontrar posición libre para un nuevo widget */
  private encontrarPosicionLibre(catalogItem: WidgetCatalogItem): { x: number; y: number } {
    const config = this.configActual();
    if (!config) return { x: 0, y: 0 };

    const widgets = config.widgets;
    const cols = config.columns;

    // Crear mapa de ocupación
    const ocupado: boolean[][] = [];
    const maxY = Math.max(...widgets.map(w => w.y + w.rows), 0) + 10;

    for (let y = 0; y < maxY; y++) {
      ocupado[y] = new Array(cols).fill(false);
    }

    // Marcar celdas ocupadas
    widgets.forEach(w => {
      for (let dy = 0; dy < w.rows; dy++) {
        for (let dx = 0; dx < w.cols; dx++) {
          if (ocupado[w.y + dy]) {
            ocupado[w.y + dy][w.x + dx] = true;
          }
        }
      }
    });

    // Buscar primera posición libre
    const minCols = catalogItem.minCols || 1;
    const minRows = catalogItem.minRows || 1;

    for (let y = 0; y < maxY; y++) {
      for (let x = 0; x <= cols - minCols; x++) {
        let fits = true;
        for (let dy = 0; dy < minRows && fits; dy++) {
          for (let dx = 0; dx < minCols && fits; dx++) {
            if (ocupado[y + dy]?.[x + dx]) {
              fits = false;
            }
          }
        }
        if (fits) {
          return { x, y };
        }
      }
    }

    // Si no hay espacio, poner al final
    return { x: 0, y: maxY };
  }

  /** Obtener widget por tipo */
  getWidgetsPorTipo(tipo: TipoWidget): DashboardWidget[] {
    return this.widgets().filter(w => w.tipo === tipo);
  }

  /** Verificar si un tipo de widget ya existe */
  existeWidgetTipo(tipo: TipoWidget): boolean {
    return this.widgets().some(w => w.tipo === tipo);
  }
}
