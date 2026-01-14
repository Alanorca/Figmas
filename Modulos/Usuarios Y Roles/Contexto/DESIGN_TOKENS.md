# Design Tokens

## Tipografia

### Font Families
- **Primary:** Sistema de fuentes del tema PrimeVue/PrimeReact

### Font Sizes (Tamaño)
| Token | Size |
|-------|------|
| 10 | 10px |
| 12 | 12px |
| 14 | 14px |
| 16 | 16px |
| 20 | 20px |
| 32 | 32px |

### Font Weights (Peso)
| Token | Weight |
|-------|--------|
| Extra Light | 200 |
| Regular | 400 |
| Bold | 700 |

### Componentes de Texto
```css
/* Header 32 Bold */
.header-xl { font-size: 32px; font-weight: 700; }

/* Header 20 Bold */
.header-lg { font-size: 20px; font-weight: 700; }

/* Header 16 Bold */
.header-md { font-size: 16px; font-weight: 700; }

/* Body 14 Regular */
.body-md { font-size: 14px; font-weight: 400; }

/* Body 14 Bold */
.body-md-bold { font-size: 14px; font-weight: 700; }

/* Body 12 Regular */
.body-sm { font-size: 12px; font-weight: 400; }

/* Body 12 Extra Light */
.body-sm-light { font-size: 12px; font-weight: 200; }

/* Body 10 Regular */
.body-xs { font-size: 10px; font-weight: 400; }
```

## Colores (Severities)

### Semantic Colors
| Severity | Uso |
|----------|-----|
| Primary | Acciones principales, elementos destacados |
| Secondary | Acciones secundarias |
| Success | Estados exitosos, activo |
| Warning | Alertas, pendiente |
| Danger | Errores, inactivo, eliminar |
| Info | Informacion adicional |
| Plain | Elementos neutros |
| Contrast | Alto contraste |

## Espaciado

### Border Radius
| Componente | Radius |
|------------|--------|
| Button | 6px |
| Button Rounded | 50% |
| Input | 6px |
| Card | 8px |
| Avatar Circle | 50% |
| Tag | 4px |
| Tag Rounded | 16px |

## Tamaños de Componentes

### Buttons
| Size | Height | Padding |
|------|--------|---------|
| Normal | 40px | 16px 24px |
| Small | 32px | 8px 16px |

### Inputs
| Size | Height |
|------|--------|
| Normal | 40px |

### Avatar
| Size | Dimension |
|------|-----------|
| Small | 24px |
| Normal | 32px |
| Large | 48px |
| X-Large | 64px |

## Estados Interactivos

### Opacidad
| Estado | Opacidad |
|--------|----------|
| Normal | 100% |
| Hover | 90% |
| Disabled | 50% |

### Focus
- Outline: 2px solid primary-color
- Offset: 2px

## Sombras

```css
/* Elevated elements */
.shadow-sm { box-shadow: 0 1px 3px rgba(0,0,0,0.12); }
.shadow-md { box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.shadow-lg { box-shadow: 0 10px 15px rgba(0,0,0,0.1); }
```

## Z-Index

| Elemento | Z-Index |
|----------|---------|
| Sidebar | 100 |
| Header | 200 |
| Dropdown | 1000 |
| Modal | 1100 |
| Tooltip | 1200 |
| SpeedDial | 1050 |
