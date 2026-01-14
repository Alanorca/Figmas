# Guia de Implementacion

## Stack Tecnologico Recomendado

### Opcion 1: Vue.js
```bash
npm install primevue primeicons
```

### Opcion 2: React
```bash
npm install primereact primeicons
```

### Opcion 3: Angular
```bash
npm install primeng primeicons
```

## Mapeo de Componentes Figma -> PrimeVue/React/NG

| Componente Figma | PrimeVue | PrimeReact | PrimeNG |
|------------------|----------|------------|---------|
| button | `<Button>` | `<Button>` | `<p-button>` |
| inputtext | `<InputText>` | `<InputText>` | `<p-inputText>` |
| select | `<Select>` | `<Dropdown>` | `<p-dropdown>` |
| multiselect | `<MultiSelect>` | `<MultiSelect>` | `<p-multiSelect>` |
| checkbox | `<Checkbox>` | `<Checkbox>` | `<p-checkbox>` |
| togglebutton | `<ToggleButton>` | `<ToggleButton>` | `<p-toggleButton>` |
| selectbutton | `<SelectButton>` | `<SelectButton>` | `<p-selectButton>` |
| inputnumber | `<InputNumber>` | `<InputNumber>` | `<p-inputNumber>` |
| datatable | `<DataTable>` | `<DataTable>` | `<p-table>` |
| paginator | `<Paginator>` | `<Paginator>` | `<p-paginator>` |
| avatar | `<Avatar>` | `<Avatar>` | `<p-avatar>` |
| avatargroup | `<AvatarGroup>` | `<AvatarGroup>` | `<p-avatarGroup>` |
| badge | `<Badge>` | `<Badge>` | `<p-badge>` |
| tag | `<Tag>` | `<Tag>` | `<p-tag>` |
| chip | `<Chip>` | `<Chip>` | `<p-chip>` |
| breadcrumb | `<Breadcrumb>` | `<BreadCrumb>` | `<p-breadcrumb>` |
| stepper | `<Stepper>` | `<Stepper>` | `<p-stepper>` |
| tree | `<Tree>` | `<Tree>` | `<p-tree>` |
| tooltip | `v-tooltip` | `<Tooltip>` | `pTooltip` |
| progressbar | `<ProgressBar>` | `<ProgressBar>` | `<p-progressBar>` |
| divider | `<Divider>` | `<Divider>` | `<p-divider>` |
| speeddial | `<SpeedDial>` | `<SpeedDial>` | `<p-speedDial>` |
| splitbutton | `<SplitButton>` | `<SplitButton>` | `<p-splitButton>` |
| floatlabel | `<FloatLabel>` | `<FloatLabel>` | `<p-floatLabel>` |

## Estructura de Archivos Sugerida

```
src/
├── components/
│   ├── layout/
│   │   ├── AppHeader.vue
│   │   ├── AppSidebar.vue
│   │   └── AppBreadcrumb.vue
│   ├── usuarios/
│   │   ├── UserTable.vue
│   │   ├── UserForm.vue
│   │   ├── UserWizard.vue
│   │   └── UserCard.vue
│   └── roles/
│       ├── RoleDetail.vue
│       ├── RoleCover.vue
│       ├── RolePermissions.vue
│       └── RoleUsers.vue
├── views/
│   ├── usuarios/
│   │   ├── UsuariosListView.vue
│   │   └── UsuarioDetailView.vue
│   └── roles/
│       ├── RolesListView.vue
│       └── RolDetailView.vue
├── composables/ (o hooks/)
│   ├── useUsuarios.js
│   └── useRoles.js
└── services/
    ├── usuarioService.js
    └── rolService.js
```

## Ejemplos de Implementacion

### Button con Variantes (Vue)
```vue
<template>
  <!-- Primary -->
  <Button label="Guardar" severity="primary" />

  <!-- Secondary Outlined -->
  <Button label="Cancelar" severity="secondary" outlined />

  <!-- Icon Only -->
  <Button icon="pi pi-plus" severity="primary" rounded />

  <!-- Text Button -->
  <Button label="Eliminar" severity="danger" text />

  <!-- With Icon -->
  <Button label="Nuevo" icon="pi pi-plus" severity="primary" />
</template>
```

### DataTable con Seleccion (Vue)
```vue
<template>
  <DataTable
    :value="usuarios"
    v-model:selection="selectedUsers"
    dataKey="id"
    paginator
    :rows="10"
    :rowsPerPageOptions="[5, 10, 20]"
  >
    <Column selectionMode="multiple" headerStyle="width: 3rem" />
    <Column field="nombre" header="Nombre" sortable />
    <Column field="email" header="Email" sortable />
    <Column field="rol" header="Rol">
      <template #body="{ data }">
        <Tag :value="data.rol" :severity="getRolSeverity(data.rol)" />
      </template>
    </Column>
    <Column field="estado" header="Estado">
      <template #body="{ data }">
        <Tag :value="data.estado" :severity="getEstadoSeverity(data.estado)" />
      </template>
    </Column>
    <Column header="Acciones">
      <template #body="{ data }">
        <Button icon="pi pi-pencil" text rounded @click="editUser(data)" />
        <Button icon="pi pi-ellipsis-v" text rounded />
      </template>
    </Column>
  </DataTable>
</template>
```

### Stepper Wizard (Vue)
```vue
<template>
  <Stepper v-model:activeStep="activeStep">
    <StepperPanel header="Informacion Basica">
      <template #content="{ nextCallback }">
        <div class="flex flex-column gap-3">
          <FloatLabel>
            <InputText id="nombre" v-model="form.nombre" />
            <label for="nombre">Nombre</label>
          </FloatLabel>
          <FloatLabel>
            <InputText id="email" v-model="form.email" />
            <label for="email">Email</label>
          </FloatLabel>
        </div>
        <div class="flex justify-content-end mt-4">
          <Button label="Siguiente" icon="pi pi-arrow-right" @click="nextCallback" />
        </div>
      </template>
    </StepperPanel>

    <StepperPanel header="Estado de la Cuenta">
      <!-- contenido -->
    </StepperPanel>

    <StepperPanel header="Acceso de Activos">
      <!-- Tree component -->
    </StepperPanel>

    <StepperPanel header="Configuracion Seguridad">
      <!-- Checkboxes y permisos -->
    </StepperPanel>
  </Stepper>
</template>
```

### Sidebar Colapsable (Vue)
```vue
<template>
  <div :class="['sidebar', { collapsed: isCollapsed }]">
    <div class="sidebar-header">
      <Button
        :icon="isCollapsed ? 'pi pi-bars' : 'pi pi-times'"
        text
        @click="toggleSidebar"
      />
    </div>
    <div class="sidebar-menu">
      <Button icon="pi pi-th-large" :label="!isCollapsed ? 'Dashboard' : ''" text />
      <Button icon="pi pi-box" :label="!isCollapsed ? 'Inventario' : ''" text />
      <Button icon="pi pi-share-alt" :label="!isCollapsed ? 'Compartir' : ''" text />
      <Button icon="pi pi-users" :label="!isCollapsed ? 'Usuarios' : ''" text class="active" />
      <Button icon="pi pi-book" :label="!isCollapsed ? 'Documentacion' : ''" text />
      <Divider />
      <Button icon="pi pi-power-off" :label="!isCollapsed ? 'Cerrar Sesion' : ''" text severity="danger" />
    </div>
  </div>
</template>
```

## API Endpoints Sugeridos

```
GET    /api/usuarios          - Lista de usuarios (con paginacion)
GET    /api/usuarios/:id      - Detalle de usuario
POST   /api/usuarios          - Crear usuario
PUT    /api/usuarios/:id      - Actualizar usuario
DELETE /api/usuarios/:id      - Eliminar usuario

GET    /api/roles             - Lista de roles
GET    /api/roles/:id         - Detalle de rol
POST   /api/roles             - Crear rol
PUT    /api/roles/:id         - Actualizar rol
DELETE /api/roles/:id         - Eliminar rol

GET    /api/permisos          - Lista de permisos (arbol)
GET    /api/activos           - Arbol de activos
```

## Validaciones de Formulario

### Usuario
```javascript
const validationSchema = {
  nombre: { required: true, minLength: 2, maxLength: 100 },
  email: { required: true, email: true },
  telefono: { pattern: /^\+?[0-9]{10,15}$/ },
  rol: { required: true },
  estado: { required: true, oneOf: ['activo', 'inactivo', 'pendiente'] }
}
```

### Rol
```javascript
const validationSchema = {
  nombre: { required: true, minLength: 2, maxLength: 50 },
  descripcion: { maxLength: 500 },
  permisos: { required: true, minItems: 1 }
}
```
