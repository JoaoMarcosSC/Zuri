import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZurTimeline, ZurTimelineItem } from './timeline';

@Component({
  imports: [ZurTimeline, ZurTimelineItem],
  template: `
    <ol zur-timeline label="Histórico do pedido">
      <li zur-timeline-heading>Hoje</li>
      <li zur-timeline-item title="Saiu para entrega" time="10:42" datetime="2026-11-15T10:42" status="success">A caminho.</li>
      <li zur-timeline-item title="Pedido confirmado" time="09:15">Pagamento aprovado.</li>
    </ol>
  `,
})
class Host {}

describe('ZurTimeline', () => {
  it('é uma lista nomeada com itens, título, hora e conteúdo', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const ol = el.querySelector('ol')!;
    expect(ol.getAttribute('aria-label')).toBe('Histórico do pedido');
    expect(ol.classList).toContain('zur-timeline');
    const items = Array.from(el.querySelectorAll('li[zur-timeline-item]'));
    expect(items.length).toBe(2);
    expect(items[0].querySelector('.title')?.textContent).toBe('Saiu para entrega');
    expect(items[0].querySelector('time')?.getAttribute('datetime')).toBe('2026-11-15T10:42');
    expect(items[0].getAttribute('data-status')).toBe('success');
    expect(items[0].querySelector('.content')?.textContent?.trim()).toBe('A caminho.');
    expect(items[1].getAttribute('data-status')).toBe('neutral');
  });
});
