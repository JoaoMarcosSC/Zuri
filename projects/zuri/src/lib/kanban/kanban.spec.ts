import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZurKanban, ZurKanbanCard, ZurKanbanColumn, ZurKanbanMove, zurKanbanMove } from './kanban';

const initial = (): ZurKanbanColumn[] => [
  { id: 'todo', title: 'A fazer', items: [{ id: 'a', title: 'Regar' }, { id: 'b', title: 'Adubar' }] },
  { id: 'doing', title: 'Fazendo', items: [{ id: 'c', title: 'Podar' }] },
  { id: 'done', title: 'Feito', items: [] },
];

@Component({
  imports: [ZurKanban, ZurKanbanCard],
  template: `
    <zur-kanban [(columns)]="columns" addLabel="Adicionar" (moved)="moves.push($event)" (add)="added = $event">
      <ng-template zurKanbanCard let-item><strong class="t">{{ item.title }}</strong></ng-template>
    </zur-kanban>
  `,
})
class Host {
  columns = signal(initial());
  moves: ZurKanbanMove[] = [];
  added = '';
}

const ids = (cols: ZurKanbanColumn[]) => cols.map((c) => c.items.map((i) => i.id).join(','));
const tick = () => new Promise((r) => setTimeout(r));

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const card = (id: string) => el.querySelector(`.card[data-id="${id}"]`) as HTMLElement;
  const key = async (id: string, k: string) => {
    card(id).dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
    await fixture.whenStable();
    await tick();
  };
  const live = () => el.querySelector('[aria-live=assertive]')?.textContent?.trim();
  return { fixture, el, card, key, live };
}

describe('zurKanbanMove', () => {
  it('move entre colunas e dentro da coluna', () => {
    expect(ids(zurKanbanMove(initial(), 'a', 'done', 0)!.columns)).toEqual(['b', 'c', 'a']);
    expect(ids(zurKanbanMove(initial(), 'a', 'todo', 1)!.columns)).toEqual(['b,a', 'c', '']);
    expect(zurKanbanMove(initial(), 'a', 'todo', 0)).toBeNull();
  });
});

describe('ZurKanban', () => {
  it('renderiza colunas, contadores e o template do cartão', async () => {
    const { el } = await setup();
    expect(Array.from(el.querySelectorAll('.column-title')).map((t) => t.textContent)).toEqual(['A fazer', 'Fazendo', 'Feito']);
    expect(Array.from(el.querySelectorAll('.column-count')).map((t) => t.textContent)).toEqual(['2', '1', '0']);
    expect(el.querySelector('.card .t')?.textContent).toBe('Regar');
  });

  it('teclado: pega, move entre colunas e solta com anúncios', async () => {
    const { fixture, key, live, card } = await setup();
    await key('a', ' ');
    expect(live()).toBe('Regar pego. Coluna A fazer, posição 1.');
    await key('a', 'ArrowRight');
    expect(ids(fixture.componentInstance.columns())).toEqual(['b', 'a,c', '']);
    expect(live()).toBe('Regar: coluna Fazendo, posição 1.');
    expect(document.activeElement).toBe(card('a'));
    await key('a', 'ArrowDown');
    expect(ids(fixture.componentInstance.columns())).toEqual(['b', 'c,a', '']);
    await key('a', ' ');
    expect(live()).toBe('Regar solto na coluna Fazendo, posição 2.');
    expect(fixture.componentInstance.moves.length).toBe(2);
  });

  it('Esc desfaz o movimento', async () => {
    const { fixture, key, live } = await setup();
    await key('b', ' ');
    await key('b', 'ArrowRight');
    await key('b', 'ArrowRight');
    expect(ids(fixture.componentInstance.columns())).toEqual(['a', 'c', 'b']);
    await key('b', 'Escape');
    expect(ids(fixture.componentInstance.columns())).toEqual(['a,b', 'c', '']);
    expect(live()).toBe('Movimento de Adubar cancelado.');
  });

  it('botão de adicionar emite a coluna', async () => {
    const { fixture, el } = await setup();
    (el.querySelectorAll('.add')[2] as HTMLButtonElement).click();
    expect(fixture.componentInstance.added).toBe('done');
  });
});
