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
    "rateLimitHabilitado" BOOLEAN NOT NULL DEFAULT true,
    "rateLimitMaxPorHora" INTEGER NOT NULL DEFAULT 100,
    "preferenciasPorModulo" TEXT,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaModificacion" DATETIME NOT NULL
);
INSERT INTO "new_user_notification_preferences" ("emailHabilitado", "fechaCreacion", "fechaModificacion", "frecuenciaEmail", "habilitado", "horaResumen", "horarioNoMolestarDias", "horarioNoMolestarFin", "horarioNoMolestarHabilitado", "horarioNoMolestarInicio", "id", "inAppHabilitado", "notificarCritical", "notificarInfo", "notificarWarning", "preferenciasPorEntidad", "preferenciasPorModulo", "usuarioId") SELECT "emailHabilitado", "fechaCreacion", "fechaModificacion", "frecuenciaEmail", "habilitado", "horaResumen", "horarioNoMolestarDias", "horarioNoMolestarFin", "horarioNoMolestarHabilitado", "horarioNoMolestarInicio", "id", "inAppHabilitado", "notificarCritical", "notificarInfo", "notificarWarning", "preferenciasPorEntidad", "preferenciasPorModulo", "usuarioId" FROM "user_notification_preferences";
DROP TABLE "user_notification_preferences";
ALTER TABLE "new_user_notification_preferences" RENAME TO "user_notification_preferences";
CREATE UNIQUE INDEX "user_notification_preferences_usuarioId_key" ON "user_notification_preferences"("usuarioId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
