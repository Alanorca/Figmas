import { Component, input, output, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressBarModule } from 'primeng/progressbar';
import { AccordionModule } from 'primeng/accordion';
import { DrillDownData, DesgloseCumplimiento, KPIDesglose } from '../amcharts.models';

@Component({
  selector: 'app-amcharts-drilldown',
  standalone: true,
  imports: [
    CommonModule,
    DrawerModule,
    DividerModule,
    TagModule,
    ButtonModule,
    TooltipModule,
    ProgressBarModule,
    AccordionModule
  ],
  templateUrl: './amcharts-drilldown.html',
  styleUrl: './amcharts-drilldown.scss'
})
export class AMChartsDrilldownComponent {
  private router = inject(Router);

  // Inputs
  visible = input<boolean>(false);
  data = input<DrillDownData | null>(null);

  // Outputs
  visibleChange = output<boolean>();
  navegarADetalle = output<string>();

  // Internal state
  objetivoExpandido = signal<string | null>(null);

  // Computed
  cumplimientoGeneral = computed(() => {
    const drillData = this.data();
    return drillData?.cumplimientoGeneral || 0;
  });

  alertasCount = computed(() => {
    const drillData = this.data();
    if (!drillData) return { critical: 0, warning: 0, total: 0 };

    let critical = 0;
    let warning = 0;

    drillData.desglose.forEach(obj => {
      obj.kpis.forEach(kpi => {
        if (kpi.alertaActiva) {
          if (kpi.severidadAlerta === 'critical') critical++;
          else if (kpi.severidadAlerta === 'warning') warning++;
        }
      });
    });

    return { critical, warning, total: critical + warning };
  });

  // Methods
  onHide(): void {
    this.visibleChange.emit(false);
  }

  toggleObjetivo(objetivoId: string): void {
    this.objetivoExpandido.update(current =>
      current === objetivoId ? null : objetivoId
    );
  }

  isObjetivoExpandido(objetivoId: string): boolean {
    return this.objetivoExpandido() === objetivoId;
  }

  navegarAlProceso(): void {
    const drillData = this.data();
    if (drillData) {
      this.navegarADetalle.emit(drillData.procesoId);
      this.router.navigate(['/procesos', drillData.procesoId, 'objetivos-kpis']);
      this.onHide();
    }
  }

  getCumplimientoClass(valor: number): string {
    if (valor >= 85) return 'progreso-excelente';
    if (valor >= 70) return 'progreso-bueno';
    if (valor >= 50) return 'progreso-regular';
    return 'progreso-bajo';
  }

  getCumplimientoColor(valor: number): string {
    if (valor >= 85) return '#10b981';
    if (valor >= 70) return '#3b82f6';
    if (valor >= 50) return '#f59e0b';
    return '#ef4444';
  }

  getAlertaSeverity(severity: string | undefined): 'danger' | 'warn' | 'info' | 'secondary' {
    const map: Record<string, 'danger' | 'warn' | 'info'> = {
      'critical': 'danger',
      'warning': 'warn',
      'info': 'info'
    };
    return severity ? map[severity] || 'secondary' : 'secondary';
  }

  getTendenciaIcon(tendencia: string): string {
    switch (tendencia) {
      case 'up': return 'pi pi-arrow-up';
      case 'down': return 'pi pi-arrow-down';
      default: return 'pi pi-minus';
    }
  }

  getTendenciaClass(tendencia: string): string {
    switch (tendencia) {
      case 'up': return 'tendencia-up';
      case 'down': return 'tendencia-down';
      default: return 'tendencia-neutral';
    }
  }

  // Helper for template - cap value at max
  minVal(valor: number, max: number): number {
    return Math.min(valor, max);
  }
}
