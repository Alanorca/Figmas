const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Obtener todos los usuarios
const getUsuarios = async (req, res) => {
  try {
    const { estado, rol, departamento, busqueda } = req.query;

    const where = {};

    if (estado) where.estado = estado;
    if (departamento) where.departamento = { contains: departamento };
    if (busqueda) {
      where.OR = [
        { nombre: { contains: busqueda } },
        { apellido: { contains: busqueda } },
        { email: { contains: busqueda } }
      ];
    }

    const usuarios = await prisma.usuario.findMany({
      where,
      include: {
        roles: {
          include: {
            rol: {
              include: {
                permisos: {
                  include: {
                    permiso: true
                  }
                }
              }
            }
          }
        },
        activosAcceso: {
          include: {
            activo: true
          }
        }
      },
      orderBy: { fechaCreacion: 'desc' }
    });

    // Transformar respuesta
    const usuariosFormateados = usuarios.map(u => ({
      id: u.id,
      nombre: u.nombre,
      apellido: u.apellido,
      email: u.email,
      telefono: u.telefono,
      avatar: u.avatar,
      estado: u.estado,
      departamento: u.departamento,
      cargo: u.cargo,
      region: u.region,
      fechaCreacion: u.fechaCreacion,
      fechaExpiracion: u.fechaExpiracion,
      ultimoAcceso: u.ultimoAcceso,
      roles: u.roles.map(ur => ur.rol.id),
      rolesDetalle: u.roles.map(ur => ur.rol),
      activosAcceso: u.activosAcceso.map(ua => ua.activoId),
      configuracionSeguridad: {
        autenticacionDosFactor: u.autenticacionDosFactor,
        cambioPasswordRequerido: u.cambioPasswordRequerido,
        sesionesActivas: u.sesionesActivas,
        maxSesionesPermitidas: u.maxSesionesPermitidas,
        ultimoCambioPassword: u.ultimoCambioPassword,
        intentosFallidos: u.intentosFallidos
      }
    }));

    res.json(usuariosFormateados);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Obtener un usuario por ID
const getUsuarioById = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await prisma.usuario.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            rol: {
              include: {
                permisos: {
                  include: {
                    permiso: true
                  }
                }
              }
            }
          }
        },
        activosAcceso: {
          include: {
            activo: true
          }
        }
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: true, message: 'Usuario no encontrado' });
    }

    const usuarioFormateado = {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      telefono: usuario.telefono,
      avatar: usuario.avatar,
      estado: usuario.estado,
      departamento: usuario.departamento,
      cargo: usuario.cargo,
      region: usuario.region,
      fechaCreacion: usuario.fechaCreacion,
      fechaExpiracion: usuario.fechaExpiracion,
      ultimoAcceso: usuario.ultimoAcceso,
      roles: usuario.roles.map(ur => ur.rol.id),
      rolesDetalle: usuario.roles.map(ur => ur.rol),
      activosAcceso: usuario.activosAcceso.map(ua => ua.activoId),
      configuracionSeguridad: {
        autenticacionDosFactor: usuario.autenticacionDosFactor,
        cambioPasswordRequerido: usuario.cambioPasswordRequerido,
        sesionesActivas: usuario.sesionesActivas,
        maxSesionesPermitidas: usuario.maxSesionesPermitidas,
        ultimoCambioPassword: usuario.ultimoCambioPassword,
        intentosFallidos: usuario.intentosFallidos
      }
    };

    res.json(usuarioFormateado);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Crear usuario
const createUsuario = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      email,
      telefono,
      departamento,
      cargo,
      estado,
      region,
      fechaExpiracion,
      rolesAsignados,
      activosSeleccionados,
      autenticacionDosFactor,
      cambioPasswordRequerido
    } = req.body;

    // Verificar si el email ya existe
    const existente = await prisma.usuario.findUnique({ where: { email } });
    if (existente) {
      return res.status(400).json({ error: true, message: 'El email ya está registrado' });
    }

    // Crear usuario
    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        apellido,
        email,
        telefono,
        departamento,
        cargo,
        estado: estado || 'pendiente',
        region: region || 'MX',
        fechaExpiracion: fechaExpiracion ? new Date(fechaExpiracion) : null,
        autenticacionDosFactor: autenticacionDosFactor || false,
        cambioPasswordRequerido: cambioPasswordRequerido !== false,
        password: await bcrypt.hash('temporal123', 10)
      }
    });

    // Asignar roles
    if (rolesAsignados && rolesAsignados.length > 0) {
      await prisma.usuarioRol.createMany({
        data: rolesAsignados.map(rolId => ({
          usuarioId: usuario.id,
          rolId
        }))
      });
    }

    // Asignar activos
    if (activosSeleccionados && activosSeleccionados.length > 0) {
      await prisma.usuarioActivo.createMany({
        data: activosSeleccionados.map(activoId => ({
          usuarioId: usuario.id,
          activoId
        }))
      });
    }

    // Obtener usuario completo
    const usuarioCompleto = await prisma.usuario.findUnique({
      where: { id: usuario.id },
      include: {
        roles: { include: { rol: true } },
        activosAcceso: { include: { activo: true } }
      }
    });

    res.status(201).json({
      ...usuarioCompleto,
      roles: usuarioCompleto.roles.map(ur => ur.rol.id),
      rolesDetalle: usuarioCompleto.roles.map(ur => ur.rol)
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Actualizar usuario
const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      apellido,
      email,
      telefono,
      departamento,
      cargo,
      estado,
      region,
      fechaExpiracion,
      rolesAsignados,
      activosSeleccionados,
      autenticacionDosFactor,
      cambioPasswordRequerido
    } = req.body;

    // Verificar que el usuario existe
    const existente = await prisma.usuario.findUnique({ where: { id } });
    if (!existente) {
      return res.status(404).json({ error: true, message: 'Usuario no encontrado' });
    }

    // Actualizar usuario
    const usuario = await prisma.usuario.update({
      where: { id },
      data: {
        nombre,
        apellido,
        email,
        telefono,
        departamento,
        cargo,
        estado,
        region,
        fechaExpiracion: fechaExpiracion ? new Date(fechaExpiracion) : null,
        autenticacionDosFactor,
        cambioPasswordRequerido
      }
    });

    // Actualizar roles si se proporcionaron
    if (rolesAsignados !== undefined) {
      // Eliminar roles actuales
      await prisma.usuarioRol.deleteMany({ where: { usuarioId: id } });
      // Asignar nuevos roles
      if (rolesAsignados.length > 0) {
        await prisma.usuarioRol.createMany({
          data: rolesAsignados.map(rolId => ({
            usuarioId: id,
            rolId
          }))
        });
      }
    }

    // Actualizar activos si se proporcionaron
    if (activosSeleccionados !== undefined) {
      await prisma.usuarioActivo.deleteMany({ where: { usuarioId: id } });
      if (activosSeleccionados.length > 0) {
        await prisma.usuarioActivo.createMany({
          data: activosSeleccionados.map(activoId => ({
            usuarioId: id,
            activoId
          }))
        });
      }
    }

    // Obtener usuario actualizado
    const usuarioActualizado = await prisma.usuario.findUnique({
      where: { id },
      include: {
        roles: { include: { rol: true } },
        activosAcceso: { include: { activo: true } }
      }
    });

    res.json({
      ...usuarioActualizado,
      roles: usuarioActualizado.roles.map(ur => ur.rol.id),
      rolesDetalle: usuarioActualizado.roles.map(ur => ur.rol)
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Eliminar usuario
const deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const existente = await prisma.usuario.findUnique({ where: { id } });
    if (!existente) {
      return res.status(404).json({ error: true, message: 'Usuario no encontrado' });
    }

    await prisma.usuario.delete({ where: { id } });

    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Cambiar estado de usuario
const cambiarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const usuario = await prisma.usuario.update({
      where: { id },
      data: { estado }
    });

    res.json(usuario);
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Asignar rol a usuario
const asignarRol = async (req, res) => {
  try {
    const { id } = req.params;
    const { rolId } = req.body;

    // Verificar si ya tiene el rol
    const existente = await prisma.usuarioRol.findUnique({
      where: { usuarioId_rolId: { usuarioId: id, rolId } }
    });

    if (existente) {
      return res.status(400).json({ error: true, message: 'El usuario ya tiene este rol' });
    }

    await prisma.usuarioRol.create({
      data: { usuarioId: id, rolId }
    });

    res.json({ message: 'Rol asignado exitosamente' });
  } catch (error) {
    console.error('Error al asignar rol:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Remover rol de usuario
const removerRol = async (req, res) => {
  try {
    const { id, rolId } = req.params;

    await prisma.usuarioRol.delete({
      where: { usuarioId_rolId: { usuarioId: id, rolId } }
    });

    res.json({ message: 'Rol removido exitosamente' });
  } catch (error) {
    console.error('Error al remover rol:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

module.exports = {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  cambiarEstado,
  asignarRol,
  removerRol
};
