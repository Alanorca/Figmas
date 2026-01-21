import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';
import { DsPreviewComponent } from '../../../components/ds-preview/ds-preview.component';
import { DsCodeBlockComponent } from '../../../components/ds-code-block/ds-code-block.component';
import { DsPropsTableComponent, ComponentProp } from '../../../components/ds-props-table/ds-props-table.component';
import { DsTokenDisplayComponent } from '../../../components/ds-token-display/ds-token-display.component';

@Component({
  selector: 'app-ds-upload-area',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    ToastModule,
    FileUploadModule,
    DsPreviewComponent,
    DsCodeBlockComponent,
    DsPropsTableComponent,
    DsTokenDisplayComponent
  ],
  providers: [MessageService],
  templateUrl: './upload-area.component.html',
  styleUrl: './upload-area.component.scss'
})
export class UploadAreaComponent {
  uploadedFile = signal<File | null>(null);
  uploadedFileName = signal('');

  // Props documentation
  areaProps: ComponentProp[] = [
    { name: 'upload-area', type: 'class', description: 'Clase base para el contenedor drag & drop' },
    { name: 'upload-area--compact', type: 'class', description: 'Variante compacta con menos padding' },
    { name: 'upload-hint', type: 'class', description: 'Texto de ayuda debajo del botón' },
    { name: 'documento-preview', type: 'class', description: 'Contenedor para mostrar archivo seleccionado' },
    { name: 'documento-info', type: 'class', description: 'Info del archivo (icono + nombre)' },
    { name: 'btn-remove', type: 'class', description: 'Botón para eliminar archivo seleccionado' }
  ];

  // Tokens used
  tokens = [
    { name: '--upload-area-bg', value: '#27272a', description: 'Fondo del área en dark mode (zinc-800)' },
    { name: '--upload-area-bg-hover', value: '#3f3f46', description: 'Fondo en hover en dark mode (zinc-700)' },
    { name: '--upload-area-border', value: '#3f3f46', description: 'Color del borde dashed en dark mode' },
    { name: '--upload-area-border-hover', value: 'var(--primary-color)', description: 'Borde en hover' },
    { name: '--surface-ground', value: 'var(--surface-ground)', description: 'Fondo en light mode' },
    { name: '--surface-border', value: 'var(--surface-border)', description: 'Borde en light mode' },
    { name: '--primary-50', value: 'var(--primary-50)', description: 'Fondo hover en light mode' }
  ];

  constructor(private messageService: MessageService) {}

  onSelectFile(event: any): void {
    const file = event.files?.[0];
    if (file) {
      this.uploadedFile.set(file);
      this.uploadedFileName.set(file.name);
      this.messageService.add({
        severity: 'success',
        summary: 'Archivo seleccionado',
        detail: file.name
      });
    }
  }

  onRemoveFile(): void {
    this.uploadedFile.set(null);
    this.uploadedFileName.set('');
    this.messageService.add({
      severity: 'info',
      summary: 'Archivo eliminado',
      detail: 'El archivo ha sido removido'
    });
  }

  // Code examples
  htmlCode = `<!-- Upload Area - Estado vacío -->
<div class="upload-area">
  <p-fileUpload
    mode="basic"
    name="documento"
    accept=".pdf,.doc,.docx,.txt"
    [maxFileSize]="10000000"
    chooseLabel="Seleccionar archivo"
    chooseIcon="pi pi-upload"
    (onSelect)="onSelectFile($event)"
    styleClass="upload-button">
  </p-fileUpload>
  <p class="upload-hint">PDF, DOC, DOCX o TXT (máx. 10MB)</p>
</div>

<!-- Upload Area - Con archivo seleccionado -->
<div class="documento-preview">
  <div class="documento-info">
    <i class="pi pi-file-pdf"></i>
    <span>{{ uploadedFileName() }}</span>
  </div>
  <button class="btn-remove" (click)="onRemoveFile()">
    <i class="pi pi-times"></i>
  </button>
</div>`;

  scssCode = `// ========== Upload Area ==========
.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-8);
  border: 2px dashed var(--surface-border);
  border-radius: var(--border-radius-lg);
  background: var(--surface-ground);
  transition: all var(--transition-duration);

  &:hover {
    border-color: var(--primary-color);
    background: var(--primary-50);
  }
}

.upload-hint {
  font-size: var(--font-size-xs);
  color: var(--text-color-secondary);
  margin: var(--spacing-3) 0 0 0;
}

.documento-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-4);
  background: var(--surface-ground);
  border: 1px solid var(--surface-border);
  border-radius: var(--border-radius-lg);
}

.documento-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);

  i { font-size: 1.5rem; color: var(--red-500); }
  span { font-size: var(--font-size-sm); color: var(--text-color); }
}

.btn-remove {
  width: 32px;
  height: 32px;
  padding: 0;
  background: none;
  border: 1px solid var(--surface-border);
  border-radius: var(--border-radius-md);
  cursor: pointer;

  &:hover {
    background: var(--red-50);
    border-color: var(--red-200);
    i { color: var(--red-500); }
  }
}

// ========== DARK MODE ==========
@mixin dark-mode-styles {
  .upload-area {
    background: var(--upload-area-bg) !important;
    border-color: var(--upload-area-border) !important;

    &:hover {
      background: var(--upload-area-bg-hover) !important;
      border-color: var(--upload-area-border-hover) !important;
    }
  }
}

:host-context(.dark-mode) { @include dark-mode-styles; }
:host-context(.dark) { @include dark-mode-styles; }
:host-context([data-theme="dark"]) { @include dark-mode-styles; }`;

  typescriptCode = `import { Component, signal } from '@angular/core';

@Component({...})
export class MyUploadComponent {
  uploadedFile = signal<File | null>(null);
  uploadedFileName = signal('');

  onSelectFile(event: any): void {
    const file = event.files?.[0];
    if (file) {
      this.uploadedFile.set(file);
      this.uploadedFileName.set(file.name);
    }
  }

  onRemoveFile(): void {
    this.uploadedFile.set(null);
    this.uploadedFileName.set('');
  }
}`;
}
