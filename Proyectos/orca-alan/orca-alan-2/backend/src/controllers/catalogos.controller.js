const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener catálogos por tipo
const getCatalogosByTipo = async (req, res) => {
  try {
    const { tipo } = req.params;

    const catalogos = await prisma.catalogo.findMany({
      where: { tipo, activo: true },
      orderBy: { orden: 'asc' }
    });

    res.json(catalogos.map(c => ({
      ...c,
      metadata: JSON.parse(c.metadata || '{}')
    })));
  } catch (error) {
    console.error('Error al obtener catálogos:', error);
    res.status(500).json({ error: 'Error al obtener catálogos' });
  }
};

// Obtener todos los catálogos agrupados
const getAllCatalogos = async (req, res) => {
  try {
    const catalogos = await prisma.catalogo.findMany({
      where: { activo: true },
      orderBy: [{ tipo: 'asc' }, { orden: 'asc' }]
    });

    // Agrupar por tipo
    const agrupados = catalogos.reduce((acc, cat) => {
      if (!acc[cat.tipo]) acc[cat.tipo] = [];
      acc[cat.tipo].push({
        ...cat,
        metadata: JSON.parse(cat.metadata || '{}')
      });
      return acc;
    }, {});

    res.json(agrupados);
  } catch (error) {
    console.error('Error al obtener catálogos:', error);
    res.status(500).json({ error: 'Error al obtener catálogos' });
  }
};

// Crear nuevo ítem de catálogo
const createCatalogo = async (req, res) => {
  try {
    const { tipo, codigo, nombre, descripcion, orden, color, icono, metadata } = req.body;

    const catalogo = await prisma.catalogo.create({
      data: {
        tipo,
        codigo,
        nombre,
        descripcion,
        orden: orden || 0,
        color,
        icono,
        metadata: JSON.stringify(metadata || {})
      }
    });

    res.status(201).json({
      ...catalogo,
      metadata: JSON.parse(catalogo.metadata)
    });
  } catch (error) {
    console.error('Error al crear catálogo:', error);
    res.status(500).json({ error: 'Error al crear catálogo' });
  }
};

// Actualizar ítem de catálogo
const updateCatalogo = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, orden, activo, color, icono, metadata } = req.body;

    const catalogo = await prisma.catalogo.update({
      where: { id },
      data: {
        nombre,
        descripcion,
        orden,
        activo,
        color,
        icono,
        metadata: metadata ? JSON.stringify(metadata) : undefined
      }
    });

    res.json({
      ...catalogo,
      metadata: JSON.parse(catalogo.metadata || '{}')
    });
  } catch (error) {
    console.error('Error al actualizar catálogo:', error);
    res.status(500).json({ error: 'Error al actualizar catálogo' });
  }
};

// Eliminar ítem de catálogo (soft delete)
const deleteCatalogo = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.catalogo.update({
      where: { id },
      data: { activo: false }
    });

    res.json({ message: 'Catálogo desactivado correctamente' });
  } catch (error) {
    console.error('Error al eliminar catálogo:', error);
    res.status(500).json({ error: 'Error al eliminar catálogo' });
  }
};

// Seed de catálogos iniciales
const seedCatalogos = async (req, res) => {
  try {
    const catalogosIniciales = [
      // Tipos de activo
      { tipo: 'tipoActivo', codigo: 'hardware', nombre: 'Hardware', orden: 1, icono: 'computer' },
      { tipo: 'tipoActivo', codigo: 'software', nombre: 'Software', orden: 2, icono: 'code' },
      { tipo: 'tipoActivo', codigo: 'datos', nombre: 'Datos', orden: 3, icono: 'database' },
      { tipo: 'tipoActivo', codigo: 'personas', nombre: 'Personas', orden: 4, icono: 'people' },
      { tipo: 'tipoActivo', codigo: 'instalaciones', nombre: 'Instalaciones', orden: 5, icono: 'business' },

      // Criticidades
      { tipo: 'criticidad', codigo: 'alta', nombre: 'Alta', orden: 1, color: '#dc2626' },
      { tipo: 'criticidad', codigo: 'media', nombre: 'Media', orden: 2, color: '#f59e0b' },
      { tipo: 'criticidad', codigo: 'baja', nombre: 'Baja', orden: 3, color: '#22c55e' },

      // Severidades
      { tipo: 'severidad', codigo: 'critica', nombre: 'Crítica', orden: 1, color: '#7f1d1d' },
      { tipo: 'severidad', codigo: 'alta', nombre: 'Alta', orden: 2, color: '#dc2626' },
      { tipo: 'severidad', codigo: 'media', nombre: 'Media', orden: 3, color: '#f59e0b' },
      { tipo: 'severidad', codigo: 'baja', nombre: 'Baja', orden: 4, color: '#22c55e' },

      // Estados de riesgo
      { tipo: 'estadoRiesgo', codigo: 'identificado', nombre: 'Identificado', orden: 1 },
      { tipo: 'estadoRiesgo', codigo: 'evaluado', nombre: 'Evaluado', orden: 2 },
      { tipo: 'estadoRiesgo', codigo: 'mitigado', nombre: 'Mitigado', orden: 3 },
      { tipo: 'estadoRiesgo', codigo: 'aceptado', nombre: 'Aceptado', orden: 4 },

      // Estados de incidente
      { tipo: 'estadoIncidente', codigo: 'abierto', nombre: 'Abierto', orden: 1 },
      { tipo: 'estadoIncidente', codigo: 'en_proceso', nombre: 'En Proceso', orden: 2 },
      { tipo: 'estadoIncidente', codigo: 'resuelto', nombre: 'Resuelto', orden: 3 },
      { tipo: 'estadoIncidente', codigo: 'cerrado', nombre: 'Cerrado', orden: 4 },

      // Estados de defecto
      { tipo: 'estadoDefecto', codigo: 'nuevo', nombre: 'Nuevo', orden: 1 },
      { tipo: 'estadoDefecto', codigo: 'confirmado', nombre: 'Confirmado', orden: 2 },
      { tipo: 'estadoDefecto', codigo: 'en_correccion', nombre: 'En Corrección', orden: 3 },
      { tipo: 'estadoDefecto', codigo: 'corregido', nombre: 'Corregido', orden: 4 },
      { tipo: 'estadoDefecto', codigo: 'verificado', nombre: 'Verificado', orden: 5 },

      // Tipos de defecto
      { tipo: 'tipoDefecto', codigo: 'funcional', nombre: 'Funcional', orden: 1 },
      { tipo: 'tipoDefecto', codigo: 'seguridad', nombre: 'Seguridad', orden: 2 },
      { tipo: 'tipoDefecto', codigo: 'rendimiento', nombre: 'Rendimiento', orden: 3 },
      { tipo: 'tipoDefecto', codigo: 'usabilidad', nombre: 'Usabilidad', orden: 4 },

      // Departamentos
      { tipo: 'departamento', codigo: 'ti', nombre: 'TI', orden: 1 },
      { tipo: 'departamento', codigo: 'tecnologia', nombre: 'Tecnología', orden: 2 },
      { tipo: 'departamento', codigo: 'infraestructura', nombre: 'Infraestructura', orden: 3 },
      { tipo: 'departamento', codigo: 'operaciones', nombre: 'Operaciones', orden: 4 },
      { tipo: 'departamento', codigo: 'ventas', nombre: 'Ventas', orden: 5 },
      { tipo: 'departamento', codigo: 'direccion', nombre: 'Dirección', orden: 6 },
      { tipo: 'departamento', codigo: 'rrhh', nombre: 'Recursos Humanos', orden: 7 },
      { tipo: 'departamento', codigo: 'finanzas', nombre: 'Finanzas', orden: 8 },

      // Regiones
      { tipo: 'region', codigo: 'MX', nombre: 'México', orden: 1 },
      { tipo: 'region', codigo: 'US', nombre: 'Estados Unidos', orden: 2 },
      { tipo: 'region', codigo: 'EU', nombre: 'Europa', orden: 3 },
      { tipo: 'region', codigo: 'LATAM', nombre: 'Latinoamérica', orden: 4 },
      { tipo: 'region', codigo: 'GLOBAL', nombre: 'Global', orden: 5 }
    ];

    for (const cat of catalogosIniciales) {
      await prisma.catalogo.upsert({
        where: {
          tipo_codigo: { tipo: cat.tipo, codigo: cat.codigo }
        },
        update: cat,
        create: {
          ...cat,
          metadata: '{}'
        }
      });
    }

    res.json({ message: 'Catálogos inicializados correctamente', count: catalogosIniciales.length });
  } catch (error) {
    console.error('Error al seed catálogos:', error);
    res.status(500).json({ error: 'Error al inicializar catálogos' });
  }
};

module.exports = {
  getCatalogosByTipo,
  getAllCatalogos,
  createCatalogo,
  updateCatalogo,
  deleteCatalogo,
  seedCatalogos
};
