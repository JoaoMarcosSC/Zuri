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
  ZurChart,
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
  ZurSparkline,
  ZurStat,
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
    ZurChart,
    ZurSparkline,
    ZurStat,
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
    { label: 'Pedidos' },
  ];

  protected readonly beneficios = [
    { titulo: 'Entrega cuidadosa', texto: 'Embalagem que protege folhas e raízes, direto na sua porta.' },
    { titulo: 'Guia de cuidados', texto: 'Rega, luz e adubo explicados para cada planta que você leva.' },
    { titulo: 'Troca garantida', texto: 'Chegou machucada? Trocamos em até 7 dias, sem custo.' },
  ];

  protected readonly stats = [
    { label: 'Pedidos', value: '1.284', delta: 12.4, invert: false, slot: 1, serie: [4, 6, 5, 9, 12, 11, 15, 14, 18, 21, 19, 24] },
    { label: 'Receita', value: 'R$ 48,2 mil', delta: 8, invert: false, slot: 2, serie: [10, 12, 11, 13, 12, 15, 16, 15, 18, 17, 19, 20] },
    { label: 'Devoluções', value: '32', delta: -8, invert: true, slot: 3, serie: [9, 8, 9, 7, 6, 7, 5, 6, 4, 4, 3, 3] },
    { label: 'Avaliação', value: '4,9', delta: 0, invert: false, slot: 4, serie: [] as number[] },
  ];

  protected readonly meses = ['Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov'];
  protected readonly vendas = [
    { name: 'Vendas', values: [12, 18, 9, 22, 17, 26] },
    { name: 'Custos', values: [8, 10, 7, 12, 11, 14] },
  ];

  protected readonly pedidos = [
    { id: 1, nome: 'Ana Silva', produto: 'Monstera deliciosa', data: '12 dez' },
    { id: 2, nome: 'João Marcos', produto: 'Samambaia americana', data: '13 dez' },
    { id: 3, nome: 'Maria Costa', produto: 'Zamioculca', data: '02 jan' },
    { id: 4, nome: 'Pedro Alves', produto: 'Monstera deliciosa', data: '10 jan' },
    { id: 5, nome: 'Luísa Prado', produto: 'Samambaia americana', data: '18 jan' },
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
