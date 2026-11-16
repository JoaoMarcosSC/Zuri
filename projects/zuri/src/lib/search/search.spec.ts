import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ZurSearch } from './search';

@Component({
  imports: [ZurSearch, ReactiveFormsModule],
  template: `<zur-search label="Buscar plantas" [debounceMs]="30" [formControl]="ctrl" (searchChange)="mudou.push($event)" (submitted)="enviou.push($event)" />`,
})
class Host {
  ctrl = new FormControl('');
  mudou: string[] = [];
  enviou: string[] = [];
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
  const type = async (text: string) => {
    input.value = text;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  };
  return { fixture, input, host: fixture.componentInstance, type };
}

describe('ZurSearch', () => {
  it('é um campo de busca com nome acessível e atualiza o formulário', async () => {
    const { input, host, type } = await setup();
    expect(input.type).toBe('search');
    expect(input.getAttribute('aria-label')).toBe('Buscar plantas');
    await type('jib');
    expect(host.ctrl.value).toBe('jib');
  });

  it('o debounce espera a pessoa parar de digitar', async () => {
    const { host, type } = await setup();
    await type('j');
    await type('ji');
    await type('jib');
    expect(host.mudou).toEqual([]);
    await wait(60);
    expect(host.mudou).toEqual(['jib']);
  });

  it('Enter emite na hora e Esc limpa, emitindo vazio', async () => {
    const { fixture, input, host, type } = await setup();
    await type('costela');
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(host.enviou).toEqual(['costela']);
    expect(host.mudou).toContain('costela');
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();
    expect(host.ctrl.value).toBe('');
    expect(host.mudou[host.mudou.length - 1]).toBe('');
  });

  it('o botão limpar só aparece com texto e tem nome acessível', async () => {
    const { fixture, type } = await setup();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.clear')).toBeNull();
    await type('x');
    const clear = el.querySelector('.clear') as HTMLButtonElement;
    expect(clear.getAttribute('aria-label')).toBe('Limpar');
    clear.click();
    await fixture.whenStable();
    expect(el.querySelector('.clear')).toBeNull();
  });
});
