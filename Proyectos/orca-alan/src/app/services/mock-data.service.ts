import { Injectable, signal } from '@angular/core';
import { Activo, Riesgo, Incidente, Defecto, Organigrama, NodoOrganigrama, PlantillaActivo, TipoActivo } from '../models';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {

  // ==================== PLANTILLAS DE ACTIVOS ====================
  private plantillasActivoData = signal<PlantillaActivo[]>([
    // Plantilla Hardware
    {
      id: 'PLT-HW-001',
      nombre: 'Servidor',
      tipoActivo: 'hardware',
      descripcion: 'Plantilla para servidores físicos y virtuales',
      icono: 'dns',
      color: '#4CAF50',
      propiedades: [
        { id: 'hw-1', nombre: 'Marca', campo: 'marca', tipo: 'texto', requerido: true },
        { id: 'hw-2', nombre: 'Modelo', campo: 'modelo', tipo: 'texto', requerido: true },
        { id: 'hw-3', nombre: 'Número de Serie', campo: 'numeroSerie', tipo: 'texto', requerido: true },
        { id: 'hw-4', nombre: 'CPU (Cores)', campo: 'cpuCores', tipo: 'numero', requerido: false, validacion: { min: 1, max: 128 } },
        { id: 'hw-5', nombre: 'RAM (GB)', campo: 'ramGb', tipo: 'numero', requerido: false, validacion: { min: 1, max: 2048 } },
        { id: 'hw-6', nombre: 'Almacenamiento (TB)', campo: 'almacenamientoTb', tipo: 'numero', requerido: false },
        { id: 'hw-7', nombre: 'Sistema Operativo', campo: 'sistemaOperativo', tipo: 'seleccion', requerido: true, opciones: [
          { label: 'Windows Server', value: 'windows_server' },
          { label: 'Linux (Ubuntu)', value: 'linux_ubuntu' },
          { label: 'Linux (CentOS)', value: 'linux_centos' },
          { label: 'Linux (RHEL)', value: 'linux_rhel' },
          { label: 'VMware ESXi', value: 'vmware_esxi' }
        ]},
        { id: 'hw-8', nombre: 'IP Address', campo: 'ipAddress', tipo: 'texto', requerido: false },
        { id: 'hw-9', nombre: 'Ubicación Rack', campo: 'ubicacionRack', tipo: 'texto', requerido: false },
        { id: 'hw-10', nombre: 'Fecha de Compra', campo: 'fechaCompra', tipo: 'fecha', requerido: false },
        { id: 'hw-11', nombre: 'Garantía Vigente', campo: 'garantiaVigente', tipo: 'booleano', requerido: false, valorDefecto: true },
        { id: 'hw-12', nombre: 'Contrato Soporte', campo: 'contratoSoporte', tipo: 'texto', requerido: false },
      ]
    },
    // Plantilla Software
    {
      id: 'PLT-SW-001',
      nombre: 'Aplicación Empresarial',
      tipoActivo: 'software',
      descripcion: 'Plantilla para aplicaciones de software empresarial',
      icono: 'apps',
      color: '#2196F3',
      propiedades: [
        { id: 'sw-1', nombre: 'Versión', campo: 'version', tipo: 'texto', requerido: true },
        { id: 'sw-2', nombre: 'Proveedor', campo: 'proveedor', tipo: 'texto', requerido: true },
        { id: 'sw-3', nombre: 'Tipo de Licencia', campo: 'tipoLicencia', tipo: 'seleccion', requerido: true, opciones: [
          { label: 'Perpetua', value: 'perpetua' },
          { label: 'Suscripción Anual', value: 'suscripcion_anual' },
          { label: 'Suscripción Mensual', value: 'suscripcion_mensual' },
          { label: 'Open Source', value: 'open_source' },
          { label: 'Freeware', value: 'freeware' }
        ]},
        { id: 'sw-4', nombre: 'Número de Licencias', campo: 'numLicencias', tipo: 'numero', requerido: false },
        { id: 'sw-5', nombre: 'Fecha Vencimiento Licencia', campo: 'fechaVencimiento', tipo: 'fecha', requerido: false },
        { id: 'sw-6', nombre: 'Ambiente', campo: 'ambiente', tipo: 'seleccion', requerido: true, opciones: [
          { label: 'Producción', value: 'produccion' },
          { label: 'Staging', value: 'staging' },
          { label: 'Desarrollo', value: 'desarrollo' },
          { label: 'QA', value: 'qa' }
        ]},
        { id: 'sw-7', nombre: 'URL Acceso', campo: 'urlAcceso', tipo: 'url', requerido: false },
        { id: 'sw-8', nombre: 'Documentación', campo: 'urlDocumentacion', tipo: 'url', requerido: false },
        { id: 'sw-9', nombre: 'Lenguaje Principal', campo: 'lenguajePrincipal', tipo: 'texto', requerido: false },
        { id: 'sw-10', nombre: 'Base de Datos', campo: 'baseDatos', tipo: 'seleccion', requerido: false, opciones: [
          { label: 'PostgreSQL', value: 'postgresql' },
          { label: 'MySQL', value: 'mysql' },
          { label: 'SQL Server', value: 'sqlserver' },
          { label: 'Oracle', value: 'oracle' },
          { label: 'MongoDB', value: 'mongodb' },
          { label: 'N/A', value: 'na' }
        ]},
        { id: 'sw-11', nombre: 'Crítico para Negocio', campo: 'criticoNegocio', tipo: 'booleano', requerido: false, valorDefecto: false },
      ]
    },
    // Plantilla Datos
    {
      id: 'PLT-DATA-001',
      nombre: 'Base de Datos / Dataset',
      tipoActivo: 'datos',
      descripcion: 'Plantilla para bases de datos y conjuntos de datos',
      icono: 'storage',
      color: '#9C27B0',
      propiedades: [
        { id: 'dt-1', nombre: 'Tipo de Datos', campo: 'tipoDatos', tipo: 'seleccion', requerido: true, opciones: [
          { label: 'Datos Personales', value: 'personales' },
          { label: 'Datos Financieros', value: 'financieros' },
          { label: 'Datos Operativos', value: 'operativos' },
          { label: 'Datos de Clientes', value: 'clientes' },
          { label: 'Datos de Empleados', value: 'empleados' },
          { label: 'Logs/Auditoría', value: 'logs' }
        ]},
        { id: 'dt-2', nombre: 'Clasificación', campo: 'clasificacion', tipo: 'seleccion', requerido: true, opciones: [
          { label: 'Público', value: 'publico' },
          { label: 'Interno', value: 'interno' },
          { label: 'Confidencial', value: 'confidencial' },
          { label: 'Restringido', value: 'restringido' }
        ]},
        { id: 'dt-3', nombre: 'Volumen (Registros)', campo: 'volumenRegistros', tipo: 'numero', requerido: false },
        { id: 'dt-4', nombre: 'Tamaño (GB)', campo: 'tamanoGb', tipo: 'numero', requerido: false },
        { id: 'dt-5', nombre: 'Retención (Años)', campo: 'retencionAnios', tipo: 'numero', requerido: false, valorDefecto: 5 },
        { id: 'dt-6', nombre: 'Tiene Backup', campo: 'tieneBackup', tipo: 'booleano', requerido: true, valorDefecto: true },
        { id: 'dt-7', nombre: 'Frecuencia Backup', campo: 'frecuenciaBackup', tipo: 'seleccion', requerido: false, opciones: [
          { label: 'Diario', value: 'diario' },
          { label: 'Semanal', value: 'semanal' },
          { label: 'Mensual', value: 'mensual' },
          { label: 'Tiempo Real', value: 'tiempo_real' }
        ]},
        { id: 'dt-8', nombre: 'Encriptado', campo: 'encriptado', tipo: 'booleano', requerido: false, valorDefecto: false },
        { id: 'dt-9', nombre: 'Regulación Aplicable', campo: 'regulacion', tipo: 'multiseleccion', requerido: false, opciones: [
          { label: 'GDPR', value: 'gdpr' },
          { label: 'LFPDPPP', value: 'lfpdppp' },
          { label: 'PCI-DSS', value: 'pci_dss' },
          { label: 'HIPAA', value: 'hipaa' },
          { label: 'SOX', value: 'sox' }
        ]},
      ]
    },
    // Plantilla Personas
    {
      id: 'PLT-PERS-001',
      nombre: 'Equipo/Personal',
      tipoActivo: 'personas',
      descripcion: 'Plantilla para equipos de trabajo y personal clave',
      icono: 'groups',
      color: '#FF9800',
      propiedades: [
        { id: 'ps-1', nombre: 'Número de Integrantes', campo: 'numIntegrantes', tipo: 'numero', requerido: true, validacion: { min: 1 } },
        { id: 'ps-2', nombre: 'Líder del Equipo', campo: 'liderEquipo', tipo: 'texto', requerido: true },
        { id: 'ps-3', nombre: 'Email del Líder', campo: 'emailLider', tipo: 'email', requerido: false },
        { id: 'ps-4', nombre: 'Tipo de Contratación', campo: 'tipoContratacion', tipo: 'seleccion', requerido: true, opciones: [
          { label: 'Tiempo Completo', value: 'tiempo_completo' },
          { label: 'Tiempo Parcial', value: 'tiempo_parcial' },
          { label: 'Contratistas', value: 'contratistas' },
          { label: 'Mixto', value: 'mixto' }
        ]},
        { id: 'ps-5', nombre: 'Certificaciones', campo: 'certificaciones', tipo: 'multiseleccion', requerido: false, opciones: [
          { label: 'ISO 27001', value: 'iso_27001' },
          { label: 'CISM', value: 'cism' },
          { label: 'CISSP', value: 'cissp' },
          { label: 'PMP', value: 'pmp' },
          { label: 'ITIL', value: 'itil' },
          { label: 'AWS', value: 'aws' },
          { label: 'Azure', value: 'azure' }
        ]},
        { id: 'ps-6', nombre: 'Conocimientos Críticos', campo: 'conocimientosCriticos', tipo: 'texto', requerido: false, descripcion: 'Skills únicos del equipo' },
        { id: 'ps-7', nombre: 'Backup Definido', campo: 'backupDefinido', tipo: 'booleano', requerido: false, valorDefecto: false, descripcion: 'Existe personal de respaldo' },
        { id: 'ps-8', nombre: 'Ubicación', campo: 'ubicacion', tipo: 'seleccion', requerido: false, opciones: [
          { label: 'Presencial', value: 'presencial' },
          { label: 'Remoto', value: 'remoto' },
          { label: 'Híbrido', value: 'hibrido' }
        ]},
      ]
    },
    // Plantilla Instalaciones
    {
      id: 'PLT-INST-001',
      nombre: 'Centro de Datos / Instalación',
      tipoActivo: 'instalaciones',
      descripcion: 'Plantilla para centros de datos e instalaciones físicas',
      icono: 'domain',
      color: '#607D8B',
      propiedades: [
        { id: 'in-1', nombre: 'Dirección', campo: 'direccion', tipo: 'texto', requerido: true },
        { id: 'in-2', nombre: 'Área (m²)', campo: 'areaM2', tipo: 'numero', requerido: false },
        { id: 'in-3', nombre: 'Tipo de Instalación', campo: 'tipoInstalacion', tipo: 'seleccion', requerido: true, opciones: [
          { label: 'Centro de Datos Propio', value: 'datacenter_propio' },
          { label: 'Colocation', value: 'colocation' },
          { label: 'Oficina', value: 'oficina' },
          { label: 'Almacén', value: 'almacen' },
          { label: 'Planta', value: 'planta' }
        ]},
        { id: 'in-4', nombre: 'Tier (Data Center)', campo: 'tier', tipo: 'seleccion', requerido: false, opciones: [
          { label: 'Tier I', value: 'tier_1' },
          { label: 'Tier II', value: 'tier_2' },
          { label: 'Tier III', value: 'tier_3' },
          { label: 'Tier IV', value: 'tier_4' },
          { label: 'N/A', value: 'na' }
        ]},
        { id: 'in-5', nombre: 'Capacidad Energética (kW)', campo: 'capacidadKw', tipo: 'numero', requerido: false },
        { id: 'in-6', nombre: 'UPS/Respaldo Energía', campo: 'tieneUps', tipo: 'booleano', requerido: false, valorDefecto: true },
        { id: 'in-7', nombre: 'Generador de Respaldo', campo: 'tieneGenerador', tipo: 'booleano', requerido: false, valorDefecto: false },
        { id: 'in-8', nombre: 'Sistema Contra Incendios', campo: 'sistemaIncendios', tipo: 'seleccion', requerido: false, opciones: [
          { label: 'Sprinklers', value: 'sprinklers' },
          { label: 'FM-200', value: 'fm200' },
          { label: 'CO2', value: 'co2' },
          { label: 'Novec', value: 'novec' },
          { label: 'Ninguno', value: 'ninguno' }
        ]},
        { id: 'in-9', nombre: 'Control de Acceso', campo: 'controlAcceso', tipo: 'multiseleccion', requerido: false, opciones: [
          { label: 'Tarjeta RFID', value: 'rfid' },
          { label: 'Biométrico', value: 'biometrico' },
          { label: 'PIN', value: 'pin' },
          { label: 'Vigilancia 24/7', value: 'vigilancia' },
          { label: 'CCTV', value: 'cctv' }
        ]},
        { id: 'in-10', nombre: 'Fecha Última Auditoría', campo: 'fechaAuditoria', tipo: 'fecha', requerido: false },
      ]
    }
  ]);

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
      plantillaId: 'PLT-HW-001',
      propiedadesCustom: [
        { propiedadId: 'hw-1', campo: 'marca', valor: 'Dell' },
        { propiedadId: 'hw-2', campo: 'modelo', valor: 'PowerEdge R740' },
        { propiedadId: 'hw-3', campo: 'numeroSerie', valor: 'SRV-2024-001-XYZ' },
        { propiedadId: 'hw-4', campo: 'cpuCores', valor: 32 },
        { propiedadId: 'hw-5', campo: 'ramGb', valor: 128 },
        { propiedadId: 'hw-6', campo: 'almacenamientoTb', valor: 4 },
        { propiedadId: 'hw-7', campo: 'sistemaOperativo', valor: 'linux_rhel' },
        { propiedadId: 'hw-8', campo: 'ipAddress', valor: '192.168.1.100' },
        { propiedadId: 'hw-9', campo: 'ubicacionRack', valor: 'DC1-R01-U10' },
        { propiedadId: 'hw-10', campo: 'fechaCompra', valor: new Date('2023-06-15') },
        { propiedadId: 'hw-11', campo: 'garantiaVigente', valor: true },
        { propiedadId: 'hw-12', campo: 'contratoSoporte', valor: 'DELL-PROSUPPORT-2026' },
      ],
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
      plantillaId: 'PLT-SW-001',
      propiedadesCustom: [
        { propiedadId: 'sw-1', campo: 'version', valor: '4.2.1' },
        { propiedadId: 'sw-2', campo: 'proveedor', valor: 'SAP' },
        { propiedadId: 'sw-3', campo: 'tipoLicencia', valor: 'suscripcion_anual' },
        { propiedadId: 'sw-4', campo: 'numLicencias', valor: 150 },
        { propiedadId: 'sw-5', campo: 'fechaVencimiento', valor: new Date('2025-12-31') },
        { propiedadId: 'sw-6', campo: 'ambiente', valor: 'produccion' },
        { propiedadId: 'sw-7', campo: 'urlAcceso', valor: 'https://erp.empresa.com' },
        { propiedadId: 'sw-10', campo: 'baseDatos', valor: 'oracle' },
        { propiedadId: 'sw-11', campo: 'criticoNegocio', valor: true },
      ],
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
      plantillaId: 'PLT-DATA-001',
      propiedadesCustom: [
        { propiedadId: 'dt-1', campo: 'tipoDatos', valor: 'clientes' },
        { propiedadId: 'dt-2', campo: 'clasificacion', valor: 'confidencial' },
        { propiedadId: 'dt-3', campo: 'volumenRegistros', valor: 250000 },
        { propiedadId: 'dt-4', campo: 'tamanoGb', valor: 45 },
        { propiedadId: 'dt-5', campo: 'retencionAnios', valor: 7 },
        { propiedadId: 'dt-6', campo: 'tieneBackup', valor: true },
        { propiedadId: 'dt-7', campo: 'frecuenciaBackup', valor: 'diario' },
        { propiedadId: 'dt-8', campo: 'encriptado', valor: true },
        { propiedadId: 'dt-9', campo: 'regulacion', valor: ['lfpdppp', 'gdpr'] },
      ],
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
      plantillaId: 'PLT-PERS-001',
      propiedadesCustom: [
        { propiedadId: 'ps-1', campo: 'numIntegrantes', valor: 12 },
        { propiedadId: 'ps-2', campo: 'liderEquipo', valor: 'Roberto Fernandez' },
        { propiedadId: 'ps-3', campo: 'emailLider', valor: 'rfernandez@empresa.com' },
        { propiedadId: 'ps-4', campo: 'tipoContratacion', valor: 'mixto' },
        { propiedadId: 'ps-5', campo: 'certificaciones', valor: ['aws', 'azure', 'itil'] },
        { propiedadId: 'ps-6', campo: 'conocimientosCriticos', valor: 'Angular, Node.js, Python, ML' },
        { propiedadId: 'ps-7', campo: 'backupDefinido', valor: true },
        { propiedadId: 'ps-8', campo: 'ubicacion', valor: 'hibrido' },
      ],
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
      plantillaId: 'PLT-INST-001',
      propiedadesCustom: [
        { propiedadId: 'in-1', campo: 'direccion', valor: 'Av. Reforma 1500, CDMX' },
        { propiedadId: 'in-2', campo: 'areaM2', valor: 500 },
        { propiedadId: 'in-3', campo: 'tipoInstalacion', valor: 'datacenter_propio' },
        { propiedadId: 'in-4', campo: 'tier', valor: 'tier_3' },
        { propiedadId: 'in-5', campo: 'capacidadKw', valor: 250 },
        { propiedadId: 'in-6', campo: 'tieneUps', valor: true },
        { propiedadId: 'in-7', campo: 'tieneGenerador', valor: true },
        { propiedadId: 'in-8', campo: 'sistemaIncendios', valor: 'fm200' },
        { propiedadId: 'in-9', campo: 'controlAcceso', valor: ['rfid', 'biometrico', 'cctv', 'vigilancia'] },
        { propiedadId: 'in-10', campo: 'fechaAuditoria', valor: new Date('2024-08-15') },
      ],
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
      plantillaId: 'PLT-SW-001',
      propiedadesCustom: [
        { propiedadId: 'sw-1', campo: 'version', valor: '2.5.0' },
        { propiedadId: 'sw-2', campo: 'proveedor', valor: 'Interno' },
        { propiedadId: 'sw-3', campo: 'tipoLicencia', valor: 'open_source' },
        { propiedadId: 'sw-6', campo: 'ambiente', valor: 'produccion' },
        { propiedadId: 'sw-9', campo: 'lenguajePrincipal', valor: 'Flutter/Dart' },
        { propiedadId: 'sw-10', campo: 'baseDatos', valor: 'mongodb' },
        { propiedadId: 'sw-11', campo: 'criticoNegocio', valor: false },
      ],
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

  get plantillasActivo() {
    return this.plantillasActivoData;
  }

  // Métodos para plantillas
  getPlantillaById(id: string): PlantillaActivo | undefined {
    return this.plantillasActivoData().find(p => p.id === id);
  }

  getPlantillaByTipoActivo(tipo: TipoActivo): PlantillaActivo | undefined {
    return this.plantillasActivoData().find(p => p.tipoActivo === tipo);
  }

  getPlantillasForTipoActivo(tipo: TipoActivo): PlantillaActivo[] {
    return this.plantillasActivoData().filter(p => p.tipoActivo === tipo);
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
