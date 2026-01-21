import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SliderModule } from 'primeng/slider';
import { AvatarModule } from 'primeng/avatar';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DsPreviewComponent } from '../../../components/ds-preview/ds-preview.component';
import { DsCodeBlockComponent } from '../../../components/ds-code-block/ds-code-block.component';
import { DsPropsTableComponent, ComponentProp } from '../../../components/ds-props-table/ds-props-table.component';

interface UserSettings {
  notifications: boolean;
  darkMode: boolean;
  language: string;
  fontSize: number;
}

@Component({
  selector: 'app-ds-dialogs',
  standalone: true,
  imports: [
    CommonModule, FormsModule, DialogModule, ButtonModule, InputTextModule,
    ConfirmDialogModule, ToastModule, SelectModule, ToggleSwitchModule,
    SliderModule, AvatarModule,
    DsPreviewComponent, DsCodeBlockComponent, DsPropsTableComponent
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './dialogs.component.html',
  styleUrl: './dialogs.component.scss'
})
export class DialogsComponent {
  // Dialog visibility signals
  basicVisible = signal(false);
  settingsVisible = signal(false);
  profileVisible = signal(false);
  confirmVisible = signal(false);
  maximizableVisible = signal(false);
  positionVisible = signal(false);
  position = signal<'center' | 'top' | 'bottom' | 'left' | 'right' | 'topleft' | 'topright' | 'bottomleft' | 'bottomright'>('center');

  // Form state
  profileName = signal('John Doe');
  profileEmail = signal('john.doe@example.com');
  profileBio = signal('Software Developer');

  settings = signal<UserSettings>({
    notifications: true,
    darkMode: false,
    language: 'en',
    fontSize: 14
  });

  languages = [
    { label: 'English', value: 'en' },
    { label: 'Spanish', value: 'es' },
    { label: 'French', value: 'fr' },
    { label: 'German', value: 'de' }
  ];

  dialogProps: ComponentProp[] = [
    { name: 'visible', type: 'boolean', required: true, description: 'Controls dialog visibility' },
    { name: 'header', type: 'string', description: 'Header text of the dialog' },
    { name: 'modal', type: 'boolean', default: 'false', description: 'Shows a backdrop' },
    { name: 'closable', type: 'boolean', default: 'true', description: 'Shows close button' },
    { name: 'draggable', type: 'boolean', default: 'true', description: 'Allows dragging' },
    { name: 'resizable', type: 'boolean', default: 'true', description: 'Allows resizing' },
    { name: 'position', type: 'string', default: '"center"', description: 'Dialog position' },
    { name: 'maximizable', type: 'boolean', default: 'false', description: 'Shows maximize button' }
  ];

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  showPosition(pos: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'topleft' | 'topright' | 'bottomleft' | 'bottomright'): void {
    this.position.set(pos);
    this.positionVisible.set(true);
  }

  // Settings update methods
  updateNotifications(value: boolean): void {
    this.settings.update(s => ({ ...s, notifications: value }));
  }

  updateDarkMode(value: boolean): void {
    this.settings.update(s => ({ ...s, darkMode: value }));
  }

  updateLanguage(value: string): void {
    this.settings.update(s => ({ ...s, language: value }));
  }

  updateFontSize(value: number): void {
    this.settings.update(s => ({ ...s, fontSize: value }));
  }

  // Save profile
  saveProfile(): void {
    this.profileVisible.set(false);
    this.messageService.add({
      severity: 'success',
      summary: 'Profile Updated',
      detail: `Profile for ${this.profileName()} has been saved`
    });
  }

  // Save settings
  saveSettings(): void {
    this.settingsVisible.set(false);
    this.messageService.add({
      severity: 'success',
      summary: 'Settings Saved',
      detail: 'Your preferences have been updated'
    });
  }

  // Confirm delete
  confirmDelete(): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this record? This action cannot be undone.',
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Deleted',
          detail: 'Record has been deleted'
        });
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelled',
          detail: 'Delete operation cancelled'
        });
      }
    });
  }

  // Confirm save
  confirmSave(): void {
    this.confirmationService.confirm({
      message: 'Do you want to save the changes before closing?',
      header: 'Save Changes',
      icon: 'pi pi-save',
      accept: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Saved',
          detail: 'Changes have been saved'
        });
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Discarded',
          detail: 'Changes were discarded'
        });
      }
    });
  }

  basicCode = `<p-button label="Show" (click)="visible = true" />

<p-dialog header="Dialog" [(visible)]="visible">
  <p>Dialog content goes here.</p>
</p-dialog>`;

  modalCode = `<p-dialog
  header="Modal Dialog"
  [(visible)]="visible"
  [modal]="true"
  [closable]="true"
>
  <p>This dialog has a modal backdrop.</p>
  <ng-template pTemplate="footer">
    <p-button label="Cancel" [text]="true" (click)="visible = false" />
    <p-button label="Save" (click)="visible = false" />
  </ng-template>
</p-dialog>`;

  confirmCode = `constructor(private confirmationService: ConfirmationService) {}

confirm() {
  this.confirmationService.confirm({
    message: 'Are you sure you want to delete this record?',
    header: 'Confirm Deletion',
    icon: 'pi pi-exclamation-triangle',
    accept: () => { /* Accept logic */ },
    reject: () => { /* Reject logic */ }
  });
}

<p-confirmDialog />
<p-button label="Delete" (click)="confirm()" severity="danger" />`;

  interactiveCode = `// Settings dialog with form state
settings = signal<UserSettings>({
  notifications: true,
  darkMode: false,
  language: 'en',
  fontSize: 14
});

saveSettings(): void {
  this.settingsVisible.set(false);
  this.messageService.add({
    severity: 'success',
    summary: 'Settings Saved',
    detail: 'Your preferences have been updated'
  });
}

// Template
<p-dialog
  header="Settings"
  [(visible)]="settingsVisible"
  [modal]="true"
  [style]="{width: '450px'}"
>
  <div class="settings-form">
    <div class="setting-item">
      <label>Notifications</label>
      <p-inputSwitch [(ngModel)]="settings().notifications" />
    </div>
    <div class="setting-item">
      <label>Language</label>
      <p-select [options]="languages" [(ngModel)]="settings().language" />
    </div>
  </div>
  <ng-template pTemplate="footer">
    <p-button label="Cancel" [text]="true" (onClick)="settingsVisible.set(false)" />
    <p-button label="Save" (onClick)="saveSettings()" />
  </ng-template>
</p-dialog>`;
}
