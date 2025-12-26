import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from './api.service';
import { Activo } from '../models';
import {
  RegistroUnificado,
  TipoEntidad,
  ColumnaConfig,
  FiltroActivo,
  EstadoTabla,
  PresetFecha
} from '../models/tabla-unificada.models';

@Injectable({
  providedIn: 'root'
})
export class TablaUnificadaService {
  private api = inject(ApiService);

  // Data cargada desde API
  private activosData = signal<Activo[]>([]);
  private riesgosData = signal<any[]>([]);
  private incidentesData = signal<any[]>([]);

  constructor() {
    this.cargarDatos();
  }

  private cargarDatos(): void {
    this.api.getActivos().subscribe({
      next: (data) => this.activosData.set(data),
      error: (err) => console.error('Error cargando activos:', err)
    });
    this.api.getRiesgos().subscribe({
      next: (data) => this.riesgosData.set(data),
      error: (err) => console.error('Error cargando riesgos:', err)
    });
    this.api.getIncidentes().subscribe({
      next: (data) => this.incidentesData.set(data),
      error: (err) => console.error('Error cargando incidentes:', err)
    });
  }

  // Estado de la tabla
  private estado = signal<EstadoTabla>({
    entidadesSeleccionadas: ['riesgo'],
    filtrosActivos: [],
    columnasVisibles: ['tipoEntidad', 'descripcion', 'contenedorNombre', 'estado', 'fecha', 'responsable', 'nivelRiesgo', 'severidad'],
    ordenColumnas: ['tipoEntidad', 'descripcion', 'contenedorNombre', 'estado', 'fecha', 'responsable', 'nivelRiesgo', 'severidad'],
    ordenamiento: null,
    pagina: 0,
    registrosPorPagina: 10
  });

  // Búsqueda global
  busquedaGlobal = signal('');

  // Configuración de columnas
  columnasConfig = signal<ColumnaConfig[]>([
    { field: 'tipoEntidad', header: 'Tipo', tipo: 'seleccion', visible: true, sortable: true, filterable: true, orden: 0, width: '100px', opciones: [{ label: 'Riesgo', value: 'riesgo' }, { label: 'Incidente', value: 'incidente' }] },
    { field: 'id', header: 'ID', tipo: 'texto', visible: false, sortable: true, filterable: true, orden: 1, width: '100px' },
    { field: 'descripcion', header: 'Descripción', tipo: 'texto', visible: true, sortable: true, filterable: true, orden: 2, width: '250px' },
    { field: 'titulo', header: 'Título', tipo: 'texto', visible: false, sortable: true, filterable: true, orden: 3, width: '200px' },
    { field: 'contenedorNombre', header: 'Activo/Proceso', tipo: 'contenedor', visible: true, sortable: true, filterable: true, orden: 4, width: '180px' },
    { field: 'estado', header: 'Estado', tipo: 'seleccion', visible: true, sortable: true, filterable: true, orden: 5, width: '130px', opciones: [] },
    { field: 'fecha', header: 'Fecha', tipo: 'fecha', visible: true, sortable: true, filterable: true, orden: 6, width: '120px' },
    { field: 'responsable', header: 'Responsable', tipo: 'texto', visible: true, sortable: true, filterable: true, orden: 7, width: '150px' },
    { field: 'nivelRiesgo', header: 'Nivel Riesgo', tipo: 'numero', visible: true, sortable: true, filterable: true, orden: 8, width: '120px' },
    { field: 'probabilidad', header: 'Probabilidad', tipo: 'numero', visible: false, sortable: true, filterable: true, orden: 9, width: '110px' },
    { field: 'impacto', header: 'Impacto', tipo: 'numero', visible: false, sortable: true, filterable: true, orden: 10, width: '100px' },
    { field: 'severidad', header: 'Severidad', tipo: 'seleccion', visible: true, sortable: true, filterable: true, orden: 11, width: '120px', opciones: [{ label: 'Crítica', value: 'critica' }, { label: 'Alta', value: 'alta' }, { label: 'Media', value: 'media' }, { label: 'Baja', value: 'baja' }] },
    { field: 'reportadoPor', header: 'Reportado Por', tipo: 'texto', visible: false, sortable: true, filterable: true, orden: 12, width: '150px' }
  ]);

  // Presets de fecha
  presetsFecha: PresetFecha[] = [
    {
      label: 'Hoy',
      value: 'hoy',
      getFechas: () => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fin = new Date();
        fin.setHours(23, 59, 59, 999);
        return { desde: hoy, hasta: fin };
      }
    },
    {
      label: 'Últimos 7 días',
      value: '7dias',
      getFechas: () => {
        const hasta = new Date();
        const desde = new Date();
        desde.setDate(desde.getDate() - 7);
        return { desde, hasta };
      }
    },
    {
      label: 'Último mes',
      value: 'mes',
      getFechas: () => {
        const hasta = new Date();
        const desde = new Date();
        desde.setMonth(desde.getMonth() - 1);
        return { desde, hasta };
      }
    },
    {
      label: 'Último trimestre',
      value: 'trimestre',
      getFechas: () => {
        const hasta = new Date();
        const desde = new Date();
        desde.setMonth(desde.getMonth() - 3);
        return { desde, hasta };
      }
    },
    {
      label: 'Este año',
      value: 'año',
      getFechas: () => {
        const hasta = new Date();
        const desde = new Date(hasta.getFullYear(), 0, 1);
        return { desde, hasta };
      }
    }
  ];

  // Computed: Datos unificados sin filtrar
  datosUnificados = computed<RegistroUnificado[]>(() => {
    const activos = this.activosData();
    const riesgos = this.riesgosData();
    const incidentes = this.incidentesData();
    const entidades = this.estado().entidadesSeleccionadas;
    const registros: RegistroUnificado[] = [];

    // Agregar riesgos
    if (entidades.includes('riesgo')) {
      riesgos.forEach(riesgo => {
        const activo = activos.find(a => a.id === riesgo.activoId);
        registros.push({
          id: riesgo.id,
          tipoEntidad: 'riesgo',
          contenedorId: riesgo.activoId,
          contenedorNombre: activo?.nombre || 'Sin activo',
          tipoContenedor: 'activo',
          descripcion: riesgo.descripcion,
          estado: riesgo.estado,
          fecha: riesgo.fechaIdentificacion,
          responsable: riesgo.responsable,
          probabilidad: riesgo.probabilidad,
          impacto: riesgo.impacto,
          nivelRiesgo: riesgo.probabilidad * riesgo.impacto
        });
      });
    }

    // Agregar incidentes
    if (entidades.includes('incidente')) {
      incidentes.forEach(incidente => {
        const activo = activos.find(a => a.id === incidente.activoId);
        registros.push({
          id: incidente.id,
          tipoEntidad: 'incidente',
          contenedorId: incidente.activoId,
          contenedorNombre: activo?.nombre || 'Sin activo',
          tipoContenedor: 'activo',
          descripcion: incidente.descripcion,
          estado: incidente.estado,
          fecha: incidente.fechaReporte,
          responsable: incidente.reportadoPor,
          titulo: incidente.titulo,
          severidad: incidente.severidad,
          reportadoPor: incidente.reportadoPor
        });
      });
    }

    return registros;
  });

  // Computed: Datos filtrados
  datosFiltrados = computed<RegistroUnificado[]>(() => {
    let datos = this.datosUnificados();
    const filtros = this.estado().filtrosActivos;
    const busqueda = this.busquedaGlobal().toLowerCase();

    // Aplicar filtros
    filtros.forEach(filtro => {
      datos = datos.filter(registro => this.aplicarFiltro(registro, filtro));
    });

    // Aplicar búsqueda global
    if (busqueda) {
      datos = datos.filter(registro =>
        Object.values(registro).some(valor =>
          valor?.toString().toLowerCase().includes(busqueda)
        )
      );
    }

    // Aplicar ordenamiento
    const orden = this.estado().ordenamiento;
    if (orden) {
      datos = [...datos].sort((a, b) => {
        const valorA = (a as any)[orden.campo];
        const valorB = (b as any)[orden.campo];

        if (valorA === undefined || valorA === null) return 1;
        if (valorB === undefined || valorB === null) return -1;

        let comparacion = 0;
        if (valorA instanceof Date && valorB instanceof Date) {
          comparacion = valorA.getTime() - valorB.getTime();
        } else if (typeof valorA === 'number' && typeof valorB === 'number') {
          comparacion = valorA - valorB;
        } else {
          comparacion = String(valorA).localeCompare(String(valorB));
        }

        return orden.direccion === 'asc' ? comparacion : -comparacion;
      });
    }

    return datos;
  });

  // Computed: Datos paginados
  datosPaginados = computed<RegistroUnificado[]>(() => {
    const datos = this.datosFiltrados();
    const { pagina, registrosPorPagina } = this.estado();
    const inicio = pagina * registrosPorPagina;
    return datos.slice(inicio, inicio + registrosPorPagina);
  });

  // Computed: Contadores
  contadores = computed(() => {
    const datos = this.datosFiltrados();
    return {
      total: datos.length,
      riesgos: datos.filter(d => d.tipoEntidad === 'riesgo').length,
      incidentes: datos.filter(d => d.tipoEntidad === 'incidente').length,
      criticos: datos.filter(d =>
        (d.tipoEntidad === 'riesgo' && d.nivelRiesgo && d.nivelRiesgo >= 15) ||
        (d.tipoEntidad === 'incidente' && d.severidad === 'critica')
      ).length,
      controlados: datos.filter(d =>
        d.estado === 'mitigado' || d.estado === 'aceptado' || d.estado === 'resuelto' || d.estado === 'cerrado'
      ).length
    };
  });

  // Computed: Opciones únicas para filtros de selección
  opcionesEstado = computed(() => {
    const datos = this.datosUnificados();
    const estados = [...new Set(datos.map(d => d.estado))];
    return estados.map(e => ({ label: this.formatearEstado(e), value: e }));
  });

  // Computed: Columnas visibles ordenadas
  columnasVisibles = computed(() => {
    const config = this.columnasConfig();
    const orden = this.estado().ordenColumnas;
    return config
      .filter(c => c.visible)
      .sort((a, b) => orden.indexOf(a.field) - orden.indexOf(b.field));
  });

  // Métodos públicos
  getEstado() {
    return this.estado;
  }

  setEntidadesSeleccionadas(entidades: TipoEntidad[]): void {
    this.estado.update(s => ({ ...s, entidadesSeleccionadas: entidades, pagina: 0 }));
  }

  agregarFiltro(filtro: FiltroActivo): void {
    this.estado.update(s => ({
      ...s,
      filtrosActivos: [...s.filtrosActivos, filtro],
      pagina: 0
    }));
  }

  eliminarFiltro(index: number): void {
    this.estado.update(s => ({
      ...s,
      filtrosActivos: s.filtrosActivos.filter((_, i) => i !== index),
      pagina: 0
    }));
  }

  limpiarFiltros(): void {
    this.estado.update(s => ({ ...s, filtrosActivos: [], pagina: 0 }));
    this.busquedaGlobal.set('');
  }

  toggleColumna(field: string): void {
    this.columnasConfig.update(cols =>
      cols.map(c => c.field === field ? { ...c, visible: !c.visible } : c)
    );
  }

  reordenarColumnas(nuevoOrden: string[]): void {
    // Obtener todas las columnas actuales
    const todasLasColumnas = this.columnasConfig().map(c => c.field);

    // Si el nuevo orden no incluye todas las columnas (por ejemplo, solo las visibles),
    // necesitamos preservar las columnas faltantes en su posición relativa
    const columnasEnNuevoOrden = new Set(nuevoOrden);
    const columnasFaltantes = todasLasColumnas.filter(c => !columnasEnNuevoOrden.has(c));

    // Combinar: columnas del nuevo orden + columnas faltantes al final
    const ordenCompleto = [...nuevoOrden, ...columnasFaltantes];

    this.estado.update(s => ({ ...s, ordenColumnas: ordenCompleto }));
  }

  // Reordenar columnas manteniendo el orden completo (para drag & drop del drawer)
  reordenarColumnasCompleto(nuevoOrden: string[]): void {
    this.estado.update(s => ({ ...s, ordenColumnas: nuevoOrden }));
  }

  setOrdenamiento(campo: string, direccion: 'asc' | 'desc'): void {
    this.estado.update(s => ({ ...s, ordenamiento: { campo, direccion } }));
  }

  clearOrdenamiento(): void {
    this.estado.update(s => ({ ...s, ordenamiento: null }));
  }

  setPagina(pagina: number): void {
    this.estado.update(s => ({ ...s, pagina }));
  }

  setRegistrosPorPagina(cantidad: number): void {
    this.estado.update(s => ({ ...s, registrosPorPagina: cantidad, pagina: 0 }));
  }

  restaurarColumnasDefecto(): void {
    this.columnasConfig.update(cols =>
      cols.map(c => ({
        ...c,
        visible: ['tipoEntidad', 'descripcion', 'contenedorNombre', 'estado', 'fecha', 'responsable', 'nivelRiesgo', 'severidad'].includes(c.field)
      }))
    );
    this.estado.update(s => ({
      ...s,
      ordenColumnas: ['tipoEntidad', 'descripcion', 'contenedorNombre', 'estado', 'fecha', 'responsable', 'nivelRiesgo', 'severidad']
    }));
  }

  // Métodos privados
  private aplicarFiltro(registro: RegistroUnificado, filtro: FiltroActivo): boolean {
    const valor = (registro as any)[filtro.columna];

    if (valor === undefined || valor === null) {
      return false;
    }

    switch (filtro.tipo) {
      case 'texto':
        return this.filtrarTexto(String(valor), filtro.operador, filtro.valor);

      case 'numero':
        return this.filtrarNumero(Number(valor), filtro.operador, filtro.valor, filtro.valorHasta);

      case 'fecha':
        return this.filtrarFecha(new Date(valor), filtro.operador, filtro.valor, filtro.valorHasta);

      case 'seleccion':
        const valores = Array.isArray(filtro.valor) ? filtro.valor : [filtro.valor];
        return valores.includes(valor);

      case 'contenedor':
        return String(valor).toLowerCase().includes(String(filtro.valor).toLowerCase());

      default:
        return true;
    }
  }

  private filtrarTexto(valor: string, operador: string, busqueda: string): boolean {
    const valorLower = valor.toLowerCase();
    const busquedaLower = busqueda.toLowerCase();

    switch (operador) {
      case 'contiene': return valorLower.includes(busquedaLower);
      case 'empieza_con': return valorLower.startsWith(busquedaLower);
      case 'termina_con': return valorLower.endsWith(busquedaLower);
      case 'igual': return valorLower === busquedaLower;
      default: return true;
    }
  }

  private filtrarNumero(valor: number, operador: string, min: number, max?: number): boolean {
    switch (operador) {
      case 'igual': return valor === min;
      case 'mayor': return valor > min;
      case 'menor': return valor < min;
      case 'entre': return max !== undefined && valor >= min && valor <= max;
      default: return true;
    }
  }

  private filtrarFecha(valor: Date, operador: string, desde: Date, hasta?: Date): boolean {
    const fechaValor = valor.getTime();
    const fechaDesde = new Date(desde).getTime();
    const fechaHasta = hasta ? new Date(hasta).getTime() : fechaDesde;

    switch (operador) {
      case 'igual': return fechaValor >= fechaDesde && fechaValor <= fechaHasta;
      case 'antes': return fechaValor < fechaDesde;
      case 'despues': return fechaValor > fechaDesde;
      case 'entre': return fechaValor >= fechaDesde && fechaValor <= fechaHasta;
      default: return true;
    }
  }

  private formatearEstado(estado: string): string {
    const mapeo: Record<string, string> = {
      'identificado': 'Identificado',
      'evaluado': 'Evaluado',
      'mitigado': 'Mitigado',
      'aceptado': 'Aceptado',
      'abierto': 'Abierto',
      'en_proceso': 'En Proceso',
      'resuelto': 'Resuelto',
      'cerrado': 'Cerrado'
    };
    return mapeo[estado] || estado;
  }

  // Método para exportar datos
  exportarDatos(formato: 'csv' | 'excel' | 'pdf', soloVisibles: boolean = true): void {
    const datos = this.datosFiltrados();
    const columnas = soloVisibles
      ? this.columnasVisibles()
      : this.columnasConfig();

    if (formato === 'csv') {
      this.exportarCSV(datos, columnas);
    } else if (formato === 'excel') {
      this.exportarExcel(datos, columnas);
    } else {
      this.exportarPDF(datos, columnas);
    }
  }

  private exportarCSV(datos: RegistroUnificado[], columnas: ColumnaConfig[]): void {
    const headers = columnas.map(c => c.header).join(',');
    const rows = datos.map(d =>
      columnas.map(c => {
        const valor = (d as any)[c.field];
        if (valor instanceof Date) {
          return valor.toLocaleDateString();
        }
        return `"${String(valor ?? '-').replace(/"/g, '""')}"`;
      }).join(',')
    );

    const csv = [headers, ...rows].join('\n');
    this.descargarArchivo(csv, 'tabla-unificada.csv', 'text/csv');
  }

  private exportarExcel(datos: RegistroUnificado[], columnas: ColumnaConfig[]): void {
    // Crear contenido XML para Excel
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<?mso-application progid="Excel.Sheet"?>\n';
    xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n';
    xml += '<Worksheet ss:Name="Datos"><Table>\n';

    // Headers
    xml += '<Row>\n';
    columnas.forEach(c => {
      xml += `<Cell><Data ss:Type="String">${c.header}</Data></Cell>\n`;
    });
    xml += '</Row>\n';

    // Datos
    datos.forEach(d => {
      xml += '<Row>\n';
      columnas.forEach(c => {
        const valor = (d as any)[c.field];
        let tipo = 'String';
        let valorFormateado = String(valor ?? '-');

        if (typeof valor === 'number') {
          tipo = 'Number';
        } else if (valor instanceof Date) {
          valorFormateado = valor.toLocaleDateString();
        }

        xml += `<Cell><Data ss:Type="${tipo}">${valorFormateado}</Data></Cell>\n`;
      });
      xml += '</Row>\n';
    });

    xml += '</Table></Worksheet></Workbook>';
    this.descargarArchivo(xml, 'tabla-unificada.xls', 'application/vnd.ms-excel');
  }

  private exportarPDF(datos: RegistroUnificado[], columnas: ColumnaConfig[]): void {
    // Crear contenido HTML para imprimir como PDF
    const tieneRiesgos = datos.some(d => d.tipoEntidad === 'riesgo');
    const tieneIncidentes = datos.some(d => d.tipoEntidad === 'incidente');
    const titulo = tieneRiesgos && tieneIncidentes ? 'Tabla Unificada - Reporte' :
                   tieneRiesgos ? 'Reporte de Riesgos' :
                   tieneIncidentes ? 'Reporte de Incidentes' :
                   'Tabla Unificada - Reporte';

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${titulo}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; }
          h1 { text-align: center; color: #333; margin-bottom: 5px; }
          .fecha { text-align: center; color: #666; margin-bottom: 20px; font-size: 11px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #6366f1; color: white; padding: 10px 8px; text-align: left; font-size: 11px; }
          td { padding: 8px; border-bottom: 1px solid #ddd; font-size: 11px; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          tr:hover { background-color: #f5f5f5; }
          .total { margin-top: 15px; text-align: right; font-size: 11px; color: #666; }
          @media print {
            body { margin: 0; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
          }
        </style>
      </head>
      <body>
        <h1>${titulo}</h1>
        <p class="fecha">Generado el: ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        <table>
          <thead>
            <tr>
    `;

    // Headers
    columnas.forEach(c => {
      html += `<th>${c.header}</th>`;
    });
    html += '</tr></thead><tbody>';

    // Datos
    datos.forEach(d => {
      html += '<tr>';
      columnas.forEach(c => {
        const valor = (d as any)[c.field];
        let valorFormateado = String(valor ?? '-');

        if (valor instanceof Date) {
          valorFormateado = valor.toLocaleDateString('es-ES');
        }

        html += `<td>${valorFormateado}</td>`;
      });
      html += '</tr>';
    });

    html += `
          </tbody>
        </table>
        <p class="total">Total de registros: ${datos.length}</p>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `;

    // Abrir en nueva ventana para imprimir
    const ventana = window.open('', '_blank');
    if (ventana) {
      ventana.document.write(html);
      ventana.document.close();
    }
  }

  private descargarArchivo(contenido: string, nombre: string, tipo: string): void {
    const blob = new Blob([contenido], { type: tipo });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombre;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Método para exportar datos seleccionados
  exportarDatosSeleccionados(datos: RegistroUnificado[], formato: 'csv' | 'excel' | 'pdf'): void {
    const columnas = this.columnasVisibles();

    if (formato === 'csv') {
      this.exportarCSV(datos, columnas);
    } else if (formato === 'excel') {
      this.exportarExcel(datos, columnas);
    } else {
      this.exportarPDF(datos, columnas);
    }
  }

  // Métodos para gráficas
  obtenerDatosGrafica(columnaCategoria: string, agregacion: string, columnaValor?: string) {
    const datos = this.datosFiltrados();
    const agrupados = new Map<string, number>();

    datos.forEach(d => {
      const categoria = String((d as any)[columnaCategoria] ?? 'Sin definir');
      const valorActual = agrupados.get(categoria) || 0;

      switch (agregacion) {
        case 'conteo':
          agrupados.set(categoria, valorActual + 1);
          break;
        case 'suma':
          if (columnaValor) {
            const val = Number((d as any)[columnaValor]) || 0;
            agrupados.set(categoria, valorActual + val);
          }
          break;
        case 'promedio':
          // Para promedio necesitamos contar también
          break;
      }
    });

    return {
      labels: Array.from(agrupados.keys()),
      valores: Array.from(agrupados.values())
    };
  }

  obtenerDatosLineaTemporal(columnaFecha: string, agrupacion: string, agregacion: string) {
    const datos = this.datosFiltrados();
    const agrupados = new Map<string, number>();

    datos.forEach(d => {
      const fecha = new Date((d as any)[columnaFecha]);
      let clave: string;

      switch (agrupacion) {
        case 'dia':
          clave = fecha.toLocaleDateString();
          break;
        case 'semana':
          const inicioSemana = new Date(fecha);
          inicioSemana.setDate(fecha.getDate() - fecha.getDay());
          clave = `Sem ${inicioSemana.toLocaleDateString()}`;
          break;
        case 'mes':
          clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'trimestre':
          const trimestre = Math.floor(fecha.getMonth() / 3) + 1;
          clave = `${fecha.getFullYear()} Q${trimestre}`;
          break;
        case 'año':
          clave = String(fecha.getFullYear());
          break;
        default:
          clave = fecha.toLocaleDateString();
      }

      agrupados.set(clave, (agrupados.get(clave) || 0) + 1);
    });

    // Ordenar por fecha
    const ordenado = new Map([...agrupados.entries()].sort());

    return {
      labels: Array.from(ordenado.keys()),
      valores: Array.from(ordenado.values())
    };
  }
}
