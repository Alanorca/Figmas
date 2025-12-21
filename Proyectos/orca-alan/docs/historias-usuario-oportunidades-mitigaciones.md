# Historias de Usuario - Módulo de Oportunidades y Mitigaciones

## Épica: Gestión de Oportunidades y Mitigaciones de Riesgos

### 1. Lista de Oportunidades y Mitigaciones

#### HU-OM-001: Ver lista de oportunidades y mitigaciones
**Como** usuario del sistema
**Quiero** ver una lista de todas las oportunidades y mitigaciones registradas
**Para** tener visibilidad de las acciones de tratamiento de riesgos

**Criterios de Aceptación:**
- Mostrar tabla con columnas: ID, Nombre, Tipo (Oportunidad/Mitigación), Riesgo Asociado, Estado, Responsable, Fecha Límite
- Permitir ordenamiento por cualquier columna
- Permitir búsqueda global por nombre o descripción
- Mostrar paginación con opciones de 10, 25, 50 registros
- Mostrar contador total de registros

#### HU-OM-002: Filtrar oportunidades y mitigaciones
**Como** usuario del sistema
**Quiero** filtrar la lista por diferentes criterios
**Para** encontrar rápidamente las acciones que necesito

**Criterios de Aceptación:**
- Filtrar por tipo (Oportunidad, Mitigación)
- Filtrar por estado (Pendiente, En Progreso, Completada, Cancelada)
- Filtrar por prioridad (Alta, Media, Baja)
- Filtrar por riesgo asociado
- Filtrar por responsable
- Filtrar por rango de fechas
- Permitir combinar múltiples filtros
- Mostrar indicador de filtros activos

#### HU-OM-003: Selección múltiple
**Como** usuario del sistema
**Quiero** seleccionar múltiples registros de la lista
**Para** realizar acciones masivas sobre ellos

**Criterios de Aceptación:**
- Checkbox en cada fila para selección individual
- Checkbox en header para seleccionar todos
- Mostrar contador de registros seleccionados
- Botón "Acciones masivas" visible cuando hay selección
- Permitir cambiar estado masivamente
- Permitir asignar responsable masivamente
- Permitir exportar registros seleccionados

---

### 2. Detalle de Oportunidad/Mitigación

#### HU-OM-004: Ver detalle
**Como** usuario del sistema
**Quiero** ver el detalle completo de una oportunidad o mitigación
**Para** conocer toda la información relacionada

**Criterios de Aceptación:**
- Mostrar breadcrumb de navegación
- Mostrar nombre y descripción
- Mostrar tipo con badge de color (Oportunidad: verde, Mitigación: azul)
- Mostrar estado con indicador visual
- Mostrar tabs: Información General, Tareas, Seguimiento, Documentos
- Mostrar panel lateral con resumen
- Botones de acción: Editar, Cambiar Estado

#### HU-OM-005: Ver información general
**Como** usuario del sistema
**Quiero** ver la información general de una oportunidad o mitigación
**Para** conocer sus características principales

**Criterios de Aceptación:**
- Mostrar ID único
- Mostrar tipo (Oportunidad/Mitigación)
- Mostrar riesgo(s) asociado(s)
- Mostrar descripción detallada
- Mostrar estrategia de tratamiento
- Mostrar prioridad con indicador visual
- Mostrar responsable con avatar
- Mostrar fechas: creación, inicio planificado, fecha límite
- Mostrar costo estimado (si aplica)
- Mostrar beneficio esperado (si aplica)

#### HU-OM-006: Ver tareas asociadas
**Como** usuario del sistema
**Quiero** ver las tareas vinculadas a una oportunidad o mitigación
**Para** dar seguimiento a las actividades de implementación

**Criterios de Aceptación:**
- Mostrar lista de tareas con estado
- Columnas: Nombre, Responsable, Estado, Fecha Límite, Progreso
- Permitir crear nuevas tareas
- Permitir editar tareas existentes
- Permitir marcar tareas como completadas
- Mostrar barra de progreso general

#### HU-OM-007: Ver seguimiento
**Como** usuario del sistema
**Quiero** ver el historial de seguimiento
**Para** conocer la evolución de la implementación

**Criterios de Aceptación:**
- Mostrar timeline de actividad
- Mostrar notas de seguimiento con fecha y autor
- Permitir agregar nuevas notas
- Mostrar cambios de estado
- Mostrar métricas de avance

#### HU-OM-008: Ver documentos adjuntos
**Como** usuario del sistema
**Quiero** ver los documentos asociados
**Para** acceder a evidencias y documentación de soporte

**Criterios de Aceptación:**
- Mostrar lista de documentos adjuntos
- Mostrar nombre, tipo, tamaño, fecha de carga
- Permitir descargar documentos
- Permitir agregar nuevos documentos
- Permitir eliminar documentos

---

### 3. Crear y Editar

#### HU-OM-009: Crear nueva oportunidad
**Como** usuario con permisos de creación
**Quiero** registrar una nueva oportunidad
**Para** documentar acciones de aprovechamiento de riesgos positivos

**Criterios de Aceptación:**
- Formulario con campos obligatorios: Nombre, Riesgo Asociado, Descripción, Responsable
- Campos opcionales: Estrategia, Fecha Límite, Costo Estimado, Beneficio Esperado
- Validación de campos requeridos
- Generación automática de ID único
- Estado inicial: "Pendiente"
- Mensaje de confirmación al crear
- Redirección al detalle creado

#### HU-OM-010: Crear nueva mitigación
**Como** usuario con permisos de creación
**Quiero** registrar una nueva mitigación
**Para** documentar acciones de tratamiento de riesgos negativos

**Criterios de Aceptación:**
- Formulario con campos obligatorios: Nombre, Riesgo Asociado, Descripción, Responsable
- Campos opcionales: Tipo de Mitigación (Evitar, Transferir, Reducir, Aceptar), Fecha Límite, Costo Estimado
- Validación de campos requeridos
- Generación automática de ID único
- Estado inicial: "Pendiente"
- Mensaje de confirmación al crear
- Redirección al detalle creado

#### HU-OM-011: Editar oportunidad o mitigación
**Como** usuario con permisos de edición
**Quiero** modificar la información de un registro
**Para** mantener actualizada la documentación

**Criterios de Aceptación:**
- Permitir editar todos los campos excepto ID y fecha de creación
- Validación de campos requeridos
- Registro automático de fecha de modificación
- Registro en historial de auditoría
- Mensaje de confirmación al guardar
- Opción de cancelar cambios

#### HU-OM-012: Cambiar estado
**Como** usuario con permisos de edición
**Quiero** cambiar el estado de un registro
**Para** reflejar su situación actual

**Criterios de Aceptación:**
- Estados disponibles: Pendiente, En Progreso, Completada, Cancelada
- Solicitar motivo del cambio (opcional)
- Registro en historial de auditoría
- Notificación al responsable
- Validar transiciones de estado permitidas

#### HU-OM-013: Eliminar registro
**Como** usuario con permisos de administración
**Quiero** eliminar una oportunidad o mitigación
**Para** remover registros que ya no aplican

**Criterios de Aceptación:**
- Solicitar confirmación antes de eliminar
- Verificar que no tenga dependencias activas
- Opción de archivar en lugar de eliminar
- Registro en historial de auditoría
- Notificación al responsable

---

### 4. Relaciones con Riesgos

#### HU-OM-014: Vincular a riesgo
**Como** usuario del sistema
**Quiero** vincular oportunidades y mitigaciones a riesgos
**Para** documentar el plan de tratamiento

**Criterios de Aceptación:**
- Buscar riesgos para vincular
- Mostrar riesgos ya vinculados
- Permitir desvincular riesgos
- Validar que al menos un riesgo esté vinculado
- Mostrar impacto en el nivel de riesgo residual

#### HU-OM-015: Ver desde riesgo
**Como** usuario del sistema
**Quiero** ver las oportunidades y mitigaciones desde el detalle de un riesgo
**Para** conocer las acciones de tratamiento planificadas

**Criterios de Aceptación:**
- Mostrar lista de oportunidades asociadas
- Mostrar lista de mitigaciones asociadas
- Mostrar estado de cada acción
- Permitir crear nuevas acciones desde el riesgo
- Navegar al detalle de cada acción

---

### 5. Seguimiento y Control

#### HU-OM-016: Registrar avance
**Como** responsable de una acción
**Quiero** registrar el avance de implementación
**Para** documentar el progreso

**Criterios de Aceptación:**
- Campo de porcentaje de avance
- Campo de notas de seguimiento
- Adjuntar evidencias
- Registrar fecha de actualización
- Notificar a interesados

#### HU-OM-017: Ver acciones vencidas
**Como** gestor de riesgos
**Quiero** ver las acciones con fecha límite vencida
**Para** dar seguimiento al cumplimiento

**Criterios de Aceptación:**
- Lista de acciones vencidas
- Ordenar por días de atraso
- Filtrar por responsable
- Enviar recordatorios masivos
- Exportar lista de vencidas

#### HU-OM-018: Ver acciones próximas a vencer
**Como** gestor de riesgos
**Quiero** ver las acciones próximas a vencer
**Para** tomar acciones preventivas

**Criterios de Aceptación:**
- Lista de acciones que vencen en los próximos 7, 15, 30 días
- Indicador visual de urgencia
- Notificaciones automáticas
- Filtrar por responsable o tipo

---

### 6. Reportes y Exportación

#### HU-OM-019: Exportar lista
**Como** usuario del sistema
**Quiero** exportar la lista de oportunidades y mitigaciones
**Para** generar reportes externos

**Criterios de Aceptación:**
- Formatos disponibles: Excel, CSV, PDF
- Seleccionar columnas a exportar
- Aplicar filtros antes de exportar
- Incluir registros seleccionados o todos los visibles
- Nombre de archivo con fecha de generación

#### HU-OM-020: Ver dashboard
**Como** gestor de riesgos
**Quiero** ver un resumen visual del estado de las acciones
**Para** tener una visión general rápida

**Criterios de Aceptación:**
- Total de oportunidades vs mitigaciones
- Distribución por estado
- Acciones por responsable
- Acciones vencidas y próximas a vencer
- Tendencia de cierre de acciones (últimos 12 meses)
- Efectividad de mitigaciones (reducción de riesgo)

---

### 7. Panel Lateral de Resumen

#### HU-OM-021: Ver resumen de progreso
**Como** usuario del sistema
**Quiero** ver el progreso de una acción en el panel lateral
**Para** conocer rápidamente su estado

**Criterios de Aceptación:**
- Mostrar porcentaje de avance
- Mostrar días restantes o de atraso
- Indicador visual de estado
- Enlace para ver detalle completo

#### HU-OM-022: Ver tareas pendientes
**Como** usuario del sistema
**Quiero** ver las tareas pendientes en el panel lateral
**Para** conocer qué actividades faltan

**Criterios de Aceptación:**
- Contador de tareas pendientes
- Lista de tareas al expandir
- Marcar tareas como completadas
- Crear nuevas tareas rápidamente

---

## Notas Técnicas

### Modelo de Datos Sugerido
```typescript
interface OportunidadMitigacion {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: 'oportunidad' | 'mitigacion';
  estrategia?: 'evitar' | 'transferir' | 'reducir' | 'aceptar' | 'explotar' | 'compartir' | 'mejorar';
  estado: 'pendiente' | 'en_progreso' | 'completada' | 'cancelada';
  prioridad: 'alta' | 'media' | 'baja';
  riesgosAsociados: string[];
  responsableId: string;
  fechaCreacion: Date;
  fechaModificacion: Date;
  fechaInicioPlanificado?: Date;
  fechaLimite?: Date;
  fechaCompletado?: Date;
  costoEstimado?: number;
  beneficioEsperado?: number;
  progreso: number; // 0-100
  tareas: Tarea[];
  documentos: Documento[];
  seguimiento: NotaSeguimiento[];
  creadoPor: string;
  modificadoPor?: string;
}

interface Tarea {
  id: string;
  nombre: string;
  descripcion?: string;
  responsableId: string;
  estado: 'pendiente' | 'en_progreso' | 'completada';
  fechaLimite?: Date;
  progreso: number;
}

interface NotaSeguimiento {
  id: string;
  fecha: Date;
  autor: string;
  nota: string;
  tipo: 'avance' | 'cambio_estado' | 'comentario';
}

interface Documento {
  id: string;
  nombre: string;
  tipo: string;
  tamaño: number;
  url: string;
  fechaCarga: Date;
  cargadoPor: string;
}
```

### Permisos Requeridos
- `oportunidades_mitigaciones.ver`: Ver lista y detalle
- `oportunidades_mitigaciones.crear`: Crear nuevos registros
- `oportunidades_mitigaciones.editar`: Editar registros existentes
- `oportunidades_mitigaciones.eliminar`: Eliminar registros
- `oportunidades_mitigaciones.administrar`: Gestión completa incluyendo configuración
