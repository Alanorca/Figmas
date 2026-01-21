import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DsCodeBlockComponent } from '../../../components/ds-code-block/ds-code-block.component';

interface ShadowToken {
  name: string;
  variable: string;
  value: string;
  useCase: string;
}

@Component({
  selector: 'app-ds-shadows',
  standalone: true,
  imports: [CommonModule, DsCodeBlockComponent],
  templateUrl: './shadows.component.html',
  styleUrl: './shadows.component.scss'
})
export class ShadowsComponent {
  shadows: ShadowToken[] = [
    {
      name: 'None',
      variable: '--shadow-none',
      value: 'none',
      useCase: 'Remove shadow'
    },
    {
      name: 'XS',
      variable: '--shadow-xs',
      value: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      useCase: 'Subtle elevation for small elements'
    },
    {
      name: 'SM',
      variable: '--shadow-sm',
      value: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      useCase: 'Cards, inputs'
    },
    {
      name: 'Base',
      variable: '--shadow',
      value: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      useCase: 'Default elevation for panels'
    },
    {
      name: 'MD',
      variable: '--shadow-md',
      value: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      useCase: 'Dropdowns, popovers'
    },
    {
      name: 'LG',
      variable: '--shadow-lg',
      value: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      useCase: 'Modals, dialogs'
    },
    {
      name: 'XL',
      variable: '--shadow-xl',
      value: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      useCase: 'High emphasis overlays'
    }
  ];

  focusShadows: ShadowToken[] = [
    {
      name: 'Focus Ring',
      variable: '--focus-ring-shadow',
      value: '0 0 0 2px var(--surface-0), 0 0 0 4px var(--primary-color)',
      useCase: 'Focus state for interactive elements'
    },
    {
      name: 'Focus Ring Inset',
      variable: '--focus-ring-inset',
      value: 'inset 0 0 0 2px var(--primary-color)',
      useCase: 'Inset focus for contained elements'
    }
  ];

  usageCode = `// Using shadow variables
.card {
  box-shadow: var(--shadow-sm);
}

.dropdown {
  box-shadow: var(--shadow-md);
}

.modal {
  box-shadow: var(--shadow-lg);
}

// Focus states
.input:focus {
  box-shadow: var(--focus-ring-shadow);
  outline: none;
}

// Hover elevation
.card:hover {
  box-shadow: var(--shadow-md);
  transition: box-shadow 0.2s ease;
}`;
}
