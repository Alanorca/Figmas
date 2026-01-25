import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { DsPreviewComponent } from '../../../components/ds-preview/ds-preview.component';
import { DsCodeBlockComponent } from '../../../components/ds-code-block/ds-code-block.component';
import { DsPropsTableComponent, ComponentProp } from '../../../components/ds-props-table/ds-props-table.component';
import { DsGuidelinesComponent } from '../../../components/ds-guidelines/ds-guidelines.component';
import { DsCodeTabsComponent, CodeTab } from '../../../components/ds-code-tabs/ds-code-tabs.component';

@Component({
  selector: 'app-ds-progress',
  standalone: true,
  imports: [
    CommonModule,
    ProgressBarModule,
    ProgressSpinnerModule,
    SkeletonModule,
    ButtonModule,
    DsPreviewComponent,
    DsCodeBlockComponent,
    DsPropsTableComponent,
    DsGuidelinesComponent,
    DsCodeTabsComponent
  ],
  templateUrl: './progress.component.html',
  styleUrl: './progress.component.scss'
})
export class ProgressComponent implements OnInit, OnDestroy {
  progressValue = signal(0);
  isLoading = signal(false);
  private interval: any;

  guidelinesDos = [
    'Usar ProgressBar para operaciones con progreso conocido',
    'Usar ProgressSpinner para operaciones de duración desconocida',
    'Usar Skeleton para loading de contenido estructurado',
    'Mostrar porcentaje cuando sea relevante'
  ];

  guidelinesDonts = [
    'No usar ProgressBar indeterminado si conoces el progreso',
    'No mostrar múltiples spinners en la misma área',
    'No usar Skeleton para elementos muy pequeños'
  ];

  progressBarProps: ComponentProp[] = [
    { name: 'value', type: 'number', description: 'Current progress value (0-100)' },
    { name: 'mode', type: '"determinate" | "indeterminate"', default: '"determinate"', description: 'Progress mode' },
    { name: 'showValue', type: 'boolean', default: 'true', description: 'Show percentage text' }
  ];

  spinnerProps: ComponentProp[] = [
    { name: 'strokeWidth', type: 'string', default: '"2"', description: 'Width of the stroke' },
    { name: 'fill', type: 'string', default: '"none"', description: 'Fill color' },
    { name: 'animationDuration', type: 'string', default: '"2s"', description: 'Animation duration' }
  ];

  skeletonProps: ComponentProp[] = [
    { name: 'shape', type: '"rectangle" | "circle"', default: '"rectangle"', description: 'Shape of skeleton' },
    { name: 'width', type: 'string', default: '"100%"', description: 'Width' },
    { name: 'height', type: 'string', default: '"1rem"', description: 'Height' },
    { name: 'animation', type: '"wave" | "none"', default: '"wave"', description: 'Animation type' }
  ];

  progressBarCode = `<p-progressbar [value]="progress" />
<p-progressbar [value]="progress" [showValue]="false" />
<p-progressbar mode="indeterminate" [style]="{'height': '6px'}" />`;

  spinnerCode = `<p-progressSpinner />
<p-progressSpinner strokeWidth="4" />
<p-progressSpinner [style]="{'width': '50px', 'height': '50px'}" />`;

  skeletonCode = `<!-- Text lines -->
<p-skeleton width="100%" height="1rem" />
<p-skeleton width="75%" height="1rem" />

<!-- Circle avatar -->
<p-skeleton shape="circle" width="4rem" height="4rem" />

<!-- Card skeleton -->
<p-skeleton width="100%" height="150px" />`;

  codeTabs: CodeTab[] = [
    {
      label: 'ProgressBar',
      language: 'html',
      icon: 'pi pi-percentage',
      code: `<!-- Determinate -->
<p-progressbar [value]="progressValue" />

<!-- Without value text -->
<p-progressbar [value]="progressValue" [showValue]="false" />

<!-- Indeterminate -->
<p-progressbar mode="indeterminate" />`
    },
    {
      label: 'Spinner',
      language: 'html',
      icon: 'pi pi-spinner',
      code: `<!-- Default -->
<p-progressSpinner />

<!-- Custom stroke -->
<p-progressSpinner strokeWidth="4" />

<!-- Custom size -->
<p-progressSpinner [style]="{'width': '50px', 'height': '50px'}" />`
    },
    {
      label: 'Skeleton',
      language: 'html',
      icon: 'pi pi-box',
      code: `<!-- Text skeleton -->
<p-skeleton width="100%" height="1rem" />

<!-- Circle skeleton -->
<p-skeleton shape="circle" width="3rem" height="3rem" />

<!-- Card skeleton -->
<div class="card-skeleton">
  <p-skeleton width="100%" height="150px" />
  <p-skeleton width="80%" height="1.5rem" styleClass="mt-2" />
  <p-skeleton width="60%" height="1rem" styleClass="mt-2" />
</div>`
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      icon: 'pi pi-file',
      code: `import { Component, signal } from '@angular/core';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  imports: [ProgressBarModule, ProgressSpinnerModule, SkeletonModule],
  template: \`
    <p-progressbar [value]="progress()" />
    <p-progressSpinner *ngIf="isLoading()" />
    <p-skeleton *ngIf="isLoading()" width="100%" height="2rem" />
  \`
})
export class MyComponent {
  progress = signal(0);
  isLoading = signal(true);
}`
    }
  ];

  ngOnInit(): void {
    this.startProgress();
  }

  ngOnDestroy(): void {
    this.stopProgress();
  }

  startProgress(): void {
    this.progressValue.set(0);
    this.interval = setInterval(() => {
      const val = this.progressValue();
      if (val >= 100) {
        this.progressValue.set(0);
      } else {
        this.progressValue.update(v => v + 5);
      }
    }, 500);
  }

  stopProgress(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  toggleLoading(): void {
    this.isLoading.update(v => !v);
  }
}
