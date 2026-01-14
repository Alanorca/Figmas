const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Estadísticas de usuarios
const getEstadisticasUsuarios = async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: {
        roles: true
      }
    });

    const estadisticas = {
      total: usuarios.length,
      activos: usuarios.filter(u => u.estado === 'activo').length,
      inactivos: usuarios.filter(u => u.estado === 'inactivo').length,
      pendientes: usuarios.filter(u => u.estado === 'pendiente').length,
      bloqueados: usuarios.filter(u => u.estado === 'bloqueado').length,
      conDosFactor: usuarios.filter(u => u.autenticacionDosFactor).length,
      sinRoles: usuarios.filter(u => u.roles.length === 0).length
    };

    res.json(estadisticas);
  } catch (error) {
    console.error('Error al obtener estadísticas de usuarios:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Estadísticas de roles
const getEstadisticasRoles = async (req, res) => {
  try {
    const roles = await prisma.rol.findMany({
      include: {
        usuarios: true
      }
    });

    const totalUsuariosConRol = roles.reduce((acc, rol) => acc + rol.usuarios.length, 0);

    const estadisticas = {
      total: roles.length,
      activos: roles.filter(r => r.activo).length,
      inactivos: roles.filter(r => !r.activo).length,
      rolesSistema: roles.filter(r => r.esRolSistema).length,
      rolesPersonalizados: roles.filter(r => !r.esRolSistema).length,
      promedioUsuariosPorRol: roles.length > 0 ? Math.round(totalUsuariosConRol / roles.length) : 0
    };

    res.json(estadisticas);
  } catch (error) {
    console.error('Error al obtener estadísticas de roles:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Dashboard general
const getDashboard = async (req, res) => {
  try {
    const [usuarios, roles, permisos] = await Promise.all([
      prisma.usuario.count(),
      prisma.rol.count(),
      prisma.permiso.count()
    ]);

    const usuariosActivos = await prisma.usuario.count({
      where: { estado: 'activo' }
    });

    const rolesActivos = await prisma.rol.count({
      where: { activo: true }
    });

    // Últimos usuarios registrados
    const ultimosUsuarios = await prisma.usuario.findMany({
      take: 5,
      orderBy: { fechaCreacion: 'desc' },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        estado: true,
        fechaCreacion: true
      }
    });

    res.json({
      totales: {
        usuarios,
        roles,
        permisos
      },
      activos: {
        usuarios: usuariosActivos,
        roles: rolesActivos
      },
      ultimosUsuarios
    });
  } catch (error) {
    console.error('Error al obtener dashboard:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

module.exports = {
  getEstadisticasUsuarios,
  getEstadisticasRoles,
  getDashboard
};
