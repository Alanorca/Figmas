import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DsSidebarComponent } from './components/ds-sidebar/ds-sidebar.component';

@Component({
  selector: 'app-design-system',
  standalone: true,
  imports: [CommonModule, RouterModule, DsSidebarComponent],
  templateUrl: './design-system.component.html',
  styleUrl: './design-system.component.scss'
})
export class DesignSystemComponent {
  sidebarCollapsed = signal(false);

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }
}
