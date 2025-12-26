import { Component, inject, signal, computed, output, OnInit, effect, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';

import { GraficaWizardService, DatosGraficaProcesados } from '../../services/grafica-wizard.service';
import {
  GraficaWizardState,
  GraficaWizardResult,
  ValidacionPaso,
  CategoriaGrafica,
  TipoGraficaWizard,
  TipoAgregacion,
  CampoEntidad,
  CruceDatosConfig,
  CATEGORIAS_GRAFICAS,
  FUENTES_DATOS,
  PALETAS_COLORES,
  INITIAL_WIZARD_STATE,
  CategoriaGraficaConfig,
  TipoGraficaConfig,
  FuenteDatosConfig
} from '../../models/grafica-wizard.models';
import { TipoEntidad } from '../../models/tabla-unificada.models';

interface PasoWizard {
  label: string;
  descripcion: string;
  icon: string;
}

@Component({
  selector: 'app-grafica-wizard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    SelectModule,
    InputTextModule,
    ToggleSwitchModule,
    ProgressSpinnerModule,
    TooltipModule,
    DividerModule
  ],
  templateUrl: './grafica-wizard.html',
  styleUrl: './grafica-wizard.scss'
})
export class GraficaWizardComponent implements OnInit {
  private wizardService = inject(GraficaWizardService);

  // Output para cuando se confirma la configuración
  onConfirm = output<GraficaWizardResult>();
  onCancel = output<void>();

  // Estado del wizard
  pasoActual = signal(0);
  wizardState = signal<GraficaWizardState>({ ...INITIAL_WIZARD_STATE });

  // Datos de configuración
  categorias = CATEGORIAS_GRAFICAS;
  fuentesDatos = FUENTES_DATOS;
  paletas = PALETAS_COLORES;

  // Pasos del wizard
  pasos: PasoWizard[] = [
    { label: 'Tipo', descripcion: 'Selecciona el tipo de gráfica', icon: 'pi pi-chart-pie' },
    { label: 'Datos', descripcion: 'Elige la fuente de datos', icon: 'pi pi-database' },
    { label: 'Campos', descripcion: 'Configura los campos', icon: 'pi pi-sliders-h' },
    { label: 'Estilo', descripcion: 'Personaliza y confirma', icon: 'pi pi-palette' }
  ];

  // Opciones de agregación
  opcionesAgregacion: { label: string; value: TipoAgregacion }[] = [
    { label: 'Conteo', value: 'conteo' },
    { label: 'Suma', value: 'suma' },
    { label: 'Promedio', value: 'promedio' },
    { label: 'Mínimo', value: 'minimo' },
    { label: 'Máximo', value: 'maximo' }
  ];

  // Computed: Categoría seleccionada
  categoriaSeleccionada = computed<CategoriaGraficaConfig | null>(() => {
    const cat = this.wizardState().categoriaGrafica;
    return this.categorias.find(c => c.id === cat) || null;
  });

  // Computed: Tipo de gráfica seleccionado
  tipoGraficaSeleccionado = computed<TipoGraficaConfig | null>(() => {
    const tipo = this.wizardState().tipoGrafica;
    const cat = this.categoriaSeleccionada();
    return cat?.tipos.find(t => t.id === tipo) || null;
  });

  // Computed: Campos disponibles para la entidad seleccionada
  camposDisponibles = computed<CampoEntidad[]>(() => {
    const entidad = this.wizardState().fuenteDatos;
    if (!entidad) return [];
    return this.wizardService.getCamposEntidad(entidad);
  });

  // Computed: Campos de tipo categoría (para agrupación)
  camposCategoria = computed<CampoEntidad[]>(() => {
    const entidad = this.wizardState().fuenteDatos;
    if (!entidad) return [];
    return this.wizardService.getCamposCategoria(entidad);
  });

  // Computed: Campos numéricos (para valores)
  camposNumericos = computed<CampoEntidad[]>(() => {
    const entidad = this.wizardState().fuenteDatos;
    if (!entidad) return [];
    return this.wizardService.getCamposNumericos(entidad);
  });

  // Computed: Cruces disponibles
  crucesDisponibles = computed<CruceDatosConfig[]>(() => {
    const entidad = this.wizardState().fuenteDatos;
    if (!entidad) return [];
    return this.wizardService.getCrucesDisponibles(entidad);
  });

  // Computed: Si la gráfica requiere ejes
  requiereEjes = computed(() => {
    return this.tipoGraficaSeleccionado()?.requiereEjes || false;
  });

  // Computed: Si soporta series
  soportaSeries = computed(() => {
    return this.tipoGraficaSeleccionado()?.soportaSeries || false;
  });

  // Computed: Validación del paso actual
  validacionPasoActual = computed<ValidacionPaso>(() => {
    return this.validarPaso(this.pasoActual());
  });

  // Computed: Preview de datos para la gráfica
  previewData = computed<DatosGraficaProcesados | null>(() => {
    const state = this.wizardState();
    if (!state.tipoGrafica || state.datosDisponibles.length === 0) return null;

    // Para gráficas circulares, necesitamos campo de agrupación
    if (!this.requiereEjes() && !state.campoAgrupacion) return null;

    // Para gráficas de ejes, necesitamos ejes X e Y
    if (this.requiereEjes() && (!state.campoEjeX || !state.campoEjeY)) return null;

    return this.wizardService.generarDatosGrafica({
      datos: state.datosDisponibles,
      tipoGrafica: state.tipoGrafica,
      campoAgrupacion: state.campoAgrupacion || undefined,
      tipoAgregacion: state.tipoAgregacion,
      campoValor: state.campoValor || undefined,
      campoEjeX: state.campoEjeX || undefined,
      campoEjeY: state.campoEjeY || undefined,
      campoSeries: state.campoSeries || undefined
    });
  });

  // Computed: Resumen de preview para mostrar
  previewResumen = computed(() => {
    const preview = this.previewData();
    if (!preview) return null;

    return {
      categorias: preview.labels.length,
      series: preview.datasets.length,
      total: preview.datasets.reduce((sum, ds) => sum + ds.data.reduce((a, b) => a + b, 0), 0)
    };
  });

  ngOnInit(): void {
    // Reset al iniciar
    this.resetWizard();
  }

  // Seleccionar categoría de gráfica
  seleccionarCategoria(categoria: CategoriaGrafica): void {
    this.updateState({
      categoriaGrafica: categoria,
      tipoGrafica: null  // Reset tipo al cambiar categoría
    });
  }

  // Seleccionar tipo de gráfica
  seleccionarTipoGrafica(tipo: TipoGraficaWizard): void {
    this.updateState({
      tipoGrafica: tipo,
      // Reset campos al cambiar tipo
      campoAgrupacion: null,
      campoEjeX: null,
      campoEjeY: null,
      campoSeries: null
    });
  }

  // Seleccionar fuente de datos
  seleccionarFuenteDatos(fuente: TipoEntidad): void {
    this.updateState({
      fuenteDatos: fuente,
      cargandoDatos: true,
      errorDatos: null,
      datosDisponibles: [],
      totalRegistros: 0,
      // Reset campos
      campoAgrupacion: null,
      campoEjeX: null,
      campoEjeY: null,
      campoSeries: null
    });

    // Cargar datos de la entidad
    this.wizardService.cargarDatosEntidad(fuente).subscribe({
      next: (datos) => {
        this.updateState({
          datosDisponibles: datos,
          totalRegistros: datos.length,
          cargandoDatos: false
        });
      },
      error: (error) => {
        this.updateState({
          cargandoDatos: false,
          errorDatos: 'Error al cargar los datos'
        });
      }
    });
  }

  // Seleccionar campo de agrupación (para circulares)
  seleccionarCampoAgrupacion(campo: string): void {
    this.updateState({ campoAgrupacion: campo });
  }

  // Seleccionar tipo de agregación
  seleccionarTipoAgregacion(tipo: TipoAgregacion): void {
    this.updateState({ tipoAgregacion: tipo });
  }

  // Seleccionar campo valor (para suma/promedio)
  seleccionarCampoValor(campo: string | null): void {
    this.updateState({ campoValor: campo });
  }

  // Seleccionar eje X
  seleccionarEjeX(campo: string): void {
    this.updateState({ campoEjeX: campo });
  }

  // Seleccionar eje Y
  seleccionarEjeY(campo: string): void {
    this.updateState({ campoEjeY: campo });
  }

  // Seleccionar campo de series
  seleccionarSeries(campo: string | null): void {
    this.updateState({ campoSeries: campo });
  }

  // Toggle usar cruce
  toggleCruce(usar: boolean): void {
    this.updateState({
      usarCruce: usar,
      cruceSeleccionado: usar ? this.crucesDisponibles()[0] || null : null
    });
  }

  // Seleccionar cruce
  seleccionarCruce(cruce: CruceDatosConfig): void {
    this.updateState({ cruceSeleccionado: cruce });
  }

  // Actualizar título
  actualizarTitulo(titulo: string): void {
    this.updateState({ titulo });
  }

  // Actualizar subtítulo
  actualizarSubtitulo(subtitulo: string): void {
    this.updateState({ subtitulo });
  }

  // Seleccionar paleta
  seleccionarPaleta(paleta: string): void {
    this.updateState({ paleta });
  }

  // Toggle opciones de estilo
  toggleLeyenda(mostrar: boolean): void {
    this.updateState({ mostrarLeyenda: mostrar });
  }

  toggleEtiquetas(mostrar: boolean): void {
    this.updateState({ mostrarEtiquetas: mostrar });
  }

  toggleAnimaciones(mostrar: boolean): void {
    this.updateState({ mostrarAnimaciones: mostrar });
  }

  toggleGrid(mostrar: boolean): void {
    this.updateState({ mostrarGrid: mostrar });
  }

  // Validar un paso específico
  validarPaso(paso: number): ValidacionPaso {
    const state = this.wizardState();
    const errores: string[] = [];

    switch (paso) {
      case 0: // Tipo de gráfica
        if (!state.categoriaGrafica) errores.push('Selecciona una categoría de gráfica');
        if (!state.tipoGrafica) errores.push('Selecciona un tipo de gráfica');
        break;

      case 1: // Fuente de datos
        if (!state.fuenteDatos) errores.push('Selecciona una fuente de datos');
        if (state.cargandoDatos) errores.push('Esperando carga de datos');
        if (state.errorDatos) errores.push(state.errorDatos);
        if (state.totalRegistros === 0 && !state.cargandoDatos && state.fuenteDatos) {
          errores.push('No hay datos disponibles para esta entidad');
        }
        break;

      case 2: // Configuración de campos
        if (this.requiereEjes()) {
          if (!state.campoEjeX) errores.push('Selecciona el campo para el Eje X');
          if (!state.campoEjeY) errores.push('Selecciona el campo para el Eje Y');
        } else {
          if (!state.campoAgrupacion) errores.push('Selecciona el campo de agrupación');
        }
        if (state.tipoAgregacion !== 'conteo' && !state.campoValor) {
          errores.push('Selecciona el campo de valor para la agregación');
        }
        break;

      case 3: // Estilo y confirmación
        if (!state.titulo.trim()) errores.push('El título es requerido');
        break;
    }

    return { valido: errores.length === 0, errores };
  }

  // Puede avanzar al siguiente paso
  puedeAvanzar(): boolean {
    return this.validacionPasoActual().valido;
  }

  // Ir al paso anterior
  anterior(): void {
    if (this.pasoActual() > 0) {
      this.pasoActual.update(p => p - 1);
    }
  }

  // Ir al siguiente paso
  siguiente(): void {
    if (this.puedeAvanzar() && this.pasoActual() < this.pasos.length - 1) {
      this.pasoActual.update(p => p + 1);
    }
  }

  // Ir a un paso específico (solo si está completado o es el actual)
  irAPaso(paso: number): void {
    if (paso < this.pasoActual()) {
      this.pasoActual.set(paso);
    }
  }

  // Confirmar y emitir resultado
  confirmar(): void {
    if (!this.validarTodos()) return;

    const state = this.wizardState();
    const resultado: GraficaWizardResult = {
      tipoGrafica: state.tipoGrafica!,
      fuenteDatos: state.fuenteDatos!,
      configuracion: {
        campoAgrupacion: state.campoAgrupacion || undefined,
        tipoAgregacion: state.tipoAgregacion,
        campoValor: state.campoValor || undefined,
        campoEjeX: state.campoEjeX || undefined,
        campoEjeY: state.campoEjeY || undefined,
        campoSeries: state.campoSeries || undefined,
        cruce: state.usarCruce ? state.cruceSeleccionado || undefined : undefined
      },
      estilo: {
        titulo: state.titulo,
        subtitulo: state.subtitulo,
        paleta: state.paleta,
        mostrarLeyenda: state.mostrarLeyenda,
        mostrarEtiquetas: state.mostrarEtiquetas,
        mostrarAnimaciones: state.mostrarAnimaciones,
        mostrarGrid: state.mostrarGrid
      },
      datos: state.datosDisponibles
    };

    this.onConfirm.emit(resultado);
  }

  // Cancelar wizard
  cancelar(): void {
    this.onCancel.emit();
  }

  // Validar todos los pasos
  private validarTodos(): boolean {
    for (let i = 0; i < this.pasos.length; i++) {
      if (!this.validarPaso(i).valido) {
        this.pasoActual.set(i);
        return false;
      }
    }
    return true;
  }

  // Actualizar estado
  private updateState(partial: Partial<GraficaWizardState>): void {
    this.wizardState.update(state => ({ ...state, ...partial }));
  }

  // Reset wizard
  resetWizard(): void {
    this.pasoActual.set(0);
    this.wizardState.set({ ...INITIAL_WIZARD_STATE });
    this.wizardService.limpiarCache();
  }

  // Helper: Obtener label de campo
  getCampoLabel(field: string): string {
    const campos = this.camposDisponibles();
    return campos.find(c => c.field === field)?.label || field;
  }
}
