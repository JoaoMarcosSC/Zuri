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

  describe('foco', () => {
    @Component({
      imports: [ZurModal],
      template: `
        <button id="abrir" (click)="aberto.set(true)">Abrir</button>
        <zur-modal [(open)]="aberto" title="Confirmar">
          <button id="a">A</button>
          <div zurModalActions><button id="b">B</button></div>
        </zur-modal>
      `,
    })
    class FocusHost {
      aberto = signal(false);
    }

    const tab = (el: Element, shift = false) => {
      const e = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: shift, bubbles: true, cancelable: true });
      el.dispatchEvent(e);
      return e.defaultPrevented;
    };

    it('leva o foco para dentro, prende o Tab e devolve ao fechar', async () => {
      const fixture = TestBed.createComponent(FocusHost);
      await fixture.whenStable();
      const el = fixture.nativeElement as HTMLElement;
      const abrir = el.querySelector('#abrir') as HTMLButtonElement;
      abrir.focus();
      abrir.click();
      await fixture.whenStable();

      const dialog = el.querySelector('[role=dialog]') as HTMLElement;
      const close = dialog.querySelector('.x') as HTMLElement;
      expect(dialog.contains(document.activeElement)).toBe(true);
      expect(document.activeElement).toBe(close);

      // Tab no último foca o primeiro; Shift+Tab no primeiro foca o último
      (el.querySelector('#b') as HTMLElement).focus();
      expect(tab(dialog)).toBe(true);
      expect(document.activeElement).toBe(close);
      expect(tab(dialog, true)).toBe(true);
      expect(document.activeElement).toBe(el.querySelector('#b'));

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await fixture.whenStable();
      expect(fixture.componentInstance.aberto()).toBe(false);
      expect(document.activeElement).toBe(abrir);
    });
  });
});
