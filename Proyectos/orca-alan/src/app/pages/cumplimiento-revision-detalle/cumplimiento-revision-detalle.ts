import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { DividerModule } from 'primeng/divider';
import { TimelineModule } from 'primeng/timeline';
import { TooltipModule } from 'primeng/tooltip';
import { MenuModule } from 'primeng/menu';
import { TabsModule } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
import { ChipModule } from 'primeng/chip';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';

interface RevisionCumplimiento {
  id: string;
  cuestionarioId: string;
  cuestionarioNombre: string;
  marcoNormativo: string;
  estado: 'pendiente' | 'en_progreso' | 'completado' | 'aprobado' | 'rechazado';
  progreso: number;
  fechaAsignacion: Date;
  fechaVencimiento: Date;
  fechaCompletado?: Date;
  asignadoA: {
    id: string;
    nombre: string;
    email: string;
    avatar?: string;
  };
  aprobadores: {
    id: string;
    nombre: string;
    email: string;
    aprobado: boolean;
    fechaAccion?: Date;
    comentario?: string;
  }[];
  respuestas: {
    preguntaId: string;
    pregunta: string;
    seccion: string;
    respuesta: string | number | boolean;
    comentario?: string;
    evidencias?: string[];
  }[];
  historial: {
    fecha: Date;
    accion: string;
    usuario: string;
    detalle?: string;
  }[];
  puntuacion?: number;
  nivelCumplimiento?: string;
}

@Component({
  selector: 'app-cumplimiento-revision-detalle',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    CardModule,
    ButtonModule,
    TagModule,
    ProgressBarModule,
    AvatarModule,
    AvatarGroupModule,
    DividerModule,
    TimelineModule,
    TooltipModule,
    MenuModule,
    TabsModule,
    TableModule,
    ChipModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './cumplimiento-revision-detalle.html',
  styleUrl: './cumplimiento-revision-detalle.scss'
})
export class CumplimientoRevisionDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  revisionId = signal<string>('');
  loading = signal(true);
  activeTab = signal<'resumen' | 'respuestas' | 'aprobadores' | 'historial'>('resumen');

  revision = signal<RevisionCumplimiento | null>(null);

  // Computed
  estadoSeverity = computed(() => {
    const estado = this.revision()?.estado;
    switch (estado) {
      case 'completado':
      case 'aprobado':
        return 'success';
      case 'en_progreso':
        return 'info';
      case 'rechazado':
        return 'danger';
      default:
        return 'warn';
    }
  });

  estadoLabel = computed(() => {
    const estado = this.revision()?.estado;
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'en_progreso': return 'En Progreso';
      case 'completado': return 'Completado';
      case 'aprobado': return 'Aprobado';
      case 'rechazado': return 'Rechazado';
      default: return estado;
    }
  });

  diasRestantes = computed(() => {
    const rev = this.revision();
    if (!rev) return 0;
    const hoy = new Date();
    const vencimiento = new Date(rev.fechaVencimiento);
    const diff = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  });

  aprobadoresCompletados = computed(() => {
    const rev = this.revision();
    if (!rev) return 0;
    return rev.aprobadores.filter(a => a.aprobado).length;
  });

  menuItems: MenuItem[] = [
    { label: 'Editar', icon: 'pi pi-pencil', command: () => this.editarRevision() },
    { label: 'Exportar PDF', icon: 'pi pi-file-pdf', command: () => this.exportarPDF() },
    { separator: true },
    { label: 'Eliminar', icon: 'pi pi-trash', styleClass: 'text-red-500', command: () => this.eliminarRevision() }
  ];

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.revisionId.set(params['id']);
      this.loadRevision();
    });
  }

  async loadRevision(): Promise<void> {
    this.loading.set(true);

    // Simular carga de datos (reemplazar con servicio real)
    setTimeout(() => {
      this.revision.set({
        id: this.revisionId(),
        cuestionarioId: 'q-001',
        cuestionarioNombre: 'Evaluacion PCI-DSS v4.0',
        marcoNormativo: 'PCI-DSS',
        estado: 'en_progreso',
        progreso: 75,
        fechaAsignacion: new Date('2026-01-10'),
        fechaVencimiento: new Date('2026-02-15'),
        asignadoA: {
          id: 'u-001',
          nombre: 'Carlos Martinez',
          email: 'carlos.martinez@empresa.com'
        },
        aprobadores: [
          { id: 'a-001', nombre: 'Ana Garcia', email: 'ana.garcia@empresa.com', aprobado: true, fechaAccion: new Date('2026-01-20'), comentario: 'Todo en orden' },
          { id: 'a-002', nombre: 'Roberto Lopez', email: 'roberto.lopez@empresa.com', aprobado: false }
        ],
        respuestas: [
          { preguntaId: 'p-001', pregunta: 'Se han implementado firewalls?', seccion: 'Seguridad de Red', respuesta: true, comentario: 'Implementado con Fortinet' },
          { preguntaId: 'p-002', pregunta: 'Nivel de cifrado utilizado', seccion: 'Criptografia', respuesta: 'AES-256' },
          { preguntaId: 'p-003', pregunta: 'Frecuencia de auditorias', seccion: 'Auditoria', respuesta: 'Trimestral' }
        ],
        historial: [
          { fecha: new Date('2026-01-10'), accion: 'Asignacion', usuario: 'Sistema', detalle: 'Cuestionario asignado a Carlos Martinez' },
          { fecha: new Date('2026-01-15'), accion: 'Inicio', usuario: 'Carlos Martinez', detalle: 'Inicio de respuestas' },
          { fecha: new Date('2026-01-20'), accion: 'Aprobacion parcial', usuario: 'Ana Garcia', detalle: 'Primera aprobacion completada' }
        ],
        puntuacion: 82,
        nivelCumplimiento: 'Alto'
      });
      this.loading.set(false);
    }, 500);
  }

  goBack(): void {
    this.router.navigate(['/cumplimiento']);
  }

  editarRevision(): void {
    this.messageService.add({ severity: 'info', summary: 'Editar', detail: 'Funcion de edicion' });
  }

  exportarPDF(): void {
    this.messageService.add({ severity: 'success', summary: 'Exportar', detail: 'Generando PDF...' });
  }

  eliminarRevision(): void {
    this.messageService.add({ severity: 'warn', summary: 'Eliminar', detail: 'Confirmar eliminacion' });
  }

  verCuestionario(): void {
    const rev = this.revision();
    if (rev) {
      this.router.navigate(['/cuestionarios', rev.cuestionarioId]);
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

  getInitials(nombre: string): string {
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getRespuestaDisplay(respuesta: string | number | boolean): string {
    if (typeof respuesta === 'boolean') {
      return respuesta ? 'Si' : 'No';
    }
    return String(respuesta);
  }
}
