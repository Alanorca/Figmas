import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ds-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ds-preview.component.html',
  styleUrl: './ds-preview.component.scss'
})
export class DsPreviewComponent {
  title = input<string>('');
  description = input<string>('');
}
