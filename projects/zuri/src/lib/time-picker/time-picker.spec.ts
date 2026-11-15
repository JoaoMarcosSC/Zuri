import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { provideZuriI18n } from '../i18n/i18n';
import { ZurTimePicker, zurTimeToMinutes } from './time-picker';

@Component({
  imports: [ZurTimePicker, ReactiveFormsModule],
  template: `<zur-time-picker label="Retirada" min="09:00" max="17:30" [minuteStep]="15" [formControl]="ctrl" />`,
})
class Host {
  ctrl = new FormControl<string | null>('10:15');
}

const tick = () => new Promise((r) => setTimeout(r));

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const field = el.querySelector('.field') as HTMLButtonElement;
  const open = async () => {
    field.click();
    await fixture.whenStable();
    await tick();
  };
  const opt = (col: string, value: number) => el.querySelector(`[data-col="${col}"] .option[data-value="${value}"]`) as HTMLButtonElement;
  return { fixture, el, field, open, opt, ctrl: () => fixture.componentInstance.ctrl };
}

describe('zurTimeToMinutes', () => {
  it('converte HH:mm e rejeita inválidos', () => {
    expect(zurTimeToMinutes('09:30')).toBe(570);
    expect(zurTimeToMinutes('24:00')).toBeNull();
    expect(zurTimeToMinutes('x')).toBeNull();
  });
});

describe('ZurTimePicker', () => {
  it('mostra o horário formatado no idioma (24h em pt-BR)', async () => {
    const { field } = await setup();
    expect(field.textContent).toContain('10:15');
  });

  it('abre com o foco na hora escolhida e lista minutos de 15 em 15', async () => {
    const { el, field, open } = await setup();
    await open();
    expect(field.getAttribute('aria-expanded')).toBe('true');
    expect((document.activeElement as HTMLElement).getAttribute('data-value')).toBe('10');
    expect(Array.from(el.querySelectorAll('[data-col=minute] .option')).map((b) => b.textContent?.trim())).toEqual(['00', '15', '30', '45']);
    expect(el.querySelectorAll('[role=listbox]').length).toBe(2);
  });

  it('desabilita horas e minutos fora do intervalo', async () => {
    const { fixture, open, opt } = await setup();
    await open();
    expect(opt('hour', 8).disabled).toBe(true);
    expect(opt('hour', 9).disabled).toBe(false);
    expect(opt('hour', 18).disabled).toBe(true);
    // às 17h só vale até 17:30
    opt('hour', 17).click();
    await fixture.whenStable();
    expect(opt('minute', 45).disabled).toBe(true);
    expect(opt('minute', 30).disabled).toBe(false);
  });

  it('escolher a hora e o minuto atualiza o formulário e fecha', async () => {
    const { fixture, field, open, opt, ctrl } = await setup();
    await open();
    opt('hour', 14).click();
    await fixture.whenStable();
    expect(ctrl().value).toBe('14:15');
    opt('minute', 45).click();
    await fixture.whenStable();
    expect(ctrl().value).toBe('14:45');
    expect(field.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(field);
  });

  it('teclado: setas andam na lista e entre listas', async () => {
    const { fixture, open } = await setup();
    await open();
    const press = async (k: string) => {
      (document.activeElement as HTMLElement).dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
      await fixture.whenStable();
    };
    await press('ArrowDown');
    expect((document.activeElement as HTMLElement).getAttribute('data-value')).toBe('11');
    await press('ArrowRight');
    expect((document.activeElement as HTMLElement).closest('[data-col]')?.getAttribute('data-col')).toBe('minute');
    expect((document.activeElement as HTMLElement).getAttribute('data-value')).toBe('15');
    await press('ArrowLeft');
    expect((document.activeElement as HTMLElement).closest('[data-col]')?.getAttribute('data-col')).toBe('hour');
  });

  it('em en-US usa 12h com coluna AM/PM', async () => {
    TestBed.configureTestingModule({ providers: [provideZuriI18n('en')] });
    const { fixture, el, field, open, ctrl } = await setup();
    expect(field.textContent).toMatch(/10:15\s?AM/);
    await open();
    expect(el.querySelectorAll('[role=listbox]').length).toBe(3);
    (el.querySelector('[data-col=period] .option[data-value="1"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(ctrl().value).toBe('22:15');
  });
});
