import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'primeng/tabs';
import { BadgeModule } from 'primeng/badge';
import { DsPreviewComponent } from '../../../components/ds-preview/ds-preview.component';
import { DsCodeBlockComponent } from '../../../components/ds-code-block/ds-code-block.component';
import { DsPropsTableComponent, ComponentProp } from '../../../components/ds-props-table/ds-props-table.component';
import { DsGuidelinesComponent } from '../../../components/ds-guidelines/ds-guidelines.component';
import { DsCodeTabsComponent, CodeTab } from '../../../components/ds-code-tabs/ds-code-tabs.component';

@Component({
  selector: 'app-ds-tabs',
  standalone: true,
  imports: [
    CommonModule,
    TabsModule,
    BadgeModule,
    DsPreviewComponent,
    DsCodeBlockComponent,
    DsPropsTableComponent,
    DsGuidelinesComponent,
    DsCodeTabsComponent
  ],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss'
})
export class TabsComponent {
  activeTab = signal(0);

  guidelinesDos = [
    'Usar tabs para organizar contenido relacionado',
    'Mantener labels cortos y descriptivos',
    'Agregar iconos para mejorar la identificación',
    'Usar badges para indicar notificaciones'
  ];

  guidelinesDonts = [
    'No usar más de 5-7 tabs',
    'No usar tabs para navegación principal (usar menu)',
    'No mezclar tabs con contenido muy diferente'
  ];

  tabsProps: ComponentProp[] = [
    { name: 'value', type: 'number', description: 'Index of active tab' },
    { name: 'scrollable', type: 'boolean', default: 'false', description: 'Enable scrolling for many tabs' }
  ];

  tabListProps: ComponentProp[] = [
    { name: 'value', type: 'string', description: 'Value identifier for the tab', required: true }
  ];

  basicCode = `<p-tabs [value]="activeTab()">
  <p-tablist>
    <p-tab value="0">Tab 1</p-tab>
    <p-tab value="1">Tab 2</p-tab>
    <p-tab value="2">Tab 3</p-tab>
  </p-tablist>
  <p-tabpanels>
    <p-tabpanel value="0">Content 1</p-tabpanel>
    <p-tabpanel value="1">Content 2</p-tabpanel>
    <p-tabpanel value="2">Content 3</p-tabpanel>
  </p-tabpanels>
</p-tabs>`;

  codeTabs: CodeTab[] = [
    {
      label: 'Basic',
      language: 'html',
      icon: 'pi pi-folder',
      code: `<p-tabs [value]="0">
  <p-tablist>
    <p-tab value="0">Overview</p-tab>
    <p-tab value="1">Details</p-tab>
    <p-tab value="2">Settings</p-tab>
  </p-tablist>
  <p-tabpanels>
    <p-tabpanel value="0">Overview content</p-tabpanel>
    <p-tabpanel value="1">Details content</p-tabpanel>
    <p-tabpanel value="2">Settings content</p-tabpanel>
  </p-tabpanels>
</p-tabs>`
    },
    {
      label: 'With Icons',
      language: 'html',
      icon: 'pi pi-star',
      code: `<p-tabs [value]="0">
  <p-tablist>
    <p-tab value="0">
      <i class="pi pi-home mr-2"></i>
      <span>Home</span>
    </p-tab>
    <p-tab value="1">
      <i class="pi pi-user mr-2"></i>
      <span>Profile</span>
    </p-tab>
    <p-tab value="2">
      <i class="pi pi-cog mr-2"></i>
      <span>Settings</span>
    </p-tab>
  </p-tablist>
</p-tabs>`
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      icon: 'pi pi-file',
      code: `import { Component, signal } from '@angular/core';
import { TabsModule } from 'primeng/tabs';

@Component({
  imports: [TabsModule],
  template: \`
    <p-tabs [value]="activeTab()">
      ...
    </p-tabs>
  \`
})
export class MyComponent {
  activeTab = signal(0);
}`
    }
  ];
}
