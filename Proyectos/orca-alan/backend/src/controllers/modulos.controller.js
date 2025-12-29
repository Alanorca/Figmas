const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Obtener todos los módulos
const getModulos = async (req, res) => {
  try {
    const modulos = await prisma.modulo.findMany({
      where: { activo: true },
      orderBy: { orden: 'asc' }
    });

    res.json(modulos);
  } catch (error) {
    console.error('Error al obtener módulos:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Obtener módulo por ID
const getModuloById = async (req, res) => {
  try {
    const { id } = req.params;

    const modulo = await prisma.modulo.findUnique({
      where: { id }
    });

    if (!modulo) {
      return res.status(404).json({ error: true, message: 'Módulo no encontrado' });
    }

    res.json(modulo);
  } catch (error) {
    console.error('Error al obtener módulo:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Obtener permisos de un rol por módulo (estructura para la vista de matriz)
const getPermisosRolPorModulo = async (req, res) => {
  try {
    const { rolId } = req.params;

    // Obtener permisos del rol
    const rolPermisos = await prisma.rolPermiso.findMany({
      where: { rolId },
      include: { permiso: true }
    });

    // Crear set de códigos de permisos del rol
    const permisosDelRol = new Set(rolPermisos.map(rp => rp.permiso.codigo));

    // Mapeo de módulos a códigos de permisos
    const modulosConfig = [
      {
        id: 'dashboard',
        nombre: 'Dashboard',
        icono: 'pi-chart-bar',
        permisoView: ['RPT_VIEW'],
        permisoCreate: [],
        permisoEdit: []
      },
      {
        id: 'activos',
        nombre: 'Activos y Procesos',
        icono: 'pi-box',
        permisoView: ['ACT_VIEW', 'ORG_VIEW'],
        permisoCreate: ['ORG_CREATE', 'ACT_MANAGE'],
        permisoEdit: ['ORG_EDIT', 'ACT_MANAGE']
      },
      {
        id: 'procesos',
        nombre: 'Procesos',
        icono: 'pi-sitemap',
        permisoView: ['PRC_VIEW'],
        permisoCreate: ['PRC_MANAGE'],
        permisoEdit: ['PRC_MANAGE']
      },
      {
        id: 'riesgos',
        nombre: 'Riesgos',
        icono: 'pi-exclamation-triangle',
        permisoView: ['RSK_VIEW'],
        permisoCreate: ['RSK_EDIT'],
        permisoEdit: ['RSK_EDIT']
      },
      {
        id: 'incidentes',
        nombre: 'Incidentes',
        icono: 'pi-bolt',
        permisoView: ['INC_VIEW'],
        permisoCreate: ['INC_MANAGE'],
        permisoEdit: ['INC_MANAGE']
      },
      {
        id: 'cumplimiento',
        nombre: 'Cumplimiento',
        icono: 'pi-check-circle',
        permisoView: ['CMP_VIEW'],
        permisoCreate: ['CMP_MANAGE'],
        permisoEdit: ['CMP_MANAGE']
      },
      {
        id: 'reportes',
        nombre: 'Reportes',
        icono: 'pi-chart-line',
        permisoView: ['RPT_VIEW'],
        permisoCreate: [],
        permisoEdit: ['RPT_EXPORT']
      },
      {
        id: 'auditoria',
        nombre: 'Auditoría',
        icono: 'pi-history',
        permisoView: ['AUD_VIEW'],
        permisoCreate: [],
        permisoEdit: ['AUD_EXPORT']
      },
      {
        id: 'usuarios',
        nombre: 'Usuarios',
        icono: 'pi-users',
        permisoView: ['USR_VIEW'],
        permisoCreate: ['USR_CREATE'],
        permisoEdit: ['USR_EDIT']
      },
      {
        id: 'configuracion',
        nombre: 'Configuración',
        icono: 'pi-cog',
        permisoView: ['ROL_VIEW', 'USR_VIEW'],
        permisoCreate: ['ROL_CREATE'],
        permisoEdit: ['ROL_EDIT']
      }
    ];

    // Generar matriz de permisos por módulo
    const modulosConPermisos = modulosConfig.map(modulo => ({
      id: modulo.id,
      nombre: modulo.nombre,
      icono: modulo.icono,
      permisos: {
        creacion: modulo.permisoCreate.some(p => permisosDelRol.has(p)),
        edicion: modulo.permisoEdit.some(p => permisosDelRol.has(p)),
        visualizacion: modulo.permisoView.some(p => permisosDelRol.has(p))
      }
    }));

    res.json(modulosConPermisos);
  } catch (error) {
    console.error('Error al obtener permisos por módulo:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

module.exports = {
  getModulos,
  getModuloById,
  getPermisosRolPorModulo
};
