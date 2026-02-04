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
    DsPreviewComponent, DsCodeBlockComponent, DsPropsTableComponent
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

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
