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

// Obtener permisos de un rol por módulo (estructura para la vista de Figma)
const getPermisosRolPorModulo = async (req, res) => {
  try {
    const { rolId } = req.params;

    // Obtener todos los módulos
    const modulos = await prisma.modulo.findMany({
      where: { activo: true },
      orderBy: { orden: 'asc' }
    });

    // Obtener permisos del rol
    const rolPermisos = await prisma.rolPermiso.findMany({
      where: { rolId },
      include: { permiso: true }
    });

    // Crear set de códigos de permisos del rol
    const permisosDelRol = new Set(rolPermisos.map(rp => rp.permiso.codigo));

    // Mapear módulos con sus permisos
    const modulosConPermisos = modulos.map(modulo => {
      const nombreModulo = modulo.nombre.toLowerCase();

      return {
        id: modulo.id,
        nombre: modulo.nombre,
        icono: modulo.icono,
        permisos: {
          creacion: permisosDelRol.has(`${nombreModulo.toUpperCase().substring(0, 3)}_CREATE`) ||
                    permisosDelRol.has(`USR_CREATE`) && nombreModulo === 'usuarios' ||
                    permisosDelRol.has(`ROL_CREATE`) && nombreModulo === 'roles' ||
                    permisosDelRol.has(`ORG_CREATE`) && nombreModulo === 'organizaciones',
          edicion: permisosDelRol.has(`${nombreModulo.toUpperCase().substring(0, 3)}_EDIT`) ||
                   permisosDelRol.has(`USR_EDIT`) && nombreModulo === 'usuarios' ||
                   permisosDelRol.has(`ROL_EDIT`) && nombreModulo === 'roles' ||
                   permisosDelRol.has(`ORG_EDIT`) && nombreModulo === 'organizaciones',
          visualizacion: permisosDelRol.has(`${nombreModulo.toUpperCase().substring(0, 3)}_VIEW`) ||
                         permisosDelRol.has(`USR_VIEW`) && nombreModulo === 'usuarios' ||
                         permisosDelRol.has(`ROL_VIEW`) && nombreModulo === 'roles' ||
                         permisosDelRol.has(`ORG_VIEW`) && nombreModulo === 'organizaciones'
        }
      };
    });

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
