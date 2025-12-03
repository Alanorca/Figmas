// Tipos base
export type Criticidad = 'alta' | 'media' | 'baja';
export type TipoActivo = 'hardware' | 'software' | 'datos' | 'personas' | 'instalaciones';
export type EstadoRiesgo = 'identificado' | 'evaluado' | 'mitigado' | 'aceptado';
export type Severidad = 'critica' | 'alta' | 'media' | 'baja';
export type EstadoIncidente = 'abierto' | 'en_proceso' | 'resuelto' | 'cerrado';
export type TipoDefecto = 'funcional' | 'seguridad' | 'rendimiento' | 'usabilidad';
export type EstadoDefecto = 'nuevo' | 'confirmado' | 'en_correccion' | 'corregido' | 'verificado';

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
}

export interface NodoOrganigrama {
  id: string;
  nombre: string;
  cargo: string;
  departamento: string;
  email: string;
  telefono: string;
  foto?: string;
  subordinados: NodoOrganigrama[];
}

export interface Organigrama {
  id: string;
  nombre: string;
  descripcion: string;
  fechaCreacion: Date;
  raiz: NodoOrganigrama;
}
