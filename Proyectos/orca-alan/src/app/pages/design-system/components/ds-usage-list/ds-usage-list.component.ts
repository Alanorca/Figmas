import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RippleModule } from 'primeng/ripple';

export interface UsageItem {
  title: string;
  path: string;
  icon?: string;
  description?: string;
}

@Component({
  selector: 'app-ds-usage-list',
  standalone: true,
  imports: [CommonModule, RouterModule, RippleModule],
  templateUrl: './ds-usage-list.component.html',
  styleUrl: './ds-usage-list.component.scss'
})
export class DsUsageListComponent {
  title = input<string>('Componentes que lo usan');
  items = input.required<UsageItem[]>();
  type = input<'pages' | 'components'>('components');
}
