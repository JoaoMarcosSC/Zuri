import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZurTable } from '../table/table';
import { ZurDensityScope, ZurDensityService, ZurDensityToggle } from './density';

@Component({
  imports: [ZurDensityScope, ZurDensityToggle, ZurTable],
  template: `
    <zur-density-toggle />
    <section id="a" zurDensity>
      <table id="t1" zur-table><tbody><tr><td>x</td></tr></tbody></table>
      <table id="t2" zur-table density="comfortable"><tbody><tr><td>x</td></tr></tbody></table>
      <div id="b" zurDensity="comfortable"></div>
    </section>
  `,
})
class Host {}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-density');
});
afterEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-density');
});

describe('Densidade', () => {
  it('zurDensity marca só a área (compacto por padrão) e aceita voltar ao confortável', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('#a')?.getAttribute('data-density')).toBe('compact');
    expect(el.querySelector('#b')?.getAttribute('data-density')).toBe('comfortable');
    expect(document.documentElement.hasAttribute('data-density')).toBe(false);
  });

  it('o serviço aplica no <html>, persiste e alterna', () => {
    const service = TestBed.inject(ZurDensityService);
    expect(service.density()).toBe('comfortable');
    expect(document.documentElement.hasAttribute('data-density')).toBe(false);
    service.toggle();
    expect(service.density()).toBe('compact');
    expect(document.documentElement.getAttribute('data-density')).toBe('compact');
    expect(localStorage.getItem('zur-density')).toBe('compact');
    service.set('comfortable');
    expect(document.documentElement.hasAttribute('data-density')).toBe(false);
  });

  it('lembra a escolha da visita anterior', () => {
    localStorage.setItem('zur-density', 'compact');
    expect(TestBed.inject(ZurDensityService).density()).toBe('compact');
    expect(document.documentElement.getAttribute('data-density')).toBe('compact');
  });

  it('o botão alterna com aria-pressed e rótulo que descreve a ação', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const btn = fixture.nativeElement.querySelector('zur-density-toggle button') as HTMLButtonElement;
    expect(btn.getAttribute('aria-pressed')).toBe('false');
    expect(btn.getAttribute('aria-label')).toBe('Usar interface compacta');
    btn.click();
    await fixture.whenStable();
    expect(btn.getAttribute('aria-pressed')).toBe('true');
    expect(btn.getAttribute('aria-label')).toBe('Usar interface confortável');
  });

  it('a tabela herda a densidade da área, mas pode ser explícita', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('#t1')?.hasAttribute('data-density')).toBe(false); // herda pelo CSS
    expect(el.querySelector('#t2')?.getAttribute('data-density')).toBe('comfortable');
  });
});
