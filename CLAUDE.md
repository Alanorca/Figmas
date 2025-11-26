# CLAUDE.md - Project Guide

## Project Overview

**Figmas** is a UI prototyping repository for an **Intelligent Risk Management System (GRC - Governance, Risk, Compliance)**. The main component is a **Node-based Process Editor** that allows users to visually map operational flows, analyze risks, and automate decisions using interactive nodes.

## Tech Stack

- **HTML5** - Semantic structure
- **CSS3** - Modern styles with flexbox/grid
- **Vanilla JavaScript** - No external dependencies
- **SVG** - Dynamic connection lines
- Standalone HTML files that work offline

## Project Structure

```
/Figmas
├── CLAUDE.md                    # This file
├── Nodos/                       # Main node editor module
│   ├── editor-procesos-nodos.html   # Main editor (standalone)
│   ├── README.md                    # Detailed documentation
│   ├── Contexto/                    # User stories & specs (Spanish)
│   │   ├── Gestión de Procesos.txt
│   │   └── Historias de Usuario.txt
│   ├── Imagenes Interfaz figma/     # Figma design references
│   └── nodo_*.html                  # Individual node examples
├── nodo_*.html                  # Node component prototypes (root)
├── grc-base.html                # Base GRC interface
├── activos-financieros-mockup.html          # Financial assets mockup
└── sistema-grc-activos-estrategico-mejorado.html  # Strategic GRC system
```

## Node Types Implemented

| Node Type | Purpose |
|-----------|---------|
| **Condicional (If/Case)** | Flow branching based on conditions |
| **Archivos (CSV/Excel)** | File data source with preview |
| **Activo** | Organization assets with properties |
| **Transformación** | Data mapping, filtering, enrichment |
| **Prompt LLM** | AI model integration (GPT, Claude, etc.) |
| **Cambio de Estado** | State machine transitions |
| **ML** | Machine Learning model nodes |
| **Matemático** | Mathematical operations |
| **Branching** | Parallel execution branches |
| **Decisión** | Decision logic nodes |

## Key Features

- **Drag & Drop** - Create nodes from sidebar, move within canvas
- **Visual Connections** - Bezier curve connections between nodes
- **2000x2000px Canvas** - Large workspace with scroll
- **Real-time Updates** - Connection lines update on node movement
- **Validation** - Flow validation before saving

## Development Commands

```bash
# Open main editor in browser
open Nodos/editor-procesos-nodos.html

# Or serve locally
python3 -m http.server 8000
# Then visit: http://localhost:8000/Nodos/editor-procesos-nodos.html
```

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

1. **Standalone Files** - Each HTML file is self-contained with embedded CSS/JS
2. **No Build Process** - Open HTML files directly in browser
3. **Zone.Identifier Files** - Windows metadata files (can be ignored)
4. **Proprietary System** - Orca@SecurityBy Design

## Related API Endpoints (Backend Reference)

```
GET    /processes/{id}
GET    /processes
POST   /processes
PUT    /processes/{id}
DELETE /processes/{id}
PATCH  /processes/{id}/deactivate
```

## Business Rules

- Process names must be unique
- A process must have at least one node to be valid
- Risk is calculated from aggregated asset risks
- Processes with configurations should be deactivated, not deleted
