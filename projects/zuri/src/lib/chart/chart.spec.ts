import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZurChart, ZurChartSeries, zurBarPath, zurNiceTicks } from './chart';

describe('helpers de gráfico', () => {
  it('zurNiceTicks gera valores redondos', () => {
    expect(zurNiceTicks(17)).toEqual([0, 5, 10, 15, 20]);
    expect(zurNiceTicks(100)).toEqual([0, 50, 100]);
    expect(zurNiceTicks(240)).toEqual([0, 100, 200, 300]);
    expect(zurNiceTicks(0)).toEqual([0, 1]);
    expect(zurNiceTicks(1200).at(-1)).toBeGreaterThanOrEqual(1200);
  });

  it('zurBarPath arredonda só o topo e limita o raio', () => {
    expect(zurBarPath(0, 0, 20, 50, 4)).toBe('M0,50V4Q0,0 4,0H16Q20,0 20,4V50Z');
    expect(zurBarPath(0, 0, 20, 50, 0)).toBe('M0,0H20V50H0Z');
    // barra mais baixa que o raio não "estoura"
    expect(zurBarPath(0, 0, 20, 2, 4)).toContain('Q0,0 2,0');
  });
});

const VENDAS: ZurChartSeries[] = [{ name: 'Vendas', values: [12, 18, 9, 22] }];
const DUAS: ZurChartSeries[] = [
  { name: 'Vendas', values: [12, 18, 9, 22] },
  { name: 'Custos', values: [8, 10, 7, 12] },
];
const MESES = ['Jan', 'Fev', 'Mar', 'Abr'];

@Component({
  imports: [ZurChart],
  template: `<zur-chart [type]="type()" label="Vendas por mês" [labels]="labels()" [series]="series()" [stacked]="stacked()" />`,
})
class Host {
  type = signal<'bar' | 'line' | 'area' | 'donut'>('bar');
  series = signal<ZurChartSeries[]>(VENDAS);
  labels = signal(MESES);
  stacked = signal(false);
}

async function setup(init?: (h: Host) => void) {
  const fixture = TestBed.createComponent(Host);
  init?.(fixture.componentInstance);
  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const settle = async () => {
    await fixture.whenStable();
    await new Promise((r) => setTimeout(r));
  };
  const hits = () => Array.from(el.querySelectorAll('.hit')) as SVGElement[];
  return { fixture, el, settle, hits, host: () => fixture.componentInstance };
}

describe('ZurChart', () => {
  it('barras: uma por categoria, usando a cor 1 (menta) e o nome do gráfico', async () => {
    const { el } = await setup();
    const svg = el.querySelector('svg')!;
    expect(svg.getAttribute('role')).toBe('group');
    expect(svg.getAttribute('aria-label')).toBe('Vendas por mês');
    const bars = Array.from(el.querySelectorAll('.bar'));
    expect(bars.length).toBe(4);
    expect(bars[0].getAttribute('fill')).toBe('var(--zur-chart-1)');
    // base reta e topo arredondado
    expect(bars[0].getAttribute('d')).toMatch(/^M[\d.]+,[\d.]+V[\d.]+Q/);
  });

  it('uma série não mostra legenda; duas mostram, na ordem fixa das cores', async () => {
    const { el, settle, host } = await setup();
    expect(el.querySelector('.legend')).toBeNull();
    host().series.set(DUAS);
    await settle();
    const items = Array.from(el.querySelectorAll('.legend-item'));
    expect(items.map((i) => i.textContent?.trim())).toEqual(['Vendas', 'Custos']);
    const fills = Array.from(el.querySelectorAll('.bar')).map((b) => b.getAttribute('fill'));
    expect(fills.slice(0, 2)).toEqual(['var(--zur-chart-1)', 'var(--zur-chart-2)']);
  });

  it('barras agrupadas respeitam o limite de 24px de espessura', async () => {
    const { el, host, settle } = await setup();
    host().series.set(DUAS);
    await settle();
    for (const bar of Array.from(el.querySelectorAll('.bar'))) {
      const d = bar.getAttribute('d')!;
      const x0 = Number(d.match(/^M([\d.]+)/)![1]);
      const x1 = Number(d.match(/Q([\d.]+),[\d.]+ [\d.]+,[\d.]+V[\d.]+Z$/)![1]);
      expect(x1 - x0).toBeLessThanOrEqual(24.01);
      expect(x1 - x0).toBeGreaterThan(4);
    }
  });

  it('cada categoria é um alvo de foco com os valores no nome; só um fica no Tab', async () => {
    const { hits } = await setup();
    expect(hits().length).toBe(4);
    expect(hits()[1].getAttribute('aria-label')).toBe('Fev: Vendas 18');
    expect(hits().map((h) => h.getAttribute('tabindex'))).toEqual(['0', '-1', '-1', '-1']);
  });

  it('o foco mostra o tooltip e as setas andam pelas categorias', async () => {
    const { el, hits, settle } = await setup();
    hits()[0].dispatchEvent(new FocusEvent('focus'));
    await settle();
    expect(el.querySelector('.tooltip .tip-title')?.textContent).toBe('Jan');
    expect(el.querySelector('.tooltip .tip-value')?.textContent).toBe('12');
    el.querySelector('svg')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
    await settle();
    expect(el.querySelector('.tooltip .tip-title')?.textContent).toBe('Fev');
    el.querySelector('svg')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await settle();
    expect(el.querySelector('.tooltip')).toBeNull();
  });

  it('o tooltip lista todas as séries com o valor em destaque', async () => {
    const { el, hits, settle, host } = await setup();
    host().series.set(DUAS);
    await settle();
    hits()[3].dispatchEvent(new Event('pointerenter'));
    await settle();
    const rows = Array.from(el.querySelectorAll('.tooltip .tip-row')).map(
      (r) => `${r.querySelector('.tip-value')?.textContent} ${r.querySelector('.tip-name')?.textContent}`,
    );
    expect(rows).toEqual(['22 Vendas', '12 Custos']);
  });

  it('linha: um traço de 2px por série, ponto ao ativar e linha de cruzamento', async () => {
    const { el, hits, settle, host } = await setup((h) => (h.type.set('line'), h.series.set(DUAS)));
    expect(el.querySelectorAll('.line').length).toBe(2);
    expect(el.querySelector('.bar')).toBeNull();
    expect(el.querySelector('.crosshair')).toBeNull();
    hits()[1].dispatchEvent(new Event('pointerenter'));
    await settle();
    expect(el.querySelector('.crosshair')).not.toBeNull();
    expect(el.querySelectorAll('.dot').length).toBe(2);
    expect(el.querySelector('.wash')).toBeNull();
    void host;
  });

  it('área: acrescenta o fundo a 10% sob cada linha', async () => {
    const { el } = await setup((h) => h.type.set('area'));
    expect(el.querySelectorAll('.wash').length).toBe(1);
    expect(el.querySelectorAll('.line').length).toBe(1);
  });

  it('empilhado: um segmento por série com a ponta de cima arredondada', async () => {
    const { el } = await setup((h) => (h.series.set(DUAS), h.stacked.set(true)));
    const bars = Array.from(el.querySelectorAll('.bar'));
    expect(bars.length).toBe(8);
    const rounded = bars.filter((b) => b.getAttribute('d')!.includes('Q')).length;
    expect(rounded).toBe(4); // só o último segmento de cada coluna
  });

  it('rosca: uma fatia por rótulo, legenda e total no centro', async () => {
    const { el, hits } = await setup((h) => {
      h.type.set('donut');
      h.labels.set(['Folhagem', 'Suculentas', 'Flores']);
      h.series.set([{ name: 'Pedidos', values: [50, 30, 20] }]);
    });
    const slices = Array.from(el.querySelectorAll('.slice'));
    expect(slices.length).toBe(3);
    expect(slices[1].getAttribute('fill')).toBe('var(--zur-chart-2)');
    expect(slices[0].getAttribute('aria-label')).toBe('Pedidos, Folhagem: 50 (50%)');
    expect(el.querySelector('.center-value')?.textContent).toBe('100');
    expect(Array.from(el.querySelectorAll('.legend-item')).map((i) => i.textContent?.trim())).toEqual(['Folhagem', 'Suculentas', 'Flores']);
    expect(hits().length).toBe(0);
  });

  it('trocar o tipo limpa o destaque do tipo anterior (a rosca não nasce esmaecida)', async () => {
    const { el, hits, settle, host } = await setup((h) => h.series.set(DUAS));
    hits()[3].dispatchEvent(new Event('pointerenter'));
    await settle();
    expect(el.querySelector('.tooltip')).not.toBeNull();
    host().type.set('donut');
    host().labels.set(['A', 'B', 'C']);
    host().series.set([{ name: 'S', values: [1, 2, 3] }]);
    await settle();
    expect(el.querySelector('.tooltip')).toBeNull();
    expect(el.querySelectorAll('.slice.dim').length).toBe(0);
  });

  it('tem uma tabela alternativa com os mesmos dados', async () => {
    const { el, host, settle } = await setup();
    host().series.set(DUAS);
    await settle();
    const table = el.querySelector('table.sr-only')!;
    expect(table.querySelector('caption')?.textContent).toBe('Vendas por mês');
    expect(Array.from(table.querySelectorAll('thead th')).map((t) => t.textContent?.trim())).toEqual(['Dados do gráfico', 'Vendas', 'Custos']);
    const first = Array.from(table.querySelectorAll('tbody tr')[0].children).map((c) => c.textContent?.trim());
    expect(first).toEqual(['Jan', '12', '8']);
    expect(table.querySelectorAll('th:empty').length).toBe(0);
  });

  it('ignora séries além da sexta (cores nunca se repetem)', async () => {
    const { el } = await setup((h) =>
      h.series.set(Array.from({ length: 8 }, (_, i) => ({ name: `S${i + 1}`, values: [1, 2, 3, 4] }))),
    );
    expect(el.querySelectorAll('.legend-item').length).toBe(6);
  });
});
