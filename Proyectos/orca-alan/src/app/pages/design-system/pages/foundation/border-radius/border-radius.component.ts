import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DsCodeBlockComponent } from '../../../components/ds-code-block/ds-code-block.component';

interface RadiusToken {
  name: string;
  variable: string;
  value: string;
  useCase: string;
}

@Component({
  selector: 'app-ds-border-radius',
  standalone: true,
  imports: [CommonModule, DsCodeBlockComponent],
  templateUrl: './border-radius.component.html',
  styleUrl: './border-radius.component.scss'
})
export class BorderRadiusComponent {
  radiusTokens: RadiusToken[] = [
    {
      name: 'None',
      variable: '--border-radius-none',
      value: '0',
      useCase: 'No rounding'
    },
    {
      name: 'XS',
      variable: '--border-radius-xs',
      value: '0.125rem',
      useCase: 'Subtle rounding (2px)'
    },
    {
      name: 'SM',
      variable: '--border-radius-sm',
      value: '0.25rem',
      useCase: 'Small elements, tags (4px)'
    },
    {
      name: 'Base',
      variable: '--border-radius',
      value: '0.375rem',
      useCase: 'Default for buttons, inputs (6px)'
    },
    {
      name: 'MD',
      variable: '--border-radius-md',
      value: '0.5rem',
      useCase: 'Cards, panels (8px)'
    },
    {
      name: 'LG',
      variable: '--border-radius-lg',
      value: '0.75rem',
      useCase: 'Large cards, modals (12px)'
    },
    {
      name: 'XL',
      variable: '--border-radius-xl',
      value: '1rem',
      useCase: 'Feature cards (16px)'
    },
    {
      name: '2XL',
      variable: '--border-radius-2xl',
      value: '1.5rem',
      useCase: 'Large containers (24px)'
    },
    {
      name: 'Full',
      variable: '--border-radius-full',
      value: '9999px',
      useCase: 'Pills, avatars, circular buttons'
    }
  ];

  usageCode = `// Using border-radius variables
.button {
  border-radius: var(--border-radius);
}

.card {
  border-radius: var(--border-radius-md);
}

.modal {
  border-radius: var(--border-radius-lg);
}

.avatar {
  border-radius: var(--border-radius-full);
}

// Selective rounding
.attached-top {
  border-radius: 0 0 var(--border-radius) var(--border-radius);
}

.attached-bottom {
  border-radius: var(--border-radius) var(--border-radius) 0 0;
}`;
}
