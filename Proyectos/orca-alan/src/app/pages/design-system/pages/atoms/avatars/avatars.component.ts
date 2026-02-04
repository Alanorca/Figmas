import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { BadgeModule } from 'primeng/badge';
import { DsPreviewComponent } from '../../../components/ds-preview/ds-preview.component';
import { DsCodeBlockComponent } from '../../../components/ds-code-block/ds-code-block.component';
import { DsPropsTableComponent, ComponentProp } from '../../../components/ds-props-table/ds-props-table.component';
import { DsGuidelinesComponent } from '../../../components/ds-guidelines/ds-guidelines.component';
import { DsCodeTabsComponent, CodeTab } from '../../../components/ds-code-tabs/ds-code-tabs.component';

// ============ Interfaces ============
interface TeamMember {
  name: string;
  role: string;
  avatar: string;
  isOnline: boolean;
  lastActive: string;
}

@Component({
  selector: 'app-ds-avatars',
  standalone: true,
  imports: [
    CommonModule,
    AccordionModule,
    TagModule,
    AvatarModule,
    AvatarGroupModule,
    BadgeModule,
    DsPreviewComponent,
    DsCodeBlockComponent,
    DsPropsTableComponent,
    DsGuidelinesComponent,
    DsCodeTabsComponent
  ],
  templateUrl: './avatars.component.html',
  styleUrl: './avatars.component.scss'
})
export class AvatarsComponent {
  // ============ Accordion State ============
  activeAccordion = signal<string | string[]>('0');

  // ============ Guidelines ============
  guidelinesDos = [
    'Usar iniciales cuando no hay imagen disponible',
    'Mantener tamaños consistentes en el mismo contexto',
    'Usar AvatarGroup para mostrar múltiples usuarios',
    'Agregar badge para notificaciones o estado online'
  ];

  guidelinesDonts = [
    'No usar imágenes de baja resolución',
    'No mezclar estilos (circle/square) en el mismo grupo',
    'No mostrar más de 5 avatares en un grupo sin overflow'
  ];

  // ============ Team Members Data (for AvatarsWithLinks) ============
  teamMembers = signal<TeamMember[]>([
    {
      name: 'Robert Fox',
      role: 'UI/UX Designer',
      avatar: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/stackedlist/robert.png',
      isOnline: true,
      lastActive: ''
    },
    {
      name: 'Theresa Webb',
      role: 'Scrum Master',
      avatar: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/stackedlist/theresa.png',
      isOnline: true,
      lastActive: ''
    },
    {
      name: 'Arlene McCoy',
      role: 'Software Development Manager',
      avatar: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/stackedlist/arlene.png',
      isOnline: false,
      lastActive: '2 hours ago'
    },
    {
      name: 'Jacob Jones',
      role: 'Software Developer',
      avatar: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/stackedlist/jacob.png',
      isOnline: false,
      lastActive: '7 hours ago'
    },
    {
      name: 'Jane Cooper',
      role: 'Team Leader',
      avatar: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/stackedlist/jane.png',
      isOnline: false,
      lastActive: '1 day ago'
    }
  ]);

  // ============ Properties Tables ============
  avatarProps: ComponentProp[] = [
    { name: 'label', type: 'string', description: 'Text label (initials)' },
    { name: 'icon', type: 'string', description: 'Icon class' },
    { name: 'image', type: 'string', description: 'Image URL' },
    { name: 'size', type: '"normal" | "large" | "xlarge"', default: '"normal"', description: 'Avatar size' },
    { name: 'shape', type: '"square" | "circle"', default: '"square"', description: 'Avatar shape' },
    { name: 'style', type: 'object', description: 'Inline styles' }
  ];

  avatarGroupProps: ComponentProp[] = [
    { name: 'styleClass', type: 'string', description: 'CSS class' }
  ];

  teamMemberProps: ComponentProp[] = [
    { name: 'name', type: 'string', required: true, description: 'Member name' },
    { name: 'role', type: 'string', required: true, description: 'Member role/position' },
    { name: 'avatar', type: 'string', required: true, description: 'Avatar image URL' },
    { name: 'isOnline', type: 'boolean', default: 'false', description: 'Online status indicator' },
    { name: 'lastActive', type: 'string', description: 'Last activity timestamp (shown when offline)' }
  ];

  // ============ Code Tabs for Each Section ============

  // Avatar Types
  avatarTypesCodeTabs: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      icon: 'pi pi-code',
      code: `<!-- Label (initials) -->
<p-avatar label="JD" />
<p-avatar label="AB" [style]="{'background-color': 'var(--primary-color)', 'color': 'var(--primary-contrast-color)'}" />

<!-- Icon -->
<p-avatar icon="pi pi-user" />
<p-avatar icon="pi pi-users" [style]="{'background-color': 'var(--purple-500)', 'color': 'var(--primary-contrast-color)'}" />`
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      icon: 'pi pi-file',
      code: `import { Component } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';

@Component({
  imports: [AvatarModule],
  template: \`
    <p-avatar label="JD" />
    <p-avatar icon="pi pi-user" />
  \`
})
export class MyComponent {}`
    }
  ];

  // Sizes & Shapes
  sizesShapesCodeTabs: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      icon: 'pi pi-code',
      code: `<!-- Sizes -->
<p-avatar label="SM" />
<p-avatar label="MD" size="large" />
<p-avatar label="LG" size="xlarge" />

<!-- Shapes -->
<p-avatar label="SQ" shape="square" size="large" />
<p-avatar label="CI" shape="circle" size="large" />`
    }
  ];

  // With Badge
  withBadgeCodeTabs: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      icon: 'pi pi-code',
      code: `<!-- Avatar with notification badge -->
<p-avatar label="JD" size="large" shape="circle" pBadge value="4" severity="danger" />

<!-- Avatar with success badge -->
<p-avatar icon="pi pi-user" size="large" shape="circle" pBadge value="2" severity="success" />

<!-- Avatar with warning badge -->
<p-avatar label="AB" size="large" shape="circle" pBadge value="!" severity="warn" />`
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      icon: 'pi pi-file',
      code: `import { Component } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';

@Component({
  imports: [AvatarModule, BadgeModule],
  template: \`
    <p-avatar label="JD" size="large" shape="circle" pBadge value="4" severity="danger" />
  \`
})
export class MyComponent {}`
    }
  ];

  // Avatar Group
  avatarGroupCodeTabs: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      icon: 'pi pi-code',
      code: `<!-- Basic Group -->
<p-avatar-group>
  <p-avatar label="JD" shape="circle" [style]="{'background-color': 'var(--blue-500)', 'color': 'var(--primary-contrast-color)'}" />
  <p-avatar label="AB" shape="circle" [style]="{'background-color': 'var(--green-500)', 'color': 'var(--primary-contrast-color)'}" />
  <p-avatar label="XY" shape="circle" [style]="{'background-color': 'var(--purple-500)', 'color': 'var(--primary-contrast-color)'}" />
</p-avatar-group>

<!-- With Overflow Counter -->
<p-avatar-group>
  <p-avatar label="A" shape="circle" />
  <p-avatar label="B" shape="circle" />
  <p-avatar label="+5" shape="circle" [style]="{'background-color': 'var(--surface-300)', 'color': 'var(--text-color)'}" />
</p-avatar-group>`
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      icon: 'pi pi-file',
      code: `import { Component } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';

@Component({
  imports: [AvatarModule, AvatarGroupModule],
  template: \`
    <p-avatar-group>
      <p-avatar *ngFor="let user of users" [image]="user.avatar" shape="circle" />
      <p-avatar label="+3" shape="circle" />
    </p-avatar-group>
  \`
})
export class MyComponent {
  users = [
    { name: 'John', avatar: 'john.jpg' },
    { name: 'Jane', avatar: 'jane.jpg' }
  ];
}`
    }
  ];

  // Avatars with Links (Team Members)
  avatarsWithLinksCodeTabs: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      icon: 'pi pi-code',
      code: `<div class="team-members-card">
  <div class="card-title">Team Members</div>

  <div class="members-list">
    @for (member of teamMembers(); track member.name) {
      <div class="member-row">
        <div class="member-info">
          <img [src]="member.avatar" class="member-avatar" />
          <div class="member-details">
            <div class="member-name">{{ member.name }}</div>
            <div class="member-role">{{ member.role }}</div>
          </div>
        </div>
        <div class="member-status">
          <div class="status-label">Last Active</div>
          @if (member.isOnline) {
            <div class="online-indicator">
              <span class="online-dot"></span>
              <span class="online-text">Online</span>
            </div>
          } @else {
            <div class="last-active">{{ member.lastActive }}</div>
          }
        </div>
      </div>
    }
  </div>
</div>`
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      icon: 'pi pi-file',
      code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TeamMember {
  name: string;
  role: string;
  avatar: string;
  isOnline: boolean;
  lastActive: string;
}

@Component({
  selector: 'avatars-with-links',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avatars-with-links.component.html',
  styleUrl: './avatars-with-links.component.scss'
})
export class AvatarsWithLinksComponent {
  teamMembers = signal<TeamMember[]>([
    {
      name: 'Robert Fox',
      role: 'UI/UX Designer',
      avatar: 'https://example.com/robert.png',
      isOnline: true,
      lastActive: ''
    },
    {
      name: 'Theresa Webb',
      role: 'Scrum Master',
      avatar: 'https://example.com/theresa.png',
      isOnline: true,
      lastActive: ''
    },
    {
      name: 'Arlene McCoy',
      role: 'Software Development Manager',
      avatar: 'https://example.com/arlene.png',
      isOnline: false,
      lastActive: '2 hours ago'
    }
  ]);
}`
    },
    {
      label: 'SCSS',
      language: 'scss',
      icon: 'pi pi-palette',
      code: `.team-members-card {
  background: var(--surface-card);
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: var(--shadow-sm);
}

.card-title {
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 1.5rem;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.member-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.member-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
}

.member-name {
  font-weight: 500;
  color: var(--text-color);
}

.member-role {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}

.member-status {
  text-align: right;
}

.status-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-color);
}

.online-indicator {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.online-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--primary-color);
}

.online-text {
  font-size: 0.875rem;
  color: var(--primary-color);
}

.last-active {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}`
    }
  ];
}
