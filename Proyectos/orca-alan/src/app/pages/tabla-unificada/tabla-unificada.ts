import { Component, inject, signal, computed, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { TableModule, Table } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { TooltipModule } from 'primeng/tooltip';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { PopoverModule } from 'primeng/popover';
import { CheckboxModule } from 'primeng/checkbox';
import { SliderModule } from 'primeng/slider';
import { DatePickerModule } from 'primeng/datepicker';
import { PaginatorModule } from 'primeng/paginator';
import { DragDropModule } from 'primeng/dragdrop';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { SelectButtonModule } from 'primeng/selectbutton';
import { PanelModule } from 'primeng/panel';
import { DividerModule } from 'primeng/divider';
import { BadgeModule } from 'primeng/badge';
import { InputNumberModule } from 'primeng/inputnumber';
import { SkeletonModule } from 'primeng/skeleton';
import { DrawerModule } from 'primeng/drawer';
import { TabsModule } from 'primeng/tabs';
import { MessageModule } from 'primeng/message';

// Componentes personalizados
import { GraficasInteractivasComponent, DatosGrafica, FiltroGrafica } from '../../components/graficas-interactivas/graficas-interactivas';

// Services & Models
import { TablaUnificadaService } from '../../services/tabla-unificada.service';
import {
  RegistroUnificado,
  TipoEntidad,
  ColumnaConfig,
  FiltroActivo,
  TipoColumna,
  ConfiguracionGrafica,
  TipoGrafica
} from '../../models/tabla-unificada.models';

interface TipoGraficaOpcion {
  tipo: TipoGrafica;
  nombre: string;
  icono: string;
  descripcion: string;
}

@Component({
  selector: 'app-tabla-unificada',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, CardModule, ButtonModule, DialogModule,
    InputTextModule, SelectModule, MultiSelectModule, TagModule, ChipModule,
    TooltipModule, MenuModule, PopoverModule, CheckboxModule, SliderModule,
    DatePickerModule, PaginatorModule, DragDropModule, ToggleButtonModule,
    SelectButtonModule, PanelModule, DividerModule, BadgeModule,
    InputNumberModule, SkeletonModule, DrawerModule, TabsModule,
    MessageModule, GraficasInteractivasComponent
  ],
  templateUrl: './tabla-unificada.html',
  styleUrl: './tabla-unificada.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TablaUnificadaComponent {
  private service = inject(TablaUnificadaService);

  // Referencias
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('dt') dt!: Table;

  // Estado del servicio
  estado = this.service.getEstado();
  columnasConfig = this.service.columnasConfig;
  columnasVisibles = this.service.columnasVisibles;
  datosPaginados = this.service.datosPaginados;
  datosFiltrados = this.service.datosFiltrados;
  contadores = this.service.contadores;
  busquedaGlobal = this.service.busquedaGlobal;
  presetsFecha = this.service.presetsFecha;
  opcionesEstado = this.service.opcionesEstado;

  // Estado local del componente
  showDetalleDrawer = signal(false);
  registroSeleccionado = signal<RegistroUnificado | null>(null);
  showColumnasDialog = signal(false);
  showGraficasDialog = signal(false);
  showFiltroPopover = signal(false);
  columnaFiltroActual = signal<ColumnaConfig | null>(null);

  // Estado del filtro temporal
  filtroTemp = signal<{
    operador: string;
    valor: any;
    valorHasta?: any;
    valoresSeleccionados: string[];
  }>({
    operador: 'contiene',
    valor: '',
    valorHasta: undefined,
    valoresSeleccionados: []
  });

  // Opciones de entidades
  entidadOptions = [
    { label: 'Riesgos', value: 'riesgo', icon: 'pi pi-shield' },
    { label: 'Incidentes', value: 'incidente', icon: 'pi pi-exclamation-triangle' }
  ];

  // Opciones para filtros de columna
  tipoEntidadOptions = [
    { label: 'Riesgo', value: 'riesgo', icon: 'pi pi-shield' },
    { label: 'Incidente', value: 'incidente', icon: 'pi pi-exclamation-triangle' }
  ];

  estadoOptions = [
    { label: 'Identificado', value: 'identificado' },
    { label: 'Evaluado', value: 'evaluado' },
    { label: 'Mitigado', value: 'mitigado' },
    { label: 'Aceptado', value: 'aceptado' },
    { label: 'Abierto', value: 'abierto' },
    { label: 'En Proceso', value: 'en_proceso' },
    { label: 'Resuelto', value: 'resuelto' },
    { label: 'Cerrado', value: 'cerrado' }
  ];

  severidadOptions = [
    { label: 'Crítica', value: 'critica' },
    { label: 'Alta', value: 'alta' },
    { label: 'Media', value: 'media' },
    { label: 'Baja', value: 'baja' }
  ];

  nivelRiesgoOptions = [
    { label: 'Crítico (15-25)', value: 'critico', severity: 'danger' as const, min: 15, max: 25 },
    { label: 'Alto (10-14)', value: 'alto', severity: 'warn' as const, min: 10, max: 14 },
    { label: 'Medio (5-9)', value: 'medio', severity: 'info' as const, min: 5, max: 9 },
    { label: 'Bajo (1-4)', value: 'bajo', severity: 'success' as const, min: 1, max: 4 }
  ];

  // Opciones de operadores
  operadoresTexto = [
    { label: 'Contiene', value: 'contiene' },
    { label: 'Empieza con', value: 'empieza_con' },
    { label: 'Termina con', value: 'termina_con' },
    { label: 'Igual a', value: 'igual' }
  ];

  operadoresNumero = [
    { label: 'Igual a', value: 'igual' },
    { label: 'Mayor que', value: 'mayor' },
    { label: 'Menor que', value: 'menor' },
    { label: 'Entre', value: 'entre' }
  ];

  operadoresFecha = [
    { label: 'Igual a', value: 'igual' },
    { label: 'Antes de', value: 'antes' },
    { label: 'Después de', value: 'despues' },
    { label: 'Entre', value: 'entre' }
  ];

  // Opciones de registros por página
  registrosPorPaginaOptions = [
    { label: '10', value: 10 },
    { label: '25', value: 25 },
    { label: '50', value: 50 },
    { label: '100', value: 100 }
  ];

  // Estado del asistente de gráficas
  pasoGrafica = signal(1);
  columnaGraficaSeleccionada = signal('estado');
  configGrafica = signal<ConfiguracionGrafica>({
    tipo: 'pie',
    titulo: 'Gráfica',
    columnaCategoria: 'estado',
    agregacion: 'conteo',
    mostrarLeyenda: true,
    posicionLeyenda: 'derecha',
    mostrarEtiquetas: true,
    paletaColores: 'default',
    mostrarGrid: true
  });

  // Filtro activo para gráficas (desde asistente IA)
  filtroGraficaActivo = signal<FiltroGrafica | null>(null);

  // Datos para gráfica interactiva (ApexCharts)
  datosGraficaInteractiva = computed<DatosGrafica>(() => {
    let datos = this.datosFiltrados();
    const columna = this.columnaGraficaSeleccionada();
    const filtro = this.filtroGraficaActivo();

    // Aplicar filtro de gráfica si existe
    if (filtro && filtro.campo && filtro.valor) {
      datos = datos.filter(d => {
        const valorCampo = (d as any)[filtro.campo];
        if (valorCampo === undefined || valorCampo === null) return false;
        return String(valorCampo).toLowerCase().includes(filtro.valor.toLowerCase());
      });
    }

    const agrupados = new Map<string, number>();

    datos.forEach(d => {
      let valor = (d as any)[columna];
      if (valor === undefined || valor === null) valor = 'Sin definir';
      if (columna === 'nivelRiesgo' && typeof valor === 'number') {
        valor = this.getNivelRiesgoLabel(valor);
      }
      const categoria = String(valor);
      agrupados.set(categoria, (agrupados.get(categoria) || 0) + 1);
    });

    return {
      labels: Array.from(agrupados.keys()),
      series: Array.from(agrupados.values())
    };
  });

  // Valores disponibles para filtrado en gráficas (activos, responsables, etc.)
  valoresFiltradoGrafica = computed(() => {
    const datos = this.datosFiltrados();
    const contenedores = new Set<string>();
    const responsables = new Set<string>();

    datos.forEach(d => {
      if (d.contenedorNombre) contenedores.add(d.contenedorNombre);
      if (d.responsable) responsables.add(d.responsable);
    });

    return [
      { campo: 'contenedorNombre', valores: Array.from(contenedores).sort() },
      { campo: 'responsable', valores: Array.from(responsables).sort() }
    ];
  });

  // Opciones de columnas para gráficas
  columnasGraficaOptions = [
    { label: 'Tipo de Entidad', value: 'tipoEntidad' },
    { label: 'Estado', value: 'estado' },
    { label: 'Nivel de Riesgo', value: 'nivelRiesgo' },
    { label: 'Severidad', value: 'severidad' },
    { label: 'Activo/Proceso', value: 'contenedorNombre' },
    { label: 'Responsable', value: 'responsable' }
  ];

  tiposGrafica: TipoGraficaOpcion[] = [
    { tipo: 'pie', nombre: 'Pie', icono: 'pi pi-chart-pie', descripcion: 'Distribución porcentual' },
    { tipo: 'dona', nombre: 'Dona', icono: 'pi pi-circle', descripcion: 'Distribución con centro vacío' },
    { tipo: 'barras', nombre: 'Barras', icono: 'pi pi-chart-bar', descripcion: 'Comparar cantidades' },
    { tipo: 'lineas', nombre: 'Líneas', icono: 'pi pi-chart-line', descripcion: 'Tendencia temporal' },
    { tipo: 'radar', nombre: 'Radar', icono: 'pi pi-slack', descripcion: 'Múltiples dimensiones' }
  ];

  columnasParaGrafica = computed(() => {
    return this.columnasConfig()
      .filter(c => c.tipo === 'seleccion' || c.tipo === 'texto')
      .map(c => ({ label: c.header, value: c.field }));
  });

  columnasNumericas = computed(() => {
    return this.columnasConfig()
      .filter(c => c.tipo === 'numero')
      .map(c => ({ label: c.header, value: c.field }));
  });

  // Datos de la gráfica
  chartData = computed(() => {
    const config = this.configGrafica();
    const datos = this.service.obtenerDatosGrafica(
      config.columnaCategoria,
      config.agregacion,
      config.columnaValor
    );

    const colores = this.obtenerColores(datos.labels.length, config.paletaColores);

    if (config.tipo === 'pie' || config.tipo === 'dona') {
      return {
        labels: datos.labels,
        datasets: [{
          data: datos.valores,
          backgroundColor: colores,
          hoverBackgroundColor: colores.map(c => this.adjustBrightness(c, 20))
        }]
      };
    } else if (config.tipo === 'barras') {
      return {
        labels: datos.labels,
        datasets: [{
          label: config.titulo,
          data: datos.valores,
          backgroundColor: colores[0],
          borderColor: colores[0],
          borderWidth: 1
        }]
      };
    } else if (config.tipo === 'lineas') {
      const datosTemporal = this.service.obtenerDatosLineaTemporal(
        'fecha',
        config.agrupacionTemporal || 'mes',
        config.agregacion
      );
      return {
        labels: datosTemporal.labels,
        datasets: [{
          label: config.titulo,
          data: datosTemporal.valores,
          fill: false,
          borderColor: colores[0],
          tension: 0.4
        }]
      };
    } else if (config.tipo === 'radar') {
      return {
        labels: datos.labels,
        datasets: [{
          label: config.titulo,
          data: datos.valores,
          backgroundColor: colores[0] + '40',
          borderColor: colores[0],
          pointBackgroundColor: colores[0]
        }]
      };
    }

    return { labels: [], datasets: [] };
  });

  chartOptions = computed(() => {
    const config = this.configGrafica();
    const baseOptions = {
      plugins: {
        legend: {
          display: config.mostrarLeyenda,
          position: config.posicionLeyenda
        }
      },
      responsive: true,
      maintainAspectRatio: false
    };

    if (config.tipo === 'dona') {
      return { ...baseOptions, cutout: '50%' };
    }

    if (config.tipo === 'barras' || config.tipo === 'lineas') {
      return {
        ...baseOptions,
        scales: {
          x: { grid: { display: config.mostrarGrid } },
          y: { grid: { display: config.mostrarGrid }, beginAtZero: true }
        }
      };
    }

    return baseOptions;
  });

  // Métodos de entidades
  onEntidadesChange(entidades: TipoEntidad[]): void {
    this.service.setEntidadesSeleccionadas(entidades);
  }

  // Métodos de filtros
  abrirFiltro(columna: ColumnaConfig, event: Event): void {
    this.columnaFiltroActual.set(columna);
    this.filtroTemp.set({
      operador: columna.tipo === 'texto' ? 'contiene' : 'igual',
      valor: '',
      valorHasta: undefined,
      valoresSeleccionados: []
    });
    this.showFiltroPopover.set(true);
  }

  aplicarFiltro(): void {
    const columna = this.columnaFiltroActual();
    const temp = this.filtroTemp();

    if (!columna) return;

    let etiqueta = '';
    let valor = temp.valor;

    if (columna.tipo === 'seleccion' && temp.valoresSeleccionados.length > 0) {
      valor = temp.valoresSeleccionados;
      etiqueta = `${columna.header}: ${temp.valoresSeleccionados.join(', ')}`;
    } else if (columna.tipo === 'fecha') {
      etiqueta = `${columna.header}: ${temp.operador} ${new Date(temp.valor).toLocaleDateString()}`;
      if (temp.operador === 'entre' && temp.valorHasta) {
        etiqueta += ` - ${new Date(temp.valorHasta).toLocaleDateString()}`;
      }
    } else if (columna.tipo === 'numero') {
      etiqueta = `${columna.header}: ${temp.operador} ${temp.valor}`;
      if (temp.operador === 'entre' && temp.valorHasta !== undefined) {
        etiqueta += ` - ${temp.valorHasta}`;
      }
    } else {
      etiqueta = `${columna.header} ${temp.operador} "${temp.valor}"`;
    }

    const filtro: FiltroActivo = {
      columna: columna.field,
      tipo: columna.tipo,
      operador: temp.operador,
      valor: valor,
      valorHasta: temp.valorHasta,
      etiqueta
    };

    this.service.agregarFiltro(filtro);
    this.showFiltroPopover.set(false);
  }

  eliminarFiltro(index: number): void {
    this.service.eliminarFiltro(index);
  }

  limpiarTodosFiltros(): void {
    this.service.limpiarFiltros();
    if (this.dt) {
      this.dt.clear();
    }
  }

  aplicarPresetFecha(preset: any): void {
    const { desde, hasta } = preset.getFechas();
    this.filtroTemp.update(f => ({
      ...f,
      operador: 'entre',
      valor: desde,
      valorHasta: hasta
    }));
  }

  // Métodos de búsqueda global
  onBusquedaGlobal(valor: string): void {
    this.busquedaGlobal.set(valor);
  }

  // Métodos de columnas
  toggleColumnaVisibilidad(field: string): void {
    this.service.toggleColumna(field);
  }

  restaurarColumnas(): void {
    this.service.restaurarColumnasDefecto();
  }

  // Métodos de ordenamiento
  onSort(event: any): void {
    if (event.field && event.order) {
      this.service.setOrdenamiento(event.field, event.order === 1 ? 'asc' : 'desc');
    }
  }

  // Métodos de paginación
  onPageChange(event: any): void {
    this.service.setPagina(event.page);
    this.service.setRegistrosPorPagina(event.rows);
  }

  // Métodos de detalle
  verDetalle(registro: RegistroUnificado): void {
    this.registroSeleccionado.set(registro);
    this.showDetalleDrawer.set(true);
  }

  // Métodos de exportación
  exportarCSV(): void {
    this.service.exportarDatos('csv', true);
  }

  exportarExcel(): void {
    this.service.exportarDatos('excel', true);
  }

  // Métodos para gráficas interactivas
  getTituloGrafica(): string {
    const opcion = this.columnasGraficaOptions.find(o => o.value === this.columnaGraficaSeleccionada());
    return `Distribución por ${opcion?.label || 'Categoría'}`;
  }

  onCampoGraficaChange(event: { campo: string; tipo: string }): void {
    // Actualizar la columna seleccionada cuando cambia en el componente de gráficas
    this.columnaGraficaSeleccionada.set(event.campo);
  }

  onGraficaDataPointClick(event: { categoria: string; valor: number; serie?: string }): void {
    console.log('Data point clicked:', event);
    // Aquí se puede implementar drill-down o filtrado automático
  }

  onGraficaLegendClick(event: { serie: string; visible: boolean }): void {
    console.log('Legend clicked:', event);
  }

  onFiltroGraficaAplicado(filtro: FiltroGrafica | null): void {
    console.log('Filtro de gráfica aplicado:', filtro);
    this.filtroGraficaActivo.set(filtro);
  }

  exportarGraficaImagen(formato: 'png' | 'jpg'): void {
    const canvas = document.querySelector('.chart-container canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `grafica-${this.configGrafica().tipo}-${Date.now()}.${formato}`;

    if (formato === 'png') {
      link.href = canvas.toDataURL('image/png');
    } else {
      link.href = canvas.toDataURL('image/jpeg', 0.9);
    }

    link.click();
  }

  // Métodos de gráficas
  seleccionarTipoGrafica(tipo: TipoGrafica): void {
    this.configGrafica.update(c => ({ ...c, tipo }));
  }

  siguientePasoGrafica(): void {
    this.pasoGrafica.update(p => Math.min(p + 1, 3));
  }

  anteriorPasoGrafica(): void {
    this.pasoGrafica.update(p => Math.max(p - 1, 1));
  }

  abrirGraficas(): void {
    this.pasoGrafica.set(1);
    this.showGraficasDialog.set(true);
  }

  // Helpers de severidad/estado
  getSeveridadTag(severidad: string): 'danger' | 'warn' | 'success' | 'info' | 'secondary' {
    switch (severidad) {
      case 'critica': return 'danger';
      case 'alta': return 'warn';
      case 'media': return 'info';
      case 'baja': return 'success';
      default: return 'secondary';
    }
  }

  getEstadoTag(estado: string): 'danger' | 'warn' | 'success' | 'info' | 'secondary' {
    switch (estado) {
      case 'identificado':
      case 'abierto': return 'danger';
      case 'evaluado':
      case 'en_proceso': return 'warn';
      case 'mitigado':
      case 'resuelto': return 'success';
      case 'aceptado':
      case 'cerrado': return 'info';
      default: return 'secondary';
    }
  }

  getNivelRiesgoTag(nivel: number): 'danger' | 'warn' | 'success' | 'info' {
    if (nivel >= 15) return 'danger';
    if (nivel >= 10) return 'warn';
    if (nivel >= 5) return 'info';
    return 'success';
  }

  getNivelRiesgoLabel(nivel: number): string {
    if (nivel >= 15) return 'Crítico';
    if (nivel >= 10) return 'Alto';
    if (nivel >= 5) return 'Medio';
    return 'Bajo';
  }

  formatearEstado(estado: string): string {
    return estado.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  formatearFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getTipoEntidadIcon(tipo: TipoEntidad): string {
    return tipo === 'riesgo' ? 'pi pi-shield' : 'pi pi-exclamation-triangle';
  }

  getTipoEntidadLabel(tipo: TipoEntidad): string {
    return tipo === 'riesgo' ? 'Riesgo' : 'Incidente';
  }

  // Helpers de colores
  private obtenerColores(cantidad: number, paleta: string): string[] {
    const paletas: Record<string, string[]> = {
      default: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'],
      semantica: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'],
      monocromatica: ['#1E3A5F', '#2E5984', '#3E78A9', '#4E97CE', '#6EB5E8', '#8ED3F2']
    };

    const coloresBase = paletas[paleta] || paletas['default'];
    const resultado: string[] = [];

    for (let i = 0; i < cantidad; i++) {
      resultado.push(coloresBase[i % coloresBase.length]);
    }

    return resultado;
  }

  private adjustBrightness(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1);
  }

  // Tracking para ngFor
  trackByField(index: number, columna: ColumnaConfig): string {
    return columna.field;
  }

  trackById(index: number, registro: RegistroUnificado): string {
    return registro.id;
  }

  // Menú contextual para registros
  getMenuItemsRegistro(registro: RegistroUnificado): MenuItem[] {
    return [
      { label: 'Ver detalle', icon: 'pi pi-eye', command: () => this.verDetalle(registro) },
      { label: 'Editar', icon: 'pi pi-pencil', command: () => console.log('Editar', registro.id) },
      { separator: true },
      { label: 'Eliminar', icon: 'pi pi-trash', styleClass: 'text-red-500', command: () => console.log('Eliminar', registro.id) }
    ];
  }
}
