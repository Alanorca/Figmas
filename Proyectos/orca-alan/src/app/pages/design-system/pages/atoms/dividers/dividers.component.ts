import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { DsPreviewComponent } from '../../../components/ds-preview/ds-preview.component';
import { DsCodeBlockComponent } from '../../../components/ds-code-block/ds-code-block.component';
import { DsPropsTableComponent, ComponentProp } from '../../../components/ds-props-table/ds-props-table.component';
import { DsGuidelinesComponent } from '../../../components/ds-guidelines/ds-guidelines.component';
import { DsCodeTabsComponent, CodeTab } from '../../../components/ds-code-tabs/ds-code-tabs.component';

@Component({
  selector: 'app-ds-dividers',
  standalone: true,
  imports: [
    CommonModule,
    DividerModule,
    DsPreviewComponent,
    DsCodeBlockComponent,
    DsPropsTableComponent,
    DsGuidelinesComponent,
    DsCodeTabsComponent
  ],
  templateUrl: './dividers.component.html',
  styleUrl: './dividers.component.scss'
})
export class DividersComponent {
  guidelinesDos = [
    'Usar dividers para separar secciones de contenido',
    'Usar vertical dividers en layouts horizontales',
    'Agregar texto cuando el divider indica una categoría'
  ];

  guidelinesDonts = [
    'No usar demasiados dividers en una misma vista',
    'No usar dividers cuando el espaciado es suficiente',
    'No usar estilos dashed/dotted sin propósito claro'
  ];

  dividerProps: ComponentProp[] = [
    { name: 'layout', type: '"horizontal" | "vertical"', default: '"horizontal"', description: 'Divider orientation' },
    { name: 'type', type: '"solid" | "dashed" | "dotted"', default: '"solid"', description: 'Border style' },
    { name: 'align', type: '"left" | "center" | "right" | "top" | "center" | "bottom"', default: '"center"', description: 'Content alignment' }
  ];

  basicCode = `<p-divider />
<p-divider type="dashed" />
<p-divider type="dotted" />`;

  withTextCode = `<p-divider align="left">
  <span>Left</span>
</p-divider>

<p-divider align="center">
  <span>Center</span>
</p-divider>

<p-divider align="right">
  <span>Right</span>
</p-divider>`;

  verticalCode = `<div class="flex">
  <span>Content 1</span>
  <p-divider layout="vertical" />
  <span>Content 2</span>
  <p-divider layout="vertical" />
  <span>Content 3</span>
</div>`;

  codeTabs: CodeTab[] = [
    {
      label: 'Horizontal',
      language: 'html',
      icon: 'pi pi-minus',
      code: `<!-- Basic -->
<p-divider />

<!-- With styles -->
<p-divider type="solid" />
<p-divider type="dashed" />
<p-divider type="dotted" />

<!-- With content -->
<p-divider align="center">
  <span class="text-color-secondary">OR</span>
</p-divider>`
    },
    {
      label: 'Vertical',
      language: 'html',
      icon: 'pi pi-ellipsis-v',
      code: `<div class="flex align-items-center">
  <span>Left content</span>
  <p-divider layout="vertical" />
  <span>Right content</span>
</div>

<!-- With content -->
<div class="flex align-items-center h-6rem">
  <span>Section A</span>
  <p-divider layout="vertical" align="center">
    <i class="pi pi-star"></i>
  </p-divider>
  <span>Section B</span>
</div>`
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      icon: 'pi pi-file',
      code: `import { Component } from '@angular/core';
import { DividerModule } from 'primeng/divider';

@Component({
  imports: [DividerModule],
  template: \`
    <div class="content-section">
      <h3>Section 1</h3>
      <p>Content here...</p>
    </div>
    <p-divider />
    <div class="content-section">
      <h3>Section 2</h3>
      <p>More content...</p>
    </div>
  \`
})
export class MyComponent {}`
    }
  ];
}
