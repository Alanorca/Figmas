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
import { MessageService, ConfirmationService } from 'primeng/api';
import { DsPreviewComponent } from '../../../components/ds-preview/ds-preview.component';
import { DsCodeBlockComponent } from '../../../components/ds-code-block/ds-code-block.component';

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
    SelectModule, InputNumberModule, TooltipModule,
    DsPreviewComponent, DsCodeBlockComponent
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

  toolbarCode = `<p-toolbar>
  <ng-template pTemplate="left">
    <p-button label="New" icon="pi pi-plus" />
    <p-button label="Delete" icon="pi pi-trash" severity="danger" [outlined]="true" />
  </ng-template>
  <ng-template pTemplate="right">
    <p-iconField>
      <p-inputIcon styleClass="pi pi-search" />
      <input pInputText placeholder="Search..." />
    </p-iconField>
  </ng-template>
</p-toolbar>
<p-table [value]="products">
  ...
</p-table>`;

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
}
