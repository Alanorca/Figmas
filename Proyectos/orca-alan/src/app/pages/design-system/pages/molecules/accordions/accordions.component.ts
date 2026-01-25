import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';
import { PanelModule } from 'primeng/panel';
import { FieldsetModule } from 'primeng/fieldset';
import { ButtonModule } from 'primeng/button';
import { DsPreviewComponent } from '../../../components/ds-preview/ds-preview.component';
import { DsCodeBlockComponent } from '../../../components/ds-code-block/ds-code-block.component';
import { DsPropsTableComponent, ComponentProp } from '../../../components/ds-props-table/ds-props-table.component';
import { DsGuidelinesComponent } from '../../../components/ds-guidelines/ds-guidelines.component';
import { DsCodeTabsComponent, CodeTab } from '../../../components/ds-code-tabs/ds-code-tabs.component';

@Component({
  selector: 'app-ds-accordions',
  standalone: true,
  imports: [
    CommonModule,
    AccordionModule,
    PanelModule,
    FieldsetModule,
    ButtonModule,
    DsPreviewComponent,
    DsCodeBlockComponent,
    DsPropsTableComponent,
    DsGuidelinesComponent,
    DsCodeTabsComponent
  ],
  templateUrl: './accordions.component.html',
  styleUrl: './accordions.component.scss'
})
export class AccordionsComponent {
  panelCollapsed = signal(false);

  guidelinesDos = [
    'Usar Accordion para agrupar contenido relacionado',
    'Usar Panel para secciones colapsables individuales',
    'Usar Fieldset para agrupar campos de formulario',
    'Mostrar contenido más importante primero'
  ];

  guidelinesDonts = [
    'No anidar accordions dentro de accordions',
    'No usar para contenido que debe estar siempre visible',
    'No poner demasiados items en un accordion'
  ];

  accordionProps: ComponentProp[] = [
    { name: 'multiple', type: 'boolean', default: 'false', description: 'Allow multiple panels open' },
    { name: 'activeIndex', type: 'number | number[]', description: 'Index of active panel(s)' },
    { name: 'expandIcon', type: 'string', default: '"pi pi-chevron-down"', description: 'Expand icon' },
    { name: 'collapseIcon', type: 'string', default: '"pi pi-chevron-up"', description: 'Collapse icon' }
  ];

  panelProps: ComponentProp[] = [
    { name: 'header', type: 'string', description: 'Panel header text' },
    { name: 'toggleable', type: 'boolean', default: 'false', description: 'Enable toggle' },
    { name: 'collapsed', type: 'boolean', default: 'false', description: 'Collapsed state' },
    { name: 'iconPos', type: '"start" | "end"', default: '"end"', description: 'Toggle icon position' }
  ];

  fieldsetProps: ComponentProp[] = [
    { name: 'legend', type: 'string', description: 'Legend text' },
    { name: 'toggleable', type: 'boolean', default: 'false', description: 'Enable toggle' },
    { name: 'collapsed', type: 'boolean', default: 'false', description: 'Collapsed state' }
  ];

  accordionCode = `<p-accordion>
  <p-accordion-panel header="Header 1">
    <p>Content 1</p>
  </p-accordion-panel>
  <p-accordion-panel header="Header 2">
    <p>Content 2</p>
  </p-accordion-panel>
</p-accordion>`;

  panelCode = `<p-panel header="Header" [toggleable]="true">
  <p>Panel content here</p>
</p-panel>`;

  fieldsetCode = `<p-fieldset legend="Contact Info" [toggleable]="true">
  <p>Fieldset content here</p>
</p-fieldset>`;

  codeTabs: CodeTab[] = [
    {
      label: 'Accordion',
      language: 'html',
      icon: 'pi pi-list',
      code: `<p-accordion>
  <p-accordion-panel header="Section 1">
    <p>Content for section 1</p>
  </p-accordion-panel>
  <p-accordion-panel header="Section 2">
    <p>Content for section 2</p>
  </p-accordion-panel>
</p-accordion>

<!-- Multiple panels open -->
<p-accordion [multiple]="true">
  ...
</p-accordion>`
    },
    {
      label: 'Panel',
      language: 'html',
      icon: 'pi pi-window-maximize',
      code: `<p-panel header="Panel Title" [toggleable]="true">
  <ng-template pTemplate="icons">
    <p-button icon="pi pi-cog" [rounded]="true" [text]="true" />
  </ng-template>
  <p>Panel content goes here</p>
</p-panel>`
    },
    {
      label: 'Fieldset',
      language: 'html',
      icon: 'pi pi-stop',
      code: `<p-fieldset legend="Personal Information" [toggleable]="true">
  <div class="field">
    <label>Name</label>
    <input pInputText />
  </div>
  <div class="field">
    <label>Email</label>
    <input pInputText />
  </div>
</p-fieldset>`
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      icon: 'pi pi-file',
      code: `import { Component } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { PanelModule } from 'primeng/panel';
import { FieldsetModule } from 'primeng/fieldset';

@Component({
  imports: [AccordionModule, PanelModule, FieldsetModule],
  template: \`...\`
})
export class MyComponent {}`
    }
  ];
}
