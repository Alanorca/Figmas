/**
 * Email Service (Mock para desarrollo)
 * En producción, reemplazar con Nodemailer, SendGrid, etc.
 */

class EmailService {
  constructor() {
    this.enabled = process.env.EMAIL_ENABLED === 'true' || false;
    console.log(`📧 Email Service inicializado (modo: ${this.enabled ? 'ACTIVO' : 'MOCK'})`);
  }

  /**
   * Envía un email (mock - solo console.log)
   * @param {string} to - Destinatario
   * @param {string} subject - Asunto
   * @param {string} body - Contenido del email
   * @param {Object} options - Opciones adicionales
   */
  async sendEmail(to, subject, body, options = {}) {
    const emailData = {
      to,
      subject,
      body,
      ...options,
      timestamp: new Date().toISOString()
    };

    console.log('\n==================== EMAIL MOCK ====================');
    console.log(`📬 TO: ${to}`);
    console.log(`📋 SUBJECT: ${subject}`);
    console.log(`📝 BODY:`);
    console.log(body);
    if (options.html) {
      console.log(`🌐 HTML: [HTML content included]`);
    }
    console.log(`⏰ TIMESTAMP: ${emailData.timestamp}`);
    console.log('====================================================\n');

    // Simular latencia de envío
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      success: true,
      messageId: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: emailData.timestamp
    };
  }

  /**
   * Envía una notificación por email
   * @param {string} usuarioEmail - Email del destinatario
   * @param {Object} notification - Objeto de notificación
   */
  async sendNotificationEmail(usuarioEmail, notification) {
    const subject = `[ORCA] ${notification.titulo}`;
    const body = this.buildNotificationBody(notification);

    return this.sendEmail(usuarioEmail, subject, body, {
      html: this.buildNotificationHtml(notification)
    });
  }

  /**
   * Construye el cuerpo de texto plano del email
   */
  buildNotificationBody(notification) {
    let body = `${notification.titulo}\n\n`;
    body += `${notification.mensaje}\n\n`;

    if (notification.entidadNombre) {
      body += `Entidad: ${notification.entidadNombre}\n`;
    }

    body += `---\n`;
    body += `Este mensaje fue generado automáticamente por el Sistema ORCA.\n`;
    body += `No responda a este correo.`;

    return body;
  }

  /**
   * Construye el cuerpo HTML del email
   */
  buildNotificationHtml(notification) {
    const severityColors = {
      info: '#3b82f6',
      warning: '#f59e0b',
      critical: '#ef4444'
    };

    const color = severityColors[notification.severidad] || severityColors.info;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${notification.titulo}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="border-left: 4px solid ${color}; padding-left: 16px; margin-bottom: 20px;">
            <h2 style="margin: 0 0 10px 0; color: ${color};">${notification.titulo}</h2>
            <p style="margin: 0; color: #666;">${notification.mensaje}</p>
          </div>

          ${notification.entidadNombre ? `
            <div style="background: #f5f5f5; padding: 12px; border-radius: 8px; margin-bottom: 20px;">
              <strong>Entidad:</strong> ${notification.entidadNombre}
              ${notification.entidadTipo ? `<br><strong>Tipo:</strong> ${notification.entidadTipo}` : ''}
            </div>
          ` : ''}

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

          <p style="font-size: 12px; color: #999;">
            Este mensaje fue generado automáticamente por el Sistema ORCA.<br>
            No responda a este correo.
          </p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Envía email de recordatorio de vencimiento
   */
  async sendExpirationReminder(usuarioEmail, entidad, diasRestantes) {
    const urgencia = diasRestantes <= 1 ? 'URGENTE' : diasRestantes <= 3 ? 'IMPORTANTE' : '';
    const subject = `[ORCA] ${urgencia ? urgencia + ': ' : ''}Vencimiento en ${diasRestantes} día(s)`;

    const body = `
Recordatorio de Vencimiento

La siguiente entidad vence en ${diasRestantes} día(s):

Nombre: ${entidad.nombre || entidad.titulo}
Tipo: ${entidad.tipo || 'No especificado'}
Fecha de vencimiento: ${entidad.fechaVencimiento}

Por favor tome las acciones necesarias antes del vencimiento.

---
Sistema ORCA
    `.trim();

    return this.sendEmail(usuarioEmail, subject, body);
  }

  /**
   * Envía email de alerta
   */
  async sendAlertEmail(usuarioEmail, alert, valorActual) {
    const subject = `[ORCA] ALERTA: ${alert.nombre}`;

    const body = `
Alerta del Sistema

Se ha activado la siguiente alerta:

Nombre: ${alert.nombre}
Descripción: ${alert.descripcion || 'Sin descripción'}
Valor actual: ${valorActual}
Umbral configurado: ${alert.operador} ${alert.valorUmbral}

Por favor revise esta situación lo antes posible.

---
Sistema ORCA
    `.trim();

    return this.sendEmail(usuarioEmail, subject, body);
  }

  /**
   * Envía email de notificación de entidad vencida (OVERDUE)
   */
  async sendOverdueNotification(usuarioEmail, entidad, diasVencido) {
    const urgencia = diasVencido >= 7 ? 'CRÍTICO' : 'VENCIDO';
    const subject = `[ORCA] ${urgencia}: Entidad vencida hace ${diasVencido} día(s)`;

    const body = `
ATENCIÓN: Entidad Vencida

La siguiente entidad está vencida desde hace ${diasVencido} día(s) y requiere atención inmediata:

Nombre: ${entidad.nombre || entidad.titulo}
Tipo: ${entidad.tipo || 'No especificado'}
Días de atraso: ${diasVencido}

Por favor tome las acciones correctivas de manera urgente.

---
Sistema ORCA
    `.trim();

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Entidad Vencida</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: ${diasVencido >= 7 ? '#fef2f2' : '#fffbeb'}; border: 1px solid ${diasVencido >= 7 ? '#ef4444' : '#f59e0b'}; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="margin: 0 0 10px 0; color: ${diasVencido >= 7 ? '#dc2626' : '#d97706'};">
              ${urgencia}: Entidad vencida hace ${diasVencido} día(s)
            </h2>
            <p style="margin: 0; color: #666;">Esta entidad requiere atención inmediata.</p>
          </div>

          <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0 0 8px 0;"><strong>Nombre:</strong> ${entidad.nombre || entidad.titulo}</p>
            <p style="margin: 0 0 8px 0;"><strong>Tipo:</strong> ${entidad.tipo || 'No especificado'}</p>
            <p style="margin: 0; color: ${diasVencido >= 7 ? '#dc2626' : '#d97706'}; font-weight: bold;">
              <strong>Días de atraso:</strong> ${diasVencido}
            </p>
          </div>

          <div style="text-align: center; margin: 20px 0;">
            <a href="#" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Ver en ORCA
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

          <p style="font-size: 12px; color: #999;">
            Este mensaje fue generado automáticamente por el Sistema ORCA.<br>
            No responda a este correo.
          </p>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(usuarioEmail, subject, body, { html });
  }
}

module.exports = new EmailService();
