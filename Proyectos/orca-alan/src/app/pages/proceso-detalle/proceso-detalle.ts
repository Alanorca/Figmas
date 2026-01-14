import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TabsModule } from 'primeng/tabs';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { ChipModule } from 'primeng/chip';
import { TimelineModule } from 'primeng/timeline';
import { TableModule } from 'primeng/table';
import { ProgressBarModule } from 'primeng/progressbar';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProcessService } from '../../services/process.service';
import { Proceso } from '../../models/process-nodes';

interface ObjetivoKPI {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: 'estrategico' | 'especifico';
  count: number;
  progreso?: number;
}

@Component({
  selector: 'app-proceso-detalle',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ButtonModule,
    TagModule,
    TabsModule,
    CardModule,
    DividerModule,
    AvatarModule,
    TooltipModule,
    BadgeModule,
    ChipModule,
    TimelineModule,
    TableModule,
    ProgressBarModule,
    BreadcrumbModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './proceso-detalle.html',
  styleUrl: './proceso-detalle.scss'
})
export class ProcesoDetalleComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private processService = inject(ProcessService);
  private messageService = inject(MessageService);

  // Proceso actual
  proceso = signal<Proceso | null>(null);
  procesoId = signal<string | null>(null);

  // Tab activo
  tabActivo = signal<'informacion' | 'reglas' | 'riesgos' | 'auditoria'>('informacion');

  // Tab de la columna derecha
  tabDerecho = signal<'mapa' | 'kpis'>('mapa');

  // Breadcrumb
  breadcrumbItems: MenuItem[] = [];
  breadcrumbHome: MenuItem = { icon: 'pi pi-home', routerLink: '/dashboard' };

  // Organizaciones/áreas mock
  organizaciones = signal(['Empresa ABC', 'Operaciones', 'Tecnología']);

  // Datos de información del proceso
  criticidad = signal<'Alta' | 'Media' | 'Baja'>('Baja');
  tipoActivo = signal('Template 0036');
  activosRelacionadosCount = signal(7);
  reglasNegocio = signal(['Mantenimiento de Antivirus']);
  procesosRelacionados = signal([
    'Contratación de Créditos bancarios',
    'Contratación de Tarjetas de Crédito',
    'Seguimiento de Cobranza'
  ]);

  // Datos de matriz de riesgo - valores actuales (celda seleccionada)
  apetitoRiesgo = signal(20);
  celdaProbabilidad = signal(3); // Celda seleccionada en Y
  celdaImpacto = signal(3); // Celda seleccionada en X

  // Tamaño de la matriz (1-10)
  probabilidad = signal(5); // Tamaño eje Y
  impacto = signal(5); // Tamaño eje X

  // Modo edición del mapa de calor
  editandoApetito = signal(false);

  // Labels para los ejes
  probabilidadLabels = ['Raro', 'Poco probable', 'Posible', 'Probable', 'Seguro', 'Muy seguro', 'Casi seguro', 'Esperado', 'Inminente', 'Certeza'];
  impactoLabels = ['Insignificante', 'Menor', 'Moderado', 'Mayor', 'Catastrófico', 'Severo', 'Crítico', 'Extremo', 'Terminal', 'Total'];

  // Generar array de probabilidades (de mayor a menor para display)
  getProbabilidadArray(): number[] {
    const max = this.probabilidad();
    return Array.from({ length: max }, (_, i) => max - i);
  }

  // Generar array de impactos (de menor a mayor)
  getImpactoArray(): number[] {
    const max = this.impacto();
    return Array.from({ length: max }, (_, i) => i + 1);
  }

  // Obtener label de probabilidad
  getProbabilidadLabel(index: number): string {
    return this.probabilidadLabels[index - 1] || `${index}`;
  }

  // Obtener label de impacto
  getImpactoLabel(index: number): string {
    return this.impactoLabels[index - 1] || `${index}`;
  }

  // Métodos para edición de apetito de riesgo
  toggleEditarApetito(): void {
    this.editandoApetito.update(v => !v);
  }

  guardarApetito(): void {
    this.editandoApetito.set(false);
    console.log('Apetito guardado:', {
      tamañoMatriz: `${this.probabilidad()}x${this.impacto()}`,
      celdaSeleccionada: `(${this.celdaProbabilidad()}, ${this.celdaImpacto()})`,
      apetitoRiesgo: this.apetitoRiesgo()
    });
  }

  cancelarEdicionApetito(): void {
    this.editandoApetito.set(false);
  }

  // Generar/Actualizar matriz
  generarMatriz(): void {
    // Ajustar celda seleccionada si queda fuera del rango
    if (this.celdaProbabilidad() > this.probabilidad()) {
      this.celdaProbabilidad.set(this.probabilidad());
    }
    if (this.celdaImpacto() > this.impacto()) {
      this.celdaImpacto.set(this.impacto());
    }
  }

  // Actualizar tamaño de probabilidad (eje Y)
  actualizarProbabilidad(valor: number): void {
    const v = Math.max(1, Math.min(10, valor));
    this.probabilidad.set(v);
    this.generarMatriz();
  }

  // Actualizar tamaño de impacto (eje X)
  actualizarImpacto(valor: number): void {
    const v = Math.max(1, Math.min(10, valor));
    this.impacto.set(v);
    this.generarMatriz();
  }

  // Actualizar apetito
  actualizarApetitoRiesgo(valor: number): void {
    const v = Math.max(0, Math.min(100, valor));
    this.apetitoRiesgo.set(v);
  }

  incrementarProbabilidad(): void {
    this.probabilidad.update(v => Math.min(v + 1, 10));
    this.generarMatriz();
  }

  decrementarProbabilidad(): void {
    this.probabilidad.update(v => Math.max(v - 1, 1));
    this.generarMatriz();
  }

  incrementarImpacto(): void {
    this.impacto.update(v => Math.min(v + 1, 10));
    this.generarMatriz();
  }

  decrementarImpacto(): void {
    this.impacto.update(v => Math.max(v - 1, 1));
    this.generarMatriz();
  }

  incrementarApetito(): void {
    this.apetitoRiesgo.update(v => Math.min(v + 5, 100));
  }

  decrementarApetito(): void {
    this.apetitoRiesgo.update(v => Math.max(v - 5, 0));
  }

  // Seleccionar celda directamente desde el mapa
  seleccionarCelda(prob: number, imp: number): void {
    if (this.editandoApetito()) {
      this.celdaProbabilidad.set(prob);
      this.celdaImpacto.set(imp);
    }
  }

  // Verificar si una celda está seleccionada
  isCeldaSeleccionada(prob: number, imp: number): boolean {
    return this.celdaProbabilidad() === prob && this.celdaImpacto() === imp;
  }

  // Calcular nivel de riesgo dinámico basado en tamaño de matriz
  getCeldaNivelDinamico(prob: number, imp: number): string {
    const maxProb = this.probabilidad();
    const maxImp = this.impacto();
    const maxScore = maxProb * maxImp;
    const score = prob * imp;
    const porcentaje = (score / maxScore) * 100;

    if (porcentaje <= 16) return 'bajo';
    if (porcentaje <= 36) return 'medio';
    if (porcentaje <= 64) return 'alto';
    return 'critico';
  }

  // Determinar si una celda está dentro del apetito de riesgo
  estaDentroApetitoDinamico(prob: number, imp: number): boolean {
    const maxProb = this.probabilidad();
    const maxImp = this.impacto();
    const maxScore = maxProb * maxImp;
    const score = prob * imp;
    const porcentajeRiesgo = (score / maxScore) * 100;
    return porcentajeRiesgo <= this.apetitoRiesgo();
  }

  // Datos de cards de resumen
  riesgosData = signal({ cantidad: 5, fecha: '11:08, 17 Aug' });
  activosData = signal({ cantidad: 7, fecha: '14:15, 18 Aug' });
  respuestasData = signal({ cantidad: 8, fecha: '09:30, 16 Aug' });

  // Objetivos KPIs
  objetivosKPIs = signal<ObjetivoKPI[]>([
    {
      id: '1',
      nombre: 'Reducir riesgos Operacionales',
      descripcion: 'Evaluación de riesgos financieros, desarrollo de estrategias de mitigación, coordinación de auditorías y fortalecimiento de controles internos.',
      tipo: 'estrategico',
      count: 8,
      progreso: 65
    },
    {
      id: '2',
      nombre: 'Incrementar rentabilidad financiera',
      descripcion: 'Optimización de la cartera crediticia, diversificación de ingresos, mejora del margen financiero y reducción de costos operativos.',
      tipo: 'especifico',
      count: 0,
      progreso: 45
    },
    {
      id: '3',
      nombre: 'Mejora experiencia del cliente',
      descripcion: 'Expansión de mercado, desarrollo de nuevos productos, captación de clientes y consolidación de la participación sectorial.',
      tipo: 'estrategico',
      count: 8,
      progreso: 80
    },
    {
      id: '4',
      nombre: 'Fortalecer posicionamiento competitivo',
      descripcion: 'Adherencia a normativas financieras, prevención de lavado de activos, protección de datos y mantenimiento de ratios prudenciales.',
      tipo: 'especifico',
      count: 8,
      progreso: 30
    },
    {
      id: '5',
      nombre: 'Garantizar el cumplimiento regulatorio',
      descripcion: 'Adherencia a normativas financieras, prevención de lavado de activos, protección de datos y mantenimiento de ratios prudenciales.',
      tipo: 'especifico',
      count: 8,
      progreso: 55
    }
  ]);

  // Mock data para riesgos
  riesgosAsociados = signal([
    { id: 'R001', nombre: 'Falla en sistema de respaldo', nivel: 'Alto', estado: 'Abierto', impacto: 'Operacional' },
    { id: 'R002', nombre: 'Acceso no autorizado', nivel: 'Crítico', estado: 'En tratamiento', impacto: 'Seguridad' },
    { id: 'R003', nombre: 'Pérdida de datos', nivel: 'Medio', estado: 'Mitigado', impacto: 'Continuidad' },
    { id: 'R004', nombre: 'Interrupción del servicio', nivel: 'Alto', estado: 'Abierto', impacto: 'Operacional' },
    { id: 'R005', nombre: 'Incumplimiento normativo', nivel: 'Medio', estado: 'Abierto', impacto: 'Cumplimiento' }
  ]);

  // Mock data para políticas
  politicasAsociadas = signal([
    { id: 'POL001', nombre: 'Política de Seguridad de la Información', version: '3.0', estado: 'Vigente', fechaRevision: new Date('2024-06-15') },
    { id: 'POL002', nombre: 'Política de Gestión de Accesos', version: '2.1', estado: 'Vigente', fechaRevision: new Date('2024-08-20') },
    { id: 'POL003', nombre: 'Política de Respaldos', version: '1.5', estado: 'En revisión', fechaRevision: new Date('2024-11-01') }
  ]);

  // Mock data para auditoría
  historialAuditoria = signal([
    { titulo: 'Proceso actualizado', fecha: '16 Dic 2024, 14:30', usuario: 'María García', icono: 'pi-pencil', color: 'primary' },
    { titulo: 'Riesgo R002 asociado', fecha: '15 Dic 2024, 10:15', usuario: 'Carlos López', icono: 'pi-link', color: 'orange-500' },
    { titulo: 'Revisión completada', fecha: '10 Dic 2024, 16:45', usuario: 'Ana Martínez', icono: 'pi-check-circle', color: 'green-500' },
    { titulo: 'Política POL001 vinculada', fecha: '05 Dic 2024, 09:00', usuario: 'Juan Pérez', icono: 'pi-file', color: 'blue-500' },
    { titulo: 'Proceso creado', fecha: '01 Dic 2024, 11:20', usuario: 'Admin Sistema', icono: 'pi-plus-circle', color: 'cyan-500' }
  ]);

  
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.procesoId.set(id);
      this.cargarProceso(id);
    }
  }

  cargarProceso(id: string): void {
    const proceso = this.processService.procesos().find(p => p.id === id);
    if (proceso) {
      this.proceso.set(proceso);
      this.actualizarBreadcrumb(proceso);
    } else {
      this.router.navigate(['/procesos']);
    }
  }

  actualizarBreadcrumb(proceso: Proceso): void {
    this.breadcrumbItems = [
      { label: 'Procesos', routerLink: '/procesos' },
      { label: proceso.nombre }
    ];
  }

  cambiarTab(tab: string | number | undefined): void {
    if (tab === 'informacion' || tab === 'reglas' || tab === 'riesgos' || tab === 'auditoria') {
      this.tabActivo.set(tab);
    }
  }

  // Navegación
  volver(): void {
    this.router.navigate(['/procesos']);
  }

  editarProceso(): void {
    const id = this.procesoId();
    if (id) {
      this.router.navigate(['/procesos', id]);
    }
  }

  verContenidoActivo(): void {
    const id = this.procesoId();
    if (id) {
      this.router.navigate(['/procesos', id]);
    }
  }

  editarApetito(): void {
    console.log('Editar apetito de riesgo');
  }

  contestarRevision(): void {
    this.router.navigate(['/cumplimiento']);
  }

  // Helpers para avatar
  getInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  // Formato de fecha corto
  formatDateShort(date: Date | undefined): string {
    if (!date) return '2025-01-15';
    return new Date(date).toISOString().split('T')[0];
  }

  // Helpers para estados
  getEstadoSeverity(estado: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    const severities: Record<string, 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast'> = {
      'borrador': 'secondary',
      'activo': 'success',
      'inactivo': 'warn',
      'archivado': 'danger'
    };
    return severities[estado] || 'info';
  }

  getEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      'borrador': 'Borrador',
      'activo': 'Activo',
      'inactivo': 'Inactivo',
      'archivado': 'Archivado'
    };
    return labels[estado] || estado;
  }

  getCriticidadSeverity(criticidad: string): 'success' | 'warn' | 'danger' {
    const severities: Record<string, 'success' | 'warn' | 'danger'> = {
      'Baja': 'warn',
      'Media': 'warn',
      'Alta': 'danger'
    };
    return severities[criticidad] || 'warn';
  }

  getNivelRiesgoSeverity(nivel: string): 'success' | 'info' | 'warn' | 'danger' {
    const severities: Record<string, 'success' | 'info' | 'warn' | 'danger'> = {
      'Bajo': 'success',
      'Medio': 'info',
      'Alto': 'warn',
      'Crítico': 'danger'
    };
    return severities[nivel] || 'info';
  }

  getEstadoRiesgoSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const severities: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      'Abierto': 'danger',
      'En tratamiento': 'warn',
      'Mitigado': 'success',
      'Cerrado': 'secondary'
    };
    return severities[estado] || 'info';
  }

  getEstadoPoliticaSeverity(estado: string): 'success' | 'warn' | 'secondary' {
    const severities: Record<string, 'success' | 'warn' | 'secondary'> = {
      'Vigente': 'success',
      'En revisión': 'warn',
      'Obsoleta': 'secondary'
    };
    return severities[estado] || 'secondary';
  }

  formatDate(date: Date): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  // ========== Navegación a Objetivos y KPIs ==========
  navegarObjetivosVer(): void {
    const id = this.procesoId();
    if (id) {
      this.router.navigate(['/procesos', id, 'objetivos-kpis']);
    }
  }

  navegarObjetivosEditar(): void {
    const id = this.procesoId();
    if (id) {
      this.router.navigate(['/procesos', id, 'objetivos-kpis'], { queryParams: { modo: 'editar' } });
    }
  }
}
