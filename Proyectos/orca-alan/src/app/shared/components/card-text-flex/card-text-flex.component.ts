// ============================================================================
// CARD TEXT FLEX COMPONENT
// ============================================================================
// Componente de tarjeta flexible con texto basado en diseño Figma
// Soporta header, avatar, body, link y footer con iconos
// ============================================================================

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';

export interface CardTextFlexConfig {
  showAvatar?: boolean;
  showHeader?: boolean;
  showHeaderCard?: boolean;
  showBodyCard?: boolean;
  showBody?: boolean;
  showLink?: boolean;
  showFooter?: boolean;
  showFooterText?: boolean;
  showFooterIcon?: boolean;
  showIconHeader1?: boolean;
  showIconHeader2?: boolean;
}

export type CardTextFlexStyle = 'standard' | 'elevated' | 'outlined';

@Component({
  selector: 'app-card-text-flex',
  standalone: true,
  imports: [CommonModule, ButtonModule, AvatarModule, TooltipModule],
  template: `
    <div
      class="card-text-flex"
      [class.card-text-flex--elevated]="cardStyle === 'elevated'"
      [class.card-text-flex--outlined]="cardStyle === 'outlined'"
      [class.card-text-flex--clickable]="clickable"
      (click)="clickable && onCardClick.emit($event)">

      <!-- Header -->
      @if (config.showHeaderCard !== false) {
        <div class="card-text-flex__header">
          <!-- Avatar -->
          @if (config.showAvatar !== false && (avatarImage || avatarIcon || avatarLabel)) {
            <div class="card-text-flex__avatar">
              <p-avatar
                [image]="avatarImage"
                [icon]="avatarIcon"
                [label]="avatarLabel"
                size="normal"
                [shape]="avatarShape"
                [style]="{ 'background-color': avatarBgColor, 'color': avatarColor }">
              </p-avatar>
            </div>
          }

          <!-- Title Area -->
          @if (config.showHeader !== false) {
            <div class="card-text-flex__title-area">
              @if (title) {
                <h4 class="card-text-flex__title">{{ title }}</h4>
              }
              @if (subtitle) {
                <span class="card-text-flex__subtitle">{{ subtitle }}</span>
              }
            </div>
          }

          <!-- Header Icons -->
          <div class="card-text-flex__header-actions">
            @if (config.showIconHeader1 !== false && iconHeader1) {
              <button
                pButton
                [icon]="iconHeader1"
                [pTooltip]="iconHeader1Tooltip"
                class="p-button-text p-button-rounded p-button-sm"
                (click)="onIconHeader1Click.emit($event); $event.stopPropagation()">
              </button>
            }
            @if (config.showIconHeader2 && iconHeader2) {
              <button
                pButton
                [icon]="iconHeader2"
                [pTooltip]="iconHeader2Tooltip"
                class="p-button-text p-button-rounded p-button-sm"
                (click)="onIconHeader2Click.emit($event); $event.stopPropagation()">
              </button>
            }
          </div>
        </div>
      }

      <!-- Body -->
      @if (config.showBodyCard !== false) {
        <div class="card-text-flex__body">
          @if (config.showBody !== false && bodyText) {
            <p class="card-text-flex__body-text">{{ bodyText }}</p>
          }

          <!-- Projected Content -->
          <ng-content></ng-content>

          <!-- Link -->
          @if (config.showLink !== false && linkText) {
            <a
              class="card-text-flex__link"
              (click)="onLinkClick.emit($event); $event.stopPropagation()">
              @if (linkIcon) {
                <i [class]="linkIcon"></i>
              }
              {{ linkText }}
            </a>
          }
        </div>
      }

      <!-- Footer -->
      @if (config.showFooter) {
        <div class="card-text-flex__footer">
          @if (config.showFooterIcon && footerIcon) {
            <i [class]="footerIcon + ' card-text-flex__footer-icon'"></i>
          }
          @if (config.showFooterText !== false && footerText) {
            <span class="card-text-flex__footer-text">{{ footerText }}</span>
          }
          <ng-content select="[card-footer]"></ng-content>
        </div>
      }
    </div>
  `,
  styles: [`
    .card-text-flex {
      display: flex;
      flex-direction: column;
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: 6px;
      overflow: hidden;
      transition: all var(--transition-duration) var(--transition-timing);

      &:hover {
        border-color: var(--surface-400);
      }

      &--elevated {
        border: none;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

        &:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        }
      }

      &--outlined {
        background: transparent;
        border: 1px solid var(--surface-border);
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
    :host-context(:root.dark-mode) .card-text-flex,
    :host-context([data-theme="dark"]) .card-text-flex {
      border-color: var(--surface-700);
      background: var(--surface-800);

      &:hover {
        border-color: var(--surface-600);
      }

      &--elevated {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

        &:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
        }
      }

      &--clickable:hover {
        background: var(--surface-700);
        border-color: var(--primary-700);
      }
    }

    .card-text-flex__header {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      padding: var(--spacing-3) var(--spacing-4);
      border-bottom: 1px solid var(--surface-border);
    }

    :host-context(:root.dark-mode) .card-text-flex__header,
    :host-context([data-theme="dark"]) .card-text-flex__header {
      border-color: var(--surface-700);
    }

    .card-text-flex__avatar {
      flex-shrink: 0;
    }

    .card-text-flex__title-area {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .card-text-flex__title {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--text-color);
      margin: 0;
      line-height: 1.3;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .card-text-flex__subtitle {
      font-size: var(--font-size-xs);
      color: var(--text-color-secondary);
      line-height: 1.3;
    }

    .card-text-flex__header-actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-1);
      flex-shrink: 0;

      :host ::ng-deep .p-button {
        width: 28px;
        height: 28px;

        &.p-button-text {
          color: var(--text-color-secondary);

          &:hover {
            color: var(--text-color);
            background: var(--surface-100);
          }
        }
      }
    }

    :host-context(:root.dark-mode) .card-text-flex__header-actions,
    :host-context([data-theme="dark"]) .card-text-flex__header-actions {
      :host ::ng-deep .p-button.p-button-text:hover {
        background: var(--surface-700);
      }
    }

    .card-text-flex__body {
      flex: 1;
      padding: var(--spacing-3) var(--spacing-4);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
    }

    .card-text-flex__body-text {
      font-size: var(--font-size-sm);
      color: var(--text-color);
      line-height: 1.5;
      margin: 0;
    }

    .card-text-flex__link {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-1);
      font-size: var(--font-size-xs);
      color: var(--primary-color);
      cursor: pointer;
      text-decoration: none;
      transition: color var(--transition-duration);
      width: fit-content;

      i {
        font-size: var(--font-size-xs);
      }

      &:hover {
        color: var(--primary-700);
        text-decoration: underline;
      }
    }

    .card-text-flex__footer {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      padding: var(--spacing-2) var(--spacing-4);
      border-top: 1px solid var(--surface-border);
      background: var(--surface-50);
    }

    :host-context(:root.dark-mode) .card-text-flex__footer,
    :host-context([data-theme="dark"]) .card-text-flex__footer {
      border-color: var(--surface-700);
      background: var(--surface-900);
    }

    .card-text-flex__footer-icon {
      font-size: var(--font-size-xs);
      color: var(--text-color-secondary);
    }

    .card-text-flex__footer-text {
      font-size: var(--font-size-xs);
      color: var(--text-color-secondary);
    }
  `]
})
export class CardTextFlexComponent {
  // Avatar
  @Input() avatarImage?: string;
  @Input() avatarIcon?: string;
  @Input() avatarLabel?: string;
  @Input() avatarShape: 'square' | 'circle' = 'circle';
  @Input() avatarBgColor?: string;
  @Input() avatarColor?: string;

  // Header
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() iconHeader1?: string;
  @Input() iconHeader1Tooltip?: string;
  @Input() iconHeader2?: string;
  @Input() iconHeader2Tooltip?: string;

  // Body
  @Input() bodyText?: string;

  // Link
  @Input() linkText?: string;
  @Input() linkIcon?: string;

  // Footer
  @Input() footerText?: string;
  @Input() footerIcon?: string;

  // Style
  @Input() cardStyle: CardTextFlexStyle = 'standard';
  @Input() clickable = false;

  // Config
  @Input() config: CardTextFlexConfig = {
    showAvatar: true,
    showHeader: true,
    showHeaderCard: true,
    showBodyCard: true,
    showBody: true,
    showLink: true,
    showFooter: false,
    showFooterText: true,
    showFooterIcon: true,
    showIconHeader1: false,
    showIconHeader2: false
  };

  // Events
  @Output() onCardClick = new EventEmitter<Event>();
  @Output() onLinkClick = new EventEmitter<Event>();
  @Output() onIconHeader1Click = new EventEmitter<Event>();
  @Output() onIconHeader2Click = new EventEmitter<Event>();
}
