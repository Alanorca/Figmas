import { Injectable, signal, computed, effect } from '@angular/core';

export type DsTheme = 'light' | 'dark';

/**
 * Design System Theme Service
 *
 * Manages theme state independently from the main app ThemeService.
 * - Uses separate localStorage key ('orca-ds-theme')
 * - Does NOT use browser prefers-color-scheme (ignores browser preference)
 * - Applies data-ds-theme attribute to body for PrimeNG overlay handling
 */
@Injectable({
  providedIn: 'root'
})
export class DsThemeService {
  private readonly STORAGE_KEY = 'orca-ds-theme';

  // Signal for current DS theme
  currentTheme = signal<DsTheme>(this.getInitialTheme());

  // Computed for easy checks
  isDarkMode = computed(() => this.currentTheme() === 'dark');

  constructor() {
    // Effect to apply body attribute when theme changes
    effect(() => {
      const theme = this.currentTheme();
      this.applyTheme(theme);
    });
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    const newTheme: DsTheme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Set theme explicitly
   */
  setTheme(theme: DsTheme): void {
    this.currentTheme.set(theme);
    localStorage.setItem(this.STORAGE_KEY, theme);
  }

  /**
   * Apply theme to body element for PrimeNG overlay handling
   */
  private applyTheme(theme: DsTheme): void {
    if (typeof document !== 'undefined') {
      document.body.setAttribute('data-ds-theme', theme);
    }
  }

  /**
   * Remove body attribute when leaving DS routes
   */
  cleanup(): void {
    if (typeof document !== 'undefined') {
      document.body.removeAttribute('data-ds-theme');
    }
  }

  /**
   * Gets initial theme from localStorage only
   * Intentionally does NOT use prefers-color-scheme (per requirement)
   */
  private getInitialTheme(): DsTheme {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(this.STORAGE_KEY) as DsTheme | null;
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    }
    // Default to light if no preference stored
    return 'light';
  }
}
