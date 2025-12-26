// ============================================================================
// GRÁFICAS GUARDADAS WIDGET COMPONENT (W2)
// ============================================================================
// Widget para mostrar y gestionar configuraciones de gráficas guardadas
// Permite cargar, visualizar y eliminar gráficas guardadas
// ============================================================================

import { Component, Input, Output, EventEmitter, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { NgApexchartsModule } from 'ng-apexcharts';

export interface GraficaGuardada {
  id: string;
  nombre: string;
  descripcion?: string;
  tipo: 'bar' | 'line' | 'donut' | 'area' | 'radar' | 'pie' | 'heatmap';
  fechaCreacion: Date;
  fechaModificacion: Date;
  categoria?: string;
  favorito?: boolean;
  config: {
    series: any[];
    labels?: string[];
    colors?: string[];
    options?: Record<string, any>;
  };
  preview?: {
    miniSeries: number[];
    miniLabels: string[];
  };
}

@Component({
  selector: 'app-graficas-guardadas-widget',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TooltipModule,
    TagModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    NgApexchartsModule
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <div class="graficas-guardadas-widget" [class.compact]="modo === 'compact'">
      <!-- Header con búsqueda -->
      <div class="widget-header-actions">
        <div class="search-box" *ngIf="modo !== 'compact'">
          <i class="pi pi-search"></i>
          <input
            type="text"
            placeholder="Buscar gráficas..."
            [ngModel]="filtro()"
            (ngModelChange)="filtro.set($event)"
            class="search-input" />
        </div>
        <div class="header-right">
          <p-button
            icon="pi pi-refresh"
            [rounded]="true"
            [text]="true"
            size="small"
            (onClick)="cargarGraficas()"
            pTooltip="Actualizar">
          </p-button>
        </div>
      </div>

      <!-- Filtros rápidos -->
      @if (modo !== 'compact') {
        <div class="filtros-rapidos">
          <button
            class="filtro-btn"
            [class.active]="categoriaActiva() === 'todas'"
            (click)="categoriaActiva.set('todas')">
            Todas
          </button>
          <button
            class="filtro-btn"
            [class.active]="categoriaActiva() === 'favoritas'"
            (click)="categoriaActiva.set('favoritas')">
            <i class="pi pi-star-fill"></i>
            Favoritas
          </button>
          <button
            class="filtro-btn"
            [class.active]="categoriaActiva() === 'recientes'"
            (click)="categoriaActiva.set('recientes')">
            <i class="pi pi-clock"></i>
            Recientes
          </button>
        </div>
      }

      <!-- Lista de gráficas -->
      <div class="graficas-lista" [class.compact-lista]="modo === 'compact'">
        @for (grafica of graficasFiltradas(); track grafica.id) {
          <div
            class="grafica-card"
            [class.favorita]="grafica.favorito"
            (click)="seleccionarGrafica(grafica)">

            <!-- Preview mini de la gráfica -->
            <div class="grafica-preview">
              @switch (grafica.tipo) {
                @case ('bar') {
                  <div class="mini-bars">
                    @for (val of grafica.preview?.miniSeries || [40, 70, 55, 85]; track $index) {
                      <div class="mini-bar" [style.height.%]="val"></div>
                    }
                  </div>
                }
                @case ('line') {
                  <svg class="mini-line" viewBox="0 0 100 40">
                    <polyline
                      fill="none"
                      stroke="var(--primary-color)"
                      stroke-width="2"
                      [attr.points]="getMiniLinePoints(grafica.preview?.miniSeries || [10, 30, 20, 35, 25])">
                    </polyline>
                  </svg>
                }
                @case ('donut') {
                  <div class="mini-donut">
                    <svg viewBox="0 0 36 36">
                      <circle
                        cx="18" cy="18" r="15.5"
                        fill="none"
                        stroke="var(--surface-200)"
                        stroke-width="3">
                      </circle>
                      <circle
                        cx="18" cy="18" r="15.5"
                        fill="none"
                        stroke="var(--primary-color)"
                        stroke-width="3"
                        stroke-dasharray="70 30"
                        stroke-linecap="round"
                        transform="rotate(-90 18 18)">
                      </circle>
                    </svg>
                  </div>
                }
                @case ('area') {
                  <svg class="mini-area" viewBox="0 0 100 40">
                    <defs>
                      <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:var(--primary-color);stop-opacity:0.4" />
                        <stop offset="100%" style="stop-color:var(--primary-color);stop-opacity:0.05" />
                      </linearGradient>
                    </defs>
                    <polygon
                      fill="url(#areaGrad)"
                      [attr.points]="getMiniAreaPoints(grafica.preview?.miniSeries || [10, 30, 20, 35, 25])">
                    </polygon>
                    <polyline
                      fill="none"
                      stroke="var(--primary-color)"
                      stroke-width="2"
                      [attr.points]="getMiniLinePoints(grafica.preview?.miniSeries || [10, 30, 20, 35, 25])">
                    </polyline>
                  </svg>
                }
                @default {
                  <div class="mini-placeholder">
                    <i [class]="getIconoTipo(grafica.tipo)"></i>
                  </div>
                }
              }
            </div>

            <!-- Info de la gráfica -->
            <div class="grafica-info">
              <div class="grafica-nombre">
                @if (grafica.favorito) {
                  <i class="pi pi-star-fill star-icon"></i>
                }
                {{ grafica.nombre }}
              </div>
              @if (modo !== 'compact' && grafica.descripcion) {
                <div class="grafica-descripcion">{{ grafica.descripcion }}</div>
              }
              <div class="grafica-meta">
                <p-tag
                  [value]="getLabelTipo(grafica.tipo)"
                  [severity]="getSeverityTipo(grafica.tipo)"
                  [rounded]="true">
                </p-tag>
                <span class="grafica-fecha">{{ formatFecha(grafica.fechaModificacion) }}</span>
              </div>
            </div>

            <!-- Acciones -->
            <div class="grafica-acciones" (click)="$event.stopPropagation()">
              <p-button
                icon="pi pi-star"
                [rounded]="true"
                [text]="true"
                size="small"
                [severity]="grafica.favorito ? 'warn' : 'secondary'"
                (onClick)="toggleFavorito(grafica)"
                pTooltip="Favorito">
              </p-button>
              <p-button
                icon="pi pi-trash"
                [rounded]="true"
                [text]="true"
                size="small"
                severity="danger"
                (onClick)="confirmarEliminar(grafica)"
                pTooltip="Eliminar">
              </p-button>
            </div>
          </div>
        } @empty {
          <div class="graficas-vacio">
            <i class="pi pi-chart-bar"></i>
            <span>No hay gráficas guardadas</span>
            <small>Las gráficas que guardes aparecerán aquí</small>
          </div>
        }
      </div>

      <!-- Contador -->
      @if (modo !== 'compact') {
        <div class="graficas-footer">
          <span class="contador">
            {{ graficasFiltradas().length }} de {{ graficas().length }} gráficas
          </span>
        </div>
      }
    </div>

    <!-- Dialog de preview -->
    <p-dialog
      [header]="graficaSeleccionada()?.nombre || 'Vista previa'"
      [(visible)]="showPreviewDialog"
      [modal]="true"
      [style]="{width: '600px', maxWidth: '90vw'}"
      [draggable]="false"
      [resizable]="false">

      @if (graficaSeleccionada()) {
        <div class="preview-dialog-content">
          <div class="preview-info">
            <p-tag
              [value]="getLabelTipo(graficaSeleccionada()!.tipo)"
              [severity]="getSeverityTipo(graficaSeleccionada()!.tipo)">
            </p-tag>
            @if (graficaSeleccionada()!.descripcion) {
              <p class="preview-descripcion">{{ graficaSeleccionada()!.descripcion }}</p>
            }
          </div>

          <div class="preview-chart">
            <!-- Aquí iría el chart real con ApexCharts -->
            <div class="preview-placeholder">
              <i [class]="getIconoTipo(graficaSeleccionada()!.tipo)"></i>
              <span>Vista previa de {{ graficaSeleccionada()!.nombre }}</span>
            </div>
          </div>

          <div class="preview-meta">
            <div class="meta-item">
              <span class="meta-label">Creada:</span>
              <span class="meta-value">{{ formatFechaCompleta(graficaSeleccionada()!.fechaCreacion) }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Última modificación:</span>
              <span class="meta-value">{{ formatFechaCompleta(graficaSeleccionada()!.fechaModificacion) }}</span>
            </div>
          </div>
        </div>

        <ng-template pTemplate="footer">
          <p-button
            label="Cerrar"
            [text]="true"
            severity="secondary"
            (onClick)="showPreviewDialog = false">
          </p-button>
          <p-button
            label="Cargar en Dashboard"
            icon="pi pi-external-link"
            (onClick)="cargarEnDashboard()">
          </p-button>
        </ng-template>
      }
    </p-dialog>

    <p-confirmDialog></p-confirmDialog>
    <p-toast></p-toast>
  `,
  styles: [`
    .graficas-guardadas-widget {
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: var(--spacing-3);
    }

    .widget-header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--spacing-2);
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      flex: 1;
      padding: var(--spacing-2) var(--spacing-3);
      background: var(--surface-50);
      border: 1px solid var(--surface-200);
      border-radius: var(--border-radius-md);

      i {
        color: var(--text-color-secondary);
        font-size: var(--font-size-sm);
      }

      .search-input {
        flex: 1;
        border: none;
        background: transparent;
        font-size: var(--font-size-sm);
        color: var(--text-color);
        outline: none;

        &::placeholder {
          color: var(--text-color-secondary);
        }
      }
    }

    .filtros-rapidos {
      display: flex;
      gap: var(--spacing-2);
      flex-wrap: wrap;
    }

    .filtro-btn {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: var(--spacing-1) var(--spacing-3);
      background: var(--surface-100);
      border: 1px solid var(--surface-200);
      border-radius: var(--border-radius-md);
      font-size: var(--font-size-xs);
      color: var(--text-color-secondary);
      cursor: pointer;
      transition: all var(--transition-duration) var(--transition-timing);

      i {
        font-size: var(--font-size-xs);
      }

      &:hover {
        background: var(--surface-200);
        color: var(--text-color);
      }

      &.active {
        background: var(--primary-color);
        border-color: var(--primary-color);
        color: var(--primary-contrast-color);
      }
    }

    .graficas-lista {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
      overflow-y: auto;
      min-height: 0;
    }

    .compact-lista {
      .grafica-card {
        padding: var(--spacing-2);
      }

      .grafica-preview {
        width: 40px;
        height: 40px;
      }

      .grafica-info {
        .grafica-nombre {
          font-size: var(--font-size-xs);
        }
      }
    }

    .grafica-card {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      padding: var(--spacing-3);
      background: var(--surface-50);
      border: 1px solid var(--surface-200);
      border-radius: var(--border-radius-md);
      cursor: pointer;
      transition: all var(--transition-duration) var(--transition-timing);

      &:hover {
        background: var(--surface-100);
        border-color: var(--primary-300);

        .grafica-acciones {
          opacity: 1;
        }
      }

      &.favorita {
        border-left: 3px solid var(--amber-400);
      }
    }

    .grafica-preview {
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--surface-0);
      border: 1px solid var(--surface-200);
      border-radius: var(--border-radius-md);
      flex-shrink: 0;
    }

    .mini-bars {
      display: flex;
      align-items: flex-end;
      gap: 3px;
      height: 100%;
      padding: 8px;

      .mini-bar {
        flex: 1;
        background: var(--primary-color);
        border-radius: 2px;
        min-height: 4px;
      }
    }

    .mini-line, .mini-area {
      width: 100%;
      height: 100%;
      padding: 4px;
    }

    .mini-donut {
      width: 36px;
      height: 36px;
    }

    .mini-placeholder {
      i {
        font-size: var(--font-size-xl);
        color: var(--primary-color);
      }
    }

    .grafica-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1);
    }

    .grafica-nombre {
      display: flex;
      align-items: center;
      gap: var(--spacing-1);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      .star-icon {
        color: var(--amber-400);
        font-size: var(--font-size-xs);
      }
    }

    .grafica-descripcion {
      font-size: var(--font-size-xs);
      color: var(--text-color-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .grafica-meta {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
    }

    .grafica-fecha {
      font-size: var(--font-size-xs);
      color: var(--text-color-secondary);
    }

    .grafica-acciones {
      display: flex;
      gap: var(--spacing-1);
      opacity: 0;
      transition: opacity var(--transition-duration);
    }

    .graficas-vacio {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-8);
      text-align: center;
      color: var(--text-color-secondary);
      gap: var(--spacing-2);

      i {
        font-size: var(--font-size-4xl);
        color: var(--surface-300);
      }

      span {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
      }

      small {
        font-size: var(--font-size-xs);
      }
    }

    .graficas-footer {
      display: flex;
      justify-content: flex-end;
      padding-top: var(--spacing-2);
      border-top: 1px solid var(--surface-200);
    }

    .contador {
      font-size: var(--font-size-xs);
      color: var(--text-color-secondary);
    }

    // Preview Dialog
    .preview-dialog-content {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-4);
    }

    .preview-info {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
    }

    .preview-descripcion {
      margin: 0;
      font-size: var(--font-size-sm);
      color: var(--text-color-secondary);
    }

    .preview-chart {
      min-height: 250px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--surface-50);
      border: 1px solid var(--surface-200);
      border-radius: var(--border-radius-md);
    }

    .preview-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-2);
      color: var(--text-color-secondary);

      i {
        font-size: var(--font-size-4xl);
        color: var(--primary-color);
      }

      span {
        font-size: var(--font-size-sm);
      }
    }

    .preview-meta {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
      padding: var(--spacing-3);
      background: var(--surface-50);
      border-radius: var(--border-radius-md);
    }

    .meta-item {
      display: flex;
      gap: var(--spacing-2);
      font-size: var(--font-size-sm);

      .meta-label {
        color: var(--text-color-secondary);
      }

      .meta-value {
        color: var(--text-color);
        font-weight: var(--font-weight-medium);
      }
    }
  `]
})
export class GraficasGuardadasWidgetComponent implements OnInit {
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  @Input() modo: 'full' | 'compact' = 'full';
  @Input() limite: number = 10;

  @Output() graficaSeleccionadaEvt = new EventEmitter<GraficaGuardada>();
  @Output() cargarGraficaEvt = new EventEmitter<GraficaGuardada>();

  graficas = signal<GraficaGuardada[]>([]);
  filtro = signal('');
  categoriaActiva = signal<'todas' | 'favoritas' | 'recientes'>('todas');
  showPreviewDialog = false;
  graficaSeleccionada = signal<GraficaGuardada | null>(null);

  graficasFiltradas = computed(() => {
    let resultado = this.graficas();
    const filtroTexto = this.filtro().toLowerCase();
    const categoria = this.categoriaActiva();

    // Filtrar por texto
    if (filtroTexto) {
      resultado = resultado.filter(g =>
        g.nombre.toLowerCase().includes(filtroTexto) ||
        g.descripcion?.toLowerCase().includes(filtroTexto)
      );
    }

    // Filtrar por categoría
    switch (categoria) {
      case 'favoritas':
        resultado = resultado.filter(g => g.favorito);
        break;
      case 'recientes':
        resultado = resultado
          .sort((a, b) => new Date(b.fechaModificacion).getTime() - new Date(a.fechaModificacion).getTime())
          .slice(0, 5);
        break;
    }

    return resultado.slice(0, this.limite);
  });

  ngOnInit(): void {
    this.cargarGraficas();
  }

  cargarGraficas(): void {
    // Cargar desde localStorage o generar ejemplos
    const guardadas = localStorage.getItem('orca-graficas-guardadas');
    if (guardadas) {
      this.graficas.set(JSON.parse(guardadas));
    } else {
      this.graficas.set(this.generarEjemplos());
    }
  }

  seleccionarGrafica(grafica: GraficaGuardada): void {
    this.graficaSeleccionada.set(grafica);
    this.showPreviewDialog = true;
    this.graficaSeleccionadaEvt.emit(grafica);
  }

  toggleFavorito(grafica: GraficaGuardada): void {
    grafica.favorito = !grafica.favorito;
    this.guardarGraficas();
    this.messageService.add({
      severity: 'success',
      summary: grafica.favorito ? 'Añadido a favoritos' : 'Eliminado de favoritos',
      detail: grafica.nombre
    });
  }

  confirmarEliminar(grafica: GraficaGuardada): void {
    this.confirmationService.confirm({
      message: `¿Eliminar la gráfica "${grafica.nombre}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.graficas.update(g => g.filter(item => item.id !== grafica.id));
        this.guardarGraficas();
        this.messageService.add({
          severity: 'info',
          summary: 'Eliminada',
          detail: 'Gráfica eliminada correctamente'
        });
      }
    });
  }

  cargarEnDashboard(): void {
    const grafica = this.graficaSeleccionada();
    if (grafica) {
      this.cargarGraficaEvt.emit(grafica);
      this.showPreviewDialog = false;
      this.messageService.add({
        severity: 'success',
        summary: 'Gráfica cargada',
        detail: `${grafica.nombre} cargada en el dashboard`
      });
    }
  }

  guardarGraficas(): void {
    localStorage.setItem('orca-graficas-guardadas', JSON.stringify(this.graficas()));
  }

  getIconoTipo(tipo: string): string {
    const iconos: Record<string, string> = {
      bar: 'pi pi-chart-bar',
      line: 'pi pi-chart-line',
      donut: 'pi pi-chart-pie',
      pie: 'pi pi-chart-pie',
      area: 'pi pi-chart-line',
      radar: 'pi pi-compass',
      heatmap: 'pi pi-th-large'
    };
    return iconos[tipo] || 'pi pi-chart-bar';
  }

  getLabelTipo(tipo: string): string {
    const labels: Record<string, string> = {
      bar: 'Barras',
      line: 'Líneas',
      donut: 'Dona',
      pie: 'Circular',
      area: 'Área',
      radar: 'Radar',
      heatmap: 'Mapa calor'
    };
    return labels[tipo] || tipo;
  }

  getSeverityTipo(tipo: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
    const severities: Record<string, 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined> = {
      bar: 'info',
      line: 'success',
      donut: 'warn',
      pie: 'warn',
      area: 'info',
      radar: 'secondary',
      heatmap: 'danger'
    };
    return severities[tipo] || 'secondary';
  }

  formatFecha(fecha: Date | string): string {
    const d = new Date(fecha);
    const ahora = new Date();
    const diff = ahora.getTime() - d.getTime();
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (dias === 0) return 'Hoy';
    if (dias === 1) return 'Ayer';
    if (dias < 7) return `Hace ${dias} días`;
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }

  formatFechaCompleta(fecha: Date | string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getMiniLinePoints(series: number[]): string {
    const maxVal = Math.max(...series);
    const width = 100;
    const height = 40;
    const padding = 4;

    return series.map((val, i) => {
      const x = padding + (i * (width - padding * 2) / (series.length - 1));
      const y = height - padding - ((val / maxVal) * (height - padding * 2));
      return `${x},${y}`;
    }).join(' ');
  }

  getMiniAreaPoints(series: number[]): string {
    const linePoints = this.getMiniLinePoints(series);
    const width = 100;
    const height = 40;
    const padding = 4;
    return `${padding},${height - padding} ${linePoints} ${width - padding},${height - padding}`;
  }

  private generarEjemplos(): GraficaGuardada[] {
    const ahora = new Date();
    return [
      {
        id: 'g1',
        nombre: 'Cumplimiento por Proceso',
        descripcion: 'Comparativa de cumplimiento de todos los procesos',
        tipo: 'bar',
        fechaCreacion: new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000),
        fechaModificacion: new Date(ahora.getTime() - 1 * 24 * 60 * 60 * 1000),
        favorito: true,
        config: { series: [], labels: [] },
        preview: { miniSeries: [75, 82, 65, 90, 78], miniLabels: [] }
      },
      {
        id: 'g2',
        nombre: 'Tendencia Mensual',
        descripcion: 'Evolución del cumplimiento en los últimos 6 meses',
        tipo: 'line',
        fechaCreacion: new Date(ahora.getTime() - 14 * 24 * 60 * 60 * 1000),
        fechaModificacion: new Date(ahora.getTime() - 2 * 24 * 60 * 60 * 1000),
        favorito: false,
        config: { series: [], labels: [] },
        preview: { miniSeries: [60, 65, 70, 68, 75, 80], miniLabels: [] }
      },
      {
        id: 'g3',
        nombre: 'Distribución de Alertas',
        descripcion: 'Alertas por severidad',
        tipo: 'donut',
        fechaCreacion: new Date(ahora.getTime() - 5 * 24 * 60 * 60 * 1000),
        fechaModificacion: ahora,
        favorito: true,
        config: { series: [], labels: [] },
        preview: { miniSeries: [30, 45, 25], miniLabels: ['Críticas', 'Warning', 'Info'] }
      },
      {
        id: 'g4',
        nombre: 'Evolución Riesgos',
        descripcion: 'Área de riesgos a lo largo del tiempo',
        tipo: 'area',
        fechaCreacion: new Date(ahora.getTime() - 10 * 24 * 60 * 60 * 1000),
        fechaModificacion: new Date(ahora.getTime() - 3 * 24 * 60 * 60 * 1000),
        favorito: false,
        config: { series: [], labels: [] },
        preview: { miniSeries: [20, 35, 30, 45, 40, 55], miniLabels: [] }
      }
    ];
  }
}
