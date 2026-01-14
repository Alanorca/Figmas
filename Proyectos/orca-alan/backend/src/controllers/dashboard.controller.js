const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ==================== DASHBOARD CONFIGS ====================

const getDashboardConfigs = async (req, res) => {
  try {
    const configs = await prisma.dashboardConfig.findMany({
      include: { widgets: true },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(configs.map(c => ({
      ...c,
      widgets: c.widgets.map(w => ({
        ...w,
        config: JSON.parse(w.config || '{}')
      }))
    })));
  } catch (error) {
    console.error('Error al obtener configuraciones de dashboard:', error);
    res.status(500).json({ error: 'Error al obtener configuraciones' });
  }
};

const getDashboardDefault = async (req, res) => {
  try {
    let config = await prisma.dashboardConfig.findFirst({
      where: { isDefault: true },
      include: { widgets: true }
    });

    // Si no hay default, crear uno
    if (!config) {
      config = await prisma.dashboardConfig.create({
        data: {
          nombre: 'Dashboard Principal',
          descripcion: 'Dashboard por defecto',
          isDefault: true,
          columns: 12,
          rowHeight: 50,
          gap: 10
        },
        include: { widgets: true }
      });
    }

    res.json({
      ...config,
      widgets: config.widgets.map(w => ({
        ...w,
        config: JSON.parse(w.config || '{}')
      }))
    });
  } catch (error) {
    console.error('Error al obtener dashboard default:', error);
    res.status(500).json({ error: 'Error al obtener dashboard' });
  }
};

const getDashboardById = async (req, res) => {
  try {
    const { id } = req.params;

    const config = await prisma.dashboardConfig.findUnique({
      where: { id },
      include: { widgets: true }
    });

    if (!config) {
      return res.status(404).json({ error: 'Dashboard no encontrado' });
    }

    res.json({
      ...config,
      widgets: config.widgets.map(w => ({
        ...w,
        config: JSON.parse(w.config || '{}')
      }))
    });
  } catch (error) {
    console.error('Error al obtener dashboard:', error);
    res.status(500).json({ error: 'Error al obtener dashboard' });
  }
};

const createDashboardConfig = async (req, res) => {
  try {
    const { nombre, descripcion, isDefault, isLocked, columns, rowHeight, gap, widgets, createdBy } = req.body;

    // Si es default, quitar default de otros
    if (isDefault) {
      await prisma.dashboardConfig.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      });
    }

    const config = await prisma.dashboardConfig.create({
      data: {
        nombre,
        descripcion,
        isDefault: isDefault || false,
        isLocked: isLocked || false,
        columns: columns || 12,
        rowHeight: rowHeight || 50,
        gap: gap || 10,
        createdBy,
        widgets: {
          create: (widgets || []).map(w => ({
            tipo: w.tipo,
            titulo: w.titulo,
            subtitulo: w.subtitulo,
            icono: w.icono,
            config: JSON.stringify(w.config || {}),
            x: w.x || 0,
            y: w.y || 0,
            cols: w.cols || 3,
            rows: w.rows || 2,
            canResize: w.canResize !== false,
            canDrag: w.canDrag !== false,
            canRemove: w.canRemove !== false,
            canEdit: w.canEdit !== false
          }))
        }
      },
      include: { widgets: true }
    });

    res.status(201).json(config);
  } catch (error) {
    console.error('Error al crear dashboard:', error);
    res.status(500).json({ error: 'Error al crear dashboard' });
  }
};

const updateDashboardConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, isDefault, isLocked, columns, rowHeight, gap } = req.body;

    // Si es default, quitar default de otros
    if (isDefault) {
      await prisma.dashboardConfig.updateMany({
        where: { isDefault: true, id: { not: id } },
        data: { isDefault: false }
      });
    }

    const config = await prisma.dashboardConfig.update({
      where: { id },
      data: { nombre, descripcion, isDefault, isLocked, columns, rowHeight, gap },
      include: { widgets: true }
    });

    res.json(config);
  } catch (error) {
    console.error('Error al actualizar dashboard:', error);
    res.status(500).json({ error: 'Error al actualizar dashboard' });
  }
};

const deleteDashboardConfig = async (req, res) => {
  try {
    const { id } = req.params;

    const config = await prisma.dashboardConfig.findUnique({ where: { id } });
    if (config?.isLocked) {
      return res.status(403).json({ error: 'No se puede eliminar un dashboard bloqueado' });
    }

    await prisma.dashboardConfig.delete({ where: { id } });
    res.json({ message: 'Dashboard eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar dashboard:', error);
    res.status(500).json({ error: 'Error al eliminar dashboard' });
  }
};

// ==================== WIDGETS ====================

const addWidget = async (req, res) => {
  try {
    const { dashboardId, tipo, titulo, subtitulo, icono, config, x, y, cols, rows } = req.body;

    const widget = await prisma.dashboardWidget.create({
      data: {
        dashboardId,
        tipo,
        titulo,
        subtitulo,
        icono,
        config: JSON.stringify(config || {}),
        x: x || 0,
        y: y || 0,
        cols: cols || 3,
        rows: rows || 2
      }
    });

    res.status(201).json({
      ...widget,
      config: JSON.parse(widget.config)
    });
  } catch (error) {
    console.error('Error al agregar widget:', error);
    res.status(500).json({ error: 'Error al agregar widget' });
  }
};

const updateWidget = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo, titulo, subtitulo, icono, config, x, y, cols, rows, canResize, canDrag, canRemove, canEdit } = req.body;

    const widget = await prisma.dashboardWidget.update({
      where: { id },
      data: {
        tipo,
        titulo,
        subtitulo,
        icono,
        config: config ? JSON.stringify(config) : undefined,
        x,
        y,
        cols,
        rows,
        canResize,
        canDrag,
        canRemove,
        canEdit
      }
    });

    res.json({
      ...widget,
      config: JSON.parse(widget.config)
    });
  } catch (error) {
    console.error('Error al actualizar widget:', error);
    res.status(500).json({ error: 'Error al actualizar widget' });
  }
};

const updateWidgetsLayout = async (req, res) => {
  try {
    const { dashboardId, widgets } = req.body;

    // Actualizar posiciones de todos los widgets
    for (const w of widgets) {
      await prisma.dashboardWidget.update({
        where: { id: w.id },
        data: {
          x: w.x,
          y: w.y,
          cols: w.cols,
          rows: w.rows
        }
      });
    }

    res.json({ message: 'Layout actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar layout:', error);
    res.status(500).json({ error: 'Error al actualizar layout' });
  }
};

const deleteWidget = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.dashboardWidget.delete({ where: { id } });
    res.json({ message: 'Widget eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar widget:', error);
    res.status(500).json({ error: 'Error al eliminar widget' });
  }
};

module.exports = {
  getDashboardConfigs,
  getDashboardDefault,
  getDashboardById,
  createDashboardConfig,
  updateDashboardConfig,
  deleteDashboardConfig,
  addWidget,
  updateWidget,
  updateWidgetsLayout,
  deleteWidget
};
