const express = require('express');
const router = express.Router();
const controller = require('../controllers/notifications.controller');

// ============================================================
// NOTIFICATION RULES - Reglas de notificación por eventos
// ============================================================
router.get('/rules', controller.getNotificationRules);
router.get('/rules/:id', controller.getNotificationRuleById);
router.post('/rules', controller.createNotificationRule);
router.put('/rules/:id', controller.updateNotificationRule);
router.delete('/rules/:id', controller.deleteNotificationRule);

// ============================================================
// ALERT RULES - Alertas por umbral
// ============================================================
router.get('/alerts', controller.getAlertRules);
router.get('/alerts/:id', controller.getAlertRuleById);
router.post('/alerts', controller.createAlertRule);
router.put('/alerts/:id', controller.updateAlertRule);
router.delete('/alerts/:id', controller.deleteAlertRule);

// ============================================================
// EXPIRATION RULES - Reglas de vencimiento
// ============================================================
router.get('/expiration-rules', controller.getExpirationRules);
router.get('/expiration-rules/:id', controller.getExpirationRuleById);
router.post('/expiration-rules', controller.createExpirationRule);
router.put('/expiration-rules/:id', controller.updateExpirationRule);
router.delete('/expiration-rules/:id', controller.deleteExpirationRule);

// ============================================================
// NOTIFICATION PROFILES - Perfiles de notificación
// ============================================================
router.get('/profiles', controller.getNotificationProfiles);
router.get('/profiles/:id', controller.getNotificationProfileById);
router.post('/profiles', controller.createNotificationProfile);
router.put('/profiles/:id', controller.updateNotificationProfile);
router.delete('/profiles/:id', controller.deleteNotificationProfile);

// ============================================================
// NOTIFICATION LOGS - Logs de notificaciones
// ============================================================
router.get('/logs', controller.getNotificationLogs);
router.get('/logs/:id', controller.getNotificationLogById);

// ============================================================
// INBOX - Bandeja de notificaciones del usuario
// ============================================================
router.get('/inbox', controller.getInbox);
router.get('/inbox/:id', controller.getNotificationById);
router.patch('/inbox/:id/read', controller.markAsRead);
router.patch('/inbox/:id/archive', controller.toggleArchive);
router.patch('/inbox/:id/follow', controller.toggleFollow);
router.delete('/inbox/:id', controller.deleteNotification);
router.post('/inbox/mark-all-read', controller.markAllAsRead);
router.post('/inbox', controller.createNotification); // Para testing/interno

// ============================================================
// PREFERENCES - Preferencias de usuario
// ============================================================
router.get('/preferences', controller.getPreferences);
router.put('/preferences', controller.updatePreferences);

// ============================================================
// STATS - Estadísticas
// ============================================================
router.get('/stats', controller.getStats);

module.exports = router;
