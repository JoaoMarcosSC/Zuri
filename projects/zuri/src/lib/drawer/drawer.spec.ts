import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZurDrawer } from './drawer';

@Component({
  imports: [ZurDrawer],
  template: `
    <button id="abrir" (click)="aberto.set(true)">Filtros</button>
    <zur-drawer [(open)]="aberto" title="Filtros" side="left">
      <input id="campo" />
      <button id="ultimo">Aplicar</button>
    </zur-drawer>
  `,
})
class Host {
  aberto = signal(false);
}

describe('ZurDrawer', () => {
  async function open() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const trigger = fixture.nativeElement.querySelector('#abrir') as HTMLButtonElement;
    trigger.focus();
    trigger.click();
    await fixture.whenStable();
    return { fixture, trigger, el: fixture.nativeElement as HTMLElement };
  }

  it('abre como dialog modal, com título, lado e foco no primeiro controle', async () => {
    const { el } = await open();
    const dialog = el.querySelector('[role=dialog]') as HTMLElement;
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-label')).toBe('Filtros');
    expect(el.querySelector('zur-drawer')?.getAttribute('data-side')).toBe('left');
    // o primeiro focável é o botão de fechar (no cabeçalho)
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Fechar');
  });

  it('o Tab fica preso dentro do painel', async () => {
    const { el } = await open();
    const ultimo = el.querySelector('#ultimo') as HTMLButtonElement;
    ultimo.focus();
    ultimo.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Fechar');
  });

  it('fecha com ESC e devolve o foco ao gatilho', async () => {
    const { fixture, trigger, el } = await open();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();
    expect(fixture.componentInstance.aberto()).toBe(false);
    expect(el.querySelector('[role=dialog]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
    fixture.nativeElement.remove();
  });

  it('fecha no clique do fundo', async () => {
    const { fixture, el } = await open();
    (el.querySelector('.scrim') as HTMLElement).click();
    await fixture.whenStable();
    expect(fixture.componentInstance.aberto()).toBe(false);
    fixture.nativeElement.remove();
  });
});
