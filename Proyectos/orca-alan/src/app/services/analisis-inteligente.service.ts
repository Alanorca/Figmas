// ============================================================================
// SERVICIO DE ANÁLISIS INTELIGENTE
// ============================================================================
// Procesa consultas NLP, genera análisis descriptivos, predictivos y correlación
// Simula capacidades de ML para demostración
// ============================================================================

import { Injectable } from '@angular/core';
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
  VISUALIZACIONES_POR_TIPO
} from '../models/analisis-inteligente.models';

// Re-export types for easier imports
export type { InterpretacionConsulta } from '../models/analisis-inteligente.models';

@Injectable({
  providedIn: 'root'
})
export class AnalisisInteligenteService {
  // Almacenamiento local
  private readonly HISTORIAL_KEY = 'analisis-inteligente-historial';

  // ==================== INTERPRETACIÓN NLP ====================

  async interpretarConsulta(texto: string): Promise<InterpretacionConsulta> {
    // Simular delay de procesamiento
    await this.delay(800 + Math.random() * 400);

    const textoLower = texto.toLowerCase();

    // Detectar entidades mencionadas
    const entidadesDetectadas = this.detectarEntidades(textoLower);

    // Detectar filtros implícitos
    const filtrosImplicitos = this.detectarFiltros(textoLower);

    // Determinar tipo de análisis
    const tipoAnalisisSugerido = this.determinarTipoAnalisis(textoLower);

    // Detectar período temporal
    const periodo = this.detectarPeriodo(textoLower);

    // Detectar agrupación y métrica
    const agrupacion = this.detectarAgrupacion(textoLower);
    const metrica = this.detectarMetrica(textoLower);

    // Calcular confianza de interpretación
    const confianzaInterpretacion = this.calcularConfianza(
      entidadesDetectadas,
      filtrosImplicitos,
      tipoAnalisisSugerido
    );

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

    // Si no se detecta ninguna, usar riesgos por defecto
    if (entidades.length === 0) {
      entidades.push('riesgos');
    }

    return entidades;
  }

  private detectarFiltros(texto: string): FiltroDetectado[] {
    const filtros: FiltroDetectado[] = [];

    // Detectar severidad/criticidad
    const severidades = ['crítico', 'critico', 'alto', 'alta', 'medio', 'media', 'bajo', 'baja'];
    for (const sev of severidades) {
      if (texto.includes(sev)) {
        filtros.push({
          campo: 'severidad',
          operador: 'igual',
          valor: sev.replace('a', 'o'), // normalizar
          etiqueta: `Severidad: ${sev}`
        });
        break;
      }
    }

    // Detectar estado
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

    // Detectar período
    if (texto.includes('último mes') || texto.includes('ultimo mes')) {
      filtros.push({
        campo: 'fecha',
        operador: 'entre',
        valor: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        valorHasta: new Date(),
        etiqueta: 'Último mes'
      });
    } else if (texto.includes('último trimestre') || texto.includes('ultimo trimestre')) {
      filtros.push({
        campo: 'fecha',
        operador: 'entre',
        valor: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        valorHasta: new Date(),
        etiqueta: 'Último trimestre'
      });
    } else if (texto.includes('este año')) {
      filtros.push({
        campo: 'fecha',
        operador: 'entre',
        valor: new Date(new Date().getFullYear(), 0, 1),
        valorHasta: new Date(),
        etiqueta: 'Este año'
      });
    }

    return filtros;
  }

  private determinarTipoAnalisis(texto: string): TipoAnalisis {
    // Palabras clave para predictivo
    const palabrasPredictivo = [
      'tendencia', 'proyección', 'proyeccion', 'predicción', 'prediccion',
      'próximos', 'proximos', 'futuro', 'será', 'sera', 'prever', 'anticipar'
    ];

    // Palabras clave para correlación
    const palabrasCorrelacion = [
      'relación', 'relacion', 'correlación', 'correlacion', 'impacto',
      'afecta', 'influye', 'versus', 'vs', 'entre', 'comparar', 'relacionar'
    ];

    if (palabrasPredictivo.some(p => texto.includes(p))) {
      return 'predictivo';
    }

    if (palabrasCorrelacion.some(p => texto.includes(p))) {
      return 'correlacion';
    }

    return 'descriptivo';
  }

  private detectarPeriodo(texto: string): { desde: Date; hasta: Date; etiqueta: string } | undefined {
    const ahora = new Date();

    if (texto.includes('hoy')) {
      const inicio = new Date(ahora);
      inicio.setHours(0, 0, 0, 0);
      return { desde: inicio, hasta: ahora, etiqueta: 'Hoy' };
    }

    if (texto.includes('última semana') || texto.includes('ultima semana') || texto.includes('7 días')) {
      return {
        desde: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        hasta: ahora,
        etiqueta: 'Última semana'
      };
    }

    if (texto.includes('último mes') || texto.includes('ultimo mes') || texto.includes('30 días')) {
      return {
        desde: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        hasta: ahora,
        etiqueta: 'Último mes'
      };
    }

    if (texto.includes('último trimestre') || texto.includes('ultimo trimestre') || texto.includes('3 meses')) {
      return {
        desde: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        hasta: ahora,
        etiqueta: 'Último trimestre'
      };
    }

    if (texto.includes('6 meses')) {
      return {
        desde: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        hasta: ahora,
        etiqueta: 'Últimos 6 meses'
      };
    }

    if (texto.includes('este año') || texto.includes('12 meses')) {
      return {
        desde: new Date(ahora.getFullYear(), 0, 1),
        hasta: ahora,
        etiqueta: 'Este año'
      };
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

  private calcularConfianza(
    entidades: EntidadAnalisis[],
    filtros: FiltroDetectado[],
    tipo: TipoAnalisis
  ): number {
    let confianza = 50;

    // Más entidades detectadas = más confianza
    confianza += entidades.length * 10;

    // Filtros detectados aumentan confianza
    confianza += filtros.length * 8;

    // Análisis descriptivo es más común
    if (tipo === 'descriptivo') confianza += 5;

    return Math.min(confianza, 95);
  }

  private generarSugerenciasAlternativas(texto: string): string[] {
    // Sugerencias basadas en la consulta
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
      bar: 'Barras',
      line: 'Líneas',
      pie: 'Circular',
      donut: 'Dona',
      area: 'Área',
      scatter: 'Dispersión',
      heatmap: 'Mapa de Calor',
      radar: 'Radar',
      funnel: 'Embudo',
      treemap: 'Treemap',
      table: 'Tabla'
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
      table: 'Datos detallados'
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
      bar: 'pi-chart-bar',
      line: 'pi-chart-line',
      pie: 'pi-chart-pie',
      donut: 'pi-circle',
      area: 'pi-chart-line',
      scatter: 'pi-share-alt',
      heatmap: 'pi-table',
      radar: 'pi-slack',
      funnel: 'pi-filter',
      treemap: 'pi-th-large',
      table: 'pi-table'
    };
    return iconos[tipo];
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
    await this.delay(1200 + Math.random() * 800);

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

    // Generar datos según tipo
    switch (tipo) {
      case 'descriptivo':
        resultado.datosDescriptivos = this.generarDatosDescriptivos(interpretacion);
        break;
      case 'predictivo':
        resultado.datosPredictivos = this.generarDatosPredictivos(
          interpretacion,
          opciones.horizontePrediccion || 6,
          opciones.mostrarIntervaloConfianza !== false
        );
        break;
      case 'correlacion':
        resultado.datosCorrelacion = this.generarDatosCorrelacion(
          interpretacion,
          opciones.variablesCorrelacion
        );
        break;
    }

    // Guardar versión inicial
    resultado.versiones.push({
      id: `v1-${id}`,
      numero: 1,
      fecha: new Date(),
      configuracion: configuracionVisualizacion,
      datos: resultado.datosDescriptivos || resultado.datosPredictivos || resultado.datosCorrelacion
    });

    return resultado;
  }

  private generarTitulo(interpretacion: InterpretacionConsulta, tipo: TipoAnalisis): string {
    const entidades = interpretacion.entidadesDetectadas;
    const entidad = entidades[0];

    const nombres: Record<EntidadAnalisis, string> = {
      riesgos: 'Riesgos',
      controles: 'Controles',
      incidentes: 'Incidentes',
      activos: 'Activos',
      areas: 'Áreas',
      cumplimiento: 'Cumplimiento',
      procesos: 'Procesos',
      objetivos: 'Objetivos'
    };

    const tipoTitulo = tipo === 'predictivo' ? 'Tendencia de' :
                       tipo === 'correlacion' ? 'Correlación de' :
                       'Distribución de';

    return `${tipoTitulo} ${nombres[entidad]}`;
  }

  private generarDatosDescriptivos(interpretacion: InterpretacionConsulta): {
    labels: string[];
    series: number[];
    total?: number;
    estadisticas?: { min: number; max: number; promedio: number; mediana: number };
  } {
    const agrupacion = interpretacion.agrupacion || 'estado';

    // Datos simulados según agrupación
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
      labels,
      series,
      total,
      estadisticas: {
        min: Math.min(...series),
        max: Math.max(...series),
        promedio: total / series.length,
        mediana: [...series].sort((a, b) => a - b)[Math.floor(series.length / 2)]
      }
    };
  }

  private generarDatosPredictivos(
    interpretacion: InterpretacionConsulta,
    horizonte: HorizontePrediccion,
    conIntervalo: boolean
  ): ResultadoPredictivo {
    const ahora = new Date();
    const datosHistoricos: PuntoPrediccion[] = [];
    const datosPrediccion: PuntoPrediccion[] = [];

    // Generar 6 meses de datos históricos
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(ahora);
      fecha.setMonth(fecha.getMonth() - i);
      datosHistoricos.push({
        fecha,
        valor: Math.floor(Math.random() * 30) + 20,
        esPrediccion: false
      });
    }

    // Calcular tendencia
    const ultimosValores = datosHistoricos.slice(-3).map(d => d.valor);
    const tendenciaBase = ultimosValores.reduce((a, b) => a + b, 0) / ultimosValores.length;
    const esCreciente = datosHistoricos[5].valor > datosHistoricos[0].valor;

    // Generar predicciones
    for (let i = 1; i <= horizonte; i++) {
      const fecha = new Date(ahora);
      fecha.setMonth(fecha.getMonth() + i);

      const variacion = (Math.random() - 0.4) * 10;
      const tendencia = esCreciente ? 2 : -1;
      const valor = Math.max(5, Math.floor(tendenciaBase + (tendencia * i) + variacion));

      const punto: PuntoPrediccion = {
        fecha,
        valor,
        esPrediccion: true
      };

      if (conIntervalo) {
        const margen = Math.floor(valor * 0.15);
        punto.intervaloConfianza = {
          min: valor - margen,
          max: valor + margen
        };
      }

      datosPrediccion.push(punto);
    }

    const porcentajeConfianza = 75 + Math.floor(Math.random() * 20);

    return {
      datosHistoricos,
      datosPrediccion,
      horizonteMeses: horizonte,
      nivelConfianza: porcentajeConfianza >= 80 ? 'alta' : porcentajeConfianza >= 60 ? 'media' : 'baja',
      porcentajeConfianza,
      tendencia: esCreciente ? 'ascendente' : datosHistoricos[5].valor < datosHistoricos[0].valor ? 'descendente' : 'estable',
      resumenTexto: `Se proyecta una tendencia ${esCreciente ? 'ascendente' : 'descendente'} para los próximos ${horizonte} meses, basado en el análisis de datos históricos.`,
      disclaimer: 'Las predicciones son estimaciones basadas en datos históricos y pueden variar según factores externos.'
    };
  }

  private generarDatosCorrelacion(
    interpretacion: InterpretacionConsulta,
    variablesPersonalizadas?: string[]
  ): ResultadoCorrelacion {
    const variables = variablesPersonalizadas?.length
      ? variablesPersonalizadas
      : ['Controles', 'Incidentes', 'Riesgos'];

    const n = variables.length;
    const matriz: number[][] = [];

    // Generar matriz de correlación simétrica
    for (let i = 0; i < n; i++) {
      matriz[i] = [];
      for (let j = 0; j < n; j++) {
        if (i === j) {
          matriz[i][j] = 1;
        } else if (j < i) {
          matriz[i][j] = matriz[j][i]; // Simétrica
        } else {
          // Generar correlación aleatoria pero realista
          matriz[i][j] = Math.round((Math.random() * 1.6 - 0.8) * 100) / 100;
        }
      }
    }

    // Generar pares
    const pares: ParCorrelacion[] = [];
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const coef = matriz[i][j];
        const abs = Math.abs(coef);
        pares.push({
          variable1: variables[i],
          variable2: variables[j],
          coeficiente: coef,
          fuerza: abs >= 0.7 ? 'fuerte' : abs >= 0.4 ? 'moderada' : 'debil',
          direccion: coef >= 0 ? 'positiva' : 'negativa',
          interpretacion: this.generarInterpretacionCorrelacion(variables[i], variables[j], coef)
        });
      }
    }

    // Generar puntos para scatter del par con mejor correlación
    const mejorPar = pares.reduce((a, b) => Math.abs(a.coeficiente) > Math.abs(b.coeficiente) ? a : b);
    const puntosMejorCorrelacion = this.generarPuntosScatter(mejorPar.coeficiente, 20);

    return {
      variables,
      matriz,
      pares,
      puntosMejorCorrelacion,
      lineaTendencia: {
        pendiente: mejorPar.coeficiente,
        intercepto: 10,
        r2: Math.abs(mejorPar.coeficiente) ** 2
      },
      interpretacionGeneral: this.generarInterpretacionGeneral(pares)
    };
  }

  private generarInterpretacionCorrelacion(var1: string, var2: string, coef: number): string {
    const abs = Math.abs(coef);
    const direccion = coef >= 0 ? 'directa' : 'inversa';
    const fuerza = abs >= 0.7 ? 'fuerte' : abs >= 0.4 ? 'moderada' : 'débil';

    if (coef < 0) {
      return `A mayor ${var1.toLowerCase()}, menor ${var2.toLowerCase()} (relación ${fuerza}).`;
    }
    return `A mayor ${var1.toLowerCase()}, mayor ${var2.toLowerCase()} (relación ${fuerza}).`;
  }

  private generarInterpretacionGeneral(pares: ParCorrelacion[]): string {
    const fuerte = pares.find(p => p.fuerza === 'fuerte');
    if (fuerte) {
      return `Se detectó una correlación ${fuerte.fuerza} ${fuerte.direccion} entre ${fuerte.variable1} y ${fuerte.variable2}. ${fuerte.interpretacion}`;
    }

    const moderada = pares.find(p => p.fuerza === 'moderada');
    if (moderada) {
      return `Se encontró una correlación ${moderada.fuerza} entre algunas variables. ${moderada.interpretacion}`;
    }

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

    // Clonar resultado
    const nuevoResultado = { ...resultadoActual };

    // Incrementar versión
    nuevoResultado.versionActual = resultadoActual.versionActual + 1;

    // Procesar feedback y ajustar datos
    const feedbackLower = feedback.toLowerCase();

    if (nuevoResultado.datosDescriptivos) {
      // Agregar o modificar categorías según feedback
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

    // Guardar nueva versión
    nuevoResultado.versiones = [
      ...resultadoActual.versiones,
      {
        id: `v${nuevoResultado.versionActual}-${resultadoActual.id}`,
        numero: nuevoResultado.versionActual,
        fecha: new Date(),
        feedback,
        configuracion: nuevoResultado.configuracionVisualizacion,
        datos: nuevoResultado.datosDescriptivos || nuevoResultado.datosPredictivos || nuevoResultado.datosCorrelacion
      }
    ];

    // Mantener máximo 5 versiones
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
    } catch {
      return [];
    }
  }

  guardarHistorial(historial: ConsultaHistorial[]): void {
    try {
      localStorage.setItem(this.HISTORIAL_KEY, JSON.stringify(historial.slice(0, 20)));
    } catch {
      // Ignorar errores de localStorage
    }
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
