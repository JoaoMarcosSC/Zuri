import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  ZurButton,
  ZurCodeSnippet,
  ZurResizable,
  ZurRowSelect,
  ZurSearch,
  ZurSelectAll,
  ZurSortable,
  ZurTable,
  ZurTableRow,
  ZurTableSkeleton,
  ZurTableToolbar,
} from '@juau/zuri';
import { CodeBlock } from '../../shared/code-block/code-block';

/** Tabela com cabeçalho fixo, colunas redimensionáveis, barra de lote e carregamento; Code snippet. */
@Component({
  selector: 'docs-data-more',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CodeBlock, ZurButton, ZurCodeSnippet, ZurResizable, ZurRowSelect, ZurSearch, ZurSelectAll, ZurSortable,
    ZurTable, ZurTableRow, ZurTableSkeleton, ZurTableToolbar,
  ],
  templateUrl: './data-more.html',
  styleUrl: './componentes.css',
  styles: `
    :host {
      max-width: none;
      margin: 0;
    }
    .readout {
      margin: var(--zur-space-sm) 0 0;
      font: var(--zur-font-caption);
      color: var(--zur-muted);
    }
    .stack {
      display: grid;
      gap: var(--zur-space-md);
      width: 100%;
      max-width: 560px;
    }
  `,
})
export class DataMore {
  protected readonly carregando = signal(false);
  protected readonly marcadas = signal<string[]>([]);
  protected readonly larguras = signal<Record<string, number>>({});
  protected readonly pedidos = [
    { id: '1', cliente: 'Ana Silva', produto: 'Monstera deliciosa', total: 'R$ 129,00' },
    { id: '2', cliente: 'Bruno Costa', produto: 'Kit de suculentas', total: 'R$ 89,00' },
    { id: '3', cliente: 'Carla Dias', produto: 'Jiboia e vaso de barro', total: 'R$ 64,00' },
    { id: '4', cliente: 'Davi Lima', produto: 'Orquídea branca', total: 'R$ 110,00' },
    { id: '5', cliente: 'Eva Rocha', produto: 'Samambaia', total: 'R$ 52,00' },
    { id: '6', cliente: 'Caio Nunes', produto: 'Cacto mandacaru', total: 'R$ 38,00' },
    { id: '7', cliente: 'Lia Prado', produto: 'Costela-de-adão', total: 'R$ 74,00' },
  ];

  protected readonly codeTable = `<zur-table-toolbar [selectedCount]="marcadas().length" (clearSelection)="marcadas.set([])">
  <zur-search label="Buscar pedidos" />
  <button zurTableToolbarBatch zur-button size="sm" variant="danger">Excluir</button>
</zur-table-toolbar>

<!-- o contêiner com rolagem é seu: cabeçalho e 1ª coluna ficam fixos dentro dele -->
<div class="zur-table-scroll" style="max-height: 280px" tabindex="0" role="region" aria-label="Pedidos">
  <table zur-table stickyHeader stickyFirstColumn [(selected)]="marcadas" (columnResize)="salvarLargura($event)">
    <thead>
      <tr>
        <th zurSelectAll></th>
        <th zurSortable="cliente" zurResizable="cliente">Cliente</th>
        <th zurResizable="produto" [minWidth]="120" [maxWidth]="480">Produto</th>
        <th>Total</th>
      </tr>
    </thead>
    @if (carregando()) {
      <tbody zurTableSkeleton [rows]="6" [columns]="4"></tbody>
    } @else {
      <tbody>…</tbody>
    }
  </table>
</div>

// Redimensionar: arraste a alça ou use ← → (8 px; com Shift, 32 px). A largura sai em columnResize.`;

  protected readonly codeSnippet = `<zur-code-snippet language="bash" code="npm install @juau/zuri" />
<zur-code-snippet language="html" label="Exemplo" [code]="exemplo" />`;

  protected salvarLargura(e: { key: string; width: number }): void {
    this.larguras.update((l) => ({ ...l, [e.key]: e.width }));
  }

  protected resumo(): string {
    const l = this.larguras();
    const itens = Object.entries(l).map(([k, w]) => `${k}: ${w}px`);
    return itens.length ? itens.join(' · ') : 'ainda não redimensionou';
  }
}
