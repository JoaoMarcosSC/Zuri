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

/** Checkbox 20px — marcado em menta com check em tinta profunda. */
@Component({
  selector: 'zur-checkbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ZurCheckbox),
      multi: true,
    },
  ],
  template: `
    <label class="row" [class.disabled]="isDisabled()">
      <input
        type="checkbox"
        class="native"
        [id]="id"
        [checked]="checked()"
        [disabled]="isDisabled()"
        (change)="onToggle($event)"
        (blur)="onTouched()"
      />
      <span class="box" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="m5 13 4 4L19 7" />
        </svg>
      </span>
      <span class="text"><ng-content /></span>
    </label>
  `,
  styles: `
    .row {
      display: inline-flex;
      align-items: center;
      gap: var(--zur-space-sm);
      cursor: pointer;
      font: var(--zur-font-body);
      color: var(--zur-body);
    }
    .row.disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
    .native {
      position: absolute;
      opacity: 0;
      width: 20px;
      height: 20px;
      margin: 0;
      cursor: inherit;
    }
    .box {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--zur-hairline);
      border-radius: var(--zur-radius-xs);
      background: var(--zur-canvas);
      color: transparent;
      transition: background-color 120ms ease, border-color 120ms ease;
    }
    .native:checked + .box {
      background: var(--zur-primary);
      border-color: var(--zur-primary);
      color: var(--zur-on-primary);
    }
    .native:focus-visible + .box {
      box-shadow: var(--zur-focus-ring);
    }
  `,
})
export class ZurCheckbox implements ControlValueAccessor {
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly id = `zur-checkbox-${nextId++}`;
  protected readonly checked = signal(false);
  protected readonly cvaDisabled = signal(false);

  protected onChange: (value: boolean) => void = () => {};
  protected onTouched: () => void = () => {};

  protected isDisabled(): boolean {
    return this.disabled() || this.cvaDisabled();
  }

  protected onToggle(event: Event): void {
    const next = (event.target as HTMLInputElement).checked;
    this.checked.set(next);
    this.onChange(next);
  }

  writeValue(value: boolean | null): void {
    this.checked.set(!!value);
  }
  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }
}
