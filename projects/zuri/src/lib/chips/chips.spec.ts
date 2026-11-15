import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ZurChips } from './chips';

@Component({
  imports: [ZurChips, ReactiveFormsModule],
  template: `<zur-chips label="Ambientes" [max]="3" [formControl]="ctrl" />`,
})
class Host {
  ctrl = new FormControl<string[]>(['Sala']);
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
  return { fixture, el, input, type, key };
}

describe('ZurChips', () => {
  it('Enter e vírgula adicionam; repetidos são ignorados', async () => {
    const { fixture, type, key } = await setup();
    await type('Varanda');
    await key('Enter');
    await type('sala,Cozinha,');
    expect(fixture.componentInstance.ctrl.value).toEqual(['Sala', 'Varanda', 'Cozinha']);
  });

  it('respeita o máximo e Backspace remove o último', async () => {
    const { fixture, input, type, key } = await setup();
    await type('A,B,C,');
    expect(fixture.componentInstance.ctrl.value).toEqual(['Sala', 'A', 'B']);
    expect(input.disabled).toBe(true);
    input.disabled = false;
    await key('Backspace');
    expect(fixture.componentInstance.ctrl.value).toEqual(['Sala', 'A']);
  });

  it('remove pelo botão com rótulo acessível', async () => {
    const { fixture, el } = await setup();
    const btn = el.querySelector('.remove') as HTMLButtonElement;
    expect(btn.getAttribute('aria-label')).toBe('Remover Sala');
    btn.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.ctrl.value).toEqual([]);
  });
});
