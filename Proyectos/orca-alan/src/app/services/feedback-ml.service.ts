import { Injectable, signal, computed } from '@angular/core';

export interface AprobacionFeedback {
  hallazgoId: string;
  fecha: Date;
  opciones: {
    crearRiesgo?: boolean;
    crearTarea?: boolean;
    comentarios?: string;
  };
}

export interface DescarteFeedback {
  hallazgoId: string;
  fecha: Date;
  motivo: string;
  justificacion: string;
}

export interface EstadisticasFeedback {
  totalAprobaciones: number;
  totalDescartes: number;
  riesgosCreados: number;
  tareasCreadas: number;
}

@Injectable({
  providedIn: 'root'
})
export class FeedbackMLService {
  private aprobaciones = signal<AprobacionFeedback[]>([]);
  private descartes = signal<DescarteFeedback[]>([]);

  estadisticas = computed<EstadisticasFeedback>(() => {
    const aprobacionesList = this.aprobaciones();
    const descartesList = this.descartes();

    return {
      totalAprobaciones: aprobacionesList.length,
      totalDescartes: descartesList.length,
      riesgosCreados: aprobacionesList.filter(a => a.opciones.crearRiesgo).length,
      tareasCreadas: aprobacionesList.filter(a => a.opciones.crearTarea).length
    };
  });

  agregarAprobacion(hallazgoId: string, opciones: { crearRiesgo?: boolean; crearTarea?: boolean; comentarios?: string }): void {
    const feedback: AprobacionFeedback = {
      hallazgoId,
      fecha: new Date(),
      opciones
    };

    this.aprobaciones.update(list => [...list, feedback]);
  }

  agregarDescarte(hallazgoId: string, motivo: string, justificacion: string): void {
    const feedback: DescarteFeedback = {
      hallazgoId,
      fecha: new Date(),
      motivo,
      justificacion
    };

    this.descartes.update(list => [...list, feedback]);
  }

  getAprobaciones() {
    return this.aprobaciones;
  }

  getDescartes() {
    return this.descartes;
  }
}
