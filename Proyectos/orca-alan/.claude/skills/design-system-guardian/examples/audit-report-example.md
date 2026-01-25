# Ejemplo: Reporte de Auditoría DSG

Este archivo muestra el formato correcto de un reporte de auditoría.

---

## DSG Audit Report - Página Cuestionarios

**Fecha**: 2025-01-25
**Auditor**: Design System Guardian
**Tema testeado**: Light / Dark

### Estado del Tema
- Tema actual: light
- Signal value: 'light'
- Body attribute: data-ds-theme="light"
- Host class: ds-theme-light

### Componentes Auditados

| Componente | Light Mode | Dark Mode | Estado |
|------------|------------|-----------|--------|
| p-button (primary) | OK | OK | ✅ |
| p-button (secondary) | OK | OK | ✅ |
| p-table | OK | OK | ✅ |
| p-drawer | OK | FAIL | ⚠️ Revisar |
| p-dialog | OK | OK | ✅ |
| p-inputtext | OK | OK | ✅ |
| p-select | OK | OK | ✅ |

### Violaciones Encontradas

#### Violación 1: Color Hardcodeado
- **Archivo**: `src/app/pages/cuestionarios/cuestionarios.component.scss:45`
- **Línea**: `color: #333333;`
- **Problema**: Color hardcodeado que no responde al tema
- **Impacto**: En dark mode el texto es ilegible
- **Solución**: Cambiar a `color: var(--text-color);`
- **Severidad**: Alta

#### Violación 2: Botón HTML Nativo
- **Archivo**: `src/app/pages/cuestionarios/cuestionarios.component.html:23`
- **Línea**: `<button class="custom-btn">Acción</button>`
- **Problema**: Usa elemento HTML nativo en lugar de PrimeNG
- **Impacto**: No tiene estilos del design system
- **Solución**: Cambiar a `<p-button label="Acción" />`
- **Severidad**: Media

### Correcciones Aplicadas

- [x] Corregido color hardcodeado en cuestionarios.component.scss
- [x] Reemplazado button nativo por p-button
- [ ] Pendiente: Revisar drawer en dark mode

### Knowledge Base Actualizado

- Agregado BUG-014: Color hardcodeado en cuestionarios

---

## Resumen

| Métrica | Valor |
|---------|-------|
| Componentes auditados | 7 |
| Violaciones encontradas | 2 |
| Violaciones corregidas | 2 |
| Estado final | ✅ Aprobado |
