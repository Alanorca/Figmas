// ============================================================================
// SERVICIO DE ACCIONES DE ANÁLISIS
// ============================================================================
// Orquesta la creación de entidades GRC desde acciones sugeridas por IA,
// pre-poblado de formularios, y registro de audit log.
// ============================================================================

import { Injectable, inject } from '@angular/core';
import {
  AccionSugerida,
  AuditLogEntry,
  TipoAccionEntidad
} from '../models/analisis-inteligente.models';
import { AnalisisInteligenteService } from './analisis-inteligente.service';

@Injectable({
  providedIn: 'root'
})
export class AccionAnalisisService {
  private analisisService = inject(AnalisisInteligenteService);

  // ==================== CREAR ENTIDAD ====================

  /**
   * Enruta la creación al servicio correspondiente según el tipo de acción.
   * Retorna el ID de la entidad creada.
   */
  async crearEntidad(accion: AccionSugerida, camposAdicionales: Record<string, any> = {}): Promise<string> {
    const datos = {
      ...accion.datosPreCargados,
      ...camposAdicionales,
      origenAnalisis: true,
      insightOrigenId: accion.insightOrigenId
    };

    // Simular creación según tipo (en producción, llamaría a api.service)
    const entidadId = await this.simularCreacionEntidad(accion.tipo, datos);

    // Marcar acción como ejecutada
    this.marcarAccionEjecutada(accion.id, entidadId);

    // Registrar en audit log
    this.registrarAuditLog({
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`,
      fecha: new Date(),
      accionId: accion.id,
      tipoEntidad: accion.tipo,
      entidadCreadaId: entidadId,
      usuario: 'usuario-actual',
      contextoAnalisis: `Acción sugerida: ${accion.titulo}`,
      detalles: datos
    });

    return entidadId;
  }

  // ==================== PRE-POBLAR FORMULARIO ====================

  /**
   * Genera valores pre-poblados para el formulario del wizard
   * basados en el contexto de la acción IA.
   */
  prepoblarFormulario(accion: AccionSugerida): Record<string, any> {
    const base: Record<string, any> = {
      nombre: accion.datosPreCargados['nombre'] || accion.titulo,
      descripcion: accion.datosPreCargados['descripcion'] || accion.descripcion,
      prioridad: accion.prioridad,
      origen: 'Análisis Inteligente',
      insightOrigenId: accion.insightOrigenId
    };

    // Campos específicos por tipo
    switch (accion.tipo) {
      case 'riesgo':
        return {
          ...base,
          probabilidad: accion.datosPreCargados['probabilidad'] || null,
          impacto: accion.datosPreCargados['impacto'] || null,
          area: accion.datosPreCargados['area'] || '',
          activosAfectados: accion.datosPreCargados['activosAfectados'] || ''
        };

      case 'incidente':
        return {
          ...base,
          severidad: accion.datosPreCargados['severidad'] || null,
          activosAfectados: accion.datosPreCargados['activosAfectados'] || '',
          reportador: accion.datosPreCargados['reportador'] || '',
          fechaDeteccion: accion.datosPreCargados['fechaDeteccion'] || new Date().toISOString().split('T')[0]
        };

      case 'control':
        return {
          ...base,
          tipoControl: accion.datosPreCargados['tipoControl'] || null,
          frecuencia: accion.datosPreCargados['frecuencia'] || null,
          responsable: accion.datosPreCargados['responsable'] || '',
          costoEstimado: accion.datosPreCargados['costoEstimado'] || null
        };

      case 'mitigacion':
        return {
          ...base,
          estrategia: accion.datosPreCargados['estrategia'] || null,
          responsable: accion.datosPreCargados['responsable'] || '',
          fechaLimite: accion.datosPreCargados['fechaLimite'] || '',
          riesgoVinculadoId: accion.datosPreCargados['riesgoVinculadoId'] || ''
        };

      case 'oportunidad':
        return {
          ...base,
          beneficioEsperado: accion.datosPreCargados['beneficioEsperado'] || '',
          areaImpacto: accion.datosPreCargados['areaImpacto'] || ''
        };

      case 'proyecto':
        return {
          ...base,
          responsable: accion.datosPreCargados['responsable'] || '',
          fechaLimite: accion.datosPreCargados['fechaLimite'] || '',
          tareas: accion.datosPreCargados['tareas'] || []
        };

      case 'activo':
        return {
          ...base,
          tipoActivo: accion.datosPreCargados['tipoActivo'] || '',
          criticidad: accion.datosPreCargados['criticidad'] || null,
          propietario: accion.datosPreCargados['propietario'] || ''
        };

      default:
        return base;
    }
  }

  // ==================== MARCAR ACCIÓN EJECUTADA ====================

  marcarAccionEjecutada(accionId: string, entidadCreadaId: string): void {
    this.analisisService.marcarAccionEjecutada(accionId, entidadCreadaId);
  }

  // ==================== AUDIT LOG ====================

  registrarAuditLog(entry: AuditLogEntry): void {
    this.analisisService.registrarAuditLog(entry);
  }

  obtenerAuditLog(): AuditLogEntry[] {
    return this.analisisService.obtenerAuditLog();
  }

  // ==================== SIMULACIÓN DE CREACIÓN ====================

  private async simularCreacionEntidad(tipo: TipoAccionEntidad, datos: Record<string, any>): Promise<string> {
    // Simular latencia de red
    await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));

    // Generar ID mock
    const prefijos: Record<TipoAccionEntidad, string> = {
      riesgo: 'RSK',
      incidente: 'INC',
      control: 'CTL',
      mitigacion: 'MIT',
      oportunidad: 'OPR',
      proyecto: 'PRJ',
      activo: 'ACT'
    };

    const prefijo = prefijos[tipo] || 'ENT';
    return `${prefijo}-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
  }
}
