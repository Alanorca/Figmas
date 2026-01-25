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
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { ChipModule } from 'primeng/chip';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AccordionModule } from 'primeng/accordion';
import { BadgeModule } from 'primeng/badge';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';

interface Pregunta {
  id: string;
  texto: string;
  tipo: string;
  requerida: boolean;
  peso: number;
  requiereEvidencia: boolean;
  opciones?: string[];
}

interface Seccion {
  id: string;
  nombre: string;
  descripcion: string;
  peso: number;
  preguntas: Pregunta[];
}

interface Cuestionario {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  tipo: 'manual' | 'ia';
  tipoEvaluacion: string;
  estado: 'borrador' | 'activo' | 'archivado';
  marcoNormativo: string;
  periodicidad: string;
  preguntas: number;
  respuestas: number;
  tasaCompletado: number;
  fechaCreacion: Date;
  fechaModificacion: Date;
  umbrales: { deficiente: number; aceptable: number; sobresaliente: number };
  secciones: Seccion[];
  areasObjetivo: string[];
  responsables: string[];
}

@Component({
  selector: 'app-cuestionario-detalle',
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
    DividerModule,
    TooltipModule,
    MenuModule,
    TableModule,
    ChipModule,
    ToastModule,
    ConfirmDialogModule,
    AccordionModule,
    BadgeModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './cuestionario-detalle.html',
  styleUrl: './cuestionario-detalle.scss'
})
export class CuestionarioDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  cuestionarioId = signal<string>('');
  loading = signal(true);
  activeTab = signal<'informacion' | 'secciones' | 'estadisticas' | 'historial'>('informacion');

  cuestionario = signal<Cuestionario | null>(null);

  // Computed
  estadoSeverity = computed(() => {
    const estado = this.cuestionario()?.estado;
    switch (estado) {
      case 'activo': return 'success';
      case 'borrador': return 'warn';
      case 'archivado': return 'secondary';
      default: return 'info';
    }
  });

  estadoLabel = computed(() => {
    const estado = this.cuestionario()?.estado;
    switch (estado) {
      case 'borrador': return 'Borrador';
      case 'activo': return 'Activo';
      case 'archivado': return 'Archivado';
      default: return estado;
    }
  });

  totalPreguntas = computed(() => {
    const cuest = this.cuestionario();
    if (!cuest) return 0;
    return cuest.secciones.reduce((sum, s) => sum + s.preguntas.length, 0);
  });

  menuItems: MenuItem[] = [
    { label: 'Editar', icon: 'pi pi-pencil', command: () => this.editarCuestionario() },
    { label: 'Duplicar', icon: 'pi pi-copy', command: () => this.duplicarCuestionario() },
    { label: 'Exportar PDF', icon: 'pi pi-file-pdf', command: () => this.exportarPDF() },
    { separator: true },
    { label: 'Archivar', icon: 'pi pi-inbox', command: () => this.archivarCuestionario() },
    { label: 'Eliminar', icon: 'pi pi-trash', styleClass: 'text-red-500', command: () => this.eliminarCuestionario() }
  ];

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.cuestionarioId.set(params['id']);
      this.loadCuestionario();
    });
  }

  async loadCuestionario(): Promise<void> {
    this.loading.set(true);

    // Simular carga de datos
    setTimeout(() => {
      this.cuestionario.set({
        id: this.cuestionarioId(),
        nombre: 'Evaluacion de Controles SOX',
        descripcion: 'Cuestionario anual de cumplimiento SOX para controles internos financieros y operativos.',
        categoria: 'cumplimiento',
        tipo: 'manual',
        tipoEvaluacion: 'revision_controles',
        estado: 'activo',
        marcoNormativo: 'SOX',
        periodicidad: 'anual',
        preguntas: 45,
        respuestas: 128,
        tasaCompletado: 87,
        fechaCreacion: new Date('2024-01-15'),
        fechaModificacion: new Date('2026-01-20'),
        umbrales: { deficiente: 50, aceptable: 70, sobresaliente: 90 },
        areasObjetivo: ['finanzas', 'tecnologia', 'operaciones'],
        responsables: ['Carlos Martinez', 'Ana Garcia'],
        secciones: [
          {
            id: 's1',
            nombre: 'Controles de Acceso',
            descripcion: 'Evaluacion de controles de acceso a sistemas criticos',
            peso: 25,
            preguntas: [
              { id: 'p1', texto: 'Existe un proceso formal de autorizacion de accesos?', tipo: 'siNoNa', requerida: true, peso: 10, requiereEvidencia: true },
              { id: 'p2', texto: 'Se revisan los accesos periodicamente?', tipo: 'siNoNa', requerida: true, peso: 10, requiereEvidencia: true },
              { id: 'p3', texto: 'Frecuencia de revision de accesos', tipo: 'seleccionUnica', requerida: true, peso: 5, requiereEvidencia: false, opciones: ['Mensual', 'Trimestral', 'Anual'] }
            ]
          },
          {
            id: 's2',
            nombre: 'Segregacion de Funciones',
            descripcion: 'Validacion de segregacion de funciones incompatibles',
            peso: 30,
            preguntas: [
              { id: 'p4', texto: 'Existe matriz de segregacion de funciones?', tipo: 'siNoNa', requerida: true, peso: 15, requiereEvidencia: true },
              { id: 'p5', texto: 'Se han identificado conflictos de segregacion?', tipo: 'siNoNa', requerida: true, peso: 15, requiereEvidencia: true }
            ]
          },
          {
            id: 's3',
            nombre: 'Registro de Transacciones',
            descripcion: 'Control sobre el registro contable de transacciones',
            peso: 25,
            preguntas: [
              { id: 'p6', texto: 'Todas las transacciones se registran oportunamente?', tipo: 'siNoNa', requerida: true, peso: 12, requiereEvidencia: true },
              { id: 'p7', texto: 'Existe pista de auditoria?', tipo: 'siNoNa', requerida: true, peso: 13, requiereEvidencia: true }
            ]
          },
          {
            id: 's4',
            nombre: 'Conciliaciones',
            descripcion: 'Procesos de conciliacion y revision',
            peso: 20,
            preguntas: [
              { id: 'p8', texto: 'Se realizan conciliaciones bancarias?', tipo: 'siNoNa', requerida: true, peso: 10, requiereEvidencia: true },
              { id: 'p9', texto: 'Frecuencia de conciliaciones', tipo: 'seleccionUnica', requerida: true, peso: 5, requiereEvidencia: false, opciones: ['Diaria', 'Semanal', 'Mensual'] },
              { id: 'p10', texto: 'Se documentan las partidas de conciliacion?', tipo: 'siNoNa', requerida: true, peso: 5, requiereEvidencia: true }
            ]
          }
        ]
      });
      this.loading.set(false);
    }, 500);
  }

  goBack(): void {
    this.router.navigate(['/cuestionarios']);
  }

  editarCuestionario(): void {
    this.messageService.add({ severity: 'info', summary: 'Editar', detail: 'Redirigiendo al editor...' });
  }

  duplicarCuestionario(): void {
    this.messageService.add({ severity: 'success', summary: 'Duplicar', detail: 'Cuestionario duplicado' });
  }

  exportarPDF(): void {
    this.messageService.add({ severity: 'success', summary: 'Exportar', detail: 'Generando PDF...' });
  }

  archivarCuestionario(): void {
    this.messageService.add({ severity: 'info', summary: 'Archivar', detail: 'Cuestionario archivado' });
  }

  eliminarCuestionario(): void {
    this.messageService.add({ severity: 'warn', summary: 'Eliminar', detail: 'Confirmar eliminacion' });
  }

  iniciarRevision(): void {
    this.messageService.add({ severity: 'success', summary: 'Nueva Revision', detail: 'Creando nueva revision...' });
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getTipoLabel(tipo: string): string {
    const labels: Record<string, string> = {
      'texto': 'Texto',
      'textoLargo': 'Texto largo',
      'numero': 'Numero',
      'seleccionUnica': 'Seleccion unica',
      'opcionMultiple': 'Opcion multiple',
      'siNoNa': 'Si/No/N/A',
      'fecha': 'Fecha',
      'archivo': 'Archivo',
      'escala': 'Escala'
    };
    return labels[tipo] || tipo;
  }

  getAreaLabel(area: string): string {
    const labels: Record<string, string> = {
      'finanzas': 'Finanzas',
      'tecnologia': 'Tecnologia',
      'operaciones': 'Operaciones',
      'legal': 'Legal',
      'rrhh': 'Recursos Humanos',
      'cumplimiento': 'Cumplimiento'
    };
    return labels[area] || area;
  }

  getTipoEvaluacionLabel(tipo: string): string {
    const labels: Record<string, string> = {
      'autoevaluacion': 'Autoevaluacion',
      'auditoria_externa': 'Auditoria Externa',
      'revision_controles': 'Revision de Controles'
    };
    return labels[tipo] || tipo;
  }

  getPeriodicidadLabel(periodicidad: string): string {
    const labels: Record<string, string> = {
      'unica': 'Unica',
      'mensual': 'Mensual',
      'trimestral': 'Trimestral',
      'semestral': 'Semestral',
      'anual': 'Anual'
    };
    return labels[periodicidad] || periodicidad;
  }
}
