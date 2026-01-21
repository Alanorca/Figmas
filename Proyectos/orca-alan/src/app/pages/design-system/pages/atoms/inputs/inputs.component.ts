import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DsPreviewComponent } from '../../../components/ds-preview/ds-preview.component';
import { DsCodeBlockComponent } from '../../../components/ds-code-block/ds-code-block.component';
import { DsPropsTableComponent, ComponentProp } from '../../../components/ds-props-table/ds-props-table.component';

@Component({
  selector: 'app-ds-inputs',
  standalone: true,
  imports: [
    CommonModule, FormsModule, InputTextModule, InputNumberModule,
    TextareaModule, PasswordModule, SelectModule, FloatLabelModule,
    InputGroupModule, InputGroupAddonModule, IconFieldModule, InputIconModule,
    ToastModule, DsPreviewComponent, DsCodeBlockComponent, DsPropsTableComponent
  ],
  providers: [MessageService],
  templateUrl: './inputs.component.html',
  styleUrl: './inputs.component.scss'
})
export class InputsComponent {
  // Interactive state with signals
  textValue = signal('');
  searchValue = signal('');
  numberValue = signal<number | null>(null);
  currencyValue = signal<number | null>(1250.5);
  quantityValue = signal<number>(1);
  passwordValue = signal('');
  textareaValue = signal('');
  selectedCity = signal<any>(null);
  emailValue = signal('');
  phoneValue = signal('');

  // Computed values
  charCount = computed(() => this.textareaValue().length);
  passwordStrength = computed(() => {
    const pwd = this.passwordValue();
    if (pwd.length === 0) return '';
    if (pwd.length < 4) return 'weak';
    if (pwd.length < 8) return 'medium';
    return 'strong';
  });
  isEmailValid = computed(() => {
    const email = this.emailValue();
    if (!email) return null;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  });

  cities = [
    { name: 'New York', code: 'NY' },
    { name: 'Rome', code: 'RM' },
    { name: 'London', code: 'LDN' },
    { name: 'Paris', code: 'PRS' },
    { name: 'Tokyo', code: 'TKY' },
    { name: 'Berlin', code: 'BRL' }
  ];

  inputProps: ComponentProp[] = [
    { name: 'placeholder', type: 'string', description: 'Hint text for the input' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the input' },
    { name: 'readonly', type: 'boolean', default: 'false', description: 'Makes input read-only' },
    { name: 'variant', type: '"outlined" | "filled"', default: '"outlined"', description: 'Visual style variant' },
    { name: 'size', type: '"small" | "large"', description: 'Size of the input' },
    { name: 'fluid', type: 'boolean', default: 'false', description: 'Full width input' }
  ];

  basicCode = `<input pInputText placeholder="Enter text" [(ngModel)]="value" />
<input pInputText placeholder="Disabled" [disabled]="true" />
<input pInputText placeholder="Readonly" [readonly]="true" value="Read only" />`;

  variantsCode = `<!-- Outlined (default) -->
<input pInputText variant="outlined" placeholder="Outlined" />

<!-- Filled -->
<input pInputText variant="filled" placeholder="Filled" />`;

  sizesCode = `<input pInputText size="small" placeholder="Small" />
<input pInputText placeholder="Normal" />
<input pInputText size="large" placeholder="Large" />`;

  numberCode = `<p-inputNumber [(ngModel)]="value" placeholder="Enter number" />
<p-inputNumber [(ngModel)]="value" mode="currency" currency="USD" />
<p-inputNumber [(ngModel)]="value" [showButtons]="true" />`;

  textareaCode = `<textarea pTextarea [(ngModel)]="value" rows="4" placeholder="Enter description"></textarea>

// Live character count
charCount = computed(() => this.textareaValue().length);`;

  floatLabelCode = `<p-floatLabel>
  <input pInputText id="username" [(ngModel)]="value" />
  <label for="username">Username</label>
</p-floatLabel>`;

  inputGroupCode = `<p-inputGroup>
  <p-inputGroupAddon>
    <i class="pi pi-user"></i>
  </p-inputGroupAddon>
  <input pInputText placeholder="Username" />
</p-inputGroup>`;

  iconFieldCode = `<p-iconField>
  <p-inputIcon styleClass="pi pi-search" />
  <input pInputText placeholder="Search..." />
</p-iconField>`;

  constructor(private messageService: MessageService) {}

  onSearch(): void {
    if (this.searchValue()) {
      this.messageService.add({
        severity: 'info',
        summary: 'Search',
        detail: `Searching for: "${this.searchValue()}"`
      });
    }
  }

  onEmailBlur(): void {
    const valid = this.isEmailValid();
    if (valid === false) {
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid Email',
        detail: 'Please enter a valid email address'
      });
    }
  }
}
