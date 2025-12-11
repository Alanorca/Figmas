// Tipos para la tabla unificada de riesgos e incidentes

export type TipoEntidad = 'riesgo' | 'incidente';
export type TipoContenedor = 'activo' | 'proceso';

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
  contenedorId: string;
  contenedorNombre: string;
  tipoContenedor: TipoContenedor;

  // Campos comunes
  descripcion: string;
  estado: string;
  fecha: Date;
  responsable: string;

  // Campos específicos de riesgo
  probabilidad?: 1 | 2 | 3 | 4 | 5;
  impacto?: 1 | 2 | 3 | 4 | 5;
  nivelRiesgo?: number;

  // Campos específicos de incidente
  titulo?: string;
  severidad?: string;
  reportadoPor?: string;
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
export type TipoGrafica = 'pie' | 'dona' | 'barras' | 'lineas' | 'embudo' | 'radar' | 'radial';
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
