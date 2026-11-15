import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZurBanner } from './banner';

@Component({
  imports: [ZurBanner],
  template: `
    <zur-banner kind="warning" dismissible [(open)]="aberto">
      Manutenção hoje às 22h.
      <a zurBannerAction href="#">Saiba mais</a>
    </zur-banner>
    <zur-banner kind="error">Sem conexão.</zur-banner>
  `,
})
class Host {
  aberto = signal(true);
}

describe('ZurBanner', () => {
  it('usa status e alert conforme a gravidade', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [warn, err] = Array.from(fixture.nativeElement.querySelectorAll('zur-banner')) as HTMLElement[];
    expect(warn.getAttribute('role')).toBe('status');
    expect(err.getAttribute('role')).toBe('alert');
    expect(warn.querySelector('.action a')?.textContent).toBe('Saiba mais');
    expect(err.querySelector('.close')).toBeNull();
  });

  it('o botão de fechar esconde a faixa e atualiza o two-way', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const warn = fixture.nativeElement.querySelector('zur-banner') as HTMLElement;
    const close = warn.querySelector('.close') as HTMLButtonElement;
    expect(close.getAttribute('aria-label')).toBe('Fechar');
    close.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.aberto()).toBe(false);
    expect(warn.hidden).toBe(true);
  });
});
