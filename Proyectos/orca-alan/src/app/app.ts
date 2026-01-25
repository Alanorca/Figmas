import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SidebarComponent } from './components/sidebar/sidebar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SidebarComponent, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private router = inject(Router);
  title = 'ORCA ALAN';

  isDesignSystemRoute = signal(false);

  constructor() {
    this.isDesignSystemRoute.set(this.router.url.startsWith('/design-system'));

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isDesignSystemRoute.set(event.urlAfterRedirects.startsWith('/design-system'));
      });
  }
}
