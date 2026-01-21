import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DsPreviewComponent } from '../../../components/ds-preview/ds-preview.component';
import { DsCodeBlockComponent } from '../../../components/ds-code-block/ds-code-block.component';
import { DsPropsTableComponent, ComponentProp } from '../../../components/ds-props-table/ds-props-table.component';

type StatusType = 'pending' | 'approved' | 'rejected' | 'review';

interface StatusConfig {
  label: string;
  severity: 'warn' | 'success' | 'danger' | 'info';
  icon: string;
}

@Component({
  selector: 'app-ds-badges',
  standalone: true,
  imports: [
    CommonModule, BadgeModule, TagModule, ButtonModule, ToastModule,
    DsPreviewComponent, DsCodeBlockComponent, DsPropsTableComponent
  ],
  providers: [MessageService],
  templateUrl: './badges.component.html',
  styleUrl: './badges.component.scss'
})
export class BadgesComponent {
  // Interactive state with signals
  notificationCount = signal(3);
  messageCount = signal(5);
  cartCount = signal(2);
  currentStatus = signal<StatusType>('pending');

  statusConfigs: Record<StatusType, StatusConfig> = {
    pending: { label: 'Pending', severity: 'warn', icon: 'pi pi-clock' },
    approved: { label: 'Approved', severity: 'success', icon: 'pi pi-check' },
    rejected: { label: 'Rejected', severity: 'danger', icon: 'pi pi-times' },
    review: { label: 'In Review', severity: 'info', icon: 'pi pi-eye' }
  };

  statusOptions: StatusType[] = ['pending', 'approved', 'rejected', 'review'];

  currentStatusConfig = computed(() => this.statusConfigs[this.currentStatus()]);

  badgeProps: ComponentProp[] = [
    { name: 'value', type: 'string | number', description: 'Value to display inside the badge' },
    { name: 'severity', type: 'string', description: 'Severity level: "success", "info", "warn", "danger", "secondary", "contrast"' },
    { name: 'size', type: '"large" | "xlarge"', description: 'Badge size' }
  ];

  tagProps: ComponentProp[] = [
    { name: 'value', type: 'string', description: 'Value to display inside the tag' },
    { name: 'severity', type: 'string', description: 'Severity level: "success", "info", "warn", "danger", "secondary", "contrast"' },
    { name: 'icon', type: 'string', description: 'Icon to display' },
    { name: 'rounded', type: 'boolean', default: 'false', description: 'Rounded corners' }
  ];

  badgeCode = `<p-badge value="2" />
<p-badge value="8" severity="success" />
<p-badge value="4" severity="info" />
<p-badge value="12" severity="warn" />
<p-badge value="3" severity="danger" />`;

  tagCode = `<p-tag value="New" />
<p-tag value="Approved" severity="success" />
<p-tag value="Pending" severity="warn" />
<p-tag value="Rejected" severity="danger" />`;

  buttonBadgeCode = `<p-button label="Emails" badge="8" />
<p-button label="Messages" icon="pi pi-envelope" badge="3" badgeSeverity="danger" />`;

  interactiveCode = `// Component with signals
notificationCount = signal(3);
messageCount = signal(5);

addNotification(): void {
  this.notificationCount.update(n => n + 1);
}

clearNotifications(): void {
  this.notificationCount.set(0);
}

// Template
<p-button
  icon="pi pi-bell"
  [badge]="notificationCount().toString()"
  badgeSeverity="danger"
  (onClick)="clearNotifications()"
/>`;

  constructor(private messageService: MessageService) {}

  addNotification(): void {
    this.notificationCount.update(n => n + 1);
    this.messageService.add({
      severity: 'info',
      summary: 'New Notification',
      detail: `You now have ${this.notificationCount()} notifications`
    });
  }

  clearNotifications(): void {
    const count = this.notificationCount();
    if (count > 0) {
      this.notificationCount.set(0);
      this.messageService.add({
        severity: 'success',
        summary: 'Cleared',
        detail: `${count} notifications cleared`
      });
    }
  }

  addMessage(): void {
    this.messageCount.update(n => n + 1);
  }

  readMessage(): void {
    if (this.messageCount() > 0) {
      this.messageCount.update(n => n - 1);
      this.messageService.add({
        severity: 'info',
        summary: 'Message Read',
        detail: `${this.messageCount()} messages remaining`
      });
    }
  }

  addToCart(): void {
    this.cartCount.update(n => n + 1);
    this.messageService.add({
      severity: 'success',
      summary: 'Added to Cart',
      detail: `${this.cartCount()} items in cart`
    });
  }

  cycleStatus(): void {
    const currentIndex = this.statusOptions.indexOf(this.currentStatus());
    const nextIndex = (currentIndex + 1) % this.statusOptions.length;
    this.currentStatus.set(this.statusOptions[nextIndex]);

    const config = this.statusConfigs[this.currentStatus()];
    this.messageService.add({
      severity: config.severity,
      summary: 'Status Changed',
      detail: `Status is now: ${config.label}`
    });
  }

  setStatus(status: StatusType): void {
    this.currentStatus.set(status);
    const config = this.statusConfigs[status];
    this.messageService.add({
      severity: config.severity,
      summary: 'Status Updated',
      detail: `Status set to: ${config.label}`
    });
  }
}
