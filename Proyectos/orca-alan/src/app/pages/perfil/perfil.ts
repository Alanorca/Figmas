import { CommonModule } from '@angular/common';
import { Component, signal, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TabsModule } from 'primeng/tabs';
import { InputMaskModule } from 'primeng/inputmask';
import { RadioButtonModule } from 'primeng/radiobutton';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DividerModule,
    TooltipModule,
    DialogModule,
    PasswordModule,
    ToastModule,
    ToggleSwitchModule,
    TabsModule,
    InputMaskModule,
    RadioButtonModule
  ],
  providers: [MessageService],
  template: `
    <p-toast />

    <div class="perfil-page">
      <!-- Header -->
      <div class="perfil-header">
        <h1>Perfil</h1>
        <p class="subtitle">Actualiza tu foto y datos personales</p>
      </div>

      <!-- Tabs -->
      <div class="perfil-tabs">
        <button
          class="tab-btn"
          [class.active]="activeTab() === 'perfil'"
          (click)="activeTab.set('perfil')"
        >
          Perfil
        </button>
        <button
          class="tab-btn"
          [class.active]="activeTab() === 'ajustes'"
          (click)="activeTab.set('ajustes')"
        >
          Ajustes
        </button>
      </div>

      <!-- Contenido Tab Perfil -->
      @if (activeTab() === 'perfil') {
        <div class="perfil-content">
          <!-- Panel Izquierdo: Datos Generales -->
          <div class="left-panel">
          <div class="profile-card">
            <!-- Avatar -->
            <div class="avatar-section" (click)="triggerFileUpload()">
              <div class="avatar-container">
                @if (avatarPreview() || userProfile().avatar) {
                  <img
                    [src]="avatarPreview() || userProfile().avatar"
                    [alt]="userProfile().name"
                    class="avatar-img"
                  />
                } @else {
                  <div class="avatar-placeholder">
                    <i class="pi pi-user"></i>
                  </div>
                }
                <div class="avatar-upload-btn">
                  <i class="pi pi-plus"></i>
                </div>
              </div>
              <input
                #fileInput
                type="file"
                accept="image/*"
                (change)="onFileSelected($event)"
                style="display: none"
              />
            </div>

            <!-- Nombre y datos básicos -->
            <div class="user-info">
              <h2 class="user-name">{{ formData.nombre }} {{ formData.apellidoPaterno }}</h2>
              <div class="user-meta">
                <span class="meta-item">
                  <i class="pi pi-envelope"></i>
                  E-mail: {{ formData.email }}
                </span>
                <span class="meta-item">
                  <i class="pi pi-id-card"></i>
                  Perfil: {{ formData.cargo }}
                </span>
              </div>
            </div>

            <!-- Idioma -->
            <div class="language-section">
              <div class="language-row">
                <span class="language-label">Idioma</span>
                <div class="language-options">
                  <div class="language-option">
                    <p-radioButton
                      name="idioma"
                      value="es"
                      [(ngModel)]="formData.idioma"
                      inputId="idioma-es"
                    />
                    <label for="idioma-es" class="radio-label">
                      <span class="flag-icon">🇲🇽</span>
                      Español
                    </label>
                  </div>
                  <div class="language-option">
                    <p-radioButton
                      name="idioma"
                      value="en"
                      [(ngModel)]="formData.idioma"
                      inputId="idioma-en"
                    />
                    <label for="idioma-en" class="radio-label">
                      <span class="flag-icon">🇬🇧</span>
                      English
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <p-divider />

            <!-- Resumen -->
            <div class="summary-section">
              <div class="summary-list">
                <div class="summary-item">
                  <i class="pi pi-building"></i>
                  <div class="summary-content">
                    <span class="summary-label">Departamento</span>
                    <span class="summary-value">{{ getDepartamentoLabel() }}</span>
                  </div>
                </div>

                <div class="summary-item">
                  <i class="pi pi-phone"></i>
                  <div class="summary-content">
                    <span class="summary-label">Teléfono</span>
                    <span class="summary-value">{{ formData.telefono || 'No especificado' }}</span>
                  </div>
                </div>

                <div class="summary-item">
                  <i class="pi pi-globe"></i>
                  <div class="summary-content">
                    <span class="summary-label">Zona horaria</span>
                    <span class="summary-value">{{ getZonaHorariaShort() }}</span>
                  </div>
                </div>

                <div class="summary-item">
                  <i class="pi pi-calendar"></i>
                  <div class="summary-content">
                    <span class="summary-label">Miembro desde</span>
                    <span class="summary-value">Enero 2024</span>
                  </div>
                </div>
              </div>
            </div>

            <p-divider />

            <!-- Acciones de seguridad -->
            <div class="security-section">
              <button
                pButton
                type="button"
                label="Cambiar contraseña"
                icon="pi pi-lock"
                class="p-button-outlined w-full"
                (click)="activeTab.set('ajustes')"
              ></button>
              <button
                pButton
                type="button"
                label="Cerrar sesión"
                icon="pi pi-sign-out"
                class="p-button-outlined p-button-secondary w-full"
              ></button>
            </div>
          </div>
        </div>

        <!-- Panel Derecho: Formulario de Edición -->
        <div class="right-panel">
          <div class="edit-card">
            <!-- Toggle editar -->
            <div class="edit-toggle-row">
              <span class="toggle-label">Editar información</span>
              <p-toggleswitch [(ngModel)]="editModeEnabled" />
            </div>

            <p-divider />

            <!-- Formulario -->
            <div class="edit-form">
              <div class="form-row">
                <div class="form-field">
                  <label class="field-label">Alias</label>
                  <input
                    pInputText
                    type="text"
                    [(ngModel)]="formData.alias"
                    class="w-full"
                    [disabled]="!editModeEnabled"
                    placeholder="Alias"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-field">
                  <label class="field-label">Nombre</label>
                  <input
                    pInputText
                    type="text"
                    [(ngModel)]="formData.nombre"
                    class="w-full"
                    [disabled]="!editModeEnabled"
                    placeholder="Nombre"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-field">
                  <label class="field-label">Apellido Paterno</label>
                  <input
                    pInputText
                    type="text"
                    [(ngModel)]="formData.apellidoPaterno"
                    class="w-full"
                    [disabled]="!editModeEnabled"
                    placeholder="Apellido Paterno"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-field">
                  <label class="field-label">Apellido Materno</label>
                  <input
                    pInputText
                    type="text"
                    [(ngModel)]="formData.apellidoMaterno"
                    class="w-full"
                    [disabled]="!editModeEnabled"
                    placeholder="Apellido Materno"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-field">
                  <label class="field-label">Teléfono</label>
                  <input
                    pInputText
                    type="tel"
                    [(ngModel)]="formData.telefono"
                    class="w-full"
                    [disabled]="!editModeEnabled"
                    placeholder="Teléfono"
                  />
                </div>
              </div>

              <div class="form-row phone-row">
                <div class="form-field phone-code">
                  <label class="field-label">Otro</label>
                  <p-select
                    [options]="countryCodes"
                    [(ngModel)]="formData.otroCodigoPais"
                    optionLabel="label"
                    optionValue="value"
                    styleClass="w-full"
                    [disabled]="!editModeEnabled"
                    placeholder="+52"
                  />
                </div>
                <div class="form-field phone-number">
                  <label class="field-label">&nbsp;</label>
                  <input
                    pInputText
                    type="tel"
                    [(ngModel)]="formData.otroTelefono"
                    class="w-full"
                    [disabled]="!editModeEnabled"
                    placeholder="Número"
                  />
                </div>
              </div>

              <!-- Botón Guardar -->
              <div class="form-actions">
                <button
                  pButton
                  type="button"
                  label="Guardar"
                  icon="pi pi-check"
                  [disabled]="!editModeEnabled"
                  (click)="saveChanges()"
                ></button>
              </div>
            </div>
          </div>
        </div>
      </div>
      }

      <!-- Contenido Tab Ajustes -->
      @if (activeTab() === 'ajustes') {
        <div class="ajustes-content">
          <!-- Sección Cambiar Contraseña -->
          <div class="settings-card">
            <div class="settings-header">
              <div class="settings-icon">
                <i class="pi pi-lock"></i>
              </div>
              <div class="settings-title">
                <h3>Cambiar contraseña</h3>
                <p>Actualiza tu contraseña para mantener tu cuenta segura</p>
              </div>
            </div>

            <p-divider />

            <div class="password-form-inline">
              <div class="form-field">
                <label class="field-label">Contraseña actual</label>
                <p-password
                  [(ngModel)]="passwordForm.currentPassword"
                  [toggleMask]="true"
                  [feedback]="false"
                  styleClass="w-full"
                  inputStyleClass="w-full"
                  placeholder="Ingresa tu contraseña actual"
                />
              </div>

              <p-divider />

              <div class="form-field">
                <label class="field-label">Nueva contraseña</label>
                <p-password
                  [(ngModel)]="passwordForm.newPassword"
                  [toggleMask]="true"
                  [feedback]="true"
                  styleClass="w-full"
                  inputStyleClass="w-full"
                  placeholder="Ingresa tu nueva contraseña"
                  promptLabel="Ingresa una contraseña"
                  weakLabel="Débil"
                  mediumLabel="Media"
                  strongLabel="Fuerte"
                />
                <small class="hint-text">La contraseña debe tener al menos 8 caracteres</small>
              </div>

              <div class="form-field">
                <label class="field-label">Confirmar nueva contraseña</label>
                <p-password
                  [(ngModel)]="passwordForm.confirmPassword"
                  [toggleMask]="true"
                  [feedback]="false"
                  styleClass="w-full"
                  inputStyleClass="w-full"
                  placeholder="Confirma tu nueva contraseña"
                />
                @if (passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword) {
                  <small class="error-text">Las contraseñas no coinciden</small>
                }
                @if (passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword === passwordForm.confirmPassword) {
                  <small class="success-text"><i class="pi pi-check"></i> Las contraseñas coinciden</small>
                }
              </div>

              <div class="form-actions-password">
                <button
                  pButton
                  type="button"
                  label="Cancelar"
                  class="p-button-outlined p-button-secondary"
                  (click)="resetPasswordForm()"
                  [disabled]="!hasPasswordFormData()"
                ></button>
                <button
                  pButton
                  type="button"
                  label="Cambiar contraseña"
                  icon="pi pi-check"
                  [disabled]="!isPasswordFormValid()"
                  (click)="changePassword()"
                ></button>
              </div>
            </div>
          </div>

          <!-- Sección Preferencias de Seguridad -->
          <div class="settings-card">
            <div class="settings-header">
              <div class="settings-icon">
                <i class="pi pi-shield"></i>
              </div>
              <div class="settings-title">
                <h3>Preferencias de seguridad</h3>
                <p>Configura opciones adicionales de seguridad</p>
              </div>
            </div>

            <p-divider />

            <div class="security-options">
              <div class="security-option">
                <div class="option-info">
                  <span class="option-label">Autenticación de dos factores (2FA)</span>
                  <span class="option-description">Añade una capa extra de seguridad a tu cuenta</span>
                </div>
                <p-toggleswitch [(ngModel)]="securitySettings.twoFactorEnabled" />
              </div>

              <p-divider />

              <div class="security-option">
                <div class="option-info">
                  <span class="option-label">Notificaciones de inicio de sesión</span>
                  <span class="option-description">Recibe un correo cuando se inicie sesión desde un nuevo dispositivo</span>
                </div>
                <p-toggleswitch [(ngModel)]="securitySettings.loginNotifications" />
              </div>

              <p-divider />

              <div class="security-option">
                <div class="option-info">
                  <span class="option-label">Cerrar sesión automáticamente</span>
                  <span class="option-description">Cerrar sesión después de 30 minutos de inactividad</span>
                </div>
                <p-toggleswitch [(ngModel)]="securitySettings.autoLogout" />
              </div>
            </div>
          </div>

          <!-- Sección Sesiones Activas -->
          <div class="settings-card">
            <div class="settings-header">
              <div class="settings-icon">
                <i class="pi pi-desktop"></i>
              </div>
              <div class="settings-title">
                <h3>Sesiones activas</h3>
                <p>Dispositivos donde tu cuenta está activa</p>
              </div>
            </div>

            <p-divider />

            <div class="sessions-list">
              @for (session of activeSessions; track session.id) {
                <div class="session-item" [class.current]="session.current">
                  <div class="session-icon">
                    <i [class]="session.icon"></i>
                  </div>
                  <div class="session-info">
                    <span class="session-device">{{ session.device }}</span>
                    <span class="session-details">
                      {{ session.location }} • {{ session.lastActive }}
                      @if (session.current) {
                        <span class="current-badge">Sesión actual</span>
                      }
                    </span>
                  </div>
                  @if (!session.current) {
                    <button
                      pButton
                      type="button"
                      icon="pi pi-sign-out"
                      class="p-button-text p-button-danger p-button-sm"
                      pTooltip="Cerrar sesión"
                      (click)="closeSession(session.id)"
                    ></button>
                  }
                </div>
              }
            </div>

            <div class="sessions-actions">
              <button
                pButton
                type="button"
                label="Cerrar todas las otras sesiones"
                icon="pi pi-sign-out"
                class="p-button-outlined p-button-danger"
                (click)="closeAllOtherSessions()"
              ></button>
            </div>
          </div>
        </div>
      }
    </div>

    <!-- Modal de cambio de contraseña (legacy, ahora en tab) -->
    <p-dialog
      header="Cambiar contraseña"
      [(visible)]="showPasswordDialog"
      [modal]="true"
      [closable]="true"
      [style]="{ width: '450px' }"
      [draggable]="false"
      [resizable]="false"
    >
      <div class="password-form">
        <div class="form-field">
          <label class="field-label">Contraseña actual</label>
          <p-password
            [(ngModel)]="passwordForm.currentPassword"
            [toggleMask]="true"
            [feedback]="false"
            styleClass="w-full"
            inputStyleClass="w-full"
            placeholder="Ingresa tu contraseña actual"
          />
        </div>

        <p-divider />

        <div class="form-field">
          <label class="field-label">Nueva contraseña</label>
          <p-password
            [(ngModel)]="passwordForm.newPassword"
            [toggleMask]="true"
            [feedback]="true"
            styleClass="w-full"
            inputStyleClass="w-full"
            placeholder="Ingresa tu nueva contraseña"
            promptLabel="Ingresa una contraseña"
            weakLabel="Débil"
            mediumLabel="Media"
            strongLabel="Fuerte"
          />
        </div>

        <div class="form-field">
          <label class="field-label">Confirmar nueva contraseña</label>
          <p-password
            [(ngModel)]="passwordForm.confirmPassword"
            [toggleMask]="true"
            [feedback]="false"
            styleClass="w-full"
            inputStyleClass="w-full"
            placeholder="Confirma tu nueva contraseña"
          />
          @if (passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword) {
            <small class="error-text">Las contraseñas no coinciden</small>
          }
        </div>
      </div>

      <ng-template pTemplate="footer">
        <button
          pButton
          type="button"
          label="Cancelar"
          class="p-button-text"
          (click)="closePasswordDialog()"
        ></button>
        <button
          pButton
          type="button"
          label="Cambiar contraseña"
          icon="pi pi-check"
          [disabled]="!isPasswordFormValid()"
          (click)="changePassword()"
        ></button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .perfil-page {
      padding: var(--spacing-6);
      max-width: 1200px;
      margin: 0 auto;
      background: var(--surface-ground);
      min-height: 100vh;
    }

    .perfil-header {
      margin-bottom: var(--spacing-4);

      h1 {
        font-size: var(--font-size-2xl);
        font-weight: var(--font-weight-semibold);
        color: var(--text-color);
        margin: 0 0 var(--spacing-1) 0;
      }

      .subtitle {
        font-size: var(--font-size-sm);
        color: var(--text-color-secondary);
        margin: 0;
      }
    }

    .perfil-tabs {
      display: flex;
      gap: var(--spacing-1);
      margin-bottom: var(--spacing-6);
      border-bottom: 1px solid var(--surface-border);
      padding-bottom: 0;

      .tab-btn {
        padding: var(--spacing-3) var(--spacing-4);
        background: none;
        border: none;
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        color: var(--text-color-secondary);
        cursor: pointer;
        position: relative;
        transition: color 0.2s;

        &:hover {
          color: var(--text-color);
        }

        &.active {
          color: var(--primary-color);

          &::after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            right: 0;
            height: 2px;
            background: var(--primary-color);
          }
        }
      }
    }

    .perfil-content {
      display: grid;
      grid-template-columns: 340px 1fr;
      gap: var(--spacing-6);
      align-items: stretch;
    }

    @media (max-width: 900px) {
      .perfil-content {
        grid-template-columns: 1fr;
      }
    }

    /* Panel Izquierdo */
    .left-panel {
      display: flex;
      flex-direction: column;

      .profile-card {
        background: var(--surface-card);
        border-radius: var(--border-radius-xl);
        padding: var(--spacing-6);
        border: 1px solid var(--surface-border);
        flex: 1;
        display: flex;
        flex-direction: column;
      }
    }

    .avatar-section {
      display: flex;
      justify-content: center;
      margin-bottom: var(--spacing-4);
    }

    .avatar-container {
      position: relative;
      width: 88px;
      height: 88px;
      cursor: pointer;

      &:hover .avatar-upload-btn {
        transform: scale(1.1);
      }
    }

    .avatar-img {
      width: 88px;
      height: 88px;
      border-radius: 50%;
      object-fit: cover;
      background: var(--surface-200);
    }

    .avatar-placeholder {
      width: 88px;
      height: 88px;
      border-radius: 50%;
      background: var(--surface-200);
      display: flex;
      align-items: center;
      justify-content: center;

      i {
        font-size: 2rem;
        color: var(--text-color-secondary);
      }
    }

    .avatar-upload-btn {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--primary-color);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--surface-card);
      cursor: pointer;
      transition: transform 0.2s;

      i {
        font-size: 0.75rem;
      }
    }

    .user-info {
      text-align: center;
      margin-bottom: var(--spacing-4);
    }

    .user-name {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
      color: var(--text-color);
      margin: 0 0 var(--spacing-2) 0;
    }

    .user-meta {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1);

      .meta-item {
        font-size: var(--font-size-sm);
        color: var(--text-color-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-2);

        i {
          font-size: 0.875rem;
          width: 16px;
        }
      }
    }

    .language-section {
      margin: var(--spacing-4) 0;
    }

    .language-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-3);
    }

    .language-label {
      font-size: var(--font-size-sm);
      color: var(--text-color);
      font-weight: var(--font-weight-medium);
    }

    .language-options {
      display: flex;
      gap: var(--spacing-4);
    }

    .language-option {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
    }

    .radio-label {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      font-size: var(--font-size-sm);
      color: var(--text-color);
      cursor: pointer;

      .flag-icon {
        font-size: 1.1rem;
      }
    }

    .summary-section {
      margin: var(--spacing-4) 0;
    }

    .summary-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-3);
    }

    .summary-item {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-3);

      > i {
        width: 20px;
        color: var(--primary-color);
        margin-top: 2px;
        font-size: 0.875rem;
      }
    }

    .summary-content {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .summary-label {
        font-size: var(--font-size-xs);
        color: var(--text-color-secondary);
      }

      .summary-value {
        font-size: var(--font-size-sm);
        color: var(--text-color);
        font-weight: var(--font-weight-medium);
      }
    }

    .security-section {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-3);
      margin-top: auto;
      padding-top: var(--spacing-4);
    }

    /* Panel Derecho */
    .right-panel {
      display: flex;
      flex-direction: column;

      .edit-card {
        background: var(--surface-card);
        border-radius: var(--border-radius-xl);
        padding: var(--spacing-6);
        border: 1px solid var(--surface-border);
        flex: 1;
        display: flex;
        flex-direction: column;
      }
    }

    .edit-toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .toggle-label {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        color: var(--text-color);
      }
    }

    .edit-form {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-4);
    }

    .form-row {
      display: flex;
      gap: var(--spacing-4);

      &.phone-row {
        .phone-code {
          flex: 0 0 120px;
        }
        .phone-number {
          flex: 1;
        }
      }
    }

    .form-field {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
    }

    .field-label {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--text-color);
    }

    .form-actions {
      display: flex;
      justify-content: flex-start;
      margin-top: var(--spacing-2);
    }

    /* Modal de contraseña */
    .password-form {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-4);
    }

    .error-text {
      color: var(--red-500);
      font-size: var(--font-size-xs);
      margin-top: var(--spacing-1);
    }

    /* Tab Ajustes */
    .ajustes-content {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-6);
      max-width: 800px;
    }

    .settings-card {
      background: var(--surface-card);
      border-radius: var(--border-radius-xl);
      padding: var(--spacing-6);
      border: 1px solid var(--surface-border);
    }

    .settings-header {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-4);
    }

    .settings-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--border-radius-lg);
      background: var(--primary-50);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      i {
        font-size: 1.25rem;
        color: var(--primary-color);
      }
    }

    .settings-title {
      h3 {
        margin: 0 0 var(--spacing-1) 0;
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--text-color);
      }

      p {
        margin: 0;
        font-size: var(--font-size-sm);
        color: var(--text-color-secondary);
      }
    }

    .password-form-inline {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-4);
      max-width: 400px;
    }

    .hint-text {
      font-size: var(--font-size-xs);
      color: var(--text-color-secondary);
      margin-top: var(--spacing-1);
    }

    .success-text {
      font-size: var(--font-size-xs);
      color: var(--green-500);
      margin-top: var(--spacing-1);
      display: flex;
      align-items: center;
      gap: var(--spacing-1);

      i {
        font-size: 0.75rem;
      }
    }

    .form-actions-password {
      display: flex;
      gap: var(--spacing-3);
      margin-top: var(--spacing-2);
    }

    /* Security Options */
    .security-options {
      display: flex;
      flex-direction: column;
    }

    .security-option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-4);
      padding: var(--spacing-2) 0;
    }

    .option-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .option-label {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--text-color);
    }

    .option-description {
      font-size: var(--font-size-xs);
      color: var(--text-color-secondary);
    }

    /* Sessions */
    .sessions-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-3);
    }

    .session-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      padding: var(--spacing-3);
      border-radius: var(--border-radius-lg);
      background: var(--surface-50);
      transition: background 0.2s;

      &:hover {
        background: var(--surface-100);
      }

      &.current {
        background: var(--primary-50);
        border: 1px solid var(--primary-200);
      }
    }

    .session-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--border-radius-md);
      background: var(--surface-card);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      i {
        font-size: 1.125rem;
        color: var(--text-color-secondary);
      }
    }

    .session-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .session-device {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--text-color);
    }

    .session-details {
      font-size: var(--font-size-xs);
      color: var(--text-color-secondary);
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
    }

    .current-badge {
      background: var(--primary-color);
      color: white;
      font-size: 0.625rem;
      font-weight: var(--font-weight-semibold);
      padding: 2px 6px;
      border-radius: var(--border-radius-sm);
      text-transform: uppercase;
    }

    .sessions-actions {
      margin-top: var(--spacing-4);
      padding-top: var(--spacing-4);
      border-top: 1px solid var(--surface-border);
    }

    /* Estilos para inputs disabled */
    :host ::ng-deep {
      input:disabled,
      .p-select.p-disabled {
        opacity: 0.7;
        background: var(--surface-100);
      }

      .p-password {
        width: 100%;
      }

      .p-toggleswitch {
        .p-toggleswitch-slider {
          background: var(--surface-300);
        }
        &.p-toggleswitch-checked .p-toggleswitch-slider {
          background: var(--primary-color);
        }
      }
    }

  `]
})
export class PerfilComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // Tab activa
  activeTab = signal<'perfil' | 'ajustes'>('perfil');

  // Estado de edición
  editModeEnabled = false;

  // Preview del avatar
  avatarPreview = signal<string | null>(null);

  // Modal de contraseña
  showPasswordDialog = false;

  // Perfil del usuario
  userProfile = signal({
    name: 'AlanFranco',
    email: 'sagomez@orcagrc.com',
    avatar: '',
    role: 'Administrador'
  });

  // Códigos de país
  countryCodes = [
    { label: '🇲🇽 +52', value: '+52' },
    { label: '🇺🇸 +1', value: '+1' },
    { label: '🇪🇸 +34', value: '+34' },
    { label: '🇨🇴 +57', value: '+57' },
    { label: '🇦🇷 +54', value: '+54' }
  ];

  // Opciones de idioma
  idiomas = [
    { label: 'Español', value: 'es' },
    { label: 'English', value: 'en' },
    { label: 'Português', value: 'pt' }
  ];

  // Zonas horarias
  zonasHorarias = [
    { label: '(GMT-06:00) Ciudad de México', value: 'America/Mexico_City' },
    { label: '(GMT-05:00) Bogotá, Lima', value: 'America/Bogota' },
    { label: '(GMT-03:00) Buenos Aires', value: 'America/Argentina/Buenos_Aires' },
    { label: '(GMT+01:00) Madrid', value: 'Europe/Madrid' }
  ];

  // Departamentos
  departamentos = [
    { label: 'Riesgos', value: 'riesgos' },
    { label: 'Cumplimiento', value: 'cumplimiento' },
    { label: 'Auditoría', value: 'auditoria' },
    { label: 'Tecnología', value: 'tecnologia' },
    { label: 'Operaciones', value: 'operaciones' }
  ];

  // Datos del formulario
  formData = {
    alias: 'AlanFranco',
    nombre: 'Alan',
    apellidoPaterno: 'Franco',
    apellidoMaterno: '',
    email: 'sagomez@orcagrc.com',
    telefono: '',
    otroCodigoPais: '+52',
    otroTelefono: '',
    departamento: 'tecnologia',
    cargo: 'Administrador',
    idioma: 'es',
    zonaHoraria: 'America/Mexico_City'
  };

  // Backup para cancelar
  private formDataBackup: typeof this.formData | null = null;

  // Formulario de contraseña
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // Configuraciones de seguridad
  securitySettings = {
    twoFactorEnabled: false,
    loginNotifications: true,
    autoLogout: false
  };

  // Sesiones activas
  activeSessions = [
    {
      id: '1',
      device: 'Chrome en Windows',
      icon: 'pi pi-desktop',
      location: 'Ciudad de México, México',
      lastActive: 'Activo ahora',
      current: true
    },
    {
      id: '2',
      device: 'Safari en iPhone',
      icon: 'pi pi-mobile',
      location: 'Ciudad de México, México',
      lastActive: 'Hace 2 horas',
      current: false
    },
    {
      id: '3',
      device: 'Firefox en MacOS',
      icon: 'pi pi-desktop',
      location: 'Guadalajara, México',
      lastActive: 'Hace 3 días',
      current: false
    }
  ];

  constructor(private messageService: MessageService) {}

  // Guardar cambios
  saveChanges(): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Cambios guardados',
      detail: 'Tu perfil ha sido actualizado correctamente'
    });
    this.editModeEnabled = false;
  }

  // Trigger del file input
  triggerFileUpload(): void {
    this.fileInput.nativeElement.click();
  }

  // Manejar selección de archivo
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Por favor selecciona un archivo de imagen válido'
        });
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'La imagen no debe superar los 5MB'
        });
        return;
      }

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.avatarPreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  // Validar formulario de contraseña
  isPasswordFormValid(): boolean {
    return (
      this.passwordForm.currentPassword.length > 0 &&
      this.passwordForm.newPassword.length >= 8 &&
      this.passwordForm.newPassword === this.passwordForm.confirmPassword
    );
  }

  // Cambiar contraseña
  changePassword(): void {
    if (this.isPasswordFormValid()) {
      this.messageService.add({
        severity: 'success',
        summary: 'Contraseña actualizada',
        detail: 'Tu contraseña ha sido cambiada correctamente'
      });
      this.closePasswordDialog();
    }
  }

  // Cerrar modal de contraseña
  closePasswordDialog(): void {
    this.showPasswordDialog = false;
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  getDepartamentoLabel(): string {
    const dep = this.departamentos.find(d => d.value === this.formData.departamento);
    return dep?.label || '';
  }

  getZonaHorariaShort(): string {
    const zona = this.zonasHorarias.find(z => z.value === this.formData.zonaHoraria);
    if (zona) {
      const match = zona.label.match(/\(GMT[^)]+\)/);
      return match ? match[0] : zona.label;
    }
    return '';
  }

  getIdiomaLabel(): string {
    const idioma = this.idiomas.find(i => i.value === this.formData.idioma);
    return idioma?.label || '';
  }

  // Verificar si hay datos en el formulario de contraseña
  hasPasswordFormData(): boolean {
    return (
      this.passwordForm.currentPassword.length > 0 ||
      this.passwordForm.newPassword.length > 0 ||
      this.passwordForm.confirmPassword.length > 0
    );
  }

  // Resetear formulario de contraseña
  resetPasswordForm(): void {
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  // Cerrar una sesión específica
  closeSession(sessionId: string): void {
    this.activeSessions = this.activeSessions.filter(s => s.id !== sessionId);
    this.messageService.add({
      severity: 'success',
      summary: 'Sesión cerrada',
      detail: 'La sesión ha sido cerrada correctamente'
    });
  }

  // Cerrar todas las otras sesiones
  closeAllOtherSessions(): void {
    this.activeSessions = this.activeSessions.filter(s => s.current);
    this.messageService.add({
      severity: 'success',
      summary: 'Sesiones cerradas',
      detail: 'Todas las otras sesiones han sido cerradas'
    });
  }
}
