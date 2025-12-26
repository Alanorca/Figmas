const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ==================== ORGANIGRAMAS ====================

const getOrganigramas = async (req, res) => {
  try {
    const organigramas = await prisma.organigrama.findMany({
      include: {
        nodos: {
          where: { padreId: null }, // Solo nodos raíz
          include: {
            subordinados: {
              include: {
                subordinados: {
                  include: {
                    subordinados: true // Hasta 3 niveles de anidación
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { fechaCreacion: 'desc' }
    });

    // Transformar para tener estructura de árbol
    const result = organigramas.map(org => ({
      ...org,
      raiz: org.nodos[0] || null
    }));

    res.json(result);
  } catch (error) {
    console.error('Error al obtener organigramas:', error);
    res.status(500).json({ error: 'Error al obtener organigramas' });
  }
};

const getOrganigramaById = async (req, res) => {
  try {
    const { id } = req.params;

    const organigrama = await prisma.organigrama.findUnique({
      where: { id },
      include: {
        nodos: true
      }
    });

    if (!organigrama) {
      return res.status(404).json({ error: 'Organigrama no encontrado' });
    }

    // Construir árbol desde los nodos
    const buildTree = (nodos, padreId = null) => {
      return nodos
        .filter(n => n.padreId === padreId)
        .map(n => ({
          ...n,
          subordinados: buildTree(nodos, n.id)
        }));
    };

    const arbol = buildTree(organigrama.nodos);

    res.json({
      ...organigrama,
      raiz: arbol[0] || null
    });
  } catch (error) {
    console.error('Error al obtener organigrama:', error);
    res.status(500).json({ error: 'Error al obtener organigrama' });
  }
};

const createOrganigrama = async (req, res) => {
  try {
    const { nombre, descripcion, raiz } = req.body;

    const organigrama = await prisma.organigrama.create({
      data: {
        nombre,
        descripcion
      }
    });

    // Crear nodos recursivamente
    if (raiz) {
      await createNodoRecursivo(organigrama.id, raiz, null);
    }

    // Obtener organigrama completo
    const orgCompleto = await prisma.organigrama.findUnique({
      where: { id: organigrama.id },
      include: { nodos: true }
    });

    res.status(201).json(orgCompleto);
  } catch (error) {
    console.error('Error al crear organigrama:', error);
    res.status(500).json({ error: 'Error al crear organigrama' });
  }
};

const createNodoRecursivo = async (organigramaId, nodo, padreId) => {
  const nuevoNodo = await prisma.nodoOrganigrama.create({
    data: {
      organigramaId,
      nombre: nodo.nombre,
      cargo: nodo.cargo,
      departamento: nodo.departamento,
      email: nodo.email,
      telefono: nodo.telefono,
      foto: nodo.foto,
      padreId
    }
  });

  if (nodo.subordinados && nodo.subordinados.length > 0) {
    for (const sub of nodo.subordinados) {
      await createNodoRecursivo(organigramaId, sub, nuevoNodo.id);
    }
  }

  return nuevoNodo;
};

const updateOrganigrama = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, raiz } = req.body;

    const organigrama = await prisma.organigrama.update({
      where: { id },
      data: { nombre, descripcion }
    });

    // Si se envía nuevo árbol, reconstruir
    if (raiz) {
      await prisma.nodoOrganigrama.deleteMany({
        where: { organigramaId: id }
      });
      await createNodoRecursivo(id, raiz, null);
    }

    const orgCompleto = await prisma.organigrama.findUnique({
      where: { id },
      include: { nodos: true }
    });

    res.json(orgCompleto);
  } catch (error) {
    console.error('Error al actualizar organigrama:', error);
    res.status(500).json({ error: 'Error al actualizar organigrama' });
  }
};

const deleteOrganigrama = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.organigrama.delete({ where: { id } });
    res.json({ message: 'Organigrama eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar organigrama:', error);
    res.status(500).json({ error: 'Error al eliminar organigrama' });
  }
};

// ==================== NODOS INDIVIDUALES ====================

const addNodo = async (req, res) => {
  try {
    const { organigramaId, padreId, nombre, cargo, departamento, email, telefono, foto } = req.body;

    const nodo = await prisma.nodoOrganigrama.create({
      data: {
        organigramaId,
        padreId,
        nombre,
        cargo,
        departamento,
        email,
        telefono,
        foto
      }
    });

    res.status(201).json(nodo);
  } catch (error) {
    console.error('Error al agregar nodo:', error);
    res.status(500).json({ error: 'Error al agregar nodo' });
  }
};

const updateNodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, cargo, departamento, email, telefono, foto, padreId } = req.body;

    const nodo = await prisma.nodoOrganigrama.update({
      where: { id },
      data: { nombre, cargo, departamento, email, telefono, foto, padreId }
    });

    res.json(nodo);
  } catch (error) {
    console.error('Error al actualizar nodo:', error);
    res.status(500).json({ error: 'Error al actualizar nodo' });
  }
};

const deleteNodo = async (req, res) => {
  try {
    const { id } = req.params;

    // Eliminar también subordinados
    const deleteRecursive = async (nodoId) => {
      const subordinados = await prisma.nodoOrganigrama.findMany({
        where: { padreId: nodoId }
      });

      for (const sub of subordinados) {
        await deleteRecursive(sub.id);
      }

      await prisma.nodoOrganigrama.delete({ where: { id: nodoId } });
    };

    await deleteRecursive(id);

    res.json({ message: 'Nodo eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar nodo:', error);
    res.status(500).json({ error: 'Error al eliminar nodo' });
  }
};

module.exports = {
  getOrganigramas,
  getOrganigramaById,
  createOrganigrama,
  updateOrganigrama,
  deleteOrganigrama,
  addNodo,
  updateNodo,
  deleteNodo
};
