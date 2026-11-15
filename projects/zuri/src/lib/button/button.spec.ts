import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZurButton } from './button';

@Component({
  imports: [ZurButton],
  template: `
    <button zur-button id="padrao">Padrão</button>
    <button zur-button id="pill" variant="pill" size="sm">Pill</button>
    <a zur-button id="link" href="#" variant="secondary">Link</a>
  `,
})
class Host {}

describe('ZurButton', () => {
  it('expõe variante e tamanho como data-attributes (padrão primary/md)', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el = (id: string) => fixture.nativeElement.querySelector('#' + id) as HTMLElement;
    expect(el('padrao').dataset['variant']).toBe('primary');
    expect(el('padrao').dataset['size']).toBe('md');
    expect(el('pill').dataset['variant']).toBe('pill');
    expect(el('pill').dataset['size']).toBe('sm');
    expect(el('link').tagName).toBe('A');
    expect(el('link').dataset['variant']).toBe('secondary');
  });
});
