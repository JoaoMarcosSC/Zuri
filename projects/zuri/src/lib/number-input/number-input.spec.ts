import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ZurNumberInput, zurParseNumber } from './number-input';

@Component({
  imports: [ZurNumberInput, ReactiveFormsModule],
  template: `<zur-number-input label="Quantidade" [min]="1" [max]="10" [step]="1" [formControl]="ctrl" />`,
})
class Host {
  ctrl = new FormControl<number | null>(5);
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const input = el.querySelector('input') as HTMLInputElement;
  const [minus, plus] = Array.from(el.querySelectorAll('.step')) as HTMLButtonElement[];
  const key = async (k: string) => {
    input.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
    await fixture.whenStable();
  };
  return { fixture, el, input, minus, plus, key, ctrl: () => fixture.componentInstance.ctrl };
}

describe('zurParseNumber', () => {
  it('entende vírgula, ponto e milhar', () => {
    expect(zurParseNumber('12,5')).toBe(12.5);
    expect(zurParseNumber('12.5')).toBe(12.5);
    expect(zurParseNumber('1.234,5')).toBe(1234.5);
    expect(zurParseNumber('1,234.5')).toBe(1234.5);
    expect(zurParseNumber('1.234.567')).toBe(1234567);
    expect(zurParseNumber('-3')).toBe(-3);
    expect(zurParseNumber('abc')).toBeNull();
  });
});

describe('ZurNumberInput', () => {
  it('é um spinbutton com valores acessíveis', async () => {
    const { input } = await setup();
    expect(input.getAttribute('role')).toBe('spinbutton');
    expect(input.getAttribute('aria-valuenow')).toBe('5');
    expect(input.getAttribute('aria-valuemin')).toBe('1');
    expect(input.getAttribute('aria-valuemax')).toBe('10');
    expect(input.value).toBe('5');
  });

  it('botões e setas mudam o valor e respeitam os limites', async () => {
    const { plus, minus, key, ctrl } = await setup();
    plus.click();
    expect(ctrl().value).toBe(6);
    await key('ArrowUp');
    expect(ctrl().value).toBe(7);
    await key('PageUp');
    expect(ctrl().value).toBe(10); // limitado ao máximo
    expect(plus.disabled).toBe(true);
    await key('Home');
    expect(ctrl().value).toBe(1);
    expect(minus.disabled).toBe(true);
  });

  it('lê o que foi digitado ao sair do campo e limita ao intervalo', async () => {
    const { fixture, input, ctrl } = await setup();
    input.value = '99';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
    expect(ctrl().value).toBe(10);
    expect(input.value).toBe('10');
    input.value = '';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
    expect(ctrl().value).toBeNull();
  });

  it('desabilita pelo formulário', async () => {
    const { fixture, input, minus, ctrl } = await setup();
    ctrl().disable();
    await fixture.whenStable();
    expect(input.disabled).toBe(true);
    expect(minus.disabled).toBe(true);
  });
});
