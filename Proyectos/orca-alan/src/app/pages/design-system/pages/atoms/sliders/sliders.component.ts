import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SliderModule } from 'primeng/slider';
import { KnobModule } from 'primeng/knob';
import { RatingModule } from 'primeng/rating';
import { ButtonModule } from 'primeng/button';
import { DsPreviewComponent } from '../../../components/ds-preview/ds-preview.component';
import { DsCodeBlockComponent } from '../../../components/ds-code-block/ds-code-block.component';
import { DsPropsTableComponent, ComponentProp } from '../../../components/ds-props-table/ds-props-table.component';
import { DsGuidelinesComponent } from '../../../components/ds-guidelines/ds-guidelines.component';
import { DsCodeTabsComponent, CodeTab } from '../../../components/ds-code-tabs/ds-code-tabs.component';

@Component({
  selector: 'app-ds-sliders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SliderModule,
    KnobModule,
    RatingModule,
    ButtonModule,
    DsPreviewComponent,
    DsCodeBlockComponent,
    DsPropsTableComponent,
    DsGuidelinesComponent,
    DsCodeTabsComponent
  ],
  templateUrl: './sliders.component.html',
  styleUrl: './sliders.component.scss'
})
export class SlidersComponent {
  // Slider state
  sliderValue = signal(50);
  rangeValues = signal<[number, number]>([20, 80]);

  // Knob state
  knobValue = signal(60);
  temperatureValue = signal(22);

  // Rating state
  ratingValue = signal(3);
  readonlyRating = signal(4);

  // Guidelines
  guidelinesDos = [
    'Mostrar el valor actual del slider',
    'Usar Knob para valores circulares o porcentajes',
    'Usar Rating para calificaciones de 1-5 estrellas',
    'Proporcionar feedback visual durante la interacción'
  ];

  guidelinesDonts = [
    'No usar slider para rangos muy grandes (usar Input Number)',
    'No usar Knob para valores que no sean intuitivamente circulares',
    'No permitir más de 5 estrellas en Rating'
  ];

  // Props
  sliderProps: ComponentProp[] = [
    { name: 'ngModel', type: 'number | [number, number]', description: 'Value of the slider' },
    { name: 'min', type: 'number', default: '0', description: 'Minimum value' },
    { name: 'max', type: 'number', default: '100', description: 'Maximum value' },
    { name: 'step', type: 'number', default: '1', description: 'Step value' },
    { name: 'range', type: 'boolean', default: 'false', description: 'Enable range selection' },
    { name: 'orientation', type: '"horizontal" | "vertical"', default: '"horizontal"', description: 'Slider orientation' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the slider' }
  ];

  knobProps: ComponentProp[] = [
    { name: 'ngModel', type: 'number', description: 'Value of the knob' },
    { name: 'min', type: 'number', default: '0', description: 'Minimum value' },
    { name: 'max', type: 'number', default: '100', description: 'Maximum value' },
    { name: 'step', type: 'number', default: '1', description: 'Step value' },
    { name: 'size', type: 'number', default: '100', description: 'Size in pixels' },
    { name: 'strokeWidth', type: 'number', default: '14', description: 'Width of the stroke' },
    { name: 'showValue', type: 'boolean', default: 'true', description: 'Show value in center' },
    { name: 'valueTemplate', type: 'string', description: 'Template for value display' }
  ];

  ratingProps: ComponentProp[] = [
    { name: 'ngModel', type: 'number', description: 'Selected rating value' },
    { name: 'stars', type: 'number', default: '5', description: 'Number of stars' },
    { name: 'cancel', type: 'boolean', default: 'true', description: 'Allow clearing' },
    { name: 'readonly', type: 'boolean', default: 'false', description: 'Read-only mode' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disabled state' }
  ];

  // Code examples
  sliderCode = `<p-slider [(ngModel)]="value" />
<span>Value: {{ value }}</span>`;

  rangeCode = `<p-slider [(ngModel)]="rangeValues" [range]="true" />
<span>Range: {{ rangeValues[0] }} - {{ rangeValues[1] }}</span>`;

  knobCode = `<p-knob [(ngModel)]="value" />
<p-knob [(ngModel)]="value" valueTemplate="{value}%" />`;

  ratingCode = `<p-rating [(ngModel)]="value" />
<p-rating [(ngModel)]="value" [readonly]="true" />`;

  codeTabs: CodeTab[] = [
    {
      label: 'Slider',
      language: 'html',
      icon: 'pi pi-sliders-h',
      code: `<!-- Basic Slider -->
<p-slider [(ngModel)]="value" />

<!-- With min/max -->
<p-slider [(ngModel)]="value" [min]="0" [max]="100" />

<!-- Range Slider -->
<p-slider [(ngModel)]="rangeValues" [range]="true" />

<!-- Vertical -->
<p-slider [(ngModel)]="value" orientation="vertical" [style]="{'height': '200px'}" />`
    },
    {
      label: 'Knob',
      language: 'html',
      icon: 'pi pi-circle',
      code: `<!-- Basic Knob -->
<p-knob [(ngModel)]="value" />

<!-- With template -->
<p-knob [(ngModel)]="value" valueTemplate="{value}%" />

<!-- Custom size -->
<p-knob [(ngModel)]="value" [size]="150" [strokeWidth]="10" />`
    },
    {
      label: 'Rating',
      language: 'html',
      icon: 'pi pi-star',
      code: `<!-- Basic Rating -->
<p-rating [(ngModel)]="value" />

<!-- Read-only -->
<p-rating [(ngModel)]="value" [readonly]="true" />

<!-- No cancel -->
<p-rating [(ngModel)]="value" [cancel]="false" />`
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      icon: 'pi pi-file',
      code: `import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SliderModule } from 'primeng/slider';
import { KnobModule } from 'primeng/knob';
import { RatingModule } from 'primeng/rating';

@Component({
  imports: [FormsModule, SliderModule, KnobModule, RatingModule],
  template: \`...\`
})
export class MyComponent {
  sliderValue = signal(50);
  rangeValues = signal<[number, number]>([20, 80]);
  knobValue = signal(60);
  ratingValue = signal(3);
}`
    }
  ];

  resetAll(): void {
    this.sliderValue.set(50);
    this.rangeValues.set([20, 80]);
    this.knobValue.set(60);
    this.temperatureValue.set(22);
    this.ratingValue.set(3);
  }
}
