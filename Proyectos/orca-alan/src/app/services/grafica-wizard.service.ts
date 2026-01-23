import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { TipoEntidad } from '../models/tabla-unificada.models';
import {
  CampoEntidad,
  CAMPOS_POR_ENTIDAD,
  CRUCES_DISPONIBLES,
  CruceDatosConfig,
  TipoGraficaWizard,
  TipoAgregacion,
  GraficaWizardResult
} from '../models/grafica-wizard.models';

export interface DatosGraficaProcesados {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class GraficaWizardService {
  private api = inject(ApiService);

  // Cache de datos cargados
  private datosCache = new Map<TipoEntidad, any[]>();

  // Cargar datos de una entidad
  cargarDatosEntidad(entidad: TipoEntidad): Observable<any[]> {
    // Revisar cache primero
    if (this.datosCache.has(entidad)) {
      return of(this.datosCache.get(entidad)!);
    }

    let request: Observable<any[]>;

    switch (entidad) {
      case 'riesgo':
        request = this.api.getRiesgos().pipe(
          map(data => this.mapearRiesgos(data))
        );
        break;
      case 'incidente':
        request = this.api.getIncidentes().pipe(
          map(data => this.mapearIncidentes(data))
        );
        break;
      case 'activo':
        request = this.api.getActivos().pipe(
          map(data => this.mapearActivos(data))
        );
        break;
      case 'proceso':
        request = this.api.getProcesos().pipe(
          map(data => this.mapearProcesos(data))
        );
        break;
      case 'defecto':
        request = this.api.getDefectos().pipe(
          map(data => this.mapearDefectos(data))
        );
        break;
      case 'revision':
        request = this.api.getAsignacionesCuestionario().pipe(
          map(data => this.mapearRevisiones(data))
        );
        break;
      case 'cumplimiento':
        request = this.api.getMarcosNormativos().pipe(
          map(data => this.mapearCumplimiento(data))
        );
        break;
      default:
        return of([]);
    }

    return request.pipe(
      map(datos => {
        this.datosCache.set(entidad, datos);
        return datos;
      }),
      catchError(error => {
        console.error(`Error cargando datos de ${entidad}:`, error);
        return of([]);
      })
    );
  }

  // Obtener campos disponibles para una entidad
  getCamposEntidad(entidad: TipoEntidad): CampoEntidad[] {
    return CAMPOS_POR_ENTIDAD[entidad] || [];
  }

  // Obtener campos de tipo categoría (para agrupación)
  getCamposCategoria(entidad: TipoEntidad): CampoEntidad[] {
    return this.getCamposEntidad(entidad).filter(c => c.tipo === 'categoria');
  }

  // Obtener campos numéricos (para valores)
  getCamposNumericos(entidad: TipoEntidad): CampoEntidad[] {
    return this.getCamposEntidad(entidad).filter(c => c.tipo === 'numerico');
  }

  // Calcular valores únicos de un campo en los datos
  calcularValoresUnicos(datos: any[], campo: string): string[] {
    const valores = new Set<string>();
    datos.forEach(item => {
      const valor = item[campo];
      if (valor !== null && valor !== undefined && valor !== '') {
        valores.add(String(valor));
      }
    });
    return Array.from(valores).sort();
  }

  // Obtener cruces disponibles para una entidad
  getCrucesDisponibles(entidad: TipoEntidad): CruceDatosConfig[] {
    return CRUCES_DISPONIBLES.filter(c => c.origen === entidad);
  }

  // Generar datos procesados para la gráfica
  generarDatosGrafica(config: {
    datos: any[];
    tipoGrafica: TipoGraficaWizard;
    campoAgrupacion?: string;
    tipoAgregacion: TipoAgregacion;
    campoValor?: string;
    campoEjeX?: string;
    campoEjeY?: string;
    campoSeries?: string;
  }): DatosGraficaProcesados {
    const { datos, tipoGrafica, campoAgrupacion, tipoAgregacion, campoValor, campoEjeX, campoEjeY, campoSeries } = config;

    // Tipos de gráficas circulares (sin ejes)
    const tiposCirculares = [
      'pie', 'donut', 'polarArea', 'radialBar', 'gauge',
      'funnel', 'pyramid', 'sunburst', 'treemap'
    ];

    // Tipos de gráficas de ejes (barras y líneas)
    const tiposEjes = [
      // Barras
      'bar', 'column', 'stackedBar', 'groupedBar', 'stackedBarHorizontal',
      // Líneas
      'line', 'area', 'stepline', 'spline', 'stackedArea',
      // Estadísticas
      'waterfall', 'bullet', 'boxplot', 'candlestick',
      // Combinadas
      'combo', 'dumbbell', 'regression',
      // Predictivo
      'trendline', 'forecast', 'rangeArea',
      // Especializadas con ejes
      'heatmap'
    ];

    // Tipos especiales
    const tiposDispersion = ['scatter', 'bubble'];
    const tiposRadar = ['radar'];
    const tiposMatriz = ['riskMatrix', 'correlationMatrix'];
    const tiposFlujo = ['sankey'];

    // Gráficas circulares y similares
    if (tiposCirculares.includes(tipoGrafica)) {
      return this.generarDatosCirculares(datos, campoAgrupacion!, tipoAgregacion, campoValor);
    }

    // Gráficas de ejes (barras, líneas, etc.)
    if (tiposEjes.includes(tipoGrafica)) {
      return this.generarDatosEjes(datos, campoEjeX!, campoEjeY!, campoSeries, tipoAgregacion);
    }

    // Radar
    if (tiposRadar.includes(tipoGrafica)) {
      return this.generarDatosRadar(datos, campoAgrupacion!, tipoAgregacion, campoValor);
    }

    // Scatter/Bubble
    if (tiposDispersion.includes(tipoGrafica)) {
      return this.generarDatosDispersion(datos, campoEjeX!, campoEjeY!);
    }

    // Matrices (riesgo, correlación)
    if (tiposMatriz.includes(tipoGrafica)) {
      return this.generarDatosMatriz(datos, campoEjeX!, campoEjeY!);
    }

    // Sankey (flujos)
    if (tiposFlujo.includes(tipoGrafica)) {
      return this.generarDatosSankey(datos, campoAgrupacion!, campoEjeX!);
    }

    // Fallback: intentar generar como circular
    if (campoAgrupacion) {
      return this.generarDatosCirculares(datos, campoAgrupacion, tipoAgregacion, campoValor);
    }

    return { labels: [], datasets: [] };
  }

  // Generar datos para matrices (riesgo, correlación)
  private generarDatosMatriz(
    datos: any[],
    campoX: string,
    campoY: string
  ): DatosGraficaProcesados {
    // Crear matriz de conteo
    const matriz = new Map<string, Map<string, number>>();
    const valoresX = new Set<string>();
    const valoresY = new Set<string>();

    datos.forEach(item => {
      const x = String(item[campoX] || 'Sin definir');
      const y = String(item[campoY] || 'Sin definir');
      valoresX.add(x);
      valoresY.add(y);

      if (!matriz.has(y)) {
        matriz.set(y, new Map());
      }
      const fila = matriz.get(y)!;
      fila.set(x, (fila.get(x) || 0) + 1);
    });

    const labelsX = Array.from(valoresX).sort();
    const labelsY = Array.from(valoresY).sort();

    const datasets = labelsY.map(y => ({
      label: y,
      data: labelsX.map(x => matriz.get(y)?.get(x) || 0)
    }));

    return { labels: labelsX, datasets };
  }

  // Generar datos para Sankey
  private generarDatosSankey(
    datos: any[],
    campoOrigen: string,
    campoDestino: string
  ): DatosGraficaProcesados {
    const flujos = new Map<string, number>();

    datos.forEach(item => {
      const origen = String(item[campoOrigen] || 'Sin origen');
      const destino = String(item[campoDestino] || 'Sin destino');
      const key = `${origen} → ${destino}`;
      flujos.set(key, (flujos.get(key) || 0) + 1);
    });

    const labels = Array.from(flujos.keys());
    const values = Array.from(flujos.values());

    return {
      labels,
      datasets: [{
        label: 'Flujo',
        data: values
      }]
    };
  }

  // Generar datos para gráficas circulares
  private generarDatosCirculares(
    datos: any[],
    campoAgrupacion: string,
    tipoAgregacion: TipoAgregacion,
    campoValor?: string
  ): DatosGraficaProcesados {
    const grupos = new Map<string, number[]>();

    datos.forEach(item => {
      const grupo = String(item[campoAgrupacion] || 'Sin definir');
      if (!grupos.has(grupo)) {
        grupos.set(grupo, []);
      }

      if (tipoAgregacion === 'conteo') {
        grupos.get(grupo)!.push(1);
      } else if (campoValor && item[campoValor] !== undefined) {
        grupos.get(grupo)!.push(Number(item[campoValor]) || 0);
      }
    });

    const labels: string[] = [];
    const values: number[] = [];

    grupos.forEach((valores, label) => {
      labels.push(label);
      switch (tipoAgregacion) {
        case 'conteo':
          values.push(valores.length);
          break;
        case 'suma':
          values.push(valores.reduce((a, b) => a + b, 0));
          break;
        case 'promedio':
          values.push(valores.length > 0 ? valores.reduce((a, b) => a + b, 0) / valores.length : 0);
          break;
        case 'minimo':
          values.push(valores.length > 0 ? Math.min(...valores) : 0);
          break;
        case 'maximo':
          values.push(valores.length > 0 ? Math.max(...valores) : 0);
          break;
      }
    });

    return {
      labels,
      datasets: [{
        label: 'Datos',
        data: values
      }]
    };
  }

  // Generar datos para gráficas de ejes
  private generarDatosEjes(
    datos: any[],
    campoEjeX: string,
    campoEjeY: string,
    campoSeries?: string,
    tipoAgregacion: TipoAgregacion = 'conteo'
  ): DatosGraficaProcesados {
    if (!campoSeries) {
      // Sin series, agrupación simple
      const grupos = new Map<string, number[]>();

      datos.forEach(item => {
        const x = String(item[campoEjeX] || 'Sin definir');
        if (!grupos.has(x)) {
          grupos.set(x, []);
        }

        if (tipoAgregacion === 'conteo') {
          grupos.get(x)!.push(1);
        } else {
          const valor = Number(item[campoEjeY]) || 0;
          grupos.get(x)!.push(valor);
        }
      });

      const labels: string[] = [];
      const values: number[] = [];

      grupos.forEach((valores, label) => {
        labels.push(label);
        values.push(this.aplicarAgregacion(valores, tipoAgregacion));
      });

      return {
        labels,
        datasets: [{
          label: campoEjeY,
          data: values
        }]
      };
    } else {
      // Con series, múltiples datasets
      const seriesSet = new Set<string>();
      const gruposX = new Set<string>();
      const datosAgrupados = new Map<string, Map<string, number[]>>();

      datos.forEach(item => {
        const x = String(item[campoEjeX] || 'Sin definir');
        const serie = String(item[campoSeries] || 'Sin definir');

        gruposX.add(x);
        seriesSet.add(serie);

        if (!datosAgrupados.has(x)) {
          datosAgrupados.set(x, new Map());
        }
        if (!datosAgrupados.get(x)!.has(serie)) {
          datosAgrupados.get(x)!.set(serie, []);
        }

        if (tipoAgregacion === 'conteo') {
          datosAgrupados.get(x)!.get(serie)!.push(1);
        } else {
          const valor = Number(item[campoEjeY]) || 0;
          datosAgrupados.get(x)!.get(serie)!.push(valor);
        }
      });

      const labels = Array.from(gruposX).sort();
      const series = Array.from(seriesSet).sort();

      const datasets = series.map(serie => ({
        label: serie,
        data: labels.map(x => {
          const valores = datosAgrupados.get(x)?.get(serie) || [];
          return this.aplicarAgregacion(valores, tipoAgregacion);
        })
      }));

      return { labels, datasets };
    }
  }

  // Generar datos para radar
  private generarDatosRadar(
    datos: any[],
    campoAgrupacion: string,
    tipoAgregacion: TipoAgregacion,
    campoValor?: string
  ): DatosGraficaProcesados {
    // Similar a circular pero para radar
    return this.generarDatosCirculares(datos, campoAgrupacion, tipoAgregacion, campoValor);
  }

  // Generar datos para scatter/bubble
  private generarDatosDispersion(
    datos: any[],
    campoEjeX: string,
    campoEjeY: string
  ): DatosGraficaProcesados {
    const points = datos.map(item => ({
      x: Number(item[campoEjeX]) || 0,
      y: Number(item[campoEjeY]) || 0
    }));

    return {
      labels: [],
      datasets: [{
        label: `${campoEjeX} vs ${campoEjeY}`,
        data: points.map(p => p.y)
      }]
    };
  }

  // Aplicar función de agregación
  private aplicarAgregacion(valores: number[], tipo: TipoAgregacion): number {
    if (valores.length === 0) return 0;

    switch (tipo) {
      case 'conteo':
        return valores.length;
      case 'suma':
        return valores.reduce((a, b) => a + b, 0);
      case 'promedio':
        return valores.reduce((a, b) => a + b, 0) / valores.length;
      case 'minimo':
        return Math.min(...valores);
      case 'maximo':
        return Math.max(...valores);
      default:
        return valores.length;
    }
  }

  // Mappers para cada entidad
  private mapearRiesgos(data: any[]): any[] {
    return data.map(r => ({
      id: r.id,
      nombre: r.descripcion || 'Riesgo sin nombre',
      descripcion: r.descripcion,
      estado: r.estado || 'identificado',
      probabilidad: r.probabilidad || 1,
      impacto: r.impacto || 1,
      nivelRiesgo: (r.probabilidad || 1) * (r.impacto || 1),
      responsable: r.responsable?.nombre || r.responsableNombre || 'Sin asignar',
      contenedorNombre: r.activo?.nombre || 'Sin activo',
      activoId: r.activoId,
      fecha: r.fechaIdentificacion || r.createdAt
    }));
  }

  private mapearIncidentes(data: any[]): any[] {
    return data.map(i => ({
      id: i.id,
      nombre: i.titulo || 'Incidente sin título',
      titulo: i.titulo,
      descripcion: i.descripcion,
      estado: i.estado || 'abierto',
      severidad: i.severidad || 'media',
      reportadoPor: i.reportadoPor?.nombre || i.reportadoPorNombre || 'Anónimo',
      contenedorNombre: i.activo?.nombre || 'Sin activo',
      activoId: i.activoId,
      fecha: i.fechaReporte || i.createdAt
    }));
  }

  private mapearActivos(data: any[]): any[] {
    return data.map(a => ({
      id: a.id,
      nombre: a.nombre,
      descripcion: a.descripcion || '',
      estado: a.estado || 'activo',
      tipo: a.tipo || 'otro',
      criticidad: a.criticidad || 'media',
      departamento: a.departamento || 'General',
      fecha: a.createdAt
    }));
  }

  private mapearProcesos(data: any[]): any[] {
    return data.map(p => ({
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion || '',
      estado: p.estado || 'activo',
      version: p.version || '1.0',
      responsable: p.responsable?.nombre || 'Sin asignar',
      fecha: p.createdAt
    }));
  }

  private mapearDefectos(data: any[]): any[] {
    return data.map(d => ({
      id: d.id,
      nombre: d.descripcion || 'Defecto sin descripción',
      descripcion: d.descripcion,
      estado: d.estado || 'abierto',
      prioridad: d.prioridad || 'media',
      tipoDefecto: d.tipo || 'funcional',
      detectadoPor: d.detectadoPor?.nombre || d.detectadoPorNombre || 'Sistema',
      contenedorNombre: d.activo?.nombre || 'Sin activo',
      activoId: d.activoId,
      fecha: d.fechaDeteccion || d.createdAt
    }));
  }

  private mapearRevisiones(data: any[]): any[] {
    return data.map(r => ({
      id: r.id,
      nombre: r.titulo || 'Revisión sin título',
      descripcion: r.notas || '',
      estado: r.estado || 'pendiente',
      responsable: r.responsable?.nombre || 'Sin asignar',
      fecha: r.fechaAsignacion || r.createdAt
    }));
  }

  private mapearCumplimiento(data: any[]): any[] {
    return data.map(m => ({
      id: m.id,
      nombre: m.nombre,
      descripcion: m.descripcion || '',
      estado: 'activo',
      fecha: m.createdAt
    }));
  }

  // Limpiar cache
  limpiarCache(): void {
    this.datosCache.clear();
  }
}
