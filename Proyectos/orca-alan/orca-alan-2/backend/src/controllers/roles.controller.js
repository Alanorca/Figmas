const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Obtener todos los roles
const getRoles = async (req, res) => {
  try {
    const { nivelAcceso, activo, busqueda } = req.query;

    const where = {};

    if (nivelAcceso) where.nivelAcceso = nivelAcceso;
    if (activo !== undefined) where.activo = activo === 'true';
    if (busqueda) {
      where.OR = [
        { nombre: { contains: busqueda } },
        { descripcion: { contains: busqueda } }
      ];
    }

    const roles = await prisma.rol.findMany({
      where,
      include: {
        usuarios: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                email: true,
                estado: true,
                avatar: true
              }
            }
          }
        },
        permisos: {
          include: {
            permiso: true
          }
        }
      },
      orderBy: { fechaCreacion: 'asc' }
    });

    // Transformar respuesta
    const rolesFormateados = roles.map(r => ({
      id: r.id,
      nombre: r.nombre,
      descripcion: r.descripcion,
      nivelAcceso: r.nivelAcceso,
      region: r.region,
      tipoArbol: r.tipoArbol,
      color: r.color,
      icono: r.icono,
      activo: r.activo,
      esRolSistema: r.esRolSistema,
      fechaCreacion: r.fechaCreacion,
      fechaModificacion: r.fechaModificacion,
      permisos: r.permisos.map(rp => rp.permiso.id),
      permisosDetalle: r.permisos.map(rp => rp.permiso),
      usuariosAsignados: r.usuarios.map(ur => ur.usuario.id),
      usuariosDetalle: r.usuarios.map(ur => ur.usuario)
    }));

    res.json(rolesFormateados);
  } catch (error) {
    console.error('Error al obtener roles:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Obtener un rol por ID
const getRolById = async (req, res) => {
  try {
    const { id } = req.params;

    const rol = await prisma.rol.findUnique({
      where: { id },
      include: {
        usuarios: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                email: true,
                estado: true,
                avatar: true,
                departamento: true,
                cargo: true
              }
            }
          }
        },
        permisos: {
          include: {
            permiso: true
          }
        }
      }
    });

    if (!rol) {
      return res.status(404).json({ error: true, message: 'Rol no encontrado' });
    }

    const rolFormateado = {
      id: rol.id,
      nombre: rol.nombre,
      descripcion: rol.descripcion,
      nivelAcceso: rol.nivelAcceso,
      region: rol.region,
      tipoArbol: rol.tipoArbol,
      color: rol.color,
      icono: rol.icono,
      activo: rol.activo,
      esRolSistema: rol.esRolSistema,
      fechaCreacion: rol.fechaCreacion,
      fechaModificacion: rol.fechaModificacion,
      permisos: rol.permisos.map(rp => rp.permiso.id),
      permisosDetalle: rol.permisos.map(rp => rp.permiso),
      usuariosAsignados: rol.usuarios.map(ur => ur.usuario.id),
      usuariosDetalle: rol.usuarios.map(ur => ur.usuario)
    };

    res.json(rolFormateado);
  } catch (error) {
    console.error('Error al obtener rol:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Crear rol
const createRol = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      nivelAcceso,
      region,
      tipoArbol,
      color,
      icono,
      activo,
      permisosSeleccionados
    } = req.body;

    // Verificar si el nombre ya existe
    const existente = await prisma.rol.findUnique({ where: { nombre } });
    if (existente) {
      return res.status(400).json({ error: true, message: 'Ya existe un rol con ese nombre' });
    }

    // Crear rol
    const rol = await prisma.rol.create({
      data: {
        nombre,
        descripcion,
        nivelAcceso: nivelAcceso || 'lectura',
        region: region || 'MX',
        tipoArbol: tipoArbol || 'activos',
        color,
        icono,
        activo: activo !== false
      }
    });

    // Asignar permisos
    if (permisosSeleccionados && permisosSeleccionados.length > 0) {
      await prisma.rolPermiso.createMany({
        data: permisosSeleccionados.map(permisoId => ({
          rolId: rol.id,
          permisoId
        }))
      });
    }

    // Obtener rol completo
    const rolCompleto = await prisma.rol.findUnique({
      where: { id: rol.id },
      include: {
        permisos: { include: { permiso: true } },
        usuarios: { include: { usuario: true } }
      }
    });

    res.status(201).json({
      ...rolCompleto,
      permisos: rolCompleto.permisos.map(rp => rp.permiso.id),
      permisosDetalle: rolCompleto.permisos.map(rp => rp.permiso),
      usuariosAsignados: [],
      usuariosDetalle: []
    });
  } catch (error) {
    console.error('Error al crear rol:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Actualizar rol
const updateRol = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      descripcion,
      nivelAcceso,
      region,
      tipoArbol,
      color,
      icono,
      activo,
      permisosSeleccionados
    } = req.body;

    // Verificar que el rol existe
    const existente = await prisma.rol.findUnique({ where: { id } });
    if (!existente) {
      return res.status(404).json({ error: true, message: 'Rol no encontrado' });
    }

    // No permitir modificar roles del sistema (excepto permisos)
    if (existente.esRolSistema && (nombre !== existente.nombre || descripcion !== existente.descripcion)) {
      return res.status(400).json({ error: true, message: 'No se puede modificar roles del sistema' });
    }

    // Actualizar rol
    const rol = await prisma.rol.update({
      where: { id },
      data: {
        nombre,
        descripcion,
        nivelAcceso,
        region,
        tipoArbol,
        color,
        icono,
        activo
      }
    });

    // Actualizar permisos si se proporcionaron
    if (permisosSeleccionados !== undefined) {
      await prisma.rolPermiso.deleteMany({ where: { rolId: id } });
      if (permisosSeleccionados.length > 0) {
        await prisma.rolPermiso.createMany({
          data: permisosSeleccionados.map(permisoId => ({
            rolId: id,
            permisoId
          }))
        });
      }
    }

    // Obtener rol actualizado
    const rolActualizado = await prisma.rol.findUnique({
      where: { id },
      include: {
        permisos: { include: { permiso: true } },
        usuarios: { include: { usuario: true } }
      }
    });

    res.json({
      ...rolActualizado,
      permisos: rolActualizado.permisos.map(rp => rp.permiso.id),
      permisosDetalle: rolActualizado.permisos.map(rp => rp.permiso),
      usuariosAsignados: rolActualizado.usuarios.map(ur => ur.usuario.id),
      usuariosDetalle: rolActualizado.usuarios.map(ur => ur.usuario)
    });
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Eliminar rol
const deleteRol = async (req, res) => {
  try {
    const { id } = req.params;

    const existente = await prisma.rol.findUnique({ where: { id } });
    if (!existente) {
      return res.status(404).json({ error: true, message: 'Rol no encontrado' });
    }

    if (existente.esRolSistema) {
      return res.status(400).json({ error: true, message: 'No se puede eliminar roles del sistema' });
    }

    await prisma.rol.delete({ where: { id } });

    res.json({ message: 'Rol eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar rol:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Duplicar rol
const duplicarRol = async (req, res) => {
  try {
    const { id } = req.params;

    const original = await prisma.rol.findUnique({
      where: { id },
      include: {
        permisos: true
      }
    });

    if (!original) {
      return res.status(404).json({ error: true, message: 'Rol no encontrado' });
    }

    // Generar nombre único
    let nuevoNombre = `${original.nombre} (Copia)`;
    let contador = 1;
    while (await prisma.rol.findUnique({ where: { nombre: nuevoNombre } })) {
      nuevoNombre = `${original.nombre} (Copia ${contador})`;
      contador++;
    }

    // Crear copia
    const copia = await prisma.rol.create({
      data: {
        nombre: nuevoNombre,
        descripcion: original.descripcion,
        nivelAcceso: original.nivelAcceso,
        region: original.region,
        tipoArbol: original.tipoArbol,
        color: original.color,
        icono: original.icono,
        activo: original.activo,
        esRolSistema: false
      }
    });

    // Copiar permisos
    if (original.permisos.length > 0) {
      await prisma.rolPermiso.createMany({
        data: original.permisos.map(rp => ({
          rolId: copia.id,
          permisoId: rp.permisoId
        }))
      });
    }

    // Obtener rol completo
    const rolCompleto = await prisma.rol.findUnique({
      where: { id: copia.id },
      include: {
        permisos: { include: { permiso: true } }
      }
    });

    res.status(201).json({
      ...rolCompleto,
      permisos: rolCompleto.permisos.map(rp => rp.permiso.id),
      permisosDetalle: rolCompleto.permisos.map(rp => rp.permiso),
      usuariosAsignados: [],
      usuariosDetalle: []
    });
  } catch (error) {
    console.error('Error al duplicar rol:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Obtener usuarios de un rol
const getUsuariosDeRol = async (req, res) => {
  try {
    const { id } = req.params;

    const usuarios = await prisma.usuarioRol.findMany({
      where: { rolId: id },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            estado: true,
            avatar: true,
            departamento: true,
            cargo: true
          }
        }
      }
    });

    res.json(usuarios.map(ur => ur.usuario));
  } catch (error) {
    console.error('Error al obtener usuarios del rol:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Obtener permisos de un rol (agrupados por módulo)
const getPermisosDeRol = async (req, res) => {
  try {
    const { id } = req.params;

    const rolPermisos = await prisma.rolPermiso.findMany({
      where: { rolId: id },
      include: {
        permiso: true
      }
    });

    // Agrupar por módulo
    const permisosPorModulo = {};
    rolPermisos.forEach(rp => {
      const modulo = rp.permiso.modulo;
      if (!permisosPorModulo[modulo]) {
        permisosPorModulo[modulo] = {
          modulo,
          permisos: []
        };
      }
      permisosPorModulo[modulo].permisos.push(rp.permiso);
    });

    res.json(Object.values(permisosPorModulo));
  } catch (error) {
    console.error('Error al obtener permisos del rol:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

module.exports = {
  getRoles,
  getRolById,
  createRol,
  updateRol,
  deleteRol,
  duplicarRol,
  getUsuariosDeRol,
  getPermisosDeRol
};
