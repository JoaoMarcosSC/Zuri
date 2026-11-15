import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ZUR_I18N } from '../i18n/i18n';

export type ZurProgressSize = 'sm' | 'md';

/**
 * Barra de progresso linear. Com `value` (0 a `max`) é determinada; sem `value`
 * (ou `null`), fica indeterminada, com animação contínua.
 *
 * ```html
 * <zur-progress [value]="60" label="Enviando arquivo" />
 * <zur-progress />  <!-- indeterminada -->
 * ```
 */
@Component({
  selector: 'zur-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'progressbar',
    '[attr.aria-label]': 'label() || i18n.progress',
    '[attr.aria-valuemin]': 'indeterminate() ? null : 0',
    '[attr.aria-valuemax]': 'indeterminate() ? null : max()',
    '[attr.aria-valuenow]': 'indeterminate() ? null : clamped()',
    '[attr.data-size]': 'size()',
    '[attr.data-indeterminate]': 'indeterminate() ? "" : null',
  },
  template: `<span class="fill" [style.width.%]="indeterminate() ? null : percent()"></span>`,
  styles: `
    :host {
      display: block;
      position: relative;
      overflow: hidden;
      width: 100%;
      height: 8px;
      border-radius: var(--zur-radius-full);
      background: var(--zur-surface-strong);
    }
    :host([data-size='sm']) {
      height: 4px;
    }
    .fill {
      display: block;
      height: 100%;
      border-radius: inherit;
      background: var(--zur-primary);
      transition: width 200ms ease;
    }
    :host([data-indeterminate]) .fill {
      position: absolute;
      width: 40%;
      animation: zur-progress-slide 1.2s ease-in-out infinite;
    }
    @keyframes zur-progress-slide {
      from { left: -40%; }
      to { left: 100%; }
    }
    @media (prefers-reduced-motion: reduce) {
      :host([data-indeterminate]) .fill {
        animation: none;
        left: 0;
        width: 100%;
        opacity: 0.5;
      }
    }
  `,
})
export class ZurProgress {
  protected readonly i18n = inject(ZUR_I18N);

  /** Valor atual (0 a `max`). `null` = indeterminada. */
  readonly value = input<number | null>(null);
  readonly max = input(100);
  readonly size = input<ZurProgressSize>('md');
  /** Rótulo para leitores de tela. Padrão: "Progresso". */
  readonly label = input('');

  protected readonly indeterminate = computed(() => this.value() === null || this.value() === undefined);
  protected readonly clamped = computed(() => Math.min(Math.max(this.value() ?? 0, 0), this.max()));
  protected readonly percent = computed(() => (this.max() > 0 ? (this.clamped() / this.max()) * 100 : 0));
}
