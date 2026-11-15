import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZurCommand, ZurCommandPalette } from './command-palette';

@Component({
  imports: [ZurCommandPalette],
  template: `
    <button id="before">antes</button>
    <zur-command-palette [commands]="commands" [(open)]="open" (selected)="ran = $event.id" />
  `,
})
class Host {
  open = signal(false);
  ran = '';
  commands: ZurCommand[] = [
    { id: 'plantas', label: 'Ver plantas', group: 'Páginas' },
    { id: 'pedidos', label: 'Meus pedidos', group: 'Páginas', keywords: ['compras'] },
    { id: 'novo', label: 'Novo pedido', group: 'Ações', shortcut: ['N'] },
    { id: 'tema', label: 'Alternar tema', group: 'Ações', description: 'Claro ou escuro' },
  ];
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const ctrlK = async () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
    await fixture.whenStable();
  };
  const field = () => el.querySelector('input[role=combobox]') as HTMLInputElement;
  const key = async (k: string) => {
    field().dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
    await fixture.whenStable();
  };
  const type = async (text: string) => {
    field().value = text;
    field().dispatchEvent(new Event('input'));
    await fixture.whenStable();
  };
  const labels = () => Array.from(el.querySelectorAll('[role=option] .label')).map((l) => l.textContent?.trim());
  return { fixture, el, ctrlK, field, key, type, labels };
}

describe('ZurCommandPalette', () => {
  it('abre com Ctrl+K, foca a busca e agrupa', async () => {
    const { fixture, el, ctrlK, field } = await setup();
    (el.querySelector('#before') as HTMLButtonElement).focus();
    await ctrlK();
    expect(fixture.componentInstance.open()).toBe(true);
    expect(document.activeElement).toBe(field());
    expect(Array.from(el.querySelectorAll('.group')).map((g) => g.textContent?.trim())).toEqual(['Páginas', 'Ações']);
  });

  it('filtra por rótulo, palavra-chave e descrição', async () => {
    const { ctrlK, type, labels } = await setup();
    await ctrlK();
    await type('compras');
    expect(labels()).toEqual(['Meus pedidos']);
    await type('escuro');
    expect(labels()).toEqual(['Alternar tema']);
    await type('xyz');
    expect(labels()).toEqual([]);
  });

  it('setas + Enter executam e devolvem o foco', async () => {
    const { fixture, el, ctrlK, key, field } = await setup();
    const before = el.querySelector('#before') as HTMLButtonElement;
    before.focus();
    await ctrlK();
    await key('ArrowDown');
    await key('ArrowDown');
    expect(field().getAttribute('aria-activedescendant')).toMatch(/-opt-2$/);
    await key('Enter');
    expect(fixture.componentInstance.ran).toBe('novo');
    expect(fixture.componentInstance.open()).toBe(false);
    expect(document.activeElement).toBe(before);
  });

  it('Esc fecha', async () => {
    const { fixture, ctrlK, key } = await setup();
    await ctrlK();
    await key('Escape');
    expect(fixture.componentInstance.open()).toBe(false);
  });
});
