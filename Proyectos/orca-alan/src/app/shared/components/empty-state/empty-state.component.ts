import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

/**
 * Componente reutilizable para estados vacíos
 *
 * @example
 * ```html
 * <app-empty-state
 *   icon="pi pi-inbox"
 *   title="No hay registros"
 *   message="Comienza creando tu primer registro"
 *   actionLabel="Crear nuevo"
 *   (actionClick)="onCreate()"
 * />
 * ```
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
})
export class EmptyStateComponent {
  /** Clase del icono (PrimeIcons) */
  icon = input<string>('pi pi-inbox');

  /** Título principal */
  title = input<string>('No hay datos');

  /** Mensaje descriptivo */
  message = input<string>('');

  /** Texto del botón de acción (opcional) */
  actionLabel = input<string>('');

  /** Icono del botón de acción */
  actionIcon = input<string>('pi pi-plus');

  /** Variante visual: 'default' | 'compact' | 'card' */
  variant = input<'default' | 'compact' | 'card'>('default');

  /** Callback cuando se hace click en la acción */
  actionClick = input<() => void>();

  onActionClick(): void {
    const callback = this.actionClick();
    if (callback) {
      callback();
    }
  }
}
