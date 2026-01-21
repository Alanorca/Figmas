import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

export interface ComponentProp {
  name: string;
  type: string;
  default?: string;
  description: string;
  required?: boolean;
}

@Component({
  selector: 'app-ds-props-table',
  standalone: true,
  imports: [CommonModule, TableModule, TagModule],
  templateUrl: './ds-props-table.component.html',
  styleUrl: './ds-props-table.component.scss'
})
export class DsPropsTableComponent {
  props = input.required<ComponentProp[]>();
  title = input<string>('Properties');
}
