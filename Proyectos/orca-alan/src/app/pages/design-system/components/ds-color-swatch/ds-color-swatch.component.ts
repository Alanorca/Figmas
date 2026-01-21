import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';

export interface ColorSwatch {
  name: string;
  variable: string;
  hex: string;
  isLight?: boolean;
}

export interface ColorPalette {
  name: string;
  colors: ColorSwatch[];
}

@Component({
  selector: 'app-ds-color-swatch',
  standalone: true,
  imports: [CommonModule, TooltipModule],
  templateUrl: './ds-color-swatch.component.html',
  styleUrl: './ds-color-swatch.component.scss'
})
export class DsColorSwatchComponent {
  palette = input.required<ColorPalette>();
  compact = input(false);

  copiedColor = signal<string | null>(null);

  async copyColor(color: ColorSwatch): Promise<void> {
    const cssVar = `var(${color.variable})`;
    try {
      await navigator.clipboard.writeText(cssVar);
      this.copiedColor.set(color.variable);
      setTimeout(() => this.copiedColor.set(null), 2000);
    } catch (err) {
      console.error('Failed to copy color:', err);
    }
  }

  getTextColor(color: ColorSwatch): string {
    return color.isLight ? '#1e293b' : '#ffffff';
  }
}
