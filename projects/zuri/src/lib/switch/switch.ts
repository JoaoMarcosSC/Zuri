import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/** Switch pill 44×24px — ligado = menta. */
@Component({
  selector: 'zur-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ZurSwitch),
      multi: true,
    },
  ],
  template: `
    <button
      type="button"
      role="switch"
      class="track"
      [attr.aria-checked]="checked()"
      [disabled]="isDisabled()"
      (click)="toggle()"
      (blur)="onTouched()"
    >
      <span class="thumb" aria-hidden="true"></span>
    </button>
    <span class="text" (click)="toggle()"><ng-content /></span>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: var(--zur-space-sm);
    }
    .track {
      width: 44px;
      height: 24px;
      flex-shrink: 0;
      border: none;
      border-radius: var(--zur-radius-full);
      background: var(--zur-surface-strong);
      position: relative;
      cursor: pointer;
      padding: 0;
      transition: background-color 160ms ease;
    }
    .track[aria-checked='true'] {
      background: var(--zur-primary);
    }
    .track:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
    .track:focus-visible {
      outline: none;
      box-shadow: var(--zur-focus-ring);
    }
    .thumb {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 18px;
      height: 18px;
      border-radius: var(--zur-radius-full);
      background: #ffffff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
      transition: transform 160ms ease;
    }
    .track[aria-checked='true'] .thumb {
      transform: translateX(20px);
    }
    .text {
      font: var(--zur-font-body);
      color: var(--zur-body);
      cursor: pointer;
    }
    .text:empty {
      display: none;
    }
  `,
})
export class ZurSwitch implements ControlValueAccessor {
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly checked = signal(false);
  protected readonly cvaDisabled = signal(false);

  protected onChange: (value: boolean) => void = () => {};
  protected onTouched: () => void = () => {};

  protected isDisabled(): boolean {
    return this.disabled() || this.cvaDisabled();
  }

  protected toggle(): void {
    if (this.isDisabled()) {
      return;
    }
    const next = !this.checked();
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
