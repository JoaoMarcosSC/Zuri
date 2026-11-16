# Receita: dashboard (área logada)

**Quando usar:** painel com navegação lateral, indicadores e gráficos; ponto de entrada da área logada.
**Layout:** `zur-dashboard-layout` com `zur-sidebar` (recolhível, gaveta no celular) e `zur-topbar`.
Em telas pequenas, considere `zur-bottom-nav` para os 3–5 destinos principais.

```ts
// arquivo: src/app/painel/painel.page.ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  ZurAvatar, ZurButton, ZurCard, ZurChart, ZurChartSeries, ZurDashboardLayout, ZurIcon, ZurLogo,
  ZurPageHeader, ZurSidebar, ZurSidenav, ZurSidenavItem, ZurSparkline, ZurStat, ZurThemeToggle, ZurTopbar,
  zurIconFile, zurIconHome, zurIconUsers,
} from '@juau/zuri';

@Component({
  selector: 'app-painel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink, RouterLinkActive, ZurDashboardLayout, ZurSidebar, ZurSidenav, ZurSidenavItem, ZurIcon, ZurLogo,
    ZurTopbar, ZurThemeToggle, ZurAvatar, ZurPageHeader, ZurButton, ZurStat, ZurSparkline, ZurCard, ZurChart,
  ],
  template: `
    <zur-dashboard-layout>
      <zur-sidebar>
        <span zurSidebarHeader><zur-logo variant="auto" [size]="28" /></span>
        <zur-sidenav aria-label="Principal">
          <a zur-sidenav-item routerLink="/painel" routerLinkActive #a1="routerLinkActive" [active]="a1.isActive">
            <zur-icon zurSidenavIcon [icon]="icones.inicio" /> Início
          </a>
          <a zur-sidenav-item routerLink="/pedidos" routerLinkActive #a2="routerLinkActive" [active]="a2.isActive">
            <zur-icon zurSidenavIcon [icon]="icones.pedidos" /> Pedidos
          </a>
          <a zur-sidenav-item routerLink="/clientes" routerLinkActive #a3="routerLinkActive" [active]="a3.isActive">
            <zur-icon zurSidenavIcon [icon]="icones.clientes" /> Clientes
          </a>
        </zur-sidenav>
      </zur-sidebar>
      <zur-topbar>
        <ng-container zurTopbarActions>
          <!-- só no modo de tema "ambos" -->
          <zur-theme-toggle />
          <zur-avatar name="Ana Silva" size="sm" />
        </ng-container>
      </zur-topbar>

      <zur-page-header title="Visão geral" description="Resumo das últimas 4 semanas.">
        <button zurPageHeaderActions zur-button variant="primary" size="sm" routerLink="/pedidos/novo">Novo pedido</button>
      </zur-page-header>

      <div class="kpis">
        @for (k of kpis; track k.label) {
          <zur-stat [label]="k.label" [value]="k.value" [delta]="k.delta" [invert]="k.invert" deltaLabel="vs. mês anterior">
            <zur-sparkline zurStatChart [label]="k.label + ' nos últimos 12 dias'" [values]="k.serie" />
          </zur-stat>
        }
      </div>

      <zur-card>
        <h2 class="titulo">Vendas e custos por mês</h2>
        <zur-chart type="bar" label="Vendas e custos por mês, em milhares de reais" [labels]="meses" [series]="vendas" [height]="240" />
      </zur-card>
    </zur-dashboard-layout>
  `,
  styles: `
    .kpis {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: var(--zur-space-md);
      margin-block-end: var(--zur-space-lg);
    }
    .titulo { margin: 0 0 var(--zur-space-md); font: var(--zur-font-title); color: var(--zur-ink); }
  `,
})
export class PainelPage {
  protected readonly icones = { inicio: zurIconHome, pedidos: zurIconFile, clientes: zurIconUsers };

  protected readonly kpis = [
    { label: 'Pedidos', value: '1.284', delta: 12.4, invert: false, serie: [4, 6, 5, 8, 9, 7, 10, 12, 11, 13, 12, 15] },
    { label: 'Ticket médio', value: 'R$ 96', delta: 3.1, invert: false, serie: [90, 92, 91, 94, 93, 95, 96, 94, 97, 96, 98, 96] },
    { label: 'Devoluções', value: '23', delta: -8.0, invert: true, serie: [30, 28, 29, 27, 26, 27, 25, 24, 25, 24, 23, 23] },
  ];

  protected readonly meses = ['Jan', 'Fev', 'Mar', 'Abr'];
  protected readonly vendas: ZurChartSeries[] = [
    { name: 'Vendas', values: [120, 135, 128, 150] },
    { name: 'Custos', values: [80, 84, 90, 95] },
  ];
}
```

**Notas**
- Em modo de tema "só claro" ou "só escuro", tire o `zur-theme-toggle`.
- Até 6 séries por gráfico; o `label` do gráfico é obrigatório (vira o nome acessível e a tabela de dados).
- Para custos/erros, `invert` deixa a queda em verde.
