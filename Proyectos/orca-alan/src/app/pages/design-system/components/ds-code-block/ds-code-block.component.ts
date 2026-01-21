import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-ds-code-block',
  standalone: true,
  imports: [CommonModule, ButtonModule, TooltipModule],
  templateUrl: './ds-code-block.component.html',
  styleUrl: './ds-code-block.component.scss'
})
export class DsCodeBlockComponent {
  code = input.required<string>();
  language = input<string>('html');
  filename = input<string>('');
  showLineNumbers = input(true);

  copied = signal(false);

  get codeLines(): string[] {
    return this.code().split('\n');
  }

  async copyCode(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.code());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  }
}
