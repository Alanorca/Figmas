# Documentación para Replicar Módulo de Eventos

Esta carpeta contiene toda la documentación necesaria para implementar el módulo de Eventos en el proyecto orca-alan, basado en el análisis de los proyectos:

- **orca-sns-frontend-web-development** - Frontend original con eventos
- **orca-sns-services-master** - Backend (sin módulo de eventos aún)

---

## Índice de Documentos

| Documento | Descripción |
|-----------|-------------|
| [01-RESUMEN-ARQUITECTURA.md](./01-RESUMEN-ARQUITECTURA.md) | Visión general de la arquitectura y estructura |
| [02-MODELOS-INTERFACES.md](./02-MODELOS-INTERFACES.md) | Enums, interfaces, DTOs y funciones helper |
| [03-SERVICIOS-API.md](./03-SERVICIOS-API.md) | Servicios Angular y endpoints de API |
| [04-COMPONENTES-UI.md](./04-COMPONENTES-UI.md) | Componentes de páginas y templates |
| [05-PLAN-IMPLEMENTACION.md](./05-PLAN-IMPLEMENTACION.md) | Orden de implementación y checklist |

---

## Resumen Ejecutivo

### ¿Qué es el módulo de Eventos?

Un sistema para gestionar:
- **Riesgos** - Eventos potenciales que pueden afectar la organización
- **Incidentes** - Eventos que ya ocurrieron
- **Defectos** - Fallas o problemas identificados

### Característica Principal: Plantillas Dinámicas

El sistema usa **Event SubTypes** (subtipos de eventos) que son plantillas personalizables:
- Cada tipo de evento puede tener múltiples plantillas
- Las plantillas definen campos personalizados (propiedades)
- Los campos soportan: texto, números, fechas, booleanos, JSON
- Incluye lógica condicional y fórmulas

### Estructura de Archivos a Crear

```
src/app/
├── models/eventos.models.ts           # Tipos de datos
├── services/
│   ├── evento-subtipos.service.ts     # CRUD plantillas
│   └── eventos.service.ts             # CRUD eventos
└── pages/
    ├── eventos/                       # Lista de eventos
    ├── eventos-crear/                 # Crear/editar evento
    ├── eventos-detalle/               # Ver evento
    ├── evento-subtipos/               # Lista plantillas
    └── evento-subtipo-crear/          # Crear/editar plantilla
```

---

## Cómo Usar Esta Documentación

1. **Empezar por** `01-RESUMEN-ARQUITECTURA.md` para entender el contexto
2. **Copiar modelos de** `02-MODELOS-INTERFACES.md` como base
3. **Implementar servicios de** `03-SERVICIOS-API.md`
4. **Crear componentes de** `04-COMPONENTES-UI.md`
5. **Seguir el orden de** `05-PLAN-IMPLEMENTACION.md`

---

## Archivos de Referencia del Proyecto Original

### Frontend (orca-sns-frontend-web-development)

```
/libs/customer-features/src/lib/shared/modules/
├── event-subtypes/
│   ├── services/event-subtypes.service.ts
│   ├── types/event-subtype.types.ts
│   └── pages/
│       ├── event-subtypes-list/
│       └── create-event-subtype/
├── assets/
│   ├── services/event.service.ts
│   └── types/event.types.ts
├── risks/
├── incidents/
└── defects/
```

### Backend (orca-sns-services-master)

**Nota:** El backend NO tiene módulo de eventos implementado aún.

Estructura propuesta:
```
src/main/java/com/gcpglobal/sns/eventos/
├── controller/
├── service/
├── repository/
├── entity/
└── dto/
```

---

## Notas Importantes

1. **IndexedDB**: El proyecto orca-alan usa IndexedDB para persistencia local. Los servicios deben usar `IndexedDBService`.

2. **Signals**: Usar Angular Signals para estado reactivo (no RxJS BehaviorSubject).

3. **Standalone Components**: Todos los componentes son standalone (no módulos).

4. **PrimeNG**: Usar componentes de PrimeNG para la UI.

5. **Dark Mode**: Aplicar colores hardcoded zinc para dark mode si hay problemas con CSS variables.

---

## Contacto

Si el proceso se interrumpe, esta documentación contiene todo lo necesario para continuar la implementación desde cualquier punto.

Fecha de creación: Enero 2026
