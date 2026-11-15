import { ChangeDetectionStrategy, Component, computed, input, numberAttribute } from '@angular/core';

/**
 * Mini-gráfico de tendência para dentro de cartões e tabelas. Uma linha de 2px sobre um fio
 * de área (10%), na cor `--zur-chart-N`. Dê um `label` para ser lido ("Vendas dos últimos
 * 12 dias: de 4 a 19"); sem ele o desenho é decorativo e fica escondido dos leitores de tela.
 *
 * ```html
 * <zur-sparkline label="Vendas dos últimos 12 dias" [values]="[4, 6, 5, 9, 12, 11, 15]" />
 * ```
 */
@Component({
  selector: 'zur-sparkline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.role]': 'label() ? "img" : null',
    '[attr.aria-label]': 'label() || null',
    '[attr.aria-hidden]': 'label() ? null : "true"',
  },
  template: `
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" [attr.height]="height()">
      <path class="wash" [attr.d]="paths().area" [attr.fill]="stroke()" />
      <path class="line" [attr.d]="paths().line" [attr.stroke]="stroke()" />
    </svg>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    svg {
      display: block;
      width: 100%;
      overflow: visible;
    }
    .line {
      fill: none;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      vector-effect: non-scaling-stroke;
    }
    .wash {
      opacity: 0.1;
    }
  `,
})
export class ZurSparkline {
  readonly values = input<number[]>([]);
  readonly label = input('');
  /** Posição da cor na paleta de gráficos (1 = menta, 2 = azul…). */
  readonly slot = input(1, { transform: numberAttribute });
  readonly height = input(32, { transform: numberAttribute });

  protected readonly stroke = computed(() => `var(--zur-chart-${Math.max(1, Math.min(6, this.slot()))})`);

  protected readonly paths = computed(() => {
    const v = this.values();
    if (v.length < 2) return { line: '', area: '' };
    const min = Math.min(...v);
    const max = Math.max(...v);
    const span = max - min || 1;
    const y = (n: number) => 30 - ((n - min) / span) * 28; // 1px de folga para a espessura do traço
    const step = 100 / (v.length - 1);
    const line = v.map((n, i) => `${i ? 'L' : 'M'}${(i * step).toFixed(2)},${y(n).toFixed(2)}`).join('');
    return { line, area: `${line}L100,32L0,32Z` };
  });
}
