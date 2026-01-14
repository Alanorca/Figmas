import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Components
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PasswordModule } from 'primeng/password';
import { FileUploadModule } from 'primeng/fileupload';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TabsModule } from 'primeng/tabs';

interface PerfilUsuario {
  id: string;
  mote: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  email: string;
  telefono: string;
  rol: string;
  avatar: string | null;
  idioma: 'es' | 'en';
}

interface CambioPassword {
  actual: string;
  nueva: string;
  confirmar: string;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    AvatarModule,
    DividerModule,
    ToastModule,
    PasswordModule,
    FileUploadModule,
    RadioButtonModule,
    TabsModule
  ],
  providers: [MessageService],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss'
})
export class PerfilComponent {
  private messageService = inject(MessageService);

  // Estado del usuario actual (mock - se conectaria al servicio de auth)
  usuario = signal<PerfilUsuario>({
    id: '1',
    mote: 'Alan',
    nombre: 'Alan',
    apellidoPaterno: 'Franco',
    apellidoMaterno: '',
    email: 'afranco@orcagrc.com',
    telefono: '+52 55 1234 5678',
    rol: 'Administrador',
    avatar: null,
    idioma: 'es'
  });

  // Form para edicion
  usuarioEditando = signal<PerfilUsuario | null>(null);

  // Cambio de password
  cambioPassword = signal<CambioPassword>({
    actual: '',
    nueva: '',
    confirmar: ''
  });

  // Tab activo
  activeTab = signal(0);

  // Estados de UI
  guardando = signal(false);

  // Opciones de idioma
  idiomaOptions = [
    { label: 'Español', value: 'es', flag: 'mx' },
    { label: 'English', value: 'en', flag: 'gb' }
  ];

  // Computed
  nombreCompleto = computed(() => {
    const u = this.usuario();
    return `${u.nombre} ${u.apellidoPaterno}${u.apellidoMaterno ? ' ' + u.apellidoMaterno : ''}`;
  });

  iniciales = computed(() => {
    const u = this.usuario();
    const first = u.nombre.charAt(0) || '';
    const second = u.apellidoPaterno.charAt(0) || '';
    return `${first}${second}`.toUpperCase();
  });

  passwordValida = computed(() => {
    const p = this.cambioPassword();
    return p.nueva.length >= 8 && p.actual.length > 0 && p.nueva === p.confirmar;
  });

  passwordsCoinciden = computed(() => {
    const p = this.cambioPassword();
    return p.confirmar.length === 0 || p.nueva === p.confirmar;
  });

  // ============================================================
  // Edicion de Perfil
  // ============================================================

  cancelarEdicion(): void {
    this.usuarioEditando.set({ ...this.usuario() });
  }

  guardarPerfil(): void {
    const datosEditados = this.usuarioEditando();
    if (!datosEditados) return;

    this.guardando.set(true);

    // Simular guardado
    setTimeout(() => {
      this.usuario.set(datosEditados);
      this.guardando.set(false);

      this.messageService.add({
        severity: 'success',
        summary: 'Perfil actualizado',
        detail: 'Tu información ha sido guardada correctamente'
      });
    }, 800);
  }

  // ============================================================
  // Cambio de Idioma
  // ============================================================

  cambiarIdioma(idioma: 'es' | 'en'): void {
    this.usuario.update(u => ({ ...u, idioma }));

    this.messageService.add({
      severity: 'success',
      summary: 'Idioma actualizado',
      detail: idioma === 'es' ? 'Idioma cambiado a Español' : 'Language changed to English'
    });
  }

  // ============================================================
  // Cambio de Password
  // ============================================================

  cancelarPassword(): void {
    this.cambioPassword.set({ actual: '', nueva: '', confirmar: '' });
    this.activeTab.set(0);
  }

  guardarPassword(): void {
    if (!this.passwordValida()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Verifica que la contraseña cumpla los requisitos'
      });
      return;
    }

    this.guardando.set(true);

    // Simular cambio de password
    setTimeout(() => {
      this.guardando.set(false);
      this.cambioPassword.set({ actual: '', nueva: '', confirmar: '' });

      this.messageService.add({
        severity: 'success',
        summary: 'Contraseña actualizada',
        detail: 'Tu contraseña ha sido cambiada exitosamente'
      });

      // Volver al tab de información
      this.activeTab.set(0);
    }, 800);
  }

  // ============================================================
  // Avatar
  // ============================================================

  onAvatarUpload(event: any): void {
    const file = event.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.usuario.update(u => ({ ...u, avatar: e.target.result }));
        this.messageService.add({
          severity: 'success',
          summary: 'Imagen actualizada',
          detail: 'Tu foto de perfil ha sido actualizada'
        });
      };
      reader.readAsDataURL(file);
    }
  }

  // ============================================================
  // Helpers
  // ============================================================

  updateEditForm(field: keyof PerfilUsuario, value: any): void {
    if (!this.usuarioEditando()) {
      this.usuarioEditando.set({ ...this.usuario() });
    }
    this.usuarioEditando.update(u => u ? { ...u, [field]: value } : null);
  }

  updatePasswordForm(field: keyof CambioPassword, value: string): void {
    this.cambioPassword.update(p => ({ ...p, [field]: value }));
  }
}
