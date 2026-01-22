import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DsPreviewComponent } from '../../../components/ds-preview/ds-preview.component';
import { DsCodeBlockComponent } from '../../../components/ds-code-block/ds-code-block.component';
import { DsCodeTabsComponent, CodeTab } from '../../../components/ds-code-tabs/ds-code-tabs.component';
import { DsGuidelinesComponent } from '../../../components/ds-guidelines/ds-guidelines.component';
import { DsUsageListComponent, UsageItem } from '../../../components/ds-usage-list/ds-usage-list.component';
import { DsPropsTableComponent, ComponentProp } from '../../../components/ds-props-table/ds-props-table.component';

@Component({
  selector: 'app-documentation-guide',
  standalone: true,
  imports: [
    CommonModule,
    DsPreviewComponent,
    DsCodeBlockComponent,
    DsCodeTabsComponent,
    DsGuidelinesComponent,
    DsUsageListComponent,
    DsPropsTableComponent
  ],
  templateUrl: './documentation-guide.component.html',
  styleUrl: './documentation-guide.component.scss'
})
export class DocumentationGuideComponent {
  // Guidelines for creating DS pages
  guidelinesDos = [
    'Usar CSS variables de _design-tokens.scss',
    'Usar paleta zinc para dark mode (grises puros)',
    'Documentar props con ds-props-table',
    'Incluir ejemplos de código con ds-code-tabs',
    'Mostrar componentes que lo usan con ds-usage-list'
  ];

  guidelinesDonts = [
    'No usar colores hardcodeados (#hex)',
    'No usar paleta slate para dark mode (tiene tinte azul)',
    'No olvidar form-field tokens para inputs',
    'No crear estilos que no respeten el tema',
    'No duplicar lógica - usar componentes compartidos'
  ];

  // Available DS components
  dsComponents: UsageItem[] = [
    { title: 'ds-preview', path: '#ds-preview', icon: 'pi pi-eye', description: 'Contenedor para demos de componentes' },
    { title: 'ds-code-block', path: '#ds-code-block', icon: 'pi pi-code', description: 'Bloque de código con syntax highlighting' },
    { title: 'ds-code-tabs', path: '#ds-code-tabs', icon: 'pi pi-folder', description: 'Tabs para HTML, TS, SCSS' },
    { title: 'ds-guidelines', path: '#ds-guidelines', icon: 'pi pi-check-circle', description: 'Do\'s y Don\'ts compactos' },
    { title: 'ds-usage-list', path: '#ds-usage-list', icon: 'pi pi-list', description: 'Lista de componentes/páginas que lo usan' },
    { title: 'ds-props-table', path: '#ds-props-table', icon: 'pi pi-table', description: 'Tabla de propiedades del componente' }
  ];

  // Props for ds-preview
  previewProps: ComponentProp[] = [
    { name: 'title', type: 'string', description: 'Título del preview' },
    { name: 'description', type: 'string', description: 'Descripción opcional' }
  ];

  // Critical CSS tokens
  tokenCategories = [
    {
      name: 'Surface (Fondos)',
      tokens: [
        { name: '--surface-ground', light: '#f8fafc', dark: '#09090b', usage: 'Fondo de página' },
        { name: '--surface-card', light: '#ffffff', dark: '#18181b', usage: 'Fondo de cards' },
        { name: '--surface-border', light: '#e2e8f0', dark: '#27272a', usage: 'Bordes' },
        { name: '--surface-hover', light: '#f1f5f9', dark: '#27272a', usage: 'Estado hover' }
      ]
    },
    {
      name: 'Text (Texto)',
      tokens: [
        { name: '--text-color', light: '#1e293b', dark: '#fafafa', usage: 'Texto principal' },
        { name: '--text-color-secondary', light: '#64748b', dark: '#a1a1aa', usage: 'Texto secundario' }
      ]
    },
    {
      name: 'Form Fields (Inputs)',
      tokens: [
        { name: '--form-field-background', light: '#ffffff', dark: '#18181b', usage: 'Fondo de inputs' },
        { name: '--form-field-border-color', light: '#cbd5e1', dark: '#3f3f46', usage: 'Borde de inputs' },
        { name: '--form-field-color', light: '#1e293b', dark: '#fafafa', usage: 'Texto en inputs' },
        { name: '--form-field-placeholder-color', light: '#94a3b8', dark: '#71717a', usage: 'Placeholder' }
      ]
    },
    {
      name: 'Primary (Accent)',
      tokens: [
        { name: '--primary-color', light: '#10b981', dark: '#34d399', usage: 'Color primario (emerald)' },
        { name: '--primary-50', light: '#ecfdf5', dark: '#064e3b', usage: 'Fondo sutil primario' }
      ]
    }
  ];

  // Code examples
  structureCode = `// Estructura recomendada de un componente DS
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button'; // PrimeNG components
import { DsPreviewComponent } from '../../../components/ds-preview/ds-preview.component';
import { DsCodeBlockComponent } from '../../../components/ds-code-block/ds-code-block.component';
import { DsCodeTabsComponent, CodeTab } from '../../../components/ds-code-tabs/ds-code-tabs.component';
import { DsGuidelinesComponent } from '../../../components/ds-guidelines/ds-guidelines.component';
import { DsUsageListComponent, UsageItem } from '../../../components/ds-usage-list/ds-usage-list.component';
import { DsPropsTableComponent, ComponentProp } from '../../../components/ds-props-table/ds-props-table.component';

@Component({
  selector: 'app-ds-my-component',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    DsPreviewComponent,
    DsCodeBlockComponent,
    DsCodeTabsComponent,
    DsGuidelinesComponent,
    DsUsageListComponent,
    DsPropsTableComponent
  ],
  templateUrl: './my-component.component.html',
  styleUrl: './my-component.component.scss'
})
export class MyComponentComponent {
  // Interactive state with signals
  isLoading = signal(false);

  // Guidelines
  guidelinesDos = ['Usar para X', 'Combinar con Y'];
  guidelinesDonts = ['No usar para Z'];

  // Usage items
  usageItems: UsageItem[] = [
    { title: 'Page A', path: '/page-a', icon: 'pi pi-file', description: 'Usa este componente' }
  ];

  // Props table
  componentProps: ComponentProp[] = [
    { name: 'label', type: 'string', description: 'Texto del componente' }
  ];

  // Code tabs
  codeTabs: CodeTab[] = [
    { label: 'HTML', language: 'html', icon: 'pi pi-code', code: '<p-button label="Click" />' },
    { label: 'TypeScript', language: 'typescript', icon: 'pi pi-file', code: '// TS code' },
    { label: 'SCSS', language: 'scss', icon: 'pi pi-palette', code: '// SCSS code' }
  ];
}`;

  htmlTemplateCode = `<!-- Estructura HTML recomendada -->
<div class="my-component-page">
  <!-- Header -->
  <header class="page-header">
    <h1>Nombre del Componente</h1>
    <p class="subtitle">
      Descripción breve del componente y su uso.
      <strong>Click para interactuar!</strong>
    </p>
  </header>

  <!-- Guidelines (arriba, compactas) -->
  <app-ds-guidelines
    [dos]="guidelinesDos"
    [donts]="guidelinesDonts"
    [compact]="true"
  />

  <!-- Demo Interactivo -->
  <section class="section highlight-section">
    <h2><i class="pi pi-bolt"></i> Demo Interactivo</h2>
    <p class="section-description">Descripción del demo.</p>

    <app-ds-preview title="Try It!">
      <!-- Contenido del demo aquí -->
      <p-button label="Example" />
    </app-ds-preview>

    <app-ds-code-block [code]="demoCode" language="typescript" />
  </section>

  <!-- Variantes -->
  <section class="section">
    <h2>Variantes</h2>
    <app-ds-preview title="Variants">
      <!-- Variantes del componente -->
    </app-ds-preview>
    <app-ds-code-block [code]="variantsCode" language="html" />
  </section>

  <!-- Properties -->
  <section class="section">
    <h2>Properties</h2>
    <app-ds-props-table [props]="componentProps" />
  </section>

  <!-- Usage -->
  <section class="section">
    <app-ds-usage-list
      title="Componentes que lo usan"
      [items]="usageItems"
      type="components"
    />
  </section>

  <!-- Code -->
  <section class="section">
    <h2>Código</h2>
    <app-ds-code-tabs [tabs]="codeTabs" />
  </section>
</div>`;

  scssTemplateCode = `// Estructura SCSS recomendada
// IMPORTANTE: Usar SOLO CSS variables de _design-tokens.scss

.my-component-page {
  max-width: 1000px;
}

.page-header {
  margin-bottom: 2rem;

  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-color); // ✅ Variable
    margin-bottom: 0.5rem;
  }

  .subtitle {
    font-size: 1rem;
    color: var(--text-color-secondary); // ✅ Variable

    strong {
      color: var(--primary-color); // ✅ Variable
    }
  }
}

.section {
  margin-bottom: 3rem;

  h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: 0.5rem;

    i {
      margin-right: 0.5rem;
      color: var(--primary-color);
    }
  }

  .section-description {
    font-size: 0.875rem;
    color: var(--text-color-secondary);
    margin-bottom: 1.5rem;
  }
}

.highlight-section {
  background: var(--primary-50); // ✅ Variable
  border: 1px solid var(--primary-200);
  border-radius: var(--border-radius);
  padding: 1.5rem;
}

// ❌ NUNCA hacer esto:
// .bad-example {
//   background: #1e293b;  // Hardcoded!
//   color: #60a5fa;       // Hardcoded!
// }

// ✅ Siempre usar variables:
// .good-example {
//   background: var(--surface-card);
//   color: var(--primary-color);
// }`;

  darkModeCode = `// ============================================
// DARK MODE - Paleta ZINC (grises puros)
// ============================================
// IMPORTANTE: Usar zinc, NO slate (slate tiene tinte azul)

// En ds-preview.component.scss se definen los temas:

&.light-mode {
  background: #ffffff;

  // Surface tokens (slate-based for light)
  --surface-ground: #f8fafc;    // slate-50
  --surface-card: #ffffff;
  --surface-border: #e2e8f0;    // slate-200

  // Form fields
  --form-field-background: #ffffff;
  --form-field-border-color: #cbd5e1;
  --form-field-color: #1e293b;
}

&.dark-mode {
  background: #18181b;           // zinc-900 (NO slate!)

  // Surface tokens (zinc-based - grises puros)
  --surface-ground: #09090b;     // zinc-950
  --surface-card: #18181b;       // zinc-900
  --surface-border: #27272a;     // zinc-800

  // Form fields
  --form-field-background: #18181b;
  --form-field-border-color: #3f3f46;  // zinc-700
  --form-field-color: #fafafa;
}

// Para forzar que PrimeNG use las variables locales:
::ng-deep {
  .p-inputtext,
  input[pInputText] {
    background: var(--form-field-background) !important;
    border-color: var(--form-field-border-color) !important;
    color: var(--form-field-color) !important;
  }
}`;

  codeTabs: CodeTab[] = [
    {
      label: 'Component.ts',
      language: 'typescript',
      icon: 'pi pi-file',
      code: this.structureCode
    },
    {
      label: 'Template.html',
      language: 'html',
      icon: 'pi pi-code',
      code: this.htmlTemplateCode
    },
    {
      label: 'Styles.scss',
      language: 'scss',
      icon: 'pi pi-palette',
      code: this.scssTemplateCode
    },
    {
      label: 'Dark Mode',
      language: 'scss',
      icon: 'pi pi-moon',
      code: this.darkModeCode
    }
  ];

  // Checklist items
  checklist = [
    { done: true, text: 'Importar componentes DS compartidos' },
    { done: true, text: 'Definir guidelinesDos y guidelinesDonts' },
    { done: true, text: 'Crear usageItems para mostrar dónde se usa' },
    { done: true, text: 'Documentar props con ComponentProp[]' },
    { done: true, text: 'Incluir codeTabs con ejemplos' },
    { done: true, text: 'Usar SOLO CSS variables (no hardcoded)' },
    { done: true, text: 'Verificar light Y dark mode con toggle global' }
  ];

  // Quick Reference code examples
  importCode = `import { DsPreviewComponent } from '../../../components/ds-preview/ds-preview.component';
import { DsCodeTabsComponent, CodeTab } from '../../../components/ds-code-tabs/ds-code-tabs.component';
import { DsGuidelinesComponent } from '../../../components/ds-guidelines/ds-guidelines.component';
import { DsUsageListComponent, UsageItem } from '../../../components/ds-usage-list/ds-usage-list.component';
import { DsPropsTableComponent, ComponentProp } from '../../../components/ds-props-table/ds-props-table.component';`;

  previewCode = `<app-ds-preview title="Demo">
  <!-- Tu demo aquí -->
</app-ds-preview>`;

  guidelinesCode = `<app-ds-guidelines
  [dos]="guidelinesDos"
  [donts]="guidelinesDonts"
  [compact]="true"
/>`;

  cssVariablesCode = `.my-element {
  background: var(--surface-card);      // OK
  color: var(--text-color);             // OK
  border: 1px solid var(--surface-border); // OK
  // background: #1e293b;               // NO!
}`;

  dsPreviewUsageCode = `<app-ds-preview title='Demo'>
  <!-- Contenido aquí -->
</app-ds-preview>`;

  // Quick Reference Tabs
  quickRefTabs: CodeTab[] = [
    {
      label: 'Imports',
      language: 'typescript',
      icon: 'pi pi-download',
      code: this.importCode
    },
    {
      label: 'Preview',
      language: 'html',
      icon: 'pi pi-eye',
      code: this.previewCode
    },
    {
      label: 'Guidelines',
      language: 'html',
      icon: 'pi pi-check-circle',
      code: this.guidelinesCode
    },
    {
      label: 'CSS Vars',
      language: 'scss',
      icon: 'pi pi-palette',
      code: this.cssVariablesCode
    }
  ];
}
