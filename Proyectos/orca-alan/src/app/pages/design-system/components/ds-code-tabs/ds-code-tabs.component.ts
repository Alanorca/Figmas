import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';

export interface CodeTab {
  label: string;
  language: string;
  code: string;
  icon?: string;
}

@Component({
  selector: 'app-ds-code-tabs',
  standalone: true,
  imports: [CommonModule, ButtonModule, TooltipModule, RippleModule],
  templateUrl: './ds-code-tabs.component.html',
  styleUrl: './ds-code-tabs.component.scss'
})
export class DsCodeTabsComponent {
  tabs = input.required<CodeTab[]>();
  showLineNumbers = input(true);

  activeTabIndex = signal(0);
  copied = signal(false);

  get activeTab(): CodeTab {
    return this.tabs()[this.activeTabIndex()];
  }

  get codeLines(): string[] {
    return this.activeTab.code.split('\n');
  }

  selectTab(index: number): void {
    this.activeTabIndex.set(index);
  }

  async copyCode(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.activeTab.code);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  }
}
