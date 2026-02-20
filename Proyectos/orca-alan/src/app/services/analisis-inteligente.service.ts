// ============================================================================
// SERVICIO DE ANÁLISIS INTELIGENTE v2
// ============================================================================
// Procesa consultas NLP (keyword-based + LLM via Groq), genera análisis
// descriptivos, predictivos y correlación. Integración con IA para insights,
// acciones sugeridas y resúmenes ejecutivos.
// ============================================================================

import { Injectable, inject, signal, computed } from '@angular/core';
import {
  TipoAnalisis,
  EntidadAnalisis,
  TipoVisualizacion,
  HorizontePrediccion,
  InterpretacionConsulta,
  VisualizacionSugerida,
  ResultadoAnalisis,
  ConsultaHistorial,
  FiltroDetectado,
  ResultadoPredictivo,
  ResultadoCorrelacion,
  PuntoPrediccion,
  ParCorrelacion,
  ConfiguracionVisualizacion,
  VersionResultado,
  ATRIBUTOS_ENTIDADES,
  VISUALIZACIONES_POR_TIPO,
  // V2 types
  FuenteDatos,
  FiltroExtraccion,
  ResumenAlcance,
  InsightIA,
  AccionSugerida,
  RespuestaIA,
  ContenidoInsightDrawer,
  ComparativoBenchmark,
  EtapaProgreso,
  AuditLogEntry,
  SeveridadInsight,
  TipoAccionEntidad,
  FUENTES_DATOS_DISPONIBLES
} from '../models/analisis-inteligente.models';
import { GroqService } from './groq.service';

// Re-export types for easier imports
export type { InterpretacionConsulta } from '../models/analisis-inteligente.models';

@Injectable({
  providedIn: 'root'
})
export class AnalisisInteligenteService {
  private groqService = inject(GroqService);

  // Almacenamiento local
  private readonly HISTORIAL_KEY = 'analisis-inteligente-historial';
  private readonly AUDIT_LOG_KEY = 'analisis-inteligente-audit-log';
  private readonly ACCIONES_KEY = 'analisis-inteligente-acciones';

  // ==================== V2: SIGNALS DE ESTADO ====================

  readonly estadoProgreso = signal<EtapaProgreso | null>(null);
  readonly insightDrawerVisible = signal(false);
  readonly contenidoInsights = signal<ContenidoInsightDrawer | null>(null);
  readonly fuentesSeleccionadas = signal<FuenteDatos[]>([]);
  readonly filtrosActivos = signal<FiltroExtraccion | null>(null);

  readonly resumenAlcance = computed<ResumenAlcance | null>(() => {
    const fuentes = this.fuentesSeleccionadas();
    const filtros = this.filtrosActivos();
    if (fuentes.length === 0) return null;

    const totalRegistros = fuentes.reduce((sum, f) => sum + f.conteoRegistros, 0);
    let periodo = 'Todo el período';
    if (filtros?.rangoFechas) {
      const desde = filtros.rangoFechas.desde.toLocaleDateString('es');
      const hasta = filtros.rangoFechas.hasta.toLocaleDateString('es');
      periodo = `${desde} - ${hasta}`;
    }

    return {
      totalRegistros,
      fuentesSeleccionadas: fuentes.length,
      periodo,
      filtrosAplicados: filtros ? Object.keys(filtros.atributos) : [],
      entidades: fuentes.map(f => f.entidad)
    };
  });

  readonly usaIA = computed(() => this.groqService.isConfigured);

  // ==================== V2: PROMPT TEMPLATES (LLM) ====================

  private readonly PROMPT_INTERPRETAR = `Eres un analista de datos GRC (Gobierno, Riesgo y Cumplimiento). Analiza la siguiente consulta en lenguaje natural y devuelve un JSON con:
- entidades: array de entidades detectadas (riesgos, controles, incidentes, activos, areas, cumplimiento, procesos, objetivos)
- tipoAnalisis: "descriptivo", "predictivo" o "correlacion"
- filtros: array de {campo, operador, valor, etiqueta}
- agrupacion: string o null
- metrica: "conteo", "promedio" o "suma"
- confianza: número 0-100

Consulta: "{{consulta}}"

Responde SOLO con JSON válido, sin explicación.`;

  private readonly PROMPT_INSIGHTS = `Eres un analista senior GRC. Basándote en estos datos de análisis, genera 3-5 hallazgos clave en formato JSON:
[{
  "titulo": "título corto del hallazgo",
  "descripcion": "descripción en lenguaje ejecutivo (1-2 oraciones)",
  "severidad": "critica" | "alta" | "media" | "baja",
  "datoEstadistico": "dato numérico de respaldo (ej: 45% de incremento)"
}]

Datos: {{datos}}
Contexto: {{contexto}}

Responde SOLO con un array JSON válido.`;

  private readonly PROMPT_ACCIONES = `Basándote en estos hallazgos de un análisis GRC, sugiere acciones concretas en formato JSON:
[{
  "tipo": "riesgo" | "incidente" | "control" | "mitigacion" | "oportunidad" | "proyecto" | "activo",
  "titulo": "título de la acción",
  "descripcion": "descripción breve",
  "prioridad": "alta" | "media" | "baja",
  "datosPreCargados": { campos relevantes pre-poblados }
}]

Hallazgos: {{hallazgos}}

Genera máximo 4 acciones. Responde SOLO con un array JSON válido.`;

  private readonly PROMPT_RESUMEN = `Genera un resumen ejecutivo de 2-3 párrafos sobre este análisis GRC:
Tipo: {{tipo}}
Entidades: {{entidades}}
Datos clave: {{datos}}
Período: {{periodo}}

El resumen debe ser profesional, orientado a ejecutivos, y destacar los puntos más relevantes.`;

  // ==================== INTERPRETACIÓN NLP ====================

  async interpretarConsulta(texto: string): Promise<InterpretacionConsulta> {
    // Intentar con LLM si está configurado
    if (this.groqService.isConfigured) {
      try {
        return await this.interpretarConsultaConIA(texto);
      } catch {
        // Fallback a keywords si LLM falla
      }
    }

    return this.interpretarConsultaKeywords(texto);
  }

  // V2: Interpretación con LLM
  private async interpretarConsultaConIA(texto: string): Promise<InterpretacionConsulta> {
    this.estadoProgreso.set('analizando');

    const respuesta = await this.groqService.processWithTemplate(
      this.PROMPT_INTERPRETAR,
      { consulta: texto },
      { temperature: 0.3, maxTokens: 512, systemPrompt: 'Responde SOLO con JSON válido.' }
    );

    const parsed = JSON.parse(respuesta);

    return {
      consultaOriginal: texto,
      entidadesDetectadas: parsed.entidades || ['riesgos'],
      filtrosImplicitos: (parsed.filtros || []).map((f: any) => ({
        campo: f.campo,
        operador: f.operador || 'igual',
        valor: f.valor,
        etiqueta: f.etiqueta || `${f.campo}: ${f.valor}`
      })),
      tipoAnalisisSugerido: parsed.tipoAnalisis || 'descriptivo',
      periodo: undefined, // LLM no maneja fechas con precisión
      agrupacion: parsed.agrupacion,
      metrica: parsed.metrica,
      confianzaInterpretacion: Math.min(parsed.confianza || 85, 95),
      sugerenciasAlternativas: this.generarSugerenciasAlternativas(texto)
    };
  }

  // Fallback: Interpretación basada en keywords (v1 original)
  private async interpretarConsultaKeywords(texto: string): Promise<InterpretacionConsulta> {
    await this.delay(800 + Math.random() * 400);

    const textoLower = texto.toLowerCase();
    const entidadesDetectadas = this.detectarEntidades(textoLower);
    const filtrosImplicitos = this.detectarFiltros(textoLower);
    const tipoAnalisisSugerido = this.determinarTipoAnalisis(textoLower);
    const periodo = this.detectarPeriodo(textoLower);
    const agrupacion = this.detectarAgrupacion(textoLower);
    const metrica = this.detectarMetrica(textoLower);
    const confianzaInterpretacion = this.calcularConfianza(entidadesDetectadas, filtrosImplicitos, tipoAnalisisSugerido);

    return {
      consultaOriginal: texto,
      entidadesDetectadas,
      filtrosImplicitos,
      tipoAnalisisSugerido,
      periodo,
      agrupacion,
      metrica,
      confianzaInterpretacion,
      sugerenciasAlternativas: this.generarSugerenciasAlternativas(texto)
    };
  }

  // ==================== V2: GENERACIÓN DE INSIGHTS CON LLM ====================

  async generarInsights(resultado: ResultadoAnalisis): Promise<InsightIA[]> {
    if (!this.groqService.isConfigured) {
      return this.generarInsightsFallback(resultado);
    }

    try {
      const datos = JSON.stringify(
        resultado.datosDescriptivos || resultado.datosPredictivos || resultado.datosCorrelacion
      );
      const contexto = `Tipo: ${resultado.tipoAnalisis}, Entidades: ${resultado.interpretacion.entidadesDetectadas.join(', ')}`;

      const respuesta = await this.groqService.processWithTemplate(
        this.PROMPT_INSIGHTS,
        { datos, contexto },
        { temperature: 0.5, maxTokens: 1024 }
      );

      const parsed: any[] = JSON.parse(respuesta);
      return parsed.map((h, i) => ({
        id: `insight-${Date.now()}-${i}`,
        titulo: h.titulo,
        descripcion: h.descripcion,
        severidad: h.severidad as SeveridadInsight,
        datoEstadistico: h.datoEstadistico,
        entidadRelacionada: resultado.interpretacion.entidadesDetectadas[0],
        accionado: false
      }));
    } catch {
      return this.generarInsightsFallback(resultado);
    }
  }

  private generarInsightsFallback(resultado: ResultadoAnalisis): InsightIA[] {
    const insights: InsightIA[] = [];
    const entidad = resultado.interpretacion.entidadesDetectadas[0] || 'riesgos';

    if (resultado.datosDescriptivos) {
      const { labels, series, estadisticas } = resultado.datosDescriptivos;
      const maxIdx = series.indexOf(Math.max(...series));

      insights.push({
        id: `insight-${Date.now()}-0`,
        titulo: `Concentración en ${labels[maxIdx]}`,
        descripcion: `La categoría "${labels[maxIdx]}" concentra el mayor volumen con ${series[maxIdx]} registros, representando el ${Math.round(series[maxIdx] / (estadisticas?.promedio || 1) * 100 / labels.length)}% del total.`,
        severidad: 'alta',
        datoEstadistico: `${series[maxIdx]} registros`,
        entidadRelacionada: entidad,
        accionado: false
      });

      if (estadisticas) {
        insights.push({
          id: `insight-${Date.now()}-1`,
          titulo: 'Distribución desbalanceada',
          descripcion: `Existe una diferencia significativa entre el valor máximo (${estadisticas.max}) y mínimo (${estadisticas.min}), sugiriendo una distribución desbalanceada.`,
          severidad: 'media',
          datoEstadistico: `Rango: ${estadisticas.max - estadisticas.min}`,
          entidadRelacionada: entidad,
          accionado: false
        });
      }
    }

    if (resultado.datosPredictivos) {
      const { tendencia, porcentajeConfianza } = resultado.datosPredictivos;
      insights.push({
        id: `insight-${Date.now()}-0`,
        titulo: `Tendencia ${tendencia}`,
        descripcion: `Se proyecta una tendencia ${tendencia} con un ${porcentajeConfianza}% de confianza para los próximos ${resultado.datosPredictivos.horizonteMeses} meses.`,
        severidad: tendencia === 'ascendente' ? 'alta' : 'media',
        datoEstadistico: `${porcentajeConfianza}% confianza`,
        entidadRelacionada: entidad,
        accionado: false
      });
    }

    if (resultado.datosCorrelacion) {
      const mejorPar = resultado.datosCorrelacion.pares.reduce((a, b) =>
        Math.abs(a.coeficiente) > Math.abs(b.coeficiente) ? a : b
      );
      insights.push({
        id: `insight-${Date.now()}-0`,
        titulo: `Correlación ${mejorPar.fuerza} detectada`,
        descripcion: mejorPar.interpretacion,
        severidad: mejorPar.fuerza === 'fuerte' ? 'alta' : 'media',
        datoEstadistico: `r = ${mejorPar.coeficiente.toFixed(2)}`,
        entidadRelacionada: entidad,
        accionado: false
      });
    }

    return insights;
  }

  // ==================== V2: ACCIONES SUGERIDAS ====================

  async generarAccionesSugeridas(insights: InsightIA[]): Promise<AccionSugerida[]> {
    if (!this.groqService.isConfigured) {
      return this.generarAccionesFallback(insights);
    }

    try {
      const hallazgos = JSON.stringify(insights.map(i => ({
        titulo: i.titulo, descripcion: i.descripcion, severidad: i.severidad
      })));

      const respuesta = await this.groqService.processWithTemplate(
        this.PROMPT_ACCIONES,
        { hallazgos },
        { temperature: 0.5, maxTokens: 1024 }
      );

      const parsed: any[] = JSON.parse(respuesta);
      return parsed.slice(0, 4).map((a, i) => ({
        id: `accion-${Date.now()}-${i}`,
        tipo: a.tipo as TipoAccionEntidad,
        titulo: a.titulo,
        descripcion: a.descripcion,
        prioridad: a.prioridad || 'media',
        datosPreCargados: a.datosPreCargados || {},
        insightOrigenId: insights[Math.min(i, insights.length - 1)]?.id || '',
        ejecutada: false
      }));
    } catch {
      return this.generarAccionesFallback(insights);
    }
  }

  private generarAccionesFallback(insights: InsightIA[]): AccionSugerida[] {
    return insights.slice(0, 4).map((insight, i) => {
      const tipoMap: Record<SeveridadInsight, TipoAccionEntidad> = {
        critica: 'incidente',
        alta: 'riesgo',
        media: 'control',
        baja: 'oportunidad'
      };

      return {
        id: `accion-${Date.now()}-${i}`,
        tipo: tipoMap[insight.severidad],
        titulo: `Acción: ${insight.titulo}`,
        descripcion: `Basado en el hallazgo "${insight.titulo}", se recomienda crear un registro de ${tipoMap[insight.severidad]}.`,
        prioridad: insight.severidad === 'critica' || insight.severidad === 'alta' ? 'alta' : 'media',
        datosPreCargados: {
          nombre: insight.titulo,
          descripcion: insight.descripcion,
          origen: 'Análisis Inteligente'
        },
        insightOrigenId: insight.id,
        ejecutada: false
      };
    });
  }

  // ==================== V2: RESUMEN EJECUTIVO ====================

  async generarResumenEjecutivo(resultado: ResultadoAnalisis): Promise<string> {
    if (!this.groqService.isConfigured) {
      return this.generarResumenFallback(resultado);
    }

    try {
      const datos = JSON.stringify(
        resultado.datosDescriptivos || resultado.datosPredictivos || resultado.datosCorrelacion
      ).slice(0, 500);

      return await this.groqService.processWithTemplate(
        this.PROMPT_RESUMEN,
        {
          tipo: resultado.tipoAnalisis,
          entidades: resultado.interpretacion.entidadesDetectadas.join(', '),
          datos,
          periodo: resultado.interpretacion.periodo?.etiqueta || 'No especificado'
        },
        { temperature: 0.6, maxTokens: 512 }
      );
    } catch {
      return this.generarResumenFallback(resultado);
    }
  }

  private generarResumenFallback(resultado: ResultadoAnalisis): string {
    const entidades = resultado.interpretacion.entidadesDetectadas.join(', ');
    const tipo = resultado.tipoAnalisis;

    if (resultado.datosDescriptivos) {
      const { total, estadisticas } = resultado.datosDescriptivos;
      return `Análisis ${tipo} de ${entidades}: Se identificaron ${total} registros con un promedio de ${estadisticas?.promedio?.toFixed(1)} por categoría. El valor máximo (${estadisticas?.max}) y mínimo (${estadisticas?.min}) sugieren una distribución que requiere atención en las categorías con mayor concentración.`;
    }

    if (resultado.datosPredictivos) {
      return `Análisis predictivo de ${entidades}: La tendencia ${resultado.datosPredictivos.tendencia} proyectada para los próximos ${resultado.datosPredictivos.horizonteMeses} meses sugiere ${resultado.datosPredictivos.tendencia === 'ascendente' ? 'un incremento que requiere planificación preventiva' : 'una estabilización en los indicadores monitoreados'}. Nivel de confianza: ${resultado.datosPredictivos.porcentajeConfianza}%.`;
    }

    if (resultado.datosCorrelacion) {
      return `Análisis de correlación entre ${resultado.datosCorrelacion.variables.join(', ')}: ${resultado.datosCorrelacion.interpretacionGeneral}`;
    }

    return `Análisis ${tipo} completado para ${entidades}.`;
  }

  // ==================== V2: COMPARATIVOS BENCHMARK ====================

  generarComparativos(resultado: ResultadoAnalisis): ComparativoBenchmark[] {
    const comparativos: ComparativoBenchmark[] = [];

    if (resultado.datosDescriptivos) {
      const { series } = resultado.datosDescriptivos;
      const total = series.reduce((a, b) => a + b, 0);
      const mockAnterior = Math.round(total * (0.85 + Math.random() * 0.3));

      const cambioMoM = ((total - mockAnterior) / mockAnterior) * 100;
      comparativos.push({
        tipo: 'MoM',
        etiqueta: 'vs. mes anterior',
        valorAnterior: mockAnterior,
        valorActual: total,
        porcentajeCambio: Math.round(cambioMoM * 10) / 10,
        direccion: cambioMoM > 1 ? 'up' : cambioMoM < -1 ? 'down' : 'stable'
      });

      const mockTrimAnterior = Math.round(total * (0.75 + Math.random() * 0.5));
      const cambioQoQ = ((total - mockTrimAnterior) / mockTrimAnterior) * 100;
      comparativos.push({
        tipo: 'QoQ',
        etiqueta: 'vs. trimestre anterior',
        valorAnterior: mockTrimAnterior,
        valorActual: total,
        porcentajeCambio: Math.round(cambioQoQ * 10) / 10,
        direccion: cambioQoQ > 1 ? 'up' : cambioQoQ < -1 ? 'down' : 'stable'
      });

      const mockAnioAnterior = Math.round(total * (0.6 + Math.random() * 0.8));
      const cambioYoY = ((total - mockAnioAnterior) / mockAnioAnterior) * 100;
      comparativos.push({
        tipo: 'YoY',
        etiqueta: 'vs. año anterior',
        valorAnterior: mockAnioAnterior,
        valorActual: total,
        porcentajeCambio: Math.round(cambioYoY * 10) / 10,
        direccion: cambioYoY > 1 ? 'up' : cambioYoY < -1 ? 'down' : 'stable'
      });
    }

    return comparativos;
  }

  // ==================== V2: FUENTES DE DATOS ====================

  obtenerFuentesDisponibles(): FuenteDatos[] {
    return FUENTES_DATOS_DISPONIBLES;
  }

  obtenerFuentesPorCategoria(): Record<string, FuenteDatos[]> {
    const fuentes = this.obtenerFuentesDisponibles();
    return fuentes.reduce((acc, f) => {
      if (!acc[f.categoria]) acc[f.categoria] = [];
      acc[f.categoria].push(f);
      return acc;
    }, {} as Record<string, FuenteDatos[]>);
  }

  // ==================== V2: AUDIT LOG ====================

  registrarAuditLog(entry: AuditLogEntry): void {
    try {
      const log = this.obtenerAuditLog();
      log.unshift(entry);
      localStorage.setItem(this.AUDIT_LOG_KEY, JSON.stringify(log.slice(0, 100)));
    } catch {
      // Ignorar errores de localStorage
    }
  }

  obtenerAuditLog(): AuditLogEntry[] {
    try {
      const stored = localStorage.getItem(this.AUDIT_LOG_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // ==================== V2: PERSISTENCIA DE ACCIONES ====================

  guardarAccionesEjecutadas(acciones: AccionSugerida[]): void {
    try {
      localStorage.setItem(this.ACCIONES_KEY, JSON.stringify(acciones));
    } catch {
      // Ignorar errores de localStorage
    }
  }

  obtenerAccionesEjecutadas(): AccionSugerida[] {
    try {
      const stored = localStorage.getItem(this.ACCIONES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  marcarAccionEjecutada(accionId: string, entidadCreadaId: string): void {
    const acciones = this.obtenerAccionesEjecutadas();
    const accion = acciones.find(a => a.id === accionId);
    if (accion) {
      accion.ejecutada = true;
      accion.entidadCreadaId = entidadCreadaId;
      this.guardarAccionesEjecutadas(acciones);
    }
  }

  // ==================== DETECCIÓN NLP (keywords - v1 fallback) ====================

  private detectarEntidades(texto: string): EntidadAnalisis[] {
    const entidades: EntidadAnalisis[] = [];
    const patrones: Record<EntidadAnalisis, string[]> = {
      riesgos: ['riesgo', 'riesgos', 'amenaza', 'amenazas', 'vulnerabilidad'],
      controles: ['control', 'controles', 'medida', 'medidas', 'salvaguarda'],
      incidentes: ['incidente', 'incidentes', 'evento', 'eventos', 'brecha'],
      activos: ['activo', 'activos', 'recurso', 'recursos', 'sistema'],
      areas: ['área', 'áreas', 'area', 'areas', 'departamento', 'unidad'],
      cumplimiento: ['cumplimiento', 'regulación', 'normativa', 'compliance'],
      procesos: ['proceso', 'procesos', 'procedimiento', 'workflow'],
      objetivos: ['objetivo', 'objetivos', 'meta', 'metas', 'kpi', 'kpis']
    };

    for (const [entidad, palabras] of Object.entries(patrones)) {
      if (palabras.some(p => texto.includes(p))) {
        entidades.push(entidad as EntidadAnalisis);
      }
    }

    if (entidades.length === 0) {
      entidades.push('riesgos');
    }

    return entidades;
  }

  private detectarFiltros(texto: string): FiltroDetectado[] {
    const filtros: FiltroDetectado[] = [];

    const severidades = ['crítico', 'critico', 'alto', 'alta', 'medio', 'media', 'bajo', 'baja'];
    for (const sev of severidades) {
      if (texto.includes(sev)) {
        filtros.push({
          campo: 'severidad',
          operador: 'igual',
          valor: sev.replace('a', 'o'),
          etiqueta: `Severidad: ${sev}`
        });
        break;
      }
    }

    const estados = ['abierto', 'cerrado', 'pendiente', 'resuelto', 'en proceso', 'activo'];
    for (const estado of estados) {
      if (texto.includes(estado)) {
        filtros.push({
          campo: 'estado',
          operador: 'igual',
          valor: estado,
          etiqueta: `Estado: ${estado}`
        });
        break;
      }
    }

    if (texto.includes('último mes') || texto.includes('ultimo mes')) {
      filtros.push({
        campo: 'fecha', operador: 'entre',
        valor: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        valorHasta: new Date(), etiqueta: 'Último mes'
      });
    } else if (texto.includes('último trimestre') || texto.includes('ultimo trimestre')) {
      filtros.push({
        campo: 'fecha', operador: 'entre',
        valor: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        valorHasta: new Date(), etiqueta: 'Último trimestre'
      });
    } else if (texto.includes('este año')) {
      filtros.push({
        campo: 'fecha', operador: 'entre',
        valor: new Date(new Date().getFullYear(), 0, 1),
        valorHasta: new Date(), etiqueta: 'Este año'
      });
    }

    return filtros;
  }

  private determinarTipoAnalisis(texto: string): TipoAnalisis {
    const palabrasPredictivo = [
      'tendencia', 'proyección', 'proyeccion', 'predicción', 'prediccion',
      'próximos', 'proximos', 'futuro', 'será', 'sera', 'prever', 'anticipar'
    ];
    const palabrasCorrelacion = [
      'relación', 'relacion', 'correlación', 'correlacion', 'impacto',
      'afecta', 'influye', 'versus', 'vs', 'entre', 'comparar', 'relacionar'
    ];

    if (palabrasPredictivo.some(p => texto.includes(p))) return 'predictivo';
    if (palabrasCorrelacion.some(p => texto.includes(p))) return 'correlacion';
    return 'descriptivo';
  }

  private detectarPeriodo(texto: string): { desde: Date; hasta: Date; etiqueta: string } | undefined {
    const ahora = new Date();

    if (texto.includes('hoy')) {
      const inicio = new Date(ahora); inicio.setHours(0, 0, 0, 0);
      return { desde: inicio, hasta: ahora, etiqueta: 'Hoy' };
    }
    if (texto.includes('última semana') || texto.includes('ultima semana') || texto.includes('7 días')) {
      return { desde: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), hasta: ahora, etiqueta: 'Última semana' };
    }
    if (texto.includes('último mes') || texto.includes('ultimo mes') || texto.includes('30 días')) {
      return { desde: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), hasta: ahora, etiqueta: 'Último mes' };
    }
    if (texto.includes('último trimestre') || texto.includes('ultimo trimestre') || texto.includes('3 meses')) {
      return { desde: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), hasta: ahora, etiqueta: 'Último trimestre' };
    }
    if (texto.includes('6 meses')) {
      return { desde: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), hasta: ahora, etiqueta: 'Últimos 6 meses' };
    }
    if (texto.includes('este año') || texto.includes('12 meses')) {
      return { desde: new Date(ahora.getFullYear(), 0, 1), hasta: ahora, etiqueta: 'Este año' };
    }
    return undefined;
  }

  private detectarAgrupacion(texto: string): string | undefined {
    if (texto.includes('por área') || texto.includes('por area')) return 'area';
    if (texto.includes('por estado')) return 'estado';
    if (texto.includes('por severidad') || texto.includes('por criticidad')) return 'severidad';
    if (texto.includes('por mes')) return 'mes';
    if (texto.includes('por semana')) return 'semana';
    if (texto.includes('por tipo')) return 'tipo';
    if (texto.includes('por responsable')) return 'responsable';
    return undefined;
  }

  private detectarMetrica(texto: string): string | undefined {
    if (texto.includes('cuántos') || texto.includes('cuantos') || texto.includes('cantidad')) return 'conteo';
    if (texto.includes('promedio') || texto.includes('media')) return 'promedio';
    if (texto.includes('suma') || texto.includes('total')) return 'suma';
    if (texto.includes('distribución') || texto.includes('distribucion')) return 'conteo';
    return 'conteo';
  }

  private calcularConfianza(entidades: EntidadAnalisis[], filtros: FiltroDetectado[], tipo: TipoAnalisis): number {
    let confianza = 50;
    confianza += entidades.length * 10;
    confianza += filtros.length * 8;
    if (tipo === 'descriptivo') confianza += 5;
    return Math.min(confianza, 95);
  }

  private generarSugerenciasAlternativas(texto: string): string[] {
    const sugerencias: string[] = [];
    if (texto.includes('riesgo')) {
      sugerencias.push('Distribución de riesgos por severidad');
      sugerencias.push('Tendencia de riesgos identificados por mes');
    }
    if (texto.includes('incidente')) {
      sugerencias.push('Top 10 áreas con más incidentes');
      sugerencias.push('Tiempo promedio de resolución de incidentes');
    }
    return sugerencias.slice(0, 3);
  }

  // ==================== SUGERENCIA DE VISUALIZACIONES ====================

  sugerirVisualizaciones(tipo: TipoAnalisis, entidades: EntidadAnalisis[]): VisualizacionSugerida[] {
    const tipos = VISUALIZACIONES_POR_TIPO[tipo];
    const sugerencias: VisualizacionSugerida[] = [];

    const nombres: Record<TipoVisualizacion, string> = {
      bar: 'Barras', line: 'Líneas', pie: 'Circular', donut: 'Dona',
      area: 'Área', scatter: 'Dispersión', heatmap: 'Mapa de Calor',
      radar: 'Radar', funnel: 'Embudo', treemap: 'Treemap',
      table: 'Tabla', sankey: 'Sankey', gauge: 'Indicador'
    };

    const descripciones: Record<TipoVisualizacion, string> = {
      bar: 'Comparar cantidades entre categorías',
      line: 'Mostrar tendencias a lo largo del tiempo',
      pie: 'Mostrar proporciones del total',
      donut: 'Proporciones con énfasis visual',
      area: 'Tendencias con volumen acumulado',
      scatter: 'Relación entre dos variables',
      heatmap: 'Matriz de correlaciones',
      radar: 'Comparar múltiples dimensiones',
      funnel: 'Etapas de un proceso',
      treemap: 'Jerarquía y proporciones',
      table: 'Datos detallados',
      sankey: 'Flujo entre categorías',
      gauge: 'Indicador de progreso/nivel'
    };

    tipos.forEach((tipoVis, index) => {
      sugerencias.push({
        tipo: tipoVis,
        nombre: nombres[tipoVis],
        icono: this.getVisualizacionIcono(tipoVis),
        descripcion: descripciones[tipoVis],
        recomendado: index === 0
      });
    });

    return sugerencias;
  }

  private getVisualizacionIcono(tipo: TipoVisualizacion): string {
    const iconos: Record<TipoVisualizacion, string> = {
      bar: 'pi-chart-bar', line: 'pi-chart-line', pie: 'pi-chart-pie',
      donut: 'pi-circle', area: 'pi-chart-line', scatter: 'pi-share-alt',
      heatmap: 'pi-table', radar: 'pi-slack', funnel: 'pi-filter',
      treemap: 'pi-th-large', table: 'pi-table',
      sankey: 'pi-arrows-h', gauge: 'pi-gauge'
    };
    return iconos[tipo] || 'pi-chart-bar';
  }

  // ==================== GENERACIÓN DE ANÁLISIS ====================

  async generarAnalisis(
    interpretacion: InterpretacionConsulta,
    tipo: TipoAnalisis,
    visualizacion: TipoVisualizacion,
    opciones: {
      horizontePrediccion?: HorizontePrediccion;
      mostrarIntervaloConfianza?: boolean;
      variablesCorrelacion?: string[];
    }
  ): Promise<ResultadoAnalisis> {
    this.estadoProgreso.set('extrayendo');
    await this.delay(400);
    this.estadoProgreso.set('transformando');
    await this.delay(400);
    this.estadoProgreso.set('analizando');
    await this.delay(400 + Math.random() * 400);
    this.estadoProgreso.set('generando');

    const id = `resultado-${Date.now()}`;
    const titulo = this.generarTitulo(interpretacion, tipo);

    const configuracionVisualizacion: ConfiguracionVisualizacion = {
      tipo: visualizacion,
      titulo,
      paleta: 'corporativa',
      mostrarLeyenda: true,
      posicionLeyenda: 'bottom',
      mostrarDataLabels: true,
      mostrarGrid: true,
      animaciones: true
    };

    const resultado: ResultadoAnalisis = {
      id,
      consulta: interpretacion.consultaOriginal,
      interpretacion,
      tipoAnalisis: tipo,
      configuracionVisualizacion,
      fechaGeneracion: new Date(),
      tiempoProcesamientoMs: Math.floor(Math.random() * 2000) + 500,
      versiones: [],
      versionActual: 1
    };

    switch (tipo) {
      case 'descriptivo':
        resultado.datosDescriptivos = this.generarDatosDescriptivos(interpretacion);
        break;
      case 'predictivo':
        resultado.datosPredictivos = this.generarDatosPredictivos(
          interpretacion, opciones.horizontePrediccion || 6, opciones.mostrarIntervaloConfianza !== false
        );
        break;
      case 'correlacion':
        resultado.datosCorrelacion = this.generarDatosCorrelacion(interpretacion, opciones.variablesCorrelacion);
        break;
    }

    resultado.versiones.push({
      id: `v1-${id}`, numero: 1, fecha: new Date(),
      configuracion: configuracionVisualizacion,
      datos: resultado.datosDescriptivos || resultado.datosPredictivos || resultado.datosCorrelacion
    });

    this.estadoProgreso.set(null);
    return resultado;
  }

  private generarTitulo(interpretacion: InterpretacionConsulta, tipo: TipoAnalisis): string {
    const entidad = interpretacion.entidadesDetectadas[0];
    const nombres: Record<EntidadAnalisis, string> = {
      riesgos: 'Riesgos', controles: 'Controles', incidentes: 'Incidentes',
      activos: 'Activos', areas: 'Áreas', cumplimiento: 'Cumplimiento',
      procesos: 'Procesos', objetivos: 'Objetivos'
    };
    const tipoTitulo = tipo === 'predictivo' ? 'Tendencia de' :
                       tipo === 'correlacion' ? 'Correlación de' : 'Distribución de';
    return `${tipoTitulo} ${nombres[entidad]}`;
  }

  private generarDatosDescriptivos(interpretacion: InterpretacionConsulta): {
    labels: string[]; series: number[]; total?: number;
    estadisticas?: { min: number; max: number; promedio: number; mediana: number };
  } {
    const agrupacion = interpretacion.agrupacion || 'estado';
    let labels: string[];
    let series: number[];

    switch (agrupacion) {
      case 'estado':
        labels = ['Abierto', 'En Proceso', 'Resuelto', 'Cerrado'];
        series = [25, 40, 20, 15];
        break;
      case 'severidad':
        labels = ['Crítico', 'Alto', 'Medio', 'Bajo'];
        series = [8, 22, 35, 35];
        break;
      case 'area':
        labels = ['TI', 'Finanzas', 'Operaciones', 'Legal', 'RRHH'];
        series = [30, 20, 25, 15, 10];
        break;
      case 'mes':
        labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
        series = [12, 19, 15, 22, 18, 25];
        break;
      default:
        labels = ['Categoría 1', 'Categoría 2', 'Categoría 3', 'Categoría 4'];
        series = [30, 25, 25, 20];
    }

    const total = series.reduce((a, b) => a + b, 0);
    return {
      labels, series, total,
      estadisticas: {
        min: Math.min(...series), max: Math.max(...series),
        promedio: total / series.length,
        mediana: [...series].sort((a, b) => a - b)[Math.floor(series.length / 2)]
      }
    };
  }

  private generarDatosPredictivos(
    interpretacion: InterpretacionConsulta, horizonte: HorizontePrediccion, conIntervalo: boolean
  ): ResultadoPredictivo {
    const ahora = new Date();
    const datosHistoricos: PuntoPrediccion[] = [];
    const datosPrediccion: PuntoPrediccion[] = [];

    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(ahora); fecha.setMonth(fecha.getMonth() - i);
      datosHistoricos.push({ fecha, valor: Math.floor(Math.random() * 30) + 20, esPrediccion: false });
    }

    const ultimosValores = datosHistoricos.slice(-3).map(d => d.valor);
    const tendenciaBase = ultimosValores.reduce((a, b) => a + b, 0) / ultimosValores.length;
    const esCreciente = datosHistoricos[5].valor > datosHistoricos[0].valor;

    for (let i = 1; i <= horizonte; i++) {
      const fecha = new Date(ahora); fecha.setMonth(fecha.getMonth() + i);
      const variacion = (Math.random() - 0.4) * 10;
      const tendencia = esCreciente ? 2 : -1;
      const valor = Math.max(5, Math.floor(tendenciaBase + (tendencia * i) + variacion));
      const punto: PuntoPrediccion = { fecha, valor, esPrediccion: true };
      if (conIntervalo) {
        const margen = Math.floor(valor * 0.15);
        punto.intervaloConfianza = { min: valor - margen, max: valor + margen };
      }
      datosPrediccion.push(punto);
    }

    const porcentajeConfianza = 75 + Math.floor(Math.random() * 20);
    return {
      datosHistoricos, datosPrediccion, horizonteMeses: horizonte,
      nivelConfianza: porcentajeConfianza >= 80 ? 'alta' : porcentajeConfianza >= 60 ? 'media' : 'baja',
      porcentajeConfianza,
      tendencia: esCreciente ? 'ascendente' : datosHistoricos[5].valor < datosHistoricos[0].valor ? 'descendente' : 'estable',
      resumenTexto: `Se proyecta una tendencia ${esCreciente ? 'ascendente' : 'descendente'} para los próximos ${horizonte} meses, basado en el análisis de datos históricos.`,
      disclaimer: 'Las predicciones son estimaciones basadas en datos históricos y pueden variar según factores externos.'
    };
  }

  private generarDatosCorrelacion(interpretacion: InterpretacionConsulta, variablesPersonalizadas?: string[]): ResultadoCorrelacion {
    const variables = variablesPersonalizadas?.length ? variablesPersonalizadas : ['Controles', 'Incidentes', 'Riesgos'];
    const n = variables.length;
    const matriz: number[][] = [];

    for (let i = 0; i < n; i++) {
      matriz[i] = [];
      for (let j = 0; j < n; j++) {
        if (i === j) matriz[i][j] = 1;
        else if (j < i) matriz[i][j] = matriz[j][i];
        else matriz[i][j] = Math.round((Math.random() * 1.6 - 0.8) * 100) / 100;
      }
    }

    const pares: ParCorrelacion[] = [];
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const coef = matriz[i][j];
        const abs = Math.abs(coef);
        pares.push({
          variable1: variables[i], variable2: variables[j], coeficiente: coef,
          fuerza: abs >= 0.7 ? 'fuerte' : abs >= 0.4 ? 'moderada' : 'debil',
          direccion: coef >= 0 ? 'positiva' : 'negativa',
          interpretacion: this.generarInterpretacionCorrelacion(variables[i], variables[j], coef)
        });
      }
    }

    const mejorPar = pares.reduce((a, b) => Math.abs(a.coeficiente) > Math.abs(b.coeficiente) ? a : b);
    const puntosMejorCorrelacion = this.generarPuntosScatter(mejorPar.coeficiente, 20);

    return {
      variables, matriz, pares, puntosMejorCorrelacion,
      lineaTendencia: { pendiente: mejorPar.coeficiente, intercepto: 10, r2: Math.abs(mejorPar.coeficiente) ** 2 },
      interpretacionGeneral: this.generarInterpretacionGeneral(pares)
    };
  }

  private generarInterpretacionCorrelacion(var1: string, var2: string, coef: number): string {
    const fuerza = Math.abs(coef) >= 0.7 ? 'fuerte' : Math.abs(coef) >= 0.4 ? 'moderada' : 'débil';
    if (coef < 0) return `A mayor ${var1.toLowerCase()}, menor ${var2.toLowerCase()} (relación ${fuerza}).`;
    return `A mayor ${var1.toLowerCase()}, mayor ${var2.toLowerCase()} (relación ${fuerza}).`;
  }

  private generarInterpretacionGeneral(pares: ParCorrelacion[]): string {
    const fuerte = pares.find(p => p.fuerza === 'fuerte');
    if (fuerte) return `Se detectó una correlación ${fuerte.fuerza} ${fuerte.direccion} entre ${fuerte.variable1} y ${fuerte.variable2}. ${fuerte.interpretacion}`;
    const moderada = pares.find(p => p.fuerza === 'moderada');
    if (moderada) return `Se encontró una correlación ${moderada.fuerza} entre algunas variables. ${moderada.interpretacion}`;
    return 'No se encontraron correlaciones significativas entre las variables analizadas.';
  }

  private generarPuntosScatter(correlacion: number, cantidad: number): { x: number; y: number }[] {
    const puntos: { x: number; y: number }[] = [];
    for (let i = 0; i < cantidad; i++) {
      const x = Math.random() * 100;
      const ruido = (Math.random() - 0.5) * (1 - Math.abs(correlacion)) * 50;
      const y = x * correlacion + 50 + ruido;
      puntos.push({ x: Math.round(x), y: Math.round(Math.max(0, Math.min(100, y))) });
    }
    return puntos;
  }

  // ==================== REFINAMIENTO ====================

  async refinarAnalisis(resultadoActual: ResultadoAnalisis, feedback: string): Promise<ResultadoAnalisis> {
    await this.delay(1000);
    const nuevoResultado = { ...resultadoActual };
    nuevoResultado.versionActual = resultadoActual.versionActual + 1;
    const feedbackLower = feedback.toLowerCase();

    if (nuevoResultado.datosDescriptivos) {
      if (feedbackLower.includes('agregar') || feedbackLower.includes('incluir')) {
        nuevoResultado.datosDescriptivos.labels.push('Nueva categoría');
        nuevoResultado.datosDescriptivos.series.push(Math.floor(Math.random() * 20) + 5);
      }
      if (feedbackLower.includes('quitar') || feedbackLower.includes('eliminar')) {
        if (nuevoResultado.datosDescriptivos.labels.length > 2) {
          nuevoResultado.datosDescriptivos.labels.pop();
          nuevoResultado.datosDescriptivos.series.pop();
        }
      }
    }

    nuevoResultado.versiones = [
      ...resultadoActual.versiones,
      {
        id: `v${nuevoResultado.versionActual}-${resultadoActual.id}`,
        numero: nuevoResultado.versionActual, fecha: new Date(), feedback,
        configuracion: nuevoResultado.configuracionVisualizacion,
        datos: nuevoResultado.datosDescriptivos || nuevoResultado.datosPredictivos || nuevoResultado.datosCorrelacion
      }
    ];
    if (nuevoResultado.versiones.length > 5) {
      nuevoResultado.versiones = nuevoResultado.versiones.slice(-5);
    }
    return nuevoResultado;
  }

  // ==================== HISTORIAL ====================

  obtenerHistorial(): ConsultaHistorial[] {
    try {
      const stored = localStorage.getItem(this.HISTORIAL_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  }

  guardarHistorial(historial: ConsultaHistorial[]): void {
    try {
      localStorage.setItem(this.HISTORIAL_KEY, JSON.stringify(historial.slice(0, 20)));
    } catch { /* ignore */ }
  }

  // ==================== EXPORTACIÓN ====================

  exportarDatos(resultado: ResultadoAnalisis, formato: 'csv' | 'excel'): void {
    let contenido = '';

    if (resultado.datosDescriptivos) {
      const { labels, series } = resultado.datosDescriptivos;
      contenido = 'Categoría,Valor\n' + labels.map((l, i) => `${l},${series[i]}`).join('\n');
    } else if (resultado.datosPredictivos) {
      const todos = [...resultado.datosPredictivos.datosHistoricos, ...resultado.datosPredictivos.datosPrediccion];
      contenido = 'Fecha,Valor,Es Predicción\n' + todos.map(p =>
        `${new Date(p.fecha).toLocaleDateString()},${p.valor},${p.esPrediccion ? 'Sí' : 'No'}`
      ).join('\n');
    } else if (resultado.datosCorrelacion) {
      contenido = 'Variable 1,Variable 2,Coeficiente\n' + resultado.datosCorrelacion.pares.map(p =>
        `${p.variable1},${p.variable2},${p.coeficiente}`
      ).join('\n');
    }

    const blob = new Blob([contenido], { type: formato === 'csv' ? 'text/csv' : 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analisis-${resultado.id}.${formato === 'csv' ? 'csv' : 'xls'}`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // ==================== HELPERS ====================

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
