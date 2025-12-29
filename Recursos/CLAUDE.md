# CLAUDE.md - Project Guide

## Project Overview
> this is an example

**Figmas** is a UI prototyping repository for an **Intelligent Risk Management System (GRC - Governance, Risk, Compliance)**. The main component is a **Node-based Process Editor** that allows users to visually map operational flows, analyze risks, and automate decisions using interactive nodes.

## Tech Stack

### Prototipos (este repo)
- **HTML5** - Semantic structure
- **CSS3** - Modern styles with flexbox/grid
- **Vanilla JavaScript** - No external dependencies
- **SVG** - Dynamic connection lines
- Standalone HTML files that work offline

### Desarrollo Principal (orca-alan)
- **Angular 20** - Framework principal
- **PrimeNG 20** - Componentes UI
- **@primeng/themes** - Tema Aura
- **PrimeFlex** - Utilidades CSS flexbox
- **Material Icons** - Iconografia principal
- **PrimeIcons** - Iconos complementarios

## Project Structure

```
/Figmas
├── CLAUDE.md                    # This file
├── orca-alan/                   # Angular Application (GRC System)
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   └── navbar/          # Navigation bar component
│   │   │   ├── pages/
│   │   │   │   ├── dashboard/       # Dashboard principal
│   │   │   │   ├── activos/         # Gestion de Activos
│   │   │   │   ├── organigramas/    # Gestion de Organigramas
│   │   │   │   ├── riesgos/         # Gestion de Riesgos
│   │   │   │   ├── incidentes/      # Gestion de Incidentes
│   │   │   │   └── defectos/        # Gestion de Defectos
│   │   │   ├── models/              # Interfaces TypeScript
│   │   │   ├── services/            # Servicios mock
│   │   │   ├── app.ts
│   │   │   ├── app.html
│   │   │   ├── app.config.ts
│   │   │   └── app.routes.ts
│   │   ├── styles.scss
│   │   └── index.html
│   ├── angular.json
│   └── package.json
├── Nodos/                       # Main node editor module (prototypes)
│   ├── editor-procesos-nodos.html
│   ├── README.md
│   ├── Contexto/
│   └── Imagenes Interfaz figma/
├── nodo_*.html                  # Node component prototypes
├── grc-base.html
├── activos-financieros-mockup.html
└── sistema-grc-activos-estrategico-mejorado.html
```

## ORCA ALAN - Angular Application

### Modulos Principales

| Modulo | Descripcion | Ruta |
|--------|-------------|------|
| **Dashboard** | Panel principal con metricas y KPIs | `/dashboard` |
| **Activos** | Gestion de activos organizacionales | `/activos` |
| **Organigramas** | Estructura organizacional jerarquica | `/organigramas` |
| **Riesgos** | Registro y seguimiento de riesgos | `/riesgos` |
| **Incidentes** | Gestion de incidentes de seguridad | `/incidentes` |
| **Defectos** | Control de defectos y no conformidades | `/defectos` |

### Modelo de Datos (Mockup)

```typescript
// Activo
interface Activo {
  id: string;
  nombre: string;
  tipo: 'hardware' | 'software' | 'datos' | 'personas' | 'instalaciones';
  criticidad: 'alta' | 'media' | 'baja';
  responsable: string;
  departamento: string;
  riesgos: Riesgo[];
  incidentes: Incidente[];
  defectos: Defecto[];
}

// Riesgo
interface Riesgo {
  id: string;
  activoId: string;
  descripcion: string;
  probabilidad: 1 | 2 | 3 | 4 | 5;
  impacto: 1 | 2 | 3 | 4 | 5;
  estado: 'identificado' | 'evaluado' | 'mitigado' | 'aceptado';
}

// Incidente
interface Incidente {
  id: string;
  activoId: string;
  titulo: string;
  descripcion: string;
  severidad: 'critica' | 'alta' | 'media' | 'baja';
  estado: 'abierto' | 'en_proceso' | 'resuelto' | 'cerrado';
  fechaReporte: Date;
}

// Defecto
interface Defecto {
  id: string;
  activoId: string;
  titulo: string;
  descripcion: string;
  tipo: 'funcional' | 'seguridad' | 'rendimiento' | 'usabilidad';
  prioridad: 'critica' | 'alta' | 'media' | 'baja';
  estado: 'nuevo' | 'confirmado' | 'en_correccion' | 'corregido' | 'verificado';
}
```

### Comandos de Desarrollo

```bash
# Navegar al proyecto Angular
cd orca-alan

# Instalar dependencias
npm install

# Servidor de desarrollo
ng serve
# Visitar: http://localhost:4200

# Build de produccion
ng build

# Generar componente
ng generate component components/nombre

# Generar pagina
ng generate component pages/nombre
```

## Node Types Implemented (Prototypes)

| Node Type | Purpose |
|-----------|---------|
| **Condicional (If/Case)** | Flow branching based on conditions |
| **Archivos (CSV/Excel)** | File data source with preview |
| **Activo** | Organization assets with properties |
| **Transformacion** | Data mapping, filtering, enrichment |
| **Prompt LLM** | AI model integration (GPT, Claude, etc.) |
| **Cambio de Estado** | State machine transitions |
| **ML** | Machine Learning model nodes |
| **Matematico** | Mathematical operations |
| **Branching** | Parallel execution branches |
| **Decision** | Decision logic nodes |

## Key Features

- **Drag & Drop** - Create nodes from sidebar, move within canvas
- **Visual Connections** - Bezier curve connections between nodes
- **2000x2000px Canvas** - Large workspace with scroll
- **Real-time Updates** - Connection lines update on node movement
- **Validation** - Flow validation before saving

## Language

- **Code/UI**: Spanish (es)
- **Documentation**: Spanish

## Team

- **Product Owner**: Francisco Puente
- **UX/UI Designer**: Alan Franco
- **Frontend Developers**: Cesar Gonzalez, Juan Martinez
- **Backend Developer**: Josue Cardenas
- **QA Engineer**: Emmanuel Vazquez

## Important Notes

1. **orca-alan** - Aplicacion Angular principal con mockups funcionales
2. **Prototipos HTML** - Archivos standalone para pruebas rapidas
3. **Datos Mock** - Todos los datos son simulados, sin backend real
4. **Zone.Identifier Files** - Windows metadata files (can be ignored)
5. **Proprietary System** - Orca@SecurityBy Design

## Related API Endpoints (Backend Reference - Future)

```
# Activos
GET    /api/activos
GET    /api/activos/{id}
POST   /api/activos
PUT    /api/activos/{id}
DELETE /api/activos/{id}

# Riesgos
GET    /api/activos/{id}/riesgos
POST   /api/activos/{id}/riesgos
PUT    /api/riesgos/{id}

# Incidentes
GET    /api/activos/{id}/incidentes
POST   /api/activos/{id}/incidentes
PUT    /api/incidentes/{id}

# Defectos
GET    /api/activos/{id}/defectos
POST   /api/activos/{id}/defectos
PUT    /api/defectos/{id}

# Organigramas
GET    /api/organigramas
GET    /api/organigramas/{id}
POST   /api/organigramas
```

## Business Rules

- Process names must be unique
- A process must have at least one node to be valid
- Risk is calculated from aggregated asset risks
- Processes with configurations should be deactivated, not deleted
- Cada activo puede tener multiples riesgos, incidentes y defectos
- Los riesgos se calculan con formula: Nivel = Probabilidad x Impacto

## Patrones y Convenciones Angular (IMPORTANTE)

### Estructura de Componentes

```typescript
// Usar standalone components (NO NgModules)
@Component({
  selector: 'app-nombre',
  standalone: true,
  imports: [/* imports aqui */],
  templateUrl: './nombre.html',
  styleUrl: './nombre.scss'  // singular, no styleUrls
})
```

### PrimeNG 20 - Cambios Importantes

```typescript
// CORRECTO - PrimeNG 20
import { SelectModule } from 'primeng/select';      // NO DropdownModule
import { TabsModule } from 'primeng/tabs';          // NO TabViewModule

// En templates usar:
<p-select>      // NO <p-dropdown>
<p-tabs>        // NO <p-tabView>
```

### Severities de Botones (PrimeNG 20)

```html
<!-- VALORES VALIDOS -->
severity="primary"
severity="secondary"
severity="success"
severity="info"
severity="warn"       <!-- NO "warning" -->
severity="danger"
severity="help"
severity="contrast"
```

### Signals y Computed Properties

```typescript
// Estado con signals
showDialog = signal(false);
selectedItem = signal<Item | null>(null);

// Datos computados
items = computed(() => this.service.getData());

// IMPORTANTE: Arrow functions NO permitidas en templates
// INCORRECTO en template:
{{ items().filter(i => i.active).length }}

// CORRECTO - usar computed property:
activeItems = computed(() => this.items().filter(i => i.active).length);
// En template:
{{ activeItems() }}
```

### Imports Comunes por Componente

```typescript
// Para componentes con tablas y formularios
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';  // Para pipes: date, slice, etc.
import { FormsModule } from '@angular/forms';    // Para ngModel
import { RouterLink } from '@angular/router';    // Para navegacion

// PrimeNG comunes
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';     // dropdown
import { TextareaModule } from 'primeng/textarea';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
```

### Estructura de Archivos por Pagina

```
pages/nombre/
├── nombre.ts       # Componente
├── nombre.html     # Template
└── nombre.scss     # Estilos (puede estar vacio)
```

### Lazy Loading de Rutas

```typescript
// app.routes.ts
export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard')
      .then(m => m.DashboardComponent)
  },
  // ... mas rutas
  { path: '**', redirectTo: 'dashboard' }
];
```

### Mock Data Service Pattern

```typescript
@Injectable({ providedIn: 'root' })
export class MockDataService {
  // Signal principal con datos
  private _activos = signal<Activo[]>(MOCK_DATA);

  // Exponer como readonly
  activos = this._activos.asReadonly();

  // Metodos para CRUD
  addActivo(data: Partial<Activo>) {
    const nuevo = { ...data, id: crypto.randomUUID() };
    this._activos.update(items => [...items, nuevo]);
  }
}
```

### Clases CSS (PrimeFlex)

```html
<!-- Layout -->
<div class="flex align-items-center justify-content-between gap-3">
<div class="grid">
  <div class="col-12 md:col-6 lg:col-3">

<!-- Espaciado -->
class="p-4"          <!-- padding -->
class="m-0 mb-2"     <!-- margin -->
class="gap-3"        <!-- gap en flex -->

<!-- Colores de texto -->
class="text-900"     <!-- texto principal -->
class="text-500"     <!-- texto secundario -->
class="text-red-500" <!-- colores semanticos -->

<!-- Fondos -->
class="surface-ground"   <!-- fondo pagina -->
class="surface-100"      <!-- fondo cards secundarios -->
class="bg-blue-100"      <!-- fondos de color -->

<!-- Tipografia -->
class="text-3xl font-bold"
class="text-sm text-500"
```

### Iconos

```html
<!-- Material Icons (preferido) -->
<span class="material-icons">warning</span>
<span class="material-icons text-red-500">error</span>

<!-- PrimeIcons (en botones) -->
<p-button icon="pi pi-plus" label="Nuevo"></p-button>
<p-button icon="pi pi-pencil" [rounded]="true" [text]="true"></p-button>
```

## Git Configuration

- **Repository**: https://github.com/Alanorca/Figmas.git
- **Branch**: main
- **Author**: Alan Franco <afranco@gcpglobal.com>
- **Environment**: WSL2 (Windows Subsystem for Linux)
