// ============================================================================
// CONFIGURACIÓN DE COLUMNAS POR FUENTE DE DATOS
// ============================================================================
// Define las columnas disponibles para cada tipo de fuente de datos
// de widgets de tabla. Usado por el configurador de widgets.
// ============================================================================

import { ColumnaConfig } from './tabla-unificada.models';

export const TABLE_COLUMNS_BY_SOURCE: Record<string, ColumnaConfig[]> = {
  riesgos: [
    { field: 'id', header: 'ID', tipo: 'texto', visible: false, sortable: true, filterable: true, orden: 0 },
    { field: 'descripcion', header: 'Descripción', tipo: 'texto', visible: true, sortable: true, filterable: true, orden: 1 },
    { field: 'activoNombre', header: 'Activo', tipo: 'texto', visible: true, sortable: true, filterable: true, orden: 2 },
    { field: 'probabilidad', header: 'Probabilidad', tipo: 'numero', visible: true, sortable: true, filterable: true, orden: 3 },
    { field: 'impacto', header: 'Impacto', tipo: 'numero', visible: true, sortable: true, filterable: true, orden: 4 },
    { field: 'nivelRiesgo', header: 'Nivel', tipo: 'numero', visible: true, sortable: true, filterable: true, orden: 5 },
    {
      field: 'estado',
      header: 'Estado',
      tipo: 'seleccion',
      visible: true,
      sortable: true,
      filterable: true,
      orden: 6,
      opciones: [
        { label: 'Identificado', value: 'identificado' },
        { label: 'Evaluado', value: 'evaluado' },
        { label: 'Mitigado', value: 'mitigado' },
        { label: 'Aceptado', value: 'aceptado' },
      ],
    },
    { field: 'responsable', header: 'Responsable', tipo: 'texto', visible: false, sortable: true, filterable: true, orden: 7 },
  ],

  incidentes: [
    { field: 'id', header: 'ID', tipo: 'texto', visible: false, sortable: true, filterable: true, orden: 0 },
    { field: 'titulo', header: 'Título', tipo: 'texto', visible: true, sortable: true, filterable: true, orden: 1 },
    { field: 'descripcion', header: 'Descripción', tipo: 'texto', visible: true, sortable: true, filterable: true, orden: 2 },
    {
      field: 'severidad',
      header: 'Severidad',
      tipo: 'seleccion',
      visible: true,
      sortable: true,
      filterable: true,
      orden: 3,
      opciones: [
        { label: 'Crítica', value: 'critica' },
        { label: 'Alta', value: 'alta' },
        { label: 'Media', value: 'media' },
        { label: 'Baja', value: 'baja' },
      ],
    },
    {
      field: 'estado',
      header: 'Estado',
      tipo: 'seleccion',
      visible: true,
      sortable: true,
      filterable: true,
      orden: 4,
      opciones: [
        { label: 'Abierto', value: 'abierto' },
        { label: 'En proceso', value: 'en_proceso' },
        { label: 'Resuelto', value: 'resuelto' },
        { label: 'Cerrado', value: 'cerrado' },
      ],
    },
    { field: 'fecha', header: 'Fecha', tipo: 'fecha', visible: true, sortable: true, filterable: true, orden: 5 },
    { field: 'responsable', header: 'Responsable', tipo: 'texto', visible: false, sortable: true, filterable: true, orden: 6 },
    { field: 'reportadoPor', header: 'Reportado Por', tipo: 'texto', visible: false, sortable: true, filterable: true, orden: 7 },
  ],

  procesos: [
    { field: 'id', header: 'ID', tipo: 'texto', visible: false, sortable: true, filterable: true, orden: 0 },
    { field: 'nombre', header: 'Nombre', tipo: 'texto', visible: true, sortable: true, filterable: true, orden: 1 },
    { field: 'descripcion', header: 'Descripción', tipo: 'texto', visible: true, sortable: true, filterable: true, orden: 2 },
    {
      field: 'estado',
      header: 'Estado',
      tipo: 'seleccion',
      visible: true,
      sortable: true,
      filterable: true,
      orden: 3,
      opciones: [
        { label: 'Activo', value: 'activo' },
        { label: 'En revisión', value: 'revision' },
        { label: 'Borrador', value: 'borrador' },
        { label: 'Archivado', value: 'archivado' },
      ],
    },
    { field: 'cumplimiento', header: 'Cumplimiento', tipo: 'numero', visible: true, sortable: true, filterable: true, orden: 4 },
    { field: 'responsable', header: 'Responsable', tipo: 'texto', visible: true, sortable: true, filterable: true, orden: 5 },
    { field: 'fechaActualizacion', header: 'Última Actualización', tipo: 'fecha', visible: false, sortable: true, filterable: true, orden: 6 },
  ],

  activos: [
    { field: 'id', header: 'ID', tipo: 'texto', visible: false, sortable: true, filterable: true, orden: 0 },
    { field: 'nombre', header: 'Nombre', tipo: 'texto', visible: true, sortable: true, filterable: true, orden: 1 },
    {
      field: 'tipo',
      header: 'Tipo',
      tipo: 'seleccion',
      visible: true,
      sortable: true,
      filterable: true,
      orden: 2,
      opciones: [
        { label: 'Hardware', value: 'hardware' },
        { label: 'Software', value: 'software' },
        { label: 'Datos', value: 'datos' },
        { label: 'Personas', value: 'personas' },
        { label: 'Instalaciones', value: 'instalaciones' },
      ],
    },
    {
      field: 'criticidad',
      header: 'Criticidad',
      tipo: 'seleccion',
      visible: true,
      sortable: true,
      filterable: true,
      orden: 3,
      opciones: [
        { label: 'Alta', value: 'alta' },
        { label: 'Media', value: 'media' },
        { label: 'Baja', value: 'baja' },
      ],
    },
    { field: 'descripcion', header: 'Descripción', tipo: 'texto', visible: true, sortable: true, filterable: true, orden: 4 },
    { field: 'propietario', header: 'Propietario', tipo: 'texto', visible: false, sortable: true, filterable: true, orden: 5 },
    { field: 'riesgosCount', header: 'Nº Riesgos', tipo: 'numero', visible: true, sortable: true, filterable: true, orden: 6 },
  ],

  alertas: [
    { field: 'id', header: 'ID', tipo: 'texto', visible: false, sortable: true, filterable: true, orden: 0 },
    { field: 'mensaje', header: 'Mensaje', tipo: 'texto', visible: true, sortable: true, filterable: true, orden: 1 },
    {
      field: 'tipo',
      header: 'Tipo',
      tipo: 'seleccion',
      visible: true,
      sortable: true,
      filterable: true,
      orden: 2,
      opciones: [
        { label: 'Riesgo', value: 'riesgo' },
        { label: 'Proceso', value: 'proceso' },
        { label: 'Cumplimiento', value: 'cumplimiento' },
        { label: 'Sistema', value: 'sistema' },
      ],
    },
    {
      field: 'severidad',
      header: 'Severidad',
      tipo: 'seleccion',
      visible: true,
      sortable: true,
      filterable: true,
      orden: 3,
      opciones: [
        { label: 'Crítica', value: 'critica' },
        { label: 'Alta', value: 'alta' },
        { label: 'Media', value: 'media' },
        { label: 'Baja', value: 'baja' },
      ],
    },
    { field: 'fecha', header: 'Fecha', tipo: 'fecha', visible: true, sortable: true, filterable: true, orden: 4 },
    { field: 'procesoNombre', header: 'Proceso', tipo: 'texto', visible: true, sortable: true, filterable: true, orden: 5 },
  ],

  'results-ml': [
    { field: 'id', header: 'ID', tipo: 'texto', visible: false, sortable: true, filterable: true, orden: 0 },
    { field: 'modelo', header: 'Modelo', tipo: 'texto', visible: true, sortable: true, filterable: true, orden: 1 },
    { field: 'prediccion', header: 'Predicción', tipo: 'texto', visible: true, sortable: true, filterable: true, orden: 2 },
    { field: 'confianza', header: 'Confianza', tipo: 'numero', visible: true, sortable: true, filterable: true, orden: 3 },
    { field: 'fecha', header: 'Fecha', tipo: 'fecha', visible: true, sortable: true, filterable: true, orden: 4 },
    {
      field: 'estado',
      header: 'Estado',
      tipo: 'seleccion',
      visible: true,
      sortable: true,
      filterable: true,
      orden: 5,
      opciones: [
        { label: 'Pendiente', value: 'pendiente' },
        { label: 'Revisado', value: 'revisado' },
        { label: 'Aplicado', value: 'aplicado' },
      ],
    },
  ],

  kpis: [
    { field: 'id', header: 'ID', tipo: 'texto', visible: false, sortable: true, filterable: true, orden: 0 },
    { field: 'nombre', header: 'Nombre', tipo: 'texto', visible: true, sortable: true, filterable: true, orden: 1 },
    { field: 'valor', header: 'Valor', tipo: 'numero', visible: true, sortable: true, filterable: true, orden: 2 },
    { field: 'meta', header: 'Meta', tipo: 'numero', visible: true, sortable: true, filterable: true, orden: 3 },
    { field: 'cumplimiento', header: 'Cumplimiento %', tipo: 'numero', visible: true, sortable: true, filterable: true, orden: 4 },
    {
      field: 'tendencia',
      header: 'Tendencia',
      tipo: 'seleccion',
      visible: true,
      sortable: true,
      filterable: true,
      orden: 5,
      opciones: [
        { label: 'Subiendo', value: 'up' },
        { label: 'Bajando', value: 'down' },
        { label: 'Estable', value: 'stable' },
      ],
    },
    { field: 'procesoNombre', header: 'Proceso', tipo: 'texto', visible: false, sortable: true, filterable: true, orden: 6 },
  ],

  objetivos: [
    { field: 'id', header: 'ID', tipo: 'texto', visible: false, sortable: true, filterable: true, orden: 0 },
    { field: 'nombre', header: 'Nombre', tipo: 'texto', visible: true, sortable: true, filterable: true, orden: 1 },
    { field: 'descripcion', header: 'Descripción', tipo: 'texto', visible: true, sortable: true, filterable: true, orden: 2 },
    { field: 'progreso', header: 'Progreso %', tipo: 'numero', visible: true, sortable: true, filterable: true, orden: 3 },
    {
      field: 'estado',
      header: 'Estado',
      tipo: 'seleccion',
      visible: true,
      sortable: true,
      filterable: true,
      orden: 4,
      opciones: [
        { label: 'En progreso', value: 'en_progreso' },
        { label: 'Completado', value: 'completado' },
        { label: 'Atrasado', value: 'atrasado' },
        { label: 'Cancelado', value: 'cancelado' },
      ],
    },
    { field: 'fechaLimite', header: 'Fecha Límite', tipo: 'fecha', visible: true, sortable: true, filterable: true, orden: 5 },
    { field: 'responsable', header: 'Responsable', tipo: 'texto', visible: false, sortable: true, filterable: true, orden: 6 },
  ],
};

// Helper para obtener columnas por fuente de datos
export function getColumnsForSource(source: string): ColumnaConfig[] {
  return TABLE_COLUMNS_BY_SOURCE[source] || [];
}

// Helper para obtener solo columnas visibles por defecto
export function getDefaultVisibleColumns(source: string): string[] {
  const columns = TABLE_COLUMNS_BY_SOURCE[source] || [];
  return columns.filter((col) => col.visible).map((col) => col.field);
}
