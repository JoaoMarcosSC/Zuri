import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZurPopover, ZurPopoverTrigger } from './popover';

@Component({
  imports: [ZurPopover, ZurPopoverTrigger],
  template: `
    <zur-popover label="Filtros" placement="bottom-end">
      <button id="gatilho" zurPopoverTrigger>Filtros</button>
      <label>Preço <input id="preco" /></label>
    </zur-popover>
    <p id="fora">Fora</p>
  `,
})
class Host {}

describe('ZurPopover', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const trigger = el.querySelector('#gatilho') as HTMLButtonElement;
    return { fixture, el, trigger };
  }

  it('o gatilho tem aria-haspopup/expanded e abre o painel ligado por aria-controls', async () => {
    const { fixture, el, trigger } = await setup();
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    trigger.click();
    await fixture.whenStable();
    const panel = el.querySelector('[role=dialog]') as HTMLElement;
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-controls')).toBe(panel.id);
    expect(panel.getAttribute('aria-label')).toBe('Filtros');
    expect(panel.dataset['placement']).toBe('bottom-end');
    expect(document.activeElement?.id).toBe('preco');
    fixture.nativeElement.remove();
  });

  it('fecha no clique fora', async () => {
    const { fixture, el, trigger } = await setup();
    trigger.click();
    await fixture.whenStable();
    (el.querySelector('#fora') as HTMLElement).click();
    await fixture.whenStable();
    expect(el.querySelector('[role=dialog]')).toBeNull();
    fixture.nativeElement.remove();
  });

  it('fecha com ESC e devolve o foco ao gatilho', async () => {
    const { fixture, el, trigger } = await setup();
    trigger.click();
    await fixture.whenStable();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();
    expect(el.querySelector('[role=dialog]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
    fixture.nativeElement.remove();
  });
});
