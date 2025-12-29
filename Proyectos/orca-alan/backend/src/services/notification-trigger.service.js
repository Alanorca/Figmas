/**
 * Notification Trigger Service
 * Servicio para disparar notificaciones basadas en eventos del sistema
 */

const { PrismaClient } = require('@prisma/client');
const emailService = require('./email.service');

const prisma = new PrismaClient();

class NotificationTriggerService {
  constructor() {
    console.log('🔔 Notification Trigger Service inicializado');
  }

  /**
   * Dispara notificaciones basadas en un evento
   * @param {string} eventoTipo - CREATE, UPDATE, DELETE, APPROVAL, REJECTION
   * @param {string} entidadTipo - ASSET, RISK, INCIDENT, etc.
   * @param {string} entidadId - ID de la entidad
   * @param {Object} entidadData - Datos de la entidad
   * @param {string} usuarioAccionId - ID del usuario que realizó la acción
   */
  async triggerEvent(eventoTipo, entidadTipo, entidadId, entidadData, usuarioAccionId) {
    try {
      console.log(`\n🔔 Trigger Event: ${eventoTipo} en ${entidadTipo} (${entidadId})`);

      // 1. Buscar reglas activas que coincidan
      const reglas = await prisma.notificationRule.findMany({
        where: {
          entidadTipo,
          eventoTipo,
          activo: true
        }
      });

      console.log(`   📋 Reglas encontradas: ${reglas.length}`);

      if (reglas.length === 0) {
        return { notificacionesCreadas: 0 };
      }

      let totalNotificaciones = 0;

      // 2. Para cada regla, determinar destinatarios y crear notificaciones
      for (const regla of reglas) {
        const destinatarios = await this.determinarDestinatarios(regla, entidadData, usuarioAccionId);
        console.log(`   👥 Destinatarios para regla "${regla.nombre}": ${destinatarios.length}`);

        for (const usuarioId of destinatarios) {
          await this.crearNotificacion(regla, entidadTipo, entidadId, entidadData, usuarioId);
          totalNotificaciones++;
        }
      }

      console.log(`   ✅ Total notificaciones creadas: ${totalNotificaciones}\n`);
      return { notificacionesCreadas: totalNotificaciones };

    } catch (error) {
      console.error('Error en triggerEvent:', error);
      throw error;
    }
  }

  /**
   * Determina los destinatarios de una notificación
   */
  async determinarDestinatarios(regla, entidadData, usuarioAccionId) {
    const destinatarios = new Set();

    // Usuarios específicos
    if (regla.usuariosDestino) {
      const usuarios = JSON.parse(regla.usuariosDestino);
      usuarios.forEach(id => destinatarios.add(id));
    }

    // Notificar al creador
    if (regla.notificarCreador && entidadData.createdBy) {
      destinatarios.add(entidadData.createdBy);
    }

    // Notificar al responsable
    if (regla.notificarResponsable) {
      if (entidadData.responsableId) {
        destinatarios.add(entidadData.responsableId);
      } else if (entidadData.responsable) {
        // Si responsable es un nombre, buscar usuario
        const usuario = await prisma.usuario.findFirst({
          where: { nombre: entidadData.responsable }
        });
        if (usuario) destinatarios.add(usuario.id);
      }
    }

    // Notificar a aprobadores
    if (regla.notificarAprobadores && entidadData.aprobadores) {
      const aprobadores = typeof entidadData.aprobadores === 'string'
        ? JSON.parse(entidadData.aprobadores)
        : entidadData.aprobadores;
      aprobadores.forEach(id => destinatarios.add(id));
    }

    // Por roles
    if (regla.rolesDestino) {
      const roles = JSON.parse(regla.rolesDestino);
      const usuariosPorRol = await prisma.usuarioRol.findMany({
        where: { rolId: { in: roles } },
        select: { usuarioId: true }
      });
      usuariosPorRol.forEach(ur => destinatarios.add(ur.usuarioId));
    }

    // Excluir al usuario que realizó la acción (opcional)
    // destinatarios.delete(usuarioAccionId);

    return Array.from(destinatarios);
  }

  /**
   * Crea una notificación para un usuario
   */
  async crearNotificacion(regla, entidadTipo, entidadId, entidadData, usuarioId) {
    try {
      // Construir mensaje usando plantilla si existe
      const mensaje = this.construirMensaje(regla, entidadData);

      const notification = await prisma.notification.create({
        data: {
          usuarioId,
          tipo: 'NOTIFICATION',
          titulo: regla.nombre,
          mensaje,
          severidad: regla.severidad,
          entidadTipo,
          entidadId,
          entidadNombre: entidadData.nombre || entidadData.titulo || null,
          reglaId: regla.id,
          reglaTipo: 'NOTIFICATION_RULE'
        }
      });

      // Log del envío
      await prisma.notificationLog.create({
        data: {
          notificationId: notification.id,
          usuarioId,
          canal: 'IN_APP',
          estado: 'SENT',
          reglaId: regla.id,
          reglaTipo: 'NOTIFICATION_RULE'
        }
      });

      // Enviar email si está configurado
      if (regla.enviarEmail) {
        const usuario = await prisma.usuario.findUnique({
          where: { id: usuarioId },
          select: { email: true }
        });

        if (usuario?.email) {
          await emailService.sendNotificationEmail(usuario.email, notification);

          await prisma.notificationLog.create({
            data: {
              notificationId: notification.id,
              usuarioId,
              canal: 'EMAIL',
              estado: 'SENT',
              reglaId: regla.id,
              reglaTipo: 'NOTIFICATION_RULE'
            }
          });
        }
      }

      return notification;

    } catch (error) {
      console.error('Error al crear notificación:', error);

      // Log del error
      await prisma.notificationLog.create({
        data: {
          usuarioId,
          canal: 'IN_APP',
          estado: 'FAILED',
          errorMensaje: error.message,
          reglaId: regla.id,
          reglaTipo: 'NOTIFICATION_RULE'
        }
      });

      throw error;
    }
  }

  /**
   * Construye el mensaje usando la plantilla
   */
  construirMensaje(regla, entidadData) {
    if (!regla.plantillaMensaje) {
      return `Se ha realizado una acción en ${entidadData.nombre || 'una entidad'}.`;
    }

    let mensaje = regla.plantillaMensaje;

    // Reemplazar placeholders {{campo}}
    const placeholders = mensaje.match(/\{\{([^}]+)\}\}/g) || [];

    for (const placeholder of placeholders) {
      const campo = placeholder.replace('{{', '').replace('}}', '').trim();
      const valor = this.getNestedValue(entidadData, campo);
      mensaje = mensaje.replace(placeholder, valor || '');
    }

    return mensaje;
  }

  /**
   * Obtiene un valor anidado de un objeto
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  /**
   * Evalúa alertas por umbral
   * Debe ejecutarse periódicamente (cron job)
   */
  async evaluarAlertas() {
    try {
      console.log('\n⚠️  Evaluando alertas por umbral...');

      const alertas = await prisma.alertRule.findMany({
        where: { activo: true }
      });

      let alertasDisparadas = 0;

      for (const alerta of alertas) {
        // Verificar cooldown
        if (alerta.ultimaEjecucion) {
          const minutosDesdeUltima = (Date.now() - new Date(alerta.ultimaEjecucion).getTime()) / 60000;
          if (minutosDesdeUltima < alerta.cooldownMinutos) {
            continue;
          }
        }

        const valorActual = await this.obtenerValorMetrica(alerta);
        const condicionCumplida = this.evaluarCondicion(valorActual, alerta.operador, alerta.valorUmbral);

        if (condicionCumplida) {
          await this.dispararAlerta(alerta, valorActual);
          alertasDisparadas++;

          // Actualizar última ejecución
          await prisma.alertRule.update({
            where: { id: alerta.id },
            data: { ultimaEjecucion: new Date() }
          });
        }
      }

      console.log(`   ✅ Alertas disparadas: ${alertasDisparadas}\n`);
      return { alertasDisparadas };

    } catch (error) {
      console.error('Error al evaluar alertas:', error);
      throw error;
    }
  }

  /**
   * Obtiene el valor actual de una métrica
   */
  async obtenerValorMetrica(alerta) {
    const { entidadTipo, entidadId, metricaNombre, tipoAgregacion } = alerta;

    switch (entidadTipo) {
      case 'KPI':
        if (entidadId) {
          const kpi = await prisma.kpiProceso.findUnique({ where: { id: entidadId } });
          return kpi?.valorActual || 0;
        }
        break;

      case 'RISK_COUNT':
        return await prisma.riesgo.count({
          where: metricaNombre ? { estado: metricaNombre } : {}
        });

      case 'INCIDENT_COUNT':
        return await prisma.incidente.count({
          where: metricaNombre ? { severidad: metricaNombre } : {}
        });

      case 'COMPLIANCE_SCORE':
        const asignaciones = await prisma.asignacionCuestionario.findMany({
          where: { estado: 'completado' }
        });
        if (asignaciones.length === 0) return 0;
        const promedio = asignaciones.reduce((sum, a) => sum + a.progreso, 0) / asignaciones.length;
        return promedio;

      default:
        return 0;
    }

    return 0;
  }

  /**
   * Evalúa si una condición se cumple
   */
  evaluarCondicion(valor, operador, umbral) {
    switch (operador) {
      case 'GT': return valor > umbral;
      case 'LT': return valor < umbral;
      case 'GTE': return valor >= umbral;
      case 'LTE': return valor <= umbral;
      case 'EQ': return valor === umbral;
      case 'NE': return valor !== umbral;
      default: return false;
    }
  }

  /**
   * Dispara una alerta
   */
  async dispararAlerta(alerta, valorActual) {
    console.log(`   🚨 Alerta disparada: ${alerta.nombre} (valor: ${valorActual}, umbral: ${alerta.operador} ${alerta.valorUmbral})`);

    const destinatarios = await this.obtenerDestinatariosAlerta(alerta);

    for (const usuarioId of destinatarios) {
      const notification = await prisma.notification.create({
        data: {
          usuarioId,
          tipo: 'ALERT',
          titulo: `Alerta: ${alerta.nombre}`,
          mensaje: `${alerta.descripcion || alerta.nombre}. Valor actual: ${valorActual}. Umbral: ${alerta.operador} ${alerta.valorUmbral}.`,
          severidad: alerta.severidad,
          entidadTipo: alerta.entidadTipo,
          entidadId: alerta.entidadId,
          reglaId: alerta.id,
          reglaTipo: 'ALERT_RULE',
          metadata: JSON.stringify({ valorActual, valorUmbral: alerta.valorUmbral, operador: alerta.operador })
        }
      });

      await prisma.notificationLog.create({
        data: {
          notificationId: notification.id,
          usuarioId,
          canal: 'IN_APP',
          estado: 'SENT',
          reglaId: alerta.id,
          reglaTipo: 'ALERT_RULE'
        }
      });

      // Enviar email si está configurado
      if (alerta.enviarEmail) {
        const usuario = await prisma.usuario.findUnique({
          where: { id: usuarioId },
          select: { email: true }
        });

        if (usuario?.email) {
          await emailService.sendAlertEmail(usuario.email, alerta, valorActual);
        }
      }
    }
  }

  /**
   * Obtiene destinatarios de una alerta
   */
  async obtenerDestinatariosAlerta(alerta) {
    const destinatarios = new Set();

    if (alerta.usuariosDestino) {
      JSON.parse(alerta.usuariosDestino).forEach(id => destinatarios.add(id));
    }

    if (alerta.rolesDestino) {
      const roles = JSON.parse(alerta.rolesDestino);
      const usuariosPorRol = await prisma.usuarioRol.findMany({
        where: { rolId: { in: roles } },
        select: { usuarioId: true }
      });
      usuariosPorRol.forEach(ur => destinatarios.add(ur.usuarioId));
    }

    return Array.from(destinatarios);
  }

  /**
   * Evalúa vencimientos
   * Debe ejecutarse diariamente (cron job)
   */
  async evaluarVencimientos() {
    try {
      console.log('\n📅 Evaluando vencimientos...');

      const reglas = await prisma.expirationRule.findMany({
        where: { activo: true }
      });

      let recordatoriosEnviados = 0;

      for (const regla of reglas) {
        const diasAnticipacion = JSON.parse(regla.diasAnticipacion);

        for (const dias of diasAnticipacion) {
          const fechaObjetivo = new Date();
          fechaObjetivo.setDate(fechaObjetivo.getDate() + dias);
          fechaObjetivo.setHours(0, 0, 0, 0);

          const fechaFinDia = new Date(fechaObjetivo);
          fechaFinDia.setHours(23, 59, 59, 999);

          const entidadesProximasVencer = await this.buscarEntidadesProximasVencer(
            regla.entidadTipo,
            fechaObjetivo,
            fechaFinDia
          );

          for (const entidad of entidadesProximasVencer) {
            await this.enviarRecordatorioVencimiento(regla, entidad, dias);
            recordatoriosEnviados++;
          }
        }
      }

      console.log(`   ✅ Recordatorios enviados: ${recordatoriosEnviados}\n`);
      return { recordatoriosEnviados };

    } catch (error) {
      console.error('Error al evaluar vencimientos:', error);
      throw error;
    }
  }

  /**
   * Busca entidades próximas a vencer
   */
  async buscarEntidadesProximasVencer(entidadTipo, fechaInicio, fechaFin) {
    switch (entidadTipo) {
      case 'QUESTIONNAIRE_ASSIGNMENT':
        return await prisma.asignacionCuestionario.findMany({
          where: {
            fechaVencimiento: {
              gte: fechaInicio,
              lte: fechaFin
            },
            estado: { not: 'completado' }
          }
        });

      case 'EVIDENCE':
        return await prisma.evidencia.findMany({
          where: {
            vigencia: {
              gte: fechaInicio,
              lte: fechaFin
            }
          }
        });

      default:
        return [];
    }
  }

  /**
   * Envía recordatorio de vencimiento
   */
  async enviarRecordatorioVencimiento(regla, entidad, diasRestantes) {
    const destinatarios = [];

    if (regla.notificarResponsable && entidad.responsableId) {
      destinatarios.push(entidad.responsableId);
    }

    if (regla.rolesDestino) {
      const roles = JSON.parse(regla.rolesDestino);
      const usuariosPorRol = await prisma.usuarioRol.findMany({
        where: { rolId: { in: roles } },
        select: { usuarioId: true }
      });
      usuariosPorRol.forEach(ur => destinatarios.push(ur.usuarioId));
    }

    const urgencia = diasRestantes <= 1 ? 'ÚLTIMO DÍA' : diasRestantes <= 3 ? 'URGENTE' : '';

    for (const usuarioId of [...new Set(destinatarios)]) {
      await prisma.notification.create({
        data: {
          usuarioId,
          tipo: diasRestantes > 0 ? 'EXPIRATION_REMINDER' : 'OVERDUE',
          titulo: `${urgencia ? urgencia + ': ' : ''}Vencimiento en ${diasRestantes} día(s)`,
          mensaje: `"${entidad.titulo || entidad.nombre}" vence en ${diasRestantes} día(s).`,
          severidad: diasRestantes <= 1 ? 'critical' : diasRestantes <= 3 ? 'warning' : 'info',
          entidadTipo: regla.entidadTipo,
          entidadId: entidad.id,
          entidadNombre: entidad.titulo || entidad.nombre,
          reglaId: regla.id,
          reglaTipo: 'EXPIRATION_RULE'
        }
      });

      // Enviar email si está configurado
      if (regla.enviarEmail) {
        const usuario = await prisma.usuario.findUnique({
          where: { id: usuarioId },
          select: { email: true }
        });

        if (usuario?.email) {
          await emailService.sendExpirationReminder(usuario.email, entidad, diasRestantes);
        }
      }
    }
  }
}

module.exports = new NotificationTriggerService();
