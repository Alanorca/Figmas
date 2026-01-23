/**
 * Data Board Components
 *
 * Conjunto de componentes reutilizables para visualizacion de datos
 * y dashboards ejecutivos siguiendo patrones del Design System de ORCA.
 */

// Risk Map Component
export { RiskMapComponent } from './risk-map/risk-map';
export type { RiskPoint, RiskMapPalette } from './risk-map/risk-map';

// KPI Card Component
export { KpiCardComponent } from './kpi-card/kpi-card';
export type { KpiCardConfig, KpiCardVariant, KpiTrend } from './kpi-card/kpi-card';

// Chart Container Component
export { ChartContainerComponent } from './chart-container/chart-container';
export type { DecisionLevel, ChartMenuOption, ChartFilter } from './chart-container/chart-container';

// Objective Progress Component
export { ObjectiveProgressComponent } from './objective-progress/objective-progress';
export type { ObjectiveData, ObjectiveKpi } from './objective-progress/objective-progress';

/**
 * Convenience array for importing all Data Board components
 */
export const DATA_BOARD_COMPONENTS = [
  // Dynamic imports will be resolved by Angular
] as const;
