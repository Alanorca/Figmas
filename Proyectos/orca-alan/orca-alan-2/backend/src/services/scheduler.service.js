/**
 * Scheduler Service
 * Servicio para ejecutar tareas programadas de notificaciones
 */

const cron = require('node-cron');
const notificationTrigger = require('./notification-trigger.service');

class SchedulerService {
  constructor() {
    this.jobs = {};
    console.log('⏰ Scheduler Service inicializado');
  }

  /**
   * Inicia todos los jobs programados
   */
  start() {
    console.log('\n⏰ Iniciando tareas programadas...');

    // Evaluar alertas por umbral cada 5 minutos
    this.jobs.alertas = cron.schedule('*/5 * * * *', async () => {
      console.log('\n[CRON] Ejecutando evaluación de alertas...');
      try {
        const resultado = await notificationTrigger.evaluarAlertas();
        console.log(`[CRON] Alertas evaluadas: ${resultado.alertasDisparadas} disparadas`);
      } catch (error) {
        console.error('[CRON] Error evaluando alertas:', error.message);
      }
    });

    // Evaluar vencimientos diariamente a las 8:00 AM
    this.jobs.vencimientos = cron.schedule('0 8 * * *', async () => {
      console.log('\n[CRON] Ejecutando evaluación de vencimientos...');
      try {
        const resultado = await notificationTrigger.evaluarVencimientos();
        console.log(`[CRON] Recordatorios enviados: ${resultado.recordatoriosEnviados}`);
      } catch (error) {
        console.error('[CRON] Error evaluando vencimientos:', error.message);
      }
    });

    // Evaluar entidades vencidas (OVERDUE) diariamente a las 9:00 AM
    this.jobs.vencidos = cron.schedule('0 9 * * *', async () => {
      console.log('\n[CRON] Ejecutando evaluación de entidades vencidas...');
      try {
        const resultado = await notificationTrigger.evaluarVencidos();
        console.log(`[CRON] Notificaciones de vencidos: ${resultado.vencidosNotificados}`);
      } catch (error) {
        console.error('[CRON] Error evaluando vencidos:', error.message);
      }
    });

    // Limpiar notificaciones antiguas mensualmente (día 1 a las 3:00 AM)
    this.jobs.limpieza = cron.schedule('0 3 1 * *', async () => {
      console.log('\n[CRON] Ejecutando limpieza de notificaciones antiguas...');
      try {
        const resultado = await notificationTrigger.limpiarNotificacionesAntiguas();
        console.log(`[CRON] Notificaciones eliminadas: ${resultado.eliminadas}`);
      } catch (error) {
        console.error('[CRON] Error en limpieza:', error.message);
      }
    });

    console.log('   ✅ Tareas programadas iniciadas:');
    console.log('      - Alertas por umbral: cada 5 minutos');
    console.log('      - Vencimientos: 8:00 AM diario');
    console.log('      - Entidades vencidas (OVERDUE): 9:00 AM diario');
    console.log('      - Limpieza mensual: día 1 a las 3:00 AM\n');
  }

  /**
   * Detiene todos los jobs
   */
  stop() {
    console.log('⏰ Deteniendo tareas programadas...');
    Object.values(this.jobs).forEach(job => job.stop());
    this.jobs = {};
  }

  /**
   * Ejecuta manualmente un job específico
   * @param {string} jobName - alertas, vencimientos, vencidos, limpieza
   */
  async runNow(jobName) {
    console.log(`\n[MANUAL] Ejecutando ${jobName}...`);

    switch (jobName) {
      case 'alertas':
        return await notificationTrigger.evaluarAlertas();
      case 'vencimientos':
        return await notificationTrigger.evaluarVencimientos();
      case 'vencidos':
        return await notificationTrigger.evaluarVencidos();
      case 'limpieza':
        return await notificationTrigger.limpiarNotificacionesAntiguas();
      default:
        throw new Error(`Job desconocido: ${jobName}`);
    }
  }

  /**
   * Obtiene el estado de los jobs
   */
  getStatus() {
    return Object.entries(this.jobs).map(([name, job]) => ({
      name,
      running: job.running || false
    }));
  }
}

module.exports = new SchedulerService();
