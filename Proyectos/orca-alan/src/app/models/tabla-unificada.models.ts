// Tipos para la tabla unificada de todas las entidades GRC

export type TipoEntidad = 'riesgo' | 'incidente' | 'activo' | 'proceso' | 'defecto' | 'revision' | 'cumplimiento';
export type TipoContenedor = 'activo' | 'proceso' | 'ninguno';

// Tipo de columna para filtros
export type TipoColumna = 'texto' | 'numero' | 'fecha' | 'seleccion' | 'contenedor';

// Operadores de filtro
export type OperadorTexto = 'contiene' | 'empieza_con' | 'termina_con' | 'igual';
export type OperadorNumero = 'igual' | 'mayor' | 'menor' | 'entre';
export type OperadorFecha = 'igual' | 'antes' | 'despues' | 'entre';

// Interfaz para registro unificado
export interface RegistroUnificado {
  id: string;
  tipoEntidad: TipoEntidad;
  contenedorId?: string;
  contenedorNombre?: string;
  tipoContenedor: TipoContenedor;

  // Campos comunes
  nombre?: string;
  descripcion: string;
  estado: string;
  fecha: Date;
  responsable?: string;

  // Campos específicos de riesgo
  probabilidad?: 1 | 2 | 3 | 4 | 5;
  impacto?: 1 | 2 | 3 | 4 | 5;
  nivelRiesgo?: number;

  // Campos específicos de incidente
  titulo?: string;
  severidad?: string;
  reportadoPor?: string;

  // Campos específicos de activo
  tipo?: string;
  criticidad?: string;
  departamento?: string;

  // Campos específicos de proceso
  version?: string;

  // Campos específicos de defecto
  prioridad?: string;
  detectadoPor?: string;
  tipoDefecto?: string;
}

// Configuración de columna
export interface ColumnaConfig {
  field: string;
  header: string;
  tipo: TipoColumna;
  visible: boolean;
  width?: string;
  sortable: boolean;
  filterable: boolean;
  orden: number;
  opciones?: { label: string; value: string }[]; // Para columnas de tipo selección
}

// Filtro activo
export interface FiltroActivo {
  columna: string;
  tipo: TipoColumna;
  operador: string;
  valor: any;
  valorHasta?: any; // Para rangos
  etiqueta: string; // Para mostrar en chips
}

// Configuración de gráfica
export type TipoGrafica = 'pie' | 'dona' | 'barras' | 'lineas' | 'embudo' | 'piramide' | 'radar' | 'radial';
export type TipoAgregacion = 'conteo' | 'suma' | 'promedio';
export type AgrupacionTemporal = 'dia' | 'semana' | 'mes' | 'trimestre' | 'año';

export interface ConfiguracionGrafica {
  tipo: TipoGrafica;
  titulo: string;

  // Configuración de datos
  columnaCategoria: string;
  agregacion: TipoAgregacion;
  columnaValor?: string;

  // Para barras agrupadas
  columnaAgrupacion?: string;

  // Para líneas temporales
  agrupacionTemporal?: AgrupacionTemporal;
  columnaSeries?: string;

  // Personalización
  mostrarLeyenda: boolean;
  posicionLeyenda: 'arriba' | 'abajo' | 'derecha' | 'izquierda';
  mostrarEtiquetas: boolean;
  paletaColores: 'default' | 'semantica' | 'monocromatica';
  mostrarGrid: boolean;
}

// Presets de fecha para filtros
export interface PresetFecha {
  label: string;
  value: string;
  getFechas: () => { desde: Date; hasta: Date };
}

// Estado de la tabla
export interface EstadoTabla {
  entidadesSeleccionadas: TipoEntidad[];
  filtrosActivos: FiltroActivo[];
  columnasVisibles: string[];
  ordenColumnas: string[];
  ordenamiento: { campo: string; direccion: 'asc' | 'desc' } | null;
  pagina: number;
  registrosPorPagina: number;
}

// Opciones de exportación
export type FormatoExportacion = 'csv' | 'excel';
export type FormatoImagen = 'png' | 'jpg' | 'svg';

export interface OpcionesExportacion {
  formato: FormatoExportacion;
  incluirTodo: boolean; // true = todos los filtrados, false = solo página actual
  columnasVisibles: boolean; // true = solo visibles, false = todas
}

// Widget de dashboard para gráficas guardadas
export interface WidgetGrafica {
  id: string;
  titulo: string;
  descripcion?: string;
  configuracion: ConfiguracionGrafica;
  filtros: FiltroActivo[];
  entidades: TipoEntidad[];
  fechaCreacion: Date;
  tamaño: 'pequeño' | 'mediano' | 'grande';
  posicion?: { x: number; y: number };
}

// Exportación programada
export interface ExportacionProgramada {
  id: string;
  nombre: string;
  formato: FormatoExportacion;
  frecuencia: 'diaria' | 'semanal' | 'mensual';
  diasSemana?: number[]; // 0-6 para semanal
  diaDelMes?: number; // 1-31 para mensual
  hora: string; // HH:MM
  destinatarios: string[]; // emails
  filtros: FiltroActivo[];
  entidades: TipoEntidad[];
  columnasIncluidas: string[];
  activa: boolean;
  ultimaEjecucion?: Date;
  proximaEjecucion?: Date;
}

// Alerta basada en filtros
export interface AlertaFiltro {
  id: string;
  nombre: string;
  descripcion?: string;
  condiciones: FiltroActivo[];
  entidades: TipoEntidad[];
  umbral: number; // Número mínimo de registros que activan la alerta
  operadorUmbral: 'mayor' | 'menor' | 'igual' | 'diferente';
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  notificarPor: ('email' | 'push' | 'inApp')[];
  destinatarios: string[];
  activa: boolean;
  ultimaActivacion?: Date;
  vecesActivada: number;
}

// Vista compartida
export interface VistaCompartida {
  id: string;
  codigo: string; // Código único para URL
  nombre: string;
  descripcion?: string;
  creador: string;
  fechaCreacion: Date;
  fechaExpiracion?: Date;
  configuracion: {
    entidades: TipoEntidad[];
    filtros: FiltroActivo[];
    columnasVisibles: string[];
    ordenColumnas: string[];
    ordenamiento?: { campo: string; direccion: 'asc' | 'desc' };
    graficaConfig?: ConfiguracionGrafica;
  };
  accesos: number;
  ultimoAcceso?: Date;
  activa: boolean;
}

// Gráfica combinada
export type TipoGraficaCombinada = 'barras_linea' | 'area_linea' | 'barras_area';

export interface ConfiguracionGraficaCombinada extends ConfiguracionGrafica {
  tipoCombinado: TipoGraficaCombinada;
  serieSecundaria: {
    columnaCategoria: string;
    agregacion: TipoAgregacion;
    columnaValor?: string;
    tipo: 'linea' | 'area';
    color?: string;
  };
  ejeYSecundario: boolean;
}

// Interfaces para grafo de relaciones
export interface GraphNode {
  id: string;
  label: string;
  type: TipoEntidad | 'central';
  icon?: string;
  color?: string;
  data?: any;
}

export interface GraphEdge {
  source: string;
  target: string;
  label?: string;
  type?: string;
}
