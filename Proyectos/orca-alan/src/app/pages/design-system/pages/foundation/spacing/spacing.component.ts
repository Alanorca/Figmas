import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DsCodeBlockComponent } from '../../../components/ds-code-block/ds-code-block.component';

interface SpacingToken {
  name: string;
  value: string;
  pixels: string;
}

@Component({
  selector: 'app-ds-spacing',
  standalone: true,
  imports: [CommonModule, DsCodeBlockComponent],
  templateUrl: './spacing.component.html',
  styleUrl: './spacing.component.scss'
})
export class SpacingComponent {
  spacingScale: SpacingToken[] = [
    { name: '0', value: '0', pixels: '0px' },
    { name: '1', value: '0.25rem', pixels: '4px' },
    { name: '2', value: '0.5rem', pixels: '8px' },
    { name: '3', value: '0.75rem', pixels: '12px' },
    { name: '4', value: '1rem', pixels: '16px' },
    { name: '5', value: '1.25rem', pixels: '20px' },
    { name: '6', value: '1.5rem', pixels: '24px' },
    { name: '7', value: '1.75rem', pixels: '28px' },
    { name: '8', value: '2rem', pixels: '32px' },
    { name: '9', value: '2.25rem', pixels: '36px' },
    { name: '10', value: '2.5rem', pixels: '40px' },
    { name: '12', value: '3rem', pixels: '48px' },
    { name: '14', value: '3.5rem', pixels: '56px' },
    { name: '16', value: '4rem', pixels: '64px' }
  ];

  gapTokens: SpacingToken[] = [
    { name: 'gap-1', value: '0.25rem', pixels: '4px' },
    { name: 'gap-2', value: '0.5rem', pixels: '8px' },
    { name: 'gap-3', value: '0.75rem', pixels: '12px' },
    { name: 'gap-4', value: '1rem', pixels: '16px' },
    { name: 'gap-5', value: '1.25rem', pixels: '20px' },
    { name: 'gap-6', value: '1.5rem', pixels: '24px' }
  ];

  usageCode = `// PrimeFlex spacing utilities
<div class="p-4">Padding all sides 1rem</div>
<div class="px-3 py-2">Padding horizontal 0.75rem, vertical 0.5rem</div>
<div class="m-2">Margin all sides 0.5rem</div>
<div class="mt-4 mb-2">Margin top 1rem, bottom 0.5rem</div>

// Gap utilities for flexbox/grid
<div class="flex gap-3">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

// CSS custom properties
.custom-card {
  padding: var(--spacing-4);
  margin-bottom: var(--spacing-6);
  gap: var(--spacing-3);
}`;
}
