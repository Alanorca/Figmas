const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Obtener todos los activos (árbol)
const getActivos = async (req, res) => {
  try {
    // Obtener activos raíz (sin padre)
    const activosRaiz = await prisma.activo.findMany({
      where: { padreId: null },
      include: {
        hijos: {
          include: {
            hijos: {
              include: {
                hijos: true
              }
            }
          }
        }
      }
    });

    res.json(activosRaiz);
  } catch (error) {
    console.error('Error al obtener activos:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Obtener activo por ID
const getActivoById = async (req, res) => {
  try {
    const { id } = req.params;

    const activo = await prisma.activo.findUnique({
      where: { id },
      include: {
        hijos: true,
        padre: true,
        usuarios: {
          include: {
            usuario: true
          }
        }
      }
    });

    if (!activo) {
      return res.status(404).json({ error: true, message: 'Activo no encontrado' });
    }

    res.json(activo);
  } catch (error) {
    console.error('Error al obtener activo:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

module.exports = {
  getActivos,
  getActivoById
};
