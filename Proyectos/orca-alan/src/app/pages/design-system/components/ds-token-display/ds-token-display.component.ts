import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';

export interface DesignToken {
  name: string;
  value: string;
  description?: string;
}

@Component({
  selector: 'app-ds-token-display',
  standalone: true,
  imports: [CommonModule, TooltipModule],
  templateUrl: './ds-token-display.component.html',
  styleUrl: './ds-token-display.component.scss'
})
export class DsTokenDisplayComponent {
  tokens = input.required<DesignToken[]>();
  title = input<string>('');

  copiedToken = signal<string | null>(null);

  async copyToken(token: DesignToken): Promise<void> {
    const cssVar = `var(${token.name})`;
    try {
      await navigator.clipboard.writeText(cssVar);
      this.copiedToken.set(token.name);
      setTimeout(() => this.copiedToken.set(null), 2000);
    } catch (err) {
      console.error('Failed to copy token:', err);
    }
  }
}
