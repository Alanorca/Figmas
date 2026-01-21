import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { DsPreviewComponent } from '../../../components/ds-preview/ds-preview.component';
import { DsCodeBlockComponent } from '../../../components/ds-code-block/ds-code-block.component';

@Component({
  selector: 'app-ds-icons',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, TooltipModule, DsPreviewComponent, DsCodeBlockComponent],
  templateUrl: './icons.component.html',
  styleUrl: './icons.component.scss'
})
export class IconsComponent {
  searchTerm = signal('');
  copiedIcon = signal<string | null>(null);

  commonIcons = [
    'pi-home', 'pi-user', 'pi-users', 'pi-cog', 'pi-search',
    'pi-plus', 'pi-minus', 'pi-check', 'pi-times', 'pi-pencil',
    'pi-trash', 'pi-download', 'pi-upload', 'pi-refresh', 'pi-sync',
    'pi-save', 'pi-file', 'pi-folder', 'pi-image', 'pi-calendar',
    'pi-clock', 'pi-bell', 'pi-envelope', 'pi-phone', 'pi-map-marker',
    'pi-star', 'pi-star-fill', 'pi-heart', 'pi-heart-fill', 'pi-bookmark',
    'pi-eye', 'pi-eye-slash', 'pi-lock', 'pi-unlock', 'pi-key',
    'pi-filter', 'pi-sort', 'pi-sort-alpha-down', 'pi-sort-alpha-up', 'pi-list',
    'pi-th-large', 'pi-table', 'pi-chart-bar', 'pi-chart-line', 'pi-chart-pie'
  ];

  navigationIcons = [
    'pi-arrow-left', 'pi-arrow-right', 'pi-arrow-up', 'pi-arrow-down',
    'pi-chevron-left', 'pi-chevron-right', 'pi-chevron-up', 'pi-chevron-down',
    'pi-angle-left', 'pi-angle-right', 'pi-angle-up', 'pi-angle-down',
    'pi-angle-double-left', 'pi-angle-double-right', 'pi-angle-double-up', 'pi-angle-double-down',
    'pi-external-link', 'pi-link', 'pi-directions', 'pi-compass'
  ];

  mediaIcons = [
    'pi-play', 'pi-pause', 'pi-stop', 'pi-forward', 'pi-backward',
    'pi-volume-up', 'pi-volume-down', 'pi-volume-off', 'pi-microphone',
    'pi-camera', 'pi-video', 'pi-youtube', 'pi-vimeo'
  ];

  socialIcons = [
    'pi-facebook', 'pi-twitter', 'pi-instagram', 'pi-linkedin', 'pi-github',
    'pi-google', 'pi-apple', 'pi-microsoft', 'pi-amazon', 'pi-slack',
    'pi-discord', 'pi-whatsapp', 'pi-telegram', 'pi-reddit'
  ];

  get filteredCommonIcons(): string[] {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.commonIcons;
    return this.commonIcons.filter(icon => icon.toLowerCase().includes(term));
  }

  get filteredNavigationIcons(): string[] {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.navigationIcons;
    return this.navigationIcons.filter(icon => icon.toLowerCase().includes(term));
  }

  get filteredMediaIcons(): string[] {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.mediaIcons;
    return this.mediaIcons.filter(icon => icon.toLowerCase().includes(term));
  }

  get filteredSocialIcons(): string[] {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.socialIcons;
    return this.socialIcons.filter(icon => icon.toLowerCase().includes(term));
  }

  async copyIcon(icon: string): Promise<void> {
    const className = `pi ${icon}`;
    try {
      await navigator.clipboard.writeText(className);
      this.copiedIcon.set(icon);
      setTimeout(() => this.copiedIcon.set(null), 2000);
    } catch (err) {
      console.error('Failed to copy icon:', err);
    }
  }

  usageCode = `<!-- Basic icon -->
<i class="pi pi-home"></i>

<!-- With size -->
<i class="pi pi-home" style="font-size: 1.5rem"></i>

<!-- With color -->
<i class="pi pi-check" style="color: var(--green-500)"></i>

<!-- In button -->
<p-button icon="pi pi-save" label="Save" />`;
}
