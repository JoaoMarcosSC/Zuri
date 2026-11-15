import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZurSparkline } from './sparkline';
import { ZurStat } from './stat';

@Component({
  imports: [ZurStat, ZurSparkline],
  template: `
    <zur-stat label="Pedidos" value="1.284" [delta]="12.4" deltaLabel="vs. mês anterior">
      <zur-sparkline zurStatChart label="Pedidos dos últimos 7 dias" [values]="[4, 6, 5, 9, 12, 11, 15]" />
    </zur-stat>
    <zur-stat label="Devoluções" value="32" [delta]="-8" invert />
    <zur-stat label="Ticket médio" value="R$ 84" [delta]="0" />
    <zur-stat label="Sem comparação" value="7" />
  `,
})
class Host {}

describe('ZurStat e ZurSparkline', () => {
  async function stats() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    return Array.from(fixture.nativeElement.querySelectorAll('zur-stat')) as HTMLElement[];
  }

  it('mostra rótulo, valor e variação com sinal e texto para leitor de tela', async () => {
    const [pedidos] = await stats();
    expect(pedidos.querySelector('.label')?.textContent).toBe('Pedidos');
    expect(pedidos.querySelector('.value')?.textContent).toBe('1.284');
    expect(pedidos.querySelector('.delta span[aria-hidden=true]')?.textContent).toBe('+12,4%');
    expect(pedidos.querySelector('.sr-only')?.textContent?.replace(/\s+/g, ' ').trim()).toBe('em alta +12,4% vs. mês anterior');
    expect(pedidos.getAttribute('data-tone')).toBe('good');
  });

  it('cair é bom quando `invert` (cor boa) e subir sem invert também', async () => {
    const [, devolucoes] = await stats();
    expect(devolucoes.getAttribute('data-tone')).toBe('good');
    expect(devolucoes.querySelector('.sr-only')?.textContent).toContain('em queda');
    expect(devolucoes.querySelector('.delta span[aria-hidden=true]')?.textContent).toBe('-8%');
  });

  it('variação zero é neutra e sem delta não mostra nada', async () => {
    const [, , ticket, sem] = await stats();
    expect(ticket.getAttribute('data-tone')).toBe('flat');
    expect(ticket.querySelector('.sr-only')?.textContent).toContain('estável');
    expect(sem.querySelector('.delta')).toBeNull();
  });

  it('sparkline com rótulo é uma imagem; sem rótulo fica escondida', async () => {
    const [pedidos] = await stats();
    const spark = pedidos.querySelector('zur-sparkline')!;
    expect(spark.getAttribute('role')).toBe('img');
    expect(spark.getAttribute('aria-label')).toBe('Pedidos dos últimos 7 dias');
    expect(spark.querySelector('.line')?.getAttribute('d')).toMatch(/^M0\.00,/);
    expect(spark.querySelector('.line')?.getAttribute('stroke')).toBe('var(--zur-chart-1)');

    const bare = TestBed.createComponent(ZurSparkline);
    bare.componentRef.setInput('values', [1, 2, 3]);
    await bare.whenStable();
    expect(bare.nativeElement.getAttribute('aria-hidden')).toBe('true');
  });
});
