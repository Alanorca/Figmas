# Contexto del Proyecto: Usuarios y Roles

Este directorio contiene toda la documentacion necesaria para implementar el modulo de Usuarios y Roles basado en el diseno de Figma.

## Archivos de Documentacion

| Archivo | Descripcion |
|---------|-------------|
| `PROYECTO.md` | Vision general del proyecto, enlaces a Figma, estructura |
| `COMPONENTES.md` | Catalogo completo de componentes UI utilizados |
| `PANTALLAS.md` | Descripcion detallada de cada pantalla |
| `DESIGN_TOKENS.md` | Tipografia, colores, espaciado, tamaños |
| `IMPLEMENTACION.md` | Guia tecnica, mapeo de componentes, ejemplos de codigo |

## Datos Raw de Figma

| Archivo | Node ID | Pantalla |
|---------|---------|----------|
| `figma-data-4001-28416.json` | 4001-28416 | Lista de Usuarios + Wizard |
| `figma-data-4001-12457.json` | 4001-12457 | Detalle de Rol |

## Enlaces Rapidos

- **Figma File:** [Abrir en Figma](https://www.figma.com/design/IwclNYlhuFaAyribbIGYtO/Asignaci%C3%B3n-de-Roles-y-Usuarios)
- **Lista de Usuarios:** [Node 4001-28416](https://www.figma.com/design/IwclNYlhuFaAyribbIGYtO/Asignaci%C3%B3n-de-Roles-y-Usuarios?node-id=4001-28416&m=dev)
- **Detalle de Rol:** [Node 4001-12457](https://www.figma.com/design/IwclNYlhuFaAyribbIGYtO/Asignaci%C3%B3n-de-Roles-y-Usuarios?node-id=4001-12457&m=dev)

## Como Usar Este Contexto

### Para Retomar el Proyecto
1. Lee `PROYECTO.md` para entender el alcance
2. Revisa `PANTALLAS.md` para ver que pantallas implementar
3. Consulta `COMPONENTES.md` para los componentes necesarios
4. Usa `IMPLEMENTACION.md` como referencia de codigo

### Para Claude/AI Assistant
Cuando retomes este proyecto, puedes indicar:

```
Lee el contexto en /home/alanfranco/Figmas/Modulos/Usuarios Y Roles/Contexto/
para entender el proyecto de Usuarios y Roles
```

O especificamente:
```
Basandote en PANTALLAS.md, implementa la pantalla de Lista de Usuarios
```

## Checklist de Implementacion

### Pantalla: Lista de Usuarios
- [ ] Layout principal (Header + Sidebar + Content)
- [ ] Toolbar con busqueda y acciones
- [ ] DataTable con columnas y seleccion
- [ ] Paginador
- [ ] Wizard de creacion (Stepper 4 pasos)
- [ ] Formulario de edicion
- [ ] Speed Dial de acciones rapidas

### Pantalla: Detalle de Rol
- [ ] Cover/Banner con informacion del rol
- [ ] Tabs de navegacion
- [ ] Seccion de permisos (Tree)
- [ ] Lista de usuarios asignados
- [ ] Acciones: Editar, Duplicar, Eliminar

### Componentes Compartidos
- [ ] AppHeader
- [ ] AppSidebar
- [ ] AppBreadcrumb
- [ ] StatusTag (estados con colores)
- [ ] UserAvatar

## Notas Adicionales

- El diseno usa el Design System de PrimeFaces
- Los iconos son de PrimeIcons (compatible con FontAwesome)
- El sidebar tiene dos estados: expandido y colapsado
- Los formularios usan Float Labels para mejor UX
- La tabla soporta seleccion multiple con checkboxes

---
*Contexto generado automaticamente desde Figma*
*Fecha de generacion: 2025-12-17*
