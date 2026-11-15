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
 * Radio 20px do Zuri. Vincule todos os radios de um grupo ao mesmo
 * FormControl/ngModel e dê a eles o mesmo `name`.
 */
@Component({
  selector: 'zur-radio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ZurRadio),
      multi: true,
    },
  ],
  template: `
    <label class="row" [class.disabled]="isDisabled()">
      <input
        type="radio"
        class="native"
        [id]="id"
        [name]="name()"
        [checked]="checked()"
        [disabled]="isDisabled()"
        (change)="onSelect()"
        (blur)="onTouched()"
      />
      <span class="dot" aria-hidden="true"></span>
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
    .dot {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      border: 2px solid var(--zur-hairline);
      border-radius: var(--zur-radius-full);
      background: var(--zur-canvas);
      position: relative;
      transition: border-color 120ms ease;
      box-sizing: border-box;
    }
    .dot::after {
      content: '';
      position: absolute;
      inset: 3px;
      border-radius: var(--zur-radius-full);
      background: var(--zur-primary);
      transform: scale(0);
      transition: transform 140ms ease;
    }
    .native:checked + .dot {
      border-color: var(--zur-primary);
    }
    .native:checked + .dot::after {
      transform: scale(1);
    }
    .native:focus-visible + .dot {
      box-shadow: var(--zur-focus-ring);
    }
  `,
})
export class ZurRadio implements ControlValueAccessor {
  readonly value = input.required<string>();
  readonly name = input('zur-radio-group');
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly id = `zur-radio-${nextId++}`;
  protected readonly model = signal<string | null>(null);
  protected readonly cvaDisabled = signal(false);

  protected onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

  protected checked(): boolean {
    return this.model() === this.value();
  }

  protected isDisabled(): boolean {
    return this.disabled() || this.cvaDisabled();
  }

  protected onSelect(): void {
    this.model.set(this.value());
    this.onChange(this.value());
  }

  writeValue(value: string | null): void {
    this.model.set(value);
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
