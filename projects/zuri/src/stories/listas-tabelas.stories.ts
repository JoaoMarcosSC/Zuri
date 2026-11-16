import { Component, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { FormsModule } from '@angular/forms';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ZurAvatar } from '../lib/avatar/avatar';
import { ZurBadge } from '../lib/badge/badge';
import { ZurButton } from '../lib/button/button';
import { ZurCodeSnippet } from '../lib/code-snippet/code-snippet';
import { ZurList, ZurListItem } from '../lib/list/list';
import { ZurSearch } from '../lib/search/search';
import { ZurRowSelect, ZurSelectAll, ZurSortable, ZurTable, ZurTableRow } from '../lib/table/table';
import { ZurResizable, ZurTableSkeleton, ZurTableToolbar } from '../lib/table/table-extras';

@Component({
  selector: 'demo-tabela',
  imports: [ZurTable, ZurSortable, ZurResizable, ZurTableRow, ZurRowSelect, ZurSelectAll, ZurTableToolbar, ZurTableSkeleton, ZurSearch, ZurButton],
  template: `
    <zur-table-toolbar [selectedCount]="marcadas().length" (clearSelection)="marcadas.set([])">
      <zur-search label="Buscar pedidos" style="width:280px" />
      <button zurTableToolbarBatch zur-button size="sm" variant="danger">Excluir</button>
      <button zurTableToolbarBatch zur-button size="sm" variant="secondary">Exportar</button>
    </zur-table-toolbar>
    <div class="zur-table-scroll" style="max-height:240px" tabindex="0" role="region" aria-label="Pedidos">
      <table zur-table stickyHeader stickyFirstColumn [(selected)]="marcadas">
        <thead>
          <tr>
            <th zurSelectAll></th>
            <th zurSortable="cliente" zurResizable="cliente">Cliente</th>
            <th zurResizable="produto">Produto</th>
            <th>Total</th>
          </tr>
        </thead>
        @if (carregando()) {
          <tbody zurTableSkeleton [rows]="6" [columns]="4"></tbody>
        } @else {
          <tbody>
            @for (p of pedidos; track p.id) {
              <tr [zurRow]="p.id">
                <td zurSelect></td>
                <td>{{ p.cliente }}</td>
                <td>{{ p.produto }}</td>
                <td>{{ p.total }}</td>
              </tr>
            }
          </tbody>
        }
      </table>
    </div>
    <button zur-button variant="ghost" size="sm" style="margin-top:12px" (click)="carregando.set(!carregando())">
      {{ carregando() ? 'Mostrar dados' : 'Simular carregamento' }}
    </button>
  `,
})
class DemoTabela {
  carregando = signal(false);
  marcadas = signal<string[]>([]);
  pedidos = [
    { id: '1', cliente: 'Ana Silva', produto: 'Monstera deliciosa', total: 'R$ 129,00' },
    { id: '2', cliente: 'Bruno Costa', produto: 'Kit suculentas', total: 'R$ 89,00' },
    { id: '3', cliente: 'Carla Dias', produto: 'Jiboia + vaso', total: 'R$ 64,00' },
    { id: '4', cliente: 'Davi Lima', produto: 'Orquídea', total: 'R$ 110,00' },
    { id: '5', cliente: 'Eva Rocha', produto: 'Samambaia', total: 'R$ 52,00' },
    { id: '6', cliente: 'Caio Nunes', produto: 'Cacto mandacaru', total: 'R$ 38,00' },
  ];
}

const meta: Meta = {
  title: 'Listas e tabelas',
  decorators: [
    moduleMetadata({ imports: [FormsModule, DemoTabela, ZurList, ZurListItem, ZurAvatar, ZurBadge, ZurCodeSnippet] }),
  ],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

export const Lista: Story = {
  render: () => ({
    template: `
      <div style="max-width:480px">
        <zur-list label="Pedidos recentes" contained divided>
          <zur-list-item>
            <zur-avatar zurListLeading name="Ana Silva" size="sm" />
            Pedido 42
            <span zurListSecondary>Monstera deliciosa e vaso de barro</span>
            <zur-badge zurListTrailing color="success">Enviado</zur-badge>
          </zur-list-item>
          <zur-list-item>
            <zur-avatar zurListLeading name="Bruno Costa" size="sm" />
            Pedido 41
            <span zurListSecondary>Kit de suculentas</span>
            <zur-badge zurListTrailing color="warning">Separando</zur-badge>
          </zur-list-item>
          <zur-list-item interactive>
            Ver todos os pedidos
          </zur-list-item>
        </zur-list>
      </div>
    `,
  }),
};

export const ListaSelecionavel: Story = {
  render: () => ({
    props: { entrega: 'normal', extras: ['vaso'] },
    template: `
      <div style="display:grid; gap:24px; max-width:480px">
        <zur-list label="Tipo de entrega" selection="single" contained divided [(ngModel)]="entrega">
          <zur-list-item value="retirar">Retirar na loja<span zurListSecondary>Grátis · hoje</span></zur-list-item>
          <zur-list-item value="normal">Entrega normal<span zurListSecondary>R$ 12 · 3 dias úteis</span></zur-list-item>
          <zur-list-item value="expressa" disabled>Expressa<span zurListSecondary>Indisponível no seu CEP</span></zur-list-item>
        </zur-list>
        <zur-list label="Extras" selection="multiple" contained divided [(ngModel)]="extras">
          <zur-list-item value="vaso">Vaso de barro</zur-list-item>
          <zur-list-item value="adubo">Adubo orgânico</zur-list-item>
        </zur-list>
        <p id="saida" style="margin:0">{{ entrega }} · {{ extras.join(',') }}</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('option', { name: /Retirar na loja/ }));
    await userEvent.click(canvas.getByRole('option', { name: /Adubo orgânico/ }));
    await waitFor(() => expect(canvasElement.querySelector('#saida')?.textContent).toBe('retirar · vaso,adubo'));
  },
};

export const TabelaAvancada: Story = {
  render: () => ({ template: `<div style="max-width:760px"><demo-tabela /></div>` }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getAllByRole('checkbox', { name: 'Selecionar linha' })[0]);
    await waitFor(() => expect(canvasElement.querySelector('zur-table-toolbar')?.hasAttribute('data-batch')).toBe(true));
    await expect(canvas.getByRole('button', { name: 'Excluir' })).toBeTruthy();
    const alca = canvas.getByRole('separator', { name: 'Redimensionar coluna Cliente' });
    alca.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(Number(alca.getAttribute('aria-valuenow'))).toBeGreaterThan(0);
  },
};

export const CodeSnippet: Story = {
  render: () => ({
    template: `
      <div style="display:grid; gap:16px; max-width:560px">
        <zur-code-snippet language="bash" code="npm install @juau/zuri" />
        <zur-code-snippet language="html" label="Exemplo de botão" code='<button zur-button variant="primary">Comprar</button>' />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('button', { name: 'Copiar' }).length).toBe(2);
  },
};
