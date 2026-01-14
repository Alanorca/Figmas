/**
 * ComplianceResults Component
 *
 * Componente para mostrar los resultados de compliance de un cuestionario.
 * Incluye:
 * - Barra de progreso de completado
 * - Score total con semáforo de colores
 * - Desglose por secciones
 */

import { Component, Input, computed, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { AccordionModule } from 'primeng/accordion';

import { Seccion, RespuestaPregunta } from '../../models/cuestionarios.models';
import {
  calculateGlobalCompliance,
  respuestasToMap,
  ComplianceResult,
  SectionScoreResult
} from '../../utils/scoring.utils';
import {
  evaluateThreshold,
  Umbrales,
  DEFAULT_UMBRALES,
  ThresholdResult,
  getProgressToNextLevel
} from '../../utils/thresholds.utils';

@Component({
  selector: 'app-compliance-results',
  standalone: true,
  imports: [
    CommonModule,
    ProgressBarModule,
    TagModule,
    TooltipModule,
    CardModule,
    DividerModule,
    AccordionModule
  ],
  templateUrl: './compliance-results.html',
  styleUrl: './compliance-results.scss'
})
export class ComplianceResultsComponent implements OnChanges {
  // Inputs
  @Input() secciones: Seccion[] = [];
  @Input() respuestas: RespuestaPregunta[] = [];
  @Input() umbrales: Umbrales = DEFAULT_UMBRALES;
  @Input() showSectionBreakdown: boolean = true;
  @Input() compact: boolean = false;

  // Estado interno
  complianceResult = signal<ComplianceResult | null>(null);
  thresholdResult = signal<ThresholdResult | null>(null);

  // Computed values
  globalScore = computed(() => this.complianceResult()?.globalScore ?? 0);

  progressPercentage = computed(() =>
    this.complianceResult()?.progress.percentage ?? 0
  );

  answeredFields = computed(() =>
    this.complianceResult()?.progress.answeredFields ?? 0
  );

  totalFields = computed(() =>
    this.complianceResult()?.progress.totalFields ?? 0
  );

  requiredAnswered = computed(() =>
    this.complianceResult()?.progress.requiredAnswered ?? 0
  );

  requiredTotal = computed(() =>
    this.complianceResult()?.progress.requiredTotal ?? 0
  );

  sectionScores = computed(() =>
    this.complianceResult()?.sectionScores ?? []
  );

  progressToNext = computed(() => {
    const score = this.globalScore();
    return getProgressToNextLevel(score, this.umbrales);
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['secciones'] || changes['respuestas'] || changes['umbrales']) {
      this.calculateResults();
    }
  }

  private calculateResults(): void {
    if (!this.secciones || this.secciones.length === 0) {
      this.complianceResult.set(null);
      this.thresholdResult.set(null);
      return;
    }

    const respuestasMap = respuestasToMap(this.respuestas);
    const result = calculateGlobalCompliance(this.secciones, respuestasMap);

    this.complianceResult.set(result);
    this.thresholdResult.set(evaluateThreshold(result.globalScore, this.umbrales));
  }

  // Helper para obtener threshold de una sección
  getSectionThreshold(sectionScore: SectionScoreResult): ThresholdResult {
    return evaluateThreshold(sectionScore.score, this.umbrales);
  }

  // Helper para el color del progress bar
  getProgressBarColor(): string {
    const threshold = this.thresholdResult();
    return threshold?.color ?? '#6b7280';
  }

  // Helper para el estilo del score badge
  getScoreBadgeStyle(): Record<string, string> {
    const threshold = this.thresholdResult();
    if (!threshold) {
      return {
        backgroundColor: '#f3f4f6',
        color: '#6b7280'
      };
    }
    return {
      backgroundColor: threshold.bgColor,
      color: threshold.color,
      borderColor: threshold.borderColor
    };
  }
}
