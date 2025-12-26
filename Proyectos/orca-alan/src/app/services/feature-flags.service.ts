import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FeatureFlagsService {
  // Estado del toggle - OFF por defecto (solo features estables)
  private _devMode = signal<boolean>(false);

  // Señal pública de solo lectura
  readonly isDevMode = this._devMode.asReadonly();

  // Features en desarrollo (no visibles cuando devMode está OFF)
  private readonly devFeatures = new Set<string>([
    '/controles',
    '/results-ml'
  ]);

  constructor() {
    // Recuperar estado guardado en localStorage
    const saved = localStorage.getItem('orca-dev-mode');
    if (saved === 'true') {
      this._devMode.set(true);
    }
  }

  /**
   * Alterna el modo desarrollo ON/OFF
   */
  toggleDevMode(): void {
    const newValue = !this._devMode();
    this._devMode.set(newValue);
    localStorage.setItem('orca-dev-mode', String(newValue));
  }

  /**
   * Verifica si una ruta/feature está disponible
   * @param route - La ruta a verificar (ej: '/controles')
   * @returns true si la feature debe mostrarse
   */
  isFeatureEnabled(route: string): boolean {
    // Si es una feature en desarrollo, solo mostrar si devMode está ON
    if (this.devFeatures.has(route)) {
      return this._devMode();
    }
    // Features estables siempre visibles
    return true;
  }

  /**
   * Agrega una feature a la lista de desarrollo
   */
  addDevFeature(route: string): void {
    this.devFeatures.add(route);
  }

  /**
   * Remueve una feature de la lista de desarrollo (la hace estable)
   */
  promoteToStable(route: string): void {
    this.devFeatures.delete(route);
  }

  /**
   * Obtiene la lista de features en desarrollo
   */
  getDevFeatures(): string[] {
    return Array.from(this.devFeatures);
  }
}
