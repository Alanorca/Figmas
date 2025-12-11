import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { MockDataService } from '../../services/mock-data.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CardModule, ButtonModule, ChartModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent {
  private mockData = inject(MockDataService);

  stats = computed(() => this.mockData.getEstadisticas());
  activos = this.mockData.activos;

  // Datos para grafico de riesgos por tipo
  riesgosPorTipoData = computed(() => {
    const activos = this.activos();
    const tipos = ['hardware', 'software', 'datos', 'personas', 'instalaciones'];
    const data = tipos.map(tipo =>
      activos.filter(a => a.tipo === tipo).reduce((sum, a) => sum + a.riesgos.length, 0)
    );
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
    const activos = this.activos();
    const incidentes = activos.flatMap(a => a.incidentes);
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
