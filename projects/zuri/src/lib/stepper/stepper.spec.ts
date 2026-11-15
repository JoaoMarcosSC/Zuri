import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZurStepper, ZurStepperStep } from './stepper';

@Component({
  imports: [ZurStepper, ZurStepperStep],
  template: `
    <zur-stepper #s [linear]="linear()" [(index)]="etapa">
      <zur-stepper-step label="Endereço" description="Onde entregar">Passo A</zur-stepper-step>
      <zur-stepper-step label="Pagamento" [error]="erro()">Passo B</zur-stepper-step>
      <zur-stepper-step label="Revisão">Passo C</zur-stepper-step>
    </zur-stepper>
    <button id="next" (click)="s.next()">próximo</button>
    <button id="prev" (click)="s.previous()">anterior</button>
  `,
})
class Host {
  etapa = signal(0);
  linear = signal(false);
  erro = signal(false);
}

/** Texto do botão que forma o nome acessível (sem a bolinha, que é aria-hidden). O axe confere o resto no Chromium. */
const nome = (el: Element) => (el.querySelector('.text')?.textContent ?? '').replace(/\s+/g, ' ').trim();

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const heads = () => Array.from(el.querySelectorAll('.head')) as HTMLButtonElement[];
  const status = () => Array.from(el.querySelectorAll('.item')).map((i) => i.getAttribute('data-status'));
  const click = async (sel: string) => {
    (el.querySelector(sel) as HTMLElement).click();
    await fixture.whenStable();
  };
  return { fixture, el, heads, status, click, host: () => fixture.componentInstance };
}

describe('ZurStepper', () => {
  it('mostra só o conteúdo da etapa atual e o estado de cada uma', async () => {
    const { el, status, heads } = await setup();
    expect(el.querySelector('.panels')?.textContent).toContain('Passo A');
    expect(el.querySelector('.panels')?.textContent).not.toContain('Passo B');
    expect(status()).toEqual(['current', 'upcoming', 'upcoming']);
    expect(heads()[0].getAttribute('aria-current')).toBe('step');
    const nome0 = nome(heads()[0]);
    expect(nome0).toContain('Etapa 1 de 3:');
    expect(nome0).toContain('Endereço');
    expect(nome0).toContain('Onde entregar');
    expect(nome0).toContain(', etapa atual');
  });

  it('next/previous andam e marcam as anteriores como concluídas', async () => {
    const { el, status, click, host } = await setup();
    await click('#next');
    await click('#next');
    expect(host().etapa()).toBe(2);
    expect(status()).toEqual(['done', 'done', 'current']);
    expect(el.querySelector('.panels')?.textContent).toContain('Passo C');
    await click('#prev');
    expect(host().etapa()).toBe(1);
  });

  it('modo linear só libera etapas já alcançadas', async () => {
    const { fixture, heads, click, host } = await setup();
    host().linear.set(true);
    await fixture.whenStable();
    heads()[2].click();
    await fixture.whenStable();
    expect(host().etapa()).toBe(0);
    expect(heads()[2].getAttribute('aria-disabled')).toBe('true');
    await click('#next');
    await click('#next');
    heads()[0].click(); // voltar é permitido
    await fixture.whenStable();
    expect(host().etapa()).toBe(0);
    heads()[2].click(); // já foi alcançada
    await fixture.whenStable();
    expect(host().etapa()).toBe(2);
  });

  it('a linha de ligação existe entre as etapas (não depois da última) e é decorativa', async () => {
    const { el } = await setup();
    const lines = Array.from(el.querySelectorAll('.item .line'));
    expect(lines.length).toBe(2);
    expect(lines.every((l) => l.getAttribute('aria-hidden') === 'true')).toBe(true);
    expect(el.querySelector('.item:last-child .line')).toBeNull();
  });

  it('etapa com erro tem estado e rótulo próprios', async () => {
    const { fixture, status, heads, host } = await setup();
    host().erro.set(true);
    await fixture.whenStable();
    expect(status()[1]).toBe('error');
    expect(nome(heads()[1])).toContain('Pagamento');
    expect(nome(heads()[1])).toContain(', com erro');
  });

  it('setas movem o foco (sem ativar) e Home/End vão às pontas', async () => {
    const { fixture, el, heads, host } = await setup();
    heads()[0].focus();
    const list = el.querySelector('.steps')!;
    list.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(heads()[1]);
    expect(host().etapa()).toBe(0);
    list.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(heads()[2]);
    await fixture.whenStable();
  });
});
