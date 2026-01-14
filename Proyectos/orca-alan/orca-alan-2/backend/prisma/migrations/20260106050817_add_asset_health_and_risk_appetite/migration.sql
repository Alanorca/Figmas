-- CreateTable
CREATE TABLE "risk_appetites" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "riesgoInherente" REAL NOT NULL,
    "riesgoResidual" REAL NOT NULL,
    "apetitoRiesgo" REAL NOT NULL,
    "categoriaRiesgo" TEXT NOT NULL,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_activos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "criticidad" TEXT NOT NULL,
    "responsable" TEXT NOT NULL,
    "departamento" TEXT NOT NULL,
    "fechaRegistro" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "plantillaId" TEXT,
    "propiedadesCustom" TEXT,
    "incidentToleranceThreshold" INTEGER NOT NULL DEFAULT 10,
    "currentIncidentCount" INTEGER NOT NULL DEFAULT 0,
    "healthStatus" TEXT NOT NULL DEFAULT 'HEALTHY',
    "lastIncidentDate" DATETIME,
    "requiresImmediateAttention" BOOLEAN NOT NULL DEFAULT false,
    "incidentCountResetDays" INTEGER NOT NULL DEFAULT 365,
    "assetValue" REAL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "parentAssetId" TEXT,
    "riskAppetiteId" TEXT,
    CONSTRAINT "activos_plantillaId_fkey" FOREIGN KEY ("plantillaId") REFERENCES "plantillas_activo" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "activos_parentAssetId_fkey" FOREIGN KEY ("parentAssetId") REFERENCES "activos" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "activos_riskAppetiteId_fkey" FOREIGN KEY ("riskAppetiteId") REFERENCES "risk_appetites" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_activos" ("criticidad", "departamento", "descripcion", "fechaRegistro", "id", "nombre", "plantillaId", "propiedadesCustom", "responsable", "tipo", "updatedAt") SELECT "criticidad", "departamento", "descripcion", "fechaRegistro", "id", "nombre", "plantillaId", "propiedadesCustom", "responsable", "tipo", "updatedAt" FROM "activos";
DROP TABLE "activos";
ALTER TABLE "new_activos" RENAME TO "activos";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
