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

/**
 * Área de texto do Zuri: mesmo visual do `zur-input`, com contador opcional
 * quando `maxlength` é definido. Funciona com `ngModel` e formulários reativos.
 *
 * ```html
 * <zur-textarea label="Mensagem" [maxlength]="200" [(ngModel)]="mensagem" />
 * ```
 */
@Component({
  selector: 'zur-textarea',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ZurTextarea), multi: true }],
  template: `
    @if (label()) {
      <label class="label" [for]="id">{{ label() }}</label>
    }
    <textarea
      [id]="id"
      class="field"
      [class.has-error]="!!error()"
      [rows]="rows()"
      [placeholder]="placeholder()"
      [attr.maxlength]="maxlength()"
      [value]="value()"
      [disabled]="isDisabled()"
      (input)="onInput($event)"
      (blur)="onTouched()"
      [attr.aria-invalid]="error() ? true : null"
      [attr.aria-describedby]="describedBy()"
    ></textarea>
    <div class="foot">
      @if (error()) {
        <p class="help error" [id]="id + '-error'">{{ error() }}</p>
      } @else if (hint()) {
        <p class="help" [id]="id + '-hint'">{{ hint() }}</p>
      }
      @if (maxlength()) {
        <span class="count" aria-hidden="true">{{ value().length }}/{{ maxlength() }}</span>
        <span class="sr-only" [id]="id + '-count'">{{ i18n.characterCount(value().length, maxlength()!) }}</span>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .label {
      display: block;
      font: var(--zur-font-caption);
      color: var(--zur-ink);
      margin-bottom: var(--zur-space-xxs);
    }
    .field {
      display: block;
      width: 100%;
      box-sizing: border-box;
      min-height: var(--zur-control-height-lg);
      padding: var(--zur-space-sm) var(--zur-space-md);
      font: var(--zur-font-body);
      color: var(--zur-ink);
      background: var(--zur-canvas);
      border: 1px solid var(--zur-hairline);
      border-radius: var(--zur-radius-sm);
      resize: vertical;
      transition: border-color 120ms ease;
    }
    .field::placeholder {
      color: var(--zur-muted);
    }
    .field:focus {
      outline: none;
      border: 2px solid var(--zur-ink);
      padding: calc(var(--zur-space-sm) - 1px) calc(var(--zur-space-md) - 1px);
    }
    .field:disabled {
      background: var(--zur-surface-soft);
      color: var(--zur-muted);
      cursor: not-allowed;
    }
    .field.has-error {
      border-color: var(--zur-error);
    }
    .field.has-error:focus {
      border: 2px solid var(--zur-error);
    }
    .foot {
      display: flex;
      justify-content: space-between;
      gap: var(--zur-space-sm);
    }
    .help,
    .count {
      margin: var(--zur-space-xxs) 0 0;
      font: var(--zur-font-caption);
      color: var(--zur-muted);
    }
    .help.error {
      color: var(--zur-error-text);
    }
    .count {
      margin-left: auto;
      font-variant-numeric: tabular-nums;
    }
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
  `,
})
export class ZurTextarea implements ControlValueAccessor {
  protected readonly i18n = inject(ZUR_I18N);

  readonly label = input('');
  readonly placeholder = input('');
  readonly hint = input('');
  readonly error = input('');
  readonly rows = input(4, { transform: numberAttribute });
  /** Limite de caracteres; quando definido, mostra o contador. */
  readonly maxlength = input<number | null, unknown>(null, {
    transform: (v: unknown) => (v === null || v === undefined || v === '' ? null : numberAttribute(v)),
  });
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly id = `zur-textarea-${nextId++}`;
  protected readonly value = signal('');
  protected readonly cvaDisabled = signal(false);

  protected onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

  protected readonly describedBy = computed(() => {
    const ids = [];
    if (this.error()) ids.push(`${this.id}-error`);
    else if (this.hint()) ids.push(`${this.id}-hint`);
    if (this.maxlength()) ids.push(`${this.id}-count`);
    return ids.length ? ids.join(' ') : null;
  });

  protected isDisabled(): boolean {
    return this.disabled() || this.cvaDisabled();
  }

  protected onInput(event: Event): void {
    const next = (event.target as HTMLTextAreaElement).value;
    this.value.set(next);
    this.onChange(next);
  }

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }
}
