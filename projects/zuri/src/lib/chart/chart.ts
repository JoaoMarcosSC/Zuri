import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  untracked,
  input,
  numberAttribute,
  signal,
} from '@angular/core';
import { ZUR_I18N } from '../i18n/i18n';
import { ZUR_SR_ONLY } from '../shared/search';

export type ZurChartType = 'bar' | 'line' | 'area' | 'donut';

export interface ZurChartSeries {
  name: string;
  values: number[];
}

/** Cores categóricas em ordem fixa: tokens `--zur-chart-1..6` (nunca cíclicas). */
export const ZUR_CHART_MAX_SERIES = 6;

// Especificações de marca (skill dataviz): barras finas com extremidade arredondada, 2px de ar.
const BAR_MAX = 24;
const BAR_STACK_MAX = 32;
const BAR_RADIUS = 4;
const GAP = 2;
const PAD_TOP = 16;
const PAD_RIGHT = 12;
const PAD_BOTTOM = 28;

const color = (i: number) => `var(--zur-chart-${Math.min(i, ZUR_CHART_MAX_SERIES - 1) + 1})`;

/** Valores "redondos" para o eixo: 0, 20, 40, 60… em vez de 0, 17, 34… */
export function zurNiceTicks(max: number, count = 4): number[] {
  if (!(max > 0)) return [0, 1];
  const raw = max / count;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const frac = raw / pow;
  const step = (frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 5 ? 5 : 10) * pow;
  const top = Math.ceil(max / step - 1e-9) * step;
  const n = Math.round(top / step);
  return Array.from({ length: n + 1 }, (_, i) => Number((i * step).toFixed(10)));
}

/** Retângulo com os cantos de cima arredondados e a base reta (a barra "cresce" da linha de base). */
export function zurBarPath(x: number, y: number, w: number, h: number, radius: number): string {
  const r = Math.max(0, Math.min(radius, w / 2, h));
  if (r === 0) return `M${x},${y}H${x + w}V${y + h}H${x}Z`;
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
}

function arcPath(cx: number, cy: number, rOuter: number, rInner: number, a0: number, a1: number): string {
  const p = (r: number, a: number) => `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M${p(rOuter, a0)}A${rOuter},${rOuter} 0 ${large} 1 ${p(rOuter, a1)}L${p(rInner, a1)}A${rInner},${rInner} 0 ${large} 0 ${p(rInner, a0)}Z`;
}

interface TooltipRow {
  color: string;
  name: string;
  value: string;
}

/**
 * Gráfico em SVG, sem dependências: barras (agrupadas ou empilhadas), linhas, áreas e rosca.
 * As cores vêm dos tokens `--zur-chart-1..6` em ordem fixa (a 1ª é a menta) e acompanham o
 * tema. Acessível por padrão: legenda sempre que há mais de uma série, tooltip no hover **e**
 * no foco (←→ andam pelas categorias), tabela alternativa para leitores de tela e animação
 * que respeita `prefers-reduced-motion`. O eixo horizontal não espelha em RTL (dados não se
 * invertem) e as setas são físicas.
 *
 * ```html
 * <zur-chart type="bar" label="Vendas por mês" [labels]="meses"
 *   [series]="[{ name: 'Vendas', values: [12, 18, 9] }]" />
 * ```
 */
@Component({
  selector: 'zur-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-type]': 'type()' },
  template: `
    <div class="plot" dir="ltr" (pointerleave)="onLeave()">
      <svg
        class="svg"
        role="group"
        [attr.aria-label]="label() || i18n.chartData"
        [attr.viewBox]="'0 0 ' + width() + ' ' + height()"
        [attr.height]="height()"
        (keydown)="onKeydown($event)"
      >
        @if (type() === 'donut') {
          @for (slice of view().slices; track slice.i) {
            <path
              class="slice"
              [class.dim]="active() !== null && active() !== slice.i"
              [attr.d]="slice.d"
              [attr.fill]="slice.color"
              [attr.data-i]="slice.i"
              [attr.tabindex]="slice.i === tabStop() ? 0 : -1"
              role="img"
              [attr.aria-label]="slice.aria"
              (pointerenter)="activate(slice.i)"
              (pointerdown)="activate(slice.i)"
              (focus)="activate(slice.i)"
              (blur)="onBlur($event)"
            />
          }
          <text class="center-value" [attr.x]="view().cx" [attr.y]="view().cy - 2" text-anchor="middle">{{ view().total }}</text>
          <text class="center-label" [attr.x]="view().cx" [attr.y]="view().cy + 18" text-anchor="middle">{{ label() }}</text>
        } @else {
          <!-- grade e eixos: hairline sólida e recessiva -->
          @for (tick of view().yTicks; track tick.y) {
            <line class="grid" [attr.x1]="view().left" [attr.x2]="width() - 12" [attr.y1]="tick.y" [attr.y2]="tick.y" />
            <text class="axis" [attr.x]="view().left - 8" [attr.y]="tick.y + 4" text-anchor="end">{{ tick.text }}</text>
          }
          @for (x of view().xLabels; track x.i) {
            <text class="axis" [attr.x]="x.x" [attr.y]="height() - 8" text-anchor="middle">{{ x.text }}</text>
          }

          @if (type() === 'bar') {
            @for (bar of view().bars; track bar.key) {
              <path class="bar" [class.lift]="active() === bar.cat" [attr.d]="bar.d" [attr.fill]="bar.color" />
            }
          } @else {
            @if (type() === 'area') {
              @for (line of view().lines; track line.s) {
                <path class="wash" [attr.d]="line.areaD" [attr.fill]="line.color" />
              }
            }
            @for (line of view().lines; track line.s) {
              <path class="line" [attr.d]="line.d" [attr.stroke]="line.color" />
            }
            @if (active() !== null) {
              <line class="crosshair" [attr.x1]="view().centers[active()!]" [attr.x2]="view().centers[active()!]" [attr.y1]="view().top" [attr.y2]="view().bottom" />
              @for (line of view().lines; track line.s) {
                <circle class="dot" [attr.cx]="line.points[active()!].x" [attr.cy]="line.points[active()!].y" r="4" [attr.fill]="line.color" />
              }
            }
          }

          <!-- alvo de foco/hover por categoria: bem maior que a marca -->
          @for (c of view().cats; track c.i) {
            <rect
              class="hit"
              [attr.x]="c.x"
              [attr.y]="view().top"
              [attr.width]="c.w"
              [attr.height]="view().bottom - view().top"
              [attr.data-i]="c.i"
              [attr.tabindex]="c.i === tabStop() ? 0 : -1"
              role="img"
              [attr.aria-label]="c.aria"
              (pointerenter)="activate(c.i)"
              (pointerdown)="activate(c.i)"
              (focus)="activate(c.i)"
              (blur)="onBlur($event)"
            />
          }
        }
      </svg>

      @if (tooltip(); as tip) {
        <div class="tooltip" [class.flip]="tip.flip" [style.left.px]="tip.x" [style.top.px]="tip.y" role="presentation">
          <div class="tip-title">{{ tip.title }}</div>
          @for (row of tip.rows; track $index) {
            <div class="tip-row">
              <span class="tip-key" [class.line-key]="type() === 'line'" [style.background]="row.color"></span>
              <span class="tip-value">{{ row.value }}</span>
              <span class="tip-name">{{ row.name }}</span>
            </div>
          }
        </div>
      }
    </div>

    @if (showLegend()) {
      <ul class="legend" role="list" [attr.aria-label]="i18n.chartLegend">
        @for (item of view().legend; track item.name) {
          <li class="legend-item">
            <span class="key" [class.line-key]="type() === 'line'" [style.background]="item.color"></span>
            {{ item.name }}
          </li>
        }
      </ul>
    }

    <!-- mesmos dados, para leitores de tela e para quem não usa o mouse -->
    <table class="sr-only">
      <caption>{{ label() || i18n.chartData }}</caption>
      <thead>
        <tr>
          <th scope="col">{{ i18n.chartData }}</th>
          @if (type() === 'donut') {
            <th scope="col">{{ series()[0]?.name }}</th>
          } @else {
            @for (s of series(); track $index) {
              <th scope="col">{{ s.name }}</th>
            }
          }
        </tr>
      </thead>
      <tbody>
        @for (row of tableRows(); track $index) {
          <tr>
            <th scope="row">{{ row.label }}</th>
            @for (cell of row.cells; track $index) {
              <td>{{ cell }}</td>
            }
          </tr>
        }
      </tbody>
    </table>
  `,
  styles: [
    ZUR_SR_ONLY,
    `
    :host {
      display: block;
      position: relative;
      min-width: 0;
    }
    .plot {
      position: relative;
    }
    .svg {
      display: block;
      width: 100%;
      overflow: visible;
      font-family: var(--zur-font-family);
    }
    .grid {
      stroke: var(--zur-chart-grid);
      stroke-width: 1;
    }
    .axis {
      fill: var(--zur-chart-axis);
      font-size: 12px;
      font-variant-numeric: tabular-nums;
    }
    .center-value {
      fill: var(--zur-ink);
      font-size: 28px;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
    }
    .center-label {
      fill: var(--zur-chart-axis);
      font-size: 13px;
    }
    .bar,
    .slice {
      transition: filter 120ms ease, opacity 120ms ease;
    }
    .bar.lift {
      filter: brightness(1.12);
    }
    .slice.dim {
      opacity: 0.55;
    }
    .line {
      fill: none;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .wash {
      opacity: 0.1;
    }
    .crosshair {
      stroke: var(--zur-chart-axis);
      stroke-width: 1;
      opacity: 0.6;
    }
    .dot {
      /* círculo de 8px com anel de 2px da cor da superfície */
      stroke: var(--zur-surface-raised);
      stroke-width: 2;
    }
    .hit {
      fill: transparent;
      outline: none;
      cursor: crosshair;
    }
    .hit:focus-visible {
      outline: 2px solid var(--zur-primary);
      outline-offset: -2px;
    }
    .slice {
      outline: none;
      cursor: pointer;
    }
    .slice:focus-visible {
      stroke: var(--zur-ink);
      stroke-width: 2;
    }
    .tooltip {
      position: absolute;
      z-index: 5;
      min-width: 140px;
      padding: var(--zur-space-sm) var(--zur-space-md);
      background: var(--zur-surface-raised);
      border: 1px solid var(--zur-hairline);
      border-radius: var(--zur-radius-sm);
      box-shadow: var(--zur-shadow-float);
      pointer-events: none;
      font: var(--zur-font-caption);
    }
    .tooltip.flip {
      transform: translateX(-100%);
    }
    .tip-title {
      margin-block-end: 4px;
      color: var(--zur-muted);
    }
    .tip-row {
      display: flex;
      align-items: center;
      gap: var(--zur-space-xs);
      padding-block: 1px;
    }
    .tip-key {
      width: 10px;
      height: 10px;
      flex-shrink: 0;
      border-radius: 2px;
    }
    .tip-key.line-key {
      height: 3px;
      width: 14px;
      border-radius: var(--zur-radius-full);
    }
    .tip-value {
      font-weight: 800;
      color: var(--zur-ink);
      font-variant-numeric: tabular-nums;
    }
    .tip-name {
      color: var(--zur-body);
    }
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: var(--zur-space-xs) var(--zur-space-lg);
      margin: var(--zur-space-sm) 0 0;
      padding: 0;
      list-style: none;
    }
    .legend-item {
      display: inline-flex;
      align-items: center;
      gap: var(--zur-space-xs);
      font: var(--zur-font-caption);
      color: var(--zur-body);
    }
    .key {
      width: 10px;
      height: 10px;
      flex-shrink: 0;
      border-radius: 2px;
    }
    .key.line-key {
      width: 16px;
      height: 3px;
      border-radius: var(--zur-radius-full);
    }
    @keyframes zur-grow {
      from { transform: scaleY(0); }
      to { transform: scaleY(1); }
    }
    @keyframes zur-fade {
      from { opacity: 0; }
    }
    .bar {
      transform-box: fill-box;
      transform-origin: 50% 100%;
      animation: zur-grow 480ms cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .line,
    .wash,
    .slice {
      animation: zur-fade 480ms ease both;
    }
    @media (prefers-reduced-motion: reduce) {
      .bar,
      .line,
      .wash,
      .slice {
        animation: none;
      }
      .bar,
      .slice {
        transition: none;
      }
    }
  `,
  ],
})
export class ZurChart {
  protected readonly i18n = inject(ZUR_I18N);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly type = input<ZurChartType>('bar');
  readonly series = input<ZurChartSeries[]>([]);
  /** Nomes das categorias (eixo X) ou das fatias (rosca). */
  readonly labels = input<string[]>([]);
  /** Nome do gráfico para leitores de tela (e rótulo do centro da rosca). */
  readonly label = input('');
  readonly height = input(260, { transform: numberAttribute });
  /** Barras empilhadas em vez de lado a lado. */
  readonly stacked = input(false, { transform: booleanAttribute });
  /** Como escrever os valores (eixo, tooltip, tabela). Padrão: número no idioma. */
  readonly valueFormat = input<((value: number) => string) | null>(null);
  /** Legenda: `auto` mostra com 2+ séries (e na rosca); uma série só não precisa. */
  readonly legend = input<'auto' | 'show' | 'hide'>('auto');

  protected readonly width = signal(640);
  protected readonly active = signal<number | null>(null);
  private readonly focusedIndex = signal(0);

  constructor() {
    const destroyRef = inject(DestroyRef);
    // trocar o tipo (barras → rosca…) não pode herdar o destaque do tipo anterior
    effect(() => {
      this.type();
      untracked(() => this.active.set(null));
    });
    afterNextRender(() => {
      if (typeof ResizeObserver === 'undefined') return;
      const observer = new ResizeObserver(([entry]) => {
        const w = Math.round(entry.contentRect.width);
        if (w > 0) this.width.set(Math.max(240, w));
      });
      observer.observe(this.host.nativeElement);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  private fmt(value: number): string {
    const f = this.valueFormat();
    return f ? f(value) : new Intl.NumberFormat(this.i18n.locale, { maximumFractionDigits: 1 }).format(value);
  }

  /** Eixo Y compacto quando passa de 10 mil ("12 mil"), completo antes disso. */
  private fmtAxis(value: number): string {
    const f = this.valueFormat();
    if (f) return f(value);
    return new Intl.NumberFormat(this.i18n.locale, {
      maximumFractionDigits: 1,
      notation: value >= 10000 ? 'compact' : 'standard',
    }).format(value);
  }

  protected readonly visible = computed(() => this.series().slice(0, ZUR_CHART_MAX_SERIES));

  protected readonly showLegend = computed(() => {
    const mode = this.legend();
    if (mode !== 'auto') return mode === 'show';
    return this.type() === 'donut' || this.visible().length >= 2;
  });

  private readonly count = computed(() => {
    if (this.type() === 'donut') return this.series()[0]?.values.length ?? 0;
    return Math.max(this.labels().length, ...this.visible().map((s) => s.values.length), 0);
  });

  protected readonly tabStop = computed(() => Math.min(this.active() ?? this.focusedIndex(), Math.max(0, this.count() - 1)));

  private categoryName(i: number): string {
    return this.labels()[i] ?? String(i + 1);
  }

  protected readonly view = computed(() => {
    const W = this.width();
    const H = this.height();
    const series = this.visible();
    const n = this.count();
    const type = this.type();
    const empty = {
      left: 0, top: PAD_TOP, bottom: H - PAD_BOTTOM, cx: W / 2, cy: H / 2, total: '',
      yTicks: [] as { y: number; text: string }[], xLabels: [] as { i: number; x: number; text: string }[],
      bars: [] as { key: string; cat: number; d: string; color: string }[],
      lines: [] as { s: number; d: string; areaD: string; color: string; points: { x: number; y: number }[] }[],
      centers: [] as number[],
      cats: [] as { i: number; x: number; w: number; aria: string }[],
      slices: [] as { i: number; d: string; color: string; aria: string }[],
      legend: [] as { name: string; color: string }[],
    };
    if (!n || !series.length) return empty;

    // ── rosca ──
    if (type === 'donut') {
      const values = series[0].values.map((v) => Math.max(0, v));
      const total = values.reduce((a, b) => a + b, 0);
      const cx = W / 2;
      const cy = H / 2;
      const rOuter = Math.max(40, Math.min(W, H) / 2 - 8);
      const rInner = rOuter * 0.64;
      const single = values.filter((v) => v > 0).length === 1;
      const pad = single || total <= 0 ? 0 : GAP / rOuter;
      let angle = -Math.PI / 2;
      const slices = values.map((v, i) => {
        const sweep = total > 0 ? (v / total) * Math.PI * 2 : 0;
        const start = angle;
        angle += sweep;
        const a0 = start + pad / 2;
        // uma fatia sozinha dá a volta inteira: tira um fio para o arco não fechar em zero
        const a1 = single ? start + Math.PI * 2 - 0.0001 : Math.max(a0 + 0.001, start + sweep - pad / 2);
        const pct = total > 0 ? new Intl.NumberFormat(this.i18n.locale, { style: 'percent', maximumFractionDigits: 1 }).format(v / total) : '0%';
        return {
          i,
          d: v > 0 ? arcPath(cx, cy, rOuter, rInner, a0, a1) : '',
          color: color(i),
          aria: this.i18n.chartPoint(series[0].name, this.categoryName(i), `${this.fmt(v)} (${pct})`),
        };
      });
      return {
        ...empty,
        cx, cy,
        total: this.fmt(total),
        slices: slices.filter((s) => s.d),
        legend: values.map((_, i) => ({ name: this.categoryName(i), color: color(i) })),
      };
    }

    // ── cartesiano ──
    const stacked = type === 'bar' && this.stacked();
    const sums = Array.from({ length: n }, (_, i) => series.reduce((a, s) => a + Math.max(0, s.values[i] ?? 0), 0));
    const max = stacked ? Math.max(...sums) : Math.max(...series.flatMap((s) => s.values.map((v) => Math.max(0, v))), 0);
    const ticks = zurNiceTicks(max);
    const yMax = ticks[ticks.length - 1] || 1;
    const longest = Math.max(...ticks.map((t) => this.fmtAxis(t).length));
    const left = Math.max(32, longest * 7 + 16);
    const top = PAD_TOP;
    const bottom = H - PAD_BOTTOM;
    const plotW = Math.max(40, W - left - PAD_RIGHT);
    const plotH = bottom - top;
    const band = plotW / n;
    const yOf = (v: number) => top + plotH - (Math.max(0, v) / yMax) * plotH;
    const centers = Array.from({ length: n }, (_, i) => left + band * (i + 0.5));

    const bars: typeof empty.bars = [];
    if (type === 'bar') {
      if (stacked) {
        const w = Math.min(BAR_STACK_MAX, band * 0.6);
        for (let i = 0; i < n; i++) {
          let cum = 0;
          const lastIdx = series.reduce((acc, s, k) => ((s.values[i] ?? 0) > 0 ? k : acc), -1);
          series.forEach((s, k) => {
            const v = Math.max(0, s.values[i] ?? 0);
            if (v <= 0) return;
            const segTop = yOf(cum + v);
            const segBottom = yOf(cum) - (cum > 0 ? GAP : 0);
            cum += v;
            const h = Math.max(0, segBottom - segTop);
            bars.push({ key: `${i}-${k}`, cat: i, d: zurBarPath(centers[i] - w / 2, segTop, w, h, k === lastIdx ? BAR_RADIUS : 0), color: color(k) });
          });
        }
      } else {
        const s = series.length;
        const barW = Math.max(4, Math.min(BAR_MAX, (band * 0.72 - GAP * (s - 1)) / s));
        const groupW = s * barW + (s - 1) * GAP;
        for (let i = 0; i < n; i++) {
          series.forEach((ser, k) => {
            const v = Math.max(0, ser.values[i] ?? 0);
            const y = yOf(v);
            bars.push({ key: `${i}-${k}`, cat: i, d: zurBarPath(centers[i] - groupW / 2 + k * (barW + GAP), y, barW, bottom - y, BAR_RADIUS), color: color(k) });
          });
        }
      }
    }

    const lines = type === 'bar' ? [] : series.map((s, k) => {
      const points = centers.map((x, i) => ({ x, y: yOf(s.values[i] ?? 0) }));
      const d = points.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join('');
      const areaD = `${d}L${points[points.length - 1].x.toFixed(2)},${bottom}L${points[0].x.toFixed(2)},${bottom}Z`;
      return { s: k, d, areaD, color: color(k), points };
    });

    // rótulos do eixo X: pula alguns quando não cabem lado a lado
    const widest = Math.max(...Array.from({ length: n }, (_, i) => this.categoryName(i).length));
    const every = Math.max(1, Math.ceil((widest * 6.5 + 12) / band));
    const xLabels = centers.map((x, i) => ({ i, x, text: this.categoryName(i) })).filter((l) => l.i % every === 0);

    return {
      ...empty,
      left, top, bottom,
      yTicks: ticks.map((t) => ({ y: yOf(t), text: this.fmtAxis(t) })),
      xLabels,
      bars,
      lines,
      centers,
      cats: centers.map((cx, i) => ({
        i,
        x: cx - band / 2,
        w: band,
        aria: `${this.categoryName(i)}: ` + series.map((s) => `${s.name} ${this.fmt(s.values[i] ?? 0)}`).join(', '),
      })),
      legend: series.map((s, k) => ({ name: s.name, color: color(k) })),
    };
  });

  protected readonly tooltip = computed(() => {
    const i = this.active();
    if (i === null || i >= this.count()) return null;
    const v = this.view();
    const series = this.visible();
    const W = this.width();
    if (this.type() === 'donut') {
      const values = series[0]?.values ?? [];
      const total = values.reduce((a, b) => a + Math.max(0, b), 0);
      const pct = total > 0 ? new Intl.NumberFormat(this.i18n.locale, { style: 'percent', maximumFractionDigits: 1 }).format((values[i] ?? 0) / total) : '0%';
      return { title: this.categoryName(i), rows: [{ color: color(i), name: pct, value: this.fmt(values[i] ?? 0) }] as TooltipRow[], x: v.cx, y: 8, flip: false };
    }
    const x = v.centers[i] ?? 0;
    const flip = x > W * 0.6;
    return {
      title: this.categoryName(i),
      rows: series.map((s, k) => ({ color: color(k), name: s.name, value: this.fmt(s.values[i] ?? 0) })) as TooltipRow[],
      x: x + (flip ? -12 : 12),
      y: v.top,
      flip,
    };
  });

  protected readonly tableRows = computed(() => {
    const series = this.visible();
    if (this.type() === 'donut') {
      return (series[0]?.values ?? []).map((v, i) => ({ label: this.categoryName(i), cells: [this.fmt(v)] }));
    }
    return Array.from({ length: this.count() }, (_, i) => ({
      label: this.categoryName(i),
      cells: series.map((s) => this.fmt(s.values[i] ?? 0)),
    }));
  });

  protected activate(i: number): void {
    this.active.set(i);
    this.focusedIndex.set(i);
  }

  protected onLeave(): void {
    // quem navega pelo teclado mantém o tooltip enquanto o foco estiver no gráfico
    const focused = this.host.nativeElement.ownerDocument.activeElement;
    if (!focused || !this.host.nativeElement.contains(focused)) this.active.set(null);
  }

  protected onBlur(event: FocusEvent): void {
    const next = event.relatedTarget as Element | null;
    if (!next || !this.host.nativeElement.contains(next)) this.active.set(null);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const n = this.count();
    if (!n) return;
    const current = this.tabStop();
    let next = current;
    // setas físicas: o gráfico não espelha em RTL
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = Math.min(n - 1, current + 1);
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = Math.max(0, current - 1);
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = n - 1;
    else if (event.key === 'Escape') {
      this.active.set(null);
      return;
    } else return;
    event.preventDefault();
    this.activate(next);
    queueMicrotask(() => this.host.nativeElement.querySelector<SVGElement>(`[data-i="${next}"]`)?.focus());
  }
}
