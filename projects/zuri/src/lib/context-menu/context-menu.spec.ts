import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZurMenuItem } from '../menu/menu';
import { ZurContextMenu, ZurContextMenuTrigger } from './context-menu';

@Component({
  imports: [ZurContextMenu, ZurContextMenuTrigger, ZurMenuItem],
  template: `
    <div id="area" tabindex="0" [zurContextMenu]="menu">Área</div>
    <button id="fora">fora</button>
    <zur-context-menu #menu>
      <zur-menu-item (selected)="escolhido = 'renomear'">Renomear</zur-menu-item>
      <zur-menu-item (selected)="escolhido = 'duplicar'">Duplicar</zur-menu-item>
      <zur-menu-item (selected)="escolhido = 'excluir'">Excluir</zur-menu-item>
    </zur-context-menu>
  `,
})
class Host {
  escolhido = '';
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const area = el.querySelector('#area') as HTMLElement;
  const panel = () => el.querySelector('[role=menu]') as HTMLElement | null;
  const items = () => Array.from(el.querySelectorAll('[role=menuitem]')) as HTMLElement[];
  const rightClick = async (target: Element, x = 40, y = 50) => {
    target.dispatchEvent(new MouseEvent('contextmenu', { clientX: x, clientY: y, bubbles: true, cancelable: true }));
    await fixture.whenStable();
    await fixture.whenStable();
  };
  const key = async (k: string, init: KeyboardEventInit = {}) => {
    (document.activeElement ?? document.body).dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }));
    await fixture.whenStable();
  };
  return { fixture, el, area, panel, items, rightClick, key, host: () => fixture.componentInstance };
}

describe('ZurContextMenu', () => {
  it('abre no ponteiro com role=menu e foca o primeiro item', async () => {
    const { area, panel, items, rightClick } = await setup();
    expect(area.getAttribute('aria-haspopup')).toBe('menu');
    await rightClick(area, 40, 50);
    expect(panel()).not.toBeNull();
    expect(panel()!.getAttribute('aria-label')).toBe('Menu de contexto');
    expect(panel()!.style.left).toBe('40px');
    expect(panel()!.style.top).toBe('50px');
    expect(document.activeElement).toBe(items()[0]);
  });

  it('setas navegam com volta e Home/End vão às pontas', async () => {
    const { area, items, rightClick, key } = await setup();
    await rightClick(area);
    await key('ArrowDown');
    expect(document.activeElement).toBe(items()[1]);
    await key('End');
    expect(document.activeElement).toBe(items()[2]);
    await key('ArrowDown');
    expect(document.activeElement).toBe(items()[0]);
    await key('ArrowUp');
    expect(document.activeElement).toBe(items()[2]);
  });

  it('Esc fecha e devolve o foco ao elemento de origem', async () => {
    const { area, panel, rightClick, key } = await setup();
    area.focus();
    await rightClick(area);
    await key('Escape');
    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(area);
  });

  it('Shift+F10 e a tecla Menu abrem pelo teclado', async () => {
    const { area, panel, key } = await setup();
    area.focus();
    await key('F10', { shiftKey: true });
    expect(panel()).not.toBeNull();
    await key('Escape');
    area.focus();
    await key('ContextMenu');
    expect(panel()).not.toBeNull();
  });

  it('escolher um item emite e fecha', async () => {
    const { fixture, area, items, panel, rightClick, host } = await setup();
    await rightClick(area);
    items()[1].click();
    await fixture.whenStable();
    expect(host().escolhido).toBe('duplicar');
    expect(panel()).toBeNull();
  });

  it('clicar fora fecha', async () => {
    const { fixture, el, area, panel, rightClick } = await setup();
    await rightClick(area);
    (el.querySelector('#fora') as HTMLElement).click();
    await fixture.whenStable();
    expect(panel()).toBeNull();
  });
});
