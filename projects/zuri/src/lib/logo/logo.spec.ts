import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZurLogo } from './logo';

@Component({
  imports: [ZurLogo],
  template: `<zur-logo id="h" [size]="32" /><zur-logo id="s" variant="symbol" [size]="24" />`,
})
class Host {}

describe('ZurLogo', () => {
  it('horizontal e símbolo usam viewBox e tamanho certos, com rótulo acessível', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const h = fixture.nativeElement.querySelector('#h') as HTMLElement;
    const s = fixture.nativeElement.querySelector('#s') as HTMLElement;
    expect(h.getAttribute('role')).toBe('img');
    expect(h.getAttribute('aria-label')).toBe('Zuri');
    expect(h.querySelector('svg')?.getAttribute('viewBox')).toBe('8 0 130 64');
    expect(h.querySelector('svg')?.getAttribute('height')).toBe('32');
    expect(s.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 64 64');
    expect(s.querySelector('svg')?.getAttribute('width')).toBe('24');
  });

  it('variant="auto" fora de um layout continua horizontal', async () => {
    @Component({ imports: [ZurLogo], template: `<zur-logo variant="auto" />` })
    class AutoHost {}
    const fixture = TestBed.createComponent(AutoHost);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('svg')?.getAttribute('viewBox')).toBe('8 0 130 64');
  });
});
