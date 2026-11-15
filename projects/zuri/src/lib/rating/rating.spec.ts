import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ZurRating } from './rating';

@Component({
  imports: [ZurRating, ReactiveFormsModule],
  template: `
    <zur-rating label="Sua nota" [formControl]="ctrl" />
    <zur-rating readonly [value]="4.5" />
  `,
})
class Host {
  ctrl = new FormControl<number | null>(3);
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const [edit, read] = Array.from(fixture.nativeElement.querySelectorAll('zur-rating')) as HTMLElement[];
  return { fixture, edit, read, ctrl: () => fixture.componentInstance.ctrl };
}

describe('ZurRating', () => {
  it('editável: radiogroup com a nota do formulário marcada', async () => {
    const { edit } = await setup();
    expect(edit.getAttribute('role')).toBe('radiogroup');
    const radios = Array.from(edit.querySelectorAll('[role=radio]'));
    expect(radios.length).toBe(5);
    expect(radios.map((r) => r.getAttribute('aria-checked'))).toEqual(['false', 'false', 'true', 'false', 'false']);
    expect(radios[0].getAttribute('aria-label')).toBe('1 estrela');
    expect(radios[2].getAttribute('tabindex')).toBe('0');
  });

  it('clique e setas mudam a nota (com limites)', async () => {
    const { fixture, edit, ctrl } = await setup();
    (edit.querySelectorAll('[role=radio]')[4] as HTMLElement).click();
    await fixture.whenStable();
    expect(ctrl().value).toBe(5);
    edit.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();
    expect(ctrl().value).toBe(5); // já no máximo
    edit.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    await fixture.whenStable();
    expect(ctrl().value).toBe(4);
    edit.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    await fixture.whenStable();
    expect(ctrl().value).toBe(1);
  });

  it('readonly: imagem com texto e estrela parcial', async () => {
    const { read } = await setup();
    expect(read.getAttribute('role')).toBe('img');
    expect(read.getAttribute('aria-label')).toBe('4,5 de 5');
    const clips = Array.from(read.querySelectorAll('clipPath rect')).map((r) => Number(r.getAttribute('width')));
    expect(clips).toEqual([24, 24, 24, 24, 12]);
    expect(read.querySelector('button')).toBeNull();
  });

  it('desabilita pelo formulário', async () => {
    const { fixture, edit, ctrl } = await setup();
    ctrl().disable();
    await fixture.whenStable();
    expect((edit.querySelector('button') as HTMLButtonElement).disabled).toBe(true);
  });
});
