import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { MeterGroupModule } from 'primeng/metergroup';
import { DsPreviewComponent } from '../../components/ds-preview/ds-preview.component';
import { DsPropsTableComponent, ComponentProp } from '../../components/ds-props-table/ds-props-table.component';
import { DsGuidelinesComponent } from '../../components/ds-guidelines/ds-guidelines.component';
import { DsCodeTabsComponent, CodeTab } from '../../components/ds-code-tabs/ds-code-tabs.component';

// ============ Interfaces ============
interface StatCardColored {
  id: string;
  icon: string;
  timestamp: string;
  label: string;
  value: string;
  color: 'cyan' | 'orange' | 'slate' | 'violet' | 'emerald' | 'rose';
}

interface StatCardWithFootnote {
  id: string;
  icon: string;
  label: string;
  value: string;
  footnote: string;
  footnoteHighlight?: string;
  color: 'cyan' | 'orange' | 'slate' | 'violet';
}

interface StatCardWithProgress {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  progressLabel: string;
  progressValue: number;
  currentValue: string;
  description: string;
}

interface SocialProgress {
  platform: string;
  value: number;
  percentage: string;
}

interface UserProgressCard {
  id: string;
  name: string;
  role: string;
  avatar: string;
  socials: SocialProgress[];
}

interface MeterItem {
  label: string;
  value: number;
  color: string;
}

interface GoalDetail {
  label: string;
  color: string;
  current: number;
  target: number;
}

interface CryptoCard {
  id: string;
  name: string;
  symbol: string;
  amount: string;
  icon: 'bitcoin' | 'stellar' | 'ethereum' | 'ripple';
}

interface StatusBarDetail {
  label: string;
  value: string;
}

interface StatusBarCard {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  current: number;
  total: number;
  unit: string;
  filledSegments: number;
  totalSegments: number;
  details: StatusBarDetail[];
}

@Component({
  selector: 'app-ds-stats',
  standalone: true,
  imports: [
    CommonModule,
    AccordionModule,
    TagModule,
    ProgressBarModule,
    ButtonModule,
    RippleModule,
    AvatarModule,
    MeterGroupModule,
    DsPreviewComponent,
    DsPropsTableComponent,
    DsGuidelinesComponent,
    DsCodeTabsComponent
  ],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss'
})
export class StatsComponent {
  // ============ Accordion State ============
  activeAccordion = signal<string | string[]>('0');

  // ============ Colored & Centered Stats ============
  coloredCenteredStats = signal<StatCardColored[]>([
    { id: '1', icon: 'pi pi-inbox', timestamp: '11:08, 17 Aug', label: 'Messages', value: '123k', color: 'cyan' },
    { id: '2', icon: 'pi pi-bolt', timestamp: '14:15, 18 Aug', label: 'System Alerts', value: '89k', color: 'orange' },
    { id: '3', icon: 'pi pi-gift', timestamp: '09:30, 16 Aug', label: 'Promotional Offers', value: '3k', color: 'slate' },
    { id: '4', icon: 'pi pi-wave-pulse', timestamp: '16:45, 19 Aug', label: 'Traffic Distribution', value: '175k', color: 'violet' }
  ]);

  // ============ Icons & Footnotes Stats ============
  iconsFootnotesStats = signal<StatCardWithFootnote[]>([
    { id: '1', icon: 'pi pi-envelope', label: 'Messages', value: '152', footnoteHighlight: '24 new', footnote: 'since last visit', color: 'cyan' },
    { id: '2', icon: 'pi pi-map-marker', label: 'Check-ins', value: '532', footnoteHighlight: '48 new', footnote: 'since last visit', color: 'orange' },
    { id: '3', icon: 'pi pi-file', label: 'Files Synced', value: '28.441', footnote: '32,56 / 250 GB', color: 'slate' },
    { id: '4', icon: 'pi pi-users', label: 'Users Online', value: '25.660', footnoteHighlight: '72 new', footnote: 'user this week', color: 'violet' }
  ]);

  // ============ Cards with Progress Bar ============
  progressStats = signal<StatCardWithProgress[]>([
    {
      id: '1',
      image: 'pi pi-box',
      title: 'Shoes',
      subtitle: '500 per month',
      progressLabel: 'Monthly Goal',
      progressValue: 70,
      currentValue: '350 units',
      description: 'sold, with steady progress toward the monthly target.'
    },
    {
      id: '2',
      image: 'pi pi-tags',
      title: 'Hats',
      subtitle: '500 per month',
      progressLabel: 'Monthly Goal',
      progressValue: 20,
      currentValue: '50 units',
      description: 'sold, with steady progress toward the monthly target.'
    }
  ]);

  // ============ Date Picker Stats ============
  selectedDate = signal(new Date());
  months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  getDateByOffset(offset: number): { date: number; month: string; fullDate: Date } {
    const date = new Date(this.selectedDate());
    date.setDate(date.getDate() + offset);
    return {
      date: date.getDate(),
      month: this.months[date.getMonth()],
      fullDate: date
    };
  }

  selectDateByOffset(offset: number): void {
    const date = new Date(this.selectedDate());
    date.setDate(date.getDate() + offset);
    this.selectedDate.set(date);
  }

  nextDay(): void {
    const tomorrow = new Date(this.selectedDate());
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.selectedDate.set(tomorrow);
  }

  prevDay(): void {
    const yesterday = new Date(this.selectedDate());
    yesterday.setDate(yesterday.getDate() - 1);
    this.selectedDate.set(yesterday);
  }

  metrics = computed(() => {
    const seed = this.selectedDate().getDate() + this.selectedDate().getMonth() * 30;
    return {
      signups: 8000 + seed * 100,
      apiRequests: (1 + seed * 0.05).toFixed(1) + 'M',
      ticketsResolved: 3000 + seed * 50,
      subscriptionRenewals: 1500 + seed * 75
    };
  });

  chartData = computed(() => {
    const seed = this.selectedDate().getDate() + this.selectedDate().getMonth() * 30;
    return {
      signupBars: [15 + (seed % 3), 18 + (seed % 4), 12 + (seed % 5), 20 + (seed % 3), 16 + (seed % 4)],
      signupCurrentBar: 19 + (seed % 3),
      apiBars: [14 + (seed % 4), 16 + (seed % 3), 11 + (seed % 5), 18 + (seed % 4), 15 + (seed % 3)],
      apiCurrentBar: 17 + (seed % 4),
      ticketBars: [15 + (seed % 2), 15 + (seed % 3), 10 + (seed % 4), 16 + (seed % 2), 13 + (seed % 3)],
      ticketCurrentBar: 14 + (seed % 3),
      subscriptionBars: [17 + (seed % 3), 19 + (seed % 2), 14 + (seed % 4), 21 + (seed % 2), 18 + (seed % 3)],
      subscriptionCurrentBar: 20 + (seed % 2)
    };
  });

  // ============ Progress Bars Stats ============
  userProgressCards = signal<UserProgressCard[]>([
    {
      id: '1',
      name: 'Cameron Williamson',
      role: 'Marketing Coordinator',
      avatar: 'CW',
      socials: [
        { platform: 'Twitter', value: 34, percentage: '34.00%' },
        { platform: 'Facebook', value: 46, percentage: '45.86%' },
        { platform: 'Google', value: 79, percentage: '79.00%' }
      ]
    },
    {
      id: '2',
      name: 'Kathryn Murphy',
      role: 'President of Sales',
      avatar: 'KM',
      socials: [
        { platform: 'Twitter', value: 64, percentage: '64.47%' },
        { platform: 'Facebook', value: 76, percentage: '75.67%' },
        { platform: 'Google', value: 45, percentage: '45.00%' }
      ]
    },
    {
      id: '3',
      name: 'Darrell Steward',
      role: 'Web Designer',
      avatar: 'DS',
      socials: [
        { platform: 'Twitter', value: 24, percentage: '23.55%' },
        { platform: 'Facebook', value: 79, percentage: '78.65%' },
        { platform: 'Google', value: 87, percentage: '86.54%' }
      ]
    }
  ]);

  // ============ Quarter Goals (Single Progress Bar) ============
  meterItems = signal<MeterItem[]>([
    { label: 'New Subscriptions', value: 20, color: 'var(--cyan-500)' },
    { label: 'Renewal Contracts', value: 20, color: 'var(--amber-500)' },
    { label: 'Upsell Revenue', value: 20, color: 'var(--violet-500)' },
    { label: 'Add-On Sales', value: 20, color: 'var(--pink-500)' }
  ]);

  goalDetails = signal<GoalDetail[]>([
    { label: 'New Subscriptions', color: 'cyan', current: 152, target: 300 },
    { label: 'Renewal Contracts', color: 'amber', current: 63, target: 500 },
    { label: 'Upsell Revenue', color: 'violet', current: 23, target: 1000 },
    { label: 'Add-On Sales', color: 'pink', current: 42, target: 2000 }
  ]);

  totalProgress = computed(() => {
    const details = this.goalDetails();
    const totalCurrent = details.reduce((sum, d) => sum + d.current, 0);
    const totalTarget = details.reduce((sum, d) => sum + d.target, 0);
    const percentage = ((totalCurrent / totalTarget) * 100).toFixed(1);
    return { current: totalCurrent, target: totalTarget, percentage };
  });

  // ============ Crypto Cards (With Graph) ============
  cryptoCards = signal<CryptoCard[]>([
    { id: '1', name: 'Bitcoin', symbol: 'BTC', amount: '0.0045 BTC', icon: 'bitcoin' },
    { id: '2', name: 'Stellar', symbol: 'XLM', amount: '40.9500 XLM', icon: 'stellar' },
    { id: '3', name: 'Ethereum', symbol: 'ETH', amount: '3.0500 ETH', icon: 'ethereum' },
    { id: '4', name: 'Ripple', symbol: 'XRP', amount: '90.6065 XRP', icon: 'ripple' }
  ]);

  // ============ Status Bar and Details ============
  statusBarCards = signal<StatusBarCard[]>([
    {
      id: '1',
      icon: 'pi pi-sparkles',
      title: 'AI Processing',
      subtitle: 'Daily AI Token Consumption',
      current: 540,
      total: 1000,
      unit: 'tokens',
      filledSegments: 3,
      totalSegments: 5,
      details: [
        { label: 'Active Models', value: '3 Neural Networks' },
        { label: 'Response Time', value: '2.5 Seconds / Query' }
      ]
    },
    {
      id: '2',
      icon: 'pi pi-users',
      title: 'User Activity',
      subtitle: 'Daily Active Users',
      current: 2350,
      total: 5000,
      unit: 'users',
      filledSegments: 2,
      totalSegments: 5,
      details: [
        { label: 'Session Duration', value: '15 Minutes' },
        { label: 'Feature Usage', value: '85% Dashboard' }
      ]
    },
    {
      id: '3',
      icon: 'pi pi-microchip',
      title: 'System Uptime',
      subtitle: 'Daily Operational Efficiency',
      current: 98,
      total: 100,
      unit: 'hours',
      filledSegments: 5,
      totalSegments: 5,
      details: [
        { label: 'Downtime Incidents', value: '0 Reported' },
        { label: 'Load Capacity', value: '75% Server Utilization' }
      ]
    }
  ]);

  // Color variants disponibles
  colorVariants: Array<'cyan' | 'orange' | 'slate' | 'violet' | 'emerald' | 'rose'> = [
    'cyan', 'orange', 'slate', 'violet', 'emerald', 'rose'
  ];

  // ============ Guidelines ============
  guidelinesDos = [
    'Usar colores consistentes para representar tipos de datos similares',
    'Incluir timestamps o contexto temporal cuando sea relevante',
    'Mantener los valores concisos (usar sufijos como k, M para miles/millones)',
    'Usar iconos que representen claramente el tipo de metrica',
    'Agrupar stats relacionados en un grid coherente'
  ];

  guidelinesDonts = [
    'No mezclar demasiados colores en un mismo grupo de stats',
    'Evitar valores largos sin formatear (ej: 123456 en lugar de 123k)',
    'No usar iconos genericos que no comuniquen el tipo de dato',
    'Evitar mas de 6 stat cards en una fila sin scroll'
  ];

  // ============ Props Tables ============
  coloredCardProps: ComponentProp[] = [
    { name: 'icon', type: 'string', required: true, description: 'Clase del icono PrimeIcons (ej: pi pi-inbox)' },
    { name: 'timestamp', type: 'string', description: 'Texto de fecha/hora para contexto temporal' },
    { name: 'label', type: 'string', required: true, description: 'Etiqueta descriptiva del stat' },
    { name: 'value', type: 'string', required: true, description: 'Valor numerico o texto del stat' },
    { name: 'color', type: "'cyan' | 'orange' | 'slate' | 'violet' | 'emerald' | 'rose'", required: true, description: 'Esquema de color de la tarjeta' }
  ];

  footnoteCardProps: ComponentProp[] = [
    { name: 'icon', type: 'string', required: true, description: 'Clase del icono PrimeIcons (ej: pi pi-envelope)' },
    { name: 'label', type: 'string', required: true, description: 'Etiqueta descriptiva del stat' },
    { name: 'value', type: 'string', required: true, description: 'Valor numerico principal' },
    { name: 'footnote', type: 'string', required: true, description: 'Texto secundario de pie de tarjeta' },
    { name: 'footnoteHighlight', type: 'string', description: 'Texto destacado antes del footnote' },
    { name: 'color', type: "'cyan' | 'orange' | 'slate' | 'violet'", required: true, description: 'Color del icono con gradiente' }
  ];

  progressCardProps: ComponentProp[] = [
    { name: 'image', type: 'string', required: true, description: 'URL de imagen o clase de icono PrimeIcons' },
    { name: 'title', type: 'string', required: true, description: 'Titulo principal del stat' },
    { name: 'subtitle', type: 'string', required: true, description: 'Subtitulo descriptivo (ej: 500 per month)' },
    { name: 'progressLabel', type: 'string', required: true, description: 'Etiqueta de la barra de progreso' },
    { name: 'progressValue', type: 'number', required: true, description: 'Valor de progreso (0-100)' },
    { name: 'currentValue', type: 'string', required: true, description: 'Valor actual destacado (ej: 350 units)' },
    { name: 'description', type: 'string', required: true, description: 'Texto descriptivo del progreso' }
  ];

  datePickerCardProps: ComponentProp[] = [
    { name: 'selectedDate', type: 'signal<Date>', required: true, description: 'Signal con la fecha seleccionada actual' },
    { name: 'months', type: 'string[]', description: 'Array de nombres de meses abreviados' },
    { name: 'getDateByOffset()', type: 'function', required: true, description: 'Retorna fecha, mes y Date para un offset dado' },
    { name: 'selectDateByOffset()', type: 'function', required: true, description: 'Selecciona fecha por offset relativo' },
    { name: 'nextDay() / prevDay()', type: 'function', required: true, description: 'Navega al dia siguiente/anterior' },
    { name: 'metrics', type: 'computed', required: true, description: 'Computed signal con valores de metricas basados en fecha' },
    { name: 'chartData', type: 'computed', required: true, description: 'Computed signal con alturas de barras para mini charts' }
  ];

  progressBarsCardProps: ComponentProp[] = [
    { name: 'name', type: 'string', required: true, description: 'Nombre del usuario' },
    { name: 'role', type: 'string', required: true, description: 'Cargo o rol del usuario' },
    { name: 'avatar', type: 'string', required: true, description: 'URL de imagen o iniciales para avatar' },
    { name: 'socials', type: 'SocialProgress[]', required: true, description: 'Array de plataformas con progreso' },
    { name: 'socials[].platform', type: 'string', required: true, description: 'Nombre de la plataforma (Twitter, Facebook, etc.)' },
    { name: 'socials[].value', type: 'number', required: true, description: 'Valor del progreso (0-100)' },
    { name: 'socials[].percentage', type: 'string', required: true, description: 'Porcentaje formateado para mostrar' }
  ];

  quarterGoalsCardProps: ComponentProp[] = [
    { name: 'meterItems', type: 'MeterItem[]', required: true, description: 'Array de segmentos para el meter group' },
    { name: 'meterItems[].label', type: 'string', required: true, description: 'Etiqueta del segmento' },
    { name: 'meterItems[].value', type: 'number', required: true, description: 'Valor porcentual del segmento' },
    { name: 'meterItems[].color', type: 'string', required: true, description: 'Color CSS del segmento (var(--cyan-500))' },
    { name: 'goalDetails', type: 'GoalDetail[]', required: true, description: 'Array de detalles de cada meta' },
    { name: 'goalDetails[].current', type: 'number', required: true, description: 'Valor actual alcanzado' },
    { name: 'goalDetails[].target', type: 'number', required: true, description: 'Meta objetivo' }
  ];

  cryptoCardProps: ComponentProp[] = [
    { name: 'name', type: 'string', required: true, description: 'Nombre de la criptomoneda (Bitcoin, Ethereum, etc.)' },
    { name: 'symbol', type: 'string', required: true, description: 'Simbolo de la cripto (BTC, ETH, XRP)' },
    { name: 'amount', type: 'string', required: true, description: 'Cantidad formateada con simbolo' },
    { name: 'icon', type: 'string', required: true, description: 'Identificador del icono SVG de la cripto' }
  ];

  statusBarCardProps: ComponentProp[] = [
    { name: 'icon', type: 'string', required: true, description: 'Clase del icono PrimeIcons (pi pi-sparkles)' },
    { name: 'title', type: 'string', required: true, description: 'Titulo principal del stat' },
    { name: 'subtitle', type: 'string', required: true, description: 'Descripcion secundaria' },
    { name: 'current', type: 'number', required: true, description: 'Valor actual' },
    { name: 'total', type: 'number', required: true, description: 'Valor total/maximo' },
    { name: 'unit', type: 'string', required: true, description: 'Unidad de medida (tokens, users, hours)' },
    { name: 'filledSegments', type: 'number', required: true, description: 'Cantidad de segmentos llenos en la barra' },
    { name: 'totalSegments', type: 'number', required: true, description: 'Total de segmentos en la barra' },
    { name: 'details', type: 'StatusBarDetail[]', required: true, description: 'Array de detalles key-value' }
  ];

  // ============ Code Examples: Colored & Centered ============
  coloredCenteredCode = `<div class="stat-cards-grid">
  @for (stat of coloredCenteredStats(); track stat.id) {
    <div class="stat-card-colored" [class]="'stat-' + stat.color">
      <div class="stat-header">
        <div class="stat-icon">
          <i [class]="stat.icon"></i>
        </div>
        <span class="stat-timestamp">{{ stat.timestamp }}</span>
      </div>
      <div class="stat-body">
        <span class="stat-label">{{ stat.label }}</span>
        <div class="stat-value">{{ stat.value }}</div>
      </div>
    </div>
  }
</div>`;

  coloredCenteredTsCode = `interface StatCardColored {
  id: string;
  icon: string;
  timestamp: string;
  label: string;
  value: string;
  color: 'cyan' | 'orange' | 'slate' | 'violet' | 'emerald' | 'rose';
}

coloredCenteredStats = signal<StatCardColored[]>([
  { id: '1', icon: 'pi pi-inbox', timestamp: '11:08, 17 Aug', label: 'Messages', value: '123k', color: 'cyan' },
  { id: '2', icon: 'pi pi-bolt', timestamp: '14:15, 18 Aug', label: 'System Alerts', value: '89k', color: 'orange' },
  { id: '3', icon: 'pi pi-gift', timestamp: '09:30, 16 Aug', label: 'Promotional Offers', value: '3k', color: 'slate' },
  { id: '4', icon: 'pi pi-wave-pulse', timestamp: '16:45, 19 Aug', label: 'Traffic Distribution', value: '175k', color: 'violet' }
]);`;

  coloredCenteredScssCode = `.stat-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.stat-card-colored {
  padding: 1rem;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  &.stat-cyan {
    background: var(--cyan-50);
    border: 1px solid var(--cyan-200);
    .stat-icon { background: var(--cyan-500); }
    .stat-timestamp, .stat-label { color: var(--cyan-700); }
    .stat-value { color: var(--cyan-900); }
  }
  // ... mas colores
}`;

  coloredCodeTabs: CodeTab[] = [
    { label: 'HTML', language: 'html', icon: 'pi pi-code', code: this.coloredCenteredCode },
    { label: 'TypeScript', language: 'typescript', icon: 'pi pi-file', code: this.coloredCenteredTsCode },
    { label: 'SCSS', language: 'scss', icon: 'pi pi-palette', code: this.coloredCenteredScssCode }
  ];

  // ============ Code Examples: Icons & Footnotes ============
  iconsFootnotesCode = `<div class="stat-cards-grid">
  @for (stat of iconsFootnotesStats(); track stat.id) {
    <div class="stat-card-footnote">
      <div class="stat-content">
        <div class="stat-info">
          <span class="stat-label">{{ stat.label }}</span>
          <div class="stat-value">{{ stat.value }}</div>
        </div>
        <div class="stat-icon-gradient" [class]="'icon-' + stat.color">
          <i [class]="stat.icon"></i>
        </div>
      </div>
      <div class="stat-footnote">
        @if (stat.footnoteHighlight) {
          <span class="footnote-highlight">{{ stat.footnoteHighlight }}</span>
        }
        <span class="footnote-text">{{ stat.footnote }}</span>
      </div>
    </div>
  }
</div>`;

  iconsFootnotesTsCode = `interface StatCardWithFootnote {
  id: string;
  icon: string;
  label: string;
  value: string;
  footnote: string;
  footnoteHighlight?: string;
  color: 'cyan' | 'orange' | 'slate' | 'violet';
}

iconsFootnotesStats = signal<StatCardWithFootnote[]>([
  { id: '1', icon: 'pi pi-envelope', label: 'Messages', value: '152', footnoteHighlight: '24 new', footnote: 'since last visit', color: 'cyan' },
  { id: '2', icon: 'pi pi-map-marker', label: 'Check-ins', value: '532', footnoteHighlight: '48 new', footnote: 'since last visit', color: 'orange' },
  { id: '3', icon: 'pi pi-file', label: 'Files Synced', value: '28.441', footnote: '32,56 / 250 GB', color: 'slate' },
  { id: '4', icon: 'pi pi-users', label: 'Users Online', value: '25.660', footnoteHighlight: '72 new', footnote: 'user this week', color: 'violet' }
]);`;

  iconsFootnotesScssCode = `.stat-card-footnote {
  background: var(--surface-card);
  box-shadow: var(--shadow-sm);
  padding: 1.25rem;
  border-radius: 1rem;

  .stat-content {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }

  .stat-icon-gradient {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;

    &.icon-cyan {
      background: linear-gradient(to bottom, var(--cyan-400), var(--cyan-600));
    }
    &.icon-orange {
      background: linear-gradient(to bottom, var(--orange-400), var(--orange-600));
    }
    // ... mas colores
  }

  .stat-footnote {
    margin-top: 1rem;
    .footnote-highlight { font-weight: 500; }
  }
}`;

  footnoteCodeTabs: CodeTab[] = [
    { label: 'HTML', language: 'html', icon: 'pi pi-code', code: this.iconsFootnotesCode },
    { label: 'TypeScript', language: 'typescript', icon: 'pi pi-file', code: this.iconsFootnotesTsCode },
    { label: 'SCSS', language: 'scss', icon: 'pi pi-palette', code: this.iconsFootnotesScssCode }
  ];

  // ============ Code Examples: Cards with Progress Bar ============
  progressCode = `<div class="progress-cards-grid">
  @for (stat of progressStats(); track stat.id) {
    <div class="stat-card-progress">
      <div class="stat-header">
        <div class="stat-avatar">
          <i [class]="stat.image"></i>
        </div>
        <div class="stat-title-group">
          <span class="stat-title">{{ stat.title }}</span>
          <span class="stat-subtitle">{{ stat.subtitle }}</span>
        </div>
      </div>
      <div class="stat-progress-section">
        <div class="progress-header">
          <span class="progress-label">{{ stat.progressLabel }}</span>
          <span class="progress-value">{{ stat.progressValue }}%</span>
        </div>
        <p-progressbar [value]="stat.progressValue" [showValue]="false" />
        <p class="progress-description">
          <span class="desc-prefix">Currently at </span>
          <span class="desc-highlight">{{ stat.currentValue }}</span>
          <span class="desc-suffix"> {{ stat.description }}</span>
        </p>
      </div>
    </div>
  }
</div>`;

  progressTsCode = `interface StatCardWithProgress {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  progressLabel: string;
  progressValue: number;
  currentValue: string;
  description: string;
}

progressStats = signal<StatCardWithProgress[]>([
  {
    id: '1',
    image: 'pi pi-box',
    title: 'Shoes',
    subtitle: '500 per month',
    progressLabel: 'Monthly Goal',
    progressValue: 70,
    currentValue: '350 units',
    description: 'sold, with steady progress toward the monthly target.'
  },
  {
    id: '2',
    image: 'pi pi-tags',
    title: 'Hats',
    subtitle: '500 per month',
    progressLabel: 'Monthly Goal',
    progressValue: 20,
    currentValue: '50 units',
    description: 'sold, with steady progress toward the monthly target.'
  }
]);`;

  progressScssCode = `.progress-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.stat-card-progress {
  background: var(--surface-card);
  box-shadow: var(--shadow-sm);
  border-radius: 1rem;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;

  .stat-header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
  }

  .stat-avatar {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    background: var(--primary-100);
    display: flex;
    align-items: center;
    justify-content: center;
    i { color: var(--primary-500); font-size: 1.25rem; }
  }

  .progress-description {
    .desc-highlight {
      color: var(--primary-500);
      font-weight: 600;
    }
  }
}`;

  progressCodeTabs: CodeTab[] = [
    { label: 'HTML', language: 'html', icon: 'pi pi-code', code: this.progressCode },
    { label: 'TypeScript', language: 'typescript', icon: 'pi pi-file', code: this.progressTsCode },
    { label: 'SCSS', language: 'scss', icon: 'pi pi-palette', code: this.progressScssCode }
  ];

  // ============ Code Examples: Date Picker Stats ============
  datePickerCode = `<div class="date-picker-card">
  <!-- Date Navigation -->
  <div class="date-nav">
    <button class="date-nav-btn" (click)="prevDay()">
      <i class="pi pi-chevron-left"></i>
    </button>

    <div class="date-pills-container">
      <!-- Desktop: 7 dates -->
      <div class="date-pills">
        @for (offset of [-3, -2, -1, 0, 1, 2, 3]; track offset) {
          <button
            class="date-pill"
            [class.active]="offset === 0"
            (click)="selectDateByOffset(offset)"
          >
            <span class="date-day">{{ getDateByOffset(offset).date }}</span>
            <span class="date-month">{{ getDateByOffset(offset).month }}</span>
          </button>
        }
      </div>
    </div>

    <button class="date-nav-btn" (click)="nextDay()">
      <i class="pi pi-chevron-right"></i>
    </button>
  </div>

  <!-- Metrics Grid -->
  <div class="metrics-container">
    <div class="metrics-row">
      <div class="metric-item">
        <div class="metric-content">
          <div class="metric-info">
            <span class="metric-label">User Signups</span>
            <span class="metric-value">{{ metrics().signups }}</span>
          </div>
          <div class="metric-chart">
            @for (height of chartData().signupBars; track $index) {
              <div class="chart-bar" [style.height.px]="height"></div>
            }
            <div class="chart-bar chart-bar-current" [style.height.px]="chartData().signupCurrentBar"></div>
          </div>
        </div>
      </div>
      <div class="metric-divider-v"></div>
      <div class="metric-item"><!-- API Requests --></div>
    </div>
    <div class="metric-divider-h"></div>
    <div class="metrics-row"><!-- Row 2 --></div>
  </div>
</div>`;

  datePickerTsCode = `selectedDate = signal(new Date());
months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

getDateByOffset(offset: number): { date: number; month: string; fullDate: Date } {
  const date = new Date(this.selectedDate());
  date.setDate(date.getDate() + offset);
  return {
    date: date.getDate(),
    month: this.months[date.getMonth()],
    fullDate: date
  };
}

selectDateByOffset(offset: number): void {
  const date = new Date(this.selectedDate());
  date.setDate(date.getDate() + offset);
  this.selectedDate.set(date);
}

nextDay(): void {
  const tomorrow = new Date(this.selectedDate());
  tomorrow.setDate(tomorrow.getDate() + 1);
  this.selectedDate.set(tomorrow);
}

prevDay(): void {
  const yesterday = new Date(this.selectedDate());
  yesterday.setDate(yesterday.getDate() - 1);
  this.selectedDate.set(yesterday);
}

metrics = computed(() => {
  const seed = this.selectedDate().getDate() + this.selectedDate().getMonth() * 30;
  return {
    signups: 8000 + seed * 100,
    apiRequests: (1 + seed * 0.05).toFixed(1) + 'M',
    ticketsResolved: 3000 + seed * 50,
    subscriptionRenewals: 1500 + seed * 75
  };
});

chartData = computed(() => {
  const seed = this.selectedDate().getDate() + this.selectedDate().getMonth() * 30;
  return {
    signupBars: [15 + (seed % 3), 18 + (seed % 4), 12 + (seed % 5), 20 + (seed % 3), 16 + (seed % 4)],
    signupCurrentBar: 19 + (seed % 3),
    // ...more chart data
  };
});`;

  datePickerScssCode = `.date-picker-card {
  background: var(--surface-card);
  box-shadow: var(--shadow-sm);
  border-radius: 1rem;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.date-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-nav-btn {
  height: 4.5rem;
  width: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--surface-border);
  border-radius: 0.5rem;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s;

  &:hover { background: var(--surface-hover); }
}

.date-pill {
  min-width: 4.5rem;
  height: 4.5rem;
  padding: 0.5rem;
  border: 1px solid var(--surface-border);
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  cursor: pointer;
  background: transparent;
  transition: all 0.3s;

  &:hover { background: var(--surface-hover); }

  &.active {
    background: var(--primary-50);
    border-color: var(--primary-500);
    .date-day, .date-month { color: var(--primary-600); }
  }
}

.metric-chart {
  display: flex;
  align-items: flex-end;
  gap: 3px;

  .chart-bar {
    width: 6px;
    background: var(--surface-200);
    border-radius: 3.5px;
  }

  .chart-bar-current {
    background: var(--primary-color);
  }
}`;

  datePickerCodeTabs: CodeTab[] = [
    { label: 'HTML', language: 'html', icon: 'pi pi-code', code: this.datePickerCode },
    { label: 'TypeScript', language: 'typescript', icon: 'pi pi-file', code: this.datePickerTsCode },
    { label: 'SCSS', language: 'scss', icon: 'pi pi-palette', code: this.datePickerScssCode }
  ];

  // ============ Code Examples: Progress Bars ============
  progressBarsCode = `<div class="user-progress-grid">
  @for (user of userProgressCards(); track user.id) {
    <div class="user-progress-card">
      <div class="user-header">
        <p-avatar [label]="user.avatar" size="large" shape="circle" />
        <div class="user-info">
          <span class="user-name">{{ user.name }}</span>
          <span class="user-role">{{ user.role }}</span>
        </div>
      </div>

      <div class="progress-list">
        @for (social of user.socials; track social.platform) {
          <div class="progress-item">
            <div class="progress-header">
              <span class="progress-platform">{{ social.platform }}</span>
              <span class="progress-percentage">{{ social.percentage }}</span>
            </div>
            <p-progressbar
              [value]="social.value"
              [showValue]="false"
              styleClass="progress-bar-sm"
            />
          </div>
        }
      </div>
    </div>
  }
</div>`;

  progressBarsTsCode = `interface SocialProgress {
  platform: string;
  value: number;
  percentage: string;
}

interface UserProgressCard {
  id: string;
  name: string;
  role: string;
  avatar: string;
  socials: SocialProgress[];
}

userProgressCards = signal<UserProgressCard[]>([
  {
    id: '1',
    name: 'Cameron Williamson',
    role: 'Marketing Coordinator',
    avatar: 'CW',
    socials: [
      { platform: 'Twitter', value: 34, percentage: '34.00%' },
      { platform: 'Facebook', value: 46, percentage: '45.86%' },
      { platform: 'Google', value: 79, percentage: '79.00%' }
    ]
  },
  // ...more users
]);`;

  progressBarsScssCode = `.user-progress-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.user-progress-card {
  background: var(--surface-card);
  box-shadow: var(--shadow-sm);
  border-radius: 1rem;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-name {
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--text-color);
}

.user-role {
  color: var(--text-color-secondary);
}

.progress-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.progress-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

::ng-deep .progress-bar-sm {
  height: 0.5rem;
  border-radius: 0.25rem;
}`;

  progressBarsCodeTabs: CodeTab[] = [
    { label: 'HTML', language: 'html', icon: 'pi pi-code', code: this.progressBarsCode },
    { label: 'TypeScript', language: 'typescript', icon: 'pi pi-file', code: this.progressBarsTsCode },
    { label: 'SCSS', language: 'scss', icon: 'pi pi-palette', code: this.progressBarsScssCode }
  ];

  // ============ Code Examples: Quarter Goals ============
  quarterGoalsCode = `<div class="quarter-goals-card">
  <span class="goals-title">Quarter Goals</span>

  <div class="goals-summary">
    <div class="goals-header">
      <span class="goals-percentage">{{ totalProgress().percentage }}%</span>
      <span class="goals-count">{{ totalProgress().current }} / {{ totalProgress().target }}</span>
    </div>
    <p-metergroup [value]="meterItems()">
      <ng-template #label></ng-template>
      <ng-template #meter let-value let-class="class" let-width="size">
        <span [class]="class" [style]="{ background: value.color, width: value.value + '%' }"></span>
      </ng-template>
    </p-metergroup>
  </div>

  <div class="goals-details">
    <span class="details-title">Details</span>
    <div class="details-list">
      @for (detail of goalDetails(); track detail.label) {
        <div class="detail-item">
          <span class="detail-indicator" [class]="'bg-' + detail.color"></span>
          <span class="detail-label">{{ detail.label }}</span>
          <span class="detail-value">{{ detail.current }} / {{ detail.target }}</span>
        </div>
      }
    </div>
  </div>
</div>`;

  quarterGoalsTsCode = `interface MeterItem {
  label: string;
  value: number;
  color: string;
}

interface GoalDetail {
  label: string;
  color: string;
  current: number;
  target: number;
}

meterItems = signal<MeterItem[]>([
  { label: 'New Subscriptions', value: 20, color: 'var(--cyan-500)' },
  { label: 'Renewal Contracts', value: 20, color: 'var(--amber-500)' },
  { label: 'Upsell Revenue', value: 20, color: 'var(--violet-500)' },
  { label: 'Add-On Sales', value: 20, color: 'var(--pink-500)' }
]);

goalDetails = signal<GoalDetail[]>([
  { label: 'New Subscriptions', color: 'cyan', current: 152, target: 300 },
  { label: 'Renewal Contracts', color: 'amber', current: 63, target: 500 },
  { label: 'Upsell Revenue', color: 'violet', current: 23, target: 1000 },
  { label: 'Add-On Sales', color: 'pink', current: 42, target: 2000 }
]);

totalProgress = computed(() => {
  const details = this.goalDetails();
  const totalCurrent = details.reduce((sum, d) => sum + d.current, 0);
  const totalTarget = details.reduce((sum, d) => sum + d.target, 0);
  const percentage = ((totalCurrent / totalTarget) * 100).toFixed(1);
  return { current: totalCurrent, target: totalTarget, percentage };
});`;

  quarterGoalsScssCode = `.quarter-goals-card {
  background: var(--surface-card);
  box-shadow: var(--shadow-sm);
  border-radius: 1rem;
  padding: 2rem;
  max-width: 56rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.goals-title {
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--text-color);
}

.goals-summary {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.goals-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.goals-percentage {
  font-size: 2.25rem;
  font-weight: 600;
  color: var(--text-color);
}

.goals-count {
  color: var(--text-color-secondary);
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.detail-indicator {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
}

.detail-label {
  flex: 1;
  color: var(--text-color);
}

.detail-value {
  color: var(--text-color-secondary);
}`;

  quarterGoalsCodeTabs: CodeTab[] = [
    { label: 'HTML', language: 'html', icon: 'pi pi-code', code: this.quarterGoalsCode },
    { label: 'TypeScript', language: 'typescript', icon: 'pi pi-file', code: this.quarterGoalsTsCode },
    { label: 'SCSS', language: 'scss', icon: 'pi pi-palette', code: this.quarterGoalsScssCode }
  ];

  // ============ Code Examples: Crypto Cards ============
  cryptoCardsCode = `<div class="crypto-cards-grid">
  @for (crypto of cryptoCards(); track crypto.id) {
    <div class="crypto-card">
      <div class="crypto-header">
        <div class="crypto-info">
          <div class="crypto-icon">
            <!-- SVG icon here -->
          </div>
          <span class="crypto-name">{{ crypto.name }}</span>
        </div>
        <span class="crypto-amount">{{ crypto.amount }}</span>
      </div>
      <div class="crypto-chart">
        <!-- SVG area chart -->
        <svg viewBox="0 0 271 63" fill="none">
          <path d="..." fill="url(#gradient)" stroke="var(--primary-color)" />
        </svg>
      </div>
    </div>
  }
</div>`;

  cryptoCardsTsCode = `interface CryptoCard {
  id: string;
  name: string;
  symbol: string;
  amount: string;
  icon: 'bitcoin' | 'stellar' | 'ethereum' | 'ripple';
}

cryptoCards = signal<CryptoCard[]>([
  { id: '1', name: 'Bitcoin', symbol: 'BTC', amount: '0.0045 BTC', icon: 'bitcoin' },
  { id: '2', name: 'Stellar', symbol: 'XLM', amount: '40.9500 XLM', icon: 'stellar' },
  { id: '3', name: 'Ethereum', symbol: 'ETH', amount: '3.0500 ETH', icon: 'ethereum' },
  { id: '4', name: 'Ripple', symbol: 'XRP', amount: '90.6065 XRP', icon: 'ripple' }
]);`;

  cryptoCardsScssCode = `.crypto-cards-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 2rem;

  @media (min-width: 640px) { grid-template-columns: repeat(2, 1fr); }
  @media (min-width: 1024px) { grid-template-columns: repeat(4, 1fr); }
}

.crypto-card {
  background: var(--surface-card);
  box-shadow: var(--shadow-sm);
  border-radius: 1rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.crypto-header {
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.crypto-icon {
  width: 1.75rem;
  height: 1.75rem;
  background: var(--primary-500);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.crypto-chart {
  width: 100%;
  overflow: hidden;

  svg {
    width: 100%;
    height: auto;
    display: block;
  }
}`;

  cryptoCardsCodeTabs: CodeTab[] = [
    { label: 'HTML', language: 'html', icon: 'pi pi-code', code: this.cryptoCardsCode },
    { label: 'TypeScript', language: 'typescript', icon: 'pi pi-file', code: this.cryptoCardsTsCode },
    { label: 'SCSS', language: 'scss', icon: 'pi pi-palette', code: this.cryptoCardsScssCode }
  ];

  // ============ Code Examples: Status Bar and Details ============
  statusBarCode = `<div class="status-bar-grid">
  @for (card of statusBarCards(); track card.id) {
    <p-accordion [value]="card.id" styleClass="status-bar-accordion">
      <p-accordionpanel [value]="card.id">
        <p-accordionheader>
          <div class="status-bar-header-content">
            <div class="status-bar-icon">
              <i [class]="card.icon"></i>
            </div>
            <div class="status-bar-titles">
              <span class="status-bar-title">{{ card.title }}</span>
              <span class="status-bar-subtitle">{{ card.subtitle }}</span>
            </div>
          </div>
        </p-accordionheader>
        <p-accordioncontent>
          <div class="status-bar-content">
            <div class="status-bar-summary">
              <div class="status-bar-values">
                <span class="value-current">{{ card.current }}</span>
                <span class="value-total">of {{ card.total }}</span>
              </div>
              <span class="value-unit">{{ card.unit }}</span>
            </div>
            <div class="status-bar-segments">
              @for (segment of [1,2,3,4,5]; track segment) {
                <div class="segment" [class.filled]="segment <= card.filledSegments"></div>
              }
            </div>
          </div>
          <div class="status-bar-details">
            <span class="details-title">Details</span>
            @for (detail of card.details; track detail.label) {
              <div class="detail-row">
                <span class="detail-label">{{ detail.label }}</span>
                <span class="detail-value">{{ detail.value }}</span>
              </div>
            }
          </div>
        </p-accordioncontent>
      </p-accordionpanel>
    </p-accordion>
  }
</div>`;

  statusBarTsCode = `interface StatusBarDetail {
  label: string;
  value: string;
}

interface StatusBarCard {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  current: number;
  total: number;
  unit: string;
  filledSegments: number;
  totalSegments: number;
  details: StatusBarDetail[];
}

statusBarCards = signal<StatusBarCard[]>([
  {
    id: '1',
    icon: 'pi pi-sparkles',
    title: 'AI Processing',
    subtitle: 'Daily AI Token Consumption',
    current: 540,
    total: 1000,
    unit: 'tokens',
    filledSegments: 3,
    totalSegments: 5,
    details: [
      { label: 'Active Models', value: '3 Neural Networks' },
      { label: 'Response Time', value: '2.5 Seconds / Query' }
    ]
  }
]);`;

  statusBarScssCode = `.status-bar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

// Accordion styles
::ng-deep .status-bar-accordion {
  box-shadow: var(--shadow-sm);
  border-radius: 1rem !important;
  overflow: hidden;

  .p-accordionpanel { border: none !important; }
  .p-accordionheader { border: none !important; }
  .p-accordionpanel-content { padding: 0 !important; border: none !important; }
}

.status-bar-header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.status-bar-icon {
  width: 2.5rem;
  height: 2.5rem;
  background: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  i { color: var(--primary-contrast-color); font-size: 1.25rem; }
}

.status-bar-content {
  padding: 1rem 1rem 2rem;
  border-top: 1px solid var(--surface-border);
  border-bottom: 1px solid var(--surface-border);
}

.status-bar-segments {
  display: flex;
  gap: 0.5rem;

  .segment {
    flex: 1;
    height: 0.5rem;
    background: var(--surface-200);
    border-radius: 0.25rem;

    &.filled { background: var(--primary-500); }
  }
}

.status-bar-details {
  padding: 1rem;
}`;

  statusBarCodeTabs: CodeTab[] = [
    { label: 'HTML', language: 'html', icon: 'pi pi-code', code: this.statusBarCode },
    { label: 'TypeScript', language: 'typescript', icon: 'pi pi-file', code: this.statusBarTsCode },
    { label: 'SCSS', language: 'scss', icon: 'pi pi-palette', code: this.statusBarScssCode }
  ];
}
