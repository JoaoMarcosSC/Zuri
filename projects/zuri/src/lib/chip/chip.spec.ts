import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ZurChip, ZurChipGroup } from './chip';

@Component({
  imports: [ZurChip, ZurChipGroup, ReactiveFormsModule],
  template: `
    <zur-chip id="assist" (click)="cliques = cliques + 1">Ajuda</zur-chip>
    <zur-chip id="filtro" variant="filter" [(selected)]="sol">Pleno sol</zur-chip>
    <zur-chip id="rem" removable label="Sala" (removed)="removido = removido + 1">Sala de estar</zur-chip>

    <zur-chip-group id="single" label="Ambiente" mode="single" [formControl]="ambiente">
      <zur-chip value="sala">Sala</zur-chip>
      <zur-chip value="varanda">Varanda</zur-chip>
      <zur-chip value="quarto">Quarto</zur-chip>
    </zur-chip-group>

    <zur-chip-group id="multi" label="Luz" mode="multiple" [formControl]="luz">
      <zur-chip value="sol">Sol</zur-chip>
      <zur-chip value="sombra">Sombra</zur-chip>
    </zur-chip-group>
  `,
})
class Host {
  cliques = 0;
  removido = 0;
  sol = signal(false);
  ambiente = new FormControl<string | null>(null);
  luz = new FormControl<string[]>([]);
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const body = (selector: string) => Array.from(el.querySelectorAll(`${selector} button.body`)) as HTMLButtonElement[];
  return { fixture, el, host: fixture.componentInstance, body };
}

describe('ZurChip', () => {
  it('assist é só um botão: sem aria-pressed e o click chega ao consumidor', async () => {
    const { fixture, el, host } = await setup();
    const btn = el.querySelector('#assist button.body') as HTMLButtonElement;
    expect(btn.hasAttribute('aria-pressed')).toBe(false);
    btn.click();
    await fixture.whenStable();
    expect(host.cliques).toBe(1);
  });

  it('filter alterna, atualiza o two-way e mostra ✓ só quando marcado', async () => {
    const { fixture, el, host } = await setup();
    const btn = el.querySelector('#filtro button.body') as HTMLButtonElement;
    expect(btn.getAttribute('aria-pressed')).toBe('false');
    expect(btn.querySelector('svg')).toBeNull();
    btn.click();
    await fixture.whenStable();
    expect(host.sol()).toBe(true);
    expect(btn.getAttribute('aria-pressed')).toBe('true');
    expect(btn.querySelector('svg')).not.toBeNull();
  });

  it('removable tem botão com nome acessível e emite removed', async () => {
    const { fixture, el, host } = await setup();
    const rm = el.querySelector('#rem .remove') as HTMLButtonElement;
    expect(rm.getAttribute('aria-label')).toBe('Remover Sala');
    rm.click();
    await fixture.whenStable();
    expect(host.removido).toBe(1);
  });
});

describe('ZurChipGroup', () => {
  it('single é radiogroup: escolhe, atualiza o formulário e só o escolhido recebe o Tab', async () => {
    const { fixture, el, host, body } = await setup();
    expect(el.querySelector('#single')?.getAttribute('role')).toBe('radiogroup');
    const [sala, varanda, quarto] = body('#single');
    expect([sala, varanda, quarto].map((b) => b.getAttribute('tabindex'))).toEqual(['0', '0', '0']); // nada escolhido
    varanda.click();
    await fixture.whenStable();
    expect(host.ambiente.value).toBe('varanda');
    expect(varanda.getAttribute('aria-checked')).toBe('true');
    expect([sala, varanda, quarto].map((b) => b.getAttribute('tabindex'))).toEqual(['-1', '0', '-1']);
    varanda.click(); // radio não desmarca
    await fixture.whenStable();
    expect(host.ambiente.value).toBe('varanda');
  });

  it('as setas movem o foco e a escolha, com volta ao início', async () => {
    const { fixture, host, body } = await setup();
    const [sala, varanda, quarto] = body('#single');
    sala.click();
    await fixture.whenStable();
    sala.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();
    expect(host.ambiente.value).toBe('varanda');
    expect(document.activeElement).toBe(varanda);
    quarto.focus();
    quarto.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();
    expect(host.ambiente.value).toBe('sala');
    sala.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    await fixture.whenStable();
    expect(host.ambiente.value).toBe('quarto');
  });

  it('multiple alterna valores num array', async () => {
    const { fixture, el, host, body } = await setup();
    expect(el.querySelector('#multi')?.getAttribute('role')).toBe('group');
    const [sol, sombra] = body('#multi');
    sol.click();
    sombra.click();
    await fixture.whenStable();
    expect(host.luz.value).toEqual(['sol', 'sombra']);
    expect(sol.getAttribute('aria-pressed')).toBe('true');
    sol.click();
    await fixture.whenStable();
    expect(host.luz.value).toEqual(['sombra']);
  });

  it('respeita setValue e disable do formulário', async () => {
    const { fixture, host, body } = await setup();
    host.ambiente.setValue('quarto');
    host.luz.setValue(['sol']);
    await fixture.whenStable();
    expect(body('#single')[2].getAttribute('aria-checked')).toBe('true');
    expect(body('#multi')[0].getAttribute('aria-pressed')).toBe('true');
    host.ambiente.disable();
    await fixture.whenStable();
    expect(body('#single').every((b) => b.disabled)).toBe(true);
  });
});
