/*
  Warnings:

  - You are about to drop the column `expanded` on the `activos` table. All the data in the column will be lost.
  - You are about to drop the column `icono` on the `activos` table. All the data in the column will be lost.
  - You are about to drop the column `nivelAcceso` on the `activos` table. All the data in the column will be lost.
  - You are about to drop the column `padreId` on the `activos` table. All the data in the column will be lost.
  - Added the required column `criticidad` to the `activos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departamento` to the `activos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `descripcion` to the `activos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `responsable` to the `activos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `activos` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "activos_acceso" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "icono" TEXT,
    "nivelAcceso" TEXT,
    "expanded" BOOLEAN NOT NULL DEFAULT false,
    "padreId" TEXT,
    CONSTRAINT "activos_acceso_padreId_fkey" FOREIGN KEY ("padreId") REFERENCES "activos_acceso" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "plantillas_activo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "tipoActivo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "icono" TEXT,
    "color" TEXT,
    "propiedades" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "riesgos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "activoId" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "probabilidad" INTEGER NOT NULL,
    "impacto" INTEGER NOT NULL,
    "estado" TEXT NOT NULL,
    "fechaIdentificacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responsable" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "riesgos_activoId_fkey" FOREIGN KEY ("activoId") REFERENCES "activos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "incidentes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "activoId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "severidad" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "fechaReporte" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reportadoPor" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "incidentes_activoId_fkey" FOREIGN KEY ("activoId") REFERENCES "activos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "defectos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "activoId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "prioridad" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "fechaDeteccion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "detectadoPor" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "defectos_activoId_fkey" FOREIGN KEY ("activoId") REFERENCES "activos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "organigramas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "nodos_organigrama" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organigramaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "departamento" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "foto" TEXT,
    "padreId" TEXT,
    CONSTRAINT "nodos_organigrama_organigramaId_fkey" FOREIGN KEY ("organigramaId") REFERENCES "organigramas" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "nodos_organigrama_padreId_fkey" FOREIGN KEY ("padreId") REFERENCES "nodos_organigrama" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "marcos_normativos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "acronimo" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "fechaVigencia" DATETIME NOT NULL,
    "descripcion" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "requisitos_normativos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "marcoId" TEXT NOT NULL,
    "controlesAsociados" TEXT NOT NULL,
    CONSTRAINT "requisitos_normativos_marcoId_fkey" FOREIGN KEY ("marcoId") REFERENCES "marcos_normativos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cuestionarios" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "tipoEvaluacion" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'borrador',
    "marcoNormativoId" TEXT,
    "periodicidad" TEXT NOT NULL,
    "tasaCompletado" REAL NOT NULL DEFAULT 0,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaModificacion" DATETIME NOT NULL,
    "umbrales" TEXT NOT NULL,
    "areasObjetivo" TEXT NOT NULL,
    "responsables" TEXT NOT NULL,
    CONSTRAINT "cuestionarios_marcoNormativoId_fkey" FOREIGN KEY ("marcoNormativoId") REFERENCES "marcos_normativos" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "secciones" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cuestionarioId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "peso" REAL NOT NULL DEFAULT 1,
    "requerida" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "secciones_cuestionarioId_fkey" FOREIGN KEY ("cuestionarioId") REFERENCES "cuestionarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "preguntas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "seccionId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "requerida" BOOLEAN NOT NULL DEFAULT true,
    "peso" REAL NOT NULL DEFAULT 1,
    "opciones" TEXT,
    "escalaMin" INTEGER,
    "escalaMax" INTEGER,
    "ayuda" TEXT,
    "placeholder" TEXT,
    "requisitoNormativoId" TEXT,
    "controlAsociado" TEXT,
    "requiereEvidencia" BOOLEAN NOT NULL DEFAULT false,
    "maxStars" INTEGER,
    "leftAnchor" TEXT,
    "rightAnchor" TEXT,
    "likertLabels" TEXT,
    "displayConditionQuestionId" TEXT,
    "displayConditionAnswer" TEXT,
    "logicaCondicional" TEXT,
    "isCalculated" BOOLEAN NOT NULL DEFAULT false,
    "formula" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "preguntas_seccionId_fkey" FOREIGN KEY ("seccionId") REFERENCES "secciones" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "asignaciones_cuestionario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cuestionarioId" TEXT NOT NULL,
    "cuestionarioIds" TEXT,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipoRevision" TEXT NOT NULL,
    "usuariosAsignados" TEXT NOT NULL,
    "usuariosAsignadosNombres" TEXT NOT NULL,
    "emailsExternos" TEXT,
    "contrasenaAcceso" TEXT,
    "activosObjetivo" TEXT NOT NULL,
    "activosObjetivoNombres" TEXT NOT NULL,
    "procesosObjetivo" TEXT NOT NULL,
    "procesosObjetivoNombres" TEXT NOT NULL,
    "aprobadores" TEXT NOT NULL,
    "aprobadoresNombres" TEXT NOT NULL,
    "evaluadosInternos" TEXT,
    "evaluadosInternosNombres" TEXT,
    "areaId" TEXT NOT NULL,
    "areaNombre" TEXT NOT NULL,
    "responsableId" TEXT NOT NULL,
    "responsableNombre" TEXT NOT NULL,
    "fechaAsignacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaInicio" DATETIME NOT NULL,
    "fechaVencimiento" DATETIME NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "progreso" REAL NOT NULL DEFAULT 0,
    "instrucciones" TEXT,
    "recordatorios" BOOLEAN NOT NULL DEFAULT true,
    "tokenAccesoExterno" TEXT,
    "recurrencia" TEXT,
    CONSTRAINT "asignaciones_cuestionario_cuestionarioId_fkey" FOREIGN KEY ("cuestionarioId") REFERENCES "cuestionarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "evaluados_externos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "asignacionId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "invitacionEnviada" BOOLEAN NOT NULL DEFAULT false,
    "fechaInvitacion" DATETIME,
    "haRespondido" BOOLEAN NOT NULL DEFAULT false,
    "fechaRespuesta" DATETIME,
    CONSTRAINT "evaluados_externos_asignacionId_fkey" FOREIGN KEY ("asignacionId") REFERENCES "asignaciones_cuestionario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "respuestas_cuestionario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "asignacionId" TEXT NOT NULL,
    "cuestionarioId" TEXT NOT NULL,
    "respondidoPorId" TEXT NOT NULL,
    "fechaInicio" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaEnvio" DATETIME,
    "estado" TEXT NOT NULL DEFAULT 'borrador',
    "puntuacionTotal" REAL NOT NULL DEFAULT 0,
    "nivelCumplimiento" TEXT,
    "comentariosGenerales" TEXT,
    CONSTRAINT "respuestas_cuestionario_asignacionId_fkey" FOREIGN KEY ("asignacionId") REFERENCES "asignaciones_cuestionario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "respuestas_cuestionario_respondidoPorId_fkey" FOREIGN KEY ("respondidoPorId") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "respuestas_pregunta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "respuestaCuestionarioId" TEXT NOT NULL,
    "preguntaId" TEXT NOT NULL,
    "valor" TEXT,
    "comentario" TEXT,
    "archivosAdjuntos" TEXT,
    "marcadaParaRevision" BOOLEAN NOT NULL DEFAULT false,
    "estadoRevision" TEXT NOT NULL DEFAULT 'pendiente',
    "comentarioRevisor" TEXT,
    CONSTRAINT "respuestas_pregunta_respuestaCuestionarioId_fkey" FOREIGN KEY ("respuestaCuestionarioId") REFERENCES "respuestas_cuestionario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "respuestas_pregunta_preguntaId_fkey" FOREIGN KEY ("preguntaId") REFERENCES "preguntas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "evidencias" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "respuestaPreguntaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "tamano" INTEGER NOT NULL,
    "fechaCarga" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "url" TEXT NOT NULL,
    "descripcion" TEXT,
    "vigencia" DATETIME,
    "estado" TEXT NOT NULL DEFAULT 'vigente',
    CONSTRAINT "evidencias_respuestaPreguntaId_fkey" FOREIGN KEY ("respuestaPreguntaId") REFERENCES "respuestas_pregunta" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "hallazgos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "preguntaId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "requisitoNormativo" TEXT,
    "accionCorrectiva" TEXT,
    "responsable" TEXT NOT NULL,
    "fechaLimite" DATETIME,
    "estado" TEXT NOT NULL DEFAULT 'abierto',
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "hallazgos_preguntaId_fkey" FOREIGN KEY ("preguntaId") REFERENCES "preguntas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "mensajes_chat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "asignacionId" TEXT NOT NULL,
    "cuestionarioId" TEXT,
    "activoProcesoId" TEXT,
    "usuarioId" TEXT NOT NULL,
    "usuarioNombre" TEXT NOT NULL,
    "usuarioRol" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leido" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "mensajes_chat_asignacionId_fkey" FOREIGN KEY ("asignacionId") REFERENCES "asignaciones_cuestionario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "alertas_cumplimiento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "severidad" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "entidadId" TEXT NOT NULL,
    "entidadTipo" TEXT NOT NULL,
    "fechaGeneracion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT NOT NULL DEFAULT 'activa',
    "responsable" TEXT,
    "marcoNormativo" TEXT
);

-- CreateTable
CREATE TABLE "procesos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "estado" TEXT NOT NULL DEFAULT 'borrador',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "process_nodes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "procesoId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "descripcion" TEXT,
    "config" TEXT NOT NULL,
    "positionX" REAL NOT NULL,
    "positionY" REAL NOT NULL,
    CONSTRAINT "process_nodes_procesoId_fkey" FOREIGN KEY ("procesoId") REFERENCES "procesos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "process_edges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "procesoId" TEXT NOT NULL,
    "sourceNodeId" TEXT NOT NULL,
    "targetNodeId" TEXT NOT NULL,
    "sourceHandle" TEXT,
    "targetHandle" TEXT,
    "label" TEXT,
    CONSTRAINT "process_edges_procesoId_fkey" FOREIGN KEY ("procesoId") REFERENCES "procesos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "process_edges_sourceNodeId_fkey" FOREIGN KEY ("sourceNodeId") REFERENCES "process_nodes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "process_edges_targetNodeId_fkey" FOREIGN KEY ("targetNodeId") REFERENCES "process_nodes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "objetivos_proceso" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "procesoId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "progreso" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "objetivos_proceso_procesoId_fkey" FOREIGN KEY ("procesoId") REFERENCES "procesos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "kpis_proceso" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "procesoId" TEXT NOT NULL,
    "objetivoId" TEXT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "unidad" TEXT NOT NULL,
    "meta" REAL NOT NULL,
    "valorActual" REAL NOT NULL DEFAULT 0,
    "fechaUltimaActualizacion" DATETIME,
    "alertaAdvertencia" REAL,
    "alertaCritico" REAL,
    "alertaDireccion" TEXT NOT NULL DEFAULT 'menor',
    CONSTRAINT "kpis_proceso_procesoId_fkey" FOREIGN KEY ("procesoId") REFERENCES "procesos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "kpis_proceso_objetivoId_fkey" FOREIGN KEY ("objetivoId") REFERENCES "objetivos_proceso" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "kpi_historico" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kpiId" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "procesoId" TEXT NOT NULL,
    "nodoId" TEXT,
    "metadatos" TEXT,
    CONSTRAINT "kpi_historico_kpiId_fkey" FOREIGN KEY ("kpiId") REFERENCES "kpis_proceso" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "kpi_historico_nodoId_fkey" FOREIGN KEY ("nodoId") REFERENCES "process_nodes" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "dashboard_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "columns" INTEGER NOT NULL DEFAULT 12,
    "rowHeight" INTEGER NOT NULL DEFAULT 50,
    "gap" INTEGER NOT NULL DEFAULT 10,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT
);

-- CreateTable
CREATE TABLE "dashboard_widgets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dashboardId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "subtitulo" TEXT,
    "icono" TEXT,
    "config" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "cols" INTEGER NOT NULL,
    "rows" INTEGER NOT NULL,
    "canResize" BOOLEAN NOT NULL DEFAULT true,
    "canDrag" BOOLEAN NOT NULL DEFAULT true,
    "canRemove" BOOLEAN NOT NULL DEFAULT true,
    "canEdit" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "dashboard_widgets_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "dashboard_configs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "catalogos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "color" TEXT,
    "icono" TEXT,
    "metadata" TEXT
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
    CONSTRAINT "activos_plantillaId_fkey" FOREIGN KEY ("plantillaId") REFERENCES "plantillas_activo" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_activos" ("id", "nombre", "tipo") SELECT "id", "nombre", "tipo" FROM "activos";
DROP TABLE "activos";
ALTER TABLE "new_activos" RENAME TO "activos";
CREATE TABLE "new_usuarios_activos" (
    "usuarioId" TEXT NOT NULL,
    "activoId" TEXT NOT NULL,
    "nivelAcceso" TEXT NOT NULL DEFAULT 'lectura',

    PRIMARY KEY ("usuarioId", "activoId"),
    CONSTRAINT "usuarios_activos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "usuarios_activos_activoId_fkey" FOREIGN KEY ("activoId") REFERENCES "activos_acceso" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_usuarios_activos" ("activoId", "nivelAcceso", "usuarioId") SELECT "activoId", "nivelAcceso", "usuarioId" FROM "usuarios_activos";
DROP TABLE "usuarios_activos";
ALTER TABLE "new_usuarios_activos" RENAME TO "usuarios_activos";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "catalogos_tipo_codigo_key" ON "catalogos"("tipo", "codigo");
