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
    DsPreviewComponent, DsCodeBlockComponent
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
}
