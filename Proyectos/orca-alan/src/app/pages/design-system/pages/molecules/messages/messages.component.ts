import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { DsPreviewComponent } from '../../../components/ds-preview/ds-preview.component';
import { DsCodeBlockComponent } from '../../../components/ds-code-block/ds-code-block.component';
import { DsPropsTableComponent, ComponentProp } from '../../../components/ds-props-table/ds-props-table.component';
import { DsGuidelinesComponent } from '../../../components/ds-guidelines/ds-guidelines.component';
import { DsCodeTabsComponent, CodeTab } from '../../../components/ds-code-tabs/ds-code-tabs.component';

@Component({
  selector: 'app-ds-messages',
  standalone: true,
  imports: [
    CommonModule,
    MessageModule,
    ToastModule,
    ButtonModule,
    DsPreviewComponent,
    DsCodeBlockComponent,
    DsPropsTableComponent,
    DsGuidelinesComponent,
    DsCodeTabsComponent
  ],
  providers: [MessageService],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss'
})
export class MessagesComponent {
  private messageService = inject(MessageService);

  guidelinesDos = [
    'Usar Message inline para feedback contextual',
    'Usar Toast para notificaciones temporales',
    'Elegir severity apropiado para el mensaje',
    'Proveer acciones claras cuando sea necesario'
  ];

  guidelinesDonts = [
    'No mostrar múltiples toasts simultáneos',
    'No usar success para errores o viceversa',
    'No hacer toasts con duración muy corta'
  ];

  messageProps: ComponentProp[] = [
    { name: 'severity', type: '"success" | "info" | "warn" | "error" | "secondary" | "contrast"', description: 'Severity level' },
    { name: 'text', type: 'string', description: 'Message text' },
    { name: 'icon', type: 'string', description: 'Custom icon' },
    { name: 'closable', type: 'boolean', default: 'false', description: 'Show close button' }
  ];

  toastProps: ComponentProp[] = [
    { name: 'position', type: 'string', default: '"top-right"', description: 'Toast position' },
    { name: 'key', type: 'string', description: 'Unique key for targeting' }
  ];

  messageCode = `<p-message severity="success" text="Success message" />
<p-message severity="info" text="Info message" />
<p-message severity="warn" text="Warning message" />
<p-message severity="error" text="Error message" />`;

  toastCode = `// In template
<p-toast />
<p-button (onClick)="showToast()" label="Show" />

// In component
showToast() {
  this.messageService.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Operation completed'
  });
}`;

  codeTabs: CodeTab[] = [
    {
      label: 'Message',
      language: 'html',
      icon: 'pi pi-info-circle',
      code: `<!-- Severities -->
<p-message severity="success" text="Success message" />
<p-message severity="info" text="Info message" />
<p-message severity="warn" text="Warning message" />
<p-message severity="error" text="Error message" />

<!-- With icon -->
<p-message severity="info" icon="pi pi-check" text="Custom icon" />

<!-- Closable -->
<p-message severity="warn" text="Dismissible" [closable]="true" />`
    },
    {
      label: 'Toast',
      language: 'html',
      icon: 'pi pi-bell',
      code: `<p-toast />
<p-toast position="top-left" key="tl" />
<p-toast position="bottom-right" key="br" />

<!-- Usage -->
<p-button (onClick)="showSuccess()" label="Success" />
<p-button (onClick)="showError()" label="Error" />`
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      icon: 'pi pi-file',
      code: `import { Component, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';

@Component({
  imports: [ToastModule, MessageModule],
  providers: [MessageService],
  template: \`<p-toast />\`
})
export class MyComponent {
  private messageService = inject(MessageService);

  showSuccess() {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Operation completed',
      life: 3000
    });
  }

  showError() {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Something went wrong'
    });
  }
}`
    }
  ];

  showToast(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail, life: 3000 });
  }
}
