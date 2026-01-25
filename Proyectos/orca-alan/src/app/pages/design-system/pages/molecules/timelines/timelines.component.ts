import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineModule } from 'primeng/timeline';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DsPreviewComponent } from '../../../components/ds-preview/ds-preview.component';
import { DsCodeBlockComponent } from '../../../components/ds-code-block/ds-code-block.component';
import { DsPropsTableComponent, ComponentProp } from '../../../components/ds-props-table/ds-props-table.component';
import { DsGuidelinesComponent } from '../../../components/ds-guidelines/ds-guidelines.component';
import { DsCodeTabsComponent, CodeTab } from '../../../components/ds-code-tabs/ds-code-tabs.component';

interface TimelineEvent {
  status: string;
  date: string;
  icon: string;
  color: string;
  description?: string;
}

@Component({
  selector: 'app-ds-timelines',
  standalone: true,
  imports: [
    CommonModule,
    TimelineModule,
    CardModule,
    ButtonModule,
    DsPreviewComponent,
    DsCodeBlockComponent,
    DsPropsTableComponent,
    DsGuidelinesComponent,
    DsCodeTabsComponent
  ],
  templateUrl: './timelines.component.html',
  styleUrl: './timelines.component.scss'
})
export class TimelinesComponent {
  events: TimelineEvent[] = [
    { status: 'Ordered', date: '15/10/2024 10:30', icon: 'pi pi-shopping-cart', color: 'var(--blue-500)', description: 'Order placed successfully' },
    { status: 'Processing', date: '15/10/2024 14:00', icon: 'pi pi-cog', color: 'var(--orange-500)', description: 'Order is being processed' },
    { status: 'Shipped', date: '16/10/2024 09:00', icon: 'pi pi-send', color: 'var(--green-500)', description: 'Package shipped via express' },
    { status: 'Delivered', date: '17/10/2024 16:15', icon: 'pi pi-check', color: 'var(--cyan-500)', description: 'Package delivered' }
  ];

  horizontalEvents: TimelineEvent[] = [
    { status: '2020', date: 'Founded', icon: 'pi pi-star', color: 'var(--primary-color)' },
    { status: '2021', date: 'First Product', icon: 'pi pi-box', color: 'var(--green-500)' },
    { status: '2022', date: '1M Users', icon: 'pi pi-users', color: 'var(--orange-500)' },
    { status: '2024', date: 'Global', icon: 'pi pi-globe', color: 'var(--cyan-500)' }
  ];

  guidelinesDos = [
    'Usar para mostrar secuencias cronológicas',
    'Incluir fechas o marcas de tiempo claras',
    'Usar iconos consistentes para cada tipo de evento',
    'Mantener descripciones concisas'
  ];

  guidelinesDonts = [
    'No usar para listas sin orden temporal',
    'No sobrecargar con demasiada información por evento',
    'No mezclar direcciones (horizontal/vertical) en la misma vista'
  ];

  timelineProps: ComponentProp[] = [
    { name: 'value', type: 'array', description: 'Array of events to display', required: true },
    { name: 'layout', type: "'vertical' | 'horizontal'", default: "'vertical'", description: 'Orientation of the timeline' },
    { name: 'align', type: "'left' | 'right' | 'alternate'", default: "'left'", description: 'Position of content relative to marker' }
  ];

  basicCode = `<p-timeline [value]="events">
  <ng-template pTemplate="content" let-event>
    <p>{{ event.status }}</p>
  </ng-template>
</p-timeline>`;

  codeTabs: CodeTab[] = [
    {
      label: 'Basic',
      language: 'html',
      icon: 'pi pi-code',
      code: `<p-timeline [value]="events">
  <ng-template pTemplate="content" let-event>
    <p class="event-status">{{ event.status }}</p>
    <small class="event-date">{{ event.date }}</small>
  </ng-template>
</p-timeline>`
    },
    {
      label: 'With Icons',
      language: 'html',
      icon: 'pi pi-star',
      code: `<p-timeline [value]="events" align="alternate">
  <ng-template pTemplate="marker" let-event>
    <span class="custom-marker" [style.backgroundColor]="event.color">
      <i [class]="event.icon"></i>
    </span>
  </ng-template>
  <ng-template pTemplate="content" let-event>
    <p-card [header]="event.status" [subheader]="event.date">
      <p>{{ event.description }}</p>
    </p-card>
  </ng-template>
</p-timeline>`
    },
    {
      label: 'Horizontal',
      language: 'html',
      icon: 'pi pi-arrows-h',
      code: `<p-timeline [value]="events" layout="horizontal" align="bottom">
  <ng-template pTemplate="marker" let-event>
    <span class="custom-marker" [style.backgroundColor]="event.color">
      <i [class]="event.icon"></i>
    </span>
  </ng-template>
  <ng-template pTemplate="content" let-event>
    <p>{{ event.status }}</p>
  </ng-template>
</p-timeline>`
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      icon: 'pi pi-file',
      code: `import { Component } from '@angular/core';
import { TimelineModule } from 'primeng/timeline';

interface TimelineEvent {
  status: string;
  date: string;
  icon: string;
  color: string;
}

@Component({
  imports: [TimelineModule],
  template: \`...\`
})
export class MyComponent {
  events: TimelineEvent[] = [
    { status: 'Ordered', date: '15/10/2024', icon: 'pi pi-shopping-cart', color: '#2196F3' },
    { status: 'Processing', date: '15/10/2024', icon: 'pi pi-cog', color: '#FF9800' },
    { status: 'Shipped', date: '16/10/2024', icon: 'pi pi-send', color: '#4CAF50' },
    { status: 'Delivered', date: '17/10/2024', icon: 'pi pi-check', color: '#00BCD4' }
  ];
}`
    }
  ];
}
