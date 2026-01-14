-- CreateTable
CREATE TABLE "notification_rules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "entidadTipo" TEXT NOT NULL,
    "eventoTipo" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "notificarCreador" BOOLEAN NOT NULL DEFAULT false,
    "notificarResponsable" BOOLEAN NOT NULL DEFAULT true,
    "notificarAprobadores" BOOLEAN NOT NULL DEFAULT false,
    "rolesDestino" TEXT,
    "usuariosDestino" TEXT,
    "enviarInApp" BOOLEAN NOT NULL DEFAULT true,
    "enviarEmail" BOOLEAN NOT NULL DEFAULT false,
    "plantillaMensaje" TEXT,
    "severidad" TEXT NOT NULL DEFAULT 'info',
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaModificacion" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "alert_rules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "entidadTipo" TEXT NOT NULL,
    "entidadId" TEXT,
    "metricaNombre" TEXT NOT NULL,
    "operador" TEXT NOT NULL,
    "valorUmbral" REAL NOT NULL,
    "tipoAgregacion" TEXT NOT NULL DEFAULT 'CURRENT',
    "periodoEvaluacion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "rolesDestino" TEXT,
    "usuariosDestino" TEXT,
    "enviarInApp" BOOLEAN NOT NULL DEFAULT true,
    "enviarEmail" BOOLEAN NOT NULL DEFAULT false,
    "severidad" TEXT NOT NULL DEFAULT 'warning',
    "cooldownMinutos" INTEGER NOT NULL DEFAULT 60,
    "ultimaEjecucion" DATETIME,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaModificacion" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "expiration_rules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "entidadTipo" TEXT NOT NULL,
    "diasAnticipacion" TEXT NOT NULL,
    "diasDespuesVencido" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "notificarResponsable" BOOLEAN NOT NULL DEFAULT true,
    "notificarSupervisor" BOOLEAN NOT NULL DEFAULT false,
    "rolesDestino" TEXT,
    "enviarInApp" BOOLEAN NOT NULL DEFAULT true,
    "enviarEmail" BOOLEAN NOT NULL DEFAULT false,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaModificacion" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "severidad" TEXT NOT NULL DEFAULT 'info',
    "entidadTipo" TEXT,
    "entidadId" TEXT,
    "entidadNombre" TEXT,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "archivada" BOOLEAN NOT NULL DEFAULT false,
    "enSeguimiento" BOOLEAN NOT NULL DEFAULT false,
    "acciones" TEXT,
    "attachmentTipo" TEXT,
    "attachmentUrl" TEXT,
    "attachmentTitulo" TEXT,
    "attachmentSubtitulo" TEXT,
    "metadata" TEXT,
    "reglaId" TEXT,
    "reglaTipo" TEXT,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaLeida" DATETIME
);

-- CreateTable
CREATE TABLE "user_notification_preferences" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "habilitado" BOOLEAN NOT NULL DEFAULT true,
    "emailHabilitado" BOOLEAN NOT NULL DEFAULT true,
    "inAppHabilitado" BOOLEAN NOT NULL DEFAULT true,
    "preferenciasPorEntidad" TEXT,
    "notificarInfo" BOOLEAN NOT NULL DEFAULT true,
    "notificarWarning" BOOLEAN NOT NULL DEFAULT true,
    "notificarCritical" BOOLEAN NOT NULL DEFAULT true,
    "frecuenciaEmail" TEXT NOT NULL DEFAULT 'inmediato',
    "horaResumen" TEXT NOT NULL DEFAULT '09:00',
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaModificacion" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "notification_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "notificationId" TEXT,
    "usuarioId" TEXT NOT NULL,
    "canal" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "errorMensaje" TEXT,
    "reglaId" TEXT,
    "reglaTipo" TEXT,
    "metadata" TEXT,
    "fechaEnvio" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "notifications_usuarioId_leida_archivada_idx" ON "notifications"("usuarioId", "leida", "archivada");

-- CreateIndex
CREATE INDEX "notifications_usuarioId_fechaCreacion_idx" ON "notifications"("usuarioId", "fechaCreacion");

-- CreateIndex
CREATE UNIQUE INDEX "user_notification_preferences_usuarioId_key" ON "user_notification_preferences"("usuarioId");

-- CreateIndex
CREATE INDEX "notification_logs_usuarioId_fechaEnvio_idx" ON "notification_logs"("usuarioId", "fechaEnvio");

-- CreateIndex
CREATE INDEX "notification_logs_estado_idx" ON "notification_logs"("estado");
