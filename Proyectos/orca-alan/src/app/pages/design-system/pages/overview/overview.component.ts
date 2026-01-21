import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-ds-overview',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, ButtonModule],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss'
})
export class OverviewComponent {
  sections = [
    {
      title: 'Foundation',
      description: 'Design tokens, colors, typography, spacing, and visual foundations.',
      icon: 'pi pi-palette',
      route: '/design-system/foundation/colors',
      items: ['Colors', 'Typography', 'Spacing', 'Shadows', 'Border Radius']
    },
    {
      title: 'Atoms',
      description: 'Basic UI building blocks: buttons, inputs, icons, and more.',
      icon: 'pi pi-circle',
      route: '/design-system/atoms/buttons',
      items: ['Buttons', 'Inputs', 'Icons', 'Badges', 'Chips']
    },
    {
      title: 'Molecules',
      description: 'Combinations of atoms forming functional UI patterns.',
      icon: 'pi pi-objects-column',
      route: '/design-system/molecules/form-fields',
      items: ['Form Fields', 'Search Box', 'Menu Items', 'Cards']
    },
    {
      title: 'Organisms',
      description: 'Complex UI components built from molecules and atoms.',
      icon: 'pi pi-th-large',
      route: '/design-system/organisms/tables',
      items: ['Tables', 'Dialogs', 'Forms']
    }
  ];
}
