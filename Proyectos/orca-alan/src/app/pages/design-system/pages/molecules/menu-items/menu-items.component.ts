import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ContextMenuModule } from 'primeng/contextmenu';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { BadgeModule } from 'primeng/badge';
import { MenuItem, MessageService } from 'primeng/api';
import { DsPreviewComponent } from '../../../components/ds-preview/ds-preview.component';
import { DsCodeBlockComponent } from '../../../components/ds-code-block/ds-code-block.component';
import { DsCodeTabsComponent, CodeTab } from '../../../components/ds-code-tabs/ds-code-tabs.component';

interface BreadcrumbLevel {
  label: string;
  icon?: string;
}

@Component({
  selector: 'app-ds-menu-items',
  standalone: true,
  imports: [
    CommonModule, MenuModule, MenubarModule, BreadcrumbModule,
    ContextMenuModule, ButtonModule, ToastModule, BadgeModule,
    DsPreviewComponent, DsCodeBlockComponent, DsCodeTabsComponent
  ],
  providers: [MessageService],
  templateUrl: './menu-items.component.html',
  styleUrl: './menu-items.component.scss'
})
export class MenuItemsComponent {
  // Interactive state
  selectedMenuItem = signal<string>('');
  notificationCount = signal(5);
  currentPath = signal<BreadcrumbLevel[]>([
    { label: 'Home', icon: 'pi pi-home' }
  ]);

  // Computed breadcrumb items
  breadcrumbItems = computed(() => {
    return this.currentPath().map((item, index) => ({
      label: item.label,
      icon: item.icon,
      command: () => this.navigateTo(index)
    }));
  });

  // Interactive menu with commands
  interactiveMenu: MenuItem[] = [];

  constructor(private messageService: MessageService) {
    this.initializeMenus();
  }

  private initializeMenus(): void {
    this.interactiveMenu = [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        command: () => this.onMenuSelect('Dashboard')
      },
      {
        label: 'Projects',
        icon: 'pi pi-folder',
        badge: '3',
        command: () => this.onMenuSelect('Projects')
      },
      {
        label: 'Messages',
        icon: 'pi pi-envelope',
        badge: '5',
        command: () => this.onMenuSelect('Messages')
      },
      {
        label: 'Reports',
        icon: 'pi pi-chart-bar',
        items: [
          {
            label: 'Monthly',
            icon: 'pi pi-calendar',
            command: () => this.onMenuSelect('Monthly Reports')
          },
          {
            label: 'Annual',
            icon: 'pi pi-history',
            command: () => this.onMenuSelect('Annual Reports')
          }
        ]
      },
      { separator: true },
      {
        label: 'Settings',
        icon: 'pi pi-cog',
        command: () => this.onMenuSelect('Settings')
      },
      {
        label: 'Logout',
        icon: 'pi pi-sign-out',
        command: () => this.onMenuSelect('Logout')
      }
    ];
  }

  // Simple menus for basic demo
  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-home' },
    { label: 'Projects', icon: 'pi pi-folder' },
    { label: 'Settings', icon: 'pi pi-cog' },
    { separator: true },
    { label: 'Logout', icon: 'pi pi-sign-out' }
  ];

  menubarItems: MenuItem[] = [
    {
      label: 'File',
      icon: 'pi pi-file',
      items: [
        { label: 'New', icon: 'pi pi-plus', command: () => this.onMenubarAction('New File') },
        { label: 'Open', icon: 'pi pi-folder-open', command: () => this.onMenubarAction('Open File') },
        { separator: true },
        { label: 'Save', icon: 'pi pi-save', command: () => this.onMenubarAction('Save') },
        { label: 'Save As', icon: 'pi pi-save', command: () => this.onMenubarAction('Save As') }
      ]
    },
    {
      label: 'Edit',
      icon: 'pi pi-pencil',
      items: [
        { label: 'Undo', icon: 'pi pi-undo', shortcut: '⌘Z', command: () => this.onMenubarAction('Undo') },
        { label: 'Redo', icon: 'pi pi-refresh', shortcut: '⌘Y', command: () => this.onMenubarAction('Redo') },
        { separator: true },
        { label: 'Cut', icon: 'pi pi-times', shortcut: '⌘X', command: () => this.onMenubarAction('Cut') },
        { label: 'Copy', icon: 'pi pi-copy', shortcut: '⌘C', command: () => this.onMenubarAction('Copy') },
        { label: 'Paste', icon: 'pi pi-clipboard', shortcut: '⌘V', command: () => this.onMenubarAction('Paste') }
      ]
    },
    {
      label: 'View',
      icon: 'pi pi-eye',
      items: [
        { label: 'Zoom In', icon: 'pi pi-search-plus', command: () => this.onMenubarAction('Zoom In') },
        { label: 'Zoom Out', icon: 'pi pi-search-minus', command: () => this.onMenubarAction('Zoom Out') },
        { separator: true },
        { label: 'Full Screen', icon: 'pi pi-window-maximize', command: () => this.onMenubarAction('Full Screen') }
      ]
    },
    {
      label: 'Help',
      icon: 'pi pi-question-circle',
      items: [
        { label: 'Documentation', icon: 'pi pi-book', command: () => this.onMenubarAction('Documentation') },
        { label: 'About', icon: 'pi pi-info-circle', command: () => this.onMenubarAction('About') }
      ]
    }
  ];

  contextMenuItems: MenuItem[] = [
    { label: 'View', icon: 'pi pi-eye', command: () => this.onContextAction('View') },
    { label: 'Edit', icon: 'pi pi-pencil', command: () => this.onContextAction('Edit') },
    { label: 'Duplicate', icon: 'pi pi-copy', command: () => this.onContextAction('Duplicate') },
    { separator: true },
    { label: 'Delete', icon: 'pi pi-trash', command: () => this.onContextAction('Delete') }
  ];

  // Breadcrumb navigation
  folders: BreadcrumbLevel[] = [
    { label: 'Documents', icon: 'pi pi-folder' },
    { label: 'Projects', icon: 'pi pi-briefcase' },
    { label: 'Images', icon: 'pi pi-image' },
    { label: 'Archive', icon: 'pi pi-box' }
  ];

  onMenuSelect(item: string): void {
    this.selectedMenuItem.set(item);
    this.messageService.add({
      severity: 'info',
      summary: 'Menu Selected',
      detail: `You selected: ${item}`
    });
  }

  onMenubarAction(action: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Action Executed',
      detail: `${action} action triggered`
    });
  }

  onContextAction(action: string): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Context Menu',
      detail: `${action} selected from context menu`
    });
  }

  navigateToFolder(folder: BreadcrumbLevel): void {
    this.currentPath.update(path => [...path, folder]);
    this.messageService.add({
      severity: 'info',
      summary: 'Navigation',
      detail: `Navigated to ${folder.label}`
    });
  }

  navigateTo(index: number): void {
    this.currentPath.update(path => path.slice(0, index + 1));
    const item = this.currentPath()[index];
    this.messageService.add({
      severity: 'info',
      summary: 'Navigation',
      detail: `Navigated back to ${item.label}`
    });
  }

  goHome(): void {
    this.currentPath.set([{ label: 'Home', icon: 'pi pi-home' }]);
    this.messageService.add({
      severity: 'info',
      summary: 'Navigation',
      detail: 'Returned to Home'
    });
  }

  menuCode = `<p-menu [model]="items" />

items: MenuItem[] = [
  { label: 'Dashboard', icon: 'pi pi-home' },
  { label: 'Projects', icon: 'pi pi-folder' },
  { label: 'Settings', icon: 'pi pi-cog' },
  { separator: true },
  { label: 'Logout', icon: 'pi pi-sign-out' }
];`;

  menubarCode = `<p-menubar [model]="items" />

items: MenuItem[] = [
  {
    label: 'File',
    icon: 'pi pi-file',
    items: [
      { label: 'New', icon: 'pi pi-plus' },
      { label: 'Open', icon: 'pi pi-folder-open' }
    ]
  },
  { label: 'Edit', icon: 'pi pi-pencil' }
];`;

  breadcrumbCode = `<p-breadcrumb [model]="items" [home]="home" />

items: MenuItem[] = [
  { label: 'Projects' },
  { label: 'ORCA' },
  { label: 'Settings' }
];

home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };`;

  interactiveCode = `// Interactive menu with commands
interactiveMenu: MenuItem[] = [
  {
    label: 'Dashboard',
    icon: 'pi pi-home',
    command: () => this.onMenuSelect('Dashboard')
  },
  {
    label: 'Messages',
    icon: 'pi pi-envelope',
    badge: '5',
    command: () => this.onMenuSelect('Messages')
  },
  { separator: true },
  {
    label: 'Settings',
    icon: 'pi pi-cog',
    command: () => this.onMenuSelect('Settings')
  }
];

onMenuSelect(item: string): void {
  this.messageService.add({
    severity: 'info',
    summary: 'Menu Selected',
    detail: \`You selected: \${item}\`
  });
}`;

  // ============ Multi Colored Sidebar ============
  activeIconTab = signal<number>(0);
  activeFavorite = signal<string>('account');
  sidebarExpanded = signal<boolean>(true);

  iconMenuItems = [
    { icon: 'pi pi-home', label: 'Home' },
    { icon: 'pi pi-bookmark', label: 'Bookmarks' },
    { icon: 'pi pi-users', label: 'Users' },
    { icon: 'pi pi-comments', label: 'Messages' },
    { icon: 'pi pi-calendar', label: 'Calendar' }
  ];

  favoriteItems = [
    { id: 'account', icon: 'pi pi-user', label: 'Account' },
    { id: 'permissions', icon: 'pi pi-lock', label: 'Permissions' },
    { id: 'profiles', icon: 'pi pi-user', label: 'Saved Profiles' },
    { id: 'privacy', icon: 'pi pi-eye', label: 'Privacy' }
  ];

  selectIconTab(index: number): void {
    this.activeIconTab.set(index);
    this.messageService.add({
      severity: 'info',
      summary: 'Tab Selected',
      detail: `Selected: ${this.iconMenuItems[index].label}`
    });
  }

  selectFavorite(id: string): void {
    this.activeFavorite.set(id);
    const item = this.favoriteItems.find(f => f.id === id);
    this.messageService.add({
      severity: 'info',
      summary: 'Favorite Selected',
      detail: `Selected: ${item?.label}`
    });
  }

  multiColoredCodeTabs: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      icon: 'pi pi-code',
      code: `<div class="multi-colored-sidebar">
  <!-- Icon Bar (Primary Dark) -->
  <div class="icon-bar">
    <div class="logo">
      <i class="pi pi-prime"></i>
    </div>
    <nav class="icon-nav">
      @for (item of iconMenuItems; track item.icon; let i = $index) {
        <a
          class="icon-item"
          [class.active]="activeIconTab() === i"
          (click)="selectIconTab(i)"
        >
          <i [class]="item.icon"></i>
        </a>
      }
    </nav>
    <div class="icon-footer">
      <img src="avatar.png" class="user-avatar" />
    </div>
  </div>

  <!-- Favorites Panel (Primary Medium) -->
  <div class="favorites-panel">
    <h3>Favorites</h3>
    <nav class="favorites-nav">
      @for (item of favoriteItems; track item.id) {
        <a
          class="favorite-item"
          [class.active]="activeFavorite() === item.id"
          (click)="selectFavorite(item.id)"
        >
          <i [class]="item.icon"></i>
          <span>{{ item.label }}</span>
        </a>
      }
    </nav>
  </div>
</div>`
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      icon: 'pi pi-file',
      code: `import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-multi-colored-sidebar',
  templateUrl: './multi-colored-sidebar.component.html',
  styleUrl: './multi-colored-sidebar.component.scss'
})
export class MultiColoredSidebarComponent {
  activeIconTab = signal<number>(0);
  activeFavorite = signal<string>('account');

  iconMenuItems = [
    { icon: 'pi pi-home', label: 'Home' },
    { icon: 'pi pi-bookmark', label: 'Bookmarks' },
    { icon: 'pi pi-users', label: 'Users' },
    { icon: 'pi pi-comments', label: 'Messages' },
    { icon: 'pi pi-calendar', label: 'Calendar' }
  ];

  favoriteItems = [
    { id: 'account', icon: 'pi pi-user', label: 'Account' },
    { id: 'permissions', icon: 'pi pi-lock', label: 'Permissions' },
    { id: 'profiles', icon: 'pi pi-user', label: 'Saved Profiles' },
    { id: 'privacy', icon: 'pi pi-eye', label: 'Privacy' }
  ];

  selectIconTab(index: number): void {
    this.activeIconTab.set(index);
  }

  selectFavorite(id: string): void {
    this.activeFavorite.set(id);
  }
}`
    },
    {
      label: 'SCSS',
      language: 'scss',
      icon: 'pi pi-palette',
      code: `.multi-colored-sidebar {
  display: flex;
  height: 400px;
}

// Icon Bar - Primary Dark
.icon-bar {
  display: flex;
  flex-direction: column;
  background: var(--primary-700);
  padding: 1rem 0;

  .dark-mode & {
    background: var(--primary-500);
  }
}

.icon-item {
  padding: 0.5rem 1rem;
  color: var(--primary-contrast-color);
  cursor: pointer;
  border-radius: var(--border-radius);
  margin: 0.25rem 0.5rem;
  transition: background 0.2s;

  &:hover {
    background: var(--primary-600);
  }

  &.active {
    background: var(--primary-600);
  }

  .dark-mode &:hover,
  .dark-mode &.active {
    background: var(--primary-400);
  }
}

// Favorites Panel - Primary Medium
.favorites-panel {
  background: var(--primary-500);
  padding: 1rem;
  width: 200px;
  color: var(--primary-contrast-color);

  .dark-mode & {
    background: var(--primary-400);
  }
}

.favorite-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  color: var(--primary-contrast-color);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: var(--primary-600);
  }

  &.active {
    background: var(--primary-600);
  }

  .dark-mode &:hover,
  .dark-mode &.active {
    background: var(--primary-300);
  }
}`
    }
  ];
}
