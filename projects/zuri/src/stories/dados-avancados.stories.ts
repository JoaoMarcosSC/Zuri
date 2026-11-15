import { Component, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ZurChart, ZurChartSeries } from '../lib/chart/chart';
import { ZurSparkline } from '../lib/chart/sparkline';
import { ZurStat } from '../lib/chart/stat';
import { ZurColumnFilter } from '../lib/table/column-filter';
import { ZurColumnMenu, ZurTableColumn } from '../lib/table/column-menu';
import { ZurExpandToggle, ZurRowSelect, ZurSelectAll, ZurSortable, ZurTable, ZurTableRow } from '../lib/table/table';
import { ZurTimeline, ZurTimelineItem } from '../lib/timeline/timeline';
import { ZurTree, ZurTreeNode, ZurTreeNodeTemplate } from '../lib/tree/tree';

const PEDIDOS = [
  { id: 'p1', cliente: 'Ana Silva', produto: 'Monstera deliciosa', itens: 3 },
  { id: 'p2', cliente: 'Bruno Costa', produto: 'Kit de suculentas', itens: 5 },
  { id: 'p3', cliente: 'Carla Dias', produto: 'Orquídea branca', itens: 1 },
  { id: 'p4', cliente: 'Diego Melo', produto: 'Jiboia em cachepô', itens: 2 },
];

@Component({
  selector: 'demo-tabela',
  imports: [ZurTable, ZurSortable, ZurSelectAll, ZurRowSelect, ZurExpandToggle, ZurTableRow, ZurColumnFilter, ZurColumnMenu],
  template: `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px">
      <span style="color:var(--zur-body)">{{ selecionados().length }} selecionado(s)</span>
      <zur-column-menu [columns]="colunas" [(visible)]="visiveis" />
    </div>
    <table zur-table [(selected)]="selecionados" (filterChange)="filtro.set($event.value)">
      <thead>
        <tr>
          <th zurSelectAll></th>
          <th><span class="zur-sr-only">Detalhes</span></th>
          <th zurSortable="cliente">Cliente <zur-column-filter key="cliente" label="Cliente" /></th>
          @if (visiveis().includes('produto')) { <th>Produto</th> }
          @if (visiveis().includes('itens')) { <th>Itens</th> }
        </tr>
      </thead>
      <tbody>
        @for (p of filtrados(); track p.id) {
          <tr [zurRow]="p.id" #r="zurRow">
            <td zurSelect></td>
            <td><button zurExpandToggle></button></td>
            <td>{{ p.cliente }}</td>
            @if (visiveis().includes('produto')) { <td>{{ p.produto }}</td> }
            @if (visiveis().includes('itens')) { <td>{{ p.itens }}</td> }
          </tr>
          @if (r.expanded()) {
            <tr class="zur-row-detail"><td></td><td></td><td colspan="3">Entrega prevista para amanhã, 14h–18h. Pedido {{ p.id }}.</td></tr>
          }
        }
      </tbody>
    </table>
  `,
})
class DemoTabela {
  readonly selecionados = signal<string[]>([]);
  readonly filtro = signal('');
  readonly colunas: ZurTableColumn[] = [
    { key: 'produto', label: 'Produto' },
    { key: 'itens', label: 'Itens' },
  ];
  readonly visiveis = signal(['produto', 'itens']);
  filtrados() {
    const f = this.filtro().toLowerCase();
    return PEDIDOS.filter((p) => !f || p.cliente.toLowerCase().includes(f));
  }
}

const ARVORE: ZurTreeNode[] = [
  { id: 'plantas', label: 'Plantas', children: [
    { id: 'folhagem', label: 'Folhagem', children: [{ id: 'jiboia', label: 'Jiboia' }, { id: 'costela', label: 'Costela-de-adão' }] },
    { id: 'suculentas', label: 'Suculentas' },
  ] },
  { id: 'vasos', label: 'Vasos e cachepôs', children: [{ id: 'barro', label: 'Barro' }, { id: 'ceramica', label: 'Cerâmica' }] },
  { id: 'adubos', label: 'Adubos' },
];

const VENDAS: ZurChartSeries[] = [
  { name: 'Vendas', values: [12, 18, 9, 22, 17, 26] },
  { name: 'Custos', values: [8, 10, 7, 12, 11, 14] },
];
const MESES = ['Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov'];

const meta: Meta = {
  title: 'Dados/Avançados',
  decorators: [
    moduleMetadata({
      imports: [DemoTabela, ZurTimeline, ZurTimelineItem, ZurTree, ZurTreeNodeTemplate, ZurChart, ZurStat, ZurSparkline],
    }),
  ],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

export const TabelaAvancada: Story = {
  name: 'Tabela avançada',
  render: () => ({ template: `<demo-tabela />` }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getAllByRole('checkbox', { name: 'Selecionar linha' })[1]);
    await expect(canvas.getByText('1 selecionado(s)')).toBeTruthy();
    await userEvent.click(canvas.getAllByRole('button', { name: 'Expandir linha' })[0]);
    await expect(canvas.getByText(/Entrega prevista/)).toBeTruthy();
  },
};

export const Timeline: Story = {
  render: () => ({
    template: `
      <ol zur-timeline label="Histórico do pedido #1042" style="max-width:480px">
        <li zur-timeline-heading>Hoje</li>
        <li zur-timeline-item title="Saiu para entrega" time="10:42" status="active">O entregador está a caminho.</li>
        <li zur-timeline-item title="Pedido separado" time="08:30" status="success">Embalagem reforçada para a Monstera.</li>
        <li zur-timeline-heading>Ontem</li>
        <li zur-timeline-item title="Pagamento aprovado" time="18:05" status="success">Pix confirmado.</li>
        <li zur-timeline-item title="Endereço sem número" time="17:48" status="warning">Pedimos a confirmação ao cliente.</li>
        <li zur-timeline-item title="Pedido criado" time="17:40">Carrinho com 2 itens.</li>
      </ol>
    `,
  }),
};

export const Tree: Story = {
  render: () => ({
    props: { nodes: ARVORE, sel: ['jiboia'], open: ['plantas', 'folhagem'] },
    template: `
      <div style="max-width:320px">
        <zur-tree label="Categorias da loja" [nodes]="nodes" selection="single" [(selected)]="sel" [(expanded)]="open" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('treeitem', { name: 'Vasos e cachepôs' }).querySelector('.chevron')!);
    await expect(canvas.getByRole('treeitem', { name: 'Barro' })).toBeTruthy();
  },
};

export const Graficos: Story = {
  name: 'Gráficos',
  render: () => ({
    props: { series: VENDAS, meses: MESES, uma: [VENDAS[0]], fatias: [{ name: 'Pedidos', values: [48, 27, 15, 10] }], cats: ['Folhagem', 'Suculentas', 'Flores', 'Vasos'] },
    template: `
      <div style="display:grid; gap:32px; max-width:760px">
        <zur-chart type="bar" label="Vendas e custos por mês (em milhares de reais)" [labels]="meses" [series]="series" />
        <zur-chart type="bar" label="Vendas empilhadas" [labels]="meses" [series]="series" stacked />
        <zur-chart type="line" label="Evolução das vendas" [labels]="meses" [series]="series" />
        <zur-chart type="area" label="Vendas acumuladas" [labels]="meses" [series]="uma" />
        <zur-chart type="donut" label="Pedidos" [labels]="cats" [series]="fatias" [height]="240" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getAllByRole('img', { name: /^Jun:/ })[0];
    first.focus();
    await waitFor(() => expect(canvasElement.querySelector('.tooltip .tip-title')?.textContent).toBe('Jun'));
  },
};

export const KPIs: Story = {
  name: 'KPI e sparkline',
  render: () => ({
    props: { serie: [4, 6, 5, 9, 12, 11, 15, 14, 18, 21, 19, 24] },
    template: `
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:16px; max-width:820px">
        <zur-stat label="Pedidos no mês" value="1.284" [delta]="12.4" deltaLabel="vs. mês anterior">
          <zur-sparkline zurStatChart label="Pedidos dos últimos 12 dias" [values]="serie" />
        </zur-stat>
        <zur-stat label="Devoluções" value="32" [delta]="-8" invert deltaLabel="vs. mês anterior">
          <zur-sparkline zurStatChart slot="3" label="Devoluções dos últimos 12 dias" [values]="[9,8,9,7,6,7,5,6,4,4,3,3]" />
        </zur-stat>
        <zur-stat label="Ticket médio" value="R$ 84" [delta]="0" />
      </div>
    `,
  }),
};
