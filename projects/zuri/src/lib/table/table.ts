import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

export type ZurTableDensity = 'comfortable' | 'compact';
export type ZurSortDirection = 'asc' | 'desc';

export interface ZurSort {
  key: string;
  direction: ZurSortDirection;
}

/**
 * Estilo do Zuri para uma `<table>` nativa: cabeçalho em caption, linhas com
 * hairline, hover e densidade. A ordenação fica com você: marque as colunas com
 * `zurSortable` e reaja ao `sortChange`.
 *
 * ```html
 * <table zur-table (sortChange)="ordenar($event)">
 *   <thead>
 *     <tr><th zurSortable="nome">Nome</th><th>Destino</th></tr>
 *   </thead>
 *   <tbody>…</tbody>
 * </table>
 * ```
 */
@Component({
  selector: 'table[zur-table]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // As linhas e células vêm do template de quem usa, então os estilos precisam ser
  // globais; todos ficam presos ao seletor table[zur-table].
  encapsulation: ViewEncapsulation.None,
  host: { class: 'zur-table', '[attr.data-density]': 'density()' },
  template: `<ng-content />`,
  styles: `
    table.zur-table {
      width: 100%;
      border-collapse: collapse;
      font: var(--zur-font-body-sm);
      color: var(--zur-body);
    }
    table.zur-table th,
    table.zur-table td {
      padding: var(--zur-space-sm) var(--zur-space-md);
      text-align: left;
      border-bottom: 1px solid var(--zur-hairline-soft);
    }
    table.zur-table[data-density='compact'] th,
    table.zur-table[data-density='compact'] td {
      padding: var(--zur-space-xs) var(--zur-space-sm);
    }
    table.zur-table thead th {
      font: var(--zur-font-caption);
      color: var(--zur-muted);
      text-transform: uppercase;
      letter-spacing: 0.4px;
      border-bottom-color: var(--zur-hairline);
      white-space: nowrap;
    }
    table.zur-table tbody tr {
      transition: background-color 120ms ease;
    }
    table.zur-table tbody tr:hover {
      background: var(--zur-surface-soft);
    }
    table.zur-table tbody td {
      color: var(--zur-ink);
    }
    table.zur-table .zur-sort {
      display: inline-flex;
      align-items: center;
      gap: var(--zur-space-xxs);
      padding: 0;
      border: 0;
      background: none;
      font: inherit;
      color: inherit;
      text-transform: inherit;
      letter-spacing: inherit;
      cursor: pointer;
    }
    table.zur-table .zur-sort:hover {
      color: var(--zur-ink);
    }
    table.zur-table .zur-sort:focus-visible {
      outline: none;
      border-radius: var(--zur-radius-xs);
      box-shadow: var(--zur-focus-ring);
    }
    table.zur-table th[aria-sort='ascending'] .zur-sort,
    table.zur-table th[aria-sort='descending'] .zur-sort {
      color: var(--zur-ink);
    }
  `,
})
export class ZurTable {
  readonly density = input<ZurTableDensity>('comfortable');
  /** Emite a coluna e a direção sempre que o usuário ordena. */
  readonly sortChange = output<ZurSort>();

  readonly sort = signal<ZurSort | null>(null);

  toggleSort(key: string): void {
    const current = this.sort();
    const direction: ZurSortDirection =
      current?.key === key && current.direction === 'asc' ? 'desc' : 'asc';
    const next = { key, direction };
    this.sort.set(next);
    this.sortChange.emit(next);
  }
}

/** Torna um `<th>` ordenável dentro de `table[zur-table]`. O valor é a chave da coluna. */
@Component({
  selector: 'th[zurSortable]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.aria-sort]': 'ariaSort()' },
  template: `
    <button type="button" class="zur-sort" (click)="table.toggleSort(zurSortable())">
      <ng-content />
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        @switch (ariaSort()) {
          @case ('ascending') { <path d="m6 15 6-6 6 6" /> }
          @case ('descending') { <path d="m6 9 6 6 6-6" /> }
          @default { <path d="m8 10 4-4 4 4M8 14l4 4 4-4" /> }
        }
      </svg>
    </button>
  `,
})
export class ZurSortable {
  protected readonly table = inject(ZurTable);
  readonly zurSortable = input.required<string>();

  protected readonly ariaSort = computed(() => {
    const s = this.table.sort();
    if (!s || s.key !== this.zurSortable()) return 'none';
    return s.direction === 'asc' ? 'ascending' : 'descending';
  });
}
