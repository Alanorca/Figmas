import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DrawerModule } from 'primeng/drawer';
import { DividerModule } from 'primeng/divider';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { ConfirmationService, MessageService, MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { ToolbarModule } from 'primeng/toolbar';
import { CheckboxModule } from 'primeng/checkbox';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TabsModule } from 'primeng/tabs';
import { ChartModule } from 'primeng/chart';
import { DatePickerModule } from 'primeng/datepicker';
import { ProcessService } from '../../services/process.service';
import { Proceso } from '../../models/process-nodes';

// Types for KPI Dashboard
type PeriodoFiltro = 'semana' | 'mes' | 'trimestre' | 'anio';
type TendenciaDir = 'up' | 'down' | 'neutral';
type AlertSeverity = 'info' | 'warning' | 'critical';
type AlertStatus = 'activa' | 'atendida' | 'resuelta';

// Resumen de KPIs por proceso (para drill-down)
interface ProcesoKPIResumen {
  procesoId: string;
  procesoNombre: string;
  estado: 'activo' | 'borrador' | 'inactivo' | 'archivado';
  totalObjetivos: number;
  totalKPIs: number;
  cumplimientoPromedio: number;
  cumplimientoAnterior: number;
  tendencia: TendenciaDir;
  alertasActivas: number;
  alertasCriticas: number;
  ultimaActualizacion: Date;
}

// Alerta consolidada de cualquier proceso
interface AlertaConsolidada {
  id: string;
  procesoId: string;
  procesoNombre: string;
  objetivoId: string;
  objetivoNombre: string;
  kpiId: string;
  kpiNombre: string;
  severity: AlertSeverity;
  status: AlertStatus;
  mensaje: string;
  valorActual: number;
  valorUmbral: number;
  fechaCreacion: Date;
  diasAbierto: number;
}

// KPI Metric para widgets top
interface KPIMetricGlobal {
  id: string;
  nombre: string;
  valor: number;
  valorAnterior: number;
  meta?: number;
  unidad: string;
  tendencia: TendenciaDir;
  porcentajeCambio: number;
  color: string;
}

@Component({
  selector: 'app-procesos-lista',
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
    ConfirmDialogModule,
    ToastModule,
    SelectModule,
    MenuModule,
    ToolbarModule,
    CheckboxModule,
    IconFieldModule,
    InputIconModule,
    TabsModule,
    ChartModule,
    DatePickerModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './procesos-lista.html',
  styleUrl: './procesos-lista.scss'
})
export class ProcesosListaComponent {
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  processService = inject(ProcessService);

  // Lista de procesos
  procesos = this.processService.procesos;

  // Drawer de detalle
  showDrawer = signal(false);
  procesoSeleccionado = signal<Proceso | null>(null);

  // Selección múltiple
  procesosSeleccionados = signal<Proceso[]>([]);

  // Edición in-place
  procesoEditando = signal<string | null>(null);
  valoresEdicion = signal<Record<string, any>>({});

  // Drawer de acciones masivas
  showAccionesMasivasDrawer = signal(false);

  // Opciones de estado para filtro
  estadoOptions: { label: string; value: Proceso['estado'] }[] = [
    { label: 'Borrador', value: 'borrador' },
    { label: 'Activo', value: 'activo' },
    { label: 'Inactivo', value: 'inactivo' },
    { label: 'Archivado', value: 'archivado' }
  ];

  // ==================== DASHBOARD KPIs ====================
  tabActivo = signal<'tabla' | 'dashboard'>('tabla');

  // Filtros del dashboard
  periodoFiltro = signal<PeriodoFiltro>('mes');
  severidadFiltro = signal<AlertSeverity | null>(null);
  estadoProcesoFiltro = signal<string | null>(null);

  periodoOptions = [
    { label: 'Última semana', value: 'semana' },
    { label: 'Último mes', value: 'mes' },
    { label: 'Último trimestre', value: 'trimestre' },
    { label: 'Último año', value: 'anio' }
  ];

  severidadOptions = [
    { label: 'Todas', value: null },
    { label: 'Crítico', value: 'critical' },
    { label: 'Advertencia', value: 'warning' },
    { label: 'Info', value: 'info' }
  ];

  // KPIs Globales calculados desde datos reales
  kpiMetricsGlobal = computed<KPIMetricGlobal[]>(() => {
    const procesos = this.procesosKPIResumen();
    const alertas = this.alertasConsolidadas();

    // Procesos activos
    const procesosActivos = procesos.filter(p => p.estado === 'activo').length;
    const procesosActivosAnterior = Math.max(1, procesosActivos - 1); // Mock para periodo anterior

    // Cumplimiento promedio (solo procesos activos)
    const procesosParaCumplimiento = procesos.filter(p => p.estado === 'activo');
    const cumplimientoActual = procesosParaCumplimiento.length > 0
      ? procesosParaCumplimiento.reduce((sum, p) => sum + p.cumplimientoPromedio, 0) / procesosParaCumplimiento.length
      : 0;
    const cumplimientoAnterior = procesosParaCumplimiento.length > 0
      ? procesosParaCumplimiento.reduce((sum, p) => sum + p.cumplimientoAnterior, 0) / procesosParaCumplimiento.length
      : 0;

    // Alertas activas
    const alertasActivas = alertas.filter(a => a.status === 'activa').length;
    const alertasActivasAnterior = alertasActivas + 2; // Mock

    // KPIs en riesgo (alertas críticas)
    const kpisEnRiesgo = alertas.filter(a => a.status === 'activa' && a.severity === 'critical').length;
    const kpisEnRiesgoAnterior = kpisEnRiesgo + 1; // Mock

    const calcPorcentaje = (actual: number, anterior: number) =>
      anterior !== 0 ? ((actual - anterior) / anterior) * 100 : 0;

    return [
      {
        id: 'g1', nombre: 'Procesos Activos',
        valor: procesosActivos, valorAnterior: procesosActivosAnterior,
        unidad: '', tendencia: procesosActivos >= procesosActivosAnterior ? 'up' : 'down',
        porcentajeCambio: calcPorcentaje(procesosActivos, procesosActivosAnterior), color: 'primary'
      },
      {
        id: 'g2', nombre: 'Cumplimiento Promedio',
        valor: Math.round(cumplimientoActual * 10) / 10, valorAnterior: Math.round(cumplimientoAnterior * 10) / 10,
        unidad: '%', tendencia: cumplimientoActual >= cumplimientoAnterior ? 'up' : 'down',
        porcentajeCambio: Math.round(calcPorcentaje(cumplimientoActual, cumplimientoAnterior) * 10) / 10, color: 'success'
      },
      {
        id: 'g3', nombre: 'Alertas Activas',
        valor: alertasActivas, valorAnterior: alertasActivasAnterior,
        unidad: '', tendencia: alertasActivas <= alertasActivasAnterior ? 'up' : 'down',
        porcentajeCambio: calcPorcentaje(alertasActivas, alertasActivasAnterior), color: 'warning'
      },
      {
        id: 'g4', nombre: 'KPIs en Riesgo',
        valor: kpisEnRiesgo, valorAnterior: kpisEnRiesgoAnterior,
        unidad: '', tendencia: kpisEnRiesgo <= kpisEnRiesgoAnterior ? 'up' : 'down',
        porcentajeCambio: calcPorcentaje(kpisEnRiesgo, kpisEnRiesgoAnterior), color: 'danger'
      }
    ];
  });

  // Resumen de KPIs por proceso (para drill-down)
  procesosKPIResumen = signal<ProcesoKPIResumen[]>([
    {
      procesoId: 'proc-demo-001',
      procesoNombre: 'Gestión de Riesgos Operacionales',
      estado: 'activo',
      totalObjetivos: 6,
      totalKPIs: 9,
      cumplimientoPromedio: 68,
      cumplimientoAnterior: 62,
      tendencia: 'up',
      alertasActivas: 3,
      alertasCriticas: 1,
      ultimaActualizacion: new Date()
    },
    {
      procesoId: 'proc-demo-002',
      procesoNombre: 'Control de Accesos y Seguridad',
      estado: 'activo',
      totalObjetivos: 4,
      totalKPIs: 7,
      cumplimientoPromedio: 82,
      cumplimientoAnterior: 78,
      tendencia: 'up',
      alertasActivas: 1,
      alertasCriticas: 0,
      ultimaActualizacion: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      procesoId: 'proc-demo-003',
      procesoNombre: 'Cumplimiento Normativo SOX',
      estado: 'activo',
      totalObjetivos: 3,
      totalKPIs: 5,
      cumplimientoPromedio: 75,
      cumplimientoAnterior: 80,
      tendencia: 'down',
      alertasActivas: 2,
      alertasCriticas: 1,
      ultimaActualizacion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      procesoId: 'proc-demo-004',
      procesoNombre: 'Gestión de Incidentes',
      estado: 'activo',
      totalObjetivos: 2,
      totalKPIs: 4,
      cumplimientoPromedio: 91,
      cumplimientoAnterior: 88,
      tendencia: 'up',
      alertasActivas: 0,
      alertasCriticas: 0,
      ultimaActualizacion: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      procesoId: 'proc-demo-005',
      procesoNombre: 'Auditoría Interna',
      estado: 'borrador',
      totalObjetivos: 5,
      totalKPIs: 8,
      cumplimientoPromedio: 45,
      cumplimientoAnterior: 40,
      tendencia: 'up',
      alertasActivas: 2,
      alertasCriticas: 1,
      ultimaActualizacion: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
  ]);

  // Alertas consolidadas de todos los procesos
  alertasConsolidadas = signal<AlertaConsolidada[]>([
    {
      id: 'ALERT-001', procesoId: 'proc-demo-001', procesoNombre: 'Gestión de Riesgos Operacionales',
      objetivoId: '1', objetivoNombre: 'Reducir riesgos Operacionales',
      kpiId: 'KPI-004', kpiNombre: 'Cumplimiento de Auditorías',
      severity: 'critical', status: 'activa',
      mensaje: 'Cumplimiento de auditorías por debajo del umbral crítico (75% < 80%)',
      valorActual: 75, valorUmbral: 80, fechaCreacion: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), diasAbierto: 2
    },
    {
      id: 'ALERT-002', procesoId: 'proc-demo-001', procesoNombre: 'Gestión de Riesgos Operacionales',
      objetivoId: '1', objetivoNombre: 'Reducir riesgos Operacionales',
      kpiId: 'KPI-005', kpiNombre: 'Capacitaciones en Gestión de Riesgos',
      severity: 'warning', status: 'activa',
      mensaje: 'Capacitaciones por debajo del objetivo (60% < 70%)',
      valorActual: 60, valorUmbral: 70, fechaCreacion: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), diasAbierto: 5
    },
    {
      id: 'ALERT-003', procesoId: 'proc-demo-003', procesoNombre: 'Cumplimiento Normativo SOX',
      objetivoId: '5', objetivoNombre: 'Garantizar el cumplimiento regulatorio',
      kpiId: 'KPI-009', kpiNombre: 'Cumplimiento normativo',
      severity: 'critical', status: 'activa',
      mensaje: 'Cumplimiento normativo crítico (85% < 90%)',
      valorActual: 85, valorUmbral: 90, fechaCreacion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), diasAbierto: 1
    },
    {
      id: 'ALERT-004', procesoId: 'proc-demo-002', procesoNombre: 'Control de Accesos y Seguridad',
      objetivoId: '3', objetivoNombre: 'Mejora experiencia del cliente',
      kpiId: 'KPI-006', kpiNombre: 'NPS Score',
      severity: 'warning', status: 'activa',
      mensaje: 'NPS Score por debajo del umbral (68% < 70%)',
      valorActual: 68, valorUmbral: 70, fechaCreacion: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), diasAbierto: 3
    },
    {
      id: 'ALERT-005', procesoId: 'proc-demo-001', procesoNombre: 'Gestión de Riesgos Operacionales',
      objetivoId: '1', objetivoNombre: 'Reducir riesgos Operacionales',
      kpiId: 'KPI-002', kpiNombre: 'Pérdidas por Riesgo Operacional',
      severity: 'info', status: 'atendida',
      mensaje: 'Pérdidas controladas pero requiere monitoreo',
      valorActual: 2, valorUmbral: 3, fechaCreacion: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), diasAbierto: 7
    }
  ]);

  // Computed: Alertas filtradas
  alertasFiltradas = computed(() => {
    let alertas = this.alertasConsolidadas().filter(a => a.status === 'activa');
    if (this.severidadFiltro()) {
      alertas = alertas.filter(a => a.severity === this.severidadFiltro());
    }
    return alertas.sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  });

  // Computed: Procesos filtrados
  procesosFiltrados = computed(() => {
    let procs = this.procesosKPIResumen();
    if (this.estadoProcesoFiltro()) {
      procs = procs.filter(p => p.estado === this.estadoProcesoFiltro());
    }
    return procs.sort((a, b) => b.alertasCriticas - a.alertasCriticas || b.alertasActivas - a.alertasActivas);
  });

  // Datos de gráficos - Tendencia por proceso
  chartTendenciaData = computed(() => ({
    labels: ['Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar'],
    datasets: this.procesosKPIResumen().slice(0, 4).map((p, i) => ({
      label: p.procesoNombre.split(' ').slice(0, 2).join(' '),
      data: this.generarTendenciaRandom(p.cumplimientoPromedio),
      borderColor: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'][i],
      backgroundColor: 'transparent',
      tension: 0.4
    }))
  }));

  // Chart: Cumplimiento por proceso (horizontal bar)
  chartProcesosCumplimiento = computed(() => ({
    labels: this.procesosKPIResumen().map(p => p.procesoNombre.split(' ').slice(0, 3).join(' ')),
    datasets: [{
      label: 'Cumplimiento %',
      data: this.procesosKPIResumen().map(p => p.cumplimientoPromedio),
      backgroundColor: this.procesosKPIResumen().map(p =>
        p.cumplimientoPromedio >= 80 ? '#10b981' :
        p.cumplimientoPromedio >= 60 ? '#f59e0b' : '#ef4444'
      )
    }]
  }));

  // Chart: Alertas por severidad
  chartAlertasSeveridad = computed(() => {
    const alertas = this.alertasConsolidadas().filter(a => a.status === 'activa');
    return {
      labels: ['Crítico', 'Advertencia', 'Info'],
      datasets: [{
        data: [
          alertas.filter(a => a.severity === 'critical').length,
          alertas.filter(a => a.severity === 'warning').length,
          alertas.filter(a => a.severity === 'info').length
        ],
        backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6']
      }]
    };
  });

  chartLineOptions = {
    plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 15 } } },
    responsive: true, maintainAspectRatio: false,
    scales: { y: { beginAtZero: false, min: 40, max: 100 } }
  };

  chartBarOptions = {
    plugins: { legend: { display: false } },
    responsive: true, maintainAspectRatio: false,
    indexAxis: 'y' as const,
    scales: { x: { beginAtZero: true, max: 100 } }
  };

  chartPieOptions = {
    plugins: { legend: { position: 'right', labels: { usePointStyle: true, padding: 15 } } },
    responsive: true, maintainAspectRatio: false
  };

  // Helper para generar tendencia mock
  private generarTendenciaRandom(valorFinal: number): number[] {
    const result = [];
    let val = valorFinal - 15 + Math.random() * 10;
    for (let i = 0; i < 6; i++) {
      result.push(Math.round(val));
      val += (valorFinal - val) * 0.3 + (Math.random() - 0.5) * 5;
    }
    result[5] = valorFinal;
    return result;
  }

  // Estadísticas
  stats = computed(() => {
    const lista = this.procesos();
    return {
      total: lista.length,
      borradores: lista.filter(p => p.estado === 'borrador').length,
      activos: lista.filter(p => p.estado === 'activo').length,
      inactivos: lista.filter(p => p.estado === 'inactivo').length
    };
  });

  // Navegar a crear nuevo proceso
  crearProceso(): void {
    this.router.navigate(['/procesos/crear']);
  }

  // Ver detalle en pantalla completa
  verDetalle(proceso: Proceso): void {
    this.router.navigate(['/procesos', proceso.id, 'detalle']);
  }

  // Ver detalle en drawer (alternativo)
  verDetalleDrawer(proceso: Proceso): void {
    this.procesoSeleccionado.set(proceso);
    this.showDrawer.set(true);
  }

  // Editar proceso (navegar al editor)
  editarProceso(proceso: Proceso): void {
    this.router.navigate(['/procesos', proceso.id]);
  }

  // Duplicar proceso
  duplicarProceso(proceso: Proceso): void {
    const copia = this.processService.duplicateProceso(proceso.id);
    if (copia) {
      this.messageService.add({
        severity: 'success',
        summary: 'Duplicado',
        detail: `Proceso "${copia.nombre}" creado`
      });
    }
  }

  // Ejecutar proceso
  ejecutarProceso(proceso: Proceso): void {
    this.processService.loadProceso(proceso.id);
    this.processService.executeProcess();
    this.messageService.add({
      severity: 'info',
      summary: 'Ejecutando',
      detail: `Proceso "${proceso.nombre}" en ejecución`
    });
  }

  // Eliminar proceso
  eliminarProceso(proceso: Proceso): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar "${proceso.nombre}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.processService.deleteProceso(proceso.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Eliminado',
          detail: 'Proceso eliminado exitosamente'
        });
        if (this.procesoSeleccionado()?.id === proceso.id) {
          this.showDrawer.set(false);
        }
      }
    });
  }

  // Cambiar estado del proceso
  cambiarEstado(proceso: Proceso, estado: Proceso['estado']): void {
    this.processService.updateProcesoEstado(proceso.id, estado);
    this.messageService.add({
      severity: 'success',
      summary: 'Estado actualizado',
      detail: `Proceso marcado como "${estado}"`
    });
  }

  // Helpers para tags de estado
  getEstadoSeverity(estado: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    const severities: Record<string, 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast'> = {
      'borrador': 'secondary',
      'activo': 'success',
      'inactivo': 'warn',
      'archivado': 'danger'
    };
    return severities[estado] || 'info';
  }

  getEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      'borrador': 'Borrador',
      'activo': 'Activo',
      'inactivo': 'Inactivo',
      'archivado': 'Archivado'
    };
    return labels[estado] || estado;
  }

  // Formatear fecha
  formatDate(date: Date): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Resetear datos de demo
  resetDemoData(): void {
    this.confirmationService.confirm({
      message: '¿Deseas cargar los 5 procesos de demostración? Esto reemplazará los procesos demo existentes.',
      header: 'Cargar Datos Demo',
      icon: 'pi pi-database',
      acceptLabel: 'Cargar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.processService.resetDemoProcesses();
        this.messageService.add({
          severity: 'success',
          summary: 'Demo cargado',
          detail: 'Se han cargado 5 procesos de demostración con nodos funcionales'
        });
      }
    });
  }

  // Generar items del menú contextual
  getMenuItems(proceso: Proceso): MenuItem[] {
    const items: MenuItem[] = [
      {
        label: 'Ver detalle',
        icon: 'pi pi-eye',
        command: () => this.verDetalle(proceso)
      },
      {
        label: 'Editar',
        icon: 'pi pi-pencil',
        command: () => this.editarProceso(proceso)
      },
      {
        label: 'Edición rápida',
        icon: 'pi pi-bolt',
        command: () => this.iniciarEdicionDesdeMenu(proceso)
      },
      {
        label: 'Duplicar',
        icon: 'pi pi-copy',
        command: () => this.duplicarProceso(proceso)
      }
    ];

    if (proceso.estado === 'activo') {
      items.push({
        label: 'Ejecutar',
        icon: 'pi pi-play',
        command: () => this.ejecutarProceso(proceso)
      });
    }

    items.push({
      separator: true
    });

    items.push({
      label: 'Eliminar',
      icon: 'pi pi-trash',
      styleClass: 'text-red-500',
      command: () => this.eliminarProceso(proceso)
    });

    return items;
  }

  // Métodos para el resumen del footer
  getCountByEstado(estado: string): number {
    return this.procesos().filter(p => p.estado === estado).length;
  }

  getTotalNodos(): number {
    return this.procesos().reduce((total, p) => total + (p.nodes?.length || 0), 0);
  }

  // Métodos de edición in-place
  iniciarEdicion(proceso: Proceso, event: Event): void {
    event.stopPropagation();
    this.procesoEditando.set(proceso.id);
    this.valoresEdicion.set({
      nombre: proceso.nombre,
      descripcion: proceso.descripcion,
      estado: proceso.estado
    });
  }

  iniciarEdicionDesdeMenu(proceso: Proceso): void {
    this.procesoEditando.set(proceso.id);
    this.valoresEdicion.set({
      nombre: proceso.nombre,
      descripcion: proceso.descripcion,
      estado: proceso.estado
    });
  }

  estaEditando(procesoId: string): boolean {
    return this.procesoEditando() === procesoId;
  }

  getValorEdicion(campo: string): any {
    return this.valoresEdicion()[campo];
  }

  setValorEdicion(campo: string, valor: any): void {
    this.valoresEdicion.update(v => ({ ...v, [campo]: valor }));
  }

  guardarEdicion(proceso: Proceso, event: Event): void {
    event.stopPropagation();
    const valores = this.valoresEdicion();
    console.log(`Guardando edición del proceso ${proceso.id}:`, valores);
    this.procesoEditando.set(null);
    this.valoresEdicion.set({});
  }

  cancelarEdicion(event: Event): void {
    event.stopPropagation();
    this.procesoEditando.set(null);
    this.valoresEdicion.set({});
  }

  // Métodos de selección
  onSelectionChange(procesos: Proceso[]): void {
    this.procesosSeleccionados.set(procesos);
  }

  abrirAccionesMasivasDrawer(): void {
    this.showAccionesMasivasDrawer.set(true);
  }

  aplicarAccionesMasivas(): void {
    console.log('Aplicando acciones masivas a:', this.procesosSeleccionados());
    this.showAccionesMasivasDrawer.set(false);
  }

  // ==================== MÉTODOS DASHBOARD ====================

  // Obtener clase de tendencia global
  getTendenciaClassGlobal(kpi: KPIMetricGlobal): string {
    // Para alertas y KPIs en riesgo, menos es mejor
    if (kpi.id === 'g3' || kpi.id === 'g4') {
      return kpi.porcentajeCambio < 0 ? 'tendencia-positiva' : 'tendencia-negativa';
    }
    return kpi.porcentajeCambio > 0 ? 'tendencia-positiva' : 'tendencia-negativa';
  }

  // Obtener icono de tendencia
  getTendenciaIconGlobal(kpi: KPIMetricGlobal): string {
    if (kpi.id === 'g3' || kpi.id === 'g4') {
      return kpi.porcentajeCambio < 0 ? 'pi pi-arrow-down' : 'pi pi-arrow-up';
    }
    return kpi.porcentajeCambio > 0 ? 'pi pi-arrow-up' : 'pi pi-arrow-down';
  }

  // Obtener clase de color para KPI card
  getKpiColorClass(kpi: KPIMetricGlobal): string {
    return `kpi-${kpi.color}`;
  }

  // Obtener clase de tendencia para proceso
  getTendenciaClassProceso(proceso: ProcesoKPIResumen): string {
    return proceso.tendencia === 'up' ? 'tendencia-positiva' : proceso.tendencia === 'down' ? 'tendencia-negativa' : '';
  }

  // Obtener severity para alertas
  getAlertaSeverity(severity: AlertSeverity): 'danger' | 'warn' | 'info' {
    const map: Record<AlertSeverity, 'danger' | 'warn' | 'info'> = {
      'critical': 'danger',
      'warning': 'warn',
      'info': 'info'
    };
    return map[severity];
  }

  // Obtener color de barra de progreso
  getProgresoClass(valor: number): string {
    if (valor >= 85) return 'progreso-excelente';
    if (valor >= 70) return 'progreso-bueno';
    if (valor >= 50) return 'progreso-regular';
    return 'progreso-bajo';
  }

  // ========== DRILL-DOWN NAVIGATION ==========

  // Navegar a objetivos-kpis de un proceso específico
  navegarAObjetivosKPIs(procesoId: string): void {
    this.router.navigate(['/procesos', procesoId, 'objetivos-kpis']);
  }

  // Navegar a alerta específica (va a objetivos-kpis del proceso con la alerta)
  navegarAAlerta(alerta: AlertaConsolidada): void {
    // Navega al proceso y podría pasar query params para resaltar la alerta
    this.router.navigate(['/procesos', alerta.procesoId, 'objetivos-kpis'], {
      queryParams: { objetivoId: alerta.objetivoId, alertaId: alerta.id }
    });
  }

  // Ver detalle de proceso en drawer
  verResumenProceso(proceso: ProcesoKPIResumen): void {
    // Buscar proceso en la lista y mostrarlo en drawer
    const proc = this.procesos().find(p => p.id === proceso.procesoId);
    if (proc) {
      this.procesoSeleccionado.set(proc);
      this.showDrawer.set(true);
    } else {
      // Si no existe, navegar directamente
      this.navegarAObjetivosKPIs(proceso.procesoId);
    }
  }

  // Limpiar filtros del dashboard
  limpiarFiltrosDashboard(): void {
    this.periodoFiltro.set('mes');
    this.severidadFiltro.set(null);
    this.estadoProcesoFiltro.set(null);
  }

  // Exportar dashboard a PDF
  exportarDashboardPDF(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Exportando...',
      detail: 'Generando PDF del dashboard ejecutivo'
    });
  }

  // Formatear fecha relativa
  formatFechaRelativa(fecha: Date): string {
    const ahora = new Date();
    const diff = ahora.getTime() - fecha.getTime();
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (dias === 0) return 'Hoy';
    if (dias === 1) return 'Ayer';
    if (dias < 7) return `Hace ${dias} días`;
    return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  }
}
