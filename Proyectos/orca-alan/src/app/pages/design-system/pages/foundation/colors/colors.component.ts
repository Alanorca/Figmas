import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DsPreviewComponent } from '../../../components/ds-preview/ds-preview.component';
import { DsCodeBlockComponent } from '../../../components/ds-code-block/ds-code-block.component';
import { DsColorSwatchComponent, ColorPalette } from '../../../components/ds-color-swatch/ds-color-swatch.component';

@Component({
  selector: 'app-ds-colors',
  standalone: true,
  imports: [CommonModule, ToastModule, DsPreviewComponent, DsCodeBlockComponent, DsColorSwatchComponent],
  providers: [MessageService],
  templateUrl: './colors.component.html',
  styleUrl: './colors.component.scss'
})
export class ColorsComponent {
  copiedColor = signal<string | null>(null);

  // Emerald - Primary Color (from design tokens)
  primaryPalette: ColorPalette = {
    name: 'Emerald (Primary)',
    colors: [
      { name: '50', variable: '--emerald-50', hex: '#ecfdf5', isLight: true },
      { name: '100', variable: '--emerald-100', hex: '#d1fae5', isLight: true },
      { name: '200', variable: '--emerald-200', hex: '#a7f3d0', isLight: true },
      { name: '300', variable: '--emerald-300', hex: '#6ee7b7', isLight: true },
      { name: '400', variable: '--emerald-400', hex: '#34d399', isLight: false },
      { name: '500', variable: '--emerald-500', hex: '#10b981', isLight: false },
      { name: '600', variable: '--emerald-600', hex: '#059669', isLight: false },
      { name: '700', variable: '--emerald-700', hex: '#047857', isLight: false },
      { name: '800', variable: '--emerald-800', hex: '#065f46', isLight: false },
      { name: '900', variable: '--emerald-900', hex: '#064e3b', isLight: false },
      { name: '950', variable: '--emerald-950', hex: '#022c22', isLight: false }
    ]
  };

  // Semantic Primary aliases
  semanticPrimaryPalette: ColorPalette = {
    name: 'Primary (Semantic)',
    colors: [
      { name: '50', variable: '--primary-50', hex: '#ecfdf5', isLight: true },
      { name: '100', variable: '--primary-100', hex: '#d1fae5', isLight: true },
      { name: '200', variable: '--primary-200', hex: '#a7f3d0', isLight: true },
      { name: '300', variable: '--primary-300', hex: '#6ee7b7', isLight: true },
      { name: '400', variable: '--primary-400', hex: '#34d399', isLight: false },
      { name: '500', variable: '--primary-500', hex: '#10b981', isLight: false },
      { name: '600', variable: '--primary-600', hex: '#059669', isLight: false },
      { name: '700', variable: '--primary-700', hex: '#047857', isLight: false },
      { name: '800', variable: '--primary-800', hex: '#065f46', isLight: false },
      { name: '900', variable: '--primary-900', hex: '#064e3b', isLight: false },
      { name: '950', variable: '--primary-950', hex: '#022c22', isLight: false }
    ]
  };

  // Slate - Surface/Secondary colors (Light mode base)
  slatePalette: ColorPalette = {
    name: 'Slate (Surface Light)',
    colors: [
      { name: '50', variable: '--slate-50', hex: '#f8fafc', isLight: true },
      { name: '100', variable: '--slate-100', hex: '#f1f5f9', isLight: true },
      { name: '200', variable: '--slate-200', hex: '#e2e8f0', isLight: true },
      { name: '300', variable: '--slate-300', hex: '#cbd5e1', isLight: true },
      { name: '400', variable: '--slate-400', hex: '#94a3b8', isLight: false },
      { name: '500', variable: '--slate-500', hex: '#64748b', isLight: false },
      { name: '600', variable: '--slate-600', hex: '#475569', isLight: false },
      { name: '700', variable: '--slate-700', hex: '#334155', isLight: false },
      { name: '800', variable: '--slate-800', hex: '#1e293b', isLight: false },
      { name: '900', variable: '--slate-900', hex: '#0f172a', isLight: false },
      { name: '950', variable: '--slate-950', hex: '#020617', isLight: false }
    ]
  };

  // Zinc - Dark mode surface colors
  zincPalette: ColorPalette = {
    name: 'Zinc (Surface Dark)',
    colors: [
      { name: '50', variable: '--zinc-50', hex: '#fafafa', isLight: true },
      { name: '100', variable: '--zinc-100', hex: '#f4f4f5', isLight: true },
      { name: '200', variable: '--zinc-200', hex: '#e4e4e7', isLight: true },
      { name: '300', variable: '--zinc-300', hex: '#d4d4d8', isLight: true },
      { name: '400', variable: '--zinc-400', hex: '#a1a1aa', isLight: false },
      { name: '500', variable: '--zinc-500', hex: '#71717a', isLight: false },
      { name: '600', variable: '--zinc-600', hex: '#52525b', isLight: false },
      { name: '700', variable: '--zinc-700', hex: '#3f3f46', isLight: false },
      { name: '800', variable: '--zinc-800', hex: '#27272a', isLight: false },
      { name: '900', variable: '--zinc-900', hex: '#18181b', isLight: false },
      { name: '950', variable: '--zinc-950', hex: '#09090b', isLight: false }
    ]
  };

  // Gray - Alternative neutral scale
  grayPalette: ColorPalette = {
    name: 'Gray (Neutral)',
    colors: [
      { name: '50', variable: '--gray-50', hex: '#f9fafb', isLight: true },
      { name: '100', variable: '--gray-100', hex: '#f3f4f6', isLight: true },
      { name: '200', variable: '--gray-200', hex: '#e5e7eb', isLight: true },
      { name: '300', variable: '--gray-300', hex: '#d1d5db', isLight: true },
      { name: '400', variable: '--gray-400', hex: '#9ca3af', isLight: false },
      { name: '500', variable: '--gray-500', hex: '#6b7280', isLight: false },
      { name: '600', variable: '--gray-600', hex: '#4b5563', isLight: false },
      { name: '700', variable: '--gray-700', hex: '#374151', isLight: false },
      { name: '800', variable: '--gray-800', hex: '#1f2937', isLight: false },
      { name: '900', variable: '--gray-900', hex: '#111827', isLight: false },
      { name: '950', variable: '--gray-950', hex: '#030712', isLight: false }
    ]
  };

  // Surface semantic palette
  surfacePalette: ColorPalette = {
    name: 'Surface (Semantic)',
    colors: [
      { name: '0', variable: '--surface-0', hex: '#ffffff', isLight: true },
      { name: '50', variable: '--surface-50', hex: '#f8fafc', isLight: true },
      { name: '100', variable: '--surface-100', hex: '#f1f5f9', isLight: true },
      { name: '200', variable: '--surface-200', hex: '#e2e8f0', isLight: true },
      { name: '300', variable: '--surface-300', hex: '#cbd5e1', isLight: true },
      { name: '400', variable: '--surface-400', hex: '#94a3b8', isLight: false },
      { name: '500', variable: '--surface-500', hex: '#64748b', isLight: false },
      { name: '600', variable: '--surface-600', hex: '#475569', isLight: false },
      { name: '700', variable: '--surface-700', hex: '#334155', isLight: false },
      { name: '800', variable: '--surface-800', hex: '#1e293b', isLight: false },
      { name: '900', variable: '--surface-900', hex: '#0f172a', isLight: false },
      { name: '950', variable: '--surface-950', hex: '#020617', isLight: false }
    ]
  };

  // Semantic state colors
  semanticPalettes: ColorPalette[] = [
    {
      name: 'Green (Success)',
      colors: [
        { name: '50', variable: '--green-50', hex: '#f0fdf4', isLight: true },
        { name: '100', variable: '--green-100', hex: '#dcfce7', isLight: true },
        { name: '200', variable: '--green-200', hex: '#bbf7d0', isLight: true },
        { name: '300', variable: '--green-300', hex: '#86efac', isLight: true },
        { name: '400', variable: '--green-400', hex: '#4ade80', isLight: false },
        { name: '500', variable: '--green-500', hex: '#22c55e', isLight: false },
        { name: '600', variable: '--green-600', hex: '#16a34a', isLight: false },
        { name: '700', variable: '--green-700', hex: '#15803d', isLight: false },
        { name: '800', variable: '--green-800', hex: '#166534', isLight: false },
        { name: '900', variable: '--green-900', hex: '#14532d', isLight: false }
      ]
    },
    {
      name: 'Sky (Info)',
      colors: [
        { name: '50', variable: '--sky-50', hex: '#f0f9ff', isLight: true },
        { name: '100', variable: '--sky-100', hex: '#e0f2fe', isLight: true },
        { name: '200', variable: '--sky-200', hex: '#bae6fd', isLight: true },
        { name: '300', variable: '--sky-300', hex: '#7dd3fc', isLight: true },
        { name: '400', variable: '--sky-400', hex: '#38bdf8', isLight: false },
        { name: '500', variable: '--sky-500', hex: '#0ea5e9', isLight: false },
        { name: '600', variable: '--sky-600', hex: '#0284c7', isLight: false },
        { name: '700', variable: '--sky-700', hex: '#0369a1', isLight: false },
        { name: '800', variable: '--sky-800', hex: '#075985', isLight: false },
        { name: '900', variable: '--sky-900', hex: '#0c4a6e', isLight: false }
      ]
    },
    {
      name: 'Orange (Warning)',
      colors: [
        { name: '50', variable: '--orange-50', hex: '#fff7ed', isLight: true },
        { name: '100', variable: '--orange-100', hex: '#ffedd5', isLight: true },
        { name: '200', variable: '--orange-200', hex: '#fed7aa', isLight: true },
        { name: '300', variable: '--orange-300', hex: '#fdba74', isLight: true },
        { name: '400', variable: '--orange-400', hex: '#fb923c', isLight: false },
        { name: '500', variable: '--orange-500', hex: '#f97316', isLight: false },
        { name: '600', variable: '--orange-600', hex: '#ea580c', isLight: false },
        { name: '700', variable: '--orange-700', hex: '#c2410c', isLight: false },
        { name: '800', variable: '--orange-800', hex: '#9a3412', isLight: false },
        { name: '900', variable: '--orange-900', hex: '#7c2d12', isLight: false }
      ]
    },
    {
      name: 'Red (Danger)',
      colors: [
        { name: '50', variable: '--red-50', hex: '#fef2f2', isLight: true },
        { name: '100', variable: '--red-100', hex: '#fee2e2', isLight: true },
        { name: '200', variable: '--red-200', hex: '#fecaca', isLight: true },
        { name: '300', variable: '--red-300', hex: '#fca5a5', isLight: true },
        { name: '400', variable: '--red-400', hex: '#f87171', isLight: false },
        { name: '500', variable: '--red-500', hex: '#ef4444', isLight: false },
        { name: '600', variable: '--red-600', hex: '#dc2626', isLight: false },
        { name: '700', variable: '--red-700', hex: '#b91c1c', isLight: false },
        { name: '800', variable: '--red-800', hex: '#991b1b', isLight: false },
        { name: '900', variable: '--red-900', hex: '#7f1d1d', isLight: false }
      ]
    },
    {
      name: 'Purple (Help)',
      colors: [
        { name: '50', variable: '--purple-50', hex: '#faf5ff', isLight: true },
        { name: '100', variable: '--purple-100', hex: '#f3e8ff', isLight: true },
        { name: '200', variable: '--purple-200', hex: '#e9d5ff', isLight: true },
        { name: '300', variable: '--purple-300', hex: '#d8b4fe', isLight: true },
        { name: '400', variable: '--purple-400', hex: '#c084fc', isLight: false },
        { name: '500', variable: '--purple-500', hex: '#a855f7', isLight: false },
        { name: '600', variable: '--purple-600', hex: '#9333ea', isLight: false },
        { name: '700', variable: '--purple-700', hex: '#7e22ce', isLight: false },
        { name: '800', variable: '--purple-800', hex: '#6b21a8', isLight: false },
        { name: '900', variable: '--purple-900', hex: '#581c87', isLight: false }
      ]
    }
  ];

  // Extended color palettes
  extendedPalettes: ColorPalette[] = [
    {
      name: 'Blue',
      colors: [
        { name: '50', variable: '--blue-50', hex: '#eff6ff', isLight: true },
        { name: '100', variable: '--blue-100', hex: '#dbeafe', isLight: true },
        { name: '200', variable: '--blue-200', hex: '#bfdbfe', isLight: true },
        { name: '300', variable: '--blue-300', hex: '#93c5fd', isLight: true },
        { name: '400', variable: '--blue-400', hex: '#60a5fa', isLight: false },
        { name: '500', variable: '--blue-500', hex: '#3b82f6', isLight: false },
        { name: '600', variable: '--blue-600', hex: '#2563eb', isLight: false },
        { name: '700', variable: '--blue-700', hex: '#1d4ed8', isLight: false }
      ]
    },
    {
      name: 'Yellow',
      colors: [
        { name: '50', variable: '--yellow-50', hex: '#fefce8', isLight: true },
        { name: '100', variable: '--yellow-100', hex: '#fef9c3', isLight: true },
        { name: '200', variable: '--yellow-200', hex: '#fef08a', isLight: true },
        { name: '300', variable: '--yellow-300', hex: '#fde047', isLight: true },
        { name: '400', variable: '--yellow-400', hex: '#facc15', isLight: true },
        { name: '500', variable: '--yellow-500', hex: '#eab308', isLight: false },
        { name: '600', variable: '--yellow-600', hex: '#ca8a04', isLight: false },
        { name: '700', variable: '--yellow-700', hex: '#a16207', isLight: false }
      ]
    },
    {
      name: 'Teal',
      colors: [
        { name: '50', variable: '--teal-50', hex: '#f0fdfa', isLight: true },
        { name: '100', variable: '--teal-100', hex: '#ccfbf1', isLight: true },
        { name: '200', variable: '--teal-200', hex: '#99f6e4', isLight: true },
        { name: '300', variable: '--teal-300', hex: '#5eead4', isLight: true },
        { name: '400', variable: '--teal-400', hex: '#2dd4bf', isLight: false },
        { name: '500', variable: '--teal-500', hex: '#14b8a6', isLight: false },
        { name: '600', variable: '--teal-600', hex: '#0d9488', isLight: false },
        { name: '700', variable: '--teal-700', hex: '#0f766e', isLight: false }
      ]
    },
    {
      name: 'Cyan',
      colors: [
        { name: '50', variable: '--cyan-50', hex: '#ecfeff', isLight: true },
        { name: '100', variable: '--cyan-100', hex: '#cffafe', isLight: true },
        { name: '200', variable: '--cyan-200', hex: '#a5f3fc', isLight: true },
        { name: '300', variable: '--cyan-300', hex: '#67e8f9', isLight: true },
        { name: '400', variable: '--cyan-400', hex: '#22d3ee', isLight: false },
        { name: '500', variable: '--cyan-500', hex: '#06b6d4', isLight: false },
        { name: '600', variable: '--cyan-600', hex: '#0891b2', isLight: false },
        { name: '700', variable: '--cyan-700', hex: '#0e7490', isLight: false }
      ]
    },
    {
      name: 'Pink',
      colors: [
        { name: '50', variable: '--pink-50', hex: '#fdf2f8', isLight: true },
        { name: '100', variable: '--pink-100', hex: '#fce7f3', isLight: true },
        { name: '200', variable: '--pink-200', hex: '#fbcfe8', isLight: true },
        { name: '300', variable: '--pink-300', hex: '#f9a8d4', isLight: true },
        { name: '400', variable: '--pink-400', hex: '#f472b6', isLight: false },
        { name: '500', variable: '--pink-500', hex: '#ec4899', isLight: false },
        { name: '600', variable: '--pink-600', hex: '#db2777', isLight: false },
        { name: '700', variable: '--pink-700', hex: '#be185d', isLight: false }
      ]
    },
    {
      name: 'Indigo',
      colors: [
        { name: '50', variable: '--indigo-50', hex: '#eef2ff', isLight: true },
        { name: '100', variable: '--indigo-100', hex: '#e0e7ff', isLight: true },
        { name: '200', variable: '--indigo-200', hex: '#c7d2fe', isLight: true },
        { name: '300', variable: '--indigo-300', hex: '#a5b4fc', isLight: true },
        { name: '400', variable: '--indigo-400', hex: '#818cf8', isLight: false },
        { name: '500', variable: '--indigo-500', hex: '#6366f1', isLight: false },
        { name: '600', variable: '--indigo-600', hex: '#4f46e5', isLight: false },
        { name: '700', variable: '--indigo-700', hex: '#4338ca', isLight: false }
      ]
    }
  ];

  usageCode = `// Using Emerald primary color
.my-element {
  background-color: var(--primary-500);      // #10b981
  color: var(--primary-contrast-color);      // #ffffff
  border: 1px solid var(--primary-600);      // #059669
}

// Hover states
.my-button:hover {
  background-color: var(--primary-hover-color);  // #059669
}

// Using surface/secondary colors
.card {
  background: var(--surface-card);           // #ffffff (light) / #18181b (dark)
  border: 1px solid var(--surface-border);   // #e2e8f0 (light) / #27272a (dark)
  color: var(--text-color);                  // #334155 (light) / #fafafa (dark)
}

// Semantic colors for states
.success-message {
  background-color: var(--green-50);
  color: var(--green-700);
  border-left: 4px solid var(--green-500);
}

.error-message {
  background-color: var(--red-50);
  color: var(--red-700);
  border-left: 4px solid var(--red-500);
}`;

  constructor(private messageService: MessageService) {}

  onColorCopy(variable: string): void {
    this.copiedColor.set(variable);
    this.messageService.add({
      severity: 'success',
      summary: 'Copied!',
      detail: `${variable} copied to clipboard`,
      life: 2000
    });
    setTimeout(() => this.copiedColor.set(null), 2000);
  }
}
