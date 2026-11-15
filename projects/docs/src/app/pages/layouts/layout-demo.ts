import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import {
  ZurAuthLayout,
  ZurAvatar,
  ZurBadge,
  ZurBreadcrumb,
  ZurButton,
  ZurCard,
  ZurDashboardLayout,
  ZurDocsLayout,
  ZurErrorLayout,
  ZurFooter,
  ZurFormLayout,
  ZurInput,
  ZurLogo,
  ZurLandingLayout,
  ZurListDetailLayout,
  ZurPageHeader,
  ZurSidebar,
  ZurSidenav,
  ZurSidenavItem,
  ZurSidenavLabel,
  ZurThemeScope,
  ZurThemeToggle,
  ZurTopbar,
} from '@juau/zuri';

const ICON_HOME =
  'M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z';
const ICON_CHART = 'M4 20V10M10 20V4M16 20v-7M22 20H2';
const ICON_USERS = 'M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z';

/**
 * Página de demonstração de cada layout, renderizada em tela cheia.
 * É o conteúdo dos iframes da página "Layouts" (rota `/demo/:layout`).
 */
@Component({
  selector: 'docs-layout-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ZurLandingLayout,
    ZurDashboardLayout,
    ZurListDetailLayout,
    ZurFormLayout,
    ZurDocsLayout,
    ZurAuthLayout,
    ZurErrorLayout,
    ZurSidebar,
    ZurTopbar,
    ZurPageHeader,
    ZurFooter,
    ZurBreadcrumb,
    ZurSidenav,
    ZurSidenavItem,
    ZurSidenavLabel,
    ZurThemeToggle,
    ZurThemeScope,
    ZurButton,
    ZurCard,
    ZurBadge,
    ZurAvatar,
    ZurInput,
    ZurLogo,
  ],
  templateUrl: './layout-demo.html',
  styleUrl: './layout-demo.css',
})
export class LayoutDemo {
  protected readonly layout = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((p) => p.get('layout') ?? 'landing')),
    { initialValue: 'landing' },
  );

  protected readonly icons = { home: ICON_HOME, chart: ICON_CHART, users: ICON_USERS };

  protected readonly detailOpen = signal(false);

  protected readonly trilha = [
    { label: 'Início', href: '#' },
    { label: 'Reservas' },
  ];

  protected readonly stats = [
    { label: 'Reservas', value: '1.284', delta: '+12%' },
    { label: 'Receita', value: 'R$ 48,2 mil', delta: '+8%' },
    { label: 'Ocupação', value: '86%', delta: '+3%' },
    { label: 'Avaliação', value: '4,9', delta: '+0,1' },
  ];

  protected readonly reservas = [
    { id: 1, nome: 'Ana Silva', local: 'Chalé na serra', data: '12–15 dez' },
    { id: 2, nome: 'João Marcos', local: 'Casa na praia', data: '20–27 dez' },
    { id: 3, nome: 'Maria Costa', local: 'Cabana no lago', data: '02–05 jan' },
    { id: 4, nome: 'Pedro Alves', local: 'Chalé na serra', data: '10–12 jan' },
    { id: 5, nome: 'Luísa Prado', local: 'Casa na praia', data: '18–25 jan' },
  ];

  protected readonly etapas = ['Dados', 'Pagamento', 'Revisão'];
  protected readonly etapaAtual = signal(1);

  /**
   * Os links da demo usam href="#". Com <base href="/">, isso navegaria o iframe
   * para a home — então bloqueamos esses cliques.
   */
  protected blockPlaceholderLinks(event: Event): void {
    const link = (event.target as HTMLElement | null)?.closest('a');
    if (link?.getAttribute('href') === '#') {
      event.preventDefault();
    }
  }

  protected max(n: number): number {
    return Math.max(0, n);
  }

  protected min(n: number): number {
    return Math.min(this.etapas.length - 1, n);
  }

  protected readonly paragrafos = Array.from({ length: 8 }, (_, i) => i + 1);
}
