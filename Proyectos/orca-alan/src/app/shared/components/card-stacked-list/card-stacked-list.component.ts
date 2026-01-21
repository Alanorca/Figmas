// ============================================================================
// CARD STACKED LIST COMPONENT
// ============================================================================
// Componente de tarjeta para listas apiladas basado en diseño Figma
// Soporta avatar, título, subtítulo, cuerpo, links, botones e iconos
// ============================================================================

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';

export interface CardStackedListConfig {
  showAvatar?: boolean;
  showButton?: boolean;
  showText?: boolean;
  showLink?: boolean;
  showBody?: boolean;
  showFooter?: boolean;
  showIconRight1?: boolean;
  showIconRight2?: boolean;
}

@Component({
  selector: 'app-card-stacked-list',
  standalone: true,
  imports: [CommonModule, ButtonModule, AvatarModule, TooltipModule],
  template: `
    <div class="card-stacked" [class.card-stacked--clickable]="clickable">
      <!-- Avatar -->
      @if (config.showAvatar !== false && (avatarImage || avatarIcon || avatarLabel)) {
        <div class="card-stacked__avatar">
          <p-avatar
            [image]="avatarImage"
            [icon]="avatarIcon"
            [label]="avatarLabel"
            [size]="avatarSize"
            [shape]="avatarShape"
            [style]="{ 'background-color': avatarBgColor, 'color': avatarColor }">
          </p-avatar>
        </div>
      }

      <!-- Content -->
      <div class="card-stacked__content">
        <!-- Header: Title & Subtitle -->
        <div class="card-stacked__header">
          @if (title) {
            <span class="card-stacked__title">{{ title }}</span>
          }
          @if (subtitle) {
            <span class="card-stacked__subtitle">{{ subtitle }}</span>
          }
        </div>

        <!-- Body Text -->
        @if (config.showBody !== false && body) {
          <p class="card-stacked__body">{{ body }}</p>
        }

        <!-- Link -->
        @if (config.showLink !== false && linkText) {
          <a class="card-stacked__link" (click)="onLinkClick.emit($event)">
            {{ linkText }}
          </a>
        }

        <!-- Footer -->
        @if (config.showFooter && footerContent) {
          <div class="card-stacked__footer">
            <ng-content select="[card-footer]"></ng-content>
            @if (!hasFooterContent) {
              <span class="card-stacked__footer-text">{{ footerContent }}</span>
            }
          </div>
        }
      </div>

      <!-- Actions -->
      <div class="card-stacked__actions">
        <!-- Icons Right -->
        @if (config.showIconRight1 !== false && iconRight1) {
          <button
            pButton
            [icon]="iconRight1"
            [pTooltip]="iconRight1Tooltip"
            class="p-button-text p-button-rounded p-button-sm"
            (click)="onIconRight1Click.emit($event)">
          </button>
        }

        @if (config.showIconRight2 && iconRight2) {
          <button
            pButton
            [icon]="iconRight2"
            [pTooltip]="iconRight2Tooltip"
            class="p-button-text p-button-rounded p-button-sm"
            (click)="onIconRight2Click.emit($event)">
          </button>
        }

        <!-- Button -->
        @if (config.showButton && buttonLabel) {
          <p-button
            [label]="buttonLabel"
            [icon]="buttonIcon"
            [severity]="buttonSeverity"
            [outlined]="buttonOutlined"
            size="small"
            (onClick)="onButtonClick.emit($event)">
          </p-button>
        }
      </div>
    </div>
  `,
  styles: [`
    .card-stacked {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-3);
      padding: var(--spacing-3) var(--spacing-4);
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: 12px;
      transition: all var(--transition-duration) var(--transition-timing);

      &:hover {
        border-color: var(--surface-400);
      }

      &--clickable {
        cursor: pointer;

        &:hover {
          background: var(--surface-hover);
          border-color: var(--primary-200);
        }

        &:active {
          background: var(--surface-100);
        }
      }
    }

    // Dark mode
    :host-context(:root.dark-mode) .card-stacked,
    :host-context([data-theme="dark"]) .card-stacked {
      border-color: var(--surface-700);
      background: var(--surface-800);

      &:hover {
        border-color: var(--surface-600);
      }

      &--clickable:hover {
        background: var(--surface-700);
        border-color: var(--primary-700);
      }
    }

    .card-stacked__avatar {
      flex-shrink: 0;
    }

    .card-stacked__content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1);
    }

    .card-stacked__header {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .card-stacked__title {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--text-color);
      line-height: 1.3;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .card-stacked__subtitle {
      font-size: var(--font-size-xs);
      color: var(--text-color-secondary);
      line-height: 1.3;
    }

    .card-stacked__body {
      font-size: var(--font-size-xs);
      color: var(--text-color-secondary);
      line-height: 1.4;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-stacked__link {
      font-size: var(--font-size-xs);
      color: var(--primary-color);
      cursor: pointer;
      text-decoration: none;
      transition: color var(--transition-duration);

      &:hover {
        color: var(--primary-700);
        text-decoration: underline;
      }
    }

    .card-stacked__footer {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      margin-top: var(--spacing-2);
      padding-top: var(--spacing-2);
      border-top: 1px solid var(--surface-border);
    }

    .card-stacked__footer-text {
      font-size: var(--font-size-xs);
      color: var(--text-color-secondary);
    }

    .card-stacked__actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-1);
      flex-shrink: 0;

      :host ::ng-deep .p-button {
        width: 32px;
        height: 32px;

        &.p-button-text {
          color: var(--text-color-secondary);

          &:hover {
            color: var(--text-color);
            background: var(--surface-100);
          }
        }
      }
    }

    :host-context(:root.dark-mode) .card-stacked__actions,
    :host-context([data-theme="dark"]) .card-stacked__actions {
      :host ::ng-deep .p-button.p-button-text:hover {
        background: var(--surface-700);
      }
    }
  `]
})
export class CardStackedListComponent {
  // Avatar
  @Input() avatarImage?: string;
  @Input() avatarIcon?: string;
  @Input() avatarLabel?: string;
  @Input() avatarSize: 'normal' | 'large' | 'xlarge' = 'normal';
  @Input() avatarShape: 'square' | 'circle' = 'circle';
  @Input() avatarBgColor?: string;
  @Input() avatarColor?: string;

  // Content
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() body?: string;
  @Input() linkText?: string;
  @Input() footerContent?: string;

  // Icons
  @Input() iconRight1?: string;
  @Input() iconRight1Tooltip?: string;
  @Input() iconRight2?: string;
  @Input() iconRight2Tooltip?: string;

  // Button
  @Input() buttonLabel?: string;
  @Input() buttonIcon?: string;
  @Input() buttonSeverity: 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'help' | 'contrast' = 'primary';
  @Input() buttonOutlined = false;

  // Config
  @Input() config: CardStackedListConfig = {
    showAvatar: true,
    showButton: false,
    showText: true,
    showLink: true,
    showBody: true,
    showFooter: false,
    showIconRight1: true,
    showIconRight2: false
  };

  @Input() clickable = false;

  // Events
  @Output() onLinkClick = new EventEmitter<Event>();
  @Output() onButtonClick = new EventEmitter<Event>();
  @Output() onIconRight1Click = new EventEmitter<Event>();
  @Output() onIconRight2Click = new EventEmitter<Event>();
  @Output() onCardClick = new EventEmitter<Event>();

  hasFooterContent = false;
}
