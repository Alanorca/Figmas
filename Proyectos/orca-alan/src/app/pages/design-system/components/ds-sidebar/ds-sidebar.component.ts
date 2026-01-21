import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

interface NavItem {
  label: string;
  icon?: string;
  route?: string;
  children?: NavItem[];
}

@Component({
  selector: 'app-ds-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, RippleModule],
  templateUrl: './ds-sidebar.component.html',
  styleUrl: './ds-sidebar.component.scss'
})
export class DsSidebarComponent {
  collapsed = input(false);
  toggleCollapse = output<void>();

  expandedSections = signal<Set<string>>(new Set(['foundation', 'atoms', 'molecules', 'organisms']));

  navItems: NavItem[] = [
    {
      label: 'Overview',
      icon: 'pi pi-home',
      route: '/design-system/overview'
    },
    {
      label: 'Foundation',
      icon: 'pi pi-palette',
      children: [
        { label: 'Colors', route: '/design-system/foundation/colors' },
        { label: 'Typography', route: '/design-system/foundation/typography' },
        { label: 'Spacing', route: '/design-system/foundation/spacing' },
        { label: 'Shadows', route: '/design-system/foundation/shadows' },
        { label: 'Border Radius', route: '/design-system/foundation/border-radius' }
      ]
    },
    {
      label: 'Atoms',
      icon: 'pi pi-circle',
      children: [
        { label: 'Buttons', route: '/design-system/atoms/buttons' },
        { label: 'Inputs', route: '/design-system/atoms/inputs' },
        { label: 'Icons', route: '/design-system/atoms/icons' },
        { label: 'Badges', route: '/design-system/atoms/badges' },
        { label: 'Chips', route: '/design-system/atoms/chips' }
      ]
    },
    {
      label: 'Molecules',
      icon: 'pi pi-objects-column',
      children: [
        { label: 'Form Fields', route: '/design-system/molecules/form-fields' },
        { label: 'Search Box', route: '/design-system/molecules/search-box' },
        { label: 'Menu Items', route: '/design-system/molecules/menu-items' },
        { label: 'Cards', route: '/design-system/molecules/cards' }
      ]
    },
    {
      label: 'Organisms',
      icon: 'pi pi-th-large',
      children: [
        { label: 'Tables', route: '/design-system/organisms/tables' },
        { label: 'Dialogs', route: '/design-system/organisms/dialogs' },
        { label: 'Forms', route: '/design-system/organisms/forms' }
      ]
    }
  ];

  toggleSection(section: string): void {
    this.expandedSections.update(sections => {
      const newSections = new Set(sections);
      if (newSections.has(section)) {
        newSections.delete(section);
      } else {
        newSections.add(section);
      }
      return newSections;
    });
  }

  isSectionExpanded(section: string): boolean {
    return this.expandedSections().has(section.toLowerCase());
  }
}
