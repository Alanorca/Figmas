-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "telefono" TEXT,
    "avatar" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "departamento" TEXT,
    "cargo" TEXT,
    "region" TEXT NOT NULL DEFAULT 'MX',
    "autenticacionDosFactor" BOOLEAN NOT NULL DEFAULT false,
    "cambioPasswordRequerido" BOOLEAN NOT NULL DEFAULT true,
    "sesionesActivas" INTEGER NOT NULL DEFAULT 0,
    "maxSesionesPermitidas" INTEGER NOT NULL DEFAULT 3,
    "ultimoCambioPassword" DATETIME,
    "intentosFallidos" INTEGER NOT NULL DEFAULT 0,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaExpiracion" DATETIME,
    "ultimoAcceso" DATETIME,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "nivelAcceso" TEXT NOT NULL DEFAULT 'lectura',
    "region" TEXT NOT NULL DEFAULT 'MX',
    "tipoArbol" TEXT NOT NULL DEFAULT 'activos',
    "color" TEXT,
    "icono" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "esRolSistema" BOOLEAN NOT NULL DEFAULT false,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaModificacion" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "permisos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "modulo" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "padreId" TEXT,
    CONSTRAINT "permisos_padreId_fkey" FOREIGN KEY ("padreId") REFERENCES "permisos" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "modulos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "icono" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "permisoCreacion" BOOLEAN NOT NULL DEFAULT false,
    "permisoEdicion" BOOLEAN NOT NULL DEFAULT false,
    "permisoVisualizacion" BOOLEAN NOT NULL DEFAULT true,
    "permisoEliminacion" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "activos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "icono" TEXT,
    "nivelAcceso" TEXT,
    "expanded" BOOLEAN NOT NULL DEFAULT false,
    "padreId" TEXT,
    CONSTRAINT "activos_padreId_fkey" FOREIGN KEY ("padreId") REFERENCES "activos" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "logs_auditoria" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" TEXT NOT NULL,
    "entidadNombre" TEXT NOT NULL,
    "detalles" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT NOT NULL,
    CONSTRAINT "logs_auditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "usuarios_roles" (
    "usuarioId" TEXT NOT NULL,
    "rolId" TEXT NOT NULL,
    "fechaAsignacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("usuarioId", "rolId"),
    CONSTRAINT "usuarios_roles_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "usuarios_roles_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "roles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "roles_permisos" (
    "rolId" TEXT NOT NULL,
    "permisoId" TEXT NOT NULL,

    PRIMARY KEY ("rolId", "permisoId"),
    CONSTRAINT "roles_permisos_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "roles" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "roles_permisos_permisoId_fkey" FOREIGN KEY ("permisoId") REFERENCES "permisos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "usuarios_activos" (
    "usuarioId" TEXT NOT NULL,
    "activoId" TEXT NOT NULL,
    "nivelAcceso" TEXT NOT NULL DEFAULT 'lectura',

    PRIMARY KEY ("usuarioId", "activoId"),
    CONSTRAINT "usuarios_activos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "usuarios_activos_activoId_fkey" FOREIGN KEY ("activoId") REFERENCES "activos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "permisos_codigo_key" ON "permisos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "modulos_nombre_key" ON "modulos"("nombre");
