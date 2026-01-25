# Claude Commands - orca-alan

Este directorio contiene los comandos personalizados de Claude para el proyecto orca-alan.

---

## Comandos Disponibles

| Comando | Alias | Descripcion |
|---------|-------|-------------|
| `/design-system-guardian` | `agente DSG`, `/dsg` | Guardian del Design System - audita temas y estilos |
| `/tabla-template` | - | Template para crear nuevas tablas |

---

## Design System Guardian (DSG)

El guardian principal para mantener la consistencia del Design System.

### Invocacion
```
agente DSG
/dsg
/design-system-guardian
```

### Funcionalidades
- Auditoria completa de temas (light/dark)
- Verificacion de uso correcto de PrimeNG
- Deteccion de colores hardcodeados
- Validacion de variables CSS
- Sistema de aprendizaje de bugs

### Archivos
- `design-system-guardian.md` - Guardian principal con reglas completas
- `dsg-knowledge-base.md` - Base de conocimiento de bugs aprendidos
- `dsg.md` - Alias rapido para invocacion

---

## Estructura de Archivos

```
.claude/
  commands/
    README.md                    <- Este archivo
    design-system-guardian.md    <- Guardian principal
    dsg-knowledge-base.md        <- Bugs aprendidos
    dsg.md                       <- Alias rapido
    tabla-template.md            <- Template de tablas
```

---

## Como Crear Nuevos Comandos

1. Crear archivo `.md` en este directorio
2. Documentar:
   - Proposito del comando
   - Instrucciones para Claude
   - Ejemplos de uso
3. Agregar al README.md

---

## Uso Rapido

Para invocar el Design System Guardian:

```
Usuario: "agente DSG"
Claude: [Carga el guardian y ejecuta auditoria]

Usuario: "agente DSG audit tables"
Claude: [Audita la pagina de tables]

Usuario: "agente DSG fix"
Claude: [Corrige los bugs encontrados]
```
