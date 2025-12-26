import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface ExportOptions {
  filename?: string;
  format?: 'png' | 'jpg' | 'pdf' | 'csv' | 'xlsx' | 'svg';
  quality?: number;
  scale?: number;
  backgroundColor?: string;
}

export interface TableExportData {
  headers: string[];
  rows: any[][];
  title?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  /**
   * Exporta un elemento HTML como imagen PNG o JPG
   */
  async exportAsImage(element: HTMLElement, options: ExportOptions = {}): Promise<void> {
    const {
      filename = 'export',
      format = 'png',
      quality = 1,
      scale = 2,
      backgroundColor = '#ffffff'
    } = options;

    try {
      const canvas = await html2canvas(element, {
        scale,
        backgroundColor,
        useCORS: true,
        allowTaint: true,
        logging: false
      });

      const link = document.createElement('a');
      link.download = `${filename}.${format}`;

      if (format === 'jpg') {
        link.href = canvas.toDataURL('image/jpeg', quality);
      } else {
        link.href = canvas.toDataURL('image/png');
      }

      link.click();
    } catch (error) {
      console.error('Error exporting image:', error);
      throw error;
    }
  }

  /**
   * Exporta un elemento HTML como PDF
   */
  async exportAsPDF(element: HTMLElement, options: ExportOptions = {}): Promise<void> {
    const {
      filename = 'export',
      scale = 2,
      backgroundColor = '#ffffff'
    } = options;

    try {
      const canvas = await html2canvas(element, {
        scale,
        backgroundColor,
        useCORS: true,
        allowTaint: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Calcular dimensiones del PDF (A4 por defecto)
      const pdfWidth = 210; // mm
      const pdfHeight = (imgHeight * pdfWidth) / imgWidth;

      const pdf = new jsPDF({
        orientation: pdfHeight > pdfWidth ? 'portrait' : 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Si la imagen es muy alta, ajustar
      const pageHeight = pdf.internal.pageSize.getHeight();
      if (pdfHeight <= pageHeight) {
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      } else {
        // Múltiples páginas
        let position = 0;
        let remainingHeight = pdfHeight;

        while (remainingHeight > 0) {
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
          remainingHeight -= pageHeight;
          position -= pageHeight;

          if (remainingHeight > 0) {
            pdf.addPage();
          }
        }
      }

      pdf.save(`${filename}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      throw error;
    }
  }

  /**
   * Exporta datos de tabla como CSV
   */
  exportAsCSV(data: TableExportData, options: ExportOptions = {}): void {
    const { filename = 'export' } = options;

    try {
      const { headers, rows, title } = data;
      let csvContent = '';

      // Agregar título si existe
      if (title) {
        csvContent += `${title}\n\n`;
      }

      // Agregar headers
      csvContent += headers.map(h => `"${h}"`).join(',') + '\n';

      // Agregar filas
      rows.forEach(row => {
        csvContent += row.map(cell => {
          const value = cell === null || cell === undefined ? '' : String(cell);
          // Escapar comillas dobles y envolver en comillas si contiene comas
          const escaped = value.replace(/"/g, '""');
          return value.includes(',') || value.includes('"') || value.includes('\n')
            ? `"${escaped}"`
            : escaped;
        }).join(',') + '\n';
      });

      // Crear y descargar el archivo
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      throw error;
    }
  }

  /**
   * Exporta datos de tabla como Excel (XLSX simple usando CSV con extensión xlsx)
   * Para un XLSX real se necesitaría la librería xlsx
   */
  exportAsExcel(data: TableExportData, options: ExportOptions = {}): void {
    const { filename = 'export' } = options;

    try {
      const { headers, rows, title } = data;

      // Crear contenido XML para Excel
      let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xmlContent += '<?mso-application progid="Excel.Sheet"?>\n';
      xmlContent += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
      xmlContent += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n';
      xmlContent += '<Worksheet ss:Name="Sheet1">\n<Table>\n';

      // Título si existe
      if (title) {
        xmlContent += '<Row><Cell><Data ss:Type="String">' + this.escapeXml(title) + '</Data></Cell></Row>\n';
        xmlContent += '<Row></Row>\n';
      }

      // Headers
      xmlContent += '<Row>\n';
      headers.forEach(header => {
        xmlContent += `<Cell><Data ss:Type="String">${this.escapeXml(header)}</Data></Cell>\n`;
      });
      xmlContent += '</Row>\n';

      // Filas
      rows.forEach(row => {
        xmlContent += '<Row>\n';
        row.forEach(cell => {
          const value = cell === null || cell === undefined ? '' : String(cell);
          const type = typeof cell === 'number' ? 'Number' : 'String';
          xmlContent += `<Cell><Data ss:Type="${type}">${this.escapeXml(value)}</Data></Cell>\n`;
        });
        xmlContent += '</Row>\n';
      });

      xmlContent += '</Table>\n</Worksheet>\n</Workbook>';

      // Crear y descargar el archivo
      const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.xls`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error exporting Excel:', error);
      throw error;
    }
  }

  /**
   * Exporta un gráfico ApexCharts como SVG
   */
  exportChartAsSVG(chartElement: HTMLElement, options: ExportOptions = {}): void {
    const { filename = 'chart' } = options;

    try {
      const svgElement = chartElement.querySelector('svg');
      if (!svgElement) {
        throw new Error('No se encontró el elemento SVG del gráfico');
      }

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.svg`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error exporting SVG:', error);
      throw error;
    }
  }

  /**
   * Exporta múltiples widgets como un PDF combinado
   */
  async exportMultipleAsPDF(elements: HTMLElement[], options: ExportOptions = {}): Promise<void> {
    const { filename = 'dashboard-export', scale = 2 } = options;

    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;

      for (let i = 0; i < elements.length; i++) {
        if (i > 0) {
          pdf.addPage();
        }

        const canvas = await html2canvas(elements[i], {
          scale,
          backgroundColor: '#ffffff',
          useCORS: true,
          allowTaint: true,
          logging: false
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - (margin * 2);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, Math.min(imgHeight, pageHeight - (margin * 2)));
      }

      pdf.save(`${filename}.pdf`);
    } catch (error) {
      console.error('Error exporting multiple as PDF:', error);
      throw error;
    }
  }

  /**
   * Exporta el canvas completo del dashboard
   */
  async exportDashboardCanvas(canvasElement: HTMLElement, options: ExportOptions = {}): Promise<void> {
    const { filename = 'dashboard', format = 'pdf' } = options;

    if (format === 'pdf') {
      await this.exportAsPDF(canvasElement, { ...options, filename });
    } else {
      await this.exportAsImage(canvasElement, { ...options, filename, format: format as 'png' | 'jpg' });
    }
  }

  /**
   * Helper para escapar caracteres XML
   */
  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Genera un nombre de archivo con timestamp
   */
  generateFilename(prefix: string): string {
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/[:-]/g, '');
    return `${prefix}_${timestamp}`;
  }
}
