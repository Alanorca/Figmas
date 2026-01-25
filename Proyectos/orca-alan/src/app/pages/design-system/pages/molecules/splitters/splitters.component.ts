import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SplitterModule } from 'primeng/splitter';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { DsPreviewComponent } from '../../../components/ds-preview/ds-preview.component';
import { DsCodeBlockComponent } from '../../../components/ds-code-block/ds-code-block.component';
import { DsPropsTableComponent, ComponentProp } from '../../../components/ds-props-table/ds-props-table.component';
import { DsGuidelinesComponent } from '../../../components/ds-guidelines/ds-guidelines.component';
import { DsCodeTabsComponent, CodeTab } from '../../../components/ds-code-tabs/ds-code-tabs.component';

@Component({
  selector: 'app-ds-splitters',
  standalone: true,
  imports: [
    CommonModule,
    SplitterModule,
    ScrollPanelModule,
    DsPreviewComponent,
    DsCodeBlockComponent,
    DsPropsTableComponent,
    DsGuidelinesComponent,
    DsCodeTabsComponent
  ],
  templateUrl: './splitters.component.html',
  styleUrl: './splitters.component.scss'
})
export class SplittersComponent {
  guidelinesDos = [
    'Usar Splitter para layouts redimensionables',
    'Usar ScrollPanel para contenido scrolleable',
    'Definir tamaños iniciales apropiados',
    'Considerar contenido mínimo para cada panel'
  ];

  guidelinesDonts = [
    'No anidar demasiados splitters',
    'No usar para contenido muy pequeño',
    'No ocultar el gutter de redimensionado'
  ];

  splitterProps: ComponentProp[] = [
    { name: 'layout', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Orientation of the splitter' },
    { name: 'gutterSize', type: 'number', default: '4', description: 'Size of the divider in pixels' },
    { name: 'panelSizes', type: 'number[]', description: 'Initial size percentages of each panel' },
    { name: 'minSizes', type: 'number[]', description: 'Minimum sizes in pixels for each panel' },
    { name: 'stateKey', type: 'string', description: 'Key to store panel sizes in storage' },
    { name: 'stateStorage', type: "'session' | 'local'", default: "'session'", description: 'Storage type for state' }
  ];

  scrollPanelProps: ComponentProp[] = [
    { name: 'style', type: 'object', description: 'Inline style of the component' },
    { name: 'styleClass', type: 'string', description: 'Style class of the component' }
  ];

  splitterCode = `<p-splitter [style]="{ height: '300px' }">
  <ng-template pTemplate>
    <div class="panel">Panel 1</div>
  </ng-template>
  <ng-template pTemplate>
    <div class="panel">Panel 2</div>
  </ng-template>
</p-splitter>`;

  scrollPanelCode = `<p-scrollpanel [style]="{ width: '100%', height: '200px' }">
  <p>Scrollable content here...</p>
</p-scrollpanel>`;

  codeTabs: CodeTab[] = [
    {
      label: 'Horizontal',
      language: 'html',
      icon: 'pi pi-arrows-h',
      code: `<p-splitter [style]="{ height: '300px' }">
  <ng-template pTemplate>
    <div class="panel">
      <h3>Left Panel</h3>
      <p>Content for the left panel</p>
    </div>
  </ng-template>
  <ng-template pTemplate>
    <div class="panel">
      <h3>Right Panel</h3>
      <p>Content for the right panel</p>
    </div>
  </ng-template>
</p-splitter>`
    },
    {
      label: 'Vertical',
      language: 'html',
      icon: 'pi pi-arrows-v',
      code: `<p-splitter layout="vertical" [style]="{ height: '400px' }">
  <ng-template pTemplate>
    <div class="panel">Top Panel</div>
  </ng-template>
  <ng-template pTemplate>
    <div class="panel">Bottom Panel</div>
  </ng-template>
</p-splitter>`
    },
    {
      label: 'Nested',
      language: 'html',
      icon: 'pi pi-th-large',
      code: `<p-splitter [style]="{ height: '400px' }">
  <ng-template pTemplate>
    <div class="panel">Left Panel</div>
  </ng-template>
  <ng-template pTemplate>
    <p-splitter layout="vertical">
      <ng-template pTemplate>
        <div class="panel">Top Right</div>
      </ng-template>
      <ng-template pTemplate>
        <div class="panel">Bottom Right</div>
      </ng-template>
    </p-splitter>
  </ng-template>
</p-splitter>`
    },
    {
      label: 'ScrollPanel',
      language: 'html',
      icon: 'pi pi-arrows-v',
      code: `<p-scrollpanel [style]="{ width: '100%', height: '200px' }">
  <div class="scrollable-content">
    <p>Long content that scrolls...</p>
  </div>
</p-scrollpanel>

// Custom scrollbar styling
::ng-deep .p-scrollpanel-bar {
  background-color: var(--primary-color);
  opacity: 0.5;
  transition: opacity 0.2s;
}
::ng-deep .p-scrollpanel-bar:hover {
  opacity: 1;
}`
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      icon: 'pi pi-file',
      code: `import { Component } from '@angular/core';
import { SplitterModule } from 'primeng/splitter';
import { ScrollPanelModule } from 'primeng/scrollpanel';

@Component({
  imports: [SplitterModule, ScrollPanelModule],
  template: \`
    <p-splitter [panelSizes]="[30, 70]" [minSizes]="[10, 10]">
      <ng-template pTemplate>
        <p-scrollpanel [style]="{ width: '100%', height: '100%' }">
          <div>Scrollable left panel</div>
        </p-scrollpanel>
      </ng-template>
      <ng-template pTemplate>
        <div>Right panel</div>
      </ng-template>
    </p-splitter>
  \`
})
export class MyComponent {}`
    }
  ];

  loremIpsum = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.

Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.`;
}
