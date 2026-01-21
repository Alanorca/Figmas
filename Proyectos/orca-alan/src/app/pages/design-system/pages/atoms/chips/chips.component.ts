import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChipModule } from 'primeng/chip';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DsPreviewComponent } from '../../../components/ds-preview/ds-preview.component';
import { DsCodeBlockComponent } from '../../../components/ds-code-block/ds-code-block.component';
import { DsPropsTableComponent, ComponentProp } from '../../../components/ds-props-table/ds-props-table.component';

interface FilterChip {
  label: string;
  icon: string;
  active: boolean;
}

interface SkillChip {
  id: number;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
}

@Component({
  selector: 'app-ds-chips',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ChipModule, ButtonModule, InputTextModule,
    ToastModule, DsPreviewComponent, DsCodeBlockComponent, DsPropsTableComponent
  ],
  providers: [MessageService],
  templateUrl: './chips.component.html',
  styleUrl: './chips.component.scss'
})
export class ChipsComponent {
  // Interactive state with signals
  filterChips = signal<FilterChip[]>([
    { label: 'All', icon: 'pi pi-th-large', active: true },
    { label: 'Active', icon: 'pi pi-check-circle', active: false },
    { label: 'Pending', icon: 'pi pi-clock', active: false },
    { label: 'Archived', icon: 'pi pi-inbox', active: false }
  ]);

  tags = signal<string[]>(['Angular', 'TypeScript', 'PrimeNG', 'SCSS']);
  newTag = signal('');

  skills = signal<SkillChip[]>([
    { id: 1, name: 'JavaScript', level: 'advanced' },
    { id: 2, name: 'Angular', level: 'advanced' },
    { id: 3, name: 'Node.js', level: 'intermediate' },
    { id: 4, name: 'Python', level: 'beginner' },
    { id: 5, name: 'Docker', level: 'intermediate' }
  ]);

  selectedCategories = signal<string[]>(['Action', 'Sci-Fi']);

  allCategories = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller', 'Documentary'];

  // Computed
  activeFilter = computed(() => this.filterChips().find(c => c.active)?.label || 'All');
  tagCount = computed(() => this.tags().length);

  chipProps: ComponentProp[] = [
    { name: 'label', type: 'string', description: 'Text to display in the chip' },
    { name: 'icon', type: 'string', description: 'Icon to display' },
    { name: 'image', type: 'string', description: 'Image URL to display' },
    { name: 'removable', type: 'boolean', default: 'false', description: 'Shows a remove icon' },
    { name: 'styleClass', type: 'string', description: 'Style class for custom styling' }
  ];

  basicCode = `<p-chip label="Action" />
<p-chip label="Comedy" />
<p-chip label="Drama" />`;

  iconCode = `<p-chip label="Apple" icon="pi pi-apple" />
<p-chip label="Google" icon="pi pi-google" />
<p-chip label="Microsoft" icon="pi pi-microsoft" />`;

  imageCode = `<p-chip label="John Doe">
  <ng-template pTemplate="content">
    <div class="chip-avatar">JD</div>
    <span>John Doe</span>
  </ng-template>
</p-chip>`;

  removableCode = `<p-chip label="Remove me" [removable]="true" (onRemove)="onRemove($event)" />`;

  interactiveCode = `// Component with signals
tags = signal<string[]>(['Angular', 'TypeScript', 'PrimeNG']);
newTag = signal('');

addTag(): void {
  const tag = this.newTag().trim();
  if (tag && !this.tags().includes(tag)) {
    this.tags.update(t => [...t, tag]);
    this.newTag.set('');
  }
}

removeTag(tag: string): void {
  this.tags.update(t => t.filter(item => item !== tag));
}

// Template
@for (tag of tags(); track tag) {
  <p-chip [label]="tag" [removable]="true" (onRemove)="removeTag(tag)" />
}`;

  constructor(private messageService: MessageService) {}

  toggleFilter(index: number): void {
    this.filterChips.update(chips =>
      chips.map((chip, i) => ({
        ...chip,
        active: i === index
      }))
    );
    const selected = this.filterChips()[index];
    this.messageService.add({
      severity: 'info',
      summary: 'Filter Changed',
      detail: `Showing: ${selected.label}`
    });
  }

  addTag(): void {
    const tag = this.newTag().trim();
    if (!tag) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Empty Tag',
        detail: 'Please enter a tag name'
      });
      return;
    }
    if (this.tags().includes(tag)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Duplicate',
        detail: `"${tag}" already exists`
      });
      return;
    }
    this.tags.update(t => [...t, tag]);
    this.newTag.set('');
    this.messageService.add({
      severity: 'success',
      summary: 'Tag Added',
      detail: `"${tag}" has been added`
    });
  }

  removeTag(tag: string): void {
    this.tags.update(t => t.filter(item => item !== tag));
    this.messageService.add({
      severity: 'info',
      summary: 'Tag Removed',
      detail: `"${tag}" has been removed`
    });
  }

  removeSkill(skill: SkillChip): void {
    this.skills.update(s => s.filter(item => item.id !== skill.id));
    this.messageService.add({
      severity: 'info',
      summary: 'Skill Removed',
      detail: `"${skill.name}" has been removed`
    });
  }

  getSkillClass(level: string): string {
    const classes: Record<string, string> = {
      beginner: 'chip-beginner',
      intermediate: 'chip-intermediate',
      advanced: 'chip-advanced'
    };
    return classes[level] || '';
  }

  toggleCategory(category: string): void {
    const current = this.selectedCategories();
    if (current.includes(category)) {
      this.selectedCategories.set(current.filter(c => c !== category));
    } else {
      this.selectedCategories.set([...current, category]);
    }
  }

  isCategorySelected(category: string): boolean {
    return this.selectedCategories().includes(category);
  }

  onChipRemove(event: any): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Chip Removed',
      detail: 'The chip has been removed'
    });
  }
}
