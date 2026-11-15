import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ZurCombobox, ZurComboboxOption } from './combobox';

@Component({
  imports: [ZurCombobox, ReactiveFormsModule],
  template: `<zur-combobox label="Planta" [options]="options" [formControl]="ctrl" />`,
})
class Host {
  options: ZurComboboxOption[] = [
    { value: 'jiboia', label: 'Jiboia' },
    { value: 'costela', label: 'Costela-de-adão' },
    { value: 'orquidea', label: 'Orquídea' },
  ];
  ctrl = new FormControl<string | null>('jiboia');
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const input = el.querySelector('input') as HTMLInputElement;
  const type = async (text: string) => {
    input.value = text;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  };
  const key = async (k: string) => {
    input.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
    await fixture.whenStable();
  };
  const options = () => Array.from(el.querySelectorAll('[role=option]')).map((o) => o.querySelector('.option-label')!.textContent!.trim());
  return { fixture, el, input, type, key, options };
}

describe('ZurCombobox', () => {
  it('mostra o rótulo do valor inicial', async () => {
    const { input } = await setup();
    expect(input.value).toBe('Jiboia');
    expect(input.getAttribute('role')).toBe('combobox');
    expect(input.getAttribute('aria-expanded')).toBe('false');
  });

  it('filtra ignorando acentos e por iniciais', async () => {
    const { type, options, input } = await setup();
    await type('orquidea');
    expect(options()).toEqual(['Orquídea']);
    expect(input.getAttribute('aria-expanded')).toBe('true');
    await type('cda');
    expect(options()).toEqual(['Costela-de-adão']);
  });

  it('escolhe com setas e Enter e atualiza o formulário', async () => {
    const { fixture, type, key, input } = await setup();
    await type('i'); // Jiboia, Orquídea
    await key('ArrowDown');
    expect(input.getAttribute('aria-activedescendant')).toMatch(/-opt-1$/);
    await key('Enter');
    expect(fixture.componentInstance.ctrl.value).toBe('orquidea');
    expect(input.value).toBe('Orquídea');
    expect(input.getAttribute('aria-expanded')).toBe('false');
  });

  it('avisa quando não há resultado e Esc restaura o texto', async () => {
    const { el, type, key, input } = await setup();
    await type('cacto');
    expect(el.querySelector('.empty')?.textContent?.trim()).toBe('Nenhum resultado');
    await key('Escape');
    expect(input.value).toBe('Jiboia');
  });

  it('limpa o valor pelo botão', async () => {
    const { fixture, el, input } = await setup();
    (el.querySelector('.clear') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(fixture.componentInstance.ctrl.value).toBeNull();
    expect(input.value).toBe('');
  });
});
