const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Obtener todos los permisos
const getPermisos = async (req, res) => {
  try {
    const { modulo, categoria } = req.query;

    const where = {};
    if (modulo) where.modulo = modulo;
    if (categoria) where.categoria = categoria;

    const permisos = await prisma.permiso.findMany({
      where,
      orderBy: [{ modulo: 'asc' }, { nombre: 'asc' }]
    });

    res.json(permisos);
  } catch (error) {
    console.error('Error al obtener permisos:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Obtener permisos agrupados por módulo
const getPermisosAgrupados = async (req, res) => {
  try {
    const permisos = await prisma.permiso.findMany({
      where: { activo: true },
      orderBy: [{ modulo: 'asc' }, { nombre: 'asc' }]
    });

    // Agrupar por módulo
    const modulosMap = {};
    permisos.forEach(permiso => {
      if (!modulosMap[permiso.modulo]) {
        modulosMap[permiso.modulo] = {
          id: permiso.modulo,
          nombre: formatModuloNombre(permiso.modulo),
          icono: getModuloIcono(permiso.modulo),
          permisos: []
        };
      }
      modulosMap[permiso.modulo].permisos.push(permiso);
    });

    res.json(Object.values(modulosMap));
  } catch (error) {
    console.error('Error al obtener permisos agrupados:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Obtener un permiso por ID
const getPermisoById = async (req, res) => {
  try {
    const { id } = req.params;

    const permiso = await prisma.permiso.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            rol: true
          }
        }
      }
    });

    if (!permiso) {
      return res.status(404).json({ error: true, message: 'Permiso no encontrado' });
    }

    res.json({
      ...permiso,
      roles: permiso.roles.map(rp => rp.rol)
    });
  } catch (error) {
    console.error('Error al obtener permiso:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Helpers
function formatModuloNombre(modulo) {
  return modulo
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getModuloIcono(modulo) {
  const iconos = {
    usuarios: 'pi-users',
    roles: 'pi-shield',
    organizaciones: 'pi-building',
    activos: 'pi-box',
    procesos: 'pi-sitemap',
    riesgos: 'pi-exclamation-triangle',
    cumplimiento: 'pi-check-circle',
    reportes: 'pi-chart-bar',
    configuracion: 'pi-cog',
    auditoria: 'pi-history'
  };
  return iconos[modulo] || 'pi-circle';
}

module.exports = {
  getPermisos,
  getPermisosAgrupados,
  getPermisoById
};
