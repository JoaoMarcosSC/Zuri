import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZurMenu, ZurMenuItem } from './menu';

@Component({
  imports: [ZurMenu, ZurMenuItem],
  template: `
    <zur-menu>
      <button zurMenuTrigger id="trigger">Opções</button>
      <zur-menu-item (selected)="escolhido = 'editar'">Editar</zur-menu-item>
    </zur-menu>
    <p id="fora">fora</p>
  `,
})
class Host {
  escolhido = '';
}

describe('ZurMenu', () => {
  it('abre no gatilho, emite selected e fecha com ESC', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[role=menu]')).toBeNull();
    (el.querySelector('#trigger') as HTMLElement).click();
    await fixture.whenStable();
    expect(el.querySelector('[role=menu]')).toBeTruthy();
    (el.querySelector('[role=menuitem]') as HTMLElement).click();
    expect(fixture.componentInstance.escolhido).toBe('editar');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();
    expect(el.querySelector('[role=menu]')).toBeNull();
  });
});
