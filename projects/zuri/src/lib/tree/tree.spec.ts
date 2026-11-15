import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZurTree, ZurTreeNode } from './tree';

const NODES: ZurTreeNode[] = [
  { id: 'plantas', label: 'Plantas', children: [
    { id: 'folhagem', label: 'Folhagem', children: [{ id: 'jiboia', label: 'Jiboia' }, { id: 'costela', label: 'Costela-de-adão' }] },
    { id: 'suculentas', label: 'Suculentas' },
  ] },
  { id: 'vasos', label: 'Vasos' },
  { id: 'adubos', label: 'Adubos', disabled: true },
];

@Component({
  imports: [ZurTree],
  template: `<zur-tree label="Categorias" [nodes]="nodes" selection="single" [(selected)]="sel" [(expanded)]="open" (nodeToggle)="toggles.push($event.node.id + ':' + $event.expanded)" />`,
})
class Host {
  nodes = NODES;
  sel = signal<string[]>([]);
  open = signal<string[]>([]);
  toggles: string[] = [];
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const item = (id: string) => el.querySelector(`[data-id="${id}"]`) as HTMLElement;
  const ids = () => Array.from(el.querySelectorAll('[role=treeitem]')).map((i) => i.getAttribute('data-id'));
  const key = async (target: HTMLElement, k: string) => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
    await fixture.whenStable();
    await new Promise((r) => setTimeout(r));
  };
  return { fixture, el, item, ids, key, host: () => fixture.componentInstance };
}

describe('ZurTree', () => {
  it('segue o padrão ARIA tree com níveis e tamanhos', async () => {
    const { el, item } = await setup();
    const tree = el.querySelector('[role=tree]')!;
    expect(tree.getAttribute('aria-label')).toBe('Categorias');
    expect(item('plantas').getAttribute('aria-level')).toBe('1');
    expect(item('plantas').getAttribute('aria-expanded')).toBe('false');
    expect(item('vasos').hasAttribute('aria-expanded')).toBe(false);
    expect(item('vasos').getAttribute('aria-posinset')).toBe('2');
    expect(item('vasos').getAttribute('aria-setsize')).toBe('3');
    expect(item('plantas').tabIndex).toBe(0);
    expect(item('vasos').tabIndex).toBe(-1);
  });

  it('→ abre, → desce ao filho, ← sobe ao pai e fecha', async () => {
    const { item, ids, key, host } = await setup();
    item('plantas').focus();
    await key(item('plantas'), 'ArrowRight');
    expect(ids()).toEqual(['plantas', 'folhagem', 'suculentas', 'vasos', 'adubos']);
    expect(host().toggles).toEqual(['plantas:true']);
    await key(item('plantas'), 'ArrowRight');
    expect(document.activeElement).toBe(item('folhagem'));
    await key(item('folhagem'), 'ArrowLeft'); // fechado: sobe ao pai
    expect(document.activeElement).toBe(item('plantas'));
    await key(item('plantas'), 'ArrowLeft'); // aberto: fecha
    expect(ids()).toEqual(['plantas', 'vasos', 'adubos']);
  });

  it('↑↓, Home e End andam pelos nós visíveis', async () => {
    const { item, key } = await setup();
    item('plantas').focus();
    await key(item('plantas'), 'ArrowDown');
    expect(document.activeElement).toBe(item('vasos'));
    await key(item('vasos'), 'End');
    expect(document.activeElement).toBe(item('adubos'));
    await key(item('adubos'), 'Home');
    expect(document.activeElement).toBe(item('plantas'));
  });

  it('Enter seleciona (single) e nó desabilitado não seleciona', async () => {
    const { item, key, host, fixture } = await setup();
    item('vasos').focus();
    await key(item('vasos'), 'Enter');
    expect(host().sel()).toEqual(['vasos']);
    expect(item('vasos').getAttribute('aria-selected')).toBe('true');
    item('adubos').click();
    await fixture.whenStable();
    expect(host().sel()).toEqual(['vasos']);
  });

  it('* abre todos os irmãos e digitar uma letra salta para o nó', async () => {
    const { item, key, ids } = await setup();
    item('plantas').focus();
    await key(item('plantas'), '*');
    expect(ids()).toContain('folhagem');
    await key(item('plantas'), 'v');
    expect(document.activeElement).toBe(item('vasos'));
  });

  it('clique no nó com filhos abre/fecha quando não há seleção por clique no chevron', async () => {
    const { item, fixture, ids } = await setup();
    (item('plantas').querySelector('.chevron') as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await fixture.whenStable();
    expect(ids()).toContain('folhagem');
  });
});
