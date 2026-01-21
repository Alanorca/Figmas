import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'orca-theme';

  // Signal reactivo para el tema actual
  currentTheme = signal<Theme>(this.getInitialTheme());

  // Computed para saber si es dark mode
  isDarkMode = () => this.currentTheme() === 'dark';

  constructor() {
    // Effect que aplica el tema cuando cambia
    effect(() => {
      this.applyTheme(this.currentTheme());
    });
  }

  /**
   * Alterna entre light y dark mode
   */
  toggleTheme(): void {
    const newTheme: Theme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Establece un tema específico
   */
  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    localStorage.setItem(this.STORAGE_KEY, theme);
  }

  /**
   * Obtiene el tema inicial desde localStorage o preferencia del sistema
   */
  private getInitialTheme(): Theme {
    // Primero intentar localStorage
    const stored = localStorage.getItem(this.STORAGE_KEY) as Theme | null;
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }

    // Si no hay preferencia guardada, usar preferencia del sistema
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    return 'light';
  }

  /**
   * Aplica el tema al documento
   */
  private applyTheme(theme: Theme): void {
    const root = document.documentElement;

    if (theme === 'dark') {
      // Agregar ambas clases para compatibilidad con diferentes selectores
      // Algunos componentes usan .dark, otros .dark-mode
      root.classList.add('dark-mode', 'dark');
      root.classList.remove('light-mode', 'light');
    } else {
      root.classList.add('light-mode', 'light');
      root.classList.remove('dark-mode', 'dark');
    }

    // También actualizar el atributo data-theme para compatibilidad
    root.setAttribute('data-theme', theme);
  }
}
