import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DsPreviewComponent } from '../../../components/ds-preview/ds-preview.component';
import { DsCodeBlockComponent } from '../../../components/ds-code-block/ds-code-block.component';
import { DsPropsTableComponent, ComponentProp } from '../../../components/ds-props-table/ds-props-table.component';

@Component({
  selector: 'app-ds-buttons',
  standalone: true,
  imports: [CommonModule, ButtonModule, ToastModule, DsPreviewComponent, DsCodeBlockComponent, DsPropsTableComponent],
  providers: [MessageService],
  templateUrl: './buttons.component.html',
  styleUrl: './buttons.component.scss'
})
export class ButtonsComponent {
  // Interactive state
  isLoading = signal(false);
  clickCount = signal(0);
  selectedSeverity = signal<string>('primary');

  buttonProps: ComponentProp[] = [
    { name: 'label', type: 'string', description: 'Text of the button' },
    { name: 'icon', type: 'string', description: 'Name of the icon (PrimeIcons)' },
    { name: 'iconPos', type: '"left" | "right" | "top" | "bottom"', default: '"left"', description: 'Position of the icon' },
    { name: 'severity', type: 'string', description: 'Severity level: "success", "info", "warn", "danger", "help", "secondary", "contrast"' },
    { name: 'raised', type: 'boolean', default: 'false', description: 'Add a shadow to indicate elevation' },
    { name: 'rounded', type: 'boolean', default: 'false', description: 'Add a circular border radius' },
    { name: 'text', type: 'boolean', default: 'false', description: 'Text only button without background' },
    { name: 'outlined', type: 'boolean', default: 'false', description: 'Outlined button with transparent background' },
    { name: 'loading', type: 'boolean', default: 'false', description: 'Shows a loader icon' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the button' },
    { name: 'size', type: '"small" | "large"', description: 'Button size' }
  ];

  basicCode = `<p-button label="Primary" (onClick)="onAction()" />
<p-button label="Secondary" severity="secondary" />
<p-button label="Success" severity="success" />
<p-button label="Info" severity="info" />
<p-button label="Warn" severity="warn" />
<p-button label="Danger" severity="danger" />`;

  outlinedCode = `<p-button label="Primary" [outlined]="true" />
<p-button label="Secondary" severity="secondary" [outlined]="true" />
<p-button label="Success" severity="success" [outlined]="true" />`;

  textCode = `<p-button label="Primary" [text]="true" />
<p-button label="Secondary" severity="secondary" [text]="true" />
<p-button label="Success" severity="success" [text]="true" />`;

  iconsCode = `<p-button icon="pi pi-check" />
<p-button label="Submit" icon="pi pi-check" />
<p-button label="Next" icon="pi pi-arrow-right" iconPos="right" />`;

  sizesCode = `<p-button label="Small" size="small" />
<p-button label="Normal" />
<p-button label="Large" size="large" />`;

  loadingCode = `<p-button label="Save" [loading]="isLoading()" (onClick)="simulateLoading()" />

// Component
isLoading = signal(false);

simulateLoading() {
  this.isLoading.set(true);
  setTimeout(() => this.isLoading.set(false), 2000);
}`;

  interactiveCode = `<p-button
  label="Click me: {{ clickCount() }}"
  (onClick)="incrementCount()"
/>

// Component
clickCount = signal(0);
incrementCount() {
  this.clickCount.update(c => c + 1);
}`;

  constructor(private messageService: MessageService) {}

  onButtonClick(severity: string): void {
    this.messageService.add({
      severity: severity === 'danger' ? 'error' : severity === 'warn' ? 'warn' : severity === 'success' ? 'success' : 'info',
      summary: `${severity.charAt(0).toUpperCase() + severity.slice(1)} Button`,
      detail: `You clicked the ${severity} button!`
    });
  }

  simulateLoading(): void {
    if (this.isLoading()) return;
    this.isLoading.set(true);
    setTimeout(() => {
      this.isLoading.set(false);
      this.messageService.add({
        severity: 'success',
        summary: 'Saved',
        detail: 'Your changes have been saved successfully!'
      });
    }, 2000);
  }

  incrementCount(): void {
    this.clickCount.update(c => c + 1);
  }

  confirmDelete(): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Deleted',
      detail: 'Item has been deleted'
    });
  }

  submitForm(): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Submitted',
      detail: 'Form submitted successfully'
    });
  }
}
