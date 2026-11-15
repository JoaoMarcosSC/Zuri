import {
  ChangeDetectionStrategy,
  Component,
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

/** Casas decimais de um passo (0.25 → 2). */
function decimalsOf(step: number): number {
  const text = String(step);
  const dot = text.indexOf('.');
  return dot < 0 ? 0 : text.length - dot - 1;
}

/**
 * Lê um número digitado em qualquer formato comum: "1.234,5", "1,234.5", "12,5", "12.5".
 * O último separador é o decimal. Devolve `null` se não houver número.
 */
export function zurParseNumber(text: string): number | null {
  const clean = text.replace(/[^\d.,\-−]/g, '').replace('−', '-');
  if (!/\d/.test(clean)) return null;
  const lastDot = clean.lastIndexOf('.');
  const lastComma = clean.lastIndexOf(',');
  const decimalAt = Math.max(lastDot, lastComma);
  let normalized: string;
  if (lastDot >= 0 && lastComma >= 0) {
    normalized = clean.slice(0, decimalAt).replace(/[.,]/g, '') + '.' + clean.slice(decimalAt + 1);
  } else if (decimalAt >= 0) {
    // um só tipo de separador: se aparece mais de uma vez é milhar ("1.234.567")
    const count = (clean.match(/[.,]/g) ?? []).length;
    normalized = count > 1 ? clean.replace(/[.,]/g, '') : clean.replace(',', '.');
  } else {
    normalized = clean;
  }
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

/**
 * Campo numérico com botões − / +. Setas ↑↓ mudam por `step`, PageUp/PageDown por 10 passos,
 * Home/End vão a `min`/`max`. O valor é `number | null` e é limitado a `min`/`max`.
 *
 * ```html
 * <zur-number-input label="Quantidade" [min]="1" [max]="20" [(ngModel)]="qtd" />
 * ```
 */
@Component({
  selector: 'zur-number-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ZurNumberInput), multi: true }],
  template: `
    @if (label()) {
      <label class="label" [for]="id">{{ label() }}</label>
    }
    <div class="control" [class.has-error]="!!error()" [class.disabled]="isDisabled()">
      <button
        type="button"
        class="step"
        tabindex="-1"
        [attr.aria-label]="i18n.decrease"
        [disabled]="isDisabled() || atMin()"
        (click)="stepBy(-1)"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14" /></svg>
      </button>
      <input
        [id]="id"
        class="field"
        type="text"
        role="spinbutton"
        inputmode="decimal"
        autocomplete="off"
        [placeholder]="placeholder()"
        [value]="text()"
        [disabled]="isDisabled()"
        [attr.aria-valuenow]="value()"
        [attr.aria-valuemin]="min()"
        [attr.aria-valuemax]="max()"
        [attr.aria-invalid]="error() ? true : null"
        [attr.aria-describedby]="error() ? id + '-error' : hint() ? id + '-hint' : null"
        (input)="onInput($event)"
        (keydown)="onKeydown($event)"
        (blur)="commit(); onTouched()"
      />
      <button
        type="button"
        class="step"
        tabindex="-1"
        [attr.aria-label]="i18n.increase"
        [disabled]="isDisabled() || atMax()"
        (click)="stepBy(1)"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
      </button>
    </div>
    @if (error()) {
      <p class="help error" [id]="id + '-error'">{{ error() }}</p>
    } @else if (hint()) {
      <p class="help" [id]="id + '-hint'">{{ hint() }}</p>
    }
  `,
  styles: `
    :host {
      display: block;
    }
    .label {
      display: block;
      font: var(--zur-font-caption);
      color: var(--zur-ink);
      margin-block-end: var(--zur-space-xxs);
    }
    .control {
      display: flex;
      align-items: center;
      height: var(--zur-control-height-lg);
      box-sizing: border-box;
      background: var(--zur-canvas);
      border: 1px solid var(--zur-hairline);
      border-radius: var(--zur-radius-sm);
      overflow: hidden;
      transition: border-color 120ms ease;
    }
    .control:focus-within {
      border: 2px solid var(--zur-ink);
    }
    .control.has-error {
      border-color: var(--zur-error);
    }
    .control.disabled {
      background: var(--zur-surface-soft);
    }
    .field {
      flex: 1;
      min-width: 0;
      height: 100%;
      padding: 0 var(--zur-space-xs);
      border: none;
      background: transparent;
      font: var(--zur-font-body);
      font-variant-numeric: tabular-nums;
      color: var(--zur-ink);
      text-align: center;
      outline: none;
    }
    .field::placeholder {
      color: var(--zur-muted);
    }
    .field:disabled {
      color: var(--zur-muted);
      cursor: not-allowed;
    }
    .step {
      width: 48px;
      height: 100%;
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      color: var(--zur-ink);
      cursor: pointer;
    }
    .step:hover:not(:disabled) {
      background: var(--zur-surface-soft);
    }
    .step:disabled {
      color: var(--zur-muted);
      opacity: 0.45;
      cursor: not-allowed;
    }
    .help {
      margin: var(--zur-space-xxs) 0 0;
      font: var(--zur-font-caption);
      color: var(--zur-muted);
    }
    .help.error {
      color: var(--zur-error-text);
    }
  `,
})
export class ZurNumberInput implements ControlValueAccessor {
  protected readonly i18n = inject(ZUR_I18N);

  readonly label = input('');
  readonly placeholder = input('');
  readonly hint = input('');
  readonly error = input('');
  readonly min = input<number | null, unknown>(null, { transform: toNumberOrNull });
  readonly max = input<number | null, unknown>(null, { transform: toNumberOrNull });
  readonly step = input(1, { transform: numberAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly id = `zur-number-input-${nextId++}`;
  readonly value = signal<number | null>(null);
  /** Texto enquanto o usuário digita; `null` = mostrar o valor formatado. */
  private readonly typed = signal<string | null>(null);
  protected readonly cvaDisabled = signal(false);

  protected onChange: (value: number | null) => void = () => {};
  protected onTouched: () => void = () => {};

  protected readonly text = computed(() => {
    const typed = this.typed();
    if (typed !== null) return typed;
    const v = this.value();
    if (v === null) return '';
    return new Intl.NumberFormat(this.i18n.locale, {
      maximumFractionDigits: Math.max(decimalsOf(this.step()), 0),
    }).format(v);
  });

  protected readonly atMin = computed(() => this.min() !== null && (this.value() ?? -Infinity) <= this.min()!);
  protected readonly atMax = computed(() => this.max() !== null && (this.value() ?? Infinity) >= this.max()!);

  protected isDisabled(): boolean {
    return this.disabled() || this.cvaDisabled();
  }

  private clamp(value: number): number {
    const min = this.min();
    const max = this.max();
    if (min !== null && value < min) value = min;
    if (max !== null && value > max) value = max;
    return Number(value.toFixed(Math.max(decimalsOf(this.step()), 0) + 2));
  }

  private setValue(next: number | null): void {
    const value = next === null ? null : this.clamp(next);
    this.typed.set(null);
    if (value === this.value()) return;
    this.value.set(value);
    this.onChange(value);
  }

  /** Soma `direction` passos (negativo diminui). Sem valor, parte do mínimo ou de zero. */
  stepBy(direction: number, multiplier = 1): void {
    if (this.isDisabled()) return;
    const base = this.value() ?? (direction > 0 ? (this.min() ?? 0) - this.step() * direction : (this.max() ?? 0));
    this.setValue(base + this.step() * multiplier * direction);
  }

  protected onInput(event: Event): void {
    this.typed.set((event.target as HTMLInputElement).value);
  }

  /** Converte o texto digitado em número (ao sair do campo ou com Enter). */
  protected commit(): void {
    const typed = this.typed();
    if (typed === null) return;
    this.setValue(typed.trim() === '' ? null : zurParseNumber(typed));
  }

  protected onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        this.commit();
        this.stepBy(1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.commit();
        this.stepBy(-1);
        break;
      case 'PageUp':
        event.preventDefault();
        this.stepBy(1, 10);
        break;
      case 'PageDown':
        event.preventDefault();
        this.stepBy(-1, 10);
        break;
      case 'Home':
        if (this.min() !== null) {
          event.preventDefault();
          this.setValue(this.min());
        }
        break;
      case 'End':
        if (this.max() !== null) {
          event.preventDefault();
          this.setValue(this.max());
        }
        break;
      case 'Enter':
        this.commit();
        break;
    }
  }

  writeValue(value: number | null): void {
    this.typed.set(null);
    this.value.set(typeof value === 'number' && Number.isFinite(value) ? value : null);
  }
  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }
}

function toNumberOrNull(v: unknown): number | null {
  return v === null || v === undefined || v === '' ? null : numberAttribute(v);
}
