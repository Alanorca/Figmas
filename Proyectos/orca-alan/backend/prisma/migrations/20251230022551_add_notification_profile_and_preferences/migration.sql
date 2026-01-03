-- CreateTable
CREATE TABLE "notification_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "eventos" TEXT NOT NULL,
    "seleccionEntidades" TEXT NOT NULL,
    "filtrosEntidad" TEXT,
    "destinatarios" TEXT NOT NULL,
    "canales" TEXT NOT NULL,
    "plantillaTitulo" TEXT,
    "plantillaMensaje" TEXT,
    "severidad" TEXT NOT NULL DEFAULT 'info',
    "estado" TEXT NOT NULL DEFAULT 'active',
    "horarioNoMolestar" TEXT,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaModificacion" DATETIME NOT NULL,
    "creadoPorId" TEXT
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user_notification_preferences" (
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
    "horarioNoMolestarHabilitado" BOOLEAN NOT NULL DEFAULT false,
    "horarioNoMolestarInicio" TEXT,
    "horarioNoMolestarFin" TEXT,
    "horarioNoMolestarDias" TEXT,
    "preferenciasPorModulo" TEXT,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaModificacion" DATETIME NOT NULL
);
INSERT INTO "new_user_notification_preferences" ("emailHabilitado", "fechaCreacion", "fechaModificacion", "frecuenciaEmail", "habilitado", "horaResumen", "id", "inAppHabilitado", "notificarCritical", "notificarInfo", "notificarWarning", "preferenciasPorEntidad", "usuarioId") SELECT "emailHabilitado", "fechaCreacion", "fechaModificacion", "frecuenciaEmail", "habilitado", "horaResumen", "id", "inAppHabilitado", "notificarCritical", "notificarInfo", "notificarWarning", "preferenciasPorEntidad", "usuarioId" FROM "user_notification_preferences";
DROP TABLE "user_notification_preferences";
ALTER TABLE "new_user_notification_preferences" RENAME TO "user_notification_preferences";
CREATE UNIQUE INDEX "user_notification_preferences_usuarioId_key" ON "user_notification_preferences"("usuarioId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
