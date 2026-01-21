import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DsPreviewComponent } from '../../../components/ds-preview/ds-preview.component';
import { DsCodeBlockComponent } from '../../../components/ds-code-block/ds-code-block.component';
import { DsPropsTableComponent, ComponentProp } from '../../../components/ds-props-table/ds-props-table.component';

interface Step {
  icon: string;
  label: string;
  descripcion: string;
}

@Component({
  selector: 'app-ds-multi-step-template',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    DsPreviewComponent,
    DsCodeBlockComponent,
    DsPropsTableComponent
  ],
  templateUrl: './multi-step-template.component.html',
  styleUrl: './multi-step-template.component.scss'
})
export class MultiStepTemplateComponent {
  // Demo state
  pasoActual = signal(0);

  steps: Step[] = [
    { icon: 'pi pi-info-circle', label: 'Informacion', descripcion: 'Datos basicos del formulario' },
    { icon: 'pi pi-cog', label: 'Configuracion', descripcion: 'Opciones adicionales' },
    { icon: 'pi pi-check', label: 'Confirmacion', descripcion: 'Revisa y confirma' }
  ];

  // Props documentation
  layoutProps: ComponentProp[] = [
    { name: 'crear-proceso-page', type: 'class', description: 'Contenedor principal de la pagina wizard' },
    { name: 'page-header', type: 'class', description: 'Cabecera con titulo y subtitulo dinamico' },
    { name: 'stepper-container', type: 'class', description: 'Contenedor del indicador de pasos' },
    { name: 'content-card', type: 'class', description: 'Area principal de contenido del paso actual' },
    { name: 'page-footer-fixed', type: 'class', description: 'Barra de navegacion fija en la parte inferior' }
  ];

  stepperProps: ComponentProp[] = [
    { name: 'step-item', type: 'class', description: 'Cada paso individual en el stepper' },
    { name: 'step-item.active', type: 'class', description: 'Paso actualmente activo' },
    { name: 'step-item.completed', type: 'class', description: 'Paso completado (navegable)' },
    { name: 'step-item.clickable', type: 'class', description: 'Paso clickeable para navegar atras' },
    { name: 'step-indicator', type: 'class', description: 'Contenedor del icono y linea conectora' },
    { name: 'step-icon', type: 'class', description: 'Circulo con icono del paso' },
    { name: 'step-line', type: 'class', description: 'Linea horizontal que conecta pasos' },
    { name: 'step-content', type: 'class', description: 'Label y descripcion del paso' }
  ];

  footerProps: ComponentProp[] = [
    { name: 'page-footer-fixed', type: 'class', description: 'Contenedor fixed de la botonera' },
    { name: 'footer-content', type: 'class', description: 'Wrapper centrado con max-width' },
    { name: 'btn-atras', type: 'class', description: 'Boton secundario (Atras/Cancelar)' },
    { name: 'btn-siguiente', type: 'class', description: 'Boton primario (Siguiente)' },
    { name: 'btn-guardar', type: 'class', description: 'Boton primario final (Guardar/Crear)' }
  ];

  // Tokens used
  tokens = [
    { name: '--surface-ground', value: 'var(--surface-ground)', description: 'Fondo de la pagina' },
    { name: '--surface-card', value: 'var(--surface-card)', description: 'Fondo de cards y footer' },
    { name: '--surface-border', value: 'var(--surface-border)', description: 'Bordes de elementos' },
    { name: '--text-color', value: 'var(--text-color)', description: 'Color de texto principal' },
    { name: '--text-color-secondary', value: 'var(--text-color-secondary)', description: 'Subtitulos y descripciones' },
    { name: '--primary-color', value: 'var(--primary-color)', description: 'Color de pasos activos y botones' },
    { name: '--primary-hover-color', value: 'var(--primary-hover-color)', description: 'Hover de botones primarios' },
    { name: '--shadow-sm', value: 'var(--shadow-sm)', description: 'Sombra del footer fixed' }
  ];

  // Navigation methods
  siguiente(): void {
    if (this.pasoActual() < this.steps.length - 1) {
      this.pasoActual.update(p => p + 1);
    }
  }

  anterior(): void {
    if (this.pasoActual() > 0) {
      this.pasoActual.update(p => p - 1);
    }
  }

  irAPaso(paso: number): void {
    if (paso <= this.pasoActual()) {
      this.pasoActual.set(paso);
    }
  }

  resetDemo(): void {
    this.pasoActual.set(0);
  }

  // Code examples
  htmlLayoutCode = `<!-- Estructura principal del template multi-pasos -->
<div class="crear-proceso-page">
  <!-- Header dinamico -->
  <div class="page-header">
    <h1>{{ isEditMode() ? 'Editar' : 'Crear' }} Proyecto</h1>
    <p class="page-subtitle">{{ steps[pasoActual()].descripcion }}</p>
  </div>

  <!-- Stepper horizontal -->
  <div class="stepper-container">
    @for (step of steps; track $index; let i = $index) {
      <div class="step-item"
           [class.active]="i === pasoActual()"
           [class.completed]="i < pasoActual()"
           [class.clickable]="i < pasoActual()"
           (click)="irAPaso(i)">
        <!-- ... step content ... -->
      </div>
    }
  </div>

  <!-- Contenido del paso actual -->
  <div class="content-card">
    @switch (pasoActual()) {
      @case (0) { <app-paso-uno /> }
      @case (1) { <app-paso-dos /> }
      @case (2) { <app-paso-tres /> }
    }
  </div>

  <!-- Footer fijo con navegacion -->
  <div class="page-footer-fixed">
    <div class="footer-content">
      @if (pasoActual() > 0) {
        <button class="btn-atras" (click)="anterior()">
          <i class="pi pi-arrow-left"></i> Atras
        </button>
      } @else {
        <button class="btn-atras" (click)="cancelar()">Cancelar</button>
      }

      @if (pasoActual() < steps.length - 1) {
        <button class="btn-siguiente" (click)="siguiente()" [disabled]="!puedeAvanzar()">
          Siguiente <i class="pi pi-arrow-right"></i>
        </button>
      } @else {
        <button class="btn-guardar" (click)="guardar()">
          <i class="pi pi-check"></i> Crear Proyecto
        </button>
      }
    </div>
  </div>
</div>`;

  htmlStepperCode = `<!-- Stepper Component -->
<div class="stepper-container">
  @for (step of steps(); track $index; let i = $index) {
    <div class="step-item"
         [class.active]="i === pasoActual()"
         [class.completed]="i < pasoActual()"
         [class.clickable]="i < pasoActual()"
         (click)="irAPaso(i)">
      <div class="step-indicator">
        <div class="step-icon">
          @if (i < pasoActual()) {
            <i class="pi pi-check"></i>
          } @else {
            <i [class]="step.icon"></i>
          }
        </div>
        @if (i < steps().length - 1) {
          <div class="step-line" [class.completed]="i < pasoActual()"></div>
        }
      </div>
      <div class="step-content">
        <span class="step-label">{{ step.label }}</span>
        <span class="step-description">{{ step.descripcion }}</span>
      </div>
    </div>
  }
</div>`;

  scssLayoutCode = `// ========== LAYOUT PRINCIPAL ==========
.crear-proceso-page {
  min-height: 100vh;
  padding: var(--spacing-6) var(--spacing-8) 100px var(--spacing-8);
  background: var(--surface-ground);
}

// ========== HEADER ==========
.page-header {
  margin-bottom: var(--spacing-6);

  h1 {
    font-size: 1.75rem;
    font-weight: var(--font-weight-semibold);
    color: var(--text-color);
    margin: 0;
  }

  .page-subtitle {
    font-size: var(--font-size-sm);
    color: var(--text-color-secondary);
    margin: var(--spacing-1) 0 0 0;
  }
}

// ========== CONTENT CARD ==========
.content-card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-6);
  margin-bottom: var(--spacing-6);
}

// ========== FOOTER FIXED ==========
.page-footer-fixed {
  position: fixed;
  bottom: 0;
  left: 64px; // Respeta el ancho del sidebar
  right: 0;
  background: var(--surface-card);
  border-top: 1px solid var(--surface-border);
  padding: var(--spacing-4) var(--spacing-8);
  z-index: 5;
  box-shadow: var(--shadow-sm);
}

.footer-content {
  display: flex;
  justify-content: center;
  gap: var(--spacing-4);
  max-width: 1200px;
  margin: 0 auto;
}`;

  scssStepperCode = `// ========== STEPPER ==========
.stepper-container {
  display: flex;
  gap: 0;
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-6);
  margin-bottom: var(--spacing-6);
}

.step-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  flex: 1;

  &.clickable {
    cursor: pointer;
  }
}

.step-indicator {
  display: flex;
  align-items: center;
}

.step-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--border-radius-full);
  border: 2px solid var(--surface-border);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-card);
  flex-shrink: 0;
  transition: all var(--transition-duration);

  i {
    font-size: var(--font-size-sm);
    color: var(--text-color-secondary);
  }

  // Estado activo o completado
  .step-item.active &,
  .step-item.completed & {
    background: var(--primary-color);
    border-color: var(--primary-color);

    i {
      color: var(--surface-0);
    }
  }
}

.step-line {
  flex: 1;
  height: 2px;
  background: var(--surface-border);
  margin: 0 var(--spacing-2);
  transition: background var(--transition-duration);

  &.completed {
    background: var(--primary-color);
  }
}

.step-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.step-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-color-secondary);

  .step-item.active &,
  .step-item.completed & {
    color: var(--text-color);
  }
}

.step-description {
  font-size: var(--font-size-xs);
  color: var(--text-color-secondary);
}`;

  scssButtonsCode = `// ========== BOTONES DE NAVEGACION ==========
.btn-atras,
.btn-siguiente,
.btn-guardar {
  padding: var(--spacing-3) var(--spacing-5);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-duration);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

// Boton secundario (Atras/Cancelar)
.btn-atras {
  background: none;
  border: 1px solid var(--surface-border);
  color: var(--text-color-secondary);

  &:hover {
    background: var(--surface-ground);
    color: var(--text-color);
  }
}

// Boton primario (Siguiente/Guardar)
.btn-siguiente,
.btn-guardar {
  background: var(--primary-color);
  border: none;
  color: var(--surface-0);

  &:hover:not(:disabled) {
    background: var(--primary-hover-color);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}`;

  typescriptCode = `import { Component, signal } from '@angular/core';
import { MessageService } from 'primeng/api';

interface Step {
  icon: string;
  label: string;
  descripcion: string;
}

@Component({...})
export class MiWizardComponent {
  pasoActual = signal(0);

  steps: Step[] = [
    { icon: 'pi pi-info-circle', label: 'Informacion', descripcion: 'Datos basicos' },
    { icon: 'pi pi-cog', label: 'Configuracion', descripcion: 'Opciones' },
    { icon: 'pi pi-check', label: 'Confirmacion', descripcion: 'Revisa y confirma' }
  ];

  constructor(private messageService: MessageService) {}

  siguiente(): void {
    if (this.validarPasoActual()) {
      this.pasoActual.update(p => Math.min(p + 1, this.steps.length - 1));
    }
  }

  anterior(): void {
    this.pasoActual.update(p => Math.max(p - 1, 0));
  }

  irAPaso(paso: number): void {
    // Solo permite navegar hacia atras
    if (paso <= this.pasoActual()) {
      this.pasoActual.set(paso);
    }
  }

  validarPasoActual(): boolean {
    switch (this.pasoActual()) {
      case 0:
        if (!this.camposRequeridos()) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Campos requeridos',
            detail: 'Completa todos los campos obligatorios'
          });
          return false;
        }
        return true;
      case 1:
        // Validacion del paso 2
        return true;
      default:
        return true;
    }
  }

  puedeAvanzar(): boolean {
    // Logica para habilitar/deshabilitar boton siguiente
    return this.camposRequeridos();
  }

  guardar(): void {
    // Logica de guardado final
    console.log('Guardando...');
  }

  cancelar(): void {
    // Navegar de vuelta o mostrar confirmacion
  }
}`;
}
