import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { FloatLabelModule } from 'primeng/floatlabel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DsPreviewComponent } from '../../../components/ds-preview/ds-preview.component';
import { DsCodeBlockComponent } from '../../../components/ds-code-block/ds-code-block.component';

@Component({
  selector: 'app-ds-form-fields',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    InputTextModule, PasswordModule, FloatLabelModule, IconFieldModule,
    InputIconModule, SelectModule, ButtonModule, ToastModule,
    DsPreviewComponent, DsCodeBlockComponent
  ],
  providers: [MessageService],
  templateUrl: './form-fields.component.html',
  styleUrl: './form-fields.component.scss'
})
export class FormFieldsComponent {
  // Interactive state with signals
  basicValue = signal('');
  floatValue = signal('');
  searchValue = signal('');

  // Registration form demo
  regName = signal('');
  regEmail = signal('');
  regPassword = signal('');
  regCountry = signal<any>(null);
  regNameTouched = signal(false);
  regEmailTouched = signal(false);
  regPasswordTouched = signal(false);

  countries = [
    { name: 'United States', code: 'US' },
    { name: 'United Kingdom', code: 'UK' },
    { name: 'Canada', code: 'CA' },
    { name: 'Australia', code: 'AU' },
    { name: 'Germany', code: 'DE' },
    { name: 'France', code: 'FR' },
    { name: 'Spain', code: 'ES' },
    { name: 'Mexico', code: 'MX' }
  ];

  // Computed validations
  isNameValid = computed(() => this.regName().length >= 2);
  isEmailValid = computed(() => {
    const email = this.regEmail();
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  });
  passwordStrength = computed(() => {
    const pwd = this.regPassword();
    if (pwd.length === 0) return { level: 'none', score: 0, text: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { level: 'weak', score: 20, text: 'Weak' };
    if (score === 2) return { level: 'fair', score: 40, text: 'Fair' };
    if (score === 3) return { level: 'good', score: 60, text: 'Good' };
    if (score === 4) return { level: 'strong', score: 80, text: 'Strong' };
    return { level: 'excellent', score: 100, text: 'Excellent' };
  });

  isFormValid = computed(() =>
    this.isNameValid() &&
    this.isEmailValid() &&
    this.passwordStrength().score >= 40
  );

  // Reactive form for validation demo
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)])
  });

  basicCode = `<div class="field">
  <label for="username">Username</label>
  <input pInputText id="username" [(ngModel)]="value" />
</div>`;

  floatLabelCode = `<p-floatLabel>
  <input pInputText id="email" [(ngModel)]="value" />
  <label for="email">Email</label>
</p-floatLabel>`;

  iconFieldCode = `<p-iconField>
  <p-inputIcon styleClass="pi pi-search" />
  <input pInputText placeholder="Search" />
</p-iconField>

<p-iconField iconPosition="right">
  <p-inputIcon styleClass="pi pi-spin pi-spinner" />
  <input pInputText placeholder="Loading..." />
</p-iconField>`;

  validationCode = `<div class="field">
  <label for="email">Email *</label>
  <input
    pInputText
    id="email"
    [formControl]="emailControl"
    [class.ng-invalid]="emailControl.invalid && emailControl.dirty"
  />
  @if (emailControl.invalid && emailControl.dirty) {
    <small class="p-error">Valid email is required</small>
  }
</div>`;

  helpTextCode = `<div class="field">
  <label for="password">Password</label>
  <input pInputText id="password" type="password" />
  <small class="p-text-secondary">Must be at least 8 characters</small>
</div>`;

  interactiveCode = `// Signals for reactive state
regEmail = signal('');
regEmailTouched = signal(false);

isEmailValid = computed(() => {
  const email = this.regEmail();
  if (!email) return false;
  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
});

// Template
<div class="field">
  <label for="email">Email</label>
  <p-iconField>
    <p-inputIcon styleClass="pi pi-envelope" />
    <input
      pInputText
      id="email"
      [ngModel]="regEmail()"
      (ngModelChange)="regEmail.set($event)"
      (blur)="regEmailTouched.set(true)"
      [class.ng-invalid]="!isEmailValid() && regEmailTouched()"
      [class.ng-valid]="isEmailValid() && regEmail()"
    />
  </p-iconField>
  @if (!isEmailValid() && regEmailTouched()) {
    <small class="p-error">Please enter a valid email address</small>
  }
</div>`;

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

  submitRegistration(): void {
    // Mark all as touched
    this.regNameTouched.set(true);
    this.regEmailTouched.set(true);
    this.regPasswordTouched.set(true);

    if (this.isFormValid()) {
      this.messageService.add({
        severity: 'success',
        summary: 'Registration Successful',
        detail: `Welcome, ${this.regName()}! Your account has been created.`
      });
      // Reset form
      this.regName.set('');
      this.regEmail.set('');
      this.regPassword.set('');
      this.regCountry.set(null);
      this.regNameTouched.set(false);
      this.regEmailTouched.set(false);
      this.regPasswordTouched.set(false);
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields correctly'
      });
    }
  }

  getPasswordStrengthClass(): string {
    const level = this.passwordStrength().level;
    return `strength-${level}`;
  }
}
