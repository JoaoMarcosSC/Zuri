import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideZuriI18n } from '../i18n/i18n';
import { ZurModal } from './modal';

@Component({
  imports: [ZurModal],
  template: `<zur-modal [(open)]="aberto" title="Confirmar">Conteúdo</zur-modal>`,
})
class Host {
  aberto = signal(true);
}

describe('ZurModal', () => {
  it('renderiza um dialog com título quando aberto', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const dialog = fixture.nativeElement.querySelector('[role=dialog]') as HTMLElement;
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute('aria-label')).toBe('Confirmar');
  });

  it('fecha com ESC e atualiza o two-way binding', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();
    expect(fixture.componentInstance.aberto()).toBe(false);
    expect(fixture.nativeElement.querySelector('[role=dialog]')).toBeNull();
  });

  it('o botão de fechar usa o texto do i18n (pt e en)', async () => {
    let fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[aria-label="Fechar"]')).toBeTruthy();

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideZuriI18n('en')] });
    fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[aria-label="Close"]')).toBeTruthy();
  });
});
