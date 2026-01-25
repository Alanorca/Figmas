import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepsModule } from 'primeng/steps';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { DsPreviewComponent } from '../../../components/ds-preview/ds-preview.component';
import { DsCodeBlockComponent } from '../../../components/ds-code-block/ds-code-block.component';
import { DsPropsTableComponent, ComponentProp } from '../../../components/ds-props-table/ds-props-table.component';
import { DsGuidelinesComponent } from '../../../components/ds-guidelines/ds-guidelines.component';
import { DsCodeTabsComponent, CodeTab } from '../../../components/ds-code-tabs/ds-code-tabs.component';

@Component({
  selector: 'app-ds-steppers',
  standalone: true,
  imports: [
    CommonModule,
    StepsModule,
    StepperModule,
    ButtonModule,
    DsPreviewComponent,
    DsCodeBlockComponent,
    DsPropsTableComponent,
    DsGuidelinesComponent,
    DsCodeTabsComponent
  ],
  templateUrl: './steppers.component.html',
  styleUrl: './steppers.component.scss'
})
export class SteppersComponent {
  activeIndex = signal(0);
  stepperValue = 0;

  items: MenuItem[] = [
    { label: 'Personal Info' },
    { label: 'Address' },
    { label: 'Payment' },
    { label: 'Confirmation' }
  ];

  guidelinesDos = [
    'Usar Steps para mostrar progreso en un proceso',
    'Usar Stepper para wizards interactivos',
    'Mantener los labels cortos y descriptivos',
    'Mostrar claramente el paso actual'
  ];

  guidelinesDonts = [
    'No usar más de 5-7 pasos',
    'No permitir saltar pasos sin validación',
    'No usar para navegación principal'
  ];

  stepsProps: ComponentProp[] = [
    { name: 'model', type: 'MenuItem[]', description: 'Array of step items', required: true },
    { name: 'activeIndex', type: 'number', default: '0', description: 'Index of active step' },
    { name: 'readonly', type: 'boolean', default: 'true', description: 'Allow step selection' }
  ];

  stepperProps: ComponentProp[] = [
    { name: 'value', type: 'number', default: '0', description: 'Active step index (two-way binding)' },
    { name: 'linear', type: 'boolean', default: 'false', description: 'Linear progression only' }
  ];

  stepsCode = `<p-steps [model]="items" [activeIndex]="activeIndex()" />`;

  stepperCode = `<p-stepper [(value)]="stepperValue" [linear]="false">
  <p-step-list>
    <p-step [value]="0">
      <ng-template #content let-activateCallback="activateCallback">
        <button class="p-step-header" (click)="activateCallback()">
          <span class="p-step-number">1</span>
          <span class="p-step-title">Step 1</span>
        </button>
      </ng-template>
    </p-step>
  </p-step-list>
  <p-step-panels>
    <p-step-panel [value]="0">
      <ng-template #content let-activateCallback="activateCallback">
        <p>Step content</p>
        <p-button label="Next" (onClick)="activateCallback(1)" />
      </ng-template>
    </p-step-panel>
  </p-step-panels>
</p-stepper>`;

  codeTabs: CodeTab[] = [
    {
      label: 'Steps',
      language: 'html',
      icon: 'pi pi-list',
      code: `<p-steps [model]="items" [activeIndex]="activeIndex()" />

// Component
items: MenuItem[] = [
  { label: 'Personal Info' },
  { label: 'Address' },
  { label: 'Payment' },
  { label: 'Confirmation' }
];
activeIndex = signal(0);`
    },
    {
      label: 'Stepper',
      language: 'html',
      icon: 'pi pi-step-forward',
      code: `<p-stepper [(value)]="stepperValue" [linear]="false">
  <p-step-list>
    <p-step [value]="0">
      <ng-template #content let-activateCallback="activateCallback">
        <button class="p-step-header" (click)="activateCallback()">
          <span class="p-step-number">1</span>
          <span class="p-step-title">Personal</span>
        </button>
      </ng-template>
    </p-step>
    <p-step [value]="1">
      <ng-template #content let-activateCallback="activateCallback">
        <button class="p-step-header" (click)="activateCallback()">
          <span class="p-step-number">2</span>
          <span class="p-step-title">Address</span>
        </button>
      </ng-template>
    </p-step>
  </p-step-list>
  <p-step-panels>
    <p-step-panel [value]="0">
      <ng-template #content let-activateCallback="activateCallback">
        <div class="step-content">Step 1 content</div>
        <div class="step-actions">
          <p-button label="Next" (onClick)="activateCallback(1)" />
        </div>
      </ng-template>
    </p-step-panel>
    <p-step-panel [value]="1">
      <ng-template #content let-activateCallback="activateCallback">
        <div class="step-content">Step 2 content</div>
        <div class="step-actions">
          <p-button label="Back" severity="secondary" (onClick)="activateCallback(0)" />
        </div>
      </ng-template>
    </p-step-panel>
  </p-step-panels>
</p-stepper>`
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      icon: 'pi pi-file',
      code: `import { Component, signal } from '@angular/core';
import { StepsModule } from 'primeng/steps';
import { StepperModule } from 'primeng/stepper';
import { MenuItem } from 'primeng/api';

@Component({
  imports: [StepsModule, StepperModule],
  template: \`...\`
})
export class MyComponent {
  activeIndex = signal(0);
  stepperValue = 0;

  items: MenuItem[] = [
    { label: 'Step 1' },
    { label: 'Step 2' },
    { label: 'Step 3' }
  ];
}`
    }
  ];

  nextStep(): void {
    if (this.activeIndex() < this.items.length - 1) {
      this.activeIndex.update(i => i + 1);
    }
  }

  prevStep(): void {
    if (this.activeIndex() > 0) {
      this.activeIndex.update(i => i - 1);
    }
  }
}
