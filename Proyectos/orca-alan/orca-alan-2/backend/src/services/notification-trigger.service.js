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
   * Verifica si se debe enviar notificación basándose en preferencias del usuario
   * @returns {Object} { enviarInApp: boolean, enviarEmail: boolean, razon?: string }
   */
  async verificarPreferenciasUsuario(usuarioId, severidad, entidadTipo, canal) {
    try {
      const preferencias = await prisma.userNotificationPreferences.findUnique({
        where: { usuarioId }
      });

      // Si no hay preferencias, usar defaults (todo habilitado)
      if (!preferencias) {
        return { enviarInApp: true, enviarEmail: true };
      }

      // Verificar si las notificaciones están habilitadas globalmente
      if (!preferencias.habilitado) {
        return { enviarInApp: false, enviarEmail: false, razon: 'Notificaciones deshabilitadas globalmente' };
      }

      // Verificar Horario No Molestar
      if (preferencias.horarioNoMolestarHabilitado) {
        const enHorarioNoMolestar = this.verificarHorarioNoMolestar(
          preferencias.horarioNoMolestarInicio,
          preferencias.horarioNoMolestarFin,
          preferencias.horarioNoMolestarDias
        );

        if (enHorarioNoMolestar) {
          // En horario no molestar, solo enviar críticas
          if (severidad !== 'critical') {
            return {
              enviarInApp: false,
              enviarEmail: false,
              razon: 'Horario No Molestar activo (solo se envían notificaciones críticas)'
            };
          }
        }
      }

      // Verificar preferencias por severidad
      const severidadPermitida = this.verificarSeveridadPermitida(preferencias, severidad);
      if (!severidadPermitida) {
        return {
          enviarInApp: false,
          enviarEmail: false,
          razon: `Severidad ${severidad} deshabilitada por preferencias del usuario`
        };
      }

      // Verificar preferencias por entidad
      let inAppPermitido = preferencias.inAppHabilitado;
      let emailPermitido = preferencias.emailHabilitado;

      if (preferencias.preferenciasPorEntidad && entidadTipo) {
        const prefEntidad = JSON.parse(preferencias.preferenciasPorEntidad);
        if (prefEntidad[entidadTipo]) {
          if (prefEntidad[entidadTipo].inApp !== undefined) {
            inAppPermitido = inAppPermitido && prefEntidad[entidadTipo].inApp;
          }
          if (prefEntidad[entidadTipo].email !== undefined) {
            emailPermitido = emailPermitido && prefEntidad[entidadTipo].email;
          }
        }
      }

      return { enviarInApp: inAppPermitido, enviarEmail: emailPermitido };

    } catch (error) {
      console.error('Error al verificar preferencias:', error);
      // En caso de error, permitir envío por defecto
      return { enviarInApp: true, enviarEmail: true };
    }
  }

  /**
   * Verifica Rate Limiting Global
   * Máximo de notificaciones por hora por usuario
   * @returns {Object} { permitido: boolean, razon?: string, restantes?: number }
   */
  async verificarRateLimit(usuarioId) {
    try {
      const preferencias = await prisma.userNotificationPreferences.findUnique({
        where: { usuarioId }
      });

      // Si no hay preferencias o rate limit no está habilitado, permitir
      if (!preferencias || !preferencias.rateLimitHabilitado) {
        return { permitido: true };
      }

      const maxPorHora = preferencias.rateLimitMaxPorHora || 100;

      // Contar notificaciones enviadas en la última hora
      const unaHoraAtras = new Date(Date.now() - 60 * 60 * 1000);

      const contadorUltimaHora = await prisma.notificationLog.count({
        where: {
          usuarioId,
          fechaEnvio: { gte: unaHoraAtras },
          estado: { in: ['SENT', 'DELIVERED'] }
        }
      });

      const restantes = maxPorHora - contadorUltimaHora;

      if (contadorUltimaHora >= maxPorHora) {
        return {
          permitido: false,
          razon: `Rate limit alcanzado: ${contadorUltimaHora}/${maxPorHora} notificaciones/hora`,
          restantes: 0
        };
      }

      return {
        permitido: true,
        restantes
      };

    } catch (error) {
      console.error('Error al verificar rate limit:', error);
      // En caso de error, permitir envío por defecto
      return { permitido: true };
    }
  }

  /**
   * Verifica si estamos en horario no molestar
   */
  verificarHorarioNoMolestar(horaInicio, horaFin, diasStr) {
    if (!horaInicio || !horaFin) return false;

    const ahora = new Date();
    const diaActual = ahora.getDay(); // 0 = Domingo
    const horaActual = ahora.getHours() * 60 + ahora.getMinutes(); // Minutos desde medianoche

    // Verificar si hoy es un día de horario no molestar
    if (diasStr) {
      const dias = JSON.parse(diasStr);
      if (!dias.includes(diaActual)) {
        return false; // Hoy no aplica el horario no molestar
      }
    }

    // Convertir horas a minutos
    const [inicioH, inicioM] = horaInicio.split(':').map(Number);
    const [finH, finM] = horaFin.split(':').map(Number);
    const inicioMinutos = inicioH * 60 + inicioM;
    const finMinutos = finH * 60 + finM;

    // Verificar si la hora actual está en el rango
    if (inicioMinutos <= finMinutos) {
      // Rango normal (ej: 09:00 - 18:00)
      return horaActual >= inicioMinutos && horaActual <= finMinutos;
    } else {
      // Rango que cruza medianoche (ej: 22:00 - 08:00)
      return horaActual >= inicioMinutos || horaActual <= finMinutos;
    }
  }

  /**
   * Verifica si la severidad está permitida por las preferencias
   */
  verificarSeveridadPermitida(preferencias, severidad) {
    switch (severidad) {
      case 'info':
        return preferencias.notificarInfo;
      case 'warning':
        return preferencias.notificarWarning;
      case 'critical':
        return preferencias.notificarCritical;
      default:
        return true;
    }
  }

  /**
   * Crea una notificación para un usuario
   */
  async crearNotificacion(regla, entidadTipo, entidadId, entidadData, usuarioId) {
    try {
      // Verificar preferencias del usuario antes de enviar
      const preferencias = await this.verificarPreferenciasUsuario(
        usuarioId,
        regla.severidad,
        entidadTipo,
        'IN_APP'
      );

      // Si ningún canal está permitido, no crear la notificación
      if (!preferencias.enviarInApp && !preferencias.enviarEmail) {
        console.log(`   ⏭️  Notificación omitida para ${usuarioId}: ${preferencias.razon}`);

        // Registrar en log
        await prisma.notificationLog.create({
          data: {
            usuarioId,
            canal: 'IN_APP',
            estado: 'SKIPPED',
            errorMensaje: preferencias.razon,
            reglaId: regla.id,
            reglaTipo: 'NOTIFICATION_RULE',
            metadata: JSON.stringify({ razon: preferencias.razon })
          }
        });

        return null;
      }

      // Verificar Rate Limiting Global (máximo notificaciones/hora)
      const rateLimit = await this.verificarRateLimit(usuarioId);
      if (!rateLimit.permitido) {
        console.log(`   🚫 Notificación bloqueada por rate limit para ${usuarioId}: ${rateLimit.razon}`);

        // Registrar en log como RATE_LIMITED
        await prisma.notificationLog.create({
          data: {
            usuarioId,
            canal: 'IN_APP',
            estado: 'SKIPPED',
            errorMensaje: rateLimit.razon,
            reglaId: regla.id,
            reglaTipo: 'NOTIFICATION_RULE',
            metadata: JSON.stringify({ razon: 'RATE_LIMITED', detalles: rateLimit.razon })
          }
        });

        return null;
      }

      // Construir mensaje usando plantilla si existe
      const mensaje = this.construirMensaje(regla, entidadData);

      let notification = null;

      // Crear notificación in-app si está permitido
      if (preferencias.enviarInApp) {
        notification = await prisma.notification.create({
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
      }

      // Enviar email si está configurado en la regla Y permitido por preferencias
      if (regla.enviarEmail && preferencias.enviarEmail) {
        const usuario = await prisma.usuario.findUnique({
          where: { id: usuarioId },
          select: { email: true }
        });

        if (usuario?.email) {
          await emailService.sendNotificationEmail(usuario.email, notification || { titulo: regla.nombre, mensaje });

          await prisma.notificationLog.create({
            data: {
              notificationId: notification?.id,
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
      // Verificar preferencias del usuario
      const preferencias = await this.verificarPreferenciasUsuario(
        usuarioId,
        alerta.severidad,
        alerta.entidadTipo,
        'IN_APP'
      );

      if (!preferencias.enviarInApp && !preferencias.enviarEmail) {
        console.log(`   ⏭️  Alerta omitida para ${usuarioId}: ${preferencias.razon}`);
        await prisma.notificationLog.create({
          data: {
            usuarioId,
            canal: 'IN_APP',
            estado: 'SKIPPED',
            errorMensaje: preferencias.razon,
            reglaId: alerta.id,
            reglaTipo: 'ALERT_RULE',
            metadata: JSON.stringify({ razon: preferencias.razon })
          }
        });
        continue;
      }

      let notification = null;

      if (preferencias.enviarInApp) {
        notification = await prisma.notification.create({
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
      }

      // Enviar email si está configurado en la regla Y permitido por preferencias
      if (alerta.enviarEmail && preferencias.enviarEmail) {
        const usuario = await prisma.usuario.findUnique({
          where: { id: usuarioId },
          select: { email: true }
        });

        if (usuario?.email) {
          await emailService.sendAlertEmail(usuario.email, alerta, valorActual);

          await prisma.notificationLog.create({
            data: {
              notificationId: notification?.id,
              usuarioId,
              canal: 'EMAIL',
              estado: 'SENT',
              reglaId: alerta.id,
              reglaTipo: 'ALERT_RULE'
            }
          });
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
    const severidad = diasRestantes <= 1 ? 'critical' : diasRestantes <= 3 ? 'warning' : 'info';

    for (const usuarioId of [...new Set(destinatarios)]) {
      // Verificar preferencias del usuario
      const preferencias = await this.verificarPreferenciasUsuario(
        usuarioId,
        severidad,
        regla.entidadTipo,
        'IN_APP'
      );

      if (!preferencias.enviarInApp && !preferencias.enviarEmail) {
        console.log(`   ⏭️  Recordatorio omitido para ${usuarioId}: ${preferencias.razon}`);
        await prisma.notificationLog.create({
          data: {
            usuarioId,
            canal: 'IN_APP',
            estado: 'SKIPPED',
            errorMensaje: preferencias.razon,
            reglaId: regla.id,
            reglaTipo: 'EXPIRATION_RULE',
            metadata: JSON.stringify({ razon: preferencias.razon, diasRestantes })
          }
        });
        continue;
      }

      let notification = null;

      if (preferencias.enviarInApp) {
        notification = await prisma.notification.create({
          data: {
            usuarioId,
            tipo: diasRestantes > 0 ? 'EXPIRATION_REMINDER' : 'OVERDUE',
            titulo: `${urgencia ? urgencia + ': ' : ''}Vencimiento en ${diasRestantes} día(s)`,
            mensaje: `"${entidad.titulo || entidad.nombre}" vence en ${diasRestantes} día(s).`,
            severidad,
            entidadTipo: regla.entidadTipo,
            entidadId: entidad.id,
            entidadNombre: entidad.titulo || entidad.nombre,
            reglaId: regla.id,
            reglaTipo: 'EXPIRATION_RULE'
          }
        });

        await prisma.notificationLog.create({
          data: {
            notificationId: notification.id,
            usuarioId,
            canal: 'IN_APP',
            estado: 'SENT',
            reglaId: regla.id,
            reglaTipo: 'EXPIRATION_RULE'
          }
        });
      }

      // Enviar email si está configurado en la regla Y permitido por preferencias
      if (regla.enviarEmail && preferencias.enviarEmail) {
        const usuario = await prisma.usuario.findUnique({
          where: { id: usuarioId },
          select: { email: true }
        });

        if (usuario?.email) {
          await emailService.sendExpirationReminder(usuario.email, entidad, diasRestantes);

          await prisma.notificationLog.create({
            data: {
              notificationId: notification?.id,
              usuarioId,
              canal: 'EMAIL',
              estado: 'SENT',
              reglaId: regla.id,
              reglaTipo: 'EXPIRATION_RULE'
            }
          });
        }
      }
    }
  }

  /**
   * Evalúa entidades que ya están vencidas (OVERDUE)
   * Debe ejecutarse diariamente
   */
  async evaluarVencidos() {
    try {
      console.log('\n🚨 Evaluando entidades vencidas (OVERDUE)...');

      const reglas = await prisma.expirationRule.findMany({
        where: { activo: true }
      });

      let vencidosNotificados = 0;

      for (const regla of reglas) {
        const diasDespuesVencido = regla.diasDespuesVencido
          ? JSON.parse(regla.diasDespuesVencido)
          : [1, 7, 15];

        for (const dias of diasDespuesVencido) {
          const fechaObjetivo = new Date();
          fechaObjetivo.setDate(fechaObjetivo.getDate() - dias);
          fechaObjetivo.setHours(0, 0, 0, 0);

          const fechaFinDia = new Date(fechaObjetivo);
          fechaFinDia.setHours(23, 59, 59, 999);

          const entidadesVencidas = await this.buscarEntidadesVencidas(
            regla.entidadTipo,
            fechaObjetivo,
            fechaFinDia
          );

          for (const entidad of entidadesVencidas) {
            await this.enviarNotificacionOverdue(regla, entidad, dias);
            vencidosNotificados++;
          }
        }
      }

      console.log(`   ✅ Notificaciones OVERDUE enviadas: ${vencidosNotificados}\n`);
      return { vencidosNotificados };

    } catch (error) {
      console.error('Error al evaluar vencidos:', error);
      throw error;
    }
  }

  /**
   * Busca entidades que ya están vencidas
   */
  async buscarEntidadesVencidas(entidadTipo, fechaInicio, fechaFin) {
    switch (entidadTipo) {
      case 'QUESTIONNAIRE_ASSIGNMENT':
        return await prisma.asignacionCuestionario.findMany({
          where: {
            fechaVencimiento: {
              gte: fechaInicio,
              lte: fechaFin
            },
            estado: { notIn: ['completado', 'cerrado', 'cancelado'] }
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

      case 'RISK':
        return await prisma.riesgo.findMany({
          where: {
            fechaRevision: {
              gte: fechaInicio,
              lte: fechaFin
            },
            estado: { not: 'cerrado' }
          }
        });

      default:
        return [];
    }
  }

  /**
   * Envía notificación de entidad vencida (OVERDUE)
   */
  async enviarNotificacionOverdue(regla, entidad, diasVencido) {
    const destinatarios = [];

    if (regla.notificarResponsable && entidad.responsableId) {
      destinatarios.push(entidad.responsableId);
    }

    if (regla.notificarSupervisor) {
      // Buscar supervisor del responsable
      if (entidad.responsableId) {
        const responsable = await prisma.usuario.findUnique({
          where: { id: entidad.responsableId },
          select: { supervisorId: true }
        });
        if (responsable?.supervisorId) {
          destinatarios.push(responsable.supervisorId);
        }
      }
    }

    if (regla.rolesDestino) {
      const roles = JSON.parse(regla.rolesDestino);
      const usuariosPorRol = await prisma.usuarioRol.findMany({
        where: { rolId: { in: roles } },
        select: { usuarioId: true }
      });
      usuariosPorRol.forEach(ur => destinatarios.push(ur.usuarioId));
    }

    const severidad = diasVencido >= 7 ? 'critical' : 'warning';
    const urgenciaLabel = diasVencido >= 7 ? 'CRÍTICO' : 'VENCIDO';

    for (const usuarioId of [...new Set(destinatarios)]) {
      const preferencias = await this.verificarPreferenciasUsuario(
        usuarioId,
        severidad,
        regla.entidadTipo,
        'IN_APP'
      );

      if (!preferencias.enviarInApp && !preferencias.enviarEmail) {
        console.log(`   ⏭️  OVERDUE omitido para ${usuarioId}: ${preferencias.razon}`);
        await prisma.notificationLog.create({
          data: {
            usuarioId,
            canal: 'IN_APP',
            estado: 'SKIPPED',
            errorMensaje: preferencias.razon,
            reglaId: regla.id,
            reglaTipo: 'EXPIRATION_RULE',
            metadata: JSON.stringify({ razon: preferencias.razon, diasVencido })
          }
        });
        continue;
      }

      let notification = null;

      if (preferencias.enviarInApp) {
        notification = await prisma.notification.create({
          data: {
            usuarioId,
            tipo: 'OVERDUE',
            titulo: `${urgenciaLabel}: Vencido hace ${diasVencido} día(s)`,
            mensaje: `"${entidad.titulo || entidad.nombre}" está vencido desde hace ${diasVencido} día(s). Requiere atención inmediata.`,
            severidad,
            entidadTipo: regla.entidadTipo,
            entidadId: entidad.id,
            entidadNombre: entidad.titulo || entidad.nombre,
            reglaId: regla.id,
            reglaTipo: 'EXPIRATION_RULE',
            acciones: JSON.stringify([
              { label: 'Ver detalle', type: 'primary', action: 'view' },
              { label: 'Marcar resuelto', type: 'secondary', action: 'resolve' }
            ])
          }
        });

        await prisma.notificationLog.create({
          data: {
            notificationId: notification.id,
            usuarioId,
            canal: 'IN_APP',
            estado: 'SENT',
            reglaId: regla.id,
            reglaTipo: 'EXPIRATION_RULE'
          }
        });
      }

      if (regla.enviarEmail && preferencias.enviarEmail) {
        const usuario = await prisma.usuario.findUnique({
          where: { id: usuarioId },
          select: { email: true }
        });

        if (usuario?.email) {
          await emailService.sendOverdueNotification(usuario.email, entidad, diasVencido);

          await prisma.notificationLog.create({
            data: {
              notificationId: notification?.id,
              usuarioId,
              canal: 'EMAIL',
              estado: 'SENT',
              reglaId: regla.id,
              reglaTipo: 'EXPIRATION_RULE'
            }
          });
        }
      }
    }
  }

  /**
   * Limpia notificaciones antiguas (más de 90 días y leídas)
   */
  async limpiarNotificacionesAntiguas(diasAntiguedad = 90) {
    try {
      console.log(`\n🧹 Limpiando notificaciones de más de ${diasAntiguedad} días...`);

      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - diasAntiguedad);

      const resultado = await prisma.notification.deleteMany({
        where: {
          fechaCreacion: { lt: fechaLimite },
          leida: true,
          archivada: false
        }
      });

      console.log(`   ✅ Notificaciones eliminadas: ${resultado.count}\n`);
      return { eliminadas: resultado.count };

    } catch (error) {
      console.error('Error al limpiar notificaciones:', error);
      throw error;
    }
  }

  /**
   * Dispara notificación para aprobación/rechazo de cumplimiento
   */
  async triggerApprovalNotification(tipo, cuestionarioId, respuestaId, aprobadorId, mensaje) {
    try {
      console.log(`\n📋 Trigger Approval Notification: ${tipo}`);

      // Obtener datos del cuestionario y respuesta
      const asignacion = await prisma.asignacionCuestionario.findUnique({
        where: { id: cuestionarioId },
        include: { cuestionario: true }
      });

      if (!asignacion) {
        console.log('   ⚠️ Asignación no encontrada');
        return { notificacionesCreadas: 0 };
      }

      // Determinar destinatario (quien completó el cuestionario)
      const destinatarioId = asignacion.responsableId;
      if (!destinatarioId) {
        console.log('   ⚠️ Responsable no encontrado');
        return { notificacionesCreadas: 0 };
      }

      // Obtener datos del aprobador
      const aprobador = await prisma.usuario.findUnique({
        where: { id: aprobadorId },
        select: { nombre: true }
      });

      const severidad = tipo === 'APPROVAL' ? 'info' : 'warning';
      const tipoNotificacion = tipo === 'APPROVAL' ? 'NOTIFICATION' : 'NOTIFICATION';
      const titulo = tipo === 'APPROVAL'
        ? 'Respuesta aprobada'
        : 'Respuesta rechazada';

      const mensajeNotificacion = tipo === 'APPROVAL'
        ? `${aprobador?.nombre || 'Un aprobador'} ha aprobado tu respuesta al cuestionario "${asignacion.cuestionario?.nombre}".`
        : `${aprobador?.nombre || 'Un aprobador'} ha rechazado tu respuesta al cuestionario "${asignacion.cuestionario?.nombre}". Motivo: ${mensaje || 'No especificado'}`;

      // Verificar preferencias
      const preferencias = await this.verificarPreferenciasUsuario(
        destinatarioId,
        severidad,
        'QUESTIONNAIRE',
        'IN_APP'
      );

      if (!preferencias.enviarInApp && !preferencias.enviarEmail) {
        console.log(`   ⏭️  Notificación omitida: ${preferencias.razon}`);
        return { notificacionesCreadas: 0 };
      }

      let notification = null;

      if (preferencias.enviarInApp) {
        notification = await prisma.notification.create({
          data: {
            usuarioId: destinatarioId,
            tipo: tipoNotificacion,
            titulo,
            mensaje: mensajeNotificacion,
            severidad,
            entidadTipo: 'QUESTIONNAIRE',
            entidadId: cuestionarioId,
            entidadNombre: asignacion.cuestionario?.nombre,
            metadata: JSON.stringify({
              tipo,
              aprobadorId,
              aprobadorNombre: aprobador?.nombre,
              respuestaId,
              motivoRechazo: tipo === 'REJECTION' ? mensaje : null
            }),
            acciones: tipo === 'REJECTION' ? JSON.stringify([
              { label: 'Revisar y corregir', type: 'primary', action: 'review' }
            ]) : null
          }
        });

        await prisma.notificationLog.create({
          data: {
            notificationId: notification.id,
            usuarioId: destinatarioId,
            canal: 'IN_APP',
            estado: 'SENT',
            reglaTipo: 'APPROVAL_WORKFLOW'
          }
        });
      }

      console.log(`   ✅ Notificación de ${tipo} creada`);
      return { notificacionesCreadas: 1 };

    } catch (error) {
      console.error('Error en triggerApprovalNotification:', error);
      throw error;
    }
  }
}

module.exports = new NotificationTriggerService();
