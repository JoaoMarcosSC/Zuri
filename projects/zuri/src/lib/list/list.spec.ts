import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ZurList, ZurListItem } from './list';

@Component({
  imports: [ZurList, ZurListItem, ReactiveFormsModule],
  template: `
    <zur-list id="plain" label="Pedidos">
      <zur-list-item>
        <span zurListLeading>★</span>
        Pedido 1
        <span zurListSecondary>Monstera</span>
        <span zurListTrailing>R$ 90</span>
      </zur-list-item>
      <zur-list-item interactive (click)="cliques = cliques + 1">Pedido 2</zur-list-item>
    </zur-list>

    <zur-list id="single" label="Entrega" selection="single" [formControl]="entrega">
      <zur-list-item value="a">Retirar</zur-list-item>
      <zur-list-item value="b" disabled>Expressa</zur-list-item>
      <zur-list-item value="c">Normal</zur-list-item>
    </zur-list>

    <zur-list id="multi" label="Extras" selection="multiple" [(value)]="extras">
      <zur-list-item value="x">Vaso</zur-list-item>
      <zur-list-item value="y">Adubo</zur-list-item>
    </zur-list>
  `,
})
class Host {
  cliques = 0;
  entrega = new FormControl<string | null>(null);
  extras = signal<string | string[] | null>([]);
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const items = (id: string) => Array.from(el.querySelectorAll(`#${id} zur-list-item`)) as HTMLElement[];
  const key = async (target: HTMLElement, k: string) => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
    await fixture.whenStable();
  };
  return { fixture, el, host: fixture.componentInstance, items, key };
}

describe('ZurList', () => {
  it('lista simples: role list, slots e linha interativa como botão', async () => {
    const { fixture, el, host, items } = await setup();
    expect(el.querySelector('#plain')?.getAttribute('role')).toBe('list');
    const [a, b] = items('plain');
    expect(a.getAttribute('role')).toBe('listitem');
    expect(a.querySelector('.leading')?.textContent).toBe('★');
    expect(a.querySelector('.secondary')?.textContent).toBe('Monstera');
    expect(a.querySelector('.trailing')?.textContent).toBe('R$ 90');
    expect(b.querySelector('.leading')?.textContent).toBe('');
    expect(a.querySelector('button')).toBeNull();
    const btn = b.querySelector('button.row') as HTMLButtonElement;
    btn.click();
    await fixture.whenStable();
    expect(host.cliques).toBe(1);
  });

  it('single: listbox com option, aria-selected e formulário; item desabilitado é ignorado', async () => {
    const { fixture, el, host, items, key } = await setup();
    expect(el.querySelector('#single')?.getAttribute('role')).toBe('listbox');
    const [a, b, c] = items('single');
    expect(a.getAttribute('role')).toBe('option');
    expect(b.getAttribute('aria-disabled')).toBe('true');
    a.click();
    await fixture.whenStable();
    expect(host.entrega.value).toBe('a');
    expect(a.getAttribute('aria-selected')).toBe('true');
    b.click();
    await fixture.whenStable();
    expect(host.entrega.value).toBe('a');
    await key(a, 'ArrowDown'); // pula o desabilitado
    expect(document.activeElement).toBe(c);
    await key(c, 'Enter');
    expect(host.entrega.value).toBe('c');
    expect(a.getAttribute('aria-selected')).toBe('false');
  });

  it('roving tabindex: só um item recebe o Tab', async () => {
    const { fixture, host, items } = await setup();
    const [a, , c] = items('single');
    expect([a, c].map((i) => i.getAttribute('tabindex'))).toEqual(['0', '-1']); // nada escolhido: o primeiro
    host.entrega.setValue('c');
    await fixture.whenStable();
    expect([a, c].map((i) => i.getAttribute('tabindex'))).toEqual(['-1', '0']);
  });

  it('multiple alterna com Espaço e atualiza o two-way', async () => {
    const { fixture, el, host, items, key } = await setup();
    expect(el.querySelector('#multi')?.getAttribute('aria-multiselectable')).toBe('true');
    const [x, y] = items('multi');
    x.focus();
    await key(x, ' ');
    await key(y, ' ');
    expect(host.extras()).toEqual(['x', 'y']);
    await key(x, ' ');
    expect(host.extras()).toEqual(['y']);
    await key(y, 'Home');
    expect(document.activeElement).toBe(x);
  });
});
