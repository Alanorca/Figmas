// ============================================================================
// DRILL-DOWN SERVICE
// ============================================================================
// Gestiona la navegación jerárquica (drill-down) de datos en 3 niveles.
// Mantiene un stack de niveles y genera datos filtrados para cada nivel.
// Jerarquías predefinidas por entidad (riesgos, incidentes, activos, etc.)
// ============================================================================

import { Injectable, signal, computed } from '@angular/core';
import {
  EntidadAnalisis,
  NivelDrillDown,
  EstadoDrillDown,
  TipoVisualizacion,
  JERARQUIAS_DRILL_DOWN,
  JerarquiaDrillDown
} from '../models/analisis-inteligente.models';

// ==================== INTERFACES INTERNAS ====================

/** Contexto para iniciar un drill-down */
export interface DrillDownContexto {
  entidad: EntidadAnalisis;
  tituloInicial: string;
  tipoGraficoInicial: TipoVisualizacion;
  datosInicial: {
    labels: string[];
    series: number[];
  };
}

/** Datos simulados para niveles de drill-down */
interface DatosNivelGenerados {
  labels: string[];
  series: number[];
  registros?: any[];
  tipoGrafico: TipoVisualizacion;
  titulo: string;
}

// ==================== DATOS SIMULADOS POR ENTIDAD ====================

/** Datos de drill-down por entidad y nivel para simulación */
const DATOS_DRILL_DOWN: Record<string, Record<string, Record<string, DatosNivelGenerados>>> = {
  riesgos: {
    // Nivel 1: Categoría -> Nivel 2: Estado por categoría
    'Operacional': {
      nivel2: {
        labels: ['Abierto', 'En Proceso', 'Mitigado', 'Cerrado'],
        series: [8, 12, 5, 3],
        tipoGrafico: 'bar',
        titulo: 'Riesgos Operacionales por Estado'
      }
    },
    'Financiero': {
      nivel2: {
        labels: ['Abierto', 'En Proceso', 'Mitigado', 'Cerrado'],
        series: [5, 8, 10, 7],
        tipoGrafico: 'bar',
        titulo: 'Riesgos Financieros por Estado'
      }
    },
    'Tecnológico': {
      nivel2: {
        labels: ['Abierto', 'En Proceso', 'Mitigado', 'Cerrado'],
        series: [15, 6, 4, 2],
        tipoGrafico: 'bar',
        titulo: 'Riesgos Tecnológicos por Estado'
      }
    },
    'Legal': {
      nivel2: {
        labels: ['Abierto', 'En Proceso', 'Mitigado', 'Cerrado'],
        series: [3, 5, 8, 4],
        tipoGrafico: 'bar',
        titulo: 'Riesgos Legales por Estado'
      }
    },
    'Reputacional': {
      nivel2: {
        labels: ['Abierto', 'En Proceso', 'Mitigado', 'Cerrado'],
        series: [2, 4, 3, 1],
        tipoGrafico: 'bar',
        titulo: 'Riesgos Reputacionales por Estado'
      }
    }
  },
  incidentes: {
    // Nivel 1: Severidad -> Nivel 2: Temporal por severidad
    'Crítico': {
      nivel2: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        series: [2, 1, 3, 1, 4, 2],
        tipoGrafico: 'line',
        titulo: 'Incidentes Críticos - Tendencia Mensual'
      }
    },
    'Alto': {
      nivel2: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        series: [5, 8, 6, 9, 7, 10],
        tipoGrafico: 'line',
        titulo: 'Incidentes Altos - Tendencia Mensual'
      }
    },
    'Medio': {
      nivel2: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        series: [10, 12, 8, 15, 11, 14],
        tipoGrafico: 'line',
        titulo: 'Incidentes Medios - Tendencia Mensual'
      }
    },
    'Bajo': {
      nivel2: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        series: [15, 18, 12, 20, 16, 22],
        tipoGrafico: 'line',
        titulo: 'Incidentes Bajos - Tendencia Mensual'
      }
    }
  },
  activos: {
    // Nivel 1: Tipo -> Nivel 2: Estado por tipo
    'Servidores': {
      nivel2: {
        labels: ['Activo', 'Inactivo', 'Mantenimiento', 'Retirado'],
        series: [45, 5, 8, 12],
        tipoGrafico: 'donut',
        titulo: 'Servidores por Estado'
      }
    },
    'Estaciones': {
      nivel2: {
        labels: ['Activo', 'Inactivo', 'Mantenimiento', 'Retirado'],
        series: [120, 15, 10, 25],
        tipoGrafico: 'donut',
        titulo: 'Estaciones de Trabajo por Estado'
      }
    },
    'Aplicaciones': {
      nivel2: {
        labels: ['Producción', 'Desarrollo', 'Depreciado', 'Descontinuado'],
        series: [35, 12, 8, 5],
        tipoGrafico: 'donut',
        titulo: 'Aplicaciones por Estado'
      }
    },
    'Redes': {
      nivel2: {
        labels: ['Activo', 'Inactivo', 'Mantenimiento'],
        series: [28, 3, 4],
        tipoGrafico: 'donut',
        titulo: 'Equipos de Red por Estado'
      }
    }
  },
  controles: {
    'Preventivo': {
      nivel2: {
        labels: ['Efectivo', 'Parcial', 'Inefectivo', 'No evaluado'],
        series: [15, 8, 3, 4],
        tipoGrafico: 'bar',
        titulo: 'Controles Preventivos - Efectividad'
      }
    },
    'Detectivo': {
      nivel2: {
        labels: ['Efectivo', 'Parcial', 'Inefectivo', 'No evaluado'],
        series: [10, 12, 5, 3],
        tipoGrafico: 'bar',
        titulo: 'Controles Detectivos - Efectividad'
      }
    },
    'Correctivo': {
      nivel2: {
        labels: ['Efectivo', 'Parcial', 'Inefectivo', 'No evaluado'],
        series: [8, 6, 4, 2],
        tipoGrafico: 'bar',
        titulo: 'Controles Correctivos - Efectividad'
      }
    }
  },
  cumplimiento: {
    'ISO 27001': {
      nivel2: {
        labels: ['Cumple', 'Parcial', 'No cumple', 'No aplica'],
        series: [45, 20, 10, 5],
        tipoGrafico: 'bar',
        titulo: 'ISO 27001 - Estado de Cumplimiento'
      }
    },
    'GDPR': {
      nivel2: {
        labels: ['Cumple', 'Parcial', 'No cumple', 'No aplica'],
        series: [30, 15, 8, 2],
        tipoGrafico: 'bar',
        titulo: 'GDPR - Estado de Cumplimiento'
      }
    },
    'SOX': {
      nivel2: {
        labels: ['Cumple', 'Parcial', 'No cumple', 'No aplica'],
        series: [25, 10, 5, 10],
        tipoGrafico: 'bar',
        titulo: 'SOX - Estado de Cumplimiento'
      }
    }
  },
  procesos: {
    'Activo': {
      nivel2: {
        labels: ['100%', '75-99%', '50-74%', '<50%'],
        series: [12, 18, 8, 2],
        tipoGrafico: 'bar',
        titulo: 'Procesos Activos - Nivel de Cumplimiento'
      }
    },
    'En revisión': {
      nivel2: {
        labels: ['100%', '75-99%', '50-74%', '<50%'],
        series: [3, 5, 7, 5],
        tipoGrafico: 'bar',
        titulo: 'Procesos en Revisión - Nivel de Cumplimiento'
      }
    },
    'Suspendido': {
      nivel2: {
        labels: ['100%', '75-99%', '50-74%', '<50%'],
        series: [0, 1, 2, 4],
        tipoGrafico: 'bar',
        titulo: 'Procesos Suspendidos - Nivel de Cumplimiento'
      }
    }
  },
  areas: {
    'TI': {
      nivel2: {
        labels: ['Crítico', 'Alto', 'Medio', 'Bajo'],
        series: [5, 12, 18, 8],
        tipoGrafico: 'bar',
        titulo: 'TI - Riesgos por Severidad'
      }
    },
    'Finanzas': {
      nivel2: {
        labels: ['Crítico', 'Alto', 'Medio', 'Bajo'],
        series: [2, 8, 15, 10],
        tipoGrafico: 'bar',
        titulo: 'Finanzas - Riesgos por Severidad'
      }
    },
    'Operaciones': {
      nivel2: {
        labels: ['Crítico', 'Alto', 'Medio', 'Bajo'],
        series: [3, 10, 12, 5],
        tipoGrafico: 'bar',
        titulo: 'Operaciones - Riesgos por Severidad'
      }
    },
    'Legal': {
      nivel2: {
        labels: ['Crítico', 'Alto', 'Medio', 'Bajo'],
        series: [1, 5, 8, 6],
        tipoGrafico: 'bar',
        titulo: 'Legal - Riesgos por Severidad'
      }
    },
    'RRHH': {
      nivel2: {
        labels: ['Crítico', 'Alto', 'Medio', 'Bajo'],
        series: [0, 3, 6, 8],
        tipoGrafico: 'bar',
        titulo: 'RRHH - Riesgos por Severidad'
      }
    }
  },
  objetivos: {
    'En progreso': {
      nivel2: {
        labels: ['0-25%', '26-50%', '51-75%', '76-100%'],
        series: [2, 4, 5, 3],
        tipoGrafico: 'bar',
        titulo: 'Objetivos En Progreso - Avance'
      }
    },
    'Completado': {
      nivel2: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        series: [3, 2, 4, 1],
        tipoGrafico: 'bar',
        titulo: 'Objetivos Completados por Trimestre'
      }
    },
    'Pendiente': {
      nivel2: {
        labels: ['0-25%', '26-50%', '51-75%', '76-100%'],
        series: [5, 2, 1, 0],
        tipoGrafico: 'bar',
        titulo: 'Objetivos Pendientes - Avance'
      }
    }
  }
};

@Injectable({
  providedIn: 'root'
})
export class DrillDownService {
  // ==================== STATE ====================

  private readonly _state = signal<EstadoDrillDown | null>(null);

  /** Observable state of the drill-down */
  readonly state = this._state.asReadonly();

  /** Whether drill-down is active */
  readonly isActive = computed(() => this._state() !== null);

  /** Current level (0-based) */
  readonly nivelActual = computed(() => this._state()?.nivelActual ?? -1);

  /** Current breadcrumb trail */
  readonly breadcrumb = computed(() => this._state()?.breadcrumb ?? []);

  /** Current level data */
  readonly nivelActualData = computed((): NivelDrillDown | null => {
    const s = this._state();
    if (!s) return null;
    return s.niveles[s.nivelActual] ?? null;
  });

  // ==================== PUBLIC API ====================

  /**
   * Initiates a drill-down from an initial chart/data context.
   * Sets up level 1 with the provided data.
   */
  iniciarDrillDown(contexto: DrillDownContexto): EstadoDrillDown {
    const nivel1: NivelDrillDown = {
      nivel: 1,
      titulo: contexto.tituloInicial,
      tipoGrafico: contexto.tipoGraficoInicial,
      datos: {
        labels: contexto.datosInicial.labels,
        series: contexto.datosInicial.series
      }
    };

    const state: EstadoDrillDown = {
      niveles: [nivel1],
      nivelActual: 0,
      breadcrumb: [contexto.tituloInicial],
      entidadBase: contexto.entidad
    };

    this._state.set(state);
    return state;
  }

  /**
   * Drills down into a selected element at the current level.
   * Generates data for the next level based on entity hierarchies.
   *
   * @param elemento - The label/name of the selected element
   * @param nivelActual - The current level number (1-based from NivelDrillDown.nivel)
   * @param contexto - Optional additional context
   * @returns Updated state, or null if already at max depth
   */
  drill(
    elemento: string,
    nivelActual: number,
    contexto?: Record<string, any>
  ): EstadoDrillDown | null {
    const state = this._state();
    if (!state) return null;

    const entidad = state.entidadBase;
    const jerarquia = JERARQUIAS_DRILL_DOWN[entidad];

    // Determine the next level
    const nivelIndex = state.nivelActual;

    if (nivelIndex >= 2) {
      // Already at level 3 (index 2), cannot drill deeper
      return state;
    }

    let nextNivel: NivelDrillDown;

    if (nivelIndex === 0) {
      // Going from level 1 to level 2
      nextNivel = this.generarNivel2(entidad, elemento, jerarquia);
    } else {
      // Going from level 2 to level 3 (table)
      nextNivel = this.generarNivel3(entidad, elemento, state);
    }

    const updatedState: EstadoDrillDown = {
      ...state,
      niveles: [...state.niveles, nextNivel],
      nivelActual: nivelIndex + 1,
      breadcrumb: [...state.breadcrumb, elemento]
    };

    this._state.set(updatedState);
    return updatedState;
  }

  /**
   * Goes up one level in the drill-down stack.
   * If already at level 1, resets the drill-down entirely.
   */
  subirNivel(): EstadoDrillDown | null {
    const state = this._state();
    if (!state) return null;

    if (state.nivelActual <= 0) {
      // At root level, close drill-down
      this._state.set(null);
      return null;
    }

    const updatedState: EstadoDrillDown = {
      ...state,
      niveles: state.niveles.slice(0, -1),
      nivelActual: state.nivelActual - 1,
      breadcrumb: state.breadcrumb.slice(0, -1)
    };

    this._state.set(updatedState);
    return updatedState;
  }

  /**
   * Gets the filtered data for a specific level.
   *
   * @param nivel - 0-based level index
   * @returns The NivelDrillDown data for the requested level, or null
   */
  getDatosNivel(nivel: number): NivelDrillDown | null {
    const state = this._state();
    if (!state || nivel < 0 || nivel >= state.niveles.length) return null;
    return state.niveles[nivel];
  }

  /**
   * Resets the drill-down, returning to level 1 / closing entirely.
   */
  resetDrillDown(): void {
    this._state.set(null);
  }

  /**
   * Gets the hierarchy definition for a given entity.
   */
  getJerarquia(entidad: EntidadAnalisis): JerarquiaDrillDown | undefined {
    return JERARQUIAS_DRILL_DOWN[entidad];
  }

  /**
   * Gets the label for a level in the hierarchy.
   */
  getLabelNivel(entidad: EntidadAnalisis, nivel: number): string {
    const jerarquia = JERARQUIAS_DRILL_DOWN[entidad];
    if (!jerarquia) return `Nivel ${nivel}`;
    switch (nivel) {
      case 1: return jerarquia.nivel1;
      case 2: return jerarquia.nivel2;
      case 3: return jerarquia.nivel3;
      default: return `Nivel ${nivel}`;
    }
  }

  // ==================== PRIVATE: LEVEL DATA GENERATION ====================

  /**
   * Generates level 2 data based on the selected element from level 1.
   * Uses predefined data if available, otherwise generates dynamically.
   */
  private generarNivel2(
    entidad: EntidadAnalisis,
    elementoSeleccionado: string,
    jerarquia: JerarquiaDrillDown
  ): NivelDrillDown {
    // Try to find predefined data
    const entidadData = DATOS_DRILL_DOWN[entidad];
    const elementoData = entidadData?.[elementoSeleccionado]?.['nivel2'];

    if (elementoData) {
      return {
        nivel: 2,
        titulo: elementoData.titulo,
        tipoGrafico: elementoData.tipoGrafico,
        datos: {
          labels: elementoData.labels,
          series: elementoData.series
        },
        elementoSeleccionado,
        filtroAplicado: elementoSeleccionado
      };
    }

    // Fallback: generate dynamic data for unknown elements
    const tipoGrafico = this.inferirTipoGrafico(entidad, 2);
    const { labels, series } = this.generarDatosDinamicos(entidad, elementoSeleccionado, 2);

    return {
      nivel: 2,
      titulo: `${elementoSeleccionado} - ${jerarquia.nivel2}`,
      tipoGrafico,
      datos: { labels, series },
      elementoSeleccionado,
      filtroAplicado: elementoSeleccionado
    };
  }

  /**
   * Generates level 3 data (table with individual records).
   * Level 3 always produces a table view.
   */
  private generarNivel3(
    entidad: EntidadAnalisis,
    elementoSeleccionado: string,
    currentState: EstadoDrillDown
  ): NivelDrillDown {
    const parentLabel = currentState.breadcrumb[currentState.breadcrumb.length - 1] || '';
    const registros = this.generarRegistros(entidad, elementoSeleccionado, parentLabel);

    return {
      nivel: 3,
      titulo: `${elementoSeleccionado} - Registros individuales`,
      tipoGrafico: 'table',
      datos: {
        labels: [],
        series: [],
        registros
      },
      elementoSeleccionado,
      filtroAplicado: `${parentLabel} > ${elementoSeleccionado}`
    };
  }

  /**
   * Infers the best chart type for a given entity and level.
   */
  private inferirTipoGrafico(entidad: EntidadAnalisis, nivel: number): TipoVisualizacion {
    if (nivel === 3) return 'table';

    const mapEntidadTipo: Record<string, TipoVisualizacion> = {
      riesgos: 'bar',
      incidentes: 'line',
      activos: 'donut',
      controles: 'bar',
      cumplimiento: 'bar',
      procesos: 'bar',
      areas: 'bar',
      objetivos: 'bar'
    };

    return mapEntidadTipo[entidad] || 'bar';
  }

  /**
   * Generates dynamic data when predefined data is not available.
   */
  private generarDatosDinamicos(
    entidad: EntidadAnalisis,
    elementoSeleccionado: string,
    nivel: number
  ): { labels: string[]; series: number[] } {
    // Default sub-categories
    const subCategorias: Record<string, string[]> = {
      riesgos: ['Abierto', 'En Proceso', 'Mitigado', 'Cerrado'],
      incidentes: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      activos: ['Activo', 'Inactivo', 'Mantenimiento', 'Retirado'],
      controles: ['Efectivo', 'Parcial', 'Inefectivo', 'No evaluado'],
      cumplimiento: ['Cumple', 'Parcial', 'No cumple', 'No aplica'],
      procesos: ['100%', '75-99%', '50-74%', '<50%'],
      areas: ['Crítico', 'Alto', 'Medio', 'Bajo'],
      objetivos: ['0-25%', '26-50%', '51-75%', '76-100%']
    };

    const labels = subCategorias[entidad] || ['A', 'B', 'C', 'D'];
    const series = labels.map(() => Math.floor(Math.random() * 25) + 3);

    return { labels, series };
  }

  /**
   * Generates individual record rows for the level 3 table.
   * Uses the entity type to generate contextually appropriate data.
   */
  private generarRegistros(
    entidad: EntidadAnalisis,
    elementoSeleccionado: string,
    parentLabel: string
  ): any[] {
    const cantidad = 8 + Math.floor(Math.random() * 8); // 8-15 records
    const registros: any[] = [];

    const prefijos: Record<string, string> = {
      riesgos: 'RSK',
      incidentes: 'INC',
      activos: 'ACT',
      controles: 'CTR',
      cumplimiento: 'CMP',
      procesos: 'PRC',
      areas: 'ARE',
      objetivos: 'OBJ'
    };

    const prefijo = prefijos[entidad] || 'REG';
    const estados = ['Abierto', 'En Proceso', 'Resuelto', 'Cerrado'];
    const severidades = ['Critico', 'Alto', 'Medio', 'Bajo'];

    const nombresBase: Record<string, string[]> = {
      riesgos: [
        'Acceso no autorizado a sistemas',
        'Fuga de información sensible',
        'Interrupción de servicio',
        'Incumplimiento regulatorio',
        'Fraude interno',
        'Desastre natural',
        'Fallo en proveedor crítico',
        'Vulnerabilidad en aplicación web',
        'Pérdida de datos por ransomware',
        'Error humano en configuración',
        'Degradación de infraestructura',
        'Robo de credenciales',
        'Ataque de denegación de servicio',
        'Brecha en cifrado de datos',
        'Incumplimiento de SLA'
      ],
      incidentes: [
        'Intento de phishing detectado',
        'Caída de servidor de producción',
        'Acceso sospechoso desde IP externa',
        'Malware detectado en estación',
        'Fallo en backup nocturno',
        'Degradación de rendimiento BD',
        'Intrusión detectada en firewall',
        'Pérdida de conectividad VPN',
        'Error en despliegue de parche',
        'Alerta de DLP activada',
        'Certificado SSL expirado',
        'Brecha de datos en API',
        'Escalamiento de privilegios',
        'Anomalía en tráfico de red',
        'Fallo en autenticación MFA'
      ],
      activos: [
        'Servidor de Base de Datos Principal',
        'Firewall Perimetral',
        'Switch Core L3',
        'Estación de trabajo Admin',
        'Servidor de Aplicaciones',
        'NAS Almacenamiento',
        'Router Principal',
        'Servidor Web Frontend',
        'Balanceador de Carga',
        'Servidor de Correo',
        'Access Point Oficina',
        'UPS Data Center',
        'Servidor de Monitoreo',
        'Gateway VPN',
        'Servidor de Respaldos'
      ],
      controles: [
        'Revisión de accesos trimestrales',
        'Monitoreo de logs en tiempo real',
        'Política de contraseñas robustas',
        'Cifrado de datos en reposo',
        'Respaldo diario automatizado',
        'Escaneo de vulnerabilidades mensual',
        'Capacitación en seguridad',
        'Segmentación de red',
        'Autenticación multifactor',
        'Plan de continuidad del negocio',
        'Gestión de parches',
        'Control de acceso basado en roles',
        'Auditoría de cambios',
        'Protección contra malware',
        'Revisión de código seguro'
      ]
    };

    const nombres = nombresBase[entidad] || nombresBase['riesgos'];

    for (let i = 0; i < cantidad; i++) {
      const id = `${prefijo}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
      const nombreIndex = i % nombres.length;
      const diasAtras = Math.floor(Math.random() * 180);
      const fecha = new Date(Date.now() - diasAtras * 24 * 60 * 60 * 1000);

      registros.push({
        id,
        nombre: `${nombres[nombreIndex]}`,
        estado: estados[Math.floor(Math.random() * estados.length)],
        severidad: elementoSeleccionado === 'Crítico' || elementoSeleccionado === 'Critico'
          ? 'Critico'
          : elementoSeleccionado === 'Alto'
            ? severidades[Math.floor(Math.random() * 2)]  // Critico or Alto
            : severidades[Math.floor(Math.random() * severidades.length)],
        fecha: fecha.toLocaleDateString('es-ES'),
        entidad,
        categoriaOrigen: parentLabel,
        filtro: elementoSeleccionado
      });
    }

    return registros;
  }
}
