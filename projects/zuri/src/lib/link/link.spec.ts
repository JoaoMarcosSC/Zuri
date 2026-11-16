import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZurLink } from './link';

@Component({
  imports: [ZurLink],
  template: `
    <a zur-link id="interno" href="/entregas">Entregas</a>
    <a zur-link id="externo" external href="https://exemplo.com">Guia de rega</a>
  `,
})
class Host {}

describe('ZurLink', () => {
  it('link interno não muda target nem rel', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const a = fixture.nativeElement.querySelector('#interno') as HTMLAnchorElement;
    expect(a.getAttribute('target')).toBeNull();
    expect(a.getAttribute('rel')).toBeNull();
    expect(a.querySelector('zur-icon')).toBeNull();
  });

  it('link externo abre em outra aba com rel seguro, ícone e aviso para leitor de tela', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const a = fixture.nativeElement.querySelector('#externo') as HTMLAnchorElement;
    expect(a.getAttribute('target')).toBe('_blank');
    expect(a.getAttribute('rel')).toBe('noopener noreferrer');
    expect(a.querySelector('zur-icon')).not.toBeNull();
    const aviso = a.querySelector('.sr-only') as HTMLElement;
    expect(aviso.textContent).toContain('abre em nova aba');
    expect(getComputedStyle(aviso).position).toBe('absolute'); // oculto de verdade, não só com o nome certo
  });
});
