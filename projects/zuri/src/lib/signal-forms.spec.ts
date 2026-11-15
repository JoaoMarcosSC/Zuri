import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormField, disabled, form, required } from '@angular/forms/signals';
import { ZurCheckbox } from './checkbox/checkbox';
import { ZurChips } from './chips/chips';
import { ZurCombobox } from './combobox/combobox';
import { ZurDatePicker } from './date-picker/date-picker';
import { ZurInput } from './input/input';
import { ZurNumberInput } from './number-input/number-input';
import { ZurOtpInput } from './otp-input/otp-input';
import { ZurRadio } from './radio/radio';
import { ZurRating } from './rating/rating';
import { ZurSegmented } from './segmented/segmented';
import { ZurSelect } from './select/select';
import { ZurSlider } from './slider/slider';
import { ZurSwitch } from './switch/switch';
import { ZurTextarea } from './textarea/textarea';
import { ZurTimePicker } from './time-picker/time-picker';

/**
 * Formulários por sinais do Angular (`[formField]`): todos os controles do Zuri funcionam
 * sem adaptador, porque falam `ControlValueAccessor` e o Angular faz a ponte.
 */
@Component({
  imports: [
    FormField, ZurInput, ZurTextarea, ZurSelect, ZurCheckbox, ZurRadio, ZurSwitch, ZurCombobox,
    ZurDatePicker, ZurChips, ZurSlider, ZurSegmented, ZurNumberInput, ZurOtpInput, ZurRating, ZurTimePicker,
  ],
  template: `
    <zur-input label="Nome" [formField]="f.nome" />
    <zur-textarea label="Recado" [formField]="f.recado" />
    <zur-select label="Categoria" [options]="categorias" [formField]="f.categoria" />
    <zur-checkbox [formField]="f.aceito">Aceito</zur-checkbox>
    <zur-radio name="plano" value="mensal" [formField]="f.plano">Mensal</zur-radio>
    <zur-radio name="plano" value="anual" [formField]="f.plano">Anual</zur-radio>
    <zur-switch [formField]="f.avisos">Avisos</zur-switch>
    <zur-combobox label="Planta" [options]="plantas" [formField]="f.planta" />
    <zur-date-picker label="Entrega" [formField]="f.entrega" />
    <zur-chips label="Ambientes" [formField]="f.ambientes" />
    <zur-slider label="Altura" [min]="0" [max]="100" [formField]="f.altura" />
    <zur-segmented label="Visão" [options]="visoes" [formField]="f.visao" />
    <zur-number-input label="Qtd" [min]="0" [max]="10" [formField]="f.qtd" />
    <zur-otp-input label="Código" [length]="4" [formField]="f.codigo" />
    <zur-rating label="Nota" [formField]="f.nota" />
    <zur-time-picker label="Hora" [formField]="f.hora" />
  `,
})
class Host {
  categorias = [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }];
  plantas = [{ value: 'jiboia', label: 'Jiboia' }, { value: 'costela', label: 'Costela' }];
  visoes = [{ value: 'grade', label: 'Grade' }, { value: 'lista', label: 'Lista' }];
  travar = signal(false);

  model = signal({
    nome: 'Ana',
    recado: 'Olá',
    categoria: 'a',
    aceito: false,
    plano: 'mensal',
    avisos: false,
    planta: 'jiboia' as string | null,
    entrega: null as Date | null,
    ambientes: ['Sala'],
    altura: 20,
    visao: 'grade',
    qtd: 2 as number | null,
    codigo: '',
    nota: 3,
    hora: '09:30' as string | null,
  });

  f = form(this.model, (p) => {
    required(p.nome);
    disabled(p.categoria, () => this.travar());
  });
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const settle = async () => {
    await fixture.whenStable();
    await fixture.whenStable();
  };
  const q = <T extends Element>(sel: string) => el.querySelector(sel) as T;
  return { fixture, el, q, settle, host: () => fixture.componentInstance, model: () => fixture.componentInstance.model() };
}

describe('Signal Forms ([formField]) com os controles do Zuri', () => {
  it('modelo → tela: todos mostram o valor inicial', async () => {
    const { q, el } = await setup();
    expect(q<HTMLInputElement>('zur-input input').value).toBe('Ana');
    expect(q<HTMLTextAreaElement>('zur-textarea textarea').value).toBe('Olá');
    expect(q<HTMLSelectElement>('zur-select select').value).toBe('a');
    expect(q<HTMLInputElement>('zur-checkbox input').checked).toBe(false);
    expect(el.querySelector('zur-radio input:checked')?.closest('zur-radio')?.textContent).toContain('Mensal');
    expect(q<HTMLInputElement>('zur-combobox input').value).toBe('Jiboia');
    expect(Array.from(el.querySelectorAll('zur-chips .chip')).map((c) => c.textContent?.trim())).toEqual(['Sala']);
    expect(el.querySelector('zur-slider [role=slider]')?.getAttribute('aria-valuenow')).toBe('20');
    expect(el.querySelector('zur-segmented [aria-checked=true]')?.textContent?.trim()).toBe('Grade');
    expect(q<HTMLInputElement>('zur-number-input input').value).toBe('2');
    expect(el.querySelector('zur-rating [aria-checked=true]')?.getAttribute('aria-label')).toBe('3 estrelas');
    expect(q('zur-time-picker .field').textContent).toContain('09:30');
  });

  it('tela → modelo: digitar, marcar e escolher atualiza o signal', async () => {
    const { q, el, settle, model } = await setup();
    const input = q<HTMLInputElement>('zur-input input');
    input.value = 'Bia';
    input.dispatchEvent(new Event('input'));
    const area = q<HTMLTextAreaElement>('zur-textarea textarea');
    area.value = 'Oi!';
    area.dispatchEvent(new Event('input'));
    const select = q<HTMLSelectElement>('zur-select select');
    select.value = 'b';
    select.dispatchEvent(new Event('change'));
    q<HTMLInputElement>('zur-checkbox input').click();
    (el.querySelectorAll('zur-radio input')[1] as HTMLInputElement).click();
    q<HTMLButtonElement>('zur-switch button').click();
    await settle();
    expect(model().nome).toBe('Bia');
    expect(model().recado).toBe('Oi!');
    expect(model().categoria).toBe('b');
    expect(model().aceito).toBe(true);
    expect(model().plano).toBe('anual');
    expect(model().avisos).toBe(true);
  });

  it('tela → modelo: controles compostos (chips, segmented, número, nota, código)', async () => {
    const { q, el, settle, model } = await setup();
    const chips = q<HTMLInputElement>('zur-chips input');
    chips.value = 'Varanda';
    chips.dispatchEvent(new Event('input'));
    chips.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    (el.querySelectorAll('zur-segmented [role=radio]')[1] as HTMLElement).click();
    q<HTMLButtonElement>('zur-number-input .step:last-of-type').click();
    (el.querySelectorAll('zur-rating [role=radio]')[4] as HTMLElement).click();
    const slider = q('zur-slider [role=slider]');
    slider.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }));
    const otp = el.querySelectorAll<HTMLInputElement>('zur-otp-input .box');
    otp[0].value = '1234';
    otp[0].dispatchEvent(new Event('input'));
    await settle();
    expect(model().ambientes).toEqual(['Sala', 'Varanda']);
    expect(model().visao).toBe('lista');
    expect(model().qtd).toBe(3);
    expect(model().nota).toBe(5);
    expect(model().altura).toBe(100);
    expect(model().codigo).toBe('1234');
  });

  it('tela → modelo: combobox, data e hora', async () => {
    const { fixture, q, el, settle, model } = await setup();
    const combo = q<HTMLInputElement>('zur-combobox input');
    combo.value = 'cost';
    combo.dispatchEvent(new Event('input'));
    await settle();
    (el.querySelector('zur-combobox [role=option]') as HTMLElement).click();

    q<HTMLButtonElement>('zur-date-picker .field').click();
    await settle();
    (el.querySelector('zur-date-picker .day:not(:disabled)') as HTMLElement).click();

    q<HTMLButtonElement>('zur-time-picker .field').click();
    await settle();
    (el.querySelector('zur-time-picker [data-col=hour] .option[data-value="14"]') as HTMLElement).click();
    await settle();
    expect(model().planta).toBe('costela');
    expect(model().entrega).toBeInstanceOf(Date);
    expect(model().hora).toBe('14:30'); // só a hora mudou, os minutos ficam
    void fixture;
  });

  it('regras do formulário chegam aos controles (disabled)', async () => {
    const { q, settle, host } = await setup();
    expect(q<HTMLSelectElement>('zur-select select').disabled).toBe(false);
    host().travar.set(true);
    await settle();
    expect(q<HTMLSelectElement>('zur-select select').disabled).toBe(true);
  });

  it('o estado do formulário reflete a validação (required)', async () => {
    const { q, settle, host } = await setup();
    expect(host().f.nome().valid()).toBe(true);
    const input = q<HTMLInputElement>('zur-input input');
    input.value = '';
    input.dispatchEvent(new Event('input'));
    await settle();
    expect(host().f.nome().valid()).toBe(false);
    expect(host().f.nome().dirty()).toBe(true);
  });
});
