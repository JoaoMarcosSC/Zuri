import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  numberAttribute,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ZUR_I18N } from '../i18n/i18n';

let nextId = 0;

/**
 * Controle deslizante. Com `range`, tem dois controles e o valor é `[mínimo, máximo]`;
 * sem, é um número. Teclado: setas (±step), PageUp/PageDown (±10 steps), Home/End.
 * Clique na trilha move o controle mais próximo; arrastar funciona com mouse e toque.
 *
 * ```html
 * <zur-slider label="Preço" range [min]="0" [max]="500" [step]="10"
 *   [format]="reais" [(ngModel)]="faixa" />
 * ```
 */
@Component({
  selector: 'zur-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ZurSlider), multi: true }],
  template: `
    <div class="head">
      @if (label()) {
        <span class="label" [id]="id + '-label'">{{ label() }}</span>
      }
      <span class="readout" aria-hidden="true">
        @if (range()) {{{ format()(low()) }} – {{ format()(high()) }}} @else {{{ format()(high()) }}}
      </span>
    </div>
    <div
      class="track"
      [class.disabled]="isDisabled()"
      (pointerdown)="onTrackPointerDown($event)"
      (pointermove)="onPointerMove($event)"
      (pointerup)="dragging = null"
      (pointercancel)="dragging = null"
    >
      <div class="fill" [style.left.%]="range() ? percent(low()) : 0" [style.right.%]="100 - percent(high())"></div>
      @for (thumb of thumbs(); track thumb) {
        <span
          class="thumb"
          role="slider"
          [attr.data-thumb]="thumb"
          [tabindex]="isDisabled() ? -1 : 0"
          [style.left.%]="percent(thumb === 'low' ? low() : high())"
          [attr.aria-valuemin]="thumb === 'high' ? low() : min()"
          [attr.aria-valuemax]="thumb === 'low' && range() ? high() : max()"
          [attr.aria-valuenow]="thumb === 'low' ? low() : high()"
          [attr.aria-valuetext]="format()(thumb === 'low' ? low() : high())"
          [attr.aria-label]="thumbLabel(thumb)"
          [attr.aria-labelledby]="range() ? null : (label() ? id + '-label' : null)"
          [attr.aria-disabled]="isDisabled() || null"
          (keydown)="onKeydown($event, thumb)"
          (blur)="onTouched()"
        ></span>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      user-select: none;
    }
    .head {
      display: flex;
      justify-content: space-between;
      gap: var(--zur-space-sm);
      margin-bottom: var(--zur-space-sm);
    }
    .label {
      font: var(--zur-font-caption);
      color: var(--zur-ink);
    }
    .readout {
      margin-left: auto;
      font: var(--zur-font-caption);
      font-weight: 700;
      color: var(--zur-ink);
      font-variant-numeric: tabular-nums;
    }
    .track {
      position: relative;
      height: 6px;
      margin: 12px 12px;
      border-radius: var(--zur-radius-full);
      background: var(--zur-surface-strong);
      cursor: pointer;
      touch-action: none;
    }
    .track::before {
      /* área de toque maior que a trilha */
      content: '';
      position: absolute;
      inset: -12px -12px;
    }
    .track.disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
    .fill {
      position: absolute;
      top: 0;
      bottom: 0;
      border-radius: var(--zur-radius-full);
      background: var(--zur-primary);
    }
    .thumb {
      position: absolute;
      top: 50%;
      width: 24px;
      height: 24px;
      margin: -12px 0 0 -12px;
      box-sizing: border-box;
      border-radius: var(--zur-radius-full);
      background: var(--zur-canvas);
      border: 2px solid var(--zur-primary-active);
      cursor: grab;
      transition: transform 120ms ease;
    }
    .thumb:hover {
      transform: scale(1.08);
    }
    .thumb:focus-visible {
      outline: none;
      box-shadow: var(--zur-focus-ring);
    }
  `,
})
export class ZurSlider implements ControlValueAccessor {
  protected readonly i18n = inject(ZUR_I18N);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly label = input('');
  readonly min = input(0, { transform: numberAttribute });
  readonly max = input(100, { transform: numberAttribute });
  readonly step = input(1, { transform: numberAttribute });
  /** Dois controles: o valor vira `[mínimo, máximo]`. */
  readonly range = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Como mostrar/anunciar o valor (ex.: moeda). */
  readonly format = input<(value: number) => string>((v) => String(v));

  protected readonly id = `zur-slider-${nextId++}`;
  /** `null` = ainda sem valor: usa o padrão (mínimo, ou a trilha toda no modo faixa). */
  private readonly lowValue = signal<number | null>(null);
  private readonly highValue = signal<number | null>(null);
  protected readonly low = computed(() => this.lowValue() ?? this.min());
  protected readonly high = computed(() => this.highValue() ?? (this.range() ? this.max() : this.min()));
  protected readonly cvaDisabled = signal(false);
  protected dragging: 'low' | 'high' | null = null;

  protected readonly thumbs = computed<('low' | 'high')[]>(() => (this.range() ? ['low', 'high'] : ['high']));

  protected onChange: (value: number | [number, number]) => void = () => {};
  protected onTouched: () => void = () => {};

  /** No modo simples o valor vive em `high`; `low` é o mínimo da trilha. */
  value(): number | [number, number] {
    return this.range() ? [this.low(), this.high()] : this.high();
  }

  protected isDisabled(): boolean {
    return this.disabled() || this.cvaDisabled();
  }

  protected percent(value: number): number {
    const span = this.max() - this.min();
    return span <= 0 ? 0 : ((value - this.min()) / span) * 100;
  }

  protected thumbLabel(thumb: 'low' | 'high'): string | null {
    if (!this.range()) return this.label() ? null : this.i18n.maximum;
    const which = thumb === 'low' ? this.i18n.minimum : this.i18n.maximum;
    return this.label() ? `${this.label()}: ${which}` : which;
  }

  private snap(value: number): number {
    const step = this.step() || 1;
    const snapped = Math.round((value - this.min()) / step) * step + this.min();
    const decimals = (String(step).split('.')[1] ?? '').length;
    return Math.min(this.max(), Math.max(this.min(), Number(snapped.toFixed(decimals))));
  }

  /** Atualiza um controle respeitando o outro (low ≤ high). */
  setThumb(thumb: 'low' | 'high', raw: number): void {
    let value = this.snap(raw);
    if (this.range()) {
      if (thumb === 'low') value = Math.min(value, this.high());
      else value = Math.max(value, this.low());
    }
    if ((thumb === 'low' ? this.low() : this.high()) === value) return;
    (thumb === 'low' ? this.lowValue : this.highValue).set(value);
    this.onChange(this.value());
  }

  protected onKeydown(event: KeyboardEvent, thumb: 'low' | 'high'): void {
    if (this.isDisabled()) return;
    const current = thumb === 'low' ? this.low() : this.high();
    const step = this.step() || 1;
    let next: number;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        next = current + step;
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        next = current - step;
        break;
      case 'PageUp':
        next = current + step * 10;
        break;
      case 'PageDown':
        next = current - step * 10;
        break;
      case 'Home':
        next = this.min();
        break;
      case 'End':
        next = this.max();
        break;
      default:
        return;
    }
    event.preventDefault();
    this.setThumb(thumb, next);
  }

  private valueAt(clientX: number): number {
    const rect = (this.host.nativeElement.querySelector('.track') as HTMLElement).getBoundingClientRect();
    const ratio = rect.width ? (clientX - rect.left) / rect.width : 0;
    return this.min() + Math.min(1, Math.max(0, ratio)) * (this.max() - this.min());
  }

  protected onTrackPointerDown(event: PointerEvent): void {
    if (this.isDisabled()) return;
    event.preventDefault();
    const value = this.valueAt(event.clientX);
    const thumb: 'low' | 'high' =
      this.range() && Math.abs(value - this.low()) <= Math.abs(value - this.high()) ? 'low' : 'high';
    this.dragging = thumb;
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
    this.setThumb(thumb, value);
    this.host.nativeElement.querySelector<HTMLElement>(`[data-thumb="${thumb}"]`)?.focus();
  }

  protected onPointerMove(event: PointerEvent): void {
    if (this.dragging) this.setThumb(this.dragging, this.valueAt(event.clientX));
  }

  writeValue(value: number | [number, number] | null): void {
    if (Array.isArray(value)) {
      this.lowValue.set(value[0]);
      this.highValue.set(value[1]);
    } else if (typeof value === 'number') {
      this.lowValue.set(null);
      this.highValue.set(value);
    } else {
      this.lowValue.set(null);
      this.highValue.set(null);
    }
  }
  registerOnChange(fn: (value: number | [number, number]) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }
}
