# Plan de Implementación - Módulo Eventos

## Orden de Implementación Recomendado

### Fase 1: Fundamentos (Modelos y Servicios)

**Paso 1.1: Crear modelos**
- [ ] Crear archivo `src/app/models/eventos.models.ts`
- [ ] Implementar todos los enums
- [ ] Implementar todas las interfaces
- [ ] Implementar constantes UI
- [ ] Implementar funciones helper

**Paso 1.2: Actualizar IndexedDB**
- [ ] Agregar stores en `indexeddb.service.ts`:
  - `eventSubTypes` - Plantillas de eventos
  - `events` - Eventos

**Paso 1.3: Crear servicios**
- [ ] Crear `src/app/services/evento-subtipos.service.ts`
- [ ] Crear `src/app/services/eventos.service.ts`
- [ ] Implementar CRUD completo en ambos servicios
- [ ] Implementar seed data para testing

---

### Fase 2: Gestión de Plantillas (Event SubTypes)

**Paso 2.1: Lista de plantillas**
- [ ] Crear carpeta `src/app/pages/evento-subtipos/`
- [ ] Implementar `evento-subtipos.ts` (componente)
- [ ] Implementar `evento-subtipos.html` (template)
- [ ] Implementar `evento-subtipos.scss` (estilos)

**Paso 2.2: Crear/Editar plantilla**
- [ ] Crear carpeta `src/app/pages/evento-subtipo-crear/`
- [ ] Implementar wizard de 3 pasos
- [ ] Implementar editor de propiedades
- [ ] Implementar drag & drop para reordenar
- [ ] Implementar preview de plantilla

---

### Fase 3: Gestión de Eventos

**Paso 3.1: Lista de eventos**
- [ ] Crear carpeta `src/app/pages/eventos/`
- [ ] Implementar tabs por tipo (Risk, Incident, Defect)
- [ ] Implementar tabla con filtros
- [ ] Implementar stats cards
- [ ] Implementar context menu

**Paso 3.2: Crear/Editar evento**
- [ ] Crear carpeta `src/app/pages/eventos-crear/`
- [ ] Implementar formulario dinámico
- [ ] Renderizar campos según plantilla seleccionada
- [ ] Validación de campos requeridos

**Paso 3.3: Detalle de evento**
- [ ] Crear carpeta `src/app/pages/eventos-detalle/`
- [ ] Implementar vista con tabs
- [ ] Mostrar campos dinámicos
- [ ] Historial de cambios
- [ ] Comentarios

---

### Fase 4: Integración

**Paso 4.1: Rutas**
- [ ] Agregar rutas en `app.routes.ts`

**Paso 4.2: Sidebar**
- [ ] Agregar menú de Eventos en sidebar

**Paso 4.3: Dark mode**
- [ ] Verificar estilos en dark mode
- [ ] Aplicar hardcoded zinc colors si es necesario

---

### Fase 5: Testing y Refinamiento

**Paso 5.1: Testing funcional**
- [ ] Crear plantilla de prueba
- [ ] Crear eventos de prueba
- [ ] Verificar CRUD completo
- [ ] Verificar filtros y búsqueda

**Paso 5.2: Refinamiento UI**
- [ ] Responsive design
- [ ] Animaciones
- [ ] Tooltips y ayudas
- [ ] Mensajes de error

---

## Archivos a Crear (Resumen)

```
src/app/
├── models/
│   └── eventos.models.ts                    # NUEVO
│
├── services/
│   ├── evento-subtipos.service.ts           # NUEVO
│   └── eventos.service.ts                   # NUEVO
│
├── pages/
│   ├── eventos/                             # NUEVO
│   │   ├── eventos.ts
│   │   ├── eventos.html
│   │   └── eventos.scss
│   │
│   ├── eventos-crear/                       # NUEVO
│   │   ├── eventos-crear.ts
│   │   ├── eventos-crear.html
│   │   └── eventos-crear.scss
│   │
│   ├── eventos-detalle/                     # NUEVO
│   │   ├── eventos-detalle.ts
│   │   ├── eventos-detalle.html
│   │   └── eventos-detalle.scss
│   │
│   ├── evento-subtipos/                     # NUEVO
│   │   ├── evento-subtipos.ts
│   │   ├── evento-subtipos.html
│   │   └── evento-subtipos.scss
│   │
│   └── evento-subtipo-crear/                # NUEVO
│       ├── evento-subtipo-crear.ts
│       ├── evento-subtipo-crear.html
│       └── evento-subtipo-crear.scss
│
└── app.routes.ts                            # MODIFICAR
```

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `app.routes.ts` | Agregar rutas de eventos |
| `components/sidebar/sidebar.ts` | Agregar menú de eventos |
| `services/indexeddb.service.ts` | Agregar stores de eventos |

---

## Dependencias de Terceros

No se requieren nuevas dependencias. Todo se implementa con:
- Angular 20
- PrimeNG (ya instalado)
- CDK Drag Drop (para reordenar propiedades)

Si CDK Drag Drop no está instalado:
```bash
npm install @angular/cdk
```

---

## Estimación de Archivos

| Categoría | Archivos | LOC Estimado |
|-----------|----------|--------------|
| Modelos | 1 | ~400 |
| Servicios | 2 | ~600 |
| Páginas | 5 x 3 = 15 | ~3000 |
| Modificaciones | 3 | ~100 |
| **Total** | **21** | **~4100** |

---

## Verificación

Para verificar que todo funciona:

1. **Plantillas:**
   - Crear una plantilla de Riesgo con 3 propiedades
   - Verificar que aparece en la lista
   - Editar la plantilla
   - Clonar la plantilla
   - Eliminar la plantilla clonada

2. **Eventos:**
   - Crear un evento usando la plantilla
   - Verificar que los campos custom aparecen
   - Cambiar estado del evento
   - Ver detalle del evento
   - Editar el evento
   - Eliminar el evento

3. **Filtros:**
   - Filtrar por tipo de evento
   - Filtrar por estado
   - Buscar por título
   - Ordenar por columnas

4. **Dark Mode:**
   - Verificar todos los componentes en dark mode
   - Verificar inputs, selects, tablas
   - Verificar modals y drawers
