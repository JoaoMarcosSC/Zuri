import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZurFab, ZurIconButton } from './icon-button';

@Component({
  imports: [ZurIconButton, ZurFab],
  template: `
    <button zur-icon-button label="Excluir" variant="secondary" size="sm">x</button>
    <button zur-fab label="Novo pedido">+</button>
    <button zur-fab extended>Novo pedido</button>
  `,
})
class Host {}

describe('ZurIconButton e ZurFab', () => {
  it('o botão de ícone usa o label como nome acessível', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const btn = fixture.nativeElement.querySelector('[zur-icon-button]') as HTMLElement;
    expect(btn.getAttribute('aria-label')).toBe('Excluir');
    expect(btn.getAttribute('type')).toBe('button');
    expect(btn.getAttribute('data-variant')).toBe('secondary');
    expect(btn.getAttribute('data-size')).toBe('sm');
  });

  it('o FAB compacto leva aria-label e o estendido mostra o texto', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [compact, extended] = Array.from(fixture.nativeElement.querySelectorAll('[zur-fab]')) as HTMLElement[];
    expect(compact.getAttribute('aria-label')).toBe('Novo pedido');
    expect(compact.hasAttribute('data-extended')).toBe(false);
    expect(extended.getAttribute('aria-label')).toBeNull();
    expect(extended.hasAttribute('data-extended')).toBe(true);
  });
});
