import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ButtonModule } from 'primeng/button';
import { DsPreviewComponent } from '../../../components/ds-preview/ds-preview.component';
import { DsCodeBlockComponent } from '../../../components/ds-code-block/ds-code-block.component';
import { DsPropsTableComponent, ComponentProp } from '../../../components/ds-props-table/ds-props-table.component';
import { DsGuidelinesComponent } from '../../../components/ds-guidelines/ds-guidelines.component';
import { DsUsageListComponent, UsageItem } from '../../../components/ds-usage-list/ds-usage-list.component';
import { DsCodeTabsComponent, CodeTab } from '../../../components/ds-code-tabs/ds-code-tabs.component';

@Component({
  selector: 'app-ds-checkboxes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CheckboxModule,
    RadioButtonModule,
    ToggleSwitchModule,
    ButtonModule,
    DsPreviewComponent,
    DsCodeBlockComponent,
    DsPropsTableComponent,
    DsGuidelinesComponent,
    DsUsageListComponent,
    DsCodeTabsComponent
  ],
  templateUrl: './checkboxes.component.html',
  styleUrl: './checkboxes.component.scss'
})
export class CheckboxesComponent {
  // Interactive state - Checkbox
  checked = signal(false);
  selectedCities = signal<string[]>([]);

  // Interactive state - Radio
  selectedOption = signal<string>('option1');
  selectedPriority = signal<string>('medium');

  // Interactive state - ToggleSwitch
  darkMode = signal(false);
  notifications = signal(true);
  autoSave = signal(false);

  // Cities options
  cities = [
    { name: 'New York', code: 'NY' },
    { name: 'Los Angeles', code: 'LA' },
    { name: 'Chicago', code: 'CHI' },
    { name: 'Houston', code: 'HOU' }
  ];

  // Priority options
  priorities = [
    { label: 'Low', value: 'low', icon: 'pi pi-arrow-down' },
    { label: 'Medium', value: 'medium', icon: 'pi pi-minus' },
    { label: 'High', value: 'high', icon: 'pi pi-arrow-up' },
    { label: 'Critical', value: 'critical', icon: 'pi pi-exclamation-triangle' }
  ];

  // Guidelines
  guidelinesDos = [
    'Usar labels claros que describan la opción',
    'Agrupar opciones relacionadas visualmente',
    'Usar Checkbox para selección múltiple, Radio para selección única',
    'Usar ToggleSwitch para configuraciones on/off inmediatas',
    'Mostrar estado actual claramente (checked/unchecked)'
  ];

  guidelinesDonts = [
    'No usar Radio buttons para más de 5-7 opciones (usar Select)',
    'No mezclar Checkbox y Radio en el mismo grupo de opciones',
    'No usar ToggleSwitch para confirmaciones (usar Checkbox)',
    'No usar labels negativos (ej: "No mostrar" → "Mostrar")'
  ];

  // Usage items
  usageItems: UsageItem[] = [
    { title: 'Forms', path: '/design-system/organisms/forms', icon: 'pi pi-file-edit', description: 'Campos de formulario con validación' },
    { title: 'Tables', path: '/design-system/organisms/tables', icon: 'pi pi-table', description: 'Selección de filas' },
    { title: 'Dialogs', path: '/design-system/organisms/dialogs', icon: 'pi pi-window-maximize', description: 'Configuraciones y preferencias' },
    { title: 'Settings', path: '/settings', icon: 'pi pi-cog', description: 'Páginas de configuración' }
  ];

  // Props tables
  checkboxProps: ComponentProp[] = [
    { name: 'value', type: 'any', description: 'Value of the checkbox', required: true },
    { name: 'ngModel', type: 'any', description: 'Two-way binding for the checkbox state' },
    { name: 'binary', type: 'boolean', default: 'false', description: 'When true, value is a boolean instead of array' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the checkbox' },
    { name: 'readonly', type: 'boolean', default: 'false', description: 'Makes the checkbox readonly' },
    { name: 'inputId', type: 'string', description: 'Identifier for the input element' },
    { name: 'name', type: 'string', description: 'Name of the checkbox group' }
  ];

  radioProps: ComponentProp[] = [
    { name: 'value', type: 'any', description: 'Value of the radio button', required: true },
    { name: 'ngModel', type: 'any', description: 'Two-way binding for selected value' },
    { name: 'name', type: 'string', description: 'Name of the radio group', required: true },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the radio button' },
    { name: 'inputId', type: 'string', description: 'Identifier for the input element' }
  ];

  toggleSwitchProps: ComponentProp[] = [
    { name: 'ngModel', type: 'boolean', description: 'Two-way binding for switch state' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the switch' },
    { name: 'inputId', type: 'string', description: 'Identifier for the input element' }
  ];

  // Code examples
  checkboxBasicCode = `<p-checkbox [(ngModel)]="checked" [binary]="true" inputId="binary" />
<label for="binary">Accept terms and conditions</label>`;

  checkboxGroupCode = `<div class="flex flex-column gap-2">
  @for (city of cities; track city.code) {
    <div class="flex align-items-center gap-2">
      <p-checkbox
        [(ngModel)]="selectedCities"
        [value]="city.code"
        [inputId]="city.code" />
      <label [for]="city.code">{{ city.name }}</label>
    </div>
  }
</div>

// Component
cities = [
  { name: 'New York', code: 'NY' },
  { name: 'Los Angeles', code: 'LA' },
  { name: 'Chicago', code: 'CHI' }
];
selectedCities = signal<string[]>([]);`;

  radioBasicCode = `<div class="flex flex-column gap-2">
  <div class="flex align-items-center gap-2">
    <p-radiobutton
      [(ngModel)]="selectedOption"
      value="option1"
      inputId="opt1"
      name="options" />
    <label for="opt1">Option 1</label>
  </div>
  <div class="flex align-items-center gap-2">
    <p-radiobutton
      [(ngModel)]="selectedOption"
      value="option2"
      inputId="opt2"
      name="options" />
    <label for="opt2">Option 2</label>
  </div>
</div>`;

  toggleSwitchCode = `<p-toggleswitch [(ngModel)]="darkMode" />
<label>{{ darkMode() ? 'Dark Mode On' : 'Dark Mode Off' }}</label>

// Component
darkMode = signal(false);`;

  codeTabs: CodeTab[] = [
    {
      label: 'Checkbox',
      language: 'html',
      icon: 'pi pi-check-square',
      code: `<!-- Single checkbox (binary) -->
<p-checkbox [(ngModel)]="accepted" [binary]="true" inputId="accept" />
<label for="accept">I accept the terms</label>

<!-- Checkbox group -->
<div class="flex flex-column gap-2">
  @for (option of options; track option.value) {
    <div class="flex align-items-center gap-2">
      <p-checkbox
        [(ngModel)]="selectedOptions"
        [value]="option.value"
        [inputId]="option.value" />
      <label [for]="option.value">{{ option.label }}</label>
    </div>
  }
</div>`
    },
    {
      label: 'RadioButton',
      language: 'html',
      icon: 'pi pi-circle',
      code: `<!-- Radio group -->
<div class="flex flex-column gap-2">
  @for (option of options; track option.value) {
    <div class="flex align-items-center gap-2">
      <p-radiobutton
        [(ngModel)]="selectedOption"
        [value]="option.value"
        [inputId]="option.value"
        name="optionGroup" />
      <label [for]="option.value">{{ option.label }}</label>
    </div>
  }
</div>

<!-- Horizontal radio group -->
<div class="flex gap-4">
  @for (option of options; track option.value) {
    <div class="flex align-items-center gap-2">
      <p-radiobutton ... />
      <label>{{ option.label }}</label>
    </div>
  }
</div>`
    },
    {
      label: 'ToggleSwitch',
      language: 'html',
      icon: 'pi pi-power-off',
      code: `<!-- Basic toggle -->
<p-toggleswitch [(ngModel)]="enabled" />

<!-- With label -->
<div class="flex align-items-center gap-2">
  <p-toggleswitch [(ngModel)]="notifications" inputId="notif" />
  <label for="notif">Enable notifications</label>
</div>

<!-- Settings pattern -->
<div class="setting-item">
  <div class="setting-info">
    <span class="setting-label">Dark Mode</span>
    <span class="setting-description">Use dark theme</span>
  </div>
  <p-toggleswitch [(ngModel)]="darkMode" />
</div>`
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      icon: 'pi pi-file',
      code: `import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'app-my-form',
  standalone: true,
  imports: [FormsModule, CheckboxModule, RadioButtonModule, ToggleSwitchModule],
  template: \`...\`
})
export class MyFormComponent {
  // Checkbox
  accepted = signal(false);
  selectedCities = signal<string[]>([]);

  // Radio
  selectedOption = signal('option1');

  // Toggle
  darkMode = signal(false);
  notifications = signal(true);
}`
    }
  ];

  // Methods
  toggleCity(code: string): void {
    const current = this.selectedCities();
    if (current.includes(code)) {
      this.selectedCities.set(current.filter(c => c !== code));
    } else {
      this.selectedCities.set([...current, code]);
    }
  }

  resetAll(): void {
    this.checked.set(false);
    this.selectedCities.set([]);
    this.selectedOption.set('option1');
    this.selectedPriority.set('medium');
    this.darkMode.set(false);
    this.notifications.set(true);
    this.autoSave.set(false);
  }
}
