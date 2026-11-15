import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { ZurPagination } from '../lib/pagination/pagination';
import { ZurSortable, ZurTable } from '../lib/table/table';

const meta: Meta = {
  title: 'Dados',
  decorators: [moduleMetadata({ imports: [ZurTable, ZurSortable, ZurPagination] })],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

const LINHAS = `
  <tr><td>Ana Silva</td><td>Monstera deliciosa</td><td>3</td></tr>
  <tr><td>João Marcos</td><td>Samambaia americana</td><td>7</td></tr>
  <tr><td>Maria Costa</td><td>Zamioculca</td><td>2</td></tr>
`;

export const Tabela: Story = {
  render: () => ({
    props: { ultima: '' },
    template: `
      <table zur-table (sortChange)="ultima = $event.key + ' ' + $event.direction">
        <thead>
          <tr><th zurSortable="nome">Cliente</th><th zurSortable="produto">Produto</th><th>Itens</th></tr>
        </thead>
        <tbody>${LINHAS}</tbody>
      </table>
      <p style="font:var(--zur-font-caption); color:var(--zur-muted);">Última ordenação: {{ ultima || 'nenhuma' }}</p>
    `,
  }),
};

export const TabelaCompacta: Story = {
  name: 'Tabela compacta',
  render: () => ({
    template: `
      <table zur-table density="compact">
        <thead><tr><th>Cliente</th><th>Produto</th><th>Itens</th></tr></thead>
        <tbody>${LINHAS}</tbody>
      </table>
    `,
  }),
};

export const Paginacao: Story = {
  name: 'Paginação',
  render: () => ({
    props: { pagina: 6 },
    template: `
      <zur-pagination [total]="248" [pageSize]="20" [(page)]="pagina" />
      <p style="font:var(--zur-font-caption); color:var(--zur-muted);">Página {{ pagina }}</p>
    `,
  }),
};
