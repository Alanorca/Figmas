import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { ChipModule } from 'primeng/chip';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TimelineModule } from 'primeng/timeline';
import { BadgeModule } from 'primeng/badge';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  avatar?: string;
  cargo: string;
  departamento: string;
  telefono?: string;
  estado: 'activo' | 'inactivo' | 'bloqueado';
  fechaCreacion: Date;
  ultimoAcceso?: Date;
  roles: {
    id: string;
    nombre: string;
    color: string;
  }[];
  permisos: string[];
  asignaciones: {
    tipo: string;
    nombre: string;
    fecha: Date;
  }[];
  actividad: {
    fecha: Date;
    accion: string;
    detalle?: string;
  }[];
}

@Component({
  selector: 'app-usuario-detalle',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    CardModule,
    ButtonModule,
    TagModule,
    AvatarModule,
    DividerModule,
    TooltipModule,
    MenuModule,
    TableModule,
    ChipModule,
    ToastModule,
    ConfirmDialogModule,
    TimelineModule,
    BadgeModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './usuario-detalle.html',
  styleUrl: './usuario-detalle.scss'
})
export class UsuarioDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  usuarioId = signal<string>('');
  loading = signal(true);
  activeTab = signal<'informacion' | 'roles' | 'asignaciones' | 'actividad'>('informacion');

  usuario = signal<Usuario | null>(null);

  // Computed
  estadoSeverity = computed(() => {
    const estado = this.usuario()?.estado;
    switch (estado) {
      case 'activo': return 'success';
      case 'inactivo': return 'warn';
      case 'bloqueado': return 'danger';
      default: return 'info';
    }
  });

  estadoLabel = computed(() => {
    const estado = this.usuario()?.estado;
    switch (estado) {
      case 'activo': return 'Activo';
      case 'inactivo': return 'Inactivo';
      case 'bloqueado': return 'Bloqueado';
      default: return estado;
    }
  });

  menuItems: MenuItem[] = [
    { label: 'Editar', icon: 'pi pi-pencil', command: () => this.editarUsuario() },
    { label: 'Cambiar contrasena', icon: 'pi pi-key', command: () => this.cambiarContrasena() },
    { separator: true },
    { label: 'Desactivar', icon: 'pi pi-ban', command: () => this.desactivarUsuario() },
    { label: 'Eliminar', icon: 'pi pi-trash', styleClass: 'text-red-500', command: () => this.eliminarUsuario() }
  ];

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.usuarioId.set(params['id']);
      this.loadUsuario();
    });
  }

  async loadUsuario(): Promise<void> {
    this.loading.set(true);

    // Simular carga de datos
    setTimeout(() => {
      this.usuario.set({
        id: this.usuarioId(),
        nombre: 'Carlos Martinez Rodriguez',
        email: 'carlos.martinez@empresa.com',
        cargo: 'Gerente de Cumplimiento',
        departamento: 'Cumplimiento Normativo',
        telefono: '+52 55 1234 5678',
        estado: 'activo',
        fechaCreacion: new Date('2023-06-15'),
        ultimoAcceso: new Date('2026-01-22T09:30:00'),
        roles: [
          { id: 'r1', nombre: 'Administrador', color: '#EF4444' },
          { id: 'r2', nombre: 'Auditor', color: '#3B82F6' },
          { id: 'r3', nombre: 'Gestor de Riesgos', color: '#10B981' }
        ],
        permisos: [
          'cuestionarios.ver',
          'cuestionarios.crear',
          'cuestionarios.editar',
          'riesgos.ver',
          'riesgos.crear',
          'riesgos.editar',
          'reportes.ver',
          'reportes.exportar',
          'usuarios.ver',
          'configuracion.ver'
        ],
        asignaciones: [
          { tipo: 'Revision', nombre: 'Evaluacion PCI-DSS v4.0', fecha: new Date('2026-01-10') },
          { tipo: 'Revision', nombre: 'Cumplimiento SOX Q4', fecha: new Date('2026-01-05') },
          { tipo: 'Riesgo', nombre: 'Vulnerabilidad critica sistemas', fecha: new Date('2025-12-20') },
          { tipo: 'Incidente', nombre: 'Brecha de seguridad detectada', fecha: new Date('2025-12-15') }
        ],
        actividad: [
          { fecha: new Date('2026-01-22T09:30:00'), accion: 'Inicio de sesion', detalle: 'Acceso desde IP 192.168.1.100' },
          { fecha: new Date('2026-01-21T16:45:00'), accion: 'Revision completada', detalle: 'Evaluacion PCI-DSS aprobada' },
          { fecha: new Date('2026-01-21T14:20:00'), accion: 'Comentario agregado', detalle: 'Comentario en revision SOX' },
          { fecha: new Date('2026-01-20T10:00:00'), accion: 'Inicio de sesion', detalle: 'Acceso desde IP 192.168.1.100' },
          { fecha: new Date('2026-01-19T11:30:00'), accion: 'Riesgo creado', detalle: 'Nuevo riesgo registrado' }
        ]
      });
      this.loading.set(false);
    }, 500);
  }

  goBack(): void {
    this.router.navigate(['/usuarios-roles']);
  }

  editarUsuario(): void {
    this.messageService.add({ severity: 'info', summary: 'Editar', detail: 'Abriendo formulario de edicion...' });
  }

  cambiarContrasena(): void {
    this.messageService.add({ severity: 'info', summary: 'Contrasena', detail: 'Abriendo cambio de contrasena...' });
  }

  desactivarUsuario(): void {
    this.confirmationService.confirm({
      message: 'Esta seguro de desactivar este usuario?',
      header: 'Confirmar desactivacion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Si, desactivar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.messageService.add({ severity: 'success', summary: 'Desactivado', detail: 'Usuario desactivado correctamente' });
      }
    });
  }

  eliminarUsuario(): void {
    this.confirmationService.confirm({
      message: 'Esta seguro de eliminar este usuario? Esta accion no se puede deshacer.',
      header: 'Confirmar eliminacion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Si, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Usuario eliminado correctamente' });
        this.router.navigate(['/usuarios-roles']);
      }
    });
  }

  enviarCorreo(): void {
    const usuario = this.usuario();
    if (usuario) {
      window.location.href = `mailto:${usuario.email}`;
    }
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatDateTime(date: Date | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getInitials(nombre: string): string {
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getPermisoModulo(permiso: string): string {
    return permiso.split('.')[0];
  }

  getPermisoAccion(permiso: string): string {
    return permiso.split('.')[1];
  }

  getTipoAsignacionIcon(tipo: string): string {
    const icons: Record<string, string> = {
      'Revision': 'pi pi-file-edit',
      'Riesgo': 'pi pi-exclamation-triangle',
      'Incidente': 'pi pi-bolt',
      'Proyecto': 'pi pi-folder'
    };
    return icons[tipo] || 'pi pi-file';
  }

  getTipoAsignacionSeverity(tipo: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const severities: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      'Revision': 'info',
      'Riesgo': 'warn',
      'Incidente': 'danger',
      'Proyecto': 'success'
    };
    return severities[tipo] || 'secondary';
  }
}
