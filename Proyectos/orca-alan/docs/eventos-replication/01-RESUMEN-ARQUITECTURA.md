# Resumen de Arquitectura - Módulo Eventos

## Visión General

El módulo de **Eventos** en el proyecto original (orca-sns-frontend-web-development) maneja tres tipos de eventos:
- **RISK (Riesgos)** - ID: 1
- **INCIDENT (Incidentes)** - ID: 2
- **DEFECT (Defectos)** - ID: 3

### Concepto Clave: Event SubTypes (Subtipos de Evento)

Los eventos usan un sistema de **plantillas personalizables** llamado "Event SubTypes":
- Cada tipo de evento (Risk, Incident, Defect) puede tener múltiples subtipos
- Los subtipos definen propiedades dinámicas (campos personalizados)
- Las propiedades soportan: TEXT, INTEGER, DECIMAL, DATE, BOOLEAN, JSON
- Se pueden agrupar propiedades en "Property Groups"

---

## Estructura del Proyecto Original

```
/libs/customer-features/src/lib/shared/modules/
├── event-subtypes/           # CRUD de plantillas de eventos
│   ├── pages/
│   │   ├── event-subtypes-list/     # Lista de subtipos
│   │   └── create-event-subtype/    # Crear/editar subtipo
│   ├── services/
│   │   └── event-subtypes.service.ts
│   ├── types/
│   │   └── event-subtype.types.ts
│   └── event-subtypes.routes.ts
│
├── assets/                   # Servicios compartidos de eventos
│   ├── services/
│   │   └── event.service.ts         # Operaciones de eventos
│   └── types/
│       └── event.types.ts           # Modelos de eventos
│
├── risks/                    # Vista de Riesgos
│   ├── pages/
│   │   ├── risk-list/
│   │   ├── risk-create/
│   │   └── risk-detail/
│   └── services/
│       └── risk.service.ts
│
├── incidents/                # Vista de Incidentes
│   ├── pages/
│   │   ├── incident-list/
│   │   └── incident-detail/
│
└── defects/                  # Vista de Defectos
    ├── pages/
    │   ├── defect-list/
    │   └── defect-detail/
```

---

## Arquitectura Destino (orca-alan)

### Stack Tecnológico
- **Angular 20** con standalone components
- **Signals** para estado reactivo
- **PrimeNG** para componentes UI
- **IndexedDB** para persistencia local

### Patrón de Módulo CRUD

```
/src/app/pages/
├── eventos/                     # Lista de eventos
├── eventos-crear/               # Crear/editar evento
├── eventos-detalle/             # Detalle de evento
├── evento-subtipos/             # Lista de subtipos (plantillas)
└── evento-subtipo-crear/        # Crear/editar subtipo

/src/app/services/
├── eventos.service.ts           # Operaciones de eventos
└── evento-subtipos.service.ts   # Operaciones de subtipos

/src/app/models/
└── eventos.models.ts            # Interfaces y enums
```

---

## Backend (orca-sns-services-master)

**IMPORTANTE:** El backend actual NO tiene módulo de eventos implementado.

### Estructura existente:
- `com.gcpglobal.sns.auth` - Autenticación
- `com.gcpglobal.sns.user` - Usuarios
- `com.gcpglobal.sns.common` - Entidades comunes

### Estructura propuesta para eventos:
```
src/main/java/com/gcpglobal/sns/eventos/
├── controller/
│   ├── EventController.java
│   └── EventSubTypeController.java
├── service/
│   ├── EventService.java
│   └── EventSubTypeService.java
├── repository/
│   ├── EventRepository.java
│   └── EventSubTypeRepository.java
├── entity/
│   ├── Event.java
│   ├── EventSubType.java
│   └── EventSubTypeProperty.java
└── dto/
    ├── EventRequest.java
    ├── EventResponse.java
    └── ...
```

---

## Flujo de Datos

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Event Types   │────▶│  Event SubTypes  │────▶│     Events      │
│ (RISK,INCIDENT, │     │   (Plantillas)   │     │  (Instancias)   │
│    DEFECT)      │     │                  │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                    ┌──────────────────┐
                    │   Properties     │
                    │ (Campos custom)  │
                    └──────────────────┘
```

---

## Próximos Pasos

1. Revisar `02-MODELOS-INTERFACES.md` para los tipos de datos
2. Revisar `03-SERVICIOS-API.md` para las operaciones
3. Revisar `04-COMPONENTES-UI.md` para los componentes
4. Revisar `05-PLAN-IMPLEMENTACION.md` para el orden de trabajo
