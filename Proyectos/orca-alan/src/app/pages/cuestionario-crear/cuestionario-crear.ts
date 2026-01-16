import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { FileUploadModule } from 'primeng/fileupload';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-cuestionario-crear',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ToastModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    TooltipModule,
    TagModule,
    FileUploadModule,
    ProgressSpinnerModule
  ],
  providers: [MessageService],
  templateUrl: './cuestionario-crear.html',
  styleUrl: './cuestionario-crear.scss'
})
export class CuestionarioCrearComponent {
  private router = inject(Router);
  private messageService = inject(MessageService);

  // Paso actual del wizard (0-2 para IA, 0-1 para manual)
  pasoActual = signal(0);

  // Steps del wizard - dinámicos según método
  stepsIA = [
    {
      icon: 'pi pi-cog',
      label: 'Método',
      descripcion: 'Elige cómo crear tu cuestionario'
    },
    {
      icon: 'pi pi-file-edit',
      label: 'Datos',
      descripcion: 'Información básica del cuestionario'
    },
    {
      icon: 'pi pi-sparkles',
      label: 'Configuración IA',
      descripcion: 'Configura la generación con IA'
    }
  ];

  stepsManual = [
    {
      icon: 'pi pi-cog',
      label: 'Método',
      descripcion: 'Elige cómo crear tu cuestionario'
    },
    {
      icon: 'pi pi-file-edit',
      label: 'Datos',
      descripcion: 'Información básica del cuestionario'
    }
  ];

  steps = computed(() => this.metodoCreacion() === 'ia' ? this.stepsIA : this.stepsManual);

  // ========== PASO 0: Método ==========
  metodoCreacion = signal<'ia' | 'manual' | null>(null);

  // ========== PASO 1: Datos Generales ==========
  nombreCuestionario = signal('');
  descripcionCuestionario = signal('');
  marcoNormativo = signal('');
  periodicidad = signal('');

  marcoOptions = [
    { label: 'ISO 27001', value: 'iso27001' },
    { label: 'ISO 9001', value: 'iso9001' },
    { label: 'NIST', value: 'nist' },
    { label: 'SOC 2', value: 'soc2' },
    { label: 'GDPR', value: 'gdpr' },
    { label: 'Personalizado', value: 'custom' }
  ];

  periodicidadOptions = [
    { label: 'Mensual', value: 'mensual' },
    { label: 'Trimestral', value: 'trimestral' },
    { label: 'Semestral', value: 'semestral' },
    { label: 'Anual', value: 'anual' }
  ];

  // ========== PASO 2: Configuración IA ==========
  iaMetodo = signal<'prompt' | 'documento'>('prompt');
  promptIA = signal('');
  documentoIA = signal<File | null>(null);
  documentoNombre = signal('');

  // Estado de generación
  generandoIA = signal(false);
  cuestionarioGenerado = signal<any>(null);

  // ========== Navegación ==========
  siguiente(): void {
    if (this.validarPasoActual()) {
      const metodo = this.metodoCreacion();
      const paso = this.pasoActual();

      // Si es manual y estamos en paso 1, ir directo al editor
      if (metodo === 'manual' && paso === 1) {
        this.crearCuestionarioManual();
        return;
      }

      this.pasoActual.update(p => p + 1);
    }
  }

  anterior(): void {
    this.pasoActual.update(p => Math.max(p - 1, 0));
  }

  irAPaso(paso: number): void {
    if (paso <= this.pasoActual()) {
      this.pasoActual.set(paso);
    }
  }

  validarPasoActual(): boolean {
    switch (this.pasoActual()) {
      case 0: // Método
        if (!this.metodoCreacion()) {
          this.messageService.add({ severity: 'warn', summary: 'Validación', detail: 'Selecciona un método de creación' });
          return false;
        }
        return true;
      case 1: // Datos
        if (!this.nombreCuestionario().trim()) {
          this.messageService.add({ severity: 'warn', summary: 'Validación', detail: 'El nombre del cuestionario es requerido' });
          return false;
        }
        return true;
      case 2: // Configuración IA
        if (this.iaMetodo() === 'prompt' && !this.promptIA().trim()) {
          this.messageService.add({ severity: 'warn', summary: 'Validación', detail: 'Describe el cuestionario que deseas generar' });
          return false;
        }
        if (this.iaMetodo() === 'documento' && !this.documentoIA()) {
          this.messageService.add({ severity: 'warn', summary: 'Validación', detail: 'Sube un documento para generar el cuestionario' });
          return false;
        }
        return true;
      default:
        return true;
    }
  }

  puedeAvanzar(): boolean {
    const paso = this.pasoActual();
    const metodo = this.metodoCreacion();

    if (paso === 0) return !!metodo;
    if (paso === 1) return !!this.nombreCuestionario().trim();
    if (paso === 2 && metodo === 'ia') {
      if (this.iaMetodo() === 'prompt') return !!this.promptIA().trim();
      if (this.iaMetodo() === 'documento') return !!this.documentoIA();
    }
    return false;
  }

  // ========== Selección de método ==========
  seleccionarMetodo(metodo: 'ia' | 'manual'): void {
    this.metodoCreacion.set(metodo);
  }

  // ========== Manejo de documento ==========
  onSelectDocumento(event: any): void {
    const file = event.files?.[0];
    if (file) {
      this.documentoIA.set(file);
      this.documentoNombre.set(file.name);
    }
  }

  onRemoveDocumento(): void {
    this.documentoIA.set(null);
    this.documentoNombre.set('');
  }

  // ========== Generación con IA ==========
  async generarConIA(): Promise<void> {
    if (!this.validarPasoActual()) return;

    this.generandoIA.set(true);

    // Simular generación
    await new Promise(resolve => setTimeout(resolve, 2500));

    const cuestionarioGenerado = {
      id: `CUEST-${Date.now()}`,
      nombre: this.nombreCuestionario(),
      descripcion: this.descripcionCuestionario() || 'Cuestionario generado con IA',
      marcoNormativo: this.marcoNormativo(),
      periodicidad: this.periodicidad(),
      preguntas: 15,
      secciones: [
        {
          id: 'sec-1',
          nombre: 'Políticas de Seguridad',
          descripcion: 'Evaluación de políticas y procedimientos',
          peso: 25,
          preguntas: [
            { id: 'p1', texto: '¿Existe una política de seguridad de la información documentada?', tipo: 'siNoNa', requerida: true },
            { id: 'p2', texto: '¿La política es revisada periódicamente?', tipo: 'siNoNa', requerida: true },
            { id: 'p3', texto: '¿El personal conoce la política de seguridad?', tipo: 'escala', requerida: false }
          ]
        },
        {
          id: 'sec-2',
          nombre: 'Control de Acceso',
          descripcion: 'Gestión de identidades y accesos',
          peso: 30,
          preguntas: [
            { id: 'p4', texto: '¿Se implementa el principio de mínimo privilegio?', tipo: 'siNoNa', requerida: true },
            { id: 'p5', texto: '¿Existe un proceso de revisión de accesos?', tipo: 'siNoNa', requerida: true }
          ]
        },
        {
          id: 'sec-3',
          nombre: 'Gestión de Incidentes',
          descripcion: 'Procedimientos de respuesta a incidentes',
          peso: 25,
          preguntas: [
            { id: 'p6', texto: '¿Existe un plan de respuesta a incidentes?', tipo: 'siNoNa', requerida: true },
            { id: 'p7', texto: '¿Se realizan simulacros periódicos?', tipo: 'siNoNa', requerida: false }
          ]
        },
        {
          id: 'sec-4',
          nombre: 'Continuidad del Negocio',
          descripcion: 'Planes de continuidad y recuperación',
          peso: 20,
          preguntas: [
            { id: 'p8', texto: '¿Existe un plan de continuidad del negocio?', tipo: 'siNoNa', requerida: true },
            { id: 'p9', texto: '¿Se realizan pruebas del plan de recuperación?', tipo: 'siNoNa', requerida: true }
          ]
        }
      ]
    };

    this.generandoIA.set(false);
    this.cuestionarioGenerado.set(cuestionarioGenerado);
    this.messageService.add({ severity: 'success', summary: 'IA', detail: 'Cuestionario generado exitosamente' });
  }

  regenerarConIA(): void {
    this.cuestionarioGenerado.set(null);
  }

  // ========== Guardar cuestionario ==========
  guardarYVolverALista(): void {
    const cuestionario = this.cuestionarioGenerado();
    if (!cuestionario) return;

    // TODO: Guardar en servicio
    this.messageService.add({
      severity: 'success',
      summary: 'Guardado',
      detail: 'Cuestionario guardado exitosamente'
    });

    setTimeout(() => {
      this.router.navigate(['/cuestionarios']);
    }, 1000);
  }

  irAEditor(): void {
    const cuestionario = this.cuestionarioGenerado();
    if (!cuestionario) return;

    // TODO: Navegar al editor con el cuestionario
    this.router.navigate(['/cuestionarios'], { queryParams: { edit: cuestionario.id } });
  }

  crearCuestionarioManual(): void {
    // TODO: Crear cuestionario vacío y navegar al editor
    this.messageService.add({
      severity: 'success',
      summary: 'Creado',
      detail: 'Cuestionario creado. Redirigiendo al editor...'
    });

    setTimeout(() => {
      this.router.navigate(['/cuestionarios']);
    }, 1000);
  }

  cancelar(): void {
    this.router.navigate(['/cuestionarios']);
  }

  // ========== Helpers ==========
  getTipoPreguntaLabel(tipo: string): string {
    const tipos: Record<string, string> = {
      'siNoNa': 'Sí/No/N.A.',
      'escala': 'Escala',
      'texto': 'Texto libre',
      'multiple': 'Opción múltiple'
    };
    return tipos[tipo] || tipo;
  }

  getBotonSiguienteLabel(): string {
    const paso = this.pasoActual();
    const metodo = this.metodoCreacion();

    if (paso === 1 && metodo === 'manual') {
      return 'Crear cuestionario';
    }
    return 'Siguiente';
  }
}
