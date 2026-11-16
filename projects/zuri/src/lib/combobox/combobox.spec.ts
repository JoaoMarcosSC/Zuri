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

@Component({
  imports: [ZurCombobox, ReactiveFormsModule],
  template: `<zur-combobox label="Ambientes" multiple [options]="options" [formControl]="ctrl" />`,
})
class MultiHost {
  options: ZurComboboxOption[] = [
    { value: 'sala', label: 'Sala' },
    { value: 'varanda', label: 'Varanda' },
    { value: 'quarto', label: 'Quarto' },
  ];
  ctrl = new FormControl<string[]>(['sala']);
}

describe('ZurCombobox multiple', () => {
  async function setupMulti() {
    const fixture = TestBed.createComponent(MultiHost);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector('input') as HTMLInputElement;
    const key = async (k: string) => {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
      await fixture.whenStable();
    };
    const tags = () => Array.from(el.querySelectorAll('.tag-label')).map((t) => t.textContent!.trim());
    const list = el.querySelector('[role=listbox]') as HTMLElement;
    return { fixture, el, input, key, tags, list, ctrl: fixture.componentInstance.ctrl };
  }

  it('mostra os valores iniciais como chips e marca a lista como multiselecionável', async () => {
    const { tags, list, el } = await setupMulti();
    expect(tags()).toEqual(['Sala']);
    expect(list.getAttribute('aria-multiselectable')).toBe('true');
    expect(el.querySelector('[role=option][aria-selected=true]')?.textContent).toContain('Sala');
  });

  it('escolher com setas e Enter adiciona sem fechar a lista e atualiza o formulário', async () => {
    const { key, tags, input, ctrl, list } = await setupMulti();
    input.click(); // abre a lista com o primeiro item ativo
    await key('ArrowDown'); // Varanda
    await key('Enter');
    expect(ctrl.value).toEqual(['sala', 'varanda']);
    expect(tags()).toEqual(['Sala', 'Varanda']);
    expect(list.hidden).toBe(false);
  });

  it('clicar numa opção já marcada desmarca', async () => {
    const { fixture, el, ctrl, input } = await setupMulti();
    input.click();
    await fixture.whenStable();
    (el.querySelector('[role=option]') as HTMLElement).click(); // Sala
    await fixture.whenStable();
    expect(ctrl.value).toEqual([]);
    expect(el.querySelectorAll('.tag').length).toBe(0);
  });

  it('o botão do chip remove com rótulo acessível e Backspace remove o último', async () => {
    const { fixture, el, key, ctrl, input, tags } = await setupMulti();
    ctrl.setValue(['sala', 'quarto']);
    await fixture.whenStable();
    const remove = el.querySelectorAll('.tag-remove')[1] as HTMLButtonElement;
    expect(remove.getAttribute('aria-label')).toBe('Remover Quarto');
    remove.click();
    await fixture.whenStable();
    expect(ctrl.value).toEqual(['sala']);
    input.value = '';
    await key('Backspace');
    expect(ctrl.value).toEqual([]);
    expect(tags()).toEqual([]);
  });

  it('Esc com a lista fechada não apaga as escolhas e o botão limpar zera tudo', async () => {
    const { fixture, el, key, ctrl } = await setupMulti();
    await key('Escape');
    expect(ctrl.value).toEqual(['sala']);
    (el.querySelector('.clear') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(ctrl.value).toEqual([]);
  });

  it('anuncia a escolha para leitores de tela', async () => {
    const { fixture, el, key, input } = await setupMulti();
    input.click();
    await key('ArrowDown');
    await key('Enter');
    await fixture.whenStable();
    expect(el.querySelector('[aria-live=polite]')?.textContent).toContain('Varanda selecionado');
  });
});
