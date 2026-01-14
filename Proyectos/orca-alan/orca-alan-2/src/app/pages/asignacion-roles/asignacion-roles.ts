import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Components
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { BadgeModule } from 'primeng/badge';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SkeletonModule } from 'primeng/skeleton';

// Services
import { UsuariosRolesService } from '../../services/usuarios-roles.service';
import { ApiService } from '../../services/api.service';

// Models
import {
  Usuario,
  Rol,
  NivelAcceso,
  NIVELES_ACCESO
} from '../../models/usuarios-roles.models';

interface ModuloPermiso {
  id: string;
  nombre: string;
  icono: string;
  permisos: {
    creacion: boolean;
    edicion: boolean;
    visualizacion: boolean;
  };
}

@Component({
  selector: 'app-asignacion-roles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    TooltipModule,
    IconFieldModule,
    InputIconModule,
    ConfirmDialogModule,
    ToastModule,
    DividerModule,
    AvatarModule,
    AvatarGroupModule,
    BadgeModule,
    CheckboxModule,
    SelectModule,
    ScrollPanelModule,
    SkeletonModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './asignacion-roles.html',
  styleUrl: './asignacion-roles.scss'
})
export class AsignacionRolesComponent implements OnInit {
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  public usuariosRolesService = inject(UsuariosRolesService);
  private api = inject(ApiService);

  // Datos
  roles = this.usuariosRolesService.roles;
  usuarios = this.usuariosRolesService.usuarios;

  // Estado
  rolSeleccionado = signal<Rol | null>(null);
  modulosPermisos = signal<ModuloPermiso[]>([]);
  usuariosDelRol = signal<Usuario[]>([]);
  isLoading = signal(false);

  // Configuración del rol seleccionado
  asignacionModulos = signal<number>(1);

  // Opciones
  nivelesAccesoOptions = NIVELES_ACCESO;
  asignacionOptions = [
    { label: 'Módulos', value: 1 },
    { label: 'Módulos', value: 2 },
    { label: 'Módulos', value: 3 }
  ];

  // Usuarios filtrados del rol
  usuariosFiltradosDelRol = computed(() => {
    const rol = this.rolSeleccionado();
    if (!rol) return [];
    return this.usuariosRolesService.getUsuariosDeRol(rol.id);
  });

  ngOnInit(): void {
    // Seleccionar el primer rol por defecto
    const roles = this.roles();
    if (roles.length > 0) {
      this.seleccionarRol(roles[0]);
    }
  }

  seleccionarRol(rol: Rol): void {
    this.rolSeleccionado.set(rol);
    this.cargarModulosPermisos(rol.id);
    this.usuariosDelRol.set(this.usuariosRolesService.getUsuariosDeRol(rol.id));
  }

  async cargarModulosPermisos(rolId: string): Promise<void> {
    this.isLoading.set(true);
    try {
      const modulos = await this.api.getPermisosRolPorModulo(rolId).toPromise();
      this.modulosPermisos.set(modulos || []);
    } catch (error) {
      console.error('Error cargando módulos:', error);
      // Fallback: generar módulos desde los permisos del rol
      this.generarModulosFallback();
    } finally {
      this.isLoading.set(false);
    }
  }

  generarModulosFallback(): void {
    const rol = this.rolSeleccionado();
    if (!rol) return;

    const permisos = this.usuariosRolesService.getPermisosDeRol(rol.id);
    const modulosMap: Record<string, ModuloPermiso> = {};

    // Módulos según matriz de permisos del sistema
    const modulosPredefinidos = [
      { id: 'dashboard', nombre: 'Dashboard', icono: 'pi-chart-bar' },
      { id: 'activos', nombre: 'Activos y Procesos', icono: 'pi-box' },
      { id: 'procesos', nombre: 'Procesos', icono: 'pi-sitemap' },
      { id: 'riesgos', nombre: 'Riesgos', icono: 'pi-exclamation-triangle' },
      { id: 'incidentes', nombre: 'Incidentes', icono: 'pi-bolt' },
      { id: 'cumplimiento', nombre: 'Cumplimiento', icono: 'pi-check-circle' },
      { id: 'reportes', nombre: 'Reportes', icono: 'pi-chart-line' },
      { id: 'auditoria', nombre: 'Auditoría', icono: 'pi-history' },
      { id: 'usuarios', nombre: 'Usuarios', icono: 'pi-users' },
      { id: 'configuracion', nombre: 'Configuración', icono: 'pi-cog' }
    ];

    modulosPredefinidos.forEach(mod => {
      modulosMap[mod.id] = {
        ...mod,
        permisos: {
          creacion: permisos.some(p => p.modulo === mod.id && (p.codigo.includes('CREATE') || p.codigo.includes('MANAGE'))),
          edicion: permisos.some(p => p.modulo === mod.id && (p.codigo.includes('EDIT') || p.codigo.includes('MANAGE'))),
          visualizacion: permisos.some(p => p.modulo === mod.id && p.codigo.includes('VIEW'))
        }
      };
    });

    this.modulosPermisos.set(Object.values(modulosMap));
  }

  togglePermiso(modulo: ModuloPermiso, tipo: 'creacion' | 'edicion' | 'visualizacion'): void {
    const modulosActualizados = this.modulosPermisos().map(m => {
      if (m.id === modulo.id) {
        return {
          ...m,
          permisos: {
            ...m.permisos,
            [tipo]: !m.permisos[tipo]
          }
        };
      }
      return m;
    });
    this.modulosPermisos.set(modulosActualizados);

    // Aquí podrías guardar los cambios en el backend
    this.messageService.add({
      severity: 'success',
      summary: 'Permiso actualizado',
      detail: `Permiso de ${tipo} ${modulo.permisos[tipo] ? 'removido' : 'asignado'} para ${modulo.nombre}`
    });
  }

  // Helpers
  getNivelAccesoSeverity(nivel: NivelAcceso): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    const severities: Record<NivelAcceso, 'success' | 'secondary' | 'info' | 'warn' | 'danger'> = {
      'lectura': 'info',
      'escritura': 'success',
      'admin': 'warn',
      'super_admin': 'danger'
    };
    return severities[nivel] || 'info';
  }

  getInitials(nombre: string, apellido: string): string {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  }

  getAvatarColor(index: number): string {
    const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    return colors[index % colors.length];
  }
}
