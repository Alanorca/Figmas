import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { MenuModule } from 'primeng/menu';
import { MultiSelectModule } from 'primeng/multiselect';
import { SliderModule } from 'primeng/slider';
import { DrawerModule } from 'primeng/drawer';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import { DsPreviewComponent } from '../../../components/ds-preview/ds-preview.component';
import { DsCodeBlockComponent } from '../../../components/ds-code-block/ds-code-block.component';
import { DsCodeTabsComponent, CodeTab } from '../../../components/ds-code-tabs/ds-code-tabs.component';
import { DsPropsTableComponent, ComponentProp } from '../../../components/ds-props-table/ds-props-table.component';
import { DsGuidelinesComponent } from '../../../components/ds-guidelines/ds-guidelines.component';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  status: string;
  quantity?: number;
}

@Component({
  selector: 'app-ds-tables',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule, TagModule,
    ToolbarModule, IconFieldModule, InputIconModule, ToastModule, ConfirmDialogModule,
    SelectModule, InputNumberModule, TooltipModule, MenuModule, MultiSelectModule,
    SliderModule, DrawerModule, CheckboxModule,
    DsPreviewComponent, DsCodeBlockComponent, DsCodeTabsComponent, DsPropsTableComponent, DsGuidelinesComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './tables.component.html',
  styleUrl: './tables.component.scss'
})
export class TablesComponent {
  // Interactive products with signals
  products = signal<Product[]>([
    { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 1299.99, status: 'In Stock', quantity: 15 },
    { id: 2, name: 'Wireless Mouse', category: 'Electronics', price: 49.99, status: 'In Stock', quantity: 50 },
    { id: 3, name: 'Office Chair', category: 'Furniture', price: 299.99, status: 'Low Stock', quantity: 5 },
    { id: 4, name: 'Desk Lamp', category: 'Home', price: 79.99, status: 'In Stock', quantity: 30 },
    { id: 5, name: 'Notebook Set', category: 'Office', price: 24.99, status: 'Out of Stock', quantity: 0 },
    { id: 6, name: 'USB Hub', category: 'Electronics', price: 35.99, status: 'In Stock', quantity: 25 },
    { id: 7, name: 'Monitor Stand', category: 'Furniture', price: 89.99, status: 'Low Stock', quantity: 3 }
  ]);

  selectedProducts = signal<Product[]>([]);
  searchValue = signal('');
  editingProduct = signal<Product | null>(null);

  // Categories for dropdown
  categories = [
    { label: 'Electronics', value: 'Electronics' },
    { label: 'Furniture', value: 'Furniture' },
    { label: 'Home', value: 'Home' },
    { label: 'Office', value: 'Office' }
  ];

  statuses = [
    { label: 'In Stock', value: 'In Stock' },
    { label: 'Low Stock', value: 'Low Stock' },
    { label: 'Out of Stock', value: 'Out of Stock' }
  ];

  // Computed filtered products
  filteredProducts = computed(() => {
    const search = this.searchValue().toLowerCase();
    if (!search) return this.products();
    return this.products().filter(p =>
      p.name.toLowerCase().includes(search) ||
      p.category.toLowerCase().includes(search)
    );
  });

  // Stats computed
  totalProducts = computed(() => this.products().length);
  totalValue = computed(() => this.products().reduce((sum, p) => sum + (p.price * (p.quantity || 0)), 0));
  lowStockCount = computed(() => this.products().filter(p => p.status === 'Low Stock' || p.status === 'Out of Stock').length);

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  getSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
    switch (status) {
      case 'In Stock': return 'success';
      case 'Low Stock': return 'warn';
      case 'Out of Stock': return 'danger';
      default: return undefined;
    }
  }

  // CRUD Operations
  addProduct(): void {
    const newId = Math.max(...this.products().map(p => p.id)) + 1;
    const newProduct: Product = {
      id: newId,
      name: `New Product ${newId}`,
      category: 'Electronics',
      price: 99.99,
      status: 'In Stock',
      quantity: 10
    };
    this.products.update(products => [...products, newProduct]);
    this.messageService.add({
      severity: 'success',
      summary: 'Product Added',
      detail: `${newProduct.name} has been added`
    });
  }

  editProduct(product: Product): void {
    this.editingProduct.set({ ...product });
    this.messageService.add({
      severity: 'info',
      summary: 'Editing Mode',
      detail: `Editing ${product.name}`
    });
  }

  saveProduct(product: Product): void {
    this.products.update(products =>
      products.map(p => p.id === product.id ? { ...product } : p)
    );
    this.editingProduct.set(null);
    this.messageService.add({
      severity: 'success',
      summary: 'Product Updated',
      detail: `${product.name} has been saved`
    });
  }

  cancelEdit(): void {
    this.editingProduct.set(null);
  }

  deleteProduct(product: Product): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${product.name}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.products.update(products => products.filter(p => p.id !== product.id));
        this.messageService.add({
          severity: 'warn',
          summary: 'Product Deleted',
          detail: `${product.name} has been removed`
        });
      }
    });
  }

  deleteSelected(): void {
    const count = this.selectedProducts().length;
    if (count === 0) {
      this.messageService.add({
        severity: 'info',
        summary: 'No Selection',
        detail: 'Please select products to delete'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${count} product(s)?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        const selectedIds = this.selectedProducts().map(p => p.id);
        this.products.update(products => products.filter(p => !selectedIds.includes(p.id)));
        this.selectedProducts.set([]);
        this.messageService.add({
          severity: 'warn',
          summary: 'Products Deleted',
          detail: `${count} products have been removed`
        });
      }
    });
  }

  exportData(): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Export Started',
      detail: 'Exporting data to CSV...'
    });
  }

  refreshData(): void {
    // Simulate refresh
    this.messageService.add({
      severity: 'info',
      summary: 'Data Refreshed',
      detail: 'Table data has been refreshed'
    });
  }

  // Selection helpers
  onSelectionChange(selection: Product[]): void {
    this.selectedProducts.set(selection);
  }

  basicCode = `<p-table [value]="products">
  <ng-template pTemplate="header">
    <tr>
      <th>Name</th>
      <th>Category</th>
      <th>Price</th>
    </tr>
  </ng-template>
  <ng-template pTemplate="body" let-product>
    <tr>
      <td>{{ product.name }}</td>
      <td>{{ product.category }}</td>
      <td>{{ product.price | currency }}</td>
    </tr>
  </ng-template>
</p-table>`;

  sortableCode = `<p-table [value]="products">
  <ng-template pTemplate="header">
    <tr>
      <th pSortableColumn="name">Name <p-sortIcon field="name" /></th>
      <th pSortableColumn="price">Price <p-sortIcon field="price" /></th>
    </tr>
  </ng-template>
  ...
</p-table>`;

  // ============================================
  // PATRON DE TOOLBAR PARA LISTADOS
  // ============================================
  // ORDEN OBLIGATORIO:
  //   START (izquierda):
  //     1. Acciones masivas (si hay seleccion) - severity="success" outlined
  //     2. Input de busqueda
  //   END (derecha):
  //     - Boton primario para crear (sin severity)
  // ============================================
  toolbarCode = `<!-- PATRON: Toolbar de Listado -->
<p-toolbar>
  <ng-template pTemplate="start">
    <div class="flex align-items-center gap-3">
      <!-- 1. Acciones masivas (aparece cuando hay seleccion) -->
      @if (selectedItems().length > 0) {
        <p-button
          label="Acciones masivas"
          icon="pi pi-check-square"
          [badge]="selectedItems().length.toString()"
          badgeSeverity="contrast"
          severity="success"
          [outlined]="true"
          styleClass="btn-acciones-masivas"
          (onClick)="openBulkActions()" />
      }
      <!-- 2. Input de busqueda -->
      <p-iconfield>
        <p-inputicon styleClass="pi pi-search" />
        <input type="text" pInputText
               placeholder="Buscar..."
               aria-label="Buscar registros"
               style="width: 280px"
               #dtFilter
               (input)="dt.filterGlobal(dtFilter.value, 'contains')" />
      </p-iconfield>
    </div>
  </ng-template>
  <ng-template pTemplate="end">
    <!-- Boton primario para crear (sin severity = primary por defecto) -->
    <p-button label="Crear Nuevo" icon="pi pi-plus" (onClick)="openNewDialog()"></p-button>
  </ng-template>
</p-toolbar>`;

  interactiveCode = `// Interactive table with signals
products = signal<Product[]>([...]);
selectedProducts = signal<Product[]>([]);
searchValue = signal('');

// Computed filtered products
filteredProducts = computed(() => {
  const search = this.searchValue().toLowerCase();
  if (!search) return this.products();
  return this.products().filter(p =>
    p.name.toLowerCase().includes(search)
  );
});

// CRUD operations
addProduct(): void {
  const newProduct: Product = { ... };
  this.products.update(products => [...products, newProduct]);
}

deleteProduct(product: Product): void {
  this.products.update(products =>
    products.filter(p => p.id !== product.id)
  );
}`;

  // ============================================
  // GUIDELINES
  // ============================================
  guidelinesDos = [
    'TOOLBAR: Orden en START: 1) Acciones masivas, 2) Buscador',
    'TOOLBAR: Acciones masivas con severity="success" y [outlined]="true"',
    'TOOLBAR: Acciones masivas con icon="pi pi-check-square"',
    'TOOLBAR: Boton de crear en END (derecha) sin severity (= primario)',
    'TOOLBAR: Buscador con width: 280px y aria-label',
    'Usar footer de tabla para totales y agregados',
    'Proveer filtros de columna para datasets grandes',
    'Filas clickeables deben usar hover con var(--highlight-bg)'
  ];

  guidelinesDonts = [
    'NO colocar el buscador ANTES de acciones masivas',
    'NO colocar acciones masivas a la derecha del toolbar',
    'NO usar severity en boton de crear (debe ser primario por defecto)',
    'NO usar severity="secondary" en acciones masivas (usar "success")',
    'No poner summary cards arriba de la tabla (usar footer)',
    'No usar colores de hover muy oscuros (problemas en dark mode)'
  ];

  // ============================================
  // DRAWER SIGNALS
  // ============================================
  showBulkActionsDrawer = signal(false);
  showColumnConfigDrawer = signal(false);
  bulkSelectedProducts = signal<Product[]>([]);

  // ============================================
  // COLUMN CONFIG
  // ============================================
  private readonly defaultColumnConfigs = [
    { field: 'name', header: 'Name', visible: true, sortable: true },
    { field: 'category', header: 'Category', visible: true, sortable: true },
    { field: 'price', header: 'Price', visible: true, sortable: true },
    { field: 'quantity', header: 'Quantity', visible: true, sortable: false },
    { field: 'status', header: 'Status', visible: true, sortable: true }
  ];

  columnConfigs = signal([...this.defaultColumnConfigs.map(c => ({ ...c }))]);
  columnSearchValue = signal('');
  draggingColumnField = signal<string | null>(null);

  visibleColumns = computed(() => this.columnConfigs().filter(c => c.visible));

  filteredColumnConfigs = computed(() => {
    const search = this.columnSearchValue().toLowerCase();
    if (!search) return this.columnConfigs();
    return this.columnConfigs().filter(c =>
      c.header.toLowerCase().includes(search) ||
      c.field.toLowerCase().includes(search)
    );
  });

  toggleColumnVisibility(field: string): void {
    this.columnConfigs.update(cols =>
      cols.map(c => c.field === field ? { ...c, visible: !c.visible } : c)
    );
  }

  getColumnIndex(field: string): number {
    return this.columnConfigs().findIndex(c => c.field === field);
  }

  resetColumnConfig(): void {
    this.columnConfigs.set([...this.defaultColumnConfigs.map(c => ({ ...c }))]);
    this.columnSearchValue.set('');
    this.messageService.add({
      severity: 'info',
      summary: 'Columns Reset',
      detail: 'Column configuration restored to default'
    });
  }

  onColumnDragStart(event: DragEvent, field: string): void {
    this.draggingColumnField.set(field);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', field);
    }
  }

  onColumnDragOver(event: DragEvent, field: string): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onColumnDrop(event: DragEvent, targetField: string): void {
    event.preventDefault();
    const sourceField = this.draggingColumnField();
    if (!sourceField || sourceField === targetField) return;

    this.columnConfigs.update(cols => {
      const newCols = [...cols];
      const sourceIndex = newCols.findIndex(c => c.field === sourceField);
      const targetIndex = newCols.findIndex(c => c.field === targetField);

      if (sourceIndex !== -1 && targetIndex !== -1) {
        const [removed] = newCols.splice(sourceIndex, 1);
        newCols.splice(targetIndex, 0, removed);
      }

      return newCols;
    });

    this.messageService.add({
      severity: 'info',
      summary: 'Column Moved',
      detail: 'Column order updated'
    });
  }

  onColumnDragEnd(): void {
    this.draggingColumnField.set(null);
  }

  onColumnReorder(event: any): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Columns Reordered',
      detail: 'Column order updated'
    });
  }

  // ============================================
  // ROW ACTIONS MENU
  // ============================================
  getRowMenuItems(product: Product): MenuItem[] {
    return [
      { label: 'Ver detalle', icon: 'pi pi-eye', command: () => this.viewDetail(product) },
      { label: 'Editar', icon: 'pi pi-pencil', command: () => this.editProduct(product) },
      { separator: true },
      { label: 'Eliminar', icon: 'pi pi-trash', styleClass: 'text-red-500', command: () => this.deleteProduct(product) }
    ];
  }

  viewDetail(product: Product): void {
    this.messageService.add({
      severity: 'info',
      summary: 'View Detail',
      detail: `Viewing ${product.name}`
    });
  }

  // ============================================
  // BULK ACTIONS
  // ============================================
  bulkActionFields = signal([
    { field: 'category', header: 'Category', active: false, value: '' },
    { field: 'status', header: 'Status', active: false, value: '' },
    { field: 'price', header: 'Price', active: false, value: 0 }
  ]);

  toggleBulkField(field: string): void {
    this.bulkActionFields.update(fields =>
      fields.map(f => f.field === field ? { ...f, active: !f.active } : f)
    );
  }

  applyBulkActions(): void {
    const count = this.bulkSelectedProducts().length;
    this.messageService.add({
      severity: 'success',
      summary: 'Bulk Update',
      detail: `Applied changes to ${count} items`
    });
    this.showBulkActionsDrawer.set(false);
    this.bulkSelectedProducts.set([]);
  }

  // ============================================
  // FILTER DEMO
  // ============================================
  priceRange = signal<[number, number]>([0, 1500]);

  onPriceRangeChange(range: [number, number], filterCallback: Function): void {
    this.priceRange.set(range);
    filterCallback(range);
  }

  // ============================================
  // COMPUTED FOR FOOTER
  // ============================================
  inStockCount = computed(() => this.products().filter(p => p.status === 'In Stock').length);
  totalQuantity = computed(() => this.products().reduce((sum, p) => sum + (p.quantity || 0), 0));

  // ============================================
  // CODE EXAMPLES
  // ============================================
  footerCodeTabs: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      icon: 'pi pi-code',
      code: `<p-table [value]="products">
  <ng-template pTemplate="header">
    <tr>
      <th>Name</th>
      <th>Price</th>
      <th>Qty</th>
      <th>Status</th>
    </tr>
  </ng-template>
  <ng-template pTemplate="body" let-product>
    <tr>
      <td>{{ product.name }}</td>
      <td>{{ product.price | currency }}</td>
      <td>{{ product.quantity }}</td>
      <td><p-tag [value]="product.status" /></td>
    </tr>
  </ng-template>
  <ng-template pTemplate="footer">
    <tr class="font-semibold surface-100">
      <td>Totales</td>
      <td>{{ totalValue() | currency }}</td>
      <td>{{ totalQuantity() }}</td>
      <td>
        <p-tag [value]="lowStockCount().toString()" severity="warn" />
      </td>
    </tr>
  </ng-template>
</p-table>`
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      icon: 'pi pi-file',
      code: `// Computed values for footer
totalValue = computed(() =>
  this.products().reduce((sum, p) => sum + p.price * p.quantity, 0)
);

totalQuantity = computed(() =>
  this.products().reduce((sum, p) => sum + p.quantity, 0)
);

lowStockCount = computed(() =>
  this.products().filter(p => p.status === 'Low Stock').length
);`
    }
  ];

  rowActionsCodeTabs: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      icon: 'pi pi-code',
      code: `<td class="text-center">
  <p-menu #rowMenu [model]="getRowMenuItems(product)" [popup]="true" appendTo="body" />
  <p-button
    icon="pi pi-ellipsis-v"
    [text]="true"
    size="small"
    (onClick)="rowMenu.toggle($event)" />
</td>`
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      icon: 'pi pi-file',
      code: `getRowMenuItems(product: Product): MenuItem[] {
  return [
    { label: 'Ver detalle', icon: 'pi pi-eye', command: () => this.viewDetail(product) },
    { label: 'Editar', icon: 'pi pi-pencil', command: () => this.editProduct(product) },
    { separator: true },
    { label: 'Eliminar', icon: 'pi pi-trash', styleClass: 'text-red-500' }
  ];
}`
    }
  ];

  bulkActionsCodeTabs: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      icon: 'pi pi-code',
      code: `<!-- Toolbar with bulk actions button -->
@if (selectedProducts().length > 0) {
  <p-button
    label="Acciones masivas"
    icon="pi pi-check-square"
    [badge]="selectedProducts().length.toString()"
    badgeSeverity="contrast"
    severity="success"
    [outlined]="true"
    (onClick)="showBulkActionsDrawer.set(true)" />
}

<!-- Drawer -->
<p-drawer
  [(visible)]="showBulkActionsDrawer"
  position="right"
  [style]="{ width: '420px' }"
  header="Acciones Masivas">
  <div class="acciones-masivas-content">
    <!-- Field toggles and inputs -->
  </div>
  <ng-template pTemplate="footer">
    <p-button label="Cancelar" (onClick)="showBulkActionsDrawer.set(false)" />
    <p-button label="Aplicar" icon="pi pi-check" (onClick)="applyBulkActions()" />
  </ng-template>
</p-drawer>`
    }
  ];

  dragDropCodeTabs: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      icon: 'pi pi-code',
      code: `<p-table
  [value]="products"
  [reorderableColumns]="true"
  (onColReorder)="onColumnReorder($event)"
  styleClass="p-datatable-reorderable">
  <ng-template pTemplate="header">
    <tr>
      @for (col of visibleColumns(); track col.field) {
        <th pReorderableColumn>
          <div class="column-header">
            <span class="drag-handle-grip"></span>
            <span>{{ col.header }}</span>
          </div>
        </th>
      }
    </tr>
  </ng-template>
</p-table>`
    },
    {
      label: 'SCSS',
      language: 'scss',
      icon: 'pi pi-palette',
      code: `.column-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  .drag-handle-grip {
    width: 10px;
    height: 14px;
    cursor: grab;
    opacity: 0;
    transition: opacity 0.15s ease;
    background-image: radial-gradient(circle, #9ca3af 1.5px, transparent 1.5px);
    background-size: 5px 4px;

    &:hover { opacity: 1; }
  }
}

th:hover .drag-handle-grip { opacity: 0.7; }`
    }
  ];

  columnConfigCodeTabs: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      icon: 'pi pi-code',
      code: `<p-drawer
  [(visible)]="showColumnConfigDrawer"
  position="right"
  [style]="{ width: '380px' }"
  header="Configure Columns">
  <div class="columnas-drawer-content">
    <!-- Search -->
    <p-iconField class="mb-3">
      <p-inputIcon styleClass="pi pi-search" />
      <input
        pInputText
        placeholder="Search columns..."
        class="w-full"
        [ngModel]="columnSearchValue()"
        (ngModelChange)="columnSearchValue.set($event)" />
    </p-iconField>

    <!-- Column list with drag & drop -->
    <div class="columnas-list">
      @for (col of filteredColumnConfigs(); track col.field) {
        <div
          class="columna-item"
          [class.dragging]="draggingColumnField() === col.field"
          draggable="true"
          (dragstart)="onColumnDragStart($event, col.field)"
          (dragover)="onColumnDragOver($event, col.field)"
          (drop)="onColumnDrop($event, col.field)"
          (dragend)="onColumnDragEnd()">
          <i class="pi pi-bars drag-handle-config"></i>
          <span class="columna-orden-badge">{{ getColumnIndex(col.field) + 1 }}</span>
          <p-checkbox [ngModel]="col.visible" (ngModelChange)="toggleColumnVisibility(col.field)" [binary]="true" />
          <label class="ml-2 flex-1">{{ col.header }}</label>
          <i [class]="col.visible ? 'pi pi-eye text-primary' : 'pi pi-eye-slash text-color-secondary'"></i>
        </div>
      }
    </div>
  </div>
  <ng-template pTemplate="footer">
    <p-button label="Reset" icon="pi pi-refresh" [text]="true" (onClick)="resetColumnConfig()" />
    <p-button label="Done" icon="pi pi-check" (onClick)="showColumnConfigDrawer.set(false)" />
  </ng-template>
</p-drawer>`
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      icon: 'pi pi-file',
      code: `// Column configuration with signals
private readonly defaultColumnConfigs = [
  { field: 'name', header: 'Name', visible: true, sortable: true },
  { field: 'category', header: 'Category', visible: true, sortable: true },
  // ...more columns
];

columnConfigs = signal([...this.defaultColumnConfigs.map(c => ({ ...c }))]);
columnSearchValue = signal('');
draggingColumnField = signal<string | null>(null);

filteredColumnConfigs = computed(() => {
  const search = this.columnSearchValue().toLowerCase();
  if (!search) return this.columnConfigs();
  return this.columnConfigs().filter(c =>
    c.header.toLowerCase().includes(search)
  );
});

// Drag & Drop handlers
onColumnDragStart(event: DragEvent, field: string): void {
  this.draggingColumnField.set(field);
  event.dataTransfer?.setData('text/plain', field);
}

onColumnDrop(event: DragEvent, targetField: string): void {
  event.preventDefault();
  const sourceField = this.draggingColumnField();
  if (!sourceField || sourceField === targetField) return;

  this.columnConfigs.update(cols => {
    const newCols = [...cols];
    const sourceIndex = newCols.findIndex(c => c.field === sourceField);
    const targetIndex = newCols.findIndex(c => c.field === targetField);
    const [removed] = newCols.splice(sourceIndex, 1);
    newCols.splice(targetIndex, 0, removed);
    return newCols;
  });
}

resetColumnConfig(): void {
  this.columnConfigs.set([...this.defaultColumnConfigs.map(c => ({ ...c }))]);
  this.columnSearchValue.set('');
}`
    }
  ];

  filterCodeTabs: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      icon: 'pi pi-code',
      code: `<!-- Filter row in header -->
<tr>
  <th>
    <p-columnFilter type="text" field="name" [showMenu]="false">
      <ng-template pTemplate="filter" let-value let-filter="filterCallback">
        <input pInputText [ngModel]="value" (ngModelChange)="filter($event)" placeholder="Buscar..." />
      </ng-template>
    </p-columnFilter>
  </th>
  <th>
    <p-columnFilter field="category" matchMode="in" [showMenu]="false">
      <ng-template pTemplate="filter" let-value let-filter="filterCallback">
        <p-multiSelect
          [ngModel]="value"
          (ngModelChange)="filter($event)"
          [options]="categories"
          placeholder="Todos"
          appendTo="body" />
      </ng-template>
    </p-columnFilter>
  </th>
</tr>`
    }
  ];

  // ============================================
  // PROPS TABLES
  // ============================================
  tableFooterProps: ComponentProp[] = [
    { name: 'pTemplate="footer"', type: 'ng-template', description: 'Template para el footer de la tabla' },
    { name: 'surface-100', type: 'class', description: 'Fondo gris claro para distinguir el footer' },
    { name: 'font-semibold', type: 'class', description: 'Texto en negrita para totales' }
  ];

  filterProps: ComponentProp[] = [
    { name: 'p-columnFilter', type: 'component', description: 'Componente de filtro en header' },
    { name: 'field', type: 'string', description: 'Campo a filtrar', required: true },
    { name: 'matchMode', type: "'contains' | 'in' | 'equals'", default: "'contains'", description: 'Modo de coincidencia' },
    { name: '[showMenu]', type: 'boolean', default: 'true', description: 'Mostrar menú popup' }
  ];

  rowActionsProps: ComponentProp[] = [
    { name: 'p-menu', type: 'component', description: 'Menú contextual de PrimeNG' },
    { name: '[model]', type: 'MenuItem[]', description: 'Items del menú', required: true },
    { name: '[popup]', type: 'boolean', default: 'false', description: 'Modo popup' },
    { name: 'appendTo', type: "'body'", description: 'Donde renderizar el popup' }
  ];

  bulkActionsProps: ComponentProp[] = [
    { name: '[(selection)]', type: 'any[]', description: 'Two-way binding para items seleccionados', required: true },
    { name: 'dataKey', type: 'string', description: 'Campo identificador único', required: true },
    { name: '[badge]', type: 'string', description: 'Contador de seleccionados en el botón' }
  ];

  dragDropProps: ComponentProp[] = [
    { name: '[reorderableColumns]', type: 'boolean', default: 'false', description: 'Habilitar drag & drop de columnas' },
    { name: '(onColReorder)', type: 'EventEmitter', description: 'Callback cuando se reordenan columnas' },
    { name: 'pReorderableColumn', type: 'directive', description: 'Directiva en th para reordenamiento' }
  ];

  columnConfigProps: ComponentProp[] = [
    { name: 'p-drawer', type: 'component', description: 'Panel lateral deslizable' },
    { name: 'position', type: "'left' | 'right'", default: "'left'", description: 'Posición del drawer' },
    { name: '[(visible)]', type: 'boolean', description: 'Two-way binding para visibilidad' },
    { name: 'columnSearchValue', type: 'Signal<string>', description: 'Signal para filtrar columnas por búsqueda' },
    { name: 'filteredColumnConfigs', type: 'Signal<ColumnConfig[]>', description: 'Computed que filtra columnas según búsqueda' },
    { name: 'draggable="true"', type: 'attribute', description: 'Habilita drag & drop en items de columna' },
    { name: 'resetColumnConfig()', type: 'method', description: 'Restaura configuración de columnas al estado inicial' }
  ];
}
