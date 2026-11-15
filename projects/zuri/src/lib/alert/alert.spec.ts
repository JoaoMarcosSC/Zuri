import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZurAlert } from './alert';

@Component({
  imports: [ZurAlert],
  template: `<zur-alert kind="success">Pedido confirmado.</zur-alert>`,
})
class Host {}

describe('ZurAlert', () => {
  it('tem role="alert" e expõe o tipo', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el = fixture.nativeElement.querySelector('zur-alert') as HTMLElement;
    expect(el.getAttribute('role')).toBe('alert');
    expect(el.dataset['kind']).toBe('success');
    expect(el.textContent).toContain('Pedido confirmado.');
  });
});
