import { ChangeDetectionStrategy, Component, booleanAttribute, computed, inject, input } from '@angular/core';
import { ZUR_I18N } from '../i18n/i18n';
import { ZUR_SR_ONLY } from '../shared/search';

/**
 * Indicador (KPI): rótulo, valor grande e variação em relação a um período. A variação
 * sempre vem com seta **e** sinal (+/−) e é lida por extenso ("em alta em relação ao período
 * anterior"): a cor reforça, mas nunca é o único sinal. Se subir é ruim (custo, erros), use
 * `invert`. Aceita um `zur-sparkline` no slot `[zurStatChart]`.
 *
 * ```html
 * <zur-stat label="Pedidos" value="1.284" [delta]="12.4">
 *   <zur-sparkline zurStatChart label="Pedidos dos últimos 12 dias" [values]="serie" />
 * </zur-stat>
 * ```
 */
@Component({
  selector: 'zur-stat',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-tone]': 'tone()' },
  template: `
    <span class="label">{{ label() }}</span>
    <span class="value">{{ value() }}</span>
    @if (delta() !== null) {
      <span class="delta">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          @switch (direction()) {
            @case ('up') { <path d="M12 19V5m0 0-6 6m6-6 6 6" /> }
            @case ('down') { <path d="M12 5v14m0 0-6-6m6 6 6-6" /> }
            @default { <path d="M5 12h14" /> }
          }
        </svg>
        <span class="figure" aria-hidden="true">{{ formatted() }}</span>
        <span class="sr-only">
          {{ direction() === 'up' ? i18n.statUp : direction() === 'down' ? i18n.statDown : i18n.statFlat }}
          {{ formatted() }} {{ deltaLabel() || i18n.statVsPrevious }}
        </span>
        @if (deltaLabel()) {
          <span class="context" aria-hidden="true">{{ deltaLabel() }}</span>
        }
      </span>
    }
    <div class="chart"><ng-content select="[zurStatChart]" /></div>
  `,
  styles: [
    ZUR_SR_ONLY,
    `
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--zur-space-xxs);
      padding: var(--zur-space-lg);
      background: var(--zur-surface-raised);
      border: 1px solid var(--zur-hairline);
      border-radius: var(--zur-radius-md);
    }
    .label {
      font: var(--zur-font-caption);
      color: var(--zur-muted);
    }
    .value {
      font: var(--zur-font-display-md);
      font-size: 32px;
      letter-spacing: var(--zur-tracking-display-md);
      font-variant-numeric: tabular-nums;
      color: var(--zur-ink);
    }
    /* O sinal (+/−) é parte do número: isolado e em LTR para não "pular" para o fim em páginas RTL. */
    .figure {
      unicode-bidi: isolate;
      direction: ltr;
    }
    .delta {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font: var(--zur-font-caption);
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      color: var(--zur-muted);
    }
    :host([data-tone='good']) .delta { color: var(--zur-success-text); }
    :host([data-tone='bad']) .delta { color: var(--zur-error-text); }
    .context {
      font-weight: 400;
      color: var(--zur-muted);
    }
    .chart {
      margin-block-start: var(--zur-space-sm);
    }
    .chart:empty {
      display: none;
    }
  `,
  ],
})
export class ZurStat {
  protected readonly i18n = inject(ZUR_I18N);

  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  /** Variação em %, com sinal (12,4 = +12,4%). `null` esconde. */
  readonly delta = input<number | null>(null);
  /** Quando cair é bom (custo, erros): inverte a cor da variação. */
  readonly invert = input(false, { transform: booleanAttribute });
  /** Período de comparação ("vs. mês anterior"). */
  readonly deltaLabel = input('');

  protected readonly direction = computed<'up' | 'down' | 'flat'>(() => {
    const d = this.delta();
    return d === null || d === 0 ? 'flat' : d > 0 ? 'up' : 'down';
  });

  protected readonly tone = computed<'good' | 'bad' | 'flat'>(() => {
    const dir = this.direction();
    if (dir === 'flat') return 'flat';
    return (dir === 'up') !== this.invert() ? 'good' : 'bad';
  });

  protected readonly formatted = computed(() => {
    const d = this.delta();
    if (d === null) return '';
    return new Intl.NumberFormat(this.i18n.locale, {
      style: 'percent',
      maximumFractionDigits: 1,
      signDisplay: 'exceptZero',
    }).format(d / 100);
  });
}
