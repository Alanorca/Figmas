const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ============================================================
// NOTIFICATION RULES - Reglas de notificación por eventos
// ============================================================

const getNotificationRules = async (req, res) => {
  try {
    const { entidadTipo, eventoTipo, activo } = req.query;

    const where = {};
    if (entidadTipo) where.entidadTipo = entidadTipo;
    if (eventoTipo) where.eventoTipo = eventoTipo;
    if (activo !== undefined) where.activo = activo === 'true';

    const rules = await prisma.notificationRule.findMany({
      where,
      orderBy: { fechaCreacion: 'desc' }
    });

    // Parse JSON fields
    const parsedRules = rules.map(rule => ({
      ...rule,
      rolesDestino: rule.rolesDestino ? JSON.parse(rule.rolesDestino) : [],
      usuariosDestino: rule.usuariosDestino ? JSON.parse(rule.usuariosDestino) : []
    }));

    res.json(parsedRules);
  } catch (error) {
    console.error('Error al obtener reglas de notificación:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const getNotificationRuleById = async (req, res) => {
  try {
    const { id } = req.params;

    const rule = await prisma.notificationRule.findUnique({
      where: { id }
    });

    if (!rule) {
      return res.status(404).json({ error: true, message: 'Regla no encontrada' });
    }

    res.json({
      ...rule,
      rolesDestino: rule.rolesDestino ? JSON.parse(rule.rolesDestino) : [],
      usuariosDestino: rule.usuariosDestino ? JSON.parse(rule.usuariosDestino) : []
    });
  } catch (error) {
    console.error('Error al obtener regla:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const createNotificationRule = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      entidadTipo,
      eventoTipo,
      activo = true,
      notificarCreador = false,
      notificarResponsable = true,
      notificarAprobadores = false,
      rolesDestino = [],
      usuariosDestino = [],
      enviarInApp = true,
      enviarEmail = false,
      plantillaMensaje,
      severidad = 'info'
    } = req.body;

    const rule = await prisma.notificationRule.create({
      data: {
        nombre,
        descripcion,
        entidadTipo,
        eventoTipo,
        activo,
        notificarCreador,
        notificarResponsable,
        notificarAprobadores,
        rolesDestino: JSON.stringify(rolesDestino),
        usuariosDestino: JSON.stringify(usuariosDestino),
        enviarInApp,
        enviarEmail,
        plantillaMensaje,
        severidad
      }
    });

    res.status(201).json({
      ...rule,
      rolesDestino,
      usuariosDestino
    });
  } catch (error) {
    console.error('Error al crear regla:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const updateNotificationRule = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    // Stringify JSON fields if present
    if (data.rolesDestino) data.rolesDestino = JSON.stringify(data.rolesDestino);
    if (data.usuariosDestino) data.usuariosDestino = JSON.stringify(data.usuariosDestino);

    const rule = await prisma.notificationRule.update({
      where: { id },
      data
    });

    res.json({
      ...rule,
      rolesDestino: rule.rolesDestino ? JSON.parse(rule.rolesDestino) : [],
      usuariosDestino: rule.usuariosDestino ? JSON.parse(rule.usuariosDestino) : []
    });
  } catch (error) {
    console.error('Error al actualizar regla:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const deleteNotificationRule = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.notificationRule.delete({
      where: { id }
    });

    res.json({ message: 'Regla eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar regla:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// ============================================================
// ALERT RULES - Alertas por umbral
// ============================================================

const getAlertRules = async (req, res) => {
  try {
    const { entidadTipo, activo } = req.query;

    const where = {};
    if (entidadTipo) where.entidadTipo = entidadTipo;
    if (activo !== undefined) where.activo = activo === 'true';

    const alerts = await prisma.alertRule.findMany({
      where,
      orderBy: { fechaCreacion: 'desc' }
    });

    const parsedAlerts = alerts.map(alert => ({
      ...alert,
      rolesDestino: alert.rolesDestino ? JSON.parse(alert.rolesDestino) : [],
      usuariosDestino: alert.usuariosDestino ? JSON.parse(alert.usuariosDestino) : [],
      periodoEvaluacion: alert.periodoEvaluacion ? JSON.parse(alert.periodoEvaluacion) : null
    }));

    res.json(parsedAlerts);
  } catch (error) {
    console.error('Error al obtener alertas:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const createAlertRule = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      entidadTipo,
      entidadId,
      metricaNombre,
      operador,
      valorUmbral,
      tipoAgregacion = 'CURRENT',
      periodoEvaluacion,
      activo = true,
      rolesDestino = [],
      usuariosDestino = [],
      enviarInApp = true,
      enviarEmail = false,
      severidad = 'warning',
      cooldownMinutos = 60
    } = req.body;

    const alert = await prisma.alertRule.create({
      data: {
        nombre,
        descripcion,
        entidadTipo,
        entidadId,
        metricaNombre,
        operador,
        valorUmbral,
        tipoAgregacion,
        periodoEvaluacion: periodoEvaluacion ? JSON.stringify(periodoEvaluacion) : null,
        activo,
        rolesDestino: JSON.stringify(rolesDestino),
        usuariosDestino: JSON.stringify(usuariosDestino),
        enviarInApp,
        enviarEmail,
        severidad,
        cooldownMinutos
      }
    });

    res.status(201).json({
      ...alert,
      rolesDestino,
      usuariosDestino,
      periodoEvaluacion
    });
  } catch (error) {
    console.error('Error al crear alerta:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const updateAlertRule = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    if (data.rolesDestino) data.rolesDestino = JSON.stringify(data.rolesDestino);
    if (data.usuariosDestino) data.usuariosDestino = JSON.stringify(data.usuariosDestino);
    if (data.periodoEvaluacion) data.periodoEvaluacion = JSON.stringify(data.periodoEvaluacion);

    const alert = await prisma.alertRule.update({
      where: { id },
      data
    });

    res.json({
      ...alert,
      rolesDestino: alert.rolesDestino ? JSON.parse(alert.rolesDestino) : [],
      usuariosDestino: alert.usuariosDestino ? JSON.parse(alert.usuariosDestino) : [],
      periodoEvaluacion: alert.periodoEvaluacion ? JSON.parse(alert.periodoEvaluacion) : null
    });
  } catch (error) {
    console.error('Error al actualizar alerta:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const deleteAlertRule = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.alertRule.delete({
      where: { id }
    });

    res.json({ message: 'Alerta eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar alerta:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// ============================================================
// EXPIRATION RULES - Reglas de vencimiento
// ============================================================

const getExpirationRules = async (req, res) => {
  try {
    const { entidadTipo, activo } = req.query;

    const where = {};
    if (entidadTipo) where.entidadTipo = entidadTipo;
    if (activo !== undefined) where.activo = activo === 'true';

    const rules = await prisma.expirationRule.findMany({
      where,
      orderBy: { fechaCreacion: 'desc' }
    });

    const parsedRules = rules.map(rule => ({
      ...rule,
      diasAnticipacion: rule.diasAnticipacion ? JSON.parse(rule.diasAnticipacion) : [],
      diasDespuesVencido: rule.diasDespuesVencido ? JSON.parse(rule.diasDespuesVencido) : [],
      rolesDestino: rule.rolesDestino ? JSON.parse(rule.rolesDestino) : []
    }));

    res.json(parsedRules);
  } catch (error) {
    console.error('Error al obtener reglas de vencimiento:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const createExpirationRule = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      entidadTipo,
      diasAnticipacion = [7, 3, 1],
      diasDespuesVencido = [1, 7],
      activo = true,
      notificarResponsable = true,
      notificarSupervisor = false,
      rolesDestino = [],
      enviarInApp = true,
      enviarEmail = false
    } = req.body;

    const rule = await prisma.expirationRule.create({
      data: {
        nombre,
        descripcion,
        entidadTipo,
        diasAnticipacion: JSON.stringify(diasAnticipacion),
        diasDespuesVencido: JSON.stringify(diasDespuesVencido),
        activo,
        notificarResponsable,
        notificarSupervisor,
        rolesDestino: JSON.stringify(rolesDestino),
        enviarInApp,
        enviarEmail
      }
    });

    res.status(201).json({
      ...rule,
      diasAnticipacion,
      diasDespuesVencido,
      rolesDestino
    });
  } catch (error) {
    console.error('Error al crear regla de vencimiento:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const updateExpirationRule = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    if (data.diasAnticipacion) data.diasAnticipacion = JSON.stringify(data.diasAnticipacion);
    if (data.diasDespuesVencido) data.diasDespuesVencido = JSON.stringify(data.diasDespuesVencido);
    if (data.rolesDestino) data.rolesDestino = JSON.stringify(data.rolesDestino);

    const rule = await prisma.expirationRule.update({
      where: { id },
      data
    });

    res.json({
      ...rule,
      diasAnticipacion: rule.diasAnticipacion ? JSON.parse(rule.diasAnticipacion) : [],
      diasDespuesVencido: rule.diasDespuesVencido ? JSON.parse(rule.diasDespuesVencido) : [],
      rolesDestino: rule.rolesDestino ? JSON.parse(rule.rolesDestino) : []
    });
  } catch (error) {
    console.error('Error al actualizar regla de vencimiento:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const deleteExpirationRule = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.expirationRule.delete({
      where: { id }
    });

    res.json({ message: 'Regla de vencimiento eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar regla de vencimiento:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// ============================================================
// INBOX - Bandeja de notificaciones del usuario
// ============================================================

const getInbox = async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'] || req.query.usuarioId;

    if (!usuarioId) {
      return res.status(400).json({ error: true, message: 'Se requiere X-User-Id header o usuarioId query param' });
    }

    const {
      page = 1,
      limit = 20,
      leida,
      archivada = 'false',
      enSeguimiento,
      tipo,
      entidadTipo,
      severidad,
      desde,
      hasta
    } = req.query;

    const where = { usuarioId };

    if (leida !== undefined && leida !== 'all') where.leida = leida === 'true';
    if (archivada !== undefined) where.archivada = archivada === 'true';
    if (enSeguimiento !== undefined) where.enSeguimiento = enSeguimiento === 'true';
    if (tipo) where.tipo = tipo;
    if (entidadTipo) where.entidadTipo = entidadTipo;
    if (severidad) where.severidad = severidad;
    if (desde || hasta) {
      where.fechaCreacion = {};
      if (desde) where.fechaCreacion.gte = new Date(desde);
      if (hasta) where.fechaCreacion.lte = new Date(hasta);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { fechaCreacion: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.notification.count({ where })
    ]);

    // Parse JSON fields
    const parsedNotifications = notifications.map(n => ({
      ...n,
      acciones: n.acciones ? JSON.parse(n.acciones) : null,
      metadata: n.metadata ? JSON.parse(n.metadata) : null
    }));

    // Stats
    const unread = await prisma.notification.count({
      where: { usuarioId, leida: false, archivada: false }
    });

    const critical = await prisma.notification.count({
      where: { usuarioId, severidad: 'critical', leida: false, archivada: false }
    });

    res.json({
      data: parsedNotifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      },
      stats: {
        unread,
        total,
        critical
      }
    });
  } catch (error) {
    console.error('Error al obtener inbox:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      return res.status(404).json({ error: true, message: 'Notificación no encontrada' });
    }

    res.json({
      ...notification,
      acciones: notification.acciones ? JSON.parse(notification.acciones) : null,
      metadata: notification.metadata ? JSON.parse(notification.metadata) : null
    });
  } catch (error) {
    console.error('Error al obtener notificación:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.notification.update({
      where: { id },
      data: {
        leida: true,
        fechaLeida: new Date()
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error al marcar como leída:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const toggleArchive = async (req, res) => {
  try {
    const { id } = req.params;
    const { archivada } = req.body;

    await prisma.notification.update({
      where: { id },
      data: { archivada }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error al archivar:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const toggleFollow = async (req, res) => {
  try {
    const { id } = req.params;
    const { enSeguimiento } = req.body;

    await prisma.notification.update({
      where: { id },
      data: { enSeguimiento }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error al cambiar seguimiento:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.notification.delete({
      where: { id }
    });

    res.json({ message: 'Notificación eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'] || req.body.usuarioId;

    if (!usuarioId) {
      return res.status(400).json({ error: true, message: 'Se requiere X-User-Id header o usuarioId en body' });
    }

    const result = await prisma.notification.updateMany({
      where: {
        usuarioId,
        leida: false,
        archivada: false
      },
      data: {
        leida: true,
        fechaLeida: new Date()
      }
    });

    res.json({ success: true, count: result.count });
  } catch (error) {
    console.error('Error al marcar todas como leídas:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// ============================================================
// PREFERENCES - Preferencias de usuario
// ============================================================

const getPreferences = async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'] || req.query.usuarioId;

    if (!usuarioId) {
      return res.status(400).json({ error: true, message: 'Se requiere X-User-Id header o usuarioId query param' });
    }

    let preferences = await prisma.userNotificationPreferences.findUnique({
      where: { usuarioId }
    });

    // Si no existen, crear preferencias por defecto
    if (!preferences) {
      preferences = await prisma.userNotificationPreferences.create({
        data: {
          usuarioId,
          habilitado: true,
          emailHabilitado: true,
          inAppHabilitado: true,
          notificarInfo: true,
          notificarWarning: true,
          notificarCritical: true,
          frecuenciaEmail: 'inmediato',
          horaResumen: '09:00'
        }
      });
    }

    res.json({
      ...preferences,
      preferenciasPorEntidad: preferences.preferenciasPorEntidad
        ? JSON.parse(preferences.preferenciasPorEntidad)
        : {}
    });
  } catch (error) {
    console.error('Error al obtener preferencias:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const updatePreferences = async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'] || req.body.usuarioId;

    if (!usuarioId) {
      return res.status(400).json({ error: true, message: 'Se requiere X-User-Id header o usuarioId en body' });
    }

    const data = { ...req.body };
    delete data.usuarioId;

    if (data.preferenciasPorEntidad) {
      data.preferenciasPorEntidad = JSON.stringify(data.preferenciasPorEntidad);
    }

    const preferences = await prisma.userNotificationPreferences.upsert({
      where: { usuarioId },
      update: data,
      create: {
        usuarioId,
        ...data
      }
    });

    res.json({
      ...preferences,
      preferenciasPorEntidad: preferences.preferenciasPorEntidad
        ? JSON.parse(preferences.preferenciasPorEntidad)
        : {}
    });
  } catch (error) {
    console.error('Error al actualizar preferencias:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// ============================================================
// STATS - Estadísticas
// ============================================================

const getStats = async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'] || req.query.usuarioId;

    if (!usuarioId) {
      return res.status(400).json({ error: true, message: 'Se requiere X-User-Id header o usuarioId query param' });
    }

    const [unread, total, info, warning, critical, byType] = await Promise.all([
      prisma.notification.count({
        where: { usuarioId, leida: false, archivada: false }
      }),
      prisma.notification.count({
        where: { usuarioId, archivada: false }
      }),
      prisma.notification.count({
        where: { usuarioId, severidad: 'info', leida: false, archivada: false }
      }),
      prisma.notification.count({
        where: { usuarioId, severidad: 'warning', leida: false, archivada: false }
      }),
      prisma.notification.count({
        where: { usuarioId, severidad: 'critical', leida: false, archivada: false }
      }),
      prisma.notification.groupBy({
        by: ['tipo'],
        where: { usuarioId, archivada: false },
        _count: true
      })
    ]);

    res.json({
      unread,
      total,
      bySeverity: { info, warning, critical },
      byType: byType.reduce((acc, item) => {
        acc[item.tipo] = item._count;
        return acc;
      }, {}),
      recentAlerts: critical + warning
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// ============================================================
// CREAR NOTIFICACIÓN (para uso interno/testing)
// ============================================================

const createNotification = async (req, res) => {
  try {
    const {
      usuarioId,
      tipo = 'NOTIFICATION',
      titulo,
      mensaje,
      severidad = 'info',
      entidadTipo,
      entidadId,
      entidadNombre,
      acciones,
      attachmentTipo,
      attachmentUrl,
      attachmentTitulo,
      attachmentSubtitulo,
      metadata
    } = req.body;

    if (!usuarioId || !titulo || !mensaje) {
      return res.status(400).json({
        error: true,
        message: 'Se requiere usuarioId, titulo y mensaje'
      });
    }

    const notification = await prisma.notification.create({
      data: {
        usuarioId,
        tipo,
        titulo,
        mensaje,
        severidad,
        entidadTipo,
        entidadId,
        entidadNombre,
        acciones: acciones ? JSON.stringify(acciones) : null,
        attachmentTipo,
        attachmentUrl,
        attachmentTitulo,
        attachmentSubtitulo,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    });

    res.status(201).json({
      ...notification,
      acciones: acciones || null,
      metadata: metadata || null
    });
  } catch (error) {
    console.error('Error al crear notificación:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

module.exports = {
  // Notification Rules
  getNotificationRules,
  getNotificationRuleById,
  createNotificationRule,
  updateNotificationRule,
  deleteNotificationRule,
  // Alert Rules
  getAlertRules,
  createAlertRule,
  updateAlertRule,
  deleteAlertRule,
  // Expiration Rules
  getExpirationRules,
  createExpirationRule,
  updateExpirationRule,
  deleteExpirationRule,
  // Inbox
  getInbox,
  getNotificationById,
  markAsRead,
  toggleArchive,
  toggleFollow,
  deleteNotification,
  markAllAsRead,
  createNotification,
  // Preferences
  getPreferences,
  updatePreferences,
  // Stats
  getStats
};
