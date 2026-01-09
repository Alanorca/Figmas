// Tipos base
export type Criticidad = 'alta' | 'media' | 'baja';
export type TipoActivo = 'hardware' | 'software' | 'datos' | 'personas' | 'instalaciones';
export type EstadoRiesgo = 'identificado' | 'evaluado' | 'mitigado' | 'aceptado';
export type Severidad = 'critica' | 'alta' | 'media' | 'baja';
export type EstadoIncidente = 'abierto' | 'en_proceso' | 'resuelto' | 'cerrado';
export type TipoDefecto = 'funcional' | 'seguridad' | 'rendimiento' | 'usabilidad';
export type EstadoDefecto = 'nuevo' | 'confirmado' | 'en_correccion' | 'corregido' | 'verificado';
export type HealthStatus = 'HEALTHY' | 'STRESSED' | 'CRITICAL';
export type CategoriaRiesgo = 'bajo' | 'medio' | 'alto';

// Tipos para propiedades custom de activos
export type TipoPropiedadCustom = 'texto' | 'numero' | 'fecha' | 'booleano' | 'seleccion' | 'multiseleccion' | 'url' | 'email';

// Definición de una propiedad custom en la plantilla
export interface PropiedadCustomDefinicion {
  id: string;
  nombre: string;
  campo: string; // nombre del campo para acceso
  tipo: TipoPropiedadCustom;
  requerido: boolean;
  descripcion?: string;
  valorDefecto?: any;
  opciones?: { label: string; value: string }[]; // Para seleccion/multiseleccion
  validacion?: {
    min?: number;
    max?: number;
    patron?: string; // regex
  };
}

// Plantilla de activo (define las propiedades custom según tipo)
export interface PlantillaActivo {
  id: string;
  nombre: string;
  tipoActivo: TipoActivo;
  descripcion: string;
  icono: string;
  color: string;
  propiedades: PropiedadCustomDefinicion[];
}

// Valor de una propiedad custom en un activo específico
export interface PropiedadCustomValor {
  propiedadId: string;
  campo: string;
  valor: any;
}

// Interfaces
export interface Riesgo {
  id: string;
  activoId: string;
  descripcion: string;
  probabilidad: 1 | 2 | 3 | 4 | 5;
  impacto: 1 | 2 | 3 | 4 | 5;
  estado: EstadoRiesgo;
  fechaIdentificacion: Date;
  responsable: string;
}

export interface Incidente {
  id: string;
  activoId: string;
  titulo: string;
  descripcion: string;
  severidad: Severidad;
  estado: EstadoIncidente;
  fechaReporte: Date;
  reportadoPor: string;
}

export interface Defecto {
  id: string;
  activoId: string;
  titulo: string;
  descripcion: string;
  tipo: TipoDefecto;
  prioridad: Severidad;
  estado: EstadoDefecto;
  fechaDeteccion: Date;
  detectadoPor: string;
}

// Apetito de Riesgo
export interface RiskAppetite {
  id: string;
  nombre: string;
  descripcion?: string;
  riesgoInherente: number;
  riesgoResidual: number;
  apetitoRiesgo: number;
  categoriaRiesgo: CategoriaRiesgo;
  fechaCreacion?: Date;
}

// Activo resumido para jerarquía
export interface ActivoResumen {
  id: string;
  nombre: string;
  tipo: TipoActivo;
  criticidad?: Criticidad;
  healthStatus?: HealthStatus;
}

export interface Activo {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: TipoActivo;
  criticidad: Criticidad;
  responsable: string;
  departamento: string;
  fechaRegistro: Date;
  riesgos: Riesgo[];
  incidentes: Incidente[];
  defectos: Defecto[];
  // Propiedades custom basadas en plantilla
  plantillaId?: string;
  plantilla?: PlantillaActivo;
  propiedadesCustom?: PropiedadCustomValor[];
  // Estado de Salud
  incidentToleranceThreshold?: number;
  currentIncidentCount?: number;
  healthStatus?: HealthStatus;
  lastIncidentDate?: Date;
  requiresImmediateAttention?: boolean;
  incidentCountResetDays?: number;
  // Valor y Estado
  assetValue?: number;
  isActive?: boolean;
  // Jerarquía
  parentAssetId?: string;
  parentAsset?: ActivoResumen;
  childAssets?: ActivoResumen[];
  // Apetito de Riesgo
  riskAppetiteId?: string;
  riskAppetite?: RiskAppetite;
}

// Tipos de contenedor organizacional (jerarquía de 3 niveles)
export type TipoContenedorOrganizacional = 'ORGANIZATION' | 'AREA' | 'SUBAREA';

// Tipos de propiedad custom para contenedores organizacionales
export type TipoPropiedadOrganizacion = 'TEXT' | 'NUMBER';

// Propiedad personalizada de un contenedor organizacional
export interface PropiedadOrganizacion {
  id: string;
  nombre: string;
  tipo: TipoPropiedadOrganizacion;
  valor: string | number;
  requerido: boolean;
}

// Objetivo de negocio vinculado
export interface ObjetivoNegocioVinculado {
  id: string;
  nombre: string;
  descripcion?: string;
  kpis?: { nombre: string; valor: number; meta: number }[];
}

// Usuario responsable
export interface ResponsableContenedor {
  id: string;
  nombre: string;
  email: string;
  avatar?: string;
}

export interface NodoOrganigrama {
  id: string;
  nombre: string;
  descripcion?: string;
  // Tipo de contenedor (ORGANIZATION, AREA, SUBAREA)
  tipo: TipoContenedorOrganizacional;
  cargo: string;
  departamento: string;
  email: string;
  telefono: string;
  foto?: string;
  padreId?: string | null;
  organigramaId?: string;
  subordinados: NodoOrganigrama[];
  // Nuevos campos según especificación
  responsable?: ResponsableContenedor;
  propiedadesCustom?: PropiedadOrganizacion[];
  objetivosNegocio?: ObjetivoNegocioVinculado[];
  // Campos de auditoría
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

export interface Organigrama {
  id: string;
  nombre: string;
  descripcion: string;
  fechaCreacion: Date;
  raiz: NodoOrganigrama;
}

// Constantes para iconos por tipo de contenedor
export const ICONOS_CONTENEDOR: Record<TipoContenedorOrganizacional, string> = {
  'ORGANIZATION': 'pi pi-building',
  'AREA': 'pi pi-th-large',
  'SUBAREA': 'pi pi-users'
};

// Constantes para colores por tipo de contenedor
export const COLORES_CONTENEDOR: Record<TipoContenedorOrganizacional, string> = {
  'ORGANIZATION': 'var(--primary-color)',
  'AREA': 'var(--orange-500)',
  'SUBAREA': 'var(--green-500)'
};

// Etiquetas para tipos de contenedor
export const ETIQUETAS_CONTENEDOR: Record<TipoContenedorOrganizacional, string> = {
  'ORGANIZATION': 'Organización',
  'AREA': 'Área',
  'SUBAREA': 'Subárea'
};

// Grafo de relaciones de activo
export interface ActivoGraphNode {
  id: string;
  label: string;
  type: 'activo' | 'activo-padre' | 'activo-hijo' | 'riesgo' | 'incidente' | 'defecto';
  data: any;
}

export interface ActivoGraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

export interface ActivoGraph {
  nodes: ActivoGraphNode[];
  edges: ActivoGraphEdge[];
}

// Diagnóstico de salud
export interface HealthDiagnostic {
  summary: {
    HEALTHY: number;
    STRESSED: number;
    CRITICAL: number;
  };
  criticalAssets: Array<{
    id: string;
    nombre: string;
    currentIncidentCount: number;
    incidentToleranceThreshold: number;
    lastIncidentDate?: Date;
  }>;
  attentionRequired: number;
}

// Configuración de tolerancia
export interface ToleranceConfig {
  incidentToleranceThreshold: number;
  incidentCountResetDays: number;
}
