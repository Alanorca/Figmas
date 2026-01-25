import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { PopoverModule } from 'primeng/popover';
import { ButtonModule } from 'primeng/button';
import { DsPreviewComponent } from '../../../components/ds-preview/ds-preview.component';
import { DsCodeBlockComponent } from '../../../components/ds-code-block/ds-code-block.component';
import { DsPropsTableComponent, ComponentProp } from '../../../components/ds-props-table/ds-props-table.component';
import { DsGuidelinesComponent } from '../../../components/ds-guidelines/ds-guidelines.component';
import { DsCodeTabsComponent, CodeTab } from '../../../components/ds-code-tabs/ds-code-tabs.component';

@Component({
  selector: 'app-ds-tooltips',
  standalone: true,
  imports: [
    CommonModule,
    TooltipModule,
    PopoverModule,
    ButtonModule,
    DsPreviewComponent,
    DsCodeBlockComponent,
    DsPropsTableComponent,
    DsGuidelinesComponent,
    DsCodeTabsComponent
  ],
  templateUrl: './tooltips.component.html',
  styleUrl: './tooltips.component.scss'
})
export class TooltipsComponent {
  guidelinesDos = [
    'Usar tooltips para información adicional breve',
    'Usar popover para contenido más complejo',
    'Mantener el texto del tooltip corto y conciso',
    'Posicionar tooltips donde no bloqueen contenido'
  ];

  guidelinesDonts = [
    'No usar tooltips para información crítica',
    'No poner tooltips en elementos touch-only',
    'No hacer tooltips demasiado largos'
  ];

  tooltipProps: ComponentProp[] = [
    { name: 'pTooltip', type: 'string', description: 'Tooltip text', required: true },
    { name: 'tooltipPosition', type: '"top" | "bottom" | "left" | "right"', default: '"right"', description: 'Position' },
    { name: 'tooltipEvent', type: '"hover" | "focus"', default: '"hover"', description: 'Trigger event' },
    { name: 'showDelay', type: 'number', default: '0', description: 'Show delay in ms' },
    { name: 'hideDelay', type: 'number', default: '0', description: 'Hide delay in ms' }
  ];

  popoverProps: ComponentProp[] = [
    { name: 'appendTo', type: 'string', description: 'Target element for append' },
    { name: 'showCloseIcon', type: 'boolean', default: 'false', description: 'Show close button' }
  ];

  tooltipCode = `<p-button label="Hover me" pTooltip="This is a tooltip" />
<p-button label="Top" pTooltip="Top tooltip" tooltipPosition="top" />
<p-button label="Bottom" pTooltip="Bottom tooltip" tooltipPosition="bottom" />`;

  popoverCode = `<p-button label="Show" (onClick)="op.toggle($event)" />
<p-popover #op>
  <div class="popover-content">
    <h4>Popover Title</h4>
    <p>This is popover content</p>
  </div>
</p-popover>`;

  codeTabs: CodeTab[] = [
    {
      label: 'Tooltip',
      language: 'html',
      icon: 'pi pi-info-circle',
      code: `<!-- Basic -->
<span pTooltip="Tooltip text">Hover me</span>

<!-- Positions -->
<button pTooltip="Top" tooltipPosition="top">Top</button>
<button pTooltip="Bottom" tooltipPosition="bottom">Bottom</button>
<button pTooltip="Left" tooltipPosition="left">Left</button>
<button pTooltip="Right" tooltipPosition="right">Right</button>

<!-- With delay -->
<button pTooltip="Delayed" [showDelay]="500" [hideDelay]="300">Delayed</button>`
    },
    {
      label: 'Popover',
      language: 'html',
      icon: 'pi pi-comment',
      code: `<p-button label="Click me" (onClick)="op.toggle($event)" />

<p-popover #op>
  <div class="p-3">
    <h4 class="mt-0">Details</h4>
    <p>Additional information goes here.</p>
    <p-button label="Action" size="small" />
  </div>
</p-popover>`
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      icon: 'pi pi-file',
      code: `import { Component } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { PopoverModule } from 'primeng/popover';

@Component({
  imports: [TooltipModule, PopoverModule],
  template: \`...\`
})
export class MyComponent {}`
    }
  ];
}
