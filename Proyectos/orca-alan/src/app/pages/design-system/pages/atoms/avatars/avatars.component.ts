import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { BadgeModule } from 'primeng/badge';
import { DsPreviewComponent } from '../../../components/ds-preview/ds-preview.component';
import { DsCodeBlockComponent } from '../../../components/ds-code-block/ds-code-block.component';
import { DsPropsTableComponent, ComponentProp } from '../../../components/ds-props-table/ds-props-table.component';
import { DsGuidelinesComponent } from '../../../components/ds-guidelines/ds-guidelines.component';
import { DsCodeTabsComponent, CodeTab } from '../../../components/ds-code-tabs/ds-code-tabs.component';

@Component({
  selector: 'app-ds-avatars',
  standalone: true,
  imports: [
    CommonModule,
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

  avatarCode = `<!-- With label (initials) -->
<p-avatar label="JD" />

<!-- With icon -->
<p-avatar icon="pi pi-user" />

<!-- With image -->
<p-avatar image="avatar.jpg" />`;

  avatarGroupCode = `<p-avatar-group>
  <p-avatar image="user1.jpg" shape="circle" />
  <p-avatar image="user2.jpg" shape="circle" />
  <p-avatar image="user3.jpg" shape="circle" />
  <p-avatar label="+3" shape="circle" />
</p-avatar-group>`;

  codeTabs: CodeTab[] = [
    {
      label: 'Avatar',
      language: 'html',
      icon: 'pi pi-user',
      code: `<!-- Label (initials) -->
<p-avatar label="JD" />
<p-avatar label="AB" size="large" />
<p-avatar label="XY" size="xlarge" />

<!-- Icon -->
<p-avatar icon="pi pi-user" />

<!-- Image -->
<p-avatar image="path/to/image.jpg" />

<!-- Shapes -->
<p-avatar label="SQ" shape="square" />
<p-avatar label="CI" shape="circle" />

<!-- With badge -->
<p-avatar label="JD" pBadge value="4" severity="danger" />`
    },
    {
      label: 'AvatarGroup',
      language: 'html',
      icon: 'pi pi-users',
      code: `<p-avatar-group>
  <p-avatar image="user1.jpg" shape="circle" />
  <p-avatar image="user2.jpg" shape="circle" />
  <p-avatar image="user3.jpg" shape="circle" />
  <p-avatar label="+5" shape="circle"
    [style]="{'background-color': 'var(--surface-border)', 'color': 'var(--text-color)'}" />
</p-avatar-group>`
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      icon: 'pi pi-file',
      code: `import { Component } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { BadgeModule } from 'primeng/badge';

@Component({
  imports: [AvatarModule, AvatarGroupModule, BadgeModule],
  template: \`
    <p-avatar label="JD" size="large" shape="circle" />
    <p-avatar-group>
      <p-avatar *ngFor="let user of users" [image]="user.avatar" shape="circle" />
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
}
