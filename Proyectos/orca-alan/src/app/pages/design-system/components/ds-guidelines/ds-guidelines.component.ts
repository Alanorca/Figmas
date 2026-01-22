import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ds-guidelines',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ds-guidelines.component.html',
  styleUrl: './ds-guidelines.component.scss'
})
export class DsGuidelinesComponent {
  dos = input<string[]>([]);
  donts = input<string[]>([]);
  compact = input(false);
}
