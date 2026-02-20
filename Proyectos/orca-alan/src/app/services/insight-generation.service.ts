// ============================================================================
// INSIGHT GENERATION SERVICE
// ============================================================================
// Orquesta la generación completa de contenido para el Insight Drawer.
// Delega a AnalisisInteligenteService para insights, resúmenes, acciones
// y comparativos. Usa GroqService para resúmenes ejecutivos mejorados.
// ============================================================================

import { Injectable, inject } from '@angular/core';
import {
  ResultadoAnalisis,
  ContenidoInsightDrawer,
  InsightIA,
  AccionSugerida,
  ComparativoBenchmark,
  FuenteDatos
} from '../models/analisis-inteligente.models';
import { AnalisisInteligenteService } from './analisis-inteligente.service';
import { GroqService } from './groq.service';

@Injectable({
  providedIn: 'root'
})
export class InsightGenerationService {
  private analisisService = inject(AnalisisInteligenteService);
  private groqService = inject(GroqService);

  // ==================== ORQUESTADOR PRINCIPAL ====================

  /**
   * Genera el contenido completo del Insight Drawer.
   * Orquesta la generación de insights, resumen ejecutivo,
   * comparativos y acciones sugeridas.
   *
   * @param resultado - Resultado del análisis actual
   * @param datos - Datos adicionales opcionales (fuentes, periodo)
   * @returns ContenidoInsightDrawer completo
   */
  async generarContenidoDrawer(
    resultado: ResultadoAnalisis,
    datos?: {
      fuentesSeleccionadas?: FuenteDatos[];
      periodoAnalisis?: string;
    }
  ): Promise<ContenidoInsightDrawer> {
    // Paso 1: Generar insights y resumen ejecutivo en paralelo
    const [insights, resumenEjecutivo, comparativos] = await Promise.all([
      this.generarInsights(resultado),
      this.generarResumenEjecutivo(resultado),
      Promise.resolve(this.generarComparativos(resultado))
    ]);

    // Paso 2: Generar acciones basadas en los insights encontrados
    const acciones = await this.generarAccionesSugeridas(insights, resultado);

    // Paso 3: Componer el contenido completo del drawer
    const contenido: ContenidoInsightDrawer = {
      resumenEjecutivo,
      hallazgos: insights,
      comparativos,
      acciones,
      fuentesAnalizadas: datos?.fuentesSeleccionadas?.map(f => f.nombre) || this.extraerFuentesDelResultado(resultado),
      periodoAnalisis: datos?.periodoAnalisis || this.extraerPeriodoDelResultado(resultado),
      fechaGeneracion: new Date()
    };

    return contenido;
  }

  // ==================== GENERACION DE INSIGHTS ====================

  /**
   * Genera hallazgos clave del análisis.
   * Delega a AnalisisInteligenteService.generarInsights que usa LLM si disponible,
   * o genera insights basados en patrones estadísticos como fallback.
   */
  private async generarInsights(resultado: ResultadoAnalisis): Promise<InsightIA[]> {
    try {
      return await this.analisisService.generarInsights(resultado);
    } catch (error) {
      console.warn('InsightGenerationService: Error al generar insights, usando fallback', error);
      return this.generarInsightsFallbackLocal(resultado);
    }
  }

  /**
   * Fallback local adicional en caso de que el servicio principal falle.
   */
  private generarInsightsFallbackLocal(resultado: ResultadoAnalisis): InsightIA[] {
    const entidad = resultado.interpretacion.entidadesDetectadas[0] || 'riesgos';
    return [{
      id: `insight-fallback-${Date.now()}`,
      titulo: `Análisis de ${entidad} completado`,
      descripcion: `Se completó el análisis ${resultado.tipoAnalisis} sobre ${entidad}. Revise los datos de la gráfica para identificar patrones relevantes.`,
      severidad: 'media',
      datoEstadistico: `${resultado.datosDescriptivos?.total || 0} registros analizados`,
      entidadRelacionada: entidad,
      accionado: false
    }];
  }

  // ==================== RESUMEN EJECUTIVO ====================

  /**
   * Genera un resumen ejecutivo del análisis.
   * Usa GroqService para generar un resumen enriquecido si está configurado,
   * o delega a AnalisisInteligenteService.generarResumenEjecutivo.
   */
  private async generarResumenEjecutivo(resultado: ResultadoAnalisis): Promise<string> {
    // Intentar resumen enriquecido con LLM directo si está configurado
    if (this.groqService.isConfigured) {
      try {
        return await this.generarResumenConGroq(resultado);
      } catch {
        // Fallback al servicio principal
      }
    }

    // Delegar al servicio de análisis inteligente
    return this.analisisService.generarResumenEjecutivo(resultado);
  }

  /**
   * Genera un resumen ejecutivo mejorado directamente con GroqService.
   * Incluye contexto adicional del resultado para un resumen más rico.
   */
  private async generarResumenConGroq(resultado: ResultadoAnalisis): Promise<string> {
    const datos = this.extraerDatosResumen(resultado);

    const template = `Genera un resumen ejecutivo conciso (2-3 párrafos) para un panel directivo sobre este análisis GRC:

Tipo de análisis: {{tipo}}
Entidades analizadas: {{entidades}}
Datos clave: {{datos}}
Período: {{periodo}}
Consulta original: {{consulta}}

El resumen debe:
- Ser profesional y orientado a la toma de decisiones
- Destacar los hallazgos más relevantes
- Incluir cifras concretas cuando estén disponibles
- Sugerir implicaciones estratégicas en 1 oración final`;

    return this.groqService.processWithTemplate(
      template,
      {
        tipo: resultado.tipoAnalisis,
        entidades: resultado.interpretacion.entidadesDetectadas.join(', '),
        datos,
        periodo: resultado.interpretacion.periodo?.etiqueta || 'No especificado',
        consulta: resultado.consulta
      },
      { temperature: 0.5, maxTokens: 512 }
    );
  }

  /**
   * Extrae un resumen de datos del resultado para incluir en el prompt.
   */
  private extraerDatosResumen(resultado: ResultadoAnalisis): string {
    if (resultado.datosDescriptivos) {
      const { labels, series, total, estadisticas } = resultado.datosDescriptivos;
      const topItems = labels
        .map((l, i) => `${l}: ${series[i]}`)
        .slice(0, 5)
        .join(', ');
      return `Total: ${total || 0}. Distribución: ${topItems}. Promedio: ${estadisticas?.promedio?.toFixed(1) || 'N/A'}, Max: ${estadisticas?.max || 'N/A'}, Min: ${estadisticas?.min || 'N/A'}`;
    }

    if (resultado.datosPredictivos) {
      const pred = resultado.datosPredictivos;
      return `Tendencia: ${pred.tendencia}. Horizonte: ${pred.horizonteMeses} meses. Confianza: ${pred.porcentajeConfianza}%. ${pred.resumenTexto}`;
    }

    if (resultado.datosCorrelacion) {
      const corr = resultado.datosCorrelacion;
      const mejorPar = corr.pares.reduce((a, b) =>
        Math.abs(a.coeficiente) > Math.abs(b.coeficiente) ? a : b
      );
      return `Variables: ${corr.variables.join(', ')}. Mejor correlación: ${mejorPar.variable1} vs ${mejorPar.variable2} (r=${mejorPar.coeficiente.toFixed(2)}, ${mejorPar.fuerza}). ${corr.interpretacionGeneral}`;
    }

    return 'Sin datos adicionales disponibles.';
  }

  // ==================== COMPARATIVOS BENCHMARK ====================

  /**
   * Genera comparativos MoM, QoQ y YoY.
   * Delega directamente a AnalisisInteligenteService.generarComparativos
   * que calcula los cambios con datos históricos disponibles.
   */
  private generarComparativos(resultado: ResultadoAnalisis): ComparativoBenchmark[] {
    return this.analisisService.generarComparativos(resultado);
  }

  // ==================== ACCIONES SUGERIDAS ====================

  /**
   * Genera acciones sugeridas basadas en los insights encontrados.
   * Delega a AnalisisInteligenteService.generarAccionesSugeridas
   * que usa LLM si está disponible o genera acciones basadas en reglas.
   */
  private async generarAccionesSugeridas(
    insights: InsightIA[],
    _resultado: ResultadoAnalisis
  ): Promise<AccionSugerida[]> {
    try {
      return await this.analisisService.generarAccionesSugeridas(insights);
    } catch (error) {
      console.warn('InsightGenerationService: Error al generar acciones, usando fallback', error);
      return this.generarAccionesFallbackLocal(insights);
    }
  }

  /**
   * Fallback local para generar acciones mínimas.
   */
  private generarAccionesFallbackLocal(insights: InsightIA[]): AccionSugerida[] {
    if (insights.length === 0) return [];

    return insights.slice(0, 2).map((insight, i) => ({
      id: `accion-fallback-${Date.now()}-${i}`,
      tipo: insight.severidad === 'critica' || insight.severidad === 'alta' ? 'riesgo' as const : 'control' as const,
      titulo: `Revisar: ${insight.titulo}`,
      descripcion: `Acción sugerida en base al hallazgo "${insight.titulo}". Revise y tome las medidas correspondientes.`,
      prioridad: insight.severidad === 'critica' ? 'alta' as const : 'media' as const,
      datosPreCargados: {
        nombre: insight.titulo,
        descripcion: insight.descripcion,
        origen: 'Insight Generation Service'
      },
      insightOrigenId: insight.id,
      ejecutada: false
    }));
  }

  // ==================== HELPERS ====================

  /**
   * Extrae nombres de fuentes de un resultado de análisis
   * cuando no se pasan fuentes explícitamente.
   */
  private extraerFuentesDelResultado(resultado: ResultadoAnalisis): string[] {
    return resultado.interpretacion.entidadesDetectadas.map(entidad => {
      const nombres: Record<string, string> = {
        riesgos: 'Registro de Riesgos',
        controles: 'Controles Implementados',
        incidentes: 'Incidentes de Seguridad',
        activos: 'Inventario de Activos',
        areas: 'Areas Organizativas',
        cumplimiento: 'Estado de Cumplimiento',
        procesos: 'Procesos de Negocio',
        objetivos: 'Objetivos Estratégicos'
      };
      return nombres[entidad] || entidad;
    });
  }

  /**
   * Extrae el periodo del análisis desde el resultado.
   */
  private extraerPeriodoDelResultado(resultado: ResultadoAnalisis): string {
    if (resultado.interpretacion.periodo) {
      return resultado.interpretacion.periodo.etiqueta;
    }
    return 'No especificado';
  }

  // ==================== REGENERACION ====================

  /**
   * Regenera solo los insights manteniendo el resto del contenido.
   * Util cuando el usuario quiere refrescar los hallazgos.
   */
  async regenerarInsights(
    contenidoActual: ContenidoInsightDrawer,
    resultado: ResultadoAnalisis
  ): Promise<ContenidoInsightDrawer> {
    const nuevosInsights = await this.generarInsights(resultado);
    const nuevasAcciones = await this.generarAccionesSugeridas(nuevosInsights, resultado);

    return {
      ...contenidoActual,
      hallazgos: nuevosInsights,
      acciones: nuevasAcciones,
      fechaGeneracion: new Date()
    };
  }

  /**
   * Regenera solo el resumen ejecutivo.
   */
  async regenerarResumen(
    contenidoActual: ContenidoInsightDrawer,
    resultado: ResultadoAnalisis
  ): Promise<ContenidoInsightDrawer> {
    const nuevoResumen = await this.generarResumenEjecutivo(resultado);

    return {
      ...contenidoActual,
      resumenEjecutivo: nuevoResumen,
      fechaGeneracion: new Date()
    };
  }
}
