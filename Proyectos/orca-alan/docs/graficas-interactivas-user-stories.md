# Historias de Usuario - Gráficas Interactivas

## Descripción General
El componente de Gráficas Interactivas permite a los usuarios visualizar datos de riesgos e incidentes de manera dinámica, con múltiples tipos de gráficas, configuraciones personalizables y un asistente de IA para facilitar la creación de visualizaciones.

---

## 1. Selección de Tipo de Gráfica

### US-GI-001: Seleccionar tipo de gráfica circular
**Como** usuario del sistema
**Quiero** poder seleccionar entre diferentes tipos de gráficas circulares (Donut, Pie, Radial Bar, Polar Area)
**Para** visualizar proporciones y distribuciones de mis datos de forma clara

**Criterios de Aceptación:**
- [ ] El usuario puede seleccionar "Donut" para ver datos con total central
- [ ] El usuario puede seleccionar "Pie" para distribución porcentual clásica
- [ ] El usuario puede seleccionar "Radial Bar" para mostrar progreso circular
- [ ] El usuario puede seleccionar "Polar Area" para datos cíclicos
- [ ] La gráfica se actualiza inmediatamente al cambiar el tipo

---

### US-GI-002: Seleccionar tipo de gráfica de barras
**Como** usuario del sistema
**Quiero** poder seleccionar entre diferentes tipos de gráficas de barras (Columnas, Barras Horizontales, Apiladas, Agrupadas)
**Para** comparar categorías y valores de mis datos

**Criterios de Aceptación:**
- [ ] El usuario puede seleccionar "Columnas" para comparación vertical
- [ ] El usuario puede seleccionar "Barras Horizontales" para etiquetas largas
- [ ] El usuario puede seleccionar "Barras Apiladas" para mostrar composición
- [ ] El usuario puede seleccionar "Barras Agrupadas" para comparar series
- [ ] La gráfica se actualiza inmediatamente al cambiar el tipo

---

### US-GI-003: Seleccionar tipo de gráfica de líneas
**Como** usuario del sistema
**Quiero** poder seleccionar entre diferentes tipos de gráficas de líneas (Línea, Área, Spline, Step Line)
**Para** visualizar tendencias y evolución temporal de mis datos

**Criterios de Aceptación:**
- [ ] El usuario puede seleccionar "Línea" para tendencias simples
- [ ] El usuario puede seleccionar "Área" para enfatizar volumen
- [ ] El usuario puede seleccionar "Spline" para curvas suavizadas
- [ ] El usuario puede seleccionar "Step Line" para cambios discretos
- [ ] Se habilita zoom y pan para explorar datos temporales

---

### US-GI-004: Seleccionar tipo de gráfica avanzada
**Como** usuario del sistema
**Quiero** poder seleccionar gráficas avanzadas (Radar, Scatter, Heatmap, Treemap)
**Para** análisis más sofisticados de mis datos

**Criterios de Aceptación:**
- [ ] El usuario puede seleccionar "Radar" para perfiles multivariables
- [ ] El usuario puede seleccionar "Scatter" para correlaciones
- [ ] El usuario puede seleccionar "Heatmap" para matrices de datos
- [ ] El usuario puede seleccionar "Treemap" para jerarquías proporcionales
- [ ] Se muestran configuraciones adicionales según el tipo seleccionado

---

### US-GI-005: Seleccionar gráfica de embudo
**Como** usuario del sistema
**Quiero** poder seleccionar gráficas de embudo (Funnel, Pirámide)
**Para** visualizar procesos secuenciales y jerarquías

**Criterios de Aceptación:**
- [ ] El usuario puede seleccionar "Embudo" para flujos con reducción
- [ ] El usuario puede seleccionar "Pirámide" para jerarquías de importancia
- [ ] Los datos se ordenan automáticamente de mayor a menor

---

## 2. Configuración de Datos

### US-GI-006: Seleccionar campo para eje X / categorías
**Como** usuario del sistema
**Quiero** poder seleccionar qué campo de datos usar para las categorías (eje X)
**Para** agrupar mis datos según diferentes criterios

**Criterios de Aceptación:**
- [ ] El usuario puede seleccionar entre: Estado, Severidad, Responsable, Fecha, Tipo de Entidad, Activo/Proceso, Probabilidad, Impacto, Nivel de Riesgo
- [ ] Se muestra descripción del campo seleccionado
- [ ] Se indica el tipo de campo (categoría, numérico, fecha)
- [ ] La gráfica se actualiza al cambiar el campo

---

### US-GI-007: Ver campos recomendados
**Como** usuario del sistema
**Quiero** ver qué campos son recomendados para el tipo de gráfica seleccionado
**Para** obtener mejores visualizaciones

**Criterios de Aceptación:**
- [ ] Se muestran chips con campos recomendados en sección colapsable
- [ ] Al hacer clic en un campo recomendado, se aplica automáticamente
- [ ] Las recomendaciones cambian según el tipo de gráfica

---

### US-GI-008: Seleccionar eje Y para gráficas que lo requieren
**Como** usuario del sistema
**Quiero** poder seleccionar un campo numérico para el eje Y
**Para** gráficas que requieren dos ejes (Scatter, Heatmap, Radar)

**Criterios de Aceptación:**
- [ ] El selector de eje Y solo aparece para tipos que lo requieren
- [ ] Solo se muestran campos numéricos como opciones
- [ ] La gráfica se actualiza con ambos ejes configurados

---

## 3. Personalización Visual

### US-GI-009: Cambiar paleta de colores
**Como** usuario del sistema
**Quiero** poder seleccionar entre diferentes paletas de colores predefinidas
**Para** personalizar la apariencia de mis gráficas

**Criterios de Aceptación:**
- [ ] El usuario puede seleccionar entre 9 paletas: Vibrante, Pastel, Neón, Corporativo, Tierra, Océano, Atardecer, Semáforo, Mono Azul
- [ ] Se muestra preview de colores en el selector
- [ ] Se muestra descripción del uso recomendado de cada paleta
- [ ] La gráfica se actualiza inmediatamente al cambiar paleta

---

### US-GI-010: Activar/desactivar animaciones
**Como** usuario del sistema
**Quiero** poder activar o desactivar las animaciones de la gráfica
**Para** mejorar el rendimiento o la experiencia visual según mis preferencias

**Criterios de Aceptación:**
- [ ] Toggle visual para activar/desactivar animaciones
- [ ] Estado activo claramente indicado visualmente
- [ ] Las animaciones incluyen entrada, transiciones y efectos dinámicos

---

### US-GI-011: Mostrar/ocultar leyenda
**Como** usuario del sistema
**Quiero** poder mostrar u ocultar la leyenda de la gráfica
**Para** maximizar el espacio de visualización cuando no la necesito

**Criterios de Aceptación:**
- [ ] Toggle visual para mostrar/ocultar leyenda
- [ ] La leyenda se posiciona en la parte inferior
- [ ] Al hacer clic en items de la leyenda, se ocultan/muestran series

---

### US-GI-012: Mostrar/ocultar etiquetas de datos
**Como** usuario del sistema
**Quiero** poder mostrar u ocultar las etiquetas de valores en la gráfica
**Para** ver valores exactos o mantener la gráfica limpia

**Criterios de Aceptación:**
- [ ] Toggle visual para mostrar/ocultar etiquetas
- [ ] Las etiquetas muestran valores formateados
- [ ] En gráficas circulares, las etiquetas muestran porcentajes

---

### US-GI-013: Cambiar entre tema claro y oscuro
**Como** usuario del sistema
**Quiero** poder cambiar entre tema claro y oscuro
**Para** adaptar la visualización a mis preferencias o condiciones de iluminación

**Criterios de Aceptación:**
- [ ] Toggle visual para cambiar tema
- [ ] El tema afecta colores de fondo, texto y elementos
- [ ] La transición es suave y sin parpadeos

---

## 4. Configuraciones Guardadas

### US-GI-014: Guardar configuración actual
**Como** usuario del sistema
**Quiero** poder guardar mi configuración actual de gráfica con un nombre
**Para** reutilizarla posteriormente sin reconfigurar todo

**Criterios de Aceptación:**
- [ ] Formulario inline para ingresar nombre (requerido) y descripción (opcional)
- [ ] Se guarda: tipo de gráfica, campos, paleta, opciones de visualización, tema
- [ ] Preview de la configuración antes de guardar
- [ ] Las configuraciones persisten en localStorage

---

### US-GI-015: Cargar configuración guardada
**Como** usuario del sistema
**Quiero** poder cargar una configuración guardada previamente
**Para** aplicarla rápidamente a la gráfica actual

**Criterios de Aceptación:**
- [ ] Lista de configuraciones guardadas con nombre, tipo, fecha y paleta
- [ ] Botón de cargar en cada configuración
- [ ] Al cargar, se aplican todos los ajustes guardados
- [ ] Se cambia automáticamente al tab de configuración

---

### US-GI-016: Eliminar configuración guardada
**Como** usuario del sistema
**Quiero** poder eliminar configuraciones que ya no necesito
**Para** mantener mi lista de configuraciones organizada

**Criterios de Aceptación:**
- [ ] Botón de eliminar en cada configuración
- [ ] La configuración se elimina de la lista y del localStorage
- [ ] No se requiere confirmación (acción inmediata)

---

## 5. Asistente de IA

### US-GI-017: Configurar gráfica mediante lenguaje natural
**Como** usuario del sistema
**Quiero** poder describir en lenguaje natural qué gráfica necesito
**Para** que el asistente de IA la configure automáticamente

**Criterios de Aceptación:**
- [ ] Input de texto para escribir solicitudes en español
- [ ] El asistente entiende: tipos de gráfica, campos, paletas, filtros
- [ ] La configuración se aplica automáticamente
- [ ] Se muestra respuesta explicando los cambios realizados

**Ejemplos de comandos:**
- "dona por estado"
- "barras con severidad"
- "gráfica del Servidor Principal por estado"
- "paleta corporativa"
- "tema oscuro"

---

### US-GI-018: Usar sugerencias predefinidas
**Como** usuario nuevo del sistema
**Quiero** ver sugerencias de comandos comunes
**Para** aprender a usar el asistente de IA

**Criterios de Aceptación:**
- [ ] Se muestran 5 sugerencias predefinidas cuando no hay mensajes
- [ ] Al hacer clic en una sugerencia, se envía como mensaje
- [ ] Las sugerencias cubren casos de uso comunes

---

### US-GI-019: Aplicar configuración sugerida manualmente
**Como** usuario del sistema
**Quiero** poder aplicar manualmente las configuraciones sugeridas por el asistente
**Para** revisar antes de aplicar cambios

**Criterios de Aceptación:**
- [ ] Los mensajes con configuración muestran tags con los cambios propuestos
- [ ] Botón "Aplicar" en cada mensaje con configuración
- [ ] Al aplicar, se cambia al tab de configuración

---

### US-GI-020: Filtrar datos mediante asistente
**Como** usuario del sistema
**Quiero** poder filtrar datos usando lenguaje natural
**Para** ver solo los datos de un activo o proceso específico

**Criterios de Aceptación:**
- [ ] El asistente entiende nombres de activos/procesos mencionados
- [ ] Se aplica filtro automático por contenedorNombre
- [ ] Se muestra tag de filtro activo en la gráfica
- [ ] Se puede quitar el filtro diciendo "quitar filtro"

---

### US-GI-021: Limpiar historial del chat
**Como** usuario del sistema
**Quiero** poder limpiar el historial de conversación con el asistente
**Para** empezar una nueva sesión limpia

**Criterios de Aceptación:**
- [ ] Botón de limpiar visible cuando hay mensajes
- [ ] Se eliminan todos los mensajes
- [ ] Se vuelve a mostrar la pantalla de bienvenida

---

## 6. Exportación

### US-GI-022: Exportar gráfica como PNG
**Como** usuario del sistema
**Quiero** poder exportar la gráfica como imagen PNG
**Para** incluirla en presentaciones o documentos

**Criterios de Aceptación:**
- [ ] Botón de exportar PNG en la barra de herramientas
- [ ] Se descarga archivo con nombre descriptivo incluyendo tipo y timestamp
- [ ] La imagen incluye todos los elementos visibles de la gráfica

---

### US-GI-023: Exportar gráfica como SVG
**Como** usuario del sistema
**Quiero** poder exportar la gráfica como SVG
**Para** tener una imagen vectorial escalable

**Criterios de Aceptación:**
- [ ] Botón de exportar SVG en la barra de herramientas
- [ ] Se descarga archivo SVG con escalado x2
- [ ] El SVG mantiene calidad al escalar

---

## 7. Interactividad

### US-GI-024: Hacer zoom en la gráfica
**Como** usuario del sistema
**Quiero** poder hacer zoom en gráficas de líneas y áreas
**Para** examinar secciones específicas de los datos

**Criterios de Aceptación:**
- [ ] Zoom disponible con scroll del mouse
- [ ] Zoom mediante selección de área con arrastre
- [ ] Botones de zoom in/out en la barra de herramientas

---

### US-GI-025: Resetear zoom y vista
**Como** usuario del sistema
**Quiero** poder resetear el zoom a la vista original
**Para** volver a ver todos los datos

**Criterios de Aceptación:**
- [ ] Botón de reset en la barra de herramientas
- [ ] Se restaura la vista completa de la gráfica
- [ ] Se resetean todas las series ocultas

---

### US-GI-026: Interactuar con elementos de la gráfica
**Como** usuario del sistema
**Quiero** poder hacer clic en elementos de la gráfica
**Para** obtener información detallada

**Criterios de Aceptación:**
- [ ] Al hacer clic en un elemento, se emite evento con categoría, valor y serie
- [ ] Tooltip al pasar el mouse sobre elementos
- [ ] Elementos se resaltan al hover

---

### US-GI-027: Ocultar/mostrar series desde la leyenda
**Como** usuario del sistema
**Quiero** poder ocultar series haciendo clic en la leyenda
**Para** comparar series específicas

**Criterios de Aceptación:**
- [ ] Al hacer clic en item de leyenda, se oculta/muestra la serie
- [ ] Se emite evento indicando serie y estado de visibilidad
- [ ] Las series ocultas se indican visualmente en la leyenda

---

## 8. Recomendaciones y Asistencia

### US-GI-028: Ver recomendaciones del asistente
**Como** usuario del sistema
**Quiero** ver recomendaciones automáticas basadas en mi configuración
**Para** mejorar mis visualizaciones

**Criterios de Aceptación:**
- [ ] Panel colapsable con recomendaciones
- [ ] Tipos de recomendaciones: información, éxito, advertencia
- [ ] Incluye: descripción del tipo de gráfica, campos recomendados, advertencias

---

### US-GI-029: Recibir advertencias sobre configuración
**Como** usuario del sistema
**Quiero** recibir advertencias cuando mi configuración no es óptima
**Para** evitar visualizaciones confusas

**Criterios de Aceptación:**
- [ ] Advertencia cuando hay muchas categorías (>8) en gráficas circulares
- [ ] Advertencia cuando hay pocos puntos (≤3) en gráficas de línea
- [ ] Sugerencias de paleta para datos de severidad/estado

---

## 9. Filtrado de Datos

### US-GI-030: Ver filtro activo
**Como** usuario del sistema
**Quiero** ver claramente cuando hay un filtro aplicado
**Para** saber que estoy viendo un subconjunto de datos

**Criterios de Aceptación:**
- [ ] Tag de filtro visible en el header de la gráfica
- [ ] El tag muestra el valor del filtro aplicado
- [ ] Icono de filtro indica que hay filtro activo

---

### US-GI-031: Quitar filtro activo
**Como** usuario del sistema
**Quiero** poder quitar el filtro activo fácilmente
**Para** volver a ver todos los datos

**Criterios de Aceptación:**
- [ ] Clic en el tag de filtro lo elimina
- [ ] Se emite evento notificando que el filtro fue removido
- [ ] La gráfica se actualiza mostrando todos los datos

---

## 10. Estadísticas Rápidas

### US-GI-032: Ver estadísticas de la gráfica
**Como** usuario del sistema
**Quiero** ver estadísticas rápidas sobre los datos visualizados
**Para** tener contexto numérico adicional

**Criterios de Aceptación:**
- [ ] Se muestra cantidad de categorías
- [ ] Se muestra total de valores
- [ ] Se muestra nombre de la paleta actual

---

## 11. Tips de Interactividad

### US-GI-033: Ver tips de uso
**Como** usuario nuevo del sistema
**Quiero** ver tips sobre cómo interactuar con la gráfica
**Para** aprovechar todas las funcionalidades

**Criterios de Aceptación:**
- [ ] Barra de tips en la parte inferior
- [ ] Incluye: clic en leyenda, scroll para zoom, arrastrar para pan, clic en elementos

---

## Resumen de Tipos de Gráfica Disponibles

| Categoría | Tipos | Casos de Uso |
|-----------|-------|--------------|
| Circulares | Donut, Pie, Radial Bar, Polar Area | Proporciones, distribuciones, progreso |
| Barras | Columnas, Barras H, Apiladas, Agrupadas | Comparaciones, composición |
| Líneas | Línea, Área, Spline, Step Line | Tendencias, evolución temporal |
| Avanzadas | Radar, Scatter, Heatmap, Treemap | Correlaciones, matrices, jerarquías |
| Embudo | Funnel, Pirámide | Procesos secuenciales |

## Resumen de Paletas de Colores

| Paleta | Descripción | Uso Recomendado |
|--------|-------------|-----------------|
| Vibrante | Colores vivos y llamativos | Presentaciones |
| Pastel | Tonos suaves | Dashboards |
| Neón | Colores brillantes | Temas oscuros |
| Corporativo | Profesional | Reportes ejecutivos |
| Tierra | Tonos naturales y cálidos | Visualizaciones neutrales |
| Océano | Escala de azules | Datos secuenciales |
| Atardecer | Gradiente cálido | Visualizaciones artísticas |
| Semáforo | Verde a rojo | Indicadores de riesgo |
| Mono Azul | Escala monocromática | Reportes profesionales |

---

## Notas de Implementación

### Tecnologías Utilizadas
- **ApexCharts** via ng-apexcharts para renderizado de gráficas
- **PrimeNG** para componentes UI (Select, Button, Tag, Accordion, etc.)
- **Groq API** para asistente de IA con procesamiento de lenguaje natural
- **Angular Signals** para manejo de estado reactivo
- **localStorage** para persistencia de configuraciones

### Eventos Emitidos
- `dataPointClick`: Al hacer clic en un elemento de la gráfica
- `legendClick`: Al hacer clic en un item de la leyenda
- `filtroAplicado`: Al aplicar o quitar un filtro
- `campoSeleccionado`: Al cambiar el campo de datos

### Configuración del Asistente IA
El asistente utiliza Groq con un prompt específico que entiende:
- Nombres de tipos de gráfica en español e inglés
- Sinónimos de campos de datos
- Nombres de paletas y temas
- Nombres de activos/procesos para filtrado
