# Editor de Procesos con Sistema de Nodos

Sistema completo de gestión de procesos basado en nodos interactivos para mapeo de flujos operativos, análisis de riesgos y automatización de decisiones.

## 📁 Archivos del Proyecto

- **`editor-procesos-nodos.html`** - Interfaz principal completa (archivo único, standalone)
- **`Contexto/`** - Documentación de historias de usuario y especificaciones
- **`Imagenes Interfaz figma/`** - Referencias visuales del diseño
- **`nodo_*.html`** - Ejemplos individuales de cada tipo de nodo

## ✨ Características Principales

### 🎯 Sistema de Nodos Implementados

#### 1. Nodo Condicional (If / Case)
- Bifurcación del flujo según condiciones
- Soporte para If simple y Case múltiple
- Caso por defecto (default) configurable
- Conexión a nodos específicos por condición
- Validación de nodos sin conexión

#### 2. Nodo Archivos (CSV / Excel)
- Selección de archivos desde repositorio
- Drag & drop para carga de archivos
- Selector de delimitador (CSV)
- Vista previa de primeras filas
- Selector múltiple de columnas
- Columna clasificadora para agrupación

#### 3. Nodo Activos
- Selector de área organizacional
- Dropdown dinámico de activos
- Inclusión automática de propiedades y metadatos
- Vinculación directa con otros nodos

#### 4. Nodo Transformación
- Mapeo de campos
- Filtrado con reglas personalizadas
- Enriquecimiento de datos (cálculos matemáticos)
- Operaciones: Ordenar, Deduplicar, Agregación (SUM, AVG, MIN, MAX, STDEV)
- Editor de fórmulas con operadores
- Botón para editor en pantalla completa
- Selección de propiedad entrada/salida

#### 5. Nodo Prompt LLM
- Selección de modelos (Grok, GPT-4, GPT-3.5, Gemini, Claude)
- Campo de prompt con sintaxis {{variable}}
- Formatos de salida: JSON, Texto plano, Tabla, Markdown
- Variable de salida configurable
- Árbol de selección de propiedades del contexto
- Opción "Select All"
- Paginación automática de contexto

#### 6. Nodo Cambio de Estado
- Estados disponibles: Pending, Running, Complete, Fail, Post, Canceled
- Campo para motivo del cambio
- Registro en log de ejecución
- Acciones post-cambio configurables

#### 7. Nodo Integración (Futuro)
- Marcado como "en desarrollo"
- Preparado para bases de datos relacionales y APIs

### 🎯 Sistema de Drag & Drop

#### Crear Nodos (Desde Sidebar al Canvas)
1. **Arrastrar desde sidebar**: Click y mantener sobre cualquier tipo de nodo
2. **Soltar en canvas**: El nodo se crea en la posición exacta donde se suelta
3. **Visual feedback**: El item del sidebar se vuelve semitransparente durante el arrastre
4. **Cursor**: Cambia a "grab" al hover, "grabbing" al arrastrar

#### Mover Nodos (Dentro del Canvas)
1. **Click y arrastrar header**: Mantener click en el header del nodo
2. **Arrastrar libremente**: El nodo sigue el cursor con feedback visual
3. **Límites del canvas**: Los nodos se mantienen dentro de los límites
4. **Actualización automática**: Las líneas de conexión se actualizan en tiempo real
5. **No interfiere con botones**: Los botones y controles del nodo siguen funcionando

#### Características del Arrastre
- **Posicionamiento absoluto**: Los nodos usan coordenadas x, y
- **Canvas amplio**: 2000x2000px para espacio suficiente
- **Scroll automático**: El área de canvas tiene scroll para navegación
- **Z-index dinámico**: El nodo arrastrado aparece sobre los demás
- **Sombra aumentada**: Feedback visual durante el arrastre
- **Prevención de conflictos**: No permite arrastrar nodo y conexión simultáneamente

### 🔗 Sistema de Conexiones

#### Puntos de Conexión
- **Punto de entrada (izquierdo)**: Recibe conexiones de otros nodos
- **Punto de salida (derecho)**: Envía conexiones a otros nodos
- Aparecen al pasar el cursor sobre el nodo
- Color verde (#10b981) con animación de pulso
- **Permanecen ocultos** al arrastrar nodos para evitar interferencias

#### Creación de Conexiones
1. **Hover sobre nodo**: Los puntos de conexión se vuelven visibles
2. **Click en punto de salida**: Inicia el arrastre de la línea
3. **Arrastrar**: Línea punteada azul sigue el cursor
4. **Acercarse a otro nodo**: El punto de entrada se resalta en amarillo
5. **Soltar cerca del punto** (< 50px): Se crea la conexión permanente
6. **Soltar fuera**: La línea temporal desaparece

#### Características de las Líneas
- **Curvas Bezier suaves** para mejor visualización
- **Flechas** indicando dirección del flujo
- Color verde para conexiones establecidas
- Color azul punteado durante el arrastre
- **Se actualizan automáticamente** al:
  - Mover nodos
  - Redimensionar ventana
  - Hacer scroll en canvas
- **Permanentes**: Una vez creadas, se mantienen hasta eliminar el nodo

#### Eliminación de Conexiones
- Al eliminar un nodo, sus conexiones se eliminan automáticamente
- Validación antes de eliminar (confirmación)
- Se limpian las referencias del array de conexiones

## 🎨 Diseño y Estilos

### Paleta de Colores
- **Primario**: Verde #10b981 (botones, conexiones)
- **Secundario**: Negro #1a1a1a (sidebar, texto)
- **Background**: Gris claro #fafafa
- **Acentos**: Colores pasteles para iconos de nodos

### Layout
- **Sidebar izquierda**: 280px, fondo oscuro con lista de nodos arrastrables
- **Área principal**: Canvas 2000x2000px con scroll y posicionamiento absoluto
- **Sidebar derecha**: 480px, panel de funcionalidades y preview (oculto por defecto)
- **Header superior**: Breadcrumb y acciones principales
- **Toolbar**: Selector de nodos, zoom y búsqueda

### Componentes UI
- Cards con sombras sutiles (0 1px 3px)
- Border-radius consistente de 8-12px
- Transiciones suaves en hover
- Inputs con focus state verde
- Badges de estado con colores semánticos

## 🚀 Uso del Editor

### Agregar Nodos
**Método 1 - Drag & Drop (Recomendado):**
1. Click y mantener sobre cualquier tipo de nodo en el sidebar izquierdo
2. Arrastrar al canvas
3. Soltar en la posición deseada
4. El nodo se crea instantáneamente en esa ubicación

**Método 2 - Dropdown:**
1. Seleccionar tipo desde el dropdown en el toolbar
2. El nodo aparece con posición por defecto (escalonada)

### Mover Nodos
1. Click y mantener en el header del nodo
2. Arrastrar a la posición deseada
3. Las líneas de conexión se actualizan automáticamente
4. Soltar para fijar la nueva posición

### Configurar Nodos
1. Cada nodo tiene campos específicos según su tipo
2. Rellenar campos requeridos
3. Los cambios se guardan automáticamente en el estado
4. Usar botones de acción del header para funciones especiales

### Conectar Nodos
1. **Hover** sobre el nodo de origen
2. **Click y arrastrar** desde el punto de salida verde (derecho)
3. **Acercarse** al nodo de destino (< 50px)
4. El punto de entrada se **resalta en amarillo**
5. **Soltar** para crear la conexión permanente
6. La línea verde con flecha indica el flujo

### Eliminar Nodos
1. Click en el botón 🗑️ del nodo
2. Confirmar eliminación en el diálogo
3. El nodo y sus conexiones se eliminan automáticamente

### Validar Flujo
- Click en botón "✓" en toolbar
- Valida conexiones y configuración
- Detecta nodos sin conexión

### Guardar Proceso
- Click en botón "Guardar" (verde)
- Valida el flujo completo
- Guarda configuración y conexiones

## 📊 Funcionalidades Extras

### Sidebar Derecho
- **Se muestra al hacer clic en "Previsualizar"** en nodos de archivo
- **Ancho**: 480px
- **Ocultable**: Botón × para cerrar
- **Contenido dinámico**: Cambia según la funcionalidad activa

### Vista Previa de Datos
- Sidebar derecho para archivos CSV/Excel
- Tabla con primeras 6 filas de ejemplo
- Selector de columnas interactivo
- Vista de metadatos del archivo
- Selector de columna clasificadora

### Árbol de Propiedades
- Para nodos LLM y Transformación
- Selección múltiple con checkboxes
- Opción "Select All"
- Jerarquía visual de propiedades

### Editor de Fórmulas
- Textarea con font monospace
- Botones de operadores matemáticos
- Opción de pantalla completa
- Preparado para Monaco Editor

### Controles de Canvas
- Zoom in/out (por implementar)
- Ajustar vista (por implementar)
- Búsqueda de nodos
- Scroll suave

## 🔧 Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos con flexbox y grid
- **JavaScript Vanilla**: Sin dependencias externas
- **SVG**: Para líneas de conexión dinámicas
- **Eventos del DOM**: Drag & drop, hover, click

## 📝 Notas Técnicas

### Estado de la Aplicación
- `connections[]`: Array de conexiones activas
- `nodeIdCounter`: Contador incremental de IDs
- `isDraggingConnection`: Flag de estado de arrastre
- `currentLine`: Referencia a línea temporal

### Puntos de Extensión
1. **Monaco Editor**: Integración preparada para editor de fórmulas
2. **Validación de flujo**: Lógica lista para extender
3. **Persistencia**: Estructura de datos lista para serializar
4. **API Integration**: Preparado para guardar en backend

### Compatibilidad
- Navegadores modernos (Chrome, Firefox, Safari, Edge)
- Responsive design preparado
- Sin dependencias externas
- Funciona offline

## 🎯 Próximos Pasos (Roadmap)

### Corto Plazo
- [ ] Implementar zoom y pan en canvas
- [ ] Agregar drag & drop de nodos (reposicionar)
- [ ] Click en línea para eliminar conexión
- [ ] Validación avanzada de flujos

### Mediano Plazo
- [ ] Integrar Monaco Editor para fórmulas
- [ ] Serialización/deserialización de procesos
- [ ] API REST para persistencia
- [ ] Ejecución de procesos en tiempo real

### Largo Plazo
- [ ] Nodo ML con configuración de modelos
- [ ] Nodo Integración con APIs
- [ ] Debug mode con breakpoints
- [ ] Historial de ejecuciones

## 👥 Equipo

- **Product Owner**: Francisco Puente
- **UX/UI Designer**: Alan Franco
- **Frontend Developers**: Cesar Gonzalez, Juan Martinez
- **Backend Developer**: Josue Cardenas
- **QA Engineer**: Emmanuel Vazquez

## 📄 Licencia

Sistema propietario - Orca@SecurityBy Design

---

**Versión**: 1.0.0
**Última actualización**: 2025-11-24
**Archivo principal**: `editor-procesos-nodos.html`
