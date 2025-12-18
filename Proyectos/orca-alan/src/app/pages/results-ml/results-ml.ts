import { Component, inject, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DrawerModule } from 'primeng/drawer';
import { DividerModule } from 'primeng/divider';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { TabsModule } from 'primeng/tabs';
import { BadgeModule } from 'primeng/badge';
import { ToolbarModule } from 'primeng/toolbar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MenuModule } from 'primeng/menu';
import { ProgressBarModule } from 'primeng/progressbar';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { AccordionModule } from 'primeng/accordion';
import { TimelineModule } from 'primeng/timeline';
import { AvatarModule } from 'primeng/avatar';
import { ChipModule } from 'primeng/chip';
import { DatePickerModule } from 'primeng/datepicker';
import { PopoverModule, Popover } from 'primeng/popover';

// Tipo para el menú contextual
type AccionMenuContextual = 'menu' | 'aprobar' | 'descartar' | 'contexto';

// Services & Models
import { ResultsMLService } from '../../services/results-ml.service';
import {
  EntidadML,
  TipoHallazgo,
  EstadoHallazgo,
  Tendencia,
  MitigacionSugerida,
  Oportunidad,
  RiesgoML,
  HallazgoBase,
  MOTIVOS_DESCARTE,
  ESTADO_HALLAZGO_OPTIONS,
  TIPO_TENDENCIA_OPTIONS,
  PRIORIDAD_OPTIONS,
  TIPO_HALLAZGO_OPTIONS
} from '../../models/results-ml.models';

@Component({
  selector: 'app-results-ml',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    TooltipModule,
    DrawerModule,
    DividerModule,
    DialogModule,
    SelectModule,
    MultiSelectModule,
    TabsModule,
    BadgeModule,
    ToolbarModule,
    IconFieldModule,
    InputIconModule,
    MenuModule,
    ProgressBarModule,
    TextareaModule,
    CheckboxModule,
    AccordionModule,
    TimelineModule,
    AvatarModule,
    ChipModule,
    DatePickerModule,
    PopoverModule
  ],
  templateUrl: './results-ml.html',
  styleUrl: './results-ml.scss'
})
export class ResultsMLComponent {
  service = inject(ResultsMLService);

  // Estado del servicio
  estado = this.service.getEstado();
  entidadesFiltradas = this.service.entidadesFiltradas;
  entidadesRecientes = this.service.getEntidadesRecientes();
  resultadoActual = this.service.resultadoActual;
  todosLosHallazgos = this.service.todosLosHallazgos;
  hallazgosFiltrados = this.service.hallazgosFiltrados;
  contadoresPorEstado = this.service.contadoresPorEstado;
  busquedaEntidad = this.service.busquedaEntidad;
  filtroTiposHallazgo = this.service.filtroTiposHallazgo;
  busquedaHallazgoService = this.service.busquedaHallazgo;

  // Estado local
  tipoEntidadFiltro = signal<'activo' | 'proceso' | 'todos'>('todos');
  showDetalleDrawer = signal(false);
  hallazgoSeleccionado = signal<HallazgoBase | null>(null);

  // Selección y acciones masivas
  hallazgosSeleccionados = signal<HallazgoBase[]>([]);
  showAccionesMasivasDrawer = signal(false);

  // Filtros de hallazgos (conectados al servicio)
  filtroEstadoHallazgo = this.service.filtroEstadosHallazgo;
  filtroConfianza = signal<string | null>(null);
  filtroFecha = signal<Date[] | null>(null);
  busquedaHallazgo = signal('');

  // Opciones de filtro de confianza para el select
  confianzaFilterOptions = [
    { label: 'Alta (≥80%)', value: 'alta' },
    { label: 'Media (50-79%)', value: 'media' },
    { label: 'Baja (<50%)', value: 'baja' }
  ];

  // Dialogs
  showAprobarDialog = signal(false);
  showDescartarDialog = signal(false);
  showContextoDialog = signal(false);
  showContextoMasivoDialog = signal(false);
  showConfirmDeleteDialog = signal(false);

  // Formularios
  aprobacionForm = signal({
    crearRiesgo: false,
    crearTarea: false,
    comentarios: ''
  });

  descarteForm = signal({
    motivo: '',
    justificacion: ''
  });

  contextoForm = signal({
    contexto: '',
    tipoContexto: 'observacion' as 'observacion' | 'correccion' | 'informacion_adicional'
  });

  tiposContexto: { label: string; value: 'observacion' | 'correccion' | 'informacion_adicional'; icon: string }[] = [
    { label: 'Observación', value: 'observacion', icon: 'pi pi-eye' },
    { label: 'Corrección', value: 'correccion', icon: 'pi pi-pencil' },
    { label: 'Información adicional', value: 'informacion_adicional', icon: 'pi pi-info-circle' }
  ];

  // Opciones
  motivosDescarte = MOTIVOS_DESCARTE;
  estadoOptions = ESTADO_HALLAZGO_OPTIONS;
  tipoTendenciaOptions = TIPO_TENDENCIA_OPTIONS;
  prioridadOptions = PRIORIDAD_OPTIONS;
  tipoHallazgoOptions = TIPO_HALLAZGO_OPTIONS;

  // Opciones de filtro de confianza
  confianzaOptions = [
    { label: 'Alta (≥80%)', value: 80 },
    { label: 'Media (≥50%)', value: 50 },
    { label: 'Baja (<50%)', value: 0 }
  ];

  // Opciones de tipo de entidad para el select
  tipoEntidadOptions = [
    { label: 'Todos', value: 'todos', icon: 'pi pi-list' },
    { label: 'Activos', value: 'activo', icon: 'pi pi-box' },
    { label: 'Procesos', value: 'proceso', icon: 'pi pi-sitemap' }
  ];

  // Computed: Entidades filtradas por tipo
  entidadesFiltradasPorTipo = computed(() => {
    const entidades = this.entidadesFiltradas();
    const tipo = this.tipoEntidadFiltro();

    if (tipo === 'todos') return entidades;
    return entidades.filter(e => e.tipo === tipo);
  });

  // Computed: Totales globales de hallazgos pendientes
  totalHallazgosPendientes = computed(() => {
    return this.entidadesFiltradas().reduce((sum, e) => sum + e.cantidadHallazgosPendientes, 0);
  });

  // Métodos de navegación
  seleccionarEntidad(entidad: EntidadML): void {
    this.service.seleccionarEntidad(entidad);
  }

  volverABusqueda(): void {
    this.service.limpiarSeleccion();
  }

  refrescarDatos(): void {
    // Resetear filtros y recargar datos
    this.tipoEntidadFiltro.set('todos');
    this.busquedaEntidad.set('');
  }

  // Métodos de filtros de tipo hallazgo
  onFiltroTipoChange(tipos: TipoHallazgo[]): void {
    this.filtroTiposHallazgo.set(tipos);
  }

  onBusquedaHallazgoServiceChange(texto: string): void {
    this.busquedaHallazgoService.set(texto);
  }

  // Métodos de detalle
  verDetalleHallazgo(hallazgo: HallazgoBase): void {
    this.hallazgoSeleccionado.set(hallazgo);
    this.showDetalleDrawer.set(true);
  }

  // Métodos de acciones
  abrirAprobarDialog(hallazgo: HallazgoBase): void {
    this.hallazgoSeleccionado.set(hallazgo);
    this.aprobacionForm.set({ crearRiesgo: false, crearTarea: false, comentarios: '' });
    this.showAprobarDialog.set(true);
  }

  abrirDescartarDialog(hallazgo: HallazgoBase): void {
    this.hallazgoSeleccionado.set(hallazgo);
    this.descarteForm.set({ motivo: '', justificacion: '' });
    this.showDescartarDialog.set(true);
  }

  abrirContextoParaHallazgo(hallazgo: HallazgoBase): void {
    this.hallazgoSeleccionado.set(hallazgo);
    this.contextoForm.set({ contexto: '', tipoContexto: 'observacion' });
    this.showContextoDialog.set(true);
  }

  confirmarAprobacion(): void {
    const hallazgo = this.hallazgoSeleccionado();
    if (!hallazgo) return;

    const form = this.aprobacionForm();
    this.service.aprobarHallazgo(hallazgo.id, {
      crearRiesgo: form.crearRiesgo,
      crearTarea: form.crearTarea,
      comentarios: form.comentarios
    });

    this.showAprobarDialog.set(false);
    this.showDetalleDrawer.set(false);
  }

  confirmarDescarte(): void {
    const hallazgo = this.hallazgoSeleccionado();
    if (!hallazgo) return;

    const form = this.descarteForm();
    this.service.descartarHallazgo(hallazgo.id, form.motivo, form.justificacion);

    this.showDescartarDialog.set(false);
    this.showDetalleDrawer.set(false);
  }

  // Helpers
  getConfianzaTag = this.service.getConfianzaTag.bind(this.service);
  getEstadoTag = this.service.getEstadoTag.bind(this.service);
  getPrioridadTag = this.service.getPrioridadTag.bind(this.service);
  formatearEstado = this.service.formatearEstado.bind(this.service);
  formatearFecha = this.service.formatearFecha.bind(this.service);
  formatearFechaHora = this.service.formatearFechaHora.bind(this.service);

  getTipoEntidadIcon(tipo: string): string {
    return tipo === 'activo' ? 'pi pi-box' : 'pi pi-sitemap';
  }

  getTipoTendenciaIcon(tipo: string): string {
    const icons: Record<string, string> = {
      'correlacion': 'pi pi-chart-scatter',
      'anomalia': 'pi pi-exclamation-triangle',
      'patron_temporal': 'pi pi-clock',
      'cluster': 'pi pi-th-large'
    };
    return icons[tipo] || 'pi pi-chart-line';
  }

  getTipoTendenciaLabel(tipo: string): string {
    const labels: Record<string, string> = {
      'correlacion': 'Correlación',
      'anomalia': 'Anomalía',
      'patron_temporal': 'Patrón Temporal',
      'cluster': 'Cluster'
    };
    return labels[tipo] || tipo;
  }

  getTipoOportunidadLabel(tipo: string): string {
    const labels: Record<string, string> = {
      'optimizacion': 'Optimización',
      'eficiencia': 'Eficiencia',
      'reduccion_costos': 'Reducción de Costos'
    };
    return labels[tipo] || tipo;
  }

  // Helpers para tipo de hallazgo
  getTipoHallazgoIcon(tipo: TipoHallazgo): string {
    const icons: Record<TipoHallazgo, string> = {
      'tendencia': 'pi pi-chart-line',
      'mitigacion': 'pi pi-shield',
      'oportunidad': 'pi pi-lightbulb',
      'riesgo': 'pi pi-exclamation-triangle'
    };
    return icons[tipo] || 'pi pi-question';
  }

  getTipoHallazgoLabel(tipo: TipoHallazgo): string {
    const labels: Record<TipoHallazgo, string> = {
      'tendencia': 'Tendencia',
      'mitigacion': 'Mitigación',
      'oportunidad': 'Oportunidad',
      'riesgo': 'Riesgo'
    };
    return labels[tipo] || tipo;
  }

  getTipoHallazgoSeverity(tipo: TipoHallazgo): 'info' | 'warn' | 'success' | 'danger' {
    const severities: Record<TipoHallazgo, 'info' | 'warn' | 'success' | 'danger'> = {
      'tendencia': 'info',
      'mitigacion': 'warn',
      'oportunidad': 'success',
      'riesgo': 'danger'
    };
    return severities[tipo] || 'info';
  }

  // Cast helpers para templates
  asTendencia(hallazgo: HallazgoBase): Tendencia {
    return hallazgo as Tendencia;
  }

  asMitigacion(hallazgo: HallazgoBase): MitigacionSugerida {
    return hallazgo as MitigacionSugerida;
  }

  asOportunidad(hallazgo: HallazgoBase): Oportunidad {
    return hallazgo as Oportunidad;
  }

  asRiesgo(hallazgo: HallazgoBase): RiesgoML {
    return hallazgo as RiesgoML;
  }

  // Exportación
  exportarResultados(): void {
    console.log('Exportando resultados...');
  }

  // Métodos para actualizar formularios (evitar arrow functions en template)
  updateAprobacionCrearRiesgo(value: boolean): void {
    this.aprobacionForm.update(f => ({ ...f, crearRiesgo: value }));
  }

  updateAprobacionCrearTarea(value: boolean): void {
    this.aprobacionForm.update(f => ({ ...f, crearTarea: value }));
  }

  updateAprobacionComentarios(value: string): void {
    this.aprobacionForm.update(f => ({ ...f, comentarios: value }));
  }

  updateDescarteMotivo(value: string): void {
    this.descarteForm.update(f => ({ ...f, motivo: value }));
  }

  updateDescarteJustificacion(value: string): void {
    this.descarteForm.update(f => ({ ...f, justificacion: value }));
  }

  updateContextoTexto(value: string): void {
    this.contextoForm.update(f => ({ ...f, contexto: value }));
  }

  updateContextoTipo(value: 'observacion' | 'correccion' | 'informacion_adicional'): void {
    this.contextoForm.update(f => ({ ...f, tipoContexto: value }));
  }

  confirmarContexto(): void {
    const hallazgo = this.hallazgoSeleccionado();
    if (!hallazgo) return;

    const form = this.contextoForm();
    // Aquí se podría llamar a un servicio para guardar el contexto
    console.log('Contexto agregado:', {
      hallazgoId: hallazgo.id,
      contexto: form.contexto,
      tipoContexto: form.tipoContexto
    });

    this.showContextoDialog.set(false);
    this.contextoForm.set({ contexto: '', tipoContexto: 'observacion' });
  }

  // Navegación entre módulos
  navegarAActivo(activoId: string): void {
    this.service.navegarAActivo(activoId);
  }

  navegarARiesgos(activoId?: string): void {
    this.service.navegarARiesgos(activoId);
  }

  // ========== Selección y Acciones Masivas ==========
  onSelectionChange(selection: HallazgoBase[]): void {
    this.hallazgosSeleccionados.set(selection);
  }

  abrirAccionesMasivasDrawer(): void {
    this.showAccionesMasivasDrawer.set(true);
  }

  limpiarSeleccion(): void {
    this.hallazgosSeleccionados.set([]);
  }

  toggleSeleccionTodos(seleccionar: boolean): void {
    if (seleccionar) {
      this.hallazgosSeleccionados.set([...this.todosLosHallazgos()]);
    } else {
      this.hallazgosSeleccionados.set([]);
    }
  }

  // Eliminar seleccionados
  eliminarSeleccionados(): void {
    this.showConfirmDeleteDialog.set(true);
  }

  confirmarEliminarSeleccionados(): void {
    const seleccionados = this.hallazgosSeleccionados();
    seleccionados.forEach(hallazgo => {
      this.service.descartarHallazgo(hallazgo.id, 'eliminacion_masiva', 'Eliminado mediante acción masiva');
    });

    this.hallazgosSeleccionados.set([]);
    this.showConfirmDeleteDialog.set(false);
    this.showAccionesMasivasDrawer.set(false);
  }

  // Aprobar seleccionados masivamente
  aprobarSeleccionados(): void {
    const seleccionados = this.hallazgosSeleccionados();
    seleccionados.forEach(hallazgo => {
      if (hallazgo.estado === 'pendiente') {
        this.service.aprobarHallazgo(hallazgo.id, {
          crearRiesgo: false,
          crearTarea: false,
          comentarios: 'Aprobado mediante acción masiva'
        });
      }
    });

    this.hallazgosSeleccionados.set([]);
    this.showAccionesMasivasDrawer.set(false);
  }

  // Descartar seleccionados masivamente
  descartarSeleccionados(): void {
    const seleccionados = this.hallazgosSeleccionados();
    seleccionados.forEach(hallazgo => {
      if (hallazgo.estado === 'pendiente') {
        this.service.descartarHallazgo(hallazgo.id, 'otro', 'Descartado mediante acción masiva');
      }
    });

    this.hallazgosSeleccionados.set([]);
    this.showAccionesMasivasDrawer.set(false);
  }

  // Contar pendientes en selección
  getPendientesEnSeleccion(): number {
    return this.hallazgosSeleccionados().filter(h => h.estado === 'pendiente').length;
  }

  // Abrir contexto masivo
  abrirContextoMasivo(): void {
    this.contextoForm.set({ contexto: '', tipoContexto: 'observacion' });
    this.showContextoMasivoDialog.set(true);
  }

  // Confirmar contexto masivo
  confirmarContextoMasivo(): void {
    const seleccionados = this.hallazgosSeleccionados();
    const form = this.contextoForm();

    seleccionados.forEach(hallazgo => {
      console.log('Contexto agregado:', {
        hallazgoId: hallazgo.id,
        contexto: form.contexto,
        tipoContexto: form.tipoContexto
      });
    });

    this.showContextoMasivoDialog.set(false);
    this.showAccionesMasivasDrawer.set(false);
    this.contextoForm.set({ contexto: '', tipoContexto: 'observacion' });
  }

  // ========== Filtros de Hallazgos ==========
  onFiltroEstadoChange(estados: EstadoHallazgo[]): void {
    this.service.filtroEstadosHallazgo.set(estados);
  }

  onFiltroConfianzaChange(valor: string | null): void {
    this.filtroConfianza.set(valor);
    this.service.filtroConfianza.set(valor);
  }

  onFiltroFechaChange(fechas: Date[] | null): void {
    this.filtroFecha.set(fechas);
    this.service.filtroFechaRango.set(fechas);
  }

  onBusquedaHallazgoChange(texto: string): void {
    this.busquedaHallazgo.set(texto);
  }

  limpiarFiltrosHallazgos(): void {
    this.service.filtroEstadosHallazgo.set([]);
    this.filtroConfianza.set(null);
    this.service.filtroConfianza.set(null);
    this.filtroFecha.set(null);
    this.service.filtroFechaRango.set(null);
    this.busquedaHallazgo.set('');
    this.service.filtroTiposHallazgo.set([]);
    this.service.busquedaHallazgo.set('');
  }

  hayFiltrosActivos(): boolean {
    return this.service.filtroEstadosHallazgo().length > 0 ||
           this.filtroConfianza() !== null ||
           this.filtroFecha() !== null ||
           this.service.filtroTiposHallazgo().length > 0 ||
           this.service.busquedaHallazgo().trim() !== '';
  }
}
