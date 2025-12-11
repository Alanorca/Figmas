import { Injectable, signal } from '@angular/core';
import { Activo, Riesgo, Incidente, Defecto, Organigrama, NodoOrganigrama } from '../models';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {

  // Datos mock de activos
  private activosData = signal<Activo[]>([
    {
      id: 'ACT-001',
      nombre: 'Servidor Principal',
      descripcion: 'Servidor de base de datos principal de produccion',
      tipo: 'hardware',
      criticidad: 'alta',
      responsable: 'Carlos Rodriguez',
      departamento: 'TI',
      fechaRegistro: new Date('2024-01-15'),
      riesgos: [
        {
          id: 'RSK-001',
          activoId: 'ACT-001',
          descripcion: 'Falla por sobrecalentamiento',
          probabilidad: 2,
          impacto: 5,
          estado: 'evaluado',
          fechaIdentificacion: new Date('2024-02-10'),
          responsable: 'Carlos Rodriguez'
        },
        {
          id: 'RSK-002',
          activoId: 'ACT-001',
          descripcion: 'Acceso no autorizado',
          probabilidad: 3,
          impacto: 5,
          estado: 'mitigado',
          fechaIdentificacion: new Date('2024-03-05'),
          responsable: 'Ana Martinez'
        }
      ],
      incidentes: [
        {
          id: 'INC-001',
          activoId: 'ACT-001',
          titulo: 'Caida del servicio por 2 horas',
          descripcion: 'El servidor presento una caida no planificada',
          severidad: 'alta',
          estado: 'cerrado',
          fechaReporte: new Date('2024-06-15'),
          reportadoPor: 'Juan Perez'
        }
      ],
      defectos: []
    },
    {
      id: 'ACT-002',
      nombre: 'Sistema ERP',
      descripcion: 'Sistema de planificacion de recursos empresariales',
      tipo: 'software',
      criticidad: 'alta',
      responsable: 'Maria Garcia',
      departamento: 'Operaciones',
      fechaRegistro: new Date('2024-02-20'),
      riesgos: [
        {
          id: 'RSK-003',
          activoId: 'ACT-002',
          descripcion: 'Vulnerabilidad de inyeccion SQL',
          probabilidad: 2,
          impacto: 4,
          estado: 'identificado',
          fechaIdentificacion: new Date('2024-07-01'),
          responsable: 'Pedro Lopez'
        }
      ],
      incidentes: [],
      defectos: [
        {
          id: 'DEF-001',
          activoId: 'ACT-002',
          titulo: 'Error en calculo de inventario',
          descripcion: 'El modulo de inventario muestra cantidades incorrectas',
          tipo: 'funcional',
          prioridad: 'alta',
          estado: 'en_correccion',
          fechaDeteccion: new Date('2024-08-10'),
          detectadoPor: 'Laura Sanchez'
        }
      ]
    },
    {
      id: 'ACT-003',
      nombre: 'Base de Datos Clientes',
      descripcion: 'Almacen de informacion de clientes',
      tipo: 'datos',
      criticidad: 'alta',
      responsable: 'Ana Martinez',
      departamento: 'Ventas',
      fechaRegistro: new Date('2024-01-10'),
      riesgos: [
        {
          id: 'RSK-004',
          activoId: 'ACT-003',
          descripcion: 'Fuga de datos personales',
          probabilidad: 2,
          impacto: 5,
          estado: 'mitigado',
          fechaIdentificacion: new Date('2024-04-20'),
          responsable: 'Ana Martinez'
        }
      ],
      incidentes: [],
      defectos: []
    },
    {
      id: 'ACT-004',
      nombre: 'Equipo de Desarrollo',
      descripcion: 'Personal del area de desarrollo de software',
      tipo: 'personas',
      criticidad: 'media',
      responsable: 'Roberto Fernandez',
      departamento: 'TI',
      fechaRegistro: new Date('2024-03-01'),
      riesgos: [
        {
          id: 'RSK-005',
          activoId: 'ACT-004',
          descripcion: 'Rotacion de personal clave',
          probabilidad: 3,
          impacto: 3,
          estado: 'aceptado',
          fechaIdentificacion: new Date('2024-05-15'),
          responsable: 'Roberto Fernandez'
        }
      ],
      incidentes: [],
      defectos: []
    },
    {
      id: 'ACT-005',
      nombre: 'Centro de Datos Principal',
      descripcion: 'Instalaciones del centro de datos corporativo',
      tipo: 'instalaciones',
      criticidad: 'alta',
      responsable: 'Miguel Torres',
      departamento: 'Infraestructura',
      fechaRegistro: new Date('2024-01-05'),
      riesgos: [
        {
          id: 'RSK-006',
          activoId: 'ACT-005',
          descripcion: 'Falla en sistema de refrigeracion',
          probabilidad: 2,
          impacto: 5,
          estado: 'evaluado',
          fechaIdentificacion: new Date('2024-06-01'),
          responsable: 'Miguel Torres'
        }
      ],
      incidentes: [
        {
          id: 'INC-002',
          activoId: 'ACT-005',
          titulo: 'Corte de energia electrica',
          descripcion: 'Corte no programado de suministro electrico',
          severidad: 'critica',
          estado: 'resuelto',
          fechaReporte: new Date('2024-07-20'),
          reportadoPor: 'Miguel Torres'
        }
      ],
      defectos: []
    },
    {
      id: 'ACT-006',
      nombre: 'Aplicacion Movil',
      descripcion: 'App movil para clientes iOS y Android',
      tipo: 'software',
      criticidad: 'media',
      responsable: 'Laura Sanchez',
      departamento: 'TI',
      fechaRegistro: new Date('2024-04-10'),
      riesgos: [],
      incidentes: [],
      defectos: [
        {
          id: 'DEF-002',
          activoId: 'ACT-006',
          titulo: 'Crash en login con biometria',
          descripcion: 'La app se cierra al intentar login con huella',
          tipo: 'funcional',
          prioridad: 'media',
          estado: 'confirmado',
          fechaDeteccion: new Date('2024-09-01'),
          detectadoPor: 'Usuario Final'
        },
        {
          id: 'DEF-003',
          activoId: 'ACT-006',
          titulo: 'Lentitud en carga de dashboard',
          descripcion: 'El dashboard tarda mas de 5 segundos en cargar',
          tipo: 'rendimiento',
          prioridad: 'baja',
          estado: 'nuevo',
          fechaDeteccion: new Date('2024-09-05'),
          detectadoPor: 'QA Team'
        }
      ]
    }
  ]);

  // Datos mock de organigrama
  private organigramaData = signal<Organigrama>({
    id: 'ORG-001',
    nombre: 'Organigrama Corporativo',
    descripcion: 'Estructura organizacional de la empresa',
    fechaCreacion: new Date('2024-01-01'),
    raiz: {
      id: 'EMP-001',
      nombre: 'Francisco Puente',
      cargo: 'Director General',
      departamento: 'Direccion',
      email: 'fpuente@empresa.com',
      telefono: '+52 55 1234 5678',
      subordinados: [
        {
          id: 'EMP-002',
          nombre: 'Carlos Rodriguez',
          cargo: 'Director de TI',
          departamento: 'Tecnologia',
          email: 'crodriguez@empresa.com',
          telefono: '+52 55 1234 5679',
          subordinados: [
            {
              id: 'EMP-005',
              nombre: 'Roberto Fernandez',
              cargo: 'Gerente de Desarrollo',
              departamento: 'TI',
              email: 'rfernandez@empresa.com',
              telefono: '+52 55 1234 5682',
              subordinados: [
                {
                  id: 'EMP-008',
                  nombre: 'Laura Sanchez',
                  cargo: 'Lider Tecnico',
                  departamento: 'TI',
                  email: 'lsanchez@empresa.com',
                  telefono: '+52 55 1234 5685',
                  subordinados: []
                }
              ]
            },
            {
              id: 'EMP-006',
              nombre: 'Miguel Torres',
              cargo: 'Gerente de Infraestructura',
              departamento: 'TI',
              email: 'mtorres@empresa.com',
              telefono: '+52 55 1234 5683',
              subordinados: []
            }
          ]
        },
        {
          id: 'EMP-003',
          nombre: 'Maria Garcia',
          cargo: 'Directora de Operaciones',
          departamento: 'Operaciones',
          email: 'mgarcia@empresa.com',
          telefono: '+52 55 1234 5680',
          subordinados: [
            {
              id: 'EMP-007',
              nombre: 'Pedro Lopez',
              cargo: 'Gerente de Calidad',
              departamento: 'Operaciones',
              email: 'plopez@empresa.com',
              telefono: '+52 55 1234 5684',
              subordinados: []
            }
          ]
        },
        {
          id: 'EMP-004',
          nombre: 'Ana Martinez',
          cargo: 'Directora Comercial',
          departamento: 'Ventas',
          email: 'amartinez@empresa.com',
          telefono: '+52 55 1234 5681',
          subordinados: []
        }
      ]
    }
  });

  // Getters
  get activos() {
    return this.activosData;
  }

  get organigrama() {
    return this.organigramaData;
  }

  // Metodos para activos
  getActivoById(id: string): Activo | undefined {
    return this.activosData().find(a => a.id === id);
  }

  addActivo(activo: Omit<Activo, 'id' | 'fechaRegistro' | 'riesgos' | 'incidentes' | 'defectos'>): void {
    const newActivo: Activo = {
      ...activo,
      id: `ACT-${String(this.activosData().length + 1).padStart(3, '0')}`,
      fechaRegistro: new Date(),
      riesgos: [],
      incidentes: [],
      defectos: []
    };
    this.activosData.update(activos => [...activos, newActivo]);
  }

  // Metodos para riesgos
  addRiesgo(activoId: string, riesgo: Omit<Riesgo, 'id' | 'activoId' | 'fechaIdentificacion'>): void {
    const allRiesgos = this.activosData().flatMap(a => a.riesgos);
    const newRiesgo: Riesgo = {
      ...riesgo,
      id: `RSK-${String(allRiesgos.length + 1).padStart(3, '0')}`,
      activoId,
      fechaIdentificacion: new Date()
    };
    this.activosData.update(activos =>
      activos.map(a =>
        a.id === activoId ? { ...a, riesgos: [...a.riesgos, newRiesgo] } : a
      )
    );
  }

  // Metodos para incidentes
  addIncidente(activoId: string, incidente: Omit<Incidente, 'id' | 'activoId' | 'fechaReporte'>): void {
    const allIncidentes = this.activosData().flatMap(a => a.incidentes);
    const newIncidente: Incidente = {
      ...incidente,
      id: `INC-${String(allIncidentes.length + 1).padStart(3, '0')}`,
      activoId,
      fechaReporte: new Date()
    };
    this.activosData.update(activos =>
      activos.map(a =>
        a.id === activoId ? { ...a, incidentes: [...a.incidentes, newIncidente] } : a
      )
    );
  }

  // Metodos para defectos
  addDefecto(activoId: string, defecto: Omit<Defecto, 'id' | 'activoId' | 'fechaDeteccion'>): void {
    const allDefectos = this.activosData().flatMap(a => a.defectos);
    const newDefecto: Defecto = {
      ...defecto,
      id: `DEF-${String(allDefectos.length + 1).padStart(3, '0')}`,
      activoId,
      fechaDeteccion: new Date()
    };
    this.activosData.update(activos =>
      activos.map(a =>
        a.id === activoId ? { ...a, defectos: [...a.defectos, newDefecto] } : a
      )
    );
  }

  // Estadisticas
  getEstadisticas() {
    const activos = this.activosData();
    const totalRiesgos = activos.reduce((sum, a) => sum + a.riesgos.length, 0);
    const totalIncidentes = activos.reduce((sum, a) => sum + a.incidentes.length, 0);
    const totalDefectos = activos.reduce((sum, a) => sum + a.defectos.length, 0);
    const activosCriticos = activos.filter(a => a.criticidad === 'alta').length;
    const incidentesAbiertos = activos.reduce((sum, a) =>
      sum + a.incidentes.filter(i => i.estado === 'abierto' || i.estado === 'en_proceso').length, 0);
    const riesgosCriticos = activos.reduce((sum, a) =>
      sum + a.riesgos.filter(r => r.probabilidad * r.impacto >= 15).length, 0);

    return {
      totalActivos: activos.length,
      activosCriticos,
      totalRiesgos,
      riesgosCriticos,
      totalIncidentes,
      incidentesAbiertos,
      totalDefectos
    };
  }
}
