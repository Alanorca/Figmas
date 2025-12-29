# Módulos, Roles y Permisos - Sistema ORCA

## Índice
1. [Estructura de Módulos](#estructura-de-módulos)
2. [Catálogo de Funcionalidades por Módulo](#catálogo-de-funcionalidades-por-módulo)
3. [Roles del Sistema](#roles-del-sistema)
4. [Matriz de Permisos](#matriz-de-permisos)
5. [Niveles de Acceso](#niveles-de-acceso)

---

## Estructura de Módulos

| # | Módulo | Icono | Submódulos | Ruta Base |
|---|--------|-------|------------|-----------|
| 1 | **Inicio** | `pi-home` | Dashboard General, Dashboard Custom, Tabla Unificada | `/dashboard`, `/dashboard-custom`, `/tabla-unificada` |
| 2 | **Results ML** | `pi-sparkles` | Respuestas ML | `/results-ml` |
| 3 | **Activos y Procesos** | `pi-box` | Activos, Procesos | `/activos`, `/procesos` |
| 4 | **Riesgos** | `pi-exclamation-triangle` | Riesgos, Incidentes, Defectos, Controles | `/riesgos`, `/incidentes`, `/defectos`, `/controles` |
| 5 | **Cumplimiento** | `pi-check-circle` | Cuestionarios, Revisiones | `/cuestionarios`, `/cumplimiento` |
| 6 | **Configuración** | `pi-cog` | Usuarios y Roles, Asignación Roles, Organigrama | `/usuarios-roles`, `/asignacion-roles`, `/organigramas` |

---

## Catálogo de Funcionalidades por Módulo

### 1. INICIO

#### 1.1 Dashboard General (`/dashboard`)
| Código | Funcionalidad | Descripción |
|--------|--------------|-------------|
| DASH-001 | Ver dashboard | Visualizar métricas y KPIs generales |
| DASH-002 | Ver gráficas | Visualizar gráficas de resumen |
| DASH-003 | Filtrar por período | Aplicar filtros de fecha a los datos |
| DASH-004 | Exportar datos | Descargar información del dashboard |

#### 1.2 Dashboard Custom (`/dashboard-custom`)
| Código | Funcionalidad | Descripción |
|--------|--------------|-------------|
| DCST-001 | Ver dashboard personalizado | Visualizar dashboard configurado |
| DCST-002 | Agregar widgets | Añadir nuevos widgets al dashboard |
| DCST-003 | Editar widgets | Modificar configuración de widgets |
| DCST-004 | Eliminar widgets | Remover widgets del dashboard |
| DCST-005 | Reorganizar layout | Cambiar posición de widgets |
| DCST-006 | Guardar configuración | Persistir cambios del dashboard |

#### 1.3 Tabla Unificada (`/tabla-unificada`)
| Código | Funcionalidad | Descripción |
|--------|--------------|-------------|
| TABU-001 | Ver registros | Visualizar tabla de datos unificada |
| TABU-002 | Filtrar registros | Aplicar filtros a los datos |
| TABU-003 | Ordenar columnas | Cambiar orden de visualización |
| TABU-004 | Buscar | Búsqueda global en registros |
| TABU-005 | Exportar | Descargar datos en diferentes formatos |
| TABU-006 | Configurar columnas | Mostrar/ocultar y reordenar columnas |
| TABU-007 | Acciones masivas | Editar múltiples registros |
| TABU-008 | Ver gráficas | Visualizar datos en gráficas |
| TABU-009 | Editar inline | Edición rápida de registros |

---

### 2. RESULTS ML

#### 2.1 Respuestas ML (`/results-ml`)
| Código | Funcionalidad | Descripción |
|--------|--------------|-------------|
| REML-001 | Ver resultados ML | Visualizar respuestas generadas por ML |
| REML-002 | Filtrar resultados | Aplicar filtros a resultados |
| REML-003 | Ver detalles | Ver detalle de cada resultado |
| REML-004 | Aprobar respuesta | Validar respuesta como correcta |
| REML-005 | Rechazar respuesta | Marcar respuesta como incorrecta |
| REML-006 | Exportar resultados | Descargar resultados ML |

---

### 3. ACTIVOS Y PROCESOS

#### 3.1 Activos (`/activos`)
| Código | Funcionalidad | Descripción |
|--------|--------------|-------------|
| ACTV-001 | Ver activos | Listar todos los activos |
| ACTV-002 | Crear activo | Registrar nuevo activo |
| ACTV-003 | Editar activo | Modificar información del activo |
| ACTV-004 | Eliminar activo | Dar de baja un activo |
| ACTV-005 | Ver detalle | Ver información completa del activo |
| ACTV-006 | Asignar responsable | Designar responsable del activo |
| ACTV-007 | Clasificar activo | Asignar clasificación al activo |
| ACTV-008 | Ver historial | Ver cambios históricos del activo |
| ACTV-009 | Exportar activos | Descargar listado de activos |

#### 3.2 Procesos (`/procesos`)
| Código | Funcionalidad | Descripción |
|--------|--------------|-------------|
| PROC-001 | Ver procesos | Listar todos los procesos |
| PROC-002 | Crear proceso | Diseñar nuevo proceso |
| PROC-003 | Editar proceso | Modificar flujo del proceso |
| PROC-004 | Eliminar proceso | Dar de baja un proceso |
| PROC-005 | Ver detalle | Ver información completa del proceso |
| PROC-006 | Diseñar flujo | Editar diagrama de flujo |
| PROC-007 | Vincular activos | Asociar activos al proceso |
| PROC-008 | Asignar responsable | Designar dueño del proceso |
| PROC-009 | Publicar proceso | Activar proceso para uso |
| PROC-010 | Versionar | Crear nueva versión del proceso |
| PROC-011 | Exportar proceso | Descargar documentación |

---

### 4. RIESGOS

#### 4.1 Riesgos (`/riesgos`)
| Código | Funcionalidad | Descripción |
|--------|--------------|-------------|
| RIES-001 | Ver riesgos | Listar todos los riesgos |
| RIES-002 | Crear riesgo | Registrar nuevo riesgo |
| RIES-003 | Editar riesgo | Modificar información del riesgo |
| RIES-004 | Eliminar riesgo | Dar de baja un riesgo |
| RIES-005 | Ver detalle | Ver información completa del riesgo |
| RIES-006 | Evaluar riesgo | Calcular impacto y probabilidad |
| RIES-007 | Asignar tratamiento | Definir plan de tratamiento |
| RIES-008 | Vincular controles | Asociar controles mitigantes |
| RIES-009 | Seguimiento | Registrar seguimiento del riesgo |
| RIES-010 | Exportar riesgos | Descargar listado de riesgos |

#### 4.2 Incidentes (`/incidentes`)
| Código | Funcionalidad | Descripción |
|--------|--------------|-------------|
| INCI-001 | Ver incidentes | Listar todos los incidentes |
| INCI-002 | Crear incidente | Reportar nuevo incidente |
| INCI-003 | Editar incidente | Modificar información del incidente |
| INCI-004 | Eliminar incidente | Dar de baja un incidente |
| INCI-005 | Ver detalle | Ver información completa |
| INCI-006 | Clasificar incidente | Asignar severidad y tipo |
| INCI-007 | Asignar responsable | Designar encargado de resolver |
| INCI-008 | Registrar acciones | Documentar acciones tomadas |
| INCI-009 | Cerrar incidente | Marcar como resuelto |
| INCI-010 | Vincular a riesgo | Asociar con riesgo relacionado |
| INCI-011 | Exportar incidentes | Descargar listado |

#### 4.3 Defectos (`/defectos`)
| Código | Funcionalidad | Descripción |
|--------|--------------|-------------|
| DFCT-001 | Ver defectos | Listar todos los defectos |
| DFCT-002 | Crear defecto | Reportar nuevo defecto |
| DFCT-003 | Editar defecto | Modificar información del defecto |
| DFCT-004 | Eliminar defecto | Dar de baja un defecto |
| DFCT-005 | Ver detalle | Ver información completa |
| DFCT-006 | Clasificar defecto | Asignar severidad y tipo |
| DFCT-007 | Asignar responsable | Designar encargado de corregir |
| DFCT-008 | Registrar solución | Documentar corrección aplicada |
| DFCT-009 | Cerrar defecto | Marcar como corregido |
| DFCT-010 | Exportar defectos | Descargar listado |

#### 4.4 Controles (`/controles`)
| Código | Funcionalidad | Descripción |
|--------|--------------|-------------|
| CTRL-001 | Ver controles | Listar todos los controles |
| CTRL-002 | Crear control | Registrar nuevo control |
| CTRL-003 | Editar control | Modificar información del control |
| CTRL-004 | Eliminar control | Dar de baja un control |
| CTRL-005 | Ver detalle | Ver información completa |
| CTRL-006 | Evaluar efectividad | Medir efectividad del control |
| CTRL-007 | Vincular a riesgos | Asociar riesgos mitigados |
| CTRL-008 | Programar pruebas | Calendarizar pruebas de control |
| CTRL-009 | Registrar evidencia | Documentar evidencia de operación |
| CTRL-010 | Exportar controles | Descargar listado |

---

### 5. CUMPLIMIENTO

#### 5.1 Cuestionarios (`/cuestionarios`)
| Código | Funcionalidad | Descripción |
|--------|--------------|-------------|
| CUES-001 | Ver cuestionarios | Listar todos los cuestionarios |
| CUES-002 | Crear cuestionario | Diseñar nuevo cuestionario |
| CUES-003 | Editar cuestionario | Modificar preguntas |
| CUES-004 | Eliminar cuestionario | Dar de baja cuestionario |
| CUES-005 | Ver detalle | Ver estructura completa |
| CUES-006 | Duplicar cuestionario | Copiar cuestionario existente |
| CUES-007 | Publicar | Activar para uso |
| CUES-008 | Versionar | Crear nueva versión |
| CUES-009 | Exportar | Descargar cuestionario |
| CUES-010 | Importar | Cargar cuestionario desde archivo |

#### 5.2 Revisiones (`/cumplimiento`)
| Código | Funcionalidad | Descripción |
|--------|--------------|-------------|
| REVI-001 | Ver revisiones | Listar todas las revisiones |
| REVI-002 | Crear revisión | Programar nueva revisión |
| REVI-003 | Editar revisión | Modificar configuración |
| REVI-004 | Eliminar revisión | Cancelar revisión |
| REVI-005 | Ver detalle | Ver estado y respuestas |
| REVI-006 | Asignar evaluadores | Designar responsables |
| REVI-007 | Asignar aprobadores | Designar aprobadores |
| REVI-008 | Enviar recordatorio | Notificar a pendientes |
| REVI-009 | Responder revisión | Completar cuestionario |
| REVI-010 | Aprobar respuestas | Validar respuestas |
| REVI-011 | Rechazar respuestas | Devolver para corrección |
| REVI-012 | Ver resultados | Consultar métricas |
| REVI-013 | Exportar resultados | Descargar informe |
| REVI-014 | Cerrar revisión | Finalizar ciclo de revisión |

---

### 6. CONFIGURACIÓN

#### 6.1 Usuarios y Roles (`/usuarios-roles`)
| Código | Funcionalidad | Descripción |
|--------|--------------|-------------|
| USRO-001 | Ver usuarios | Listar todos los usuarios |
| USRO-002 | Crear usuario | Registrar nuevo usuario |
| USRO-003 | Editar usuario | Modificar información del usuario |
| USRO-004 | Eliminar usuario | Dar de baja usuario |
| USRO-005 | Ver detalle usuario | Ver información completa |
| USRO-006 | Activar/Desactivar | Cambiar estado del usuario |
| USRO-007 | Asignar roles | Vincular roles al usuario |
| USRO-008 | Configurar 2FA | Gestionar autenticación |
| USRO-009 | Ver roles | Listar todos los roles |
| USRO-010 | Crear rol | Definir nuevo rol |
| USRO-011 | Editar rol | Modificar permisos del rol |
| USRO-012 | Eliminar rol | Dar de baja rol |
| USRO-013 | Ver detalle rol | Ver permisos del rol |
| USRO-014 | Duplicar rol | Copiar rol existente |
| USRO-015 | Exportar | Descargar listado |

#### 6.2 Asignación de Roles (`/asignacion-roles`)
| Código | Funcionalidad | Descripción |
|--------|--------------|-------------|
| ASRO-001 | Ver asignaciones | Listar asignaciones de roles |
| ASRO-002 | Asignar rol | Vincular rol a usuario |
| ASRO-003 | Revocar rol | Quitar rol de usuario |
| ASRO-004 | Ver historial | Ver cambios de asignación |
| ASRO-005 | Asignación masiva | Asignar rol a múltiples usuarios |

#### 6.3 Organigrama (`/organigramas`)
| Código | Funcionalidad | Descripción |
|--------|--------------|-------------|
| ORGA-001 | Ver organigrama | Visualizar estructura organizacional |
| ORGA-002 | Crear nodo | Agregar posición/área |
| ORGA-003 | Editar nodo | Modificar información |
| ORGA-004 | Eliminar nodo | Remover posición/área |
| ORGA-005 | Mover nodo | Reorganizar estructura |
| ORGA-006 | Asignar persona | Vincular usuario a posición |
| ORGA-007 | Exportar | Descargar organigrama |

---

### 7. PERFIL DE USUARIO

#### 7.1 Mi Perfil (`/perfil`)
| Código | Funcionalidad | Descripción |
|--------|--------------|-------------|
| PERF-001 | Ver perfil | Visualizar información personal |
| PERF-002 | Editar perfil | Modificar datos personales |
| PERF-003 | Cambiar contraseña | Actualizar credenciales |
| PERF-004 | Configurar 2FA | Activar/desactivar autenticación |
| PERF-005 | Preferencias | Configurar preferencias de UI |
| PERF-006 | Ver sesiones | Ver sesiones activas |
| PERF-007 | Cerrar sesiones | Terminar otras sesiones |

---

## Roles del Sistema

| Código | Rol | Descripción | Nivel de Acceso |
|--------|-----|-------------|-----------------|
| ROL-001 | **Admin Backoffice** | Administrador técnico con acceso total al sistema | Total |
| ROL-002 | **Administrador** | Gestión completa de la organización y usuarios | Total |
| ROL-003 | **Gestor Áreas** | Gestión de áreas, activos y procesos | Administración |
| ROL-004 | **Director** | Visión estratégica, aprobaciones y reportes | Administración |
| ROL-005 | **Coordinador** | Coordinación de equipos y gestión operativa | Edición |
| ROL-006 | **Gerente** | Gestión de área con procesos y riesgos | Edición |
| ROL-007 | **Analista** | Análisis de información y ejecución de tareas | Edición Limitada |
| ROL-008 | **Invitado** | Solo puede responder cuestionarios asignados | Lectura

---

## Matriz de Permisos

### Leyenda
- ✅ = Permitido
- ❌ = No permitido
- 🔶 = Permitido con restricciones (solo registros propios/asignados)

### Módulo: INICIO (Dashboard)

| Funcionalidad | Admin Backoffice | Administrador | Gestor Áreas | Director | Coordinador | Gerente | Analista | Invitado |
|---------------|:----------------:|:-------------:|:------------:|:--------:|:-----------:|:-------:|:--------:|:--------:|
| Ver dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Dashboard Custom - Editar | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Tabla Unificada - Ver | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Tabla Unificada - Editar | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | 🔶 | ❌ |
| Tabla Unificada - Exportar | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

### Módulo: RESULTS ML

| Funcionalidad | Admin Backoffice | Administrador | Gestor Áreas | Director | Coordinador | Gerente | Analista | Invitado |
|---------------|:----------------:|:-------------:|:------------:|:--------:|:-----------:|:-------:|:--------:|:--------:|
| Ver resultados | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Aprobar/Rechazar | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Exportar | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

### Módulo: ACTIVOS

| Funcionalidad | Admin Backoffice | Administrador | Gestor Áreas | Director | Coordinador | Gerente | Analista | Invitado |
|---------------|:----------------:|:-------------:|:------------:|:--------:|:-----------:|:-------:|:--------:|:--------:|
| Ver activos | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Crear activo | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Editar activo | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Eliminar activo | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Exportar | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

### Módulo: PROCESOS

| Funcionalidad | Admin Backoffice | Administrador | Gestor Áreas | Director | Coordinador | Gerente | Analista | Invitado |
|---------------|:----------------:|:-------------:|:------------:|:--------:|:-----------:|:-------:|:--------:|:--------:|
| Ver procesos | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Crear proceso | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Editar proceso | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Eliminar proceso | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Diseñar flujo | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Publicar | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Exportar | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

### Módulo: RIESGOS

| Funcionalidad | Admin Backoffice | Administrador | Gestor Áreas | Director | Coordinador | Gerente | Analista | Invitado |
|---------------|:----------------:|:-------------:|:------------:|:--------:|:-----------:|:-------:|:--------:|:--------:|
| Ver riesgos | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Crear riesgo | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | 🔶 | ❌ |
| Editar riesgo | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | 🔶 | ❌ |
| Eliminar riesgo | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Evaluar riesgo | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ |
| Vincular controles | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Exportar | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

### Módulo: INCIDENTES

| Funcionalidad | Admin Backoffice | Administrador | Gestor Áreas | Director | Coordinador | Gerente | Analista | Invitado |
|---------------|:----------------:|:-------------:|:------------:|:--------:|:-----------:|:-------:|:--------:|:--------:|
| Ver incidentes | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Crear incidente | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ |
| Editar incidente | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | 🔶 | ❌ |
| Cerrar incidente | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Exportar | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

### Módulo: DEFECTOS

| Funcionalidad | Admin Backoffice | Administrador | Gestor Áreas | Director | Coordinador | Gerente | Analista | Invitado |
|---------------|:----------------:|:-------------:|:------------:|:--------:|:-----------:|:-------:|:--------:|:--------:|
| Ver defectos | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Crear defecto | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ |
| Editar defecto | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | 🔶 | ❌ |
| Cerrar defecto | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Exportar | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

### Módulo: CONTROLES

| Funcionalidad | Admin Backoffice | Administrador | Gestor Áreas | Director | Coordinador | Gerente | Analista | Invitado |
|---------------|:----------------:|:-------------:|:------------:|:--------:|:-----------:|:-------:|:--------:|:--------:|
| Ver controles | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Crear control | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Editar control | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Eliminar control | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Evaluar efectividad | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Exportar | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

### Módulo: CUMPLIMIENTO (Cuestionarios y Revisiones)

| Funcionalidad | Admin Backoffice | Administrador | Gestor Áreas | Director | Coordinador | Gerente | Analista | Invitado |
|---------------|:----------------:|:-------------:|:------------:|:--------:|:-----------:|:-------:|:--------:|:--------:|
| Ver cuestionarios | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🔶 |
| Crear cuestionario | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Editar cuestionario | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Eliminar cuestionario | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Ver revisiones | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🔶 | 🔶 |
| Crear revisión | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Asignar evaluadores | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Responder revisión | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Aprobar/Rechazar | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Ver resultados | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🔶 | ❌ |
| Exportar | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

### Módulo: CONFIGURACIÓN

| Funcionalidad | Admin Backoffice | Administrador | Gestor Áreas | Director | Coordinador | Gerente | Analista | Invitado |
|---------------|:----------------:|:-------------:|:------------:|:--------:|:-----------:|:-------:|:--------:|:--------:|
| Ver usuarios | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Crear/Editar usuario | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Eliminar usuario | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Ver roles | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Asignar roles | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Ver organigrama | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Editar organigrama | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Niveles de Acceso

| Nivel | Código | Descripción | Permisos Típicos |
|-------|--------|-------------|------------------|
| **Total** | `total` | Acceso sin restricciones | Todas las operaciones CRUD + Configuración del sistema |
| **Administración** | `administracion` | Gestión completa de un dominio | CRUD completo en su módulo |
| **Edición** | `edicion` | Crear y modificar registros | Crear, Leer, Actualizar |
| **Edición Limitada** | `edicion_limitada` | Solo modificar registros propios | Crear, Leer propio, Actualizar propio |
| **Aprobación** | `aprobacion` | Validar y aprobar registros | Leer, Aprobar, Rechazar |
| **Lectura** | `lectura` | Solo consulta | Leer, Exportar (limitado) |

---

## Notas de Implementación

### Herencia de Permisos
- Los permisos de nivel superior incluyen los de nivel inferior
- `Total` > `Administración` > `Edición` > `Edición Limitada` > `Aprobación` > `Lectura`

### Restricciones Especiales
- **Roles del Sistema**: No pueden ser eliminados ni modificados sus permisos base
- **Administrador del Sistema**: Siempre debe existir al menos uno
- **Acceso por Árbol de Activos**: Los permisos pueden restringirse a ramas específicas del organigrama

### Auditoría
- Todas las acciones de modificación quedan registradas en log de auditoría
- Los cambios en roles y permisos requieren aprobación de segundo nivel

---

*Documento generado el: $(date)*
*Versión: 1.0*
*Sistema: ORCA - Gestión de Riesgos Operacionales*
