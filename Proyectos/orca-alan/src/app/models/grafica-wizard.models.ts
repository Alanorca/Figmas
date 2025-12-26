// Modelos para el Wizard de Configuración de Gráficas Interactivas

import { TipoEntidad } from './tabla-unificada.models';

// Categorías de gráficas
export type CategoriaGrafica = 'circulares' | 'barras' | 'lineas' | 'avanzadas' | 'embudo';

// Tipos de gráficas disponibles
export type TipoGraficaWizard =
  | 'pie' | 'doughnut' | 'polarArea'  // Circulares
  | 'bar' | 'bar-horizontal' | 'bar-stacked'  // Barras
  | 'line' | 'line-area' | 'line-stepped'  // Líneas
  | 'radar' | 'scatter' | 'bubble'  // Avanzadas
  | 'funnel';  // Embudo

// Tipo de campo para configuración dinámica
export type TipoCampo = 'categoria' | 'numerico' | 'fecha' | 'texto';

// Tipo de agregación
export type TipoAgregacion = 'conteo' | 'suma' | 'promedio' | 'minimo' | 'maximo';

// Campo de entidad para configuración
export interface CampoEntidad {
  field: string;
  label: string;
  tipo: TipoCampo;
  valoresUnicos?: string[];  // Se llena dinámicamente con datos de la BD
}

// Configuración de categoría de gráfica
export interface CategoriaGraficaConfig {
  id: CategoriaGrafica;
  nombre: string;
  icono: string;
  descripcion: string;
  tipos: TipoGraficaConfig[];
}

// Configuración de tipo de gráfica específico
export interface TipoGraficaConfig {
  id: TipoGraficaWizard;
  nombre: string;
  icono: string;
  descripcion: string;
  requiereEjes: boolean;  // true = barras/líneas, false = circulares
  soportaSeries: boolean;  // true = puede tener múltiples series
}

// Configuración de fuente de datos
export interface FuenteDatosConfig {
  id: TipoEntidad;
  nombre: string;
  icono: string;
  descripcion: string;
}

// Cruce de datos disponible
export interface CruceDatosConfig {
  origen: TipoEntidad;
  destino: TipoEntidad;
  campoRelacion: string;
  descripcion: string;
}

// Estado completo del wizard
export interface GraficaWizardState {
  // Paso 0: Tipo de gráfica
  categoriaGrafica: CategoriaGrafica | null;
  tipoGrafica: TipoGraficaWizard | null;

  // Paso 1: Fuente de datos
  fuenteDatos: TipoEntidad | null;
  datosDisponibles: any[];
  totalRegistros: number;
  cargandoDatos: boolean;
  errorDatos: string | null;

  // Paso 2: Configuración de campos
  // Para gráficas circulares
  campoAgrupacion: string | null;
  tipoAgregacion: TipoAgregacion;
  campoValor: string | null;  // Solo si agregación es suma/promedio

  // Para gráficas de ejes (barras, líneas)
  campoEjeX: string | null;
  campoEjeY: string | null;
  campoSeries: string | null;  // Opcional, para múltiples series

  // Cruce de datos (opcional)
  usarCruce: boolean;
  cruceSeleccionado: CruceDatosConfig | null;

  // Paso 3: Estilo y confirmación
  titulo: string;
  subtitulo: string;
  paleta: string;
  mostrarLeyenda: boolean;
  mostrarEtiquetas: boolean;
  mostrarAnimaciones: boolean;
  mostrarGrid: boolean;
}

// Configuración final que se emite al confirmar
export interface GraficaWizardResult {
  tipoGrafica: TipoGraficaWizard;
  fuenteDatos: TipoEntidad;
  configuracion: {
    campoAgrupacion?: string;
    tipoAgregacion: TipoAgregacion;
    campoValor?: string;
    campoEjeX?: string;
    campoEjeY?: string;
    campoSeries?: string;
    cruce?: CruceDatosConfig;
  };
  estilo: {
    titulo: string;
    subtitulo: string;
    paleta: string;
    mostrarLeyenda: boolean;
    mostrarEtiquetas: boolean;
    mostrarAnimaciones: boolean;
    mostrarGrid: boolean;
  };
  datos: any[];  // Datos preprocesados para la gráfica
}

// Validación de paso
export interface ValidacionPaso {
  valido: boolean;
  errores: string[];
}

// Constantes de configuración

export const CATEGORIAS_GRAFICAS: CategoriaGraficaConfig[] = [
  {
    id: 'circulares',
    nombre: 'Circulares',
    icono: 'pi pi-chart-pie',
    descripcion: 'Pie, Dona, Polar',
    tipos: [
      { id: 'pie', nombre: 'Pie', icono: 'pi pi-chart-pie', descripcion: 'Gráfica circular clásica', requiereEjes: false, soportaSeries: false },
      { id: 'doughnut', nombre: 'Dona', icono: 'pi pi-circle', descripcion: 'Circular con hueco central', requiereEjes: false, soportaSeries: false },
      { id: 'polarArea', nombre: 'Área Polar', icono: 'pi pi-sun', descripcion: 'Sectores con diferente radio', requiereEjes: false, soportaSeries: false }
    ]
  },
  {
    id: 'barras',
    nombre: 'Barras',
    icono: 'pi pi-chart-bar',
    descripcion: 'Vertical, Horizontal, Apiladas',
    tipos: [
      { id: 'bar', nombre: 'Barras Verticales', icono: 'pi pi-chart-bar', descripcion: 'Barras verticales clásicas', requiereEjes: true, soportaSeries: true },
      { id: 'bar-horizontal', nombre: 'Barras Horizontales', icono: 'pi pi-bars', descripcion: 'Barras en horizontal', requiereEjes: true, soportaSeries: true },
      { id: 'bar-stacked', nombre: 'Barras Apiladas', icono: 'pi pi-chart-bar', descripcion: 'Barras apiladas por categoría', requiereEjes: true, soportaSeries: true }
    ]
  },
  {
    id: 'lineas',
    nombre: 'Líneas',
    icono: 'pi pi-chart-line',
    descripcion: 'Líneas, Áreas, Escalonadas',
    tipos: [
      { id: 'line', nombre: 'Líneas', icono: 'pi pi-chart-line', descripcion: 'Líneas simples', requiereEjes: true, soportaSeries: true },
      { id: 'line-area', nombre: 'Áreas', icono: 'pi pi-chart-line', descripcion: 'Líneas con área rellena', requiereEjes: true, soportaSeries: true },
      { id: 'line-stepped', nombre: 'Escalonadas', icono: 'pi pi-chart-line', descripcion: 'Líneas en escalones', requiereEjes: true, soportaSeries: true }
    ]
  },
  {
    id: 'avanzadas',
    nombre: 'Avanzadas',
    icono: 'pi pi-star',
    descripcion: 'Radar, Scatter, Bubble',
    tipos: [
      { id: 'radar', nombre: 'Radar', icono: 'pi pi-star', descripcion: 'Comparación multidimensional', requiereEjes: false, soportaSeries: true },
      { id: 'scatter', nombre: 'Dispersión', icono: 'pi pi-circle', descripcion: 'Puntos de correlación', requiereEjes: true, soportaSeries: true },
      { id: 'bubble', nombre: 'Burbujas', icono: 'pi pi-circle-fill', descripcion: 'Dispersión con tamaño variable', requiereEjes: true, soportaSeries: true }
    ]
  },
  {
    id: 'embudo',
    nombre: 'Embudo',
    icono: 'pi pi-filter',
    descripcion: 'Visualización de procesos',
    tipos: [
      { id: 'funnel', nombre: 'Embudo', icono: 'pi pi-filter', descripcion: 'Flujo de etapas', requiereEjes: false, soportaSeries: false }
    ]
  }
];

export const FUENTES_DATOS: FuenteDatosConfig[] = [
  { id: 'riesgo', nombre: 'Riesgos', icono: 'pi pi-shield', descripcion: 'Riesgos identificados' },
  { id: 'incidente', nombre: 'Incidentes', icono: 'pi pi-exclamation-triangle', descripcion: 'Incidentes de seguridad' },
  { id: 'activo', nombre: 'Activos', icono: 'pi pi-box', descripcion: 'Activos de información' },
  { id: 'proceso', nombre: 'Procesos', icono: 'pi pi-sitemap', descripcion: 'Procesos del negocio' },
  { id: 'defecto', nombre: 'Defectos', icono: 'pi pi-bug', descripcion: 'Defectos encontrados' },
  { id: 'revision', nombre: 'Revisiones', icono: 'pi pi-file-check', descripcion: 'Revisiones de cumplimiento' },
  { id: 'cumplimiento', nombre: 'Cumplimiento', icono: 'pi pi-verified', descripcion: 'Marcos normativos' }
];

export const CAMPOS_POR_ENTIDAD: Record<TipoEntidad, CampoEntidad[]> = {
  riesgo: [
    { field: 'estado', label: 'Estado', tipo: 'categoria' },
    { field: 'probabilidad', label: 'Probabilidad', tipo: 'numerico' },
    { field: 'impacto', label: 'Impacto', tipo: 'numerico' },
    { field: 'nivelRiesgo', label: 'Nivel de Riesgo', tipo: 'numerico' },
    { field: 'responsable', label: 'Responsable', tipo: 'categoria' },
    { field: 'contenedorNombre', label: 'Activo', tipo: 'categoria' },
    { field: 'fecha', label: 'Fecha', tipo: 'fecha' }
  ],
  incidente: [
    { field: 'estado', label: 'Estado', tipo: 'categoria' },
    { field: 'severidad', label: 'Severidad', tipo: 'categoria' },
    { field: 'reportadoPor', label: 'Reportado Por', tipo: 'categoria' },
    { field: 'contenedorNombre', label: 'Activo', tipo: 'categoria' },
    { field: 'fecha', label: 'Fecha', tipo: 'fecha' }
  ],
  activo: [
    { field: 'tipo', label: 'Tipo', tipo: 'categoria' },
    { field: 'criticidad', label: 'Criticidad', tipo: 'categoria' },
    { field: 'departamento', label: 'Departamento', tipo: 'categoria' },
    { field: 'estado', label: 'Estado', tipo: 'categoria' }
  ],
  proceso: [
    { field: 'estado', label: 'Estado', tipo: 'categoria' },
    { field: 'version', label: 'Versión', tipo: 'texto' },
    { field: 'responsable', label: 'Responsable', tipo: 'categoria' }
  ],
  defecto: [
    { field: 'estado', label: 'Estado', tipo: 'categoria' },
    { field: 'prioridad', label: 'Prioridad', tipo: 'categoria' },
    { field: 'tipoDefecto', label: 'Tipo de Defecto', tipo: 'categoria' },
    { field: 'detectadoPor', label: 'Detectado Por', tipo: 'categoria' },
    { field: 'contenedorNombre', label: 'Activo', tipo: 'categoria' }
  ],
  revision: [
    { field: 'estado', label: 'Estado', tipo: 'categoria' },
    { field: 'responsable', label: 'Responsable', tipo: 'categoria' }
  ],
  cumplimiento: [
    { field: 'estado', label: 'Estado', tipo: 'categoria' }
  ]
};

export const CRUCES_DISPONIBLES: CruceDatosConfig[] = [
  { origen: 'riesgo', destino: 'activo', campoRelacion: 'activoId', descripcion: 'Riesgos por Activo' },
  { origen: 'incidente', destino: 'activo', campoRelacion: 'activoId', descripcion: 'Incidentes por Activo' },
  { origen: 'defecto', destino: 'activo', campoRelacion: 'activoId', descripcion: 'Defectos por Activo' }
];

export const PALETAS_COLORES = [
  { id: 'vibrant', nombre: 'Vibrante', colores: ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#3F51B5'] },
  { id: 'pastel', nombre: 'Pastel', colores: ['#80DEEA', '#CE93D8', '#FFAB91', '#A5D6A7', '#90CAF9', '#FFF59D'] },
  { id: 'neon', nombre: 'Neón', colores: ['#00FFFF', '#FF00FF', '#FFFF00', '#00FF00', '#FF0080', '#8000FF'] },
  { id: 'corporate', nombre: 'Corporativo', colores: ['#2E5BFF', '#8C54FF', '#00C1D4', '#FAD02C', '#F7C137', '#33D9B2'] },
  { id: 'earth', nombre: 'Tierra', colores: ['#8D6E63', '#A1887F', '#BCAAA4', '#795548', '#6D4C41', '#5D4037'] },
  { id: 'ocean', nombre: 'Océano', colores: ['#0277BD', '#0288D1', '#039BE5', '#03A9F4', '#29B6F6', '#4FC3F7'] },
  { id: 'sunset', nombre: 'Atardecer', colores: ['#FF6B6B', '#FF8E72', '#FFA07A', '#FFB347', '#FFCC5C', '#FFE66D'] },
  { id: 'semaforo', nombre: 'Semáforo', colores: ['#22C55E', '#EAB308', '#F97316', '#EF4444', '#DC2626'] },
  { id: 'monoazul', nombre: 'Mono Azul', colores: ['#1E3A5F', '#2E5984', '#3E78A9', '#4E97CE', '#6EB5E8', '#8ED3F2'] }
];

// Estado inicial del wizard
export const INITIAL_WIZARD_STATE: GraficaWizardState = {
  categoriaGrafica: null,
  tipoGrafica: null,
  fuenteDatos: null,
  datosDisponibles: [],
  totalRegistros: 0,
  cargandoDatos: false,
  errorDatos: null,
  campoAgrupacion: null,
  tipoAgregacion: 'conteo',
  campoValor: null,
  campoEjeX: null,
  campoEjeY: null,
  campoSeries: null,
  usarCruce: false,
  cruceSeleccionado: null,
  titulo: '',
  subtitulo: '',
  paleta: 'vibrant',
  mostrarLeyenda: true,
  mostrarEtiquetas: true,
  mostrarAnimaciones: true,
  mostrarGrid: true
};
