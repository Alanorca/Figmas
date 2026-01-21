import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ChipModule } from 'primeng/chip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DsPreviewComponent } from '../../../components/ds-preview/ds-preview.component';
import { DsCodeBlockComponent } from '../../../components/ds-code-block/ds-code-block.component';

interface SearchResult {
  title: string;
  description: string;
  type: 'page' | 'document' | 'user';
  icon: string;
}

@Component({
  selector: 'app-ds-search-box',
  standalone: true,
  imports: [
    CommonModule, FormsModule, InputTextModule, ButtonModule,
    IconFieldModule, InputIconModule, AutoCompleteModule, ChipModule,
    ToastModule, DsPreviewComponent, DsCodeBlockComponent
  ],
  providers: [MessageService],
  templateUrl: './search-box.component.html',
  styleUrl: './search-box.component.scss'
})
export class SearchBoxComponent {
  // Interactive state with signals
  searchValue = signal('');
  isSearching = signal(false);
  searchHistory = signal<string[]>(['Angular', 'PrimeNG', 'Dashboard']);
  searchResults = signal<SearchResult[]>([]);
  activeFilter = signal<string>('all');

  autoCompleteValue = '';
  suggestions: string[] = [];

  allItems = ['Angular', 'React', 'Vue', 'Svelte', 'PrimeNG', 'Material', 'Bootstrap', 'Tailwind'];

  mockResults: SearchResult[] = [
    { title: 'Dashboard Overview', description: 'Main dashboard with analytics and metrics', type: 'page', icon: 'pi pi-chart-bar' },
    { title: 'User Management', description: 'Manage users, roles, and permissions', type: 'page', icon: 'pi pi-users' },
    { title: 'Project Documentation', description: 'Technical documentation and guides', type: 'document', icon: 'pi pi-file' },
    { title: 'API Reference', description: 'REST API endpoints documentation', type: 'document', icon: 'pi pi-book' },
    { title: 'John Smith', description: 'john.smith@example.com', type: 'user', icon: 'pi pi-user' },
    { title: 'Jane Doe', description: 'jane.doe@example.com', type: 'user', icon: 'pi pi-user' },
    { title: 'Settings Page', description: 'Application settings and configuration', type: 'page', icon: 'pi pi-cog' },
    { title: 'Reports', description: 'Generate and export reports', type: 'document', icon: 'pi pi-file-pdf' }
  ];

  filters = [
    { label: 'All', value: 'all', icon: 'pi pi-th-large' },
    { label: 'Pages', value: 'page', icon: 'pi pi-file' },
    { label: 'Documents', value: 'document', icon: 'pi pi-book' },
    { label: 'Users', value: 'user', icon: 'pi pi-user' }
  ];

  // Computed
  filteredResults = computed(() => {
    const results = this.searchResults();
    const filter = this.activeFilter();
    if (filter === 'all') return results;
    return results.filter(r => r.type === filter);
  });

  resultCount = computed(() => this.filteredResults().length);
  hasResults = computed(() => this.searchResults().length > 0);

  constructor(private messageService: MessageService) {}

  search(event: any): void {
    const query = event.query.toLowerCase();
    this.suggestions = this.allItems.filter(item =>
      item.toLowerCase().includes(query)
    );
  }

  performSearch(): void {
    const query = this.searchValue().trim();
    if (!query) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Empty Search',
        detail: 'Please enter a search term'
      });
      return;
    }

    this.isSearching.set(true);

    // Simulate search delay
    setTimeout(() => {
      const results = this.mockResults.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      );

      this.searchResults.set(results);
      this.isSearching.set(false);

      // Add to history if not already present
      if (!this.searchHistory().includes(query)) {
        this.searchHistory.update(h => [query, ...h].slice(0, 5));
      }

      this.messageService.add({
        severity: results.length > 0 ? 'success' : 'info',
        summary: 'Search Complete',
        detail: `Found ${results.length} results for "${query}"`
      });
    }, 800);
  }

  clearSearch(): void {
    this.searchValue.set('');
    this.searchResults.set([]);
    this.activeFilter.set('all');
  }

  useHistoryItem(item: string): void {
    this.searchValue.set(item);
    this.performSearch();
  }

  removeHistoryItem(item: string): void {
    this.searchHistory.update(h => h.filter(i => i !== item));
    this.messageService.add({
      severity: 'info',
      summary: 'History Cleared',
      detail: `"${item}" removed from search history`
    });
  }

  clearHistory(): void {
    this.searchHistory.set([]);
    this.messageService.add({
      severity: 'info',
      summary: 'History Cleared',
      detail: 'Search history has been cleared'
    });
  }

  setFilter(filter: string): void {
    this.activeFilter.set(filter);
  }

  selectResult(result: SearchResult): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Result Selected',
      detail: `Opening: ${result.title}`
    });
  }

  basicCode = `<p-iconField>
  <p-inputIcon styleClass="pi pi-search" />
  <input pInputText placeholder="Search..." [(ngModel)]="searchValue" />
</p-iconField>`;

  buttonCode = `<div class="search-box">
  <input pInputText placeholder="Search..." [(ngModel)]="searchValue" />
  <p-button icon="pi pi-search" (onClick)="performSearch()" />
</div>`;

  autoCompleteCode = `<p-autoComplete
  [(ngModel)]="value"
  [suggestions]="suggestions"
  (completeMethod)="search($event)"
  placeholder="Search..."
/>`;

  interactiveCode = `// Component with signals
searchValue = signal('');
isSearching = signal(false);
searchResults = signal<SearchResult[]>([]);

performSearch(): void {
  const query = this.searchValue().trim();
  if (!query) return;

  this.isSearching.set(true);

  // Simulate API call
  setTimeout(() => {
    const results = this.mockResults.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase())
    );
    this.searchResults.set(results);
    this.isSearching.set(false);
  }, 800);
}

// Template
<p-iconField>
  <p-inputIcon [styleClass]="isSearching() ? 'pi pi-spin pi-spinner' : 'pi pi-search'" />
  <input
    pInputText
    placeholder="Search..."
    [ngModel]="searchValue()"
    (ngModelChange)="searchValue.set($event)"
    (keyup.enter)="performSearch()"
  />
</p-iconField>`;
}
