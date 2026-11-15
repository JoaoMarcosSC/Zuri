import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZurTooltip } from './tooltip';

@Component({
  imports: [ZurTooltip],
  template: `<button zurTooltip="Salvar nos favoritos">♥</button>`,
})
class Host {}

describe('ZurTooltip', () => {
  it('aparece no foco com role="tooltip" e some no blur', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    btn.dispatchEvent(new Event('focus'));
    const tip = document.querySelector('[role=tooltip]') as HTMLElement;
    expect(tip?.textContent).toBe('Salvar nos favoritos');
    btn.dispatchEvent(new Event('blur'));
    expect(document.querySelector('[role=tooltip]')).toBeNull();
  });
});
