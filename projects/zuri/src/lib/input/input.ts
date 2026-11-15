import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let nextId = 0;

/**
 * Campo de texto do Zuri — 56px, label em caption acima,
 * foco com borda 2px ink (sem glow, Airbnb), erro em vermelho semântico.
 */
@Component({
  selector: 'zur-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ZurInput),
      multi: true,
    },
  ],
  template: `
    @if (label()) {
      <label class="label" [for]="id">{{ label() }}</label>
    }
    <input
      [id]="id"
      class="field"
      [class.has-error]="!!error()"
      [type]="type()"
      [placeholder]="placeholder()"
      [value]="value()"
      [disabled]="isDisabled()"
      (input)="onInput($event)"
      (blur)="onTouched()"
      [attr.aria-invalid]="error() ? true : null"
      [attr.aria-describedby]="describedBy"
    />
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
      margin-bottom: var(--zur-space-xxs);
    }
    .field {
      width: 100%;
      box-sizing: border-box;
      height: var(--zur-control-height-lg);
      padding: 0 var(--zur-space-md);
      font: var(--zur-font-body);
      color: var(--zur-ink);
      background: var(--zur-canvas);
      border: 1px solid var(--zur-hairline);
      border-radius: var(--zur-radius-sm);
      transition: border-color 120ms ease;
    }
    .field::placeholder {
      color: var(--zur-muted);
    }
    .field:focus {
      outline: none;
      border: 2px solid var(--zur-ink);
      padding: 0 calc(var(--zur-space-md) - 1px);
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
    .help {
      margin: var(--zur-space-xxs) 0 0;
      font: var(--zur-font-caption);
      color: var(--zur-muted);
    }
    .help.error {
      color: var(--zur-error);
    }
  `,
})
export class ZurInput implements ControlValueAccessor {
  readonly label = input('');
  readonly type = input('text');
  readonly placeholder = input('');
  readonly hint = input('');
  readonly error = input('');
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly id = `zur-input-${nextId++}`;
  protected readonly value = signal('');
  protected readonly cvaDisabled = signal(false);

  protected onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

  protected isDisabled(): boolean {
    return this.disabled() || this.cvaDisabled();
  }

  protected get describedBy(): string | null {
    if (this.error()) {
      return `${this.id}-error`;
    }
    return this.hint() ? `${this.id}-hint` : null;
  }

  protected onInput(event: Event): void {
    const next = (event.target as HTMLInputElement).value;
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
