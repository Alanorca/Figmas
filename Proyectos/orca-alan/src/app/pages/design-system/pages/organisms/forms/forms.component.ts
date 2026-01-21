import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ToastModule } from 'primeng/toast';
import { StepperModule } from 'primeng/stepper';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import { DsPreviewComponent } from '../../../components/ds-preview/ds-preview.component';
import { DsCodeBlockComponent } from '../../../components/ds-code-block/ds-code-block.component';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

@Component({
  selector: 'app-ds-forms',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    InputTextModule, InputNumberModule, TextareaModule, SelectModule,
    CheckboxModule, RadioButtonModule, ButtonModule, CardModule, FloatLabelModule,
    ToastModule, StepperModule, PasswordModule,
    DsPreviewComponent, DsCodeBlockComponent
  ],
  providers: [MessageService],
  templateUrl: './forms.component.html',
  styleUrl: './forms.component.scss'
})
export class FormsComponent {
  registrationForm: FormGroup;
  settingsForm: FormGroup;

  // Interactive contact form with signals
  contactName = signal('');
  contactEmail = signal('');
  contactSubject = signal('');
  contactMessage = signal('');
  isSubmitting = signal(false);

  // Form validation state
  formTouched = signal(false);

  // Computed validation
  isContactFormValid = computed(() => {
    return this.contactName().trim() !== '' &&
      this.contactEmail().trim() !== '' &&
      this.contactEmail().includes('@') &&
      this.contactSubject().trim() !== '' &&
      this.contactMessage().trim() !== '';
  });

  // Form stats
  charCount = computed(() => this.contactMessage().length);
  fieldsCompleted = computed(() => {
    let count = 0;
    if (this.contactName().trim()) count++;
    if (this.contactEmail().trim() && this.contactEmail().includes('@')) count++;
    if (this.contactSubject().trim()) count++;
    if (this.contactMessage().trim()) count++;
    return count;
  });

  // Multi-step form state
  currentStep = signal(0);
  stepOneData = signal({ firstName: '', lastName: '', email: '' });
  stepTwoData = signal({ company: '', role: '', experience: null as string | null });
  stepThreeData = signal({ plan: 'basic', terms: false });

  countries = [
    { name: 'United States', code: 'US' },
    { name: 'United Kingdom', code: 'UK' },
    { name: 'Canada', code: 'CA' },
    { name: 'Australia', code: 'AU' },
    { name: 'Spain', code: 'ES' },
    { name: 'Germany', code: 'DE' }
  ];

  experienceLevels = [
    { label: 'Junior (0-2 years)', value: 'junior' },
    { label: 'Mid-Level (3-5 years)', value: 'mid' },
    { label: 'Senior (5+ years)', value: 'senior' },
    { label: 'Lead/Manager', value: 'lead' }
  ];

  plans = [
    { name: 'Basic', value: 'basic', price: '$9/month' },
    { name: 'Professional', value: 'pro', price: '$29/month' },
    { name: 'Enterprise', value: 'enterprise', price: '$99/month' }
  ];

  subjects = [
    { label: 'General Inquiry', value: 'general' },
    { label: 'Technical Support', value: 'support' },
    { label: 'Sales Question', value: 'sales' },
    { label: 'Feedback', value: 'feedback' }
  ];

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    this.registrationForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      country: [null, Validators.required],
      terms: [false, Validators.requiredTrue]
    });

    this.settingsForm = this.fb.group({
      notifications: [true],
      newsletter: [false],
      plan: ['basic']
    });
  }

  // Contact form submission
  submitContactForm(): void {
    this.formTouched.set(true);
    if (!this.isContactFormValid()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields correctly'
      });
      return;
    }

    this.isSubmitting.set(true);

    // Simulate API call
    setTimeout(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Message Sent!',
        detail: `Thank you ${this.contactName()}, we'll get back to you soon.`
      });

      // Reset form
      this.contactName.set('');
      this.contactEmail.set('');
      this.contactSubject.set('');
      this.contactMessage.set('');
      this.formTouched.set(false);
      this.isSubmitting.set(false);
    }, 1500);
  }

  // Registration form submission
  onSubmit(): void {
    if (this.registrationForm.valid) {
      this.messageService.add({
        severity: 'success',
        summary: 'Account Created',
        detail: `Welcome, ${this.registrationForm.value.firstName}! Your account has been created.`
      });
      this.registrationForm.reset();
    }
  }

  // Settings form submission
  saveSettings(): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Settings Saved',
      detail: `Your preferences have been updated (Plan: ${this.settingsForm.value.plan})`
    });
  }

  // Multi-step form navigation
  nextStep(): void {
    if (this.currentStep() < 2) {
      this.currentStep.update(s => s + 1);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 0) {
      this.currentStep.update(s => s - 1);
    }
  }

  updateStepOne(field: string, value: string): void {
    this.stepOneData.update(data => ({ ...data, [field]: value }));
  }

  updateStepTwo(field: string, value: string | null): void {
    this.stepTwoData.update(data => ({ ...data, [field]: value }));
  }

  updateStepThree(field: string, value: string | boolean): void {
    this.stepThreeData.update(data => ({ ...data, [field]: value }));
  }

  isStepOneValid(): boolean {
    const data = this.stepOneData();
    return data.firstName.trim() !== '' &&
      data.lastName.trim() !== '' &&
      data.email.trim() !== '' &&
      data.email.includes('@');
  }

  isStepTwoValid(): boolean {
    const data = this.stepTwoData();
    return data.company.trim() !== '' && data.experience !== null;
  }

  isStepThreeValid(): boolean {
    return this.stepThreeData().terms;
  }

  submitMultiStepForm(): void {
    if (this.isStepThreeValid()) {
      this.messageService.add({
        severity: 'success',
        summary: 'Registration Complete!',
        detail: `Welcome ${this.stepOneData().firstName}! Your ${this.stepThreeData().plan} plan is now active.`
      });
      // Reset
      this.currentStep.set(0);
      this.stepOneData.set({ firstName: '', lastName: '', email: '' });
      this.stepTwoData.set({ company: '', role: '', experience: null });
      this.stepThreeData.set({ plan: 'basic', terms: false });
    }
  }

  formCode = `<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <div class="field">
    <label for="email">Email *</label>
    <input pInputText id="email" formControlName="email" />
    @if (form.controls.email.invalid && form.controls.email.dirty) {
      <small class="p-error">Valid email required</small>
    }
  </div>

  <div class="field">
    <label for="password">Password *</label>
    <input pInputText id="password" type="password" formControlName="password" />
  </div>

  <p-button type="submit" label="Submit" [disabled]="form.invalid" />
</form>`;

  interactiveCode = `// Contact form with signals
contactName = signal('');
contactEmail = signal('');
contactMessage = signal('');
isSubmitting = signal(false);

isContactFormValid = computed(() => {
  return this.contactName().trim() !== '' &&
    this.contactEmail().includes('@') &&
    this.contactMessage().trim() !== '';
});

submitContactForm(): void {
  if (!this.isContactFormValid()) return;
  this.isSubmitting.set(true);
  // API call...
  this.messageService.add({
    severity: 'success',
    summary: 'Message Sent!'
  });
}`;

  gridCode = `<div class="form-grid">
  <div class="col-6">
    <div class="field">
      <label>First Name</label>
      <input pInputText formControlName="firstName" />
    </div>
  </div>
  <div class="col-6">
    <div class="field">
      <label>Last Name</label>
      <input pInputText formControlName="lastName" />
    </div>
  </div>
</div>`;
}
