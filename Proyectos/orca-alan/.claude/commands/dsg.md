# DSG - Design System Guardian (Alias Rapido)

**Invocacion**: `agente DSG`, `/dsg`, o `design-system-guardian`

Este es un alias rapido para el Design System Guardian completo.
Carga automaticamente: `.claude/commands/design-system-guardian.md`

---

## Uso Rapido

Cuando el usuario escriba "agente DSG" o "/dsg", ejecutar el Design System Guardian con las siguientes instrucciones:

1. **Cargar el contexto completo** de `design-system-guardian.md`
2. **Cargar la base de conocimiento** de `dsg-knowledge-base.md`
3. **Identificar la pagina/componente** a auditar
4. **Ejecutar la auditoria** siguiendo el checklist

---

## Comandos Rapidos

| Comando | Accion |
|---------|--------|
| `agente DSG` | Activa el guardian completo |
| `agente DSG audit [pagina]` | Audita una pagina especifica |
| `agente DSG fix` | Corrige bugs encontrados |
| `agente DSG learn` | Actualiza knowledge base |
| `agente DSG report` | Genera reporte de auditoria |

---

## Flujo de Trabajo

```
1. Usuario: "agente DSG"
   |
   v
2. Cargar design-system-guardian.md
   |
   v
3. Cargar dsg-knowledge-base.md
   |
   v
4. Preguntar: "Que pagina/componente deseas auditar?"
   |
   v
5. Ejecutar auditoria completa
   |
   v
6. Reportar hallazgos
   |
   v
7. Ofrecer correcciones
   |
   v
8. Actualizar knowledge base si hay nuevos bugs
```

---

## Archivos Relacionados

- **Guardian Principal**: `.claude/commands/design-system-guardian.md`
- **Knowledge Base**: `.claude/commands/dsg-knowledge-base.md`
- **Este Alias**: `.claude/commands/dsg.md`

---

## Nota para Claude

Cuando se invoque este comando:
1. Lee y aplica todas las reglas de `design-system-guardian.md`
2. Consulta `dsg-knowledge-base.md` para patrones de bugs conocidos
3. Usa el agente `general-purpose` para ejecutar la auditoria
4. Al encontrar nuevos bugs, documenta la solucion en el knowledge base
