import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DsPreviewComponent } from '../../../components/ds-preview/ds-preview.component';
import { DsCodeBlockComponent } from '../../../components/ds-code-block/ds-code-block.component';
import { DsPropsTableComponent, ComponentProp } from '../../../components/ds-props-table/ds-props-table.component';
import { DsTokenDisplayComponent } from '../../../components/ds-token-display/ds-token-display.component';

interface SelectionOption {
  id: string;
  label: string;
  description: string;
  icon: string;
  iconBgClass: string;
  iconColorClass: string;
  variant: 'ia' | 'manual' | 'default';
  stats?: { value: string; label: string }[];
  buttonLabel: string;
  buttonSeverity: 'help' | 'contrast' | 'primary' | 'secondary';
}

@Component({
  selector: 'app-ds-selection-cards',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    ToastModule,
    DsPreviewComponent,
    DsCodeBlockComponent,
    DsPropsTableComponent,
    DsTokenDisplayComponent
  ],
  providers: [MessageService],
  templateUrl: './selection-cards.component.html',
  styleUrl: './selection-cards.component.scss'
})
export class SelectionCardsComponent {
  selectedOption = signal<string | null>(null);

  // Wizard method options (IA vs Manual)
  wizardOptions: SelectionOption[] = [
    {
      id: 'ia',
      label: 'Cuestionario IA',
      description: 'Genera preguntas automáticamente con IA o sube un documento',
      icon: 'pi pi-sparkles',
      iconBgClass: 'bg-purple-100',
      iconColorClass: 'text-purple-500',
      variant: 'ia',
      stats: [
        { value: '89%', label: 'Precisión' },
        { value: '< 30s', label: 'Tiempo' },
        { value: '5-50', label: 'Preguntas' }
      ],
      buttonLabel: 'Generar con IA',
      buttonSeverity: 'help'
    },
    {
      id: 'manual',
      label: 'Manual',
      description: 'Diseña tu cuestionario desde cero agregando secciones y preguntas',
      icon: 'pi pi-pencil',
      iconBgClass: 'bg-blue-100',
      iconColorClass: 'text-blue-500',
      variant: 'manual',
      stats: [
        { value: '100%', label: 'Control' },
        { value: '10', label: 'Tipos' }
      ],
      buttonLabel: 'Crear manual',
      buttonSeverity: 'contrast'
    }
  ];

  // Props documentation
  cardProps: ComponentProp[] = [
    { name: 'wizard-method-card', type: 'class', description: 'Clase base para el contenedor de la card de selección' },
    { name: 'wizard-method-ia', type: 'class', description: 'Variante púrpura para opciones con IA (gradiente violeta)' },
    { name: 'wizard-method-manual', type: 'class', description: 'Variante azul para opciones manuales (gradiente azul/gris)' },
    { name: 'wizard-method-selected', type: 'class', description: 'Estado seleccionado con borde primary y sombra' },
    { name: 'wizard-method-icon', type: 'class', description: 'Contenedor del icono con transición de escala en hover' },
    { name: 'wizard-method-title', type: 'class', description: 'Título de la card' },
    { name: 'wizard-method-desc', type: 'class', description: 'Descripción de la card' },
    { name: 'wizard-stat-card', type: 'class', description: 'Mini cards de estadísticas dentro de la card principal' },
    { name: 'wizard-stat-value', type: 'class', description: 'Valor numérico de la estadística' },
    { name: 'wizard-stat-label', type: 'class', description: 'Etiqueta de la estadística' }
  ];

  // Tokens used
  tokens = [
    { name: '--primary-color', value: 'var(--primary-color)', description: 'Color del borde en estado seleccionado' },
    { name: '--surface-card', value: 'var(--surface-card)', description: 'Fondo de las stat cards' },
    { name: '--surface-border', value: 'var(--surface-border)', description: 'Color del borde por defecto' },
    { name: '--text-color', value: 'var(--text-color)', description: 'Color del título y valores' },
    { name: '--text-color-secondary', value: 'var(--text-color-secondary)', description: 'Color de descripción y labels' },
    { name: '--purple-100 / --purple-500', value: '#ede9fe / #8b5cf6', description: 'Paleta púrpura para variante IA' },
    { name: '--blue-100 / --blue-500', value: '#dbeafe / #3b82f6', description: 'Paleta azul para variante Manual' }
  ];

  constructor(private messageService: MessageService) {}

  selectOption(optionId: string): void {
    this.selectedOption.set(optionId);
    this.messageService.add({
      severity: 'info',
      summary: 'Opción seleccionada',
      detail: `Has seleccionado: ${optionId}`
    });
  }

  isSelected(optionId: string): boolean {
    return this.selectedOption() === optionId;
  }

  // Code examples
  basicHtmlCode = `<!-- Selection Card - Variante IA (Púrpura) -->
<div class="wizard-method-card wizard-method-ia h-full border-round-xl p-4 cursor-pointer"
     [class.wizard-method-selected]="selectedOption() === 'ia'"
     (click)="selectOption('ia')">

  <!-- Icono -->
  <div class="flex justify-content-center mb-4">
    <div class="wizard-method-icon flex align-items-center justify-content-center
                border-circle bg-purple-100" style="width: 80px; height: 80px;">
      <i class="pi pi-sparkles text-purple-500" style="font-size: 2.5rem;"></i>
    </div>
  </div>

  <!-- Título y descripción -->
  <div class="text-center mb-4">
    <h3 class="text-xl font-bold m-0 mb-2 wizard-method-title">Cuestionario IA</h3>
    <p class="text-sm m-0 wizard-method-desc">
      Genera preguntas automáticamente con IA
    </p>
  </div>

  <!-- Stats cards -->
  <div class="flex gap-2 mb-4">
    <div class="flex-1 wizard-stat-card border-round-lg p-3">
      <div class="text-center">
        <span class="text-xl font-bold wizard-stat-value">89%</span>
        <p class="text-xs m-0 mt-1 wizard-stat-label">Precisión</p>
      </div>
    </div>
    <div class="flex-1 wizard-stat-card border-round-lg p-3">
      <div class="text-center">
        <span class="text-xl font-bold wizard-stat-value">< 30s</span>
        <p class="text-xs m-0 mt-1 wizard-stat-label">Tiempo</p>
      </div>
    </div>
  </div>

  <!-- Botón -->
  <p-button label="Generar con IA" icon="pi pi-sparkles"
            severity="help" styleClass="w-full" />
</div>

<!-- Selection Card - Variante Manual (Azul) -->
<div class="wizard-method-card wizard-method-manual h-full border-round-xl p-4 cursor-pointer"
     [class.wizard-method-selected]="selectedOption() === 'manual'"
     (click)="selectOption('manual')">

  <!-- Contenido similar... -->
  <p-button label="Crear manual" icon="pi pi-pencil"
            severity="contrast" styleClass="w-full" />
</div>`;

  scssCode = `// Wizard method cards base
.wizard-method-card {
  transition: all 0.3s ease;
  border: 2px solid transparent;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.15);
  }

  &.wizard-method-selected {
    border-color: var(--primary-color);
    box-shadow: 0 8px 25px -5px rgba(var(--primary-color-rgb), 0.3);
  }

  // Variante IA - Púrpura
  &.wizard-method-ia {
    background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);

    &.wizard-method-selected {
      background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
    }

    // Dark mode
    :host-context(.dark-mode) & {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(124, 58, 237, 0.18) 100%);
    }

    :host-context(.dark-mode) &.wizard-method-selected {
      background: linear-gradient(135deg, rgba(88, 28, 135, 0.6) 0%, rgba(76, 29, 149, 0.5) 100%);
      border-color: var(--purple-400);
    }
  }

  // Variante Manual - Azul
  &.wizard-method-manual {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);

    &.wizard-method-selected {
      background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
    }

    // Dark mode
    :host-context(.dark-mode) & {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.12) 100%);
    }

    :host-context(.dark-mode) &.wizard-method-selected {
      background: linear-gradient(135deg, rgba(30, 58, 138, 0.6) 0%, rgba(29, 78, 216, 0.5) 100%);
      border-color: var(--blue-400);
    }
  }
}

// Textos
.wizard-method-title { color: var(--text-color); }
.wizard-method-desc { color: var(--text-color-secondary); }

// Stats cards
.wizard-stat-card {
  background-color: var(--surface-card);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  :host-context(.dark-mode) & {
    background-color: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(4px);
  }
}

.wizard-stat-value { color: var(--text-color); }
.wizard-stat-label { color: var(--text-color-secondary); }

// Icon animation
.wizard-method-icon { transition: all 0.3s ease; }
.wizard-method-card:hover .wizard-method-icon { transform: scale(1.1); }`;

  typescriptCode = `import { Component, signal } from '@angular/core';

@Component({...})
export class MyWizardComponent {
  selectedOption = signal<string | null>(null);

  selectOption(optionId: string): void {
    this.selectedOption.set(optionId);
  }

  isSelected(optionId: string): boolean {
    return this.selectedOption() === optionId;
  }
}`;
}
