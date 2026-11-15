import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ZurChart,
  ZurChartSeries,
  ZurChartType,
  ZurColumnFilter,
  ZurColumnMenu,
  ZurExpandToggle,
  ZurRowSelect,
  ZurSegmented,
  ZurSelectAll,
  ZurSortable,
  ZurSparkline,
  ZurStat,
  ZurTable,
  ZurTableColumn,
  ZurTableRow,
  ZurTimeline,
  ZurTimelineItem,
  ZurTree,
  ZurTreeNode,
  ZurCheckbox,
} from '@juau/zuri';
import { CodeBlock } from '../../shared/code-block/code-block';

const PEDIDOS = [
  { id: 'p1', cliente: 'Ana Silva', produto: 'Monstera deliciosa', itens: 3 },
  { id: 'p2', cliente: 'Bruno Costa', produto: 'Kit de suculentas', itens: 5 },
  { id: 'p3', cliente: 'Carla Dias', produto: 'Orquídea branca', itens: 1 },
  { id: 'p4', cliente: 'Diego Melo', produto: 'Jiboia em cachepô', itens: 2 },
  { id: 'p5', cliente: 'Eva Lima', produto: 'Samambaia', itens: 4 },
];

/** Seções de Tabela avançada, Gráficos, KPI, Timeline e Tree da página Componentes. */
@Component({
  selector: 'docs-data-extras',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule, CodeBlock, ZurTable, ZurSortable, ZurSelectAll, ZurRowSelect, ZurExpandToggle, ZurTableRow,
    ZurColumnFilter, ZurColumnMenu, ZurChart, ZurSegmented, ZurCheckbox, ZurStat, ZurSparkline, ZurTimeline,
    ZurTimelineItem, ZurTree,
  ],
  templateUrl: './data-extras.html',
  styleUrl: './componentes.css',
  styles: `
    :host {
      max-width: none;
      margin: 0;
    }
    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--zur-space-md);
      flex-wrap: wrap;
      margin-block-end: var(--zur-space-md);
      width: 100%;
    }
    .readout {
      margin: 0;
      font: var(--zur-font-caption);
      color: var(--zur-muted);
    }
    .demo-wide {
      display: block;
    }
    .kpis {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: var(--zur-space-md);
      width: 100%;
    }
    .chart-controls {
      display: flex;
      align-items: center;
      gap: var(--zur-space-md);
      flex-wrap: wrap;
      margin-block-end: var(--zur-space-lg);
    }
    .tree-wrap {
      display: flex;
      gap: var(--zur-space-xl);
      flex-wrap: wrap;
      align-items: flex-start;
    }
    .tree-wrap zur-tree {
      flex: 1;
      min-width: 240px;
      max-width: 360px;
    }
  `,
})
export class DataExtras {
  // ── Tabela avançada ──
  protected readonly selecionados = signal<string[]>([]);
  protected readonly filtro = signal('');
  protected readonly colunas: ZurTableColumn[] = [
    { key: 'produto', label: 'Produto' },
    { key: 'itens', label: 'Itens' },
  ];
  protected readonly visiveis = signal(['produto', 'itens']);
  protected readonly linhas = computed(() => {
    const f = this.filtro().trim().toLowerCase();
    return PEDIDOS.filter((p) => !f || p.cliente.toLowerCase().includes(f));
  });

  // ── Gráficos ──
  protected readonly meses = ['Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov'];
  protected readonly tipo = signal<ZurChartType>('bar');
  protected readonly tipos = [
    { value: 'bar', label: 'Barras' },
    { value: 'line', label: 'Linhas' },
    { value: 'area', label: 'Área' },
    { value: 'donut', label: 'Rosca' },
  ];
  protected readonly empilhado = signal(false);
  protected readonly duas: ZurChartSeries[] = [
    { name: 'Vendas', values: [12, 18, 9, 22, 17, 26] },
    { name: 'Custos', values: [8, 10, 7, 12, 11, 14] },
  ];
  protected readonly categorias = ['Folhagem', 'Suculentas', 'Flores', 'Vasos', 'Adubos'];
  protected readonly fatias: ZurChartSeries[] = [{ name: 'Pedidos', values: [48, 27, 15, 10, 6] }];
  protected readonly series = computed(() => (this.tipo() === 'donut' ? this.fatias : this.duas));
  protected readonly labels = computed(() => (this.tipo() === 'donut' ? this.categorias : this.meses));
  protected readonly reais = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v * 1000);

  protected readonly serie = [4, 6, 5, 9, 12, 11, 15, 14, 18, 21, 19, 24];
  protected readonly serieDevolucoes = [9, 8, 9, 7, 6, 7, 5, 6, 4, 4, 3, 3];

  // ── Tree ──
  protected readonly arvore: ZurTreeNode[] = [
    {
      id: 'plantas', label: 'Plantas', children: [
        { id: 'folhagem', label: 'Folhagem', children: [{ id: 'jiboia', label: 'Jiboia' }, { id: 'costela', label: 'Costela-de-adão' }, { id: 'samambaia', label: 'Samambaia' }] },
        { id: 'suculentas', label: 'Suculentas' },
        { id: 'flores', label: 'Flores', children: [{ id: 'orquidea', label: 'Orquídea' }] },
      ],
    },
    { id: 'vasos', label: 'Vasos e cachepôs', children: [{ id: 'barro', label: 'Barro' }, { id: 'ceramica', label: 'Cerâmica' }] },
    { id: 'adubos', label: 'Adubos' },
  ];
  protected readonly escolhida = signal<string[]>(['jiboia']);
  protected readonly abertos = signal<string[]>(['plantas', 'folhagem']);

  // ── Código ──
  protected readonly codeTableAdv = `<zur-column-menu [columns]="colunas" [(visible)]="visiveis" />

<table zur-table [(selected)]="selecionados" (filterChange)="filtro.set($event.value)">
  <thead>
    <tr>
      <th zurSelectAll></th>
      <th><span class="zur-sr-only">Detalhes</span></th>
      <th zurSortable="cliente">Cliente <zur-column-filter key="cliente" /></th>
      @if (visiveis().includes('produto')) { <th>Produto</th> }
    </tr>
  </thead>
  <tbody>
    @for (p of linhas(); track p.id) {
      <tr [zurRow]="p.id" #r="zurRow">
        <td zurSelect></td>
        <td><button zurExpandToggle></button></td>
        <td>{{ p.cliente }}</td>
        @if (visiveis().includes('produto')) { <td>{{ p.produto }}</td> }
      </tr>
      @if (r.expanded()) {
        <tr class="zur-row-detail"><td></td><td></td><td colspan="2">Detalhes de {{ p.id }}</td></tr>
      }
    }
  </tbody>
</table>`;

  protected readonly codeChart = `<zur-chart type="bar" label="Vendas e custos por mês" [labels]="meses"
  [series]="[{ name: 'Vendas', values: [12, 18, 9] }, { name: 'Custos', values: [8, 10, 7] }]"
  [valueFormat]="reais" stacked />

<!-- type: 'bar' | 'line' | 'area' | 'donut'. Até 6 séries; as cores são --zur-chart-1..6. -->`;

  protected readonly codeStat = `<zur-stat label="Pedidos" value="1.284" [delta]="12.4" deltaLabel="vs. mês anterior">
  <zur-sparkline zurStatChart label="Pedidos dos últimos 12 dias" [values]="serie" />
</zur-stat>

<zur-stat label="Devoluções" value="32" [delta]="-8" invert />  <!-- cair é bom -->`;

  protected readonly codeTimeline = `<ol zur-timeline label="Histórico do pedido">
  <li zur-timeline-heading>Hoje</li>
  <li zur-timeline-item title="Saiu para entrega" time="10:42" status="active">A caminho.</li>
  <li zur-timeline-item title="Pedido separado" time="08:30" status="success">Embalado.</li>
</ol>`;

  protected readonly codeTree = `<zur-tree label="Categorias" [nodes]="arvore" selection="single"
  [(selected)]="escolhida" [(expanded)]="abertos" />

<!-- Com um template por nó: -->
<ng-template zurTreeNode let-node let-expanded="expanded">…{{ node.label }}</ng-template>`;
}
