import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Interfaces
interface KPI {
  id: string;
  nombre: string;
  meta: number;
  escala: string;
}

interface Objetivo {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: 'estrategico' | 'operativo';
  progreso: number;
  kpis: KPI[];
}

@Component({
  selector: 'app-objetivos-kpis',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    TagModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './objetivos-kpis.html',
  styleUrl: './objetivos-kpis.scss'
})
export class ObjetivosKpisComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);

  // Modo de la página
  modo = signal<'ver' | 'editar'>('ver');
  procesoId = signal<string | null>(null);
  procesoNombre = signal('Proceso de Gestión de Riesgos');

  // Estado
  objetivoSeleccionadoId = signal<string | null>(null);
  busquedaObjetivos = signal('');

  // Objetivos con KPIs
  objetivos = signal<Objetivo[]>([
    {
      id: '1',
      nombre: 'Reducir riesgos Operacionales',
      descripcion: 'Evaluación de riesgos financieros, desarrollo de estrategias de mitigación, coordinación de auditorías y fortalecimiento de controles internos.',
      tipo: 'estrategico',
      progreso: 50,
      kpis: [
        { id: 'KPI-001', nombre: 'Índice de Riesgo Operacional', meta: 5, escala: 'Escala 1-5' },
        { id: 'KPI-002', nombre: 'Pérdidas por Riesgo Operacional', meta: 5, escala: '%' },
        { id: 'KPI-003', nombre: 'Tiempo de Resolución de Incidentes', meta: 5, escala: 'Horas' },
        { id: 'KPI-004', nombre: 'Cumplimiento de Auditorías', meta: 5, escala: '%' },
        { id: 'KPI-005', nombre: 'Capacitaciones en Gestión de Riesgos', meta: 5, escala: '%' }
      ]
    },
    {
      id: '2',
      nombre: 'Incrementar rentabilidad financiera',
      descripcion: 'Optimización de la cartera crediticia, diversificación de ingresos, mejora del margen financiero y reducción de costos operativos.',
      tipo: 'operativo',
      progreso: 75,
      kpis: []
    },
    {
      id: '3',
      nombre: 'Mejora experiencia del cliente',
      descripcion: 'Expansión de mercado, desarrollo de nuevos productos, captación de clientes y consolidación de la participación sectorial.',
      tipo: 'estrategico',
      progreso: 80,
      kpis: [
        { id: 'KPI-006', nombre: 'NPS Score', meta: 75, escala: '%' },
        { id: 'KPI-007', nombre: 'Tiempo de respuesta', meta: 24, escala: 'Horas' }
      ]
    },
    {
      id: '4',
      nombre: 'Fortalecer posicionamiento competitivo',
      descripcion: 'Adherencia a normativas financieras, prevención de lavado de activos, protección de datos y mantenimiento de ratios prudenciales.',
      tipo: 'operativo',
      progreso: 30,
      kpis: [
        { id: 'KPI-008', nombre: 'Market Share', meta: 15, escala: '%' }
      ]
    },
    {
      id: '5',
      nombre: 'Garantizar el cumplimiento regulatorio',
      descripcion: 'Adherencia a normativas financieras, prevención de lavado de activos, protección de datos y mantenimiento de ratios prudenciales.',
      tipo: 'operativo',
      progreso: 55,
      kpis: [
        { id: 'KPI-009', nombre: 'Cumplimiento normativo', meta: 100, escala: '%' }
      ]
    },
    {
      id: '6',
      nombre: 'Optimizar gestión del talento humano',
      descripcion: 'Desarrollo profesional, retención de talento, cultura organizacional y productividad del equipo humano.',
      tipo: 'estrategico',
      progreso: 65,
      kpis: []
    }
  ]);

  // Objetivo seleccionado
  objetivoSeleccionado = computed(() => {
    const id = this.objetivoSeleccionadoId();
    if (!id) return null;
    return this.objetivos().find(o => o.id === id) || null;
  });

  // Objetivos filtrados
  objetivosFiltrados = computed(() => {
    const busqueda = this.busquedaObjetivos().toLowerCase();
    if (!busqueda) return this.objetivos();
    return this.objetivos().filter(o =>
      o.nombre.toLowerCase().includes(busqueda) ||
      o.descripcion.toLowerCase().includes(busqueda)
    );
  });

  // Estados de edición
  editandoObjetivo = signal(false);
  editandoKPIId = signal<string | null>(null);
  nuevoKPI = signal(false);

  // Form values
  formNombre = signal('');
  formDescripcion = signal('');
  formTipo = signal<'estrategico' | 'operativo'>('estrategico');
  formKPINombre = signal('');
  formKPIMeta = signal<number>(75);
  formKPIEscala = signal('Porcentaje');

  escalasOptions = [
    { label: 'Porcentaje', value: 'Porcentaje' },
    { label: '%', value: '%' },
    { label: 'Unidades', value: 'Unidades' },
    { label: 'Días', value: 'Días' },
    { label: 'Horas', value: 'Horas' },
    { label: 'Escala 1-5', value: 'Escala 1-5' },
    { label: 'USD', value: 'USD' }
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const modoParam = this.route.snapshot.queryParamMap.get('modo');

    if (id) {
      this.procesoId.set(id);
    }

    if (modoParam === 'editar') {
      this.modo.set('editar');
    }

    // Seleccionar primer objetivo
    if (this.objetivos().length > 0) {
      this.objetivoSeleccionadoId.set(this.objetivos()[0].id);
    }
  }

  // Navegación
  volver(): void {
    const id = this.procesoId();
    if (id) {
      this.router.navigate(['/procesos', id, 'detalle']);
    } else {
      this.router.navigate(['/procesos']);
    }
  }

  cambiarModo(nuevoModo: 'ver' | 'editar'): void {
    this.modo.set(nuevoModo);
    this.resetEditStates();
  }

  seleccionarObjetivo(objetivoId: string): void {
    this.objetivoSeleccionadoId.set(objetivoId);
    this.resetEditStates();
  }

  resetEditStates(): void {
    this.editandoObjetivo.set(false);
    this.editandoKPIId.set(null);
    this.nuevoKPI.set(false);
  }

  // CRUD Objetivos
  iniciarEdicionObjetivo(): void {
    const obj = this.objetivoSeleccionado();
    if (obj) {
      this.formNombre.set(obj.nombre);
      this.formDescripcion.set(obj.descripcion);
      this.formTipo.set(obj.tipo);
      this.editandoObjetivo.set(true);
    }
  }

  cancelarEdicionObjetivo(): void {
    this.editandoObjetivo.set(false);
  }

  guardarObjetivo(): void {
    const id = this.objetivoSeleccionadoId();
    if (!id || !this.formNombre().trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Validación', detail: 'El nombre es requerido' });
      return;
    }

    this.objetivos.update(list =>
      list.map(o =>
        o.id === id
          ? {
              ...o,
              nombre: this.formNombre(),
              descripcion: this.formDescripcion(),
              tipo: this.formTipo()
            }
          : o
      )
    );
    this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Objetivo actualizado correctamente' });
    this.editandoObjetivo.set(false);
  }

  eliminarObjetivo(): void {
    const id = this.objetivoSeleccionadoId();
    if (!id) return;

    this.objetivos.update(list => list.filter(o => o.id !== id));
    this.messageService.add({ severity: 'info', summary: 'Eliminado', detail: 'Objetivo eliminado' });

    const remaining = this.objetivos();
    if (remaining.length > 0) {
      this.objetivoSeleccionadoId.set(remaining[0].id);
    } else {
      this.objetivoSeleccionadoId.set(null);
    }
    this.resetEditStates();
  }

  crearObjetivo(): void {
    const nuevoObjetivo: Objetivo = {
      id: `OBJ-${Date.now()}`,
      nombre: 'Nuevo Objetivo',
      descripcion: '',
      tipo: 'estrategico',
      progreso: 0,
      kpis: []
    };
    this.objetivos.update(list => [...list, nuevoObjetivo]);
    this.objetivoSeleccionadoId.set(nuevoObjetivo.id);
    this.iniciarEdicionObjetivo();
  }

  // CRUD KPIs
  iniciarNuevoKPI(): void {
    this.formKPINombre.set('');
    this.formKPIMeta.set(75);
    this.formKPIEscala.set('Porcentaje');
    this.nuevoKPI.set(true);
    this.editandoKPIId.set(null);
  }

  iniciarEdicionKPI(kpi: KPI): void {
    this.formKPINombre.set(kpi.nombre);
    this.formKPIMeta.set(kpi.meta);
    this.formKPIEscala.set(kpi.escala);
    this.editandoKPIId.set(kpi.id);
    this.nuevoKPI.set(false);
  }

  cancelarKPI(): void {
    this.nuevoKPI.set(false);
    this.editandoKPIId.set(null);
  }

  guardarKPI(): void {
    const objetivoId = this.objetivoSeleccionadoId();
    if (!objetivoId || !this.formKPINombre().trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Validación', detail: 'El nombre del KPI es requerido' });
      return;
    }

    const editandoId = this.editandoKPIId();
    const kpi: KPI = {
      id: editandoId || `KPI-${Date.now()}`,
      nombre: this.formKPINombre(),
      meta: this.formKPIMeta(),
      escala: this.formKPIEscala()
    };

    if (editandoId) {
      this.objetivos.update(list =>
        list.map(o =>
          o.id === objetivoId
            ? { ...o, kpis: o.kpis.map(k => k.id === kpi.id ? kpi : k) }
            : o
        )
      );
      this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'KPI actualizado' });
    } else {
      this.objetivos.update(list =>
        list.map(o =>
          o.id === objetivoId
            ? { ...o, kpis: [...o.kpis, kpi] }
            : o
        )
      );
      this.messageService.add({ severity: 'success', summary: 'Agregado', detail: 'KPI agregado' });
    }

    this.cancelarKPI();
  }

  eliminarKPI(kpiId: string): void {
    const objetivoId = this.objetivoSeleccionadoId();
    if (!objetivoId) return;

    this.objetivos.update(list =>
      list.map(o =>
        o.id === objetivoId
          ? { ...o, kpis: o.kpis.filter(k => k.id !== kpiId) }
          : o
      )
    );
    this.messageService.add({ severity: 'info', summary: 'Eliminado', detail: 'KPI eliminado' });
  }

  // Helpers
  getProgresoColor(progreso: number): string {
    if (progreso >= 75) return 'bg-green-500';
    if (progreso >= 50) return 'bg-blue-500';
    if (progreso >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  }

  getTipoLabel(tipo: string): string {
    return tipo === 'estrategico' ? 'Estratégico' : 'Operativo';
  }
}
