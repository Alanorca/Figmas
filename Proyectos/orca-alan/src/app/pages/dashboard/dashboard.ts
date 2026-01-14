import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { ApiService } from '../../services/api.service';
import { Activo } from '../../models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CardModule, ButtonModule, ChartModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);

  activos = signal<Activo[]>([]);
  riesgosData = signal<any[]>([]);
  incidentesData = signal<any[]>([]);
  defectosData = signal<any[]>([]);

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.api.getActivos().subscribe({
      next: (data) => this.activos.set(data),
      error: (err) => console.error('Error cargando activos:', err)
    });
    this.api.getRiesgos().subscribe({
      next: (data) => this.riesgosData.set(data),
      error: (err) => console.error('Error cargando riesgos:', err)
    });
    this.api.getIncidentes().subscribe({
      next: (data) => this.incidentesData.set(data),
      error: (err) => console.error('Error cargando incidentes:', err)
    });
    this.api.getDefectos().subscribe({
      next: (data) => this.defectosData.set(data),
      error: (err) => console.error('Error cargando defectos:', err)
    });
  }

  stats = computed(() => ({
    totalActivos: this.activos().length,
    totalRiesgos: this.riesgosData().length,
    totalIncidentes: this.incidentesData().length,
    totalDefectos: this.defectosData().length,
    activosCriticos: this.activos().filter(a => a.criticidad === 'alta').length,
    riesgosCriticos: this.riesgosData().filter(r => r.probabilidad * r.impacto >= 15).length,
    incidentesAbiertos: this.incidentesData().filter(i => i.estado === 'abierto').length,
    defectosPendientes: this.defectosData().filter(d => d.estado === 'nuevo' || d.estado === 'confirmado').length
  }));

  // Datos para grafico de riesgos por tipo
  riesgosPorTipoData = computed(() => {
    const activos = this.activos();
    const riesgos = this.riesgosData();
    const tipos = ['hardware', 'software', 'datos', 'personas', 'instalaciones'];
    const data = tipos.map(tipo => {
      const activoIds = activos.filter(a => a.tipo === tipo).map(a => a.id);
      return riesgos.filter(r => activoIds.includes(r.activoId)).length;
    });
    return {
      labels: ['Hardware', 'Software', 'Datos', 'Personas', 'Instalaciones'],
      datasets: [{
        data,
        backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#26C6DA']
      }]
    };
  });

  // Datos para grafico de incidentes por severidad
  incidentesPorSeveridadData = computed(() => {
    const incidentes = this.incidentesData();
    return {
      labels: ['Critica', 'Alta', 'Media', 'Baja'],
      datasets: [{
        label: 'Incidentes',
        data: [
          incidentes.filter(i => i.severidad === 'critica').length,
          incidentes.filter(i => i.severidad === 'alta').length,
          incidentes.filter(i => i.severidad === 'media').length,
          incidentes.filter(i => i.severidad === 'baja').length
        ],
        backgroundColor: ['#EF5350', '#FF7043', '#FFCA28', '#66BB6A']
      }]
    };
  });

  chartOptions = {
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };
}
