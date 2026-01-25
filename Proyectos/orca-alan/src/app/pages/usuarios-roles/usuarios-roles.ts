import { Component, signal, computed, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG Components
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MenuModule } from 'primeng/menu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService, MenuItem } from 'primeng/api';
import { TabsModule } from 'primeng/tabs';
import { ToolbarModule } from 'primeng/toolbar';
import { DrawerModule } from 'primeng/drawer';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { BadgeModule } from 'primeng/badge';
import { ChipModule } from 'primeng/chip';
import { SelectModule } from 'primeng/select';
import { StepperModule } from 'primeng/stepper';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CheckboxModule } from 'primeng/checkbox';
import { TreeModule } from 'primeng/tree';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TextareaModule } from 'primeng/textarea';
import { ProgressBarModule } from 'primeng/progressbar';
import { CardModule } from 'primeng/card';
import { TreeNode } from 'primeng/api';

// Services
import { UsuariosRolesService } from '../../services/usuarios-roles.service';

// Models
import {
  Usuario,
  Rol,
  Permiso,
  ActivoAcceso,
  EstadoUsuario,
  NivelAcceso,
  ESTADOS_USUARIO,
  NIVELES_ACCESO,
  REGIONES,
  UsuarioFormData,
  RolFormData
} from '../../models/usuarios-roles.models';

type VistaActual = 'usuarios' | 'roles';

@Component({
  selector: 'app-usuarios-roles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    TooltipModule,
    IconFieldModule,
    InputIconModule,
    MenuModule,
    ConfirmDialogModule,
    ToastModule,
    TabsModule,
    ToolbarModule,
    DrawerModule,
    DividerModule,
    AvatarModule,
    AvatarGroupModule,
    BadgeModule,
    ChipModule,
    SelectModule,
    StepperModule,
    FloatLabelModule,
    CheckboxModule,
    TreeModule,
    MultiSelectModule,
    DatePickerModule,
    SelectButtonModule,
    TextareaModule,
    ProgressBarModule,
    CardModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './usuarios-roles.html',
  styleUrl: './usuarios-roles.scss'
})
export class UsuariosRolesComponent {
  @ViewChild('usuariosTable') usuariosTable!: Table;

  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  public usuariosRolesService = inject(UsuariosRolesService);

  // Vista activa
  vistaActual = signal<VistaActual>('usuarios');

  // Opciones de tabs
  tabOptions = [
    { label: 'Usuarios', value: 'usuarios', icon: 'pi pi-users' },
    { label: 'Roles', value: 'roles', icon: 'pi pi-shield' }
  ];

  // Datos
  usuarios = this.usuariosRolesService.usuarios;
  roles = this.usuariosRolesService.roles;
  estadisticasUsuarios = this.usuariosRolesService.estadisticasUsuarios;
  estadisticasRoles = this.usuariosRolesService.estadisticasRoles;

  // Filtros
  busquedaUsuarios = signal('');
  filtroEstado = signal<EstadoUsuario | null>(null);
  filtroRol = signal<string | null>(null);

  busquedaRoles = signal('');
  filtroNivelAcceso = signal<NivelAcceso | null>(null);
  filtroActivo = signal<boolean | null>(null);

  // Selección
  usuariosSeleccionados = signal<Usuario[]>([]);
  rolesSeleccionados = signal<Rol[]>([]);

  // Drawers
  showDrawerUsuario = signal(false);
  showDrawerRol = signal(false);
  showWizardUsuario = signal(false);
  showWizardRol = signal(false);

  // Usuario/Rol seleccionado para detalle
  usuarioSeleccionado = signal<Usuario | null>(null);
  rolSeleccionado = signal<Rol | null>(null);

  // Wizard de Usuario
  wizardActiveStep = 0;
  usuarioForm = signal<UsuarioFormData>({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    departamento: '',
    cargo: '',
    estado: 'activo',
    fechaExpiracion: null,
    activosSeleccionados: [],
    rolesAsignados: [],
    autenticacionDosFactor: false,
    cambioPasswordRequerido: true
  });

  // Wizard de Rol
  rolForm = signal<RolFormData>({
    nombre: '',
    descripcion: '',
    nivelAcceso: 'lectura',
    region: 'MX',
    tipoArbol: 'activos',
    permisosSeleccionados: [],
    activo: true
  });

  // Árbol de activos para selección
  activosTree = signal<TreeNode[]>([]);
  activosSeleccionados = signal<TreeNode[]>([]);

  // Permisos para selección en rol
  permisosDisponibles = computed(() => {
    return this.usuariosRolesService.permisos().map(p => ({
      label: p.nombre,
      value: p.id,
      description: p.descripcion
    }));
  });

  // Opciones para selectores
  estadosOptions = ESTADOS_USUARIO;
  nivelesAccesoOptions = NIVELES_ACCESO;
  regionesOptions = REGIONES;

  estadoSelectOptions = [
    { label: 'Activo', value: 'activo' },
    { label: 'Inactivo', value: 'inactivo' }
  ];

  tipoArbolOptions = [
    { label: 'Activos', value: 'activos' },
    { label: 'Procesos', value: 'procesos' },
    { label: 'Ambos', value: 'ambos' }
  ];

  // Usuarios filtrados
  usuariosFiltrados = computed(() => {
    let lista = this.usuarios();

    // Filtro de búsqueda
    const busqueda = this.busquedaUsuarios().toLowerCase();
    if (busqueda) {
      lista = lista.filter(u =>
        u.nombre.toLowerCase().includes(busqueda) ||
        u.apellido.toLowerCase().includes(busqueda) ||
        u.email.toLowerCase().includes(busqueda) ||
        u.departamento?.toLowerCase().includes(busqueda)
      );
    }

    // Filtro de estado
    const estado = this.filtroEstado();
    if (estado) {
      lista = lista.filter(u => u.estado === estado);
    }

    // Filtro de rol
    const rol = this.filtroRol();
    if (rol) {
      lista = lista.filter(u => u.roles.includes(rol));
    }

    return lista;
  });

  // Roles filtrados
  rolesFiltrados = computed(() => {
    let lista = this.roles();

    // Filtro de búsqueda
    const busqueda = this.busquedaRoles().toLowerCase();
    if (busqueda) {
      lista = lista.filter(r =>
        r.nombre.toLowerCase().includes(busqueda) ||
        r.descripcion.toLowerCase().includes(busqueda)
      );
    }

    // Filtro de nivel de acceso
    const nivel = this.filtroNivelAcceso();
    if (nivel) {
      lista = lista.filter(r => r.nivelAcceso === nivel);
    }

    // Filtro de activo
    const activo = this.filtroActivo();
    if (activo !== null) {
      lista = lista.filter(r => r.activo === activo);
    }

    return lista;
  });

  // Roles para selector (en wizard de usuario)
  rolesParaSelector = computed(() => {
    return this.roles()
      .filter(r => r.activo)
      .map(r => ({ label: r.nombre, value: r.id }));
  });

  constructor() {
    // Inicializar árbol de activos
    this.initActivosTree();
  }

  // ============================================================
  // Inicialización
  // ============================================================

  private initActivosTree(): void {
    const activos = this.usuariosRolesService.activos();
    this.activosTree.set(this.convertirActivosATreeNodes(activos));
  }

  private convertirActivosATreeNodes(activos: ActivoAcceso[]): TreeNode[] {
    return activos.map(activo => ({
      key: activo.id,
      label: activo.nombre,
      icon: `pi ${activo.icono}`,
      data: activo,
      children: activo.hijos ? this.convertirActivosATreeNodes(activo.hijos) : undefined,
      selectable: true,
      expanded: activo.expanded
    }));
  }

  // ============================================================
  // Navegación de Tabs
  // ============================================================

  onTabChange(event: any): void {
    this.vistaActual.set(event);
  }

  // ============================================================
  // Acciones de Usuario
  // ============================================================

  abrirWizardNuevoUsuario(): void {
    this.usuarioForm.set({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      departamento: '',
      cargo: '',
      estado: 'activo',
      fechaExpiracion: null,
      activosSeleccionados: [],
      rolesAsignados: [],
      autenticacionDosFactor: false,
      cambioPasswordRequerido: true
    });
    this.wizardActiveStep = 0;
    this.activosSeleccionados.set([]);
    this.showWizardUsuario.set(true);
  }

  cerrarWizardUsuario(): void {
    this.showWizardUsuario.set(false);
  }

  guardarUsuario(): void {
    const formData = this.usuarioForm();

    // Obtener IDs de activos seleccionados
    formData.activosSeleccionados = this.activosSeleccionados().map(node => node.key as string);

    this.usuariosRolesService.crearUsuario(formData).then(nuevoUsuario => {
      this.messageService.add({
        severity: 'success',
        summary: 'Usuario creado',
        detail: `${nuevoUsuario.nombre} ${nuevoUsuario.apellido} ha sido creado exitosamente`
      });
    });

    this.cerrarWizardUsuario();
  }

  verDetalleUsuario(usuario: Usuario): void {
    this.router.navigate(['/usuarios', usuario.id]);
  }

  editarUsuario(usuario: Usuario): void {
    this.usuarioForm.set({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      telefono: usuario.telefono || '',
      departamento: usuario.departamento || '',
      cargo: usuario.cargo || '',
      estado: usuario.estado,
      fechaExpiracion: usuario.fechaExpiracion || null,
      activosSeleccionados: usuario.activosAcceso,
      rolesAsignados: usuario.roles,
      autenticacionDosFactor: usuario.configuracionSeguridad.autenticacionDosFactor,
      cambioPasswordRequerido: usuario.configuracionSeguridad.cambioPasswordRequerido
    });
    this.wizardActiveStep = 0;
    this.showWizardUsuario.set(true);
  }

  eliminarUsuario(usuario: Usuario): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar a ${usuario.nombre} ${usuario.apellido}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.usuariosRolesService.eliminarUsuario(usuario.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Usuario eliminado',
          detail: 'El usuario ha sido eliminado exitosamente'
        });
        if (this.usuarioSeleccionado()?.id === usuario.id) {
          this.showDrawerUsuario.set(false);
        }
      }
    });
  }

  // Acciones masivas
  abrirAccionesMasivas(): void {
    // TODO: Implementar drawer de acciones masivas similar a tabla unificada
    this.messageService.add({
      severity: 'info',
      summary: 'Acciones masivas',
      detail: `${this.usuariosSeleccionados.length} usuarios seleccionados`
    });
  }

  cambiarEstadoUsuario(usuario: Usuario, estado: EstadoUsuario): void {
    this.usuariosRolesService.cambiarEstadoUsuario(usuario.id, estado);
    this.messageService.add({
      severity: 'success',
      summary: 'Estado actualizado',
      detail: `Usuario ${estado === 'activo' ? 'activado' : 'desactivado'} exitosamente`
    });
  }

  // ============================================================
  // Acciones de Rol
  // ============================================================

  abrirWizardNuevoRol(): void {
    this.rolForm.set({
      nombre: '',
      descripcion: '',
      nivelAcceso: 'lectura',
      region: 'MX',
      tipoArbol: 'activos',
      permisosSeleccionados: [],
      activo: true
    });
    this.showWizardRol.set(true);
  }

  cerrarWizardRol(): void {
    this.showWizardRol.set(false);
  }

  guardarRol(): void {
    const formData = this.rolForm();
    this.usuariosRolesService.crearRol(formData).then(nuevoRol => {
      this.messageService.add({
        severity: 'success',
        summary: 'Rol creado',
        detail: `${nuevoRol.nombre} ha sido creado exitosamente`
      });
    });

    this.cerrarWizardRol();
  }

  verDetalleRol(rol: Rol): void {
    this.rolSeleccionado.set(rol);
    this.showDrawerRol.set(true);
  }

  editarRol(rol: Rol): void {
    this.rolForm.set({
      nombre: rol.nombre,
      descripcion: rol.descripcion,
      nivelAcceso: rol.nivelAcceso,
      region: rol.region,
      tipoArbol: rol.tipoArbol,
      permisosSeleccionados: rol.permisos,
      activo: rol.activo
    });
    this.showWizardRol.set(true);
  }

  duplicarRol(rol: Rol): void {
    this.usuariosRolesService.duplicarRol(rol.id).then(copia => {
      if (copia) {
        this.messageService.add({
          severity: 'success',
          summary: 'Rol duplicado',
          detail: `${copia.nombre} ha sido creado`
        });
      }
    });
  }

  eliminarRol(rol: Rol): void {
    if (rol.esRolSistema) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Acción no permitida',
        detail: 'Los roles del sistema no pueden ser eliminados'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar el rol "${rol.nombre}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.usuariosRolesService.eliminarRol(rol.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Rol eliminado',
          detail: 'El rol ha sido eliminado exitosamente'
        });
        if (this.rolSeleccionado()?.id === rol.id) {
          this.showDrawerRol.set(false);
        }
      }
    });
  }

  // ============================================================
  // Helpers
  // ============================================================

  getEstadoSeverity(estado: EstadoUsuario): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    const severities: Record<EstadoUsuario, 'success' | 'secondary' | 'info' | 'warn' | 'danger'> = {
      'activo': 'success',
      'inactivo': 'danger',
      'pendiente': 'warn',
      'bloqueado': 'danger'
    };
    return severities[estado] || 'info';
  }

  getEstadoLabel(estado: EstadoUsuario): string {
    const labels: Record<EstadoUsuario, string> = {
      'activo': 'Activo',
      'inactivo': 'Inactivo',
      'pendiente': 'Pendiente',
      'bloqueado': 'Bloqueado'
    };
    return labels[estado] || estado;
  }

  getNivelAccesoSeverity(nivel: NivelAcceso): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    const severities: Record<NivelAcceso, 'success' | 'secondary' | 'info' | 'warn' | 'danger'> = {
      'lectura': 'info',
      'escritura': 'success',
      'admin': 'warn',
      'super_admin': 'danger'
    };
    return severities[nivel] || 'info';
  }

  getNivelAccesoLabel(nivel: NivelAcceso): string {
    const labels: Record<NivelAcceso, string> = {
      'lectura': 'Lectura',
      'escritura': 'Escritura',
      'admin': 'Admin',
      'super_admin': 'Super Admin'
    };
    return labels[nivel] || nivel;
  }

  getRolesDeUsuario(usuario: Usuario): Rol[] {
    return this.usuariosRolesService.getRolesDeUsuario(usuario.id);
  }

  getUsuariosDeRol(rol: Rol): Usuario[] {
    return this.usuariosRolesService.getUsuariosDeRol(rol.id);
  }

  getPermisosDeRol(rol: Rol): Permiso[] {
    return this.usuariosRolesService.getPermisosDeRol(rol.id);
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  formatDateTime(date: Date | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getInitials(nombre: string, apellido: string): string {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  }

  getMenuItemsUsuario(usuario: Usuario): MenuItem[] {
    return [
      {
        label: 'Ver detalle',
        icon: 'pi pi-eye',
        command: () => this.verDetalleUsuario(usuario)
      },
      {
        label: 'Editar',
        icon: 'pi pi-pencil',
        command: () => this.editarUsuario(usuario)
      },
      { separator: true },
      {
        label: usuario.estado === 'activo' ? 'Desactivar' : 'Activar',
        icon: usuario.estado === 'activo' ? 'pi pi-times' : 'pi pi-check',
        command: () => this.cambiarEstadoUsuario(usuario, usuario.estado === 'activo' ? 'inactivo' : 'activo')
      },
      { separator: true },
      {
        label: 'Eliminar',
        icon: 'pi pi-trash',
        styleClass: 'text-red-500',
        command: () => this.eliminarUsuario(usuario)
      }
    ];
  }

  getMenuItemsRol(rol: Rol): MenuItem[] {
    const items: MenuItem[] = [
      {
        label: 'Ver detalle',
        icon: 'pi pi-eye',
        command: () => this.verDetalleRol(rol)
      },
      {
        label: 'Editar',
        icon: 'pi pi-pencil',
        command: () => this.editarRol(rol),
        disabled: rol.esRolSistema
      },
      {
        label: 'Duplicar',
        icon: 'pi pi-copy',
        command: () => this.duplicarRol(rol)
      }
    ];

    if (!rol.esRolSistema) {
      items.push(
        { separator: true },
        {
          label: 'Eliminar',
          icon: 'pi pi-trash',
          styleClass: 'text-red-500',
          command: () => this.eliminarRol(rol)
        }
      );
    }

    return items;
  }

  // Actualizar form de usuario
  updateUsuarioForm(field: keyof UsuarioFormData, value: any): void {
    this.usuarioForm.update(form => ({ ...form, [field]: value }));
  }

  // Actualizar form de rol
  updateRolForm(field: keyof RolFormData, value: any): void {
    this.rolForm.update(form => ({ ...form, [field]: value }));
  }

  // Limpiar filtros
  limpiarFiltrosUsuarios(): void {
    this.busquedaUsuarios.set('');
    this.filtroEstado.set(null);
    this.filtroRol.set(null);
  }

  limpiarFiltrosRoles(): void {
    this.busquedaRoles.set('');
    this.filtroNivelAcceso.set(null);
    this.filtroActivo.set(null);
  }

  // Exportar
  exportarUsuarios(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Exportando',
      detail: 'Generando archivo de usuarios...'
    });
  }

  exportarRoles(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Exportando',
      detail: 'Generando archivo de roles...'
    });
  }
}
