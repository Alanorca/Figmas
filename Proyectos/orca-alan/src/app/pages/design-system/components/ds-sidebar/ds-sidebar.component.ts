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

  expandedSection = signal<string | null>('foundation');

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
        { label: 'Chips', route: '/design-system/atoms/chips' },
        { label: 'Checkboxes', route: '/design-system/atoms/checkboxes' },
        { label: 'Sliders', route: '/design-system/atoms/sliders' },
        { label: 'Progress', route: '/design-system/atoms/progress' },
        { label: 'Avatars', route: '/design-system/atoms/avatars' },
        { label: 'Dividers', route: '/design-system/atoms/dividers' }
      ]
    },
    {
      label: 'Molecules',
      icon: 'pi pi-objects-column',
      children: [
        { label: 'Form Fields', route: '/design-system/molecules/form-fields' },
        { label: 'Search Box', route: '/design-system/molecules/search-box' },
        { label: 'Menu Items', route: '/design-system/molecules/menu-items' },
        { label: 'Cards', route: '/design-system/molecules/cards' },
        { label: 'Selection Cards', route: '/design-system/molecules/selection-cards' },
        { label: 'Upload Area', route: '/design-system/molecules/upload-area' },
        { label: 'Accordions', route: '/design-system/molecules/accordions' },
        { label: 'Tabs', route: '/design-system/molecules/tabs' },
        { label: 'Tooltips', route: '/design-system/molecules/tooltips' },
        { label: 'Messages', route: '/design-system/molecules/messages' },
        { label: 'Steppers', route: '/design-system/molecules/steppers' },
        { label: 'Timelines', route: '/design-system/molecules/timelines' },
        { label: 'Splitters', route: '/design-system/molecules/splitters' }
      ]
    },
    {
      label: 'Organisms',
      icon: 'pi pi-th-large',
      children: [
        { label: 'Tables', route: '/design-system/organisms/tables' },
        { label: 'Dialogs', route: '/design-system/organisms/dialogs' },
        { label: 'Forms', route: '/design-system/organisms/forms' },
        { label: 'Multi-Step Template', route: '/design-system/organisms/multi-step-template' },
        { label: 'Detail Template', route: '/design-system/organisms/detail-template' }
      ]
    },
    {
      label: 'Guides',
      icon: 'pi pi-book',
      children: [
        { label: 'Documentation', route: '/design-system/guides/documentation' }
      ]
    }
  ];

  toggleSection(section: string): void {
    const key = section.toLowerCase();
    this.expandedSection.update(current => current === key ? null : key);
  }

  isSectionExpanded(section: string): boolean {
    return this.expandedSection() === section.toLowerCase();
  }
}
