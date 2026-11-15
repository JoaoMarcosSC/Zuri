import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ZurOtpInput } from './otp-input';

@Component({
  imports: [ZurOtpInput, ReactiveFormsModule],
  template: `<zur-otp-input label="Código" [length]="4" [formControl]="ctrl" (completed)="done = $event" />`,
})
class Host {
  ctrl = new FormControl('');
  done = '';
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const boxes = () => Array.from(el.querySelectorAll('.box')) as HTMLInputElement[];
  const type = async (i: number, text: string) => {
    boxes()[i].value = text;
    boxes()[i].dispatchEvent(new Event('input'));
    await fixture.whenStable();
  };
  const key = async (i: number, k: string) => {
    boxes()[i].dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
    await fixture.whenStable();
  };
  return { fixture, el, boxes, type, key, host: () => fixture.componentInstance };
}

describe('ZurOtpInput', () => {
  it('cria uma caixa por dígito, cada uma com nome acessível', async () => {
    const { boxes } = await setup();
    expect(boxes().length).toBe(4);
    expect(boxes()[1].getAttribute('aria-label')).toBe('Dígito 2 de 4');
    expect(boxes()[0].getAttribute('autocomplete')).toBe('one-time-code');
  });

  it('digitar avança o foco e o valor sai do formulário; completar dispara o evento', async () => {
    const { boxes, type, host } = await setup();
    await type(0, '1');
    expect(document.activeElement).toBe(boxes()[1]);
    await type(1, '2');
    await type(2, '3');
    expect(host().ctrl.value).toBe('123');
    expect(host().done).toBe('');
    await type(3, '4');
    expect(host().ctrl.value).toBe('1234');
    expect(host().done).toBe('1234');
  });

  it('só a primeira caixa aceita o código inteiro (preenchimento automático de SMS)', async () => {
    const { boxes } = await setup();
    expect(boxes().map((b) => b.getAttribute('maxlength'))).toEqual(['4', '1', '1', '1']);
  });

  it('digitar por cima de um dígito existente troca só aquele dígito', async () => {
    const { boxes, type, host } = await setup();
    await type(0, '1');
    await type(1, '2');
    boxes()[0].focus();
    await type(0, '19'); // o dígito antigo (1) + o novo (9) chegam juntos
    expect(host().ctrl.value).toBe('92');
  });

  it('rejeita letras no modo numérico', async () => {
    const { boxes, type, host } = await setup();
    await type(0, 'a');
    expect(boxes()[0].value).toBe('');
    expect(host().ctrl.value).toBe('');
  });

  it('autopreenchimento com vários dígitos distribui pelas caixas', async () => {
    const { boxes, type, host } = await setup();
    await type(0, '9876');
    expect(boxes().map((b) => b.value)).toEqual(['9', '8', '7', '6']);
    expect(host().done).toBe('9876');
  });

  it('Backspace apaga e volta para a caixa anterior', async () => {
    const { boxes, type, key, host } = await setup();
    await type(0, '12');
    expect(document.activeElement).toBe(boxes()[2]);
    await key(2, 'Backspace');
    expect(document.activeElement).toBe(boxes()[1]);
    expect(host().ctrl.value).toBe('1');
  });

  it('mostra o valor do formulário (writeValue)', async () => {
    const { fixture, boxes, host } = await setup();
    host().ctrl.setValue('55');
    await fixture.whenStable();
    expect(boxes().map((b) => b.value)).toEqual(['5', '5', '', '']);
  });
});
