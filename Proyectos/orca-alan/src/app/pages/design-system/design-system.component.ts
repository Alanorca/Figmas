import { Component, signal, computed, HostListener, ViewChild, ElementRef, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DsSidebarComponent } from './components/ds-sidebar/ds-sidebar.component';
import { DsThemeService } from './services/ds-theme.service';

interface ComponentItem {
  label: string;
  route: string;
  icon: string;
  category: string;
}

interface CategoryGroup {
  name: string;
  icon: string;
  items: ComponentItem[];
}

const CATEGORY_ICONS: Record<string, string> = {
  'General': 'pi pi-home',
  'Foundation': 'pi pi-palette',
  'Atoms': 'pi pi-circle',
  'Molecules': 'pi pi-objects-column',
  'Organisms': 'pi pi-th-large',
  'Guides': 'pi pi-book'
};

@Component({
  selector: 'app-design-system',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, InputTextModule, RippleModule, ButtonModule, TooltipModule, DsSidebarComponent],
  templateUrl: './design-system.component.html',
  styleUrl: './design-system.component.scss',
  host: {
    '[class.ds-theme-light]': 'dsTheme.currentTheme() === "light"',
    '[class.ds-theme-dark]': 'dsTheme.currentTheme() === "dark"'
  }
})
export class DesignSystemComponent implements OnDestroy {
  dsTheme = inject(DsThemeService);

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  searchQuery = '';
  showResults = false;
  sidebarCollapsed = signal(false);
  private searchSignal = signal('');

  allComponents: ComponentItem[] = [
    { label: 'Overview', route: '/design-system/overview', icon: 'pi pi-home', category: 'General' },
    { label: 'Colors', route: '/design-system/foundation/colors', icon: 'pi pi-palette', category: 'Foundation' },
    { label: 'Typography', route: '/design-system/foundation/typography', icon: 'pi pi-align-left', category: 'Foundation' },
    { label: 'Spacing', route: '/design-system/foundation/spacing', icon: 'pi pi-arrows-h', category: 'Foundation' },
    { label: 'Shadows', route: '/design-system/foundation/shadows', icon: 'pi pi-sun', category: 'Foundation' },
    { label: 'Border Radius', route: '/design-system/foundation/border-radius', icon: 'pi pi-stop', category: 'Foundation' },
    { label: 'Buttons', route: '/design-system/atoms/buttons', icon: 'pi pi-box', category: 'Atoms' },
    { label: 'Inputs', route: '/design-system/atoms/inputs', icon: 'pi pi-pencil', category: 'Atoms' },
    { label: 'Icons', route: '/design-system/atoms/icons', icon: 'pi pi-star', category: 'Atoms' },
    { label: 'Badges', route: '/design-system/atoms/badges', icon: 'pi pi-tag', category: 'Atoms' },
    { label: 'Chips', route: '/design-system/atoms/chips', icon: 'pi pi-ticket', category: 'Atoms' },
    { label: 'Checkboxes', route: '/design-system/atoms/checkboxes', icon: 'pi pi-check-square', category: 'Atoms' },
    { label: 'Sliders', route: '/design-system/atoms/sliders', icon: 'pi pi-sliders-h', category: 'Atoms' },
    { label: 'Progress', route: '/design-system/atoms/progress', icon: 'pi pi-spinner', category: 'Atoms' },
    { label: 'Avatars', route: '/design-system/atoms/avatars', icon: 'pi pi-user', category: 'Atoms' },
    { label: 'Dividers', route: '/design-system/atoms/dividers', icon: 'pi pi-minus', category: 'Atoms' },
    { label: 'Form Fields', route: '/design-system/molecules/form-fields', icon: 'pi pi-list', category: 'Molecules' },
    { label: 'Search Box', route: '/design-system/molecules/search-box', icon: 'pi pi-search', category: 'Molecules' },
    { label: 'Menu Items', route: '/design-system/molecules/menu-items', icon: 'pi pi-bars', category: 'Molecules' },
    { label: 'Cards', route: '/design-system/molecules/cards', icon: 'pi pi-id-card', category: 'Molecules' },
    { label: 'Selection Cards', route: '/design-system/molecules/selection-cards', icon: 'pi pi-check-square', category: 'Molecules' },
    { label: 'Upload Area', route: '/design-system/molecules/upload-area', icon: 'pi pi-upload', category: 'Molecules' },
    { label: 'Accordions', route: '/design-system/molecules/accordions', icon: 'pi pi-chevron-down', category: 'Molecules' },
    { label: 'Tabs', route: '/design-system/molecules/tabs', icon: 'pi pi-folder', category: 'Molecules' },
    { label: 'Tooltips', route: '/design-system/molecules/tooltips', icon: 'pi pi-info-circle', category: 'Molecules' },
    { label: 'Messages', route: '/design-system/molecules/messages', icon: 'pi pi-envelope', category: 'Molecules' },
    { label: 'Steppers', route: '/design-system/molecules/steppers', icon: 'pi pi-step-forward', category: 'Molecules' },
    { label: 'Timelines', route: '/design-system/molecules/timelines', icon: 'pi pi-clock', category: 'Molecules' },
    { label: 'Splitters', route: '/design-system/molecules/splitters', icon: 'pi pi-arrows-alt', category: 'Molecules' },
    { label: 'Stats', route: '/design-system/molecules/stats', icon: 'pi pi-chart-bar', category: 'Molecules' },
    { label: 'Tables', route: '/design-system/organisms/tables', icon: 'pi pi-table', category: 'Organisms' },
    { label: 'Dialogs', route: '/design-system/organisms/dialogs', icon: 'pi pi-window-maximize', category: 'Organisms' },
    { label: 'Forms', route: '/design-system/organisms/forms', icon: 'pi pi-file-edit', category: 'Organisms' },
    { label: 'Multi-Step Template', route: '/design-system/organisms/multi-step-template', icon: 'pi pi-sitemap', category: 'Organisms' },
    { label: 'Documentation Guide', route: '/design-system/guides/documentation', icon: 'pi pi-book', category: 'Guides' }
  ];

  filteredComponents = computed(() => {
    const query = this.searchSignal().toLowerCase();
    if (!query) return this.allComponents;
    return this.allComponents.filter(c =>
      c.label.toLowerCase().includes(query) ||
      c.category.toLowerCase().includes(query)
    );
  });

  groupedComponents = computed(() => {
    const filtered = this.filteredComponents();
    const groups: CategoryGroup[] = [];
    const categoryOrder = ['General', 'Foundation', 'Atoms', 'Molecules', 'Organisms', 'Guides'];

    categoryOrder.forEach(categoryName => {
      const items = filtered.filter(c => c.category === categoryName);
      if (items.length > 0) {
        groups.push({
          name: categoryName,
          icon: CATEGORY_ICONS[categoryName] || 'pi pi-folder',
          items
        });
      }
    });

    return groups;
  });

  @HostListener('document:keydown', ['$event'])
  handleKeyboardShortcut(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.searchInput?.nativeElement?.focus();
      this.showResults = true;
    }
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-container')) {
      this.showResults = false;
    }
  }

  onSearchFocus(): void {
    this.showResults = true;
  }

  onSearch(): void {
    this.searchSignal.set(this.searchQuery);
    this.showResults = true;
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchSignal.set('');
    this.searchInput?.nativeElement?.focus();
  }

  closeSearch(): void {
    this.showResults = false;
    this.searchInput?.nativeElement?.blur();
  }

  selectComponent(): void {
    this.showResults = false;
    this.searchQuery = '';
    this.searchSignal.set('');
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  ngOnDestroy(): void {
    // Clean up body attribute when leaving DS routes
    this.dsTheme.cleanup();
  }
}
