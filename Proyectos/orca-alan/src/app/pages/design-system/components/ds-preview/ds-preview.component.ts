import { Component, input, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';

type PreviewMode = 'light' | 'dark' | 'split';

@Component({
  selector: 'app-ds-preview',
  standalone: true,
  imports: [CommonModule, SelectButtonModule, FormsModule],
  templateUrl: './ds-preview.component.html',
  styleUrl: './ds-preview.component.scss'
})
export class DsPreviewComponent {
  title = input<string>('');
  description = input<string>('');
  showModeToggle = input(true);

  previewMode = signal<PreviewMode>('light');

  modeOptions = [
    { label: 'Light', value: 'light', icon: 'pi pi-sun' },
    { label: 'Dark', value: 'dark', icon: 'pi pi-moon' }
  ];

  onModeChange(mode: PreviewMode): void {
    this.previewMode.set(mode);
  }
}
