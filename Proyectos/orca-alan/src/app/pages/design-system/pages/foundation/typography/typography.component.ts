import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DsPreviewComponent } from '../../../components/ds-preview/ds-preview.component';
import { DsCodeBlockComponent } from '../../../components/ds-code-block/ds-code-block.component';
import { DsTokenDisplayComponent, DesignToken } from '../../../components/ds-token-display/ds-token-display.component';

interface TypographyScale {
  name: string;
  cssClass: string;
  size: string;
  weight: string;
  lineHeight: string;
  example: string;
}

@Component({
  selector: 'app-ds-typography',
  standalone: true,
  imports: [CommonModule, DsPreviewComponent, DsCodeBlockComponent, DsTokenDisplayComponent],
  templateUrl: './typography.component.html',
  styleUrl: './typography.component.scss'
})
export class TypographyComponent {
  fontFamilyTokens: DesignToken[] = [
    { name: '--font-family', value: 'Inter, system-ui, sans-serif', description: 'Primary font family' },
    { name: '--font-family-mono', value: 'Fira Code, Consolas, monospace', description: 'Monospace font for code' }
  ];

  fontSizeTokens: DesignToken[] = [
    { name: '--text-xs', value: '0.75rem', description: '12px - Captions, labels' },
    { name: '--text-sm', value: '0.875rem', description: '14px - Body small' },
    { name: '--text-base', value: '1rem', description: '16px - Body default' },
    { name: '--text-lg', value: '1.125rem', description: '18px - Body large' },
    { name: '--text-xl', value: '1.25rem', description: '20px - Subtitle' },
    { name: '--text-2xl', value: '1.5rem', description: '24px - Heading 3' },
    { name: '--text-3xl', value: '1.875rem', description: '30px - Heading 2' },
    { name: '--text-4xl', value: '2.25rem', description: '36px - Heading 1' }
  ];

  fontWeightTokens: DesignToken[] = [
    { name: '--font-normal', value: '400', description: 'Normal weight' },
    { name: '--font-medium', value: '500', description: 'Medium weight' },
    { name: '--font-semibold', value: '600', description: 'Semibold weight' },
    { name: '--font-bold', value: '700', description: 'Bold weight' }
  ];

  typographyScale: TypographyScale[] = [
    { name: 'Display', cssClass: 'text-4xl font-bold', size: '2.25rem', weight: '700', lineHeight: '1.2', example: 'Display Heading' },
    { name: 'Heading 1', cssClass: 'text-3xl font-bold', size: '1.875rem', weight: '700', lineHeight: '1.25', example: 'Main Page Title' },
    { name: 'Heading 2', cssClass: 'text-2xl font-semibold', size: '1.5rem', weight: '600', lineHeight: '1.3', example: 'Section Heading' },
    { name: 'Heading 3', cssClass: 'text-xl font-semibold', size: '1.25rem', weight: '600', lineHeight: '1.4', example: 'Subsection Title' },
    { name: 'Body Large', cssClass: 'text-lg', size: '1.125rem', weight: '400', lineHeight: '1.6', example: 'Larger body text for emphasis or introductions.' },
    { name: 'Body', cssClass: 'text-base', size: '1rem', weight: '400', lineHeight: '1.6', example: 'Standard body text used throughout the application.' },
    { name: 'Body Small', cssClass: 'text-sm', size: '0.875rem', weight: '400', lineHeight: '1.5', example: 'Smaller text for secondary information.' },
    { name: 'Caption', cssClass: 'text-xs', size: '0.75rem', weight: '400', lineHeight: '1.4', example: 'Labels, captions, and metadata' }
  ];

  usageCode = `// Typography scale usage
<h1 class="text-4xl font-bold">Display Heading</h1>
<h2 class="text-2xl font-semibold">Section Title</h2>
<p class="text-base">Body text content...</p>
<span class="text-sm text-secondary">Helper text</span>

// CSS Variables
.custom-heading {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: 1.3;
  color: var(--text-color);
}`;
}
