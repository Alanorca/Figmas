# DSG Knowledge Base - Bugs Aprendidos

Este archivo contiene todos los bugs de tema/estilos encontrados y corregidos por el Design System Guardian.
**IMPORTANTE**: Actualizar este archivo cada vez que se corrija un bug para acelerar futuras correcciones.

---

## Indice de Bugs por Categoria

- [Overlays y Drawers](#overlays-y-drawers)
- [Botones](#botones)
- [Formularios e Inputs](#formularios-e-inputs)
- [Tablas](#tablas)
- [Cards](#cards)
- [Acordeones](#acordeones)
- [Paleta de Colores](#paleta-de-colores)
- [Variables CSS Faltantes](#variables-css-faltantes)
- [Selectores Incorrectos](#selectores-incorrectos)

---

## Overlays y Drawers

### BUG-001: Drawers no responden al tema
**Fecha**: 2025-01
**Componente**: `p-drawer`
**Sintoma**: El drawer permanece en dark mode aunque el tema sea light
**Causa Raiz**: Los drawers se renderizan en `<body>`, fuera del componente host. Los selectores `:host.ds-theme-*` no aplican.
**Solucion**:
```scss
// En styles.scss (NO en component.scss)
body[data-ds-theme="light"] {
  .p-drawer {
    background: #ffffff !important;
    border-color: #e2e8f0 !important;
    color: #1e293b !important;
  }
}
body[data-ds-theme="dark"] {
  .p-drawer {
    background: #18181b !important;
    border-color: #3f3f46 !important;
    color: #fafafa !important;
  }
}
```
**Archivos Modificados**: `src/styles.scss`
**Patron**: Todos los overlays PrimeNG requieren estilos en `body[data-ds-theme="*"]`

---

### BUG-001b: Drawers persisten en dark mode cuando app global es dark pero DS es light
**Fecha**: 2025-01
**Componente**: `p-drawer` con conflicto de temas
**Sintoma**: Los drawers permanecen en dark mode incluso cuando el DS esta en light mode
**Causa Raiz**: Conflicto de especificidad CSS entre:
- `html.dark-mode .p-drawer` (estilos globales de dark mode)
- `body[data-ds-theme="light"] .p-drawer` (estilos del DS)

Cuando la app principal tiene `html.dark-mode` pero el DS tiene `data-ds-theme="light"`, ambos selectores aplican y el global interfiere.

**Solucion DEFINITIVA**:
```scss
// En los estilos GLOBALES de dark mode, excluir cuando DS theme esta activo
html.dark-mode {
  // Solo aplicar cuando DS theme NO esta activo
  body:not([data-ds-theme]) .p-drawer {
    background: #27272a !important;
    // ... estilos de dark mode global
  }
}

// Los estilos del DS en body[data-ds-theme] aplican sin interferencia
body[data-ds-theme="light"] {
  .p-drawer {
    background: #ffffff !important;
    // ... estilos de light mode DS
  }
}
```
**Archivos Modificados**: `src/styles.scss`
**Patron CLAVE**:
- Usar `body:not([data-ds-theme])` en estilos globales de dark mode para overlays
- Esto garantiza que cuando DS theme esta activo, los estilos globales NO aplican
- Los estilos del DS en `body[data-ds-theme="light/dark"]` siempre ganan

---

### BUG-001c: Contenido del drawer sin estilos para todos los elementos de texto
**Fecha**: 2025-01
**Componente**: `.p-drawer-content` elementos internos
**Sintoma**: Textos dentro del drawer permanecen en colores incorrectos
**Causa Raiz**: Solo se estilizaba el contenedor `.p-drawer-content`, no los elementos hijos
**Solucion**:
```scss
.p-drawer-content {
  background: #ffffff !important;
  color: #1e293b !important;

  // Todos los elementos de texto
  p, span, div, label, h1, h2, h3, h4, h5, h6 {
    color: #1e293b !important;
  }

  // Texto secundario
  .text-color-secondary,
  .text-muted {
    color: #64748b !important;
  }

  // Texto pequeno con icono
  .text-sm {
    color: #64748b !important;
    i { color: #64748b !important; }
  }
}
```
**Archivos Modificados**: `src/styles.scss`
**Patron**: Siempre estilizar explicitamente TODOS los elementos de texto (p, span, div, label, headings) dentro de overlays, no solo el contenedor

---

### BUG-002: Contenido del drawer (botones, inputs) en tema incorrecto
**Fecha**: 2025-01
**Componente**: `p-drawer` contenido interno
**Sintoma**: Los botones/inputs dentro del drawer no cambian de tema
**Causa Raiz**: Los estilos del drawer no incluian los componentes hijos
**Solucion**:
```scss
body[data-ds-theme="light"] {
  .p-drawer {
    // Botones dentro del drawer
    .p-button:not(.p-button-text):not(.p-button-outlined) {
      background: #10b981 !important;
      border-color: #10b981 !important;
      color: #ffffff !important;
    }
    // Inputs dentro del drawer
    .p-inputtext, input[pInputText] {
      background: #ffffff !important;
      border-color: #cbd5e1 !important;
      color: #1e293b !important;
    }
  }
}
```
**Archivos Modificados**: `src/styles.scss`
**Patron**: Siempre incluir estilos de componentes hijos en overlays

---

### BUG-003: Menus de contexto y dropdowns en tema incorrecto
**Fecha**: 2025-01
**Componente**: `p-menu`, `p-select` panel
**Sintoma**: Menus desplegables permanecen oscuros en light mode
**Causa Raiz**: Los paneles de menu se renderizan en body
**Solucion**:
```scss
body[data-ds-theme="light"] {
  .p-menu, .p-select-overlay, .p-multiselect-overlay {
    background: #ffffff !important;
    border-color: #e2e8f0 !important;

    .p-menu-item-link {
      color: #1e293b !important;
      &:hover {
        background: #f1f5f9 !important;
      }
    }
  }
}
```
**Archivos Modificados**: `src/styles.scss`

---

## Botones

### BUG-004: Botones no cambian a light mode
**Fecha**: 2025-01
**Componente**: `p-button` (todos los variants)
**Sintoma**: Botones permanecen con colores de dark mode en light mode
**Causa Raiz**: Faltaban estilos completos para todos los variants de botones
**Solucion**:
```scss
:host.ds-theme-light {
  // Primary solid
  .p-button:not(.p-button-text):not(.p-button-outlined):not(.p-button-link):not([class*="p-button-"]) {
    background: #10b981 !important;
    border-color: #10b981 !important;
    color: #ffffff !important;
  }

  // Text button
  .p-button-text {
    background: transparent !important;
    color: #10b981 !important;
  }

  // Outlined button
  .p-button-outlined {
    background: transparent !important;
    border-color: #10b981 !important;
    color: #10b981 !important;
  }

  // Secondary
  .p-button-secondary {
    background: #f1f5f9 !important;
    color: #475569 !important;
  }
}
```
**Archivos Modificados**: `src/app/pages/design-system/design-system.component.scss`
**Patron**: Cubrir TODOS los variants: text, outlined, solid, y todas las severities (secondary, success, danger, info, warn, contrast)

---

### BUG-005: Botones de toolbar no responden al tema
**Fecha**: 2025-01
**Componente**: `p-button` dentro de `p-toolbar`
**Sintoma**: Botones en toolbar permanecen en dark mode
**Causa Raiz**: Los selectores generales no tenian suficiente especificidad
**Solucion**:
```scss
:host.ds-theme-light {
  .p-toolbar {
    .p-toolbar-start, .p-toolbar-end {
      .p-button {
        // Estilos especificos con alta especificidad
      }
    }
  }
}
```
**Archivos Modificados**: `src/app/pages/design-system/design-system.component.scss`
**Patron**: Usar selectores anidados para mayor especificidad en contextos especificos

---

## Formularios e Inputs

### BUG-006: Checkboxes de tabla no responden al tema
**Fecha**: 2025-01
**Componente**: `p-tableCheckbox`, `p-tableHeaderCheckbox`
**Sintoma**: Checkboxes de seleccion de tabla permanecen oscuros
**Causa Raiz**: Componentes de tabla tienen clases especificas diferentes a p-checkbox
**Solucion**:
```scss
:host.ds-theme-light {
  p-tableCheckbox, p-tableHeaderCheckbox {
    .p-checkbox-box {
      background: #ffffff !important;
      border-color: #cbd5e1 !important;
    }
    .p-checkbox-box.p-highlight {
      background: #10b981 !important;
      border-color: #10b981 !important;
    }
  }
}
```
**Archivos Modificados**: `src/app/pages/design-system/design-system.component.scss`

---

### BUG-007: Column filter en tabla no responde al tema
**Fecha**: 2025-01
**Componente**: `p-columnFilter`
**Sintoma**: Icono y panel de filtro de columna permanecen oscuros
**Causa Raiz**: p-columnFilter tiene estructura de markup diferente
**Solucion**:
```scss
:host.ds-theme-light {
  p-columnFilter {
    .p-column-filter-menu-button {
      color: #64748b !important;
      &:hover {
        background: #f1f5f9 !important;
        color: #1e293b !important;
      }
    }
  }
}
```
**Archivos Modificados**: `src/app/pages/design-system/design-system.component.scss`

---

## Tablas

### BUG-008: Headers de tabla no cambian de tema
**Fecha**: 2025-01
**Componente**: `p-table` header
**Sintoma**: Los headers de tabla permanecen con fondo oscuro
**Causa Raiz**: PrimeNG aplica estilos inline en headers
**Solucion**:
```scss
:host.ds-theme-light {
  .p-datatable {
    .p-datatable-thead > tr > th {
      background: #f8fafc !important;
      color: #475569 !important;
      border-color: #e2e8f0 !important;
    }
  }
}
```
**Archivos Modificados**: `src/app/pages/design-system/design-system.component.scss`
**Patron**: Usar `!important` para override de estilos inline de PrimeNG

---

## Cards

### BUG-011: p-card elementos internos sin estilos de tema
**Fecha**: 2025-01
**Componente**: `p-card` y pagina de Cards
**Sintoma**: Las cards en light mode se ven como dark mode. El fondo, textos y elementos internos no responden al tema.
**Causa Raiz**: Los estilos de `.p-card` solo cubrian el contenedor principal, faltaban:
- `.p-card-body` - contenedor del body
- `.p-card-header` - area de header
- `.p-card-content` - area de contenido
- `.p-card-footer` - area de footer
- Elementos especificos de la pagina (stat-card, product-card, user-card, cart-summary, highlight-section)

**Solucion**:
```scss
// Light mode
:host.ds-theme-light {
  ::ng-deep {
    .p-card {
      background: #ffffff !important;
      color: #1e293b !important;
      border: 1px solid #e2e8f0 !important;
      border-radius: 8px !important;

      .p-card-body {
        background: #ffffff !important;
        color: #1e293b !important;
      }

      .p-card-header {
        background: #ffffff !important;
        border-bottom: 1px solid #e2e8f0 !important;
      }

      .p-card-content {
        background: #ffffff !important;
        color: #1e293b !important;
        p { color: #1e293b !important; }
        h4 { color: #1e293b !important; }
        span { color: #64748b !important; }
      }

      .p-card-footer {
        background: #ffffff !important;
        border-top: 1px solid #e2e8f0 !important;
      }
    }

    // Estilos especificos de componentes de la pagina
    .stat-card, .product-card, .user-card-interactive,
    .cart-summary, .highlight-section { ... }
  }
}
```
**Archivos Modificados**: `src/app/pages/design-system/design-system.component.scss`
**Patron**:
1. Siempre cubrir TODOS los sub-elementos de p-card (.p-card-body, .p-card-header, .p-card-content, .p-card-footer)
2. Incluir estilos para clases especificas de la pagina (stat-card, product-card, etc.)
3. Usar selectores especificos para textos internos (p, h4, span)
4. Aplicar estilos consistentes en ambos temas (light y dark)

---

## Paleta de Colores

### BUG-013: --surface-900 usa slate (#0f172a) en lugar de zinc (#18181b)
**Fecha**: 2026-02
**Componente**: Variables CSS globales, afecta dark mode de todo el DS
**Sintoma**: Los fondos de contenedores en dark mode tienen un tinte azulado en lugar de ser grises puros. El color `#0f172a` (slate-900) aparece en lugar de `#18181b` (zinc-900).
**Causa Raiz**: En `_design-tokens.scss` línea 291:
```scss
--surface-900: var(--slate-900);  // #0f172a - INCORRECTO (tinte azul)
```
Esto afecta a todos los componentes que usan `var(--surface-900)` en dark mode, incluyendo stats cards con `color-mix()`.

**Solucion**:
Añadir override en `design-system.component.scss` dentro del bloque `:host.ds-theme-dark`:
```scss
:host.ds-theme-dark {
  // ... otras variables ...

  // FIX: Override global --surface-900 que usa slate (#0f172a)
  // Corregido a zinc-900 (#18181b) para mantener consistencia
  --surface-900: #18181b;
}
```
**Archivos Modificados**: `src/app/pages/design-system/design-system.component.scss`
**Patron CLAVE - Paleta Zinc vs Slate**:
| Variable | Slate (INCORRECTO) | Zinc (CORRECTO) |
|----------|-------------------|-----------------|
| 900 | #0f172a (azulado) | #18181b (gris puro) |
| 800 | #1e293b (azulado) | #27272a (gris puro) |
| 700 | #334155 (azulado) | #3f3f46 (gris puro) |
| 600 | #475569 (azulado) | #52525b (gris puro) |

**REGLA**: En dark mode del DS, SIEMPRE usar paleta **zinc** (grises puros), NUNCA **slate** (tiene tinte azul).

**Componentes Afectados por este bug**:
- Stats cards (usan `color-mix(in srgb, var(--surface-900), transparent 50%)`)
- Cualquier componente que use `var(--surface-900)` para fondos en dark mode
- Contenedores con gradientes o backgrounds oscuros

---

## Variables CSS Faltantes

### BUG-009: Variable --orange-600 no definida
**Fecha**: 2025-01
**Componente**: Clase `.low-qty`
**Sintoma**: Warning de variable CSS no definida
**Causa Raiz**: Se usaba `--orange-600` que no estaba definida en el scope del DS
**Solucion**:
```scss
:host.ds-theme-light {
  --orange-500: #f97316;
  --orange-600: #ea580c;
  --orange-700: #c2410c;
}
:host.ds-theme-dark {
  --orange-500: #fb923c;
  --orange-600: #fdba74;
  --orange-700: #fed7aa;
}
```
**Archivos Modificados**: `src/app/pages/design-system/design-system.component.scss`
**Patron**: Verificar que todas las variables usadas esten definidas en ambos temas

---

## Selectores Incorrectos

### BUG-010: Usar :host.ds-theme-* para overlays
**Fecha**: 2025-01
**Componente**: Cualquier overlay
**Sintoma**: Estilos no aplican a overlays
**Causa Raiz**: `:host.ds-theme-*` solo funciona para elementos dentro del componente host
**Solucion**: Usar `body[data-ds-theme="*"]` en `styles.scss` para overlays
**Patron**:
- Componentes en host -> `:host.ds-theme-*` en component.scss
- Overlays -> `body[data-ds-theme="*"]` en styles.scss

---

## Patrones de Solucion Rapida

### Checklist para nuevos componentes

1. **Identificar donde se renderiza**:
   - Dentro del host? -> usar `:host.ds-theme-*`
   - En body (overlay)? -> usar `body[data-ds-theme="*"]` en styles.scss

2. **Cubrir todos los estados**:
   - Normal
   - Hover
   - Focus
   - Active/Selected
   - Disabled

3. **Cubrir todos los variants** (para botones):
   - Default (primary solid)
   - Text
   - Outlined
   - Link
   - Secondary, Success, Danger, Info, Warn, Contrast

4. **Usar !important** cuando PrimeNG tiene estilos inline

5. **Verificar en ambos temas** antes de marcar como corregido

---

## Acordeones

### BUG-012: p-accordion no responde al tema dark mode
**Fecha**: 2026-02
**Componente**: `p-accordion`, `p-accordionpanel`, `p-accordionheader`, `p-accordioncontent`
**Sintoma**: Los headers y contenido de los acordeones permanecen con fondo blanco en dark mode. La tabla de propiedades (ds-props-table) dentro de las secciones también queda en light mode.
**Causa Raiz**: Faltaban estilos para el componente `p-accordion` en `design-system.component.scss`. PrimeNG usa estilos por defecto (fondo blanco) que no respetan las variables CSS del DS theme. Además, PrimeNG genera múltiples contenedores internos (`.p-accordioncontent`, `.p-toggleable-content`, divs wrapper) que también necesitan estilos.
**Solucion**:
```scss
// Light mode
:host.ds-theme-light {
  ::ng-deep {
    .p-accordion {
      background: #ffffff !important;

      .p-accordionpanel {
        border-color: #e2e8f0 !important;
        background: #ffffff !important;
      }

      .p-accordionheader {
        background: #ffffff !important;
        color: #1e293b !important;
        border-color: #e2e8f0 !important;

        &:hover { background: #f8fafc !important; }
        .p-accordionheader-toggle-icon { color: #64748b !important; }
      }

      // IMPORTANTE: Cubrir TODOS los contenedores internos
      .p-accordioncontent,
      .p-accordionpanel-content,
      .p-toggleable-content {
        background: #ffffff !important;
        color: #1e293b !important;
        border-color: #e2e8f0 !important;

        > div { background: #ffffff !important; }
      }

      // Contenido personalizado de la página
      .accordion-body {
        background: #ffffff !important;
        color: #1e293b !important;
        .section-description { color: #64748b !important; }
      }
    }
  }
}

// Dark mode
:host.ds-theme-dark {
  ::ng-deep {
    .p-accordion {
      background: #18181b !important;

      .p-accordionpanel {
        border-color: #27272a !important;
        background: #18181b !important;
      }

      .p-accordionheader {
        background: #18181b !important;
        color: #fafafa !important;
        border-color: #27272a !important;

        &:hover { background: #27272a !important; }
        .p-accordionheader-toggle-icon { color: #a1a1aa !important; }
      }

      .p-accordioncontent,
      .p-accordionpanel-content,
      .p-toggleable-content {
        background: #18181b !important;
        color: #fafafa !important;
        border-color: #27272a !important;

        > div { background: #18181b !important; }
      }

      .accordion-body {
        background: #18181b !important;
        color: #fafafa !important;
        .section-description { color: #a1a1aa !important; }
      }
    }
  }
}
```
**Archivos Modificados**: `src/app/pages/design-system/design-system.component.scss`
**Patron CLAVE**:
1. El acordeón principal `.p-accordion` necesita background
2. Cubrir TODOS los contenedores internos: `.p-accordioncontent`, `.p-accordionpanel-content`, `.p-toggleable-content`
3. Usar `> div` para cubrir wrappers generados por PrimeNG
4. Incluir clases personalizadas de la página (`.accordion-body`)
5. Los componentes DS (ds-props-table) necesitan override cuando están fuera de ds-preview

---

## Estadisticas

| Categoria | Bugs Encontrados | Bugs Corregidos |
|-----------|-----------------|-----------------|
| Overlays/Drawers | 5 | 5 |
| Botones | 2 | 2 |
| Formularios | 2 | 2 |
| Tablas | 1 | 1 |
| Cards | 1 | 1 |
| Acordeones | 1 | 1 |
| Paleta de Colores | 1 | 1 |
| Variables | 1 | 1 |
| Selectores | 1 | 1 |
| **Total** | **14** | **14** |

---

## Como Agregar Nuevos Bugs

```markdown
### BUG-XXX: [Titulo descriptivo]
**Fecha**: YYYY-MM
**Componente**: [nombre del componente PrimeNG]
**Sintoma**: [que se ve mal]
**Causa Raiz**: [por que ocurre]
**Solucion**:
\```scss
// Codigo de la solucion
\```
**Archivos Modificados**: [lista de archivos]
**Patron**: [patron general para bugs similares]
```
