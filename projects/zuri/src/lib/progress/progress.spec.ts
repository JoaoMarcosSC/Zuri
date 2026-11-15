import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZurProgress } from './progress';

@Component({
  imports: [ZurProgress],
  template: `<zur-progress id="d" [value]="valor()" label="Enviando" /><zur-progress id="i" />`,
})
class Host {
  valor = signal(40);
}

describe('ZurProgress', () => {
  it('determinada: role progressbar com aria-valuenow e largura proporcional', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const d = fixture.nativeElement.querySelector('#d') as HTMLElement;
    expect(d.getAttribute('role')).toBe('progressbar');
    expect(d.getAttribute('aria-label')).toBe('Enviando');
    expect(d.getAttribute('aria-valuenow')).toBe('40');
    expect(d.getAttribute('aria-valuemax')).toBe('100');
    expect((d.querySelector('.fill') as HTMLElement).style.width).toBe('40%');
    fixture.componentInstance.valor.set(150);
    await fixture.whenStable();
    expect(d.getAttribute('aria-valuenow')).toBe('100');
  });

  it('indeterminada: sem aria-valuenow e com rótulo padrão do i18n', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const i = fixture.nativeElement.querySelector('#i') as HTMLElement;
    expect(i.hasAttribute('aria-valuenow')).toBe(false);
    expect(i.hasAttribute('data-indeterminate')).toBe(true);
    expect(i.getAttribute('aria-label')).toBe('Progresso');
  });
});
