import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { AccordionModule } from 'primeng/accordion';
import { MessageService } from 'primeng/api';
import { DsPreviewComponent } from '../../../components/ds-preview/ds-preview.component';
import { DsCodeBlockComponent } from '../../../components/ds-code-block/ds-code-block.component';
import { DsPropsTableComponent, ComponentProp } from '../../../components/ds-props-table/ds-props-table.component';
import { KpiCardComponent, KpiCardConfig } from '../../../../../shared/components/data-board/kpi-card/kpi-card';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  inCart: boolean;
  favorite: boolean;
}

interface UserCard {
  id: number;
  name: string;
  role: string;
  avatar: string;
  isFollowing: boolean;
  followers: number;
  projects: number;
  rating: number;
}

@Component({
  selector: 'app-ds-cards',
  standalone: true,
  imports: [
    CommonModule, CardModule, ButtonModule, AvatarModule, TagModule,
    BadgeModule, ToastModule, TooltipModule, AccordionModule,
    DsPreviewComponent, DsCodeBlockComponent, DsPropsTableComponent,
    KpiCardComponent
  ],
  providers: [MessageService],
  templateUrl: './cards.component.html',
  styleUrl: './cards.component.scss'
})
export class CardsComponent {
  // Interactive product cards
  products = signal<Product[]>([
    { id: 1, name: 'Wireless Headphones', price: 99.99, originalPrice: 149.99, image: 'pi pi-headphones', rating: 4.5, reviews: 128, inCart: false, favorite: false },
    { id: 2, name: 'Smart Watch Pro', price: 299.99, image: 'pi pi-clock', rating: 4.8, reviews: 256, inCart: false, favorite: true },
    { id: 3, name: 'Portable Speaker', price: 79.99, originalPrice: 99.99, image: 'pi pi-volume-up', rating: 4.2, reviews: 89, inCart: false, favorite: false }
  ]);

  cartCount = computed(() => this.products().filter(p => p.inCart).length);
  cartTotal = computed(() => this.products().filter(p => p.inCart).reduce((sum, p) => sum + p.price, 0));

  // Interactive stat cards
  stats = signal({
    users: 1234,
    revenue: 45600,
    orders: 89,
    growth: 12.5
  });

  // Interactive user cards
  users = signal<UserCard[]>([
    { id: 1, name: 'Sarah Johnson', role: 'UI/UX Designer', avatar: 'SJ', isFollowing: false, followers: 1243, projects: 28, rating: 98 },
    { id: 2, name: 'Mike Chen', role: 'Full Stack Dev', avatar: 'MC', isFollowing: true, followers: 2156, projects: 42, rating: 96 },
    { id: 3, name: 'Emily Davis', role: 'Product Manager', avatar: 'ED', isFollowing: false, followers: 891, projects: 15, rating: 94 }
  ]);

  cardProps: ComponentProp[] = [
    { name: 'header', type: 'string', description: 'Card header text' },
    { name: 'subheader', type: 'string', description: 'Card subheader text' },
    { name: 'styleClass', type: 'string', description: 'Style class for customization' }
  ];

  // ============ KPI Cards ============
  kpiCards = signal<KpiCardConfig[]>([
    { id: '1', title: 'Cumplimiento', value: 87.5, unit: '%', target: 100, percentChange: 5.2, trend: 'up', icon: 'pi pi-check-circle', color: 'success' },
    { id: '2', title: 'Riesgos Activos', value: 23, target: 50, percentChange: -12, trend: 'down', icon: 'pi pi-exclamation-triangle', color: 'warning' },
    { id: '3', title: 'Incidentes', value: 8, previousValue: 15, percentChange: -46.7, trend: 'down', icon: 'pi pi-bolt', color: 'danger' },
    { id: '4', title: 'Procesos', value: 156, unit: '', percentChange: 3.1, trend: 'up', icon: 'pi pi-sitemap', color: 'info' }
  ]);

  selectedKpiVariant = signal<'default' | 'compact' | 'minimal' | 'hero'>('default');

  kpiCardProps: ComponentProp[] = [
    { name: 'config', type: 'KpiCardConfig', required: true, description: 'Configuracion del KPI (id, title, value, unit, target, etc.)' },
    { name: 'variant', type: "'default' | 'compact' | 'minimal' | 'hero'", description: 'Variante visual del card' },
    { name: 'clickable', type: 'boolean', description: 'Si el card es clickeable (muestra indicador drill-down)' },
    { name: 'selected', type: 'boolean', description: 'Estado de seleccion' },
    { name: 'showTrend', type: 'boolean', description: 'Mostrar indicador de tendencia' },
    { name: 'showDecisionLevel', type: 'boolean', description: 'Mostrar badge de nivel de decision' }
  ];

  // ============ Widget KPI Cards (Dashboard) ============
  widgetKpiColors = ['cyan', 'orange', 'emerald', 'violet', 'rose', 'amber'];

  // ============ Chart Area ============
  chartAreaDemo = signal({
    title: 'Tendencia de Cumplimiento',
    subtitle: 'Ultimos 12 meses',
    value: '87.5%',
    trend: '+5.2%'
  });

  constructor(private messageService: MessageService) {}

  // Product card actions
  toggleCart(product: Product): void {
    this.products.update(products =>
      products.map(p => p.id === product.id ? { ...p, inCart: !p.inCart } : p)
    );

    const updated = this.products().find(p => p.id === product.id);
    this.messageService.add({
      severity: updated?.inCart ? 'success' : 'info',
      summary: updated?.inCart ? 'Added to Cart' : 'Removed from Cart',
      detail: `${product.name} ${updated?.inCart ? 'added to' : 'removed from'} your cart`
    });
  }

  toggleFavorite(product: Product): void {
    this.products.update(products =>
      products.map(p => p.id === product.id ? { ...p, favorite: !p.favorite } : p)
    );

    const updated = this.products().find(p => p.id === product.id);
    this.messageService.add({
      severity: 'info',
      summary: updated?.favorite ? 'Added to Wishlist' : 'Removed from Wishlist',
      detail: `${product.name} ${updated?.favorite ? 'saved' : 'removed'}`
    });
  }

  // Stat card actions
  refreshStats(): void {
    this.stats.update(s => ({
      users: s.users + Math.floor(Math.random() * 50),
      revenue: s.revenue + Math.floor(Math.random() * 1000),
      orders: s.orders + Math.floor(Math.random() * 10),
      growth: +(s.growth + (Math.random() * 2 - 0.5)).toFixed(1)
    }));

    this.messageService.add({
      severity: 'success',
      summary: 'Stats Updated',
      detail: 'Dashboard statistics refreshed'
    });
  }

  // User card actions
  toggleFollow(user: UserCard): void {
    this.users.update(users =>
      users.map(u => u.id === user.id ? {
        ...u,
        isFollowing: !u.isFollowing,
        followers: u.isFollowing ? u.followers - 1 : u.followers + 1
      } : u)
    );

    const updated = this.users().find(u => u.id === user.id);
    this.messageService.add({
      severity: updated?.isFollowing ? 'success' : 'info',
      summary: updated?.isFollowing ? 'Following' : 'Unfollowed',
      detail: `You ${updated?.isFollowing ? 'are now following' : 'unfollowed'} ${user.name}`
    });
  }

  viewProfile(user: UserCard): void {
    this.messageService.add({
      severity: 'info',
      summary: 'View Profile',
      detail: `Opening ${user.name}'s profile`
    });
  }

  basicCode = `<p-card header="Card Title">
  <p>Card content goes here.</p>
</p-card>`;

  headerCode = `<p-card header="Title" subheader="Subtitle">
  <ng-template pTemplate="header">
    <img src="image.jpg" alt="Header" />
  </ng-template>
  <p>Card content with header image.</p>
</p-card>`;

  footerCode = `<p-card header="Card Title">
  <p>Card content</p>
  <ng-template pTemplate="footer">
    <p-button label="Save" icon="pi pi-check" />
    <p-button label="Cancel" severity="secondary" [text]="true" />
  </ng-template>
</p-card>`;

  interactiveCode = `// Product card with signals
products = signal<Product[]>([...]);
cartCount = computed(() => this.products().filter(p => p.inCart).length);

toggleCart(product: Product): void {
  this.products.update(products =>
    products.map(p => p.id === product.id
      ? { ...p, inCart: !p.inCart }
      : p
    )
  );
}

// Template
<p-card styleClass="product-card">
  <ng-template pTemplate="header">
    <div class="product-image">
      <i [class]="product.image"></i>
      @if (product.originalPrice) {
        <p-tag value="Sale" severity="danger" class="sale-badge" />
      }
      <p-button
        [icon]="product.favorite ? 'pi pi-heart-fill' : 'pi pi-heart'"
        [severity]="product.favorite ? 'danger' : 'secondary'"
        [rounded]="true" [text]="true"
        (onClick)="toggleFavorite(product)"
        class="favorite-btn"
      />
    </div>
  </ng-template>
  <div class="product-info">
    <h4>{{ product.name }}</h4>
    <div class="product-price">
      <span class="current-price">\${{ product.price }}</span>
      @if (product.originalPrice) {
        <span class="original-price">\${{ product.originalPrice }}</span>
      }
    </div>
  </div>
  <ng-template pTemplate="footer">
    <p-button
      [label]="product.inCart ? 'Remove from Cart' : 'Add to Cart'"
      [icon]="product.inCart ? 'pi pi-check' : 'pi pi-shopping-cart'"
      (onClick)="toggleCart(product)"
      [severity]="product.inCart ? 'success' : 'primary'"
    />
  </ng-template>
</p-card>`;

  // ============ KPI Card Code Examples ============
  kpiCardCode = `<!-- Usando el componente app-kpi-card -->
<app-kpi-card
  [config]="{
    id: '1',
    title: 'Cumplimiento',
    value: 87.5,
    unit: '%',
    target: 100,
    percentChange: 5.2,
    trend: 'up',
    icon: 'pi pi-check-circle',
    color: 'success'
  }"
  variant="default"
  [clickable]="true"
  [showTrend]="true"
  (cardClick)="onKpiClick($event)"
/>

<!-- Variantes disponibles -->
<app-kpi-card [config]="kpi" variant="compact" />
<app-kpi-card [config]="kpi" variant="minimal" />
<app-kpi-card [config]="kpi" variant="hero" />`;

  widgetKpiCardCode = `<!-- Widget KPI Card para Dashboards -->
<div class="widget-kpi-card" [ngClass]="'kpi-' + color">
  <div class="kpi-header">
    <div class="kpi-icon">
      <i class="pi pi-chart-line"></i>
    </div>
    <div class="kpi-trend" [class.positive]="trend > 0">
      <i class="pi" [class.pi-arrow-up]="trend > 0" [class.pi-arrow-down]="trend < 0"></i>
      <span>{{ trend }}%</span>
    </div>
  </div>

  <div class="kpi-body">
    <span class="kpi-value">{{ value }}</span>
    <span class="kpi-title">{{ title }}</span>
  </div>

  <div class="kpi-footer">
    <span class="kpi-comparison">vs periodo anterior</span>
  </div>
</div>

<!-- Colores disponibles: cyan, orange, emerald, violet, rose, amber -->`;

  chartAreaCode = `<!-- Chart Area - Contenedor para graficas -->
<div class="chart-area">
  <div class="chart-header">
    <div class="chart-title">
      <h4>{{ title }}</h4>
      <span class="chart-subtitle">{{ subtitle }}</span>
    </div>
    <div class="chart-actions">
      <p-button icon="pi pi-download" [rounded]="true" [text]="true" />
      <p-button icon="pi pi-expand" [rounded]="true" [text]="true" />
    </div>
  </div>

  <div class="chart-body">
    <!-- Aqui va el componente de grafica (amCharts, Chart.js, etc.) -->
    <app-amcharts-line [data]="chartData" />
  </div>

  <div class="chart-footer">
    <div class="chart-legend">
      <span class="legend-item"><span class="dot success"></span> Actual</span>
      <span class="legend-item"><span class="dot warning"></span> Objetivo</span>
    </div>
  </div>
</div>`;

  onKpiCardClick(config: KpiCardConfig): void {
    this.messageService.add({
      severity: 'info',
      summary: 'KPI Clicked',
      detail: `${config.title}: ${config.value}${config.unit || ''}`
    });
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
