import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZurAccordion, ZurAccordionItem } from './accordion';

@Component({
  imports: [ZurAccordion, ZurAccordionItem],
  template: `
    <zur-accordion [multi]="multi">
      <zur-accordion-item title="Um">Conteúdo um</zur-accordion-item>
      <zur-accordion-item title="Dois">Conteúdo dois</zur-accordion-item>
      <zur-accordion-item title="Três">Conteúdo três</zur-accordion-item>
    </zur-accordion>
  `,
})
class Host {
  multi = false;
}

describe('ZurAccordion', () => {
  async function setup(multi = false) {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.multi = multi;
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const headers = Array.from(el.querySelectorAll('.zur-accordion-header')) as HTMLButtonElement[];
    const panels = Array.from(el.querySelectorAll('[role=region]')) as HTMLElement[];
    return { fixture, headers, panels };
  }

  it('abre a seção, liga botão e painel por ARIA e fecha as outras', async () => {
    const { fixture, headers, panels } = await setup();
    expect(headers[0].getAttribute('aria-expanded')).toBe('false');
    expect(panels[0].hidden).toBe(true);
    expect(headers[0].getAttribute('aria-controls')).toBe(panels[0].id);
    expect(panels[0].getAttribute('aria-labelledby')).toBe(headers[0].id);

    headers[0].click();
    await fixture.whenStable();
    expect(headers[0].getAttribute('aria-expanded')).toBe('true');
    expect(panels[0].hidden).toBe(false);

    headers[1].click();
    await fixture.whenStable();
    expect(headers[1].getAttribute('aria-expanded')).toBe('true');
    expect(headers[0].getAttribute('aria-expanded')).toBe('false');
  });

  it('com multi, mantém várias abertas', async () => {
    const { fixture, headers } = await setup(true);
    headers[0].click();
    headers[1].click();
    await fixture.whenStable();
    expect(headers[0].getAttribute('aria-expanded')).toBe('true');
    expect(headers[1].getAttribute('aria-expanded')).toBe('true');
  });

  it('setas, Home e End movem o foco entre os cabeçalhos', async () => {
    const { headers } = await setup();
    headers[0].focus();
    headers[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(headers[1]);
    headers[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(document.activeElement).toBe(headers[2]);
    headers[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(headers[0]);
    headers[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    expect(document.activeElement).toBe(headers[2]);
  });
});
