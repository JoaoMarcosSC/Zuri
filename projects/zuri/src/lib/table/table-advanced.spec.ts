import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZurColumnFilter } from './column-filter';
import { ZurColumnMenu, ZurTableColumn } from './column-menu';
import {
  ZurColumnFilterChange,
  ZurExpandToggle,
  ZurRowSelect,
  ZurSelectAll,
  ZurSortable,
  ZurTable,
  ZurTableRow,
} from './table';

const PEDIDOS = [
  { id: 'p1', cliente: 'Ana', produto: 'Monstera' },
  { id: 'p2', cliente: 'Bruno', produto: 'Jiboia' },
  { id: 'p3', cliente: 'Carla', produto: 'Orquídea' },
];

@Component({
  imports: [ZurTable, ZurSortable, ZurSelectAll, ZurRowSelect, ZurExpandToggle, ZurTableRow, ZurColumnFilter],
  template: `
    <table zur-table [(selected)]="sel" (filterChange)="filtros.push($event)">
      <thead>
        <tr>
          <th zurSelectAll></th>
          <th></th>
          <th zurSortable="cliente">Cliente <zur-column-filter key="cliente" [debounce]="10" /></th>
          <th>Produto <zur-column-filter key="produto" label="Produto" [debounce]="10" /></th>
        </tr>
      </thead>
      <tbody>
        @for (p of pedidos; track p.id) {
          <tr [zurRow]="p.id" #r="zurRow">
            <td zurSelect></td>
            <td><button zurExpandToggle></button></td>
            <td>{{ p.cliente }}</td>
            <td>{{ p.produto }}</td>
          </tr>
          @if (r.expanded()) {
            <tr class="zur-row-detail"><td colspan="4">Detalhes de {{ p.id }}</td></tr>
          }
        }
      </tbody>
    </table>
  `,
})
class Host {
  pedidos = PEDIDOS;
  sel = signal<string[]>([]);
  filtros: ZurColumnFilterChange[] = [];
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const all = () => el.querySelector('th[zurSelectAll] input') as HTMLInputElement;
  const rowBox = (i: number) => el.querySelectorAll('td[zurSelect] input')[i] as HTMLInputElement;
  const settle = async () => {
    await fixture.whenStable();
    await fixture.whenStable();
  };
  return { fixture, el, all, rowBox, settle, host: () => fixture.componentInstance };
}

describe('Tabela avançada: seleção', () => {
  it('marca linhas, reflete em aria-selected e no "selecionar todas" indeterminado', async () => {
    const { el, all, rowBox, settle, host } = await setup();
    expect(all().getAttribute('aria-label')).toBe('Selecionar todas as linhas');
    expect(rowBox(0).getAttribute('aria-label')).toBe('Selecionar linha');
    rowBox(1).click();
    await settle();
    expect(host().sel()).toEqual(['p2']);
    expect(el.querySelector('tr[data-row=p2]')?.getAttribute('aria-selected')).toBe('true');
    expect(el.querySelector('tr[data-row=p1]')?.hasAttribute('aria-selected')).toBe(false);
    expect(all().indeterminate).toBe(true);
    expect(all().checked).toBe(false);
  });

  it('"selecionar todas" marca e desmarca todas', async () => {
    const { all, rowBox, settle, host } = await setup();
    all().click();
    await settle();
    expect(host().sel()).toEqual(['p1', 'p2', 'p3']);
    expect(all().checked).toBe(true);
    expect(all().indeterminate).toBe(false);
    expect(rowBox(2).checked).toBe(true);
    all().click();
    await settle();
    expect(host().sel()).toEqual([]);
  });

  it('desmarcar uma linha com todas marcadas deixa o cabeçalho indeterminado', async () => {
    const { all, rowBox, settle } = await setup();
    all().click();
    await settle();
    rowBox(0).click();
    await settle();
    expect(all().checked).toBe(false);
    expect(all().indeterminate).toBe(true);
  });
});

describe('Tabela avançada: linha expansível', () => {
  it('o botão abre e fecha o detalhe com aria-expanded e rótulo', async () => {
    const { el, settle } = await setup();
    const btn = el.querySelector('button[zurExpandToggle]') as HTMLButtonElement;
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    expect(btn.getAttribute('aria-label')).toBe('Expandir linha');
    btn.click();
    await settle();
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    expect(btn.getAttribute('aria-label')).toBe('Recolher linha');
    expect(el.querySelector('.zur-row-detail')?.textContent).toContain('Detalhes de p1');
    btn.click();
    await settle();
    expect(el.querySelector('.zur-row-detail')).toBeNull();
  });
});

describe('Tabela avançada: filtro por coluna', () => {
  it('emite o texto digitado depois da pausa, com nome acessível', async () => {
    const { el, settle, host } = await setup();
    const trigger = el.querySelectorAll('zur-column-filter .filter')[1] as HTMLButtonElement;
    expect(trigger.getAttribute('aria-label')).toBe('Filtrar Produto');
    trigger.click();
    await settle();
    const field = el.querySelector('zur-column-filter .field') as HTMLInputElement;
    field.value = 'jib';
    field.dispatchEvent(new Event('input'));
    await new Promise((r) => setTimeout(r, 40));
    expect(host().filtros).toEqual([{ key: 'produto', value: 'jib' }]);
    await settle();
    expect(trigger.classList).toContain('active');
  });

  it('o nome vem do cabeçalho quando não há label e Limpar zera o filtro', async () => {
    const { el, settle, host } = await setup();
    const trigger = el.querySelector('zur-column-filter .filter') as HTMLButtonElement;
    expect(trigger.getAttribute('aria-label')).toBe('Filtrar Cliente');
    trigger.click();
    await settle();
    const field = el.querySelector('zur-column-filter .field') as HTMLInputElement;
    field.value = 'an';
    field.dispatchEvent(new Event('input'));
    field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await settle();
    expect(host().filtros.at(-1)).toEqual({ key: 'cliente', value: 'an' });
    (el.querySelector('zur-column-filter .clear') as HTMLButtonElement).click();
    await settle();
    expect(host().filtros.at(-1)).toEqual({ key: 'cliente', value: '' });
  });
});

@Component({
  imports: [ZurColumnMenu],
  template: `<zur-column-menu [columns]="colunas" [(visible)]="visiveis" />`,
})
class MenuHost {
  colunas: ZurTableColumn[] = [
    { key: 'cliente', label: 'Cliente' },
    { key: 'produto', label: 'Produto' },
    { key: 'itens', label: 'Itens' },
  ];
  visiveis = signal(['cliente', 'produto', 'itens']);
}

describe('ZurColumnMenu', () => {
  async function menu() {
    const fixture = TestBed.createComponent(MenuHost);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    (el.querySelector('.trigger') as HTMLButtonElement).click();
    await fixture.whenStable();
    await fixture.whenStable();
    const box = (i: number) => el.querySelectorAll('zur-checkbox input')[i] as HTMLInputElement;
    return { fixture, el, box, host: () => fixture.componentInstance };
  }

  it('lista as colunas e oculta/mostra mantendo a ordem', async () => {
    const { fixture, box, host } = await menu();
    expect(box(0).checked).toBe(true);
    box(1).click();
    await fixture.whenStable();
    expect(host().visiveis()).toEqual(['cliente', 'itens']);
    box(1).click();
    await fixture.whenStable();
    expect(host().visiveis()).toEqual(['cliente', 'produto', 'itens']);
  });

  it('não deixa ocultar a última coluna', async () => {
    const { fixture, box, host } = await menu();
    host().visiveis.set(['itens']);
    await fixture.whenStable();
    await fixture.whenStable();
    expect(box(2).disabled).toBe(true);
    expect(host().visiveis()).toEqual(['itens']);
  });
});
