import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface ZurSelectOption {
  value: string;
  label: string;
}

let nextId = 0;

/** Select do Zuri — mesmo chrome do input, seta customizada, nativo por baixo. */
@Component({
  selector: 'zur-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ZurSelect),
      multi: true,
    },
  ],
  template: `
    @if (label()) {
      <label class="label" [for]="id">{{ label() }}</label>
    }
    <div class="wrap">
      <select
        [id]="id"
        class="field"
        [disabled]="isDisabled()"
        (change)="onSelect($event)"
        (blur)="onTouched()"
      >
        @if (placeholder()) {
          <option value="" disabled [selected]="!value()">
            {{ placeholder() }}
          </option>
        }
        @for (opt of options(); track opt.value) {
          <option [value]="opt.value" [selected]="opt.value === value()">
            {{ opt.label }}
          </option>
        }
      </select>
      <svg class="chevron" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <path d="m6 9 6 6 6-6" />
      </svg>
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
    .wrap {
      position: relative;
    }
    .field {
      width: 100%;
      box-sizing: border-box;
      height: var(--zur-control-height-lg);
      padding-block: 0;
      padding-inline: var(--zur-space-md) var(--zur-space-xxl);
      font: var(--zur-font-body);
      color: var(--zur-ink);
      background: var(--zur-canvas);
      border: 1px solid var(--zur-hairline);
      border-radius: var(--zur-radius-sm);
      appearance: none;
      cursor: pointer;
      transition: border-color 120ms ease;
    }
    .field:focus {
      outline: none;
      border: 2px solid var(--zur-ink);
    }
    .field:disabled {
      background: var(--zur-surface-soft);
      color: var(--zur-muted);
      cursor: not-allowed;
    }
    .chevron {
      position: absolute;
      inset-inline-end: var(--zur-space-md);
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
      color: var(--zur-muted);
    }
  `,
})
export class ZurSelect implements ControlValueAccessor {
  readonly label = input('');
  readonly placeholder = input('');
  readonly options = input<ZurSelectOption[]>([]);
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly id = `zur-select-${nextId++}`;
  protected readonly value = signal('');
  protected readonly cvaDisabled = signal(false);

  protected onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

  protected isDisabled(): boolean {
    return this.disabled() || this.cvaDisabled();
  }

  protected onSelect(event: Event): void {
    const next = (event.target as HTMLSelectElement).value;
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
