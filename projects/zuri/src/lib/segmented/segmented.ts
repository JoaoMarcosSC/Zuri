import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface ZurSegmentedOption {
  value: string;
  label: string;
}

export type ZurSegmentedSize = 'sm' | 'md';

/**
 * Alternador em pílulas para poucas opções mutuamente exclusivas (visão em
 * lista/grade, período). É um `radiogroup`: setas trocam a opção, Tab sai do grupo.
 *
 * ```html
 * <zur-segmented label="Visualização" [options]="visoes" [(ngModel)]="visao" />
 * ```
 */
@Component({
  selector: 'zur-segmented',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ZurSegmented), multi: true }],
  host: {
    role: 'radiogroup',
    '[attr.aria-label]': 'label() || null',
    '[attr.aria-disabled]': 'isDisabled() || null',
    '[attr.data-size]': 'size()',
    '(keydown)': 'onKeydown($event)',
  },
  template: `
    @for (opt of options(); track opt.value; let i = $index) {
      <button
        type="button"
        role="radio"
        class="segment"
        [attr.aria-checked]="opt.value === value()"
        [tabindex]="isTabStop(i) ? 0 : -1"
        [disabled]="isDisabled()"
        (click)="select(opt.value)"
        (blur)="onTouched()"
      >
        {{ opt.label }}
      </button>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      gap: 2px;
      padding: 3px;
      border-radius: var(--zur-radius-full);
      background: var(--zur-surface-strong);
    }
    .segment {
      height: 38px;
      padding: 0 var(--zur-space-md);
      border: 1px solid transparent;
      border-radius: var(--zur-radius-full);
      background: transparent;
      font: var(--zur-font-button);
      font-size: 15px;
      color: var(--zur-body);
      cursor: pointer;
      white-space: nowrap;
      transition: background-color 120ms ease, color 120ms ease;
    }
    :host([data-size='sm']) .segment {
      height: 30px;
      padding: 0 var(--zur-space-sm);
      font-size: 13px;
    }
    .segment:hover:not(:disabled) {
      color: var(--zur-ink);
    }
    .segment[aria-checked='true'] {
      background: var(--zur-surface-raised);
      border-color: var(--zur-hairline);
      color: var(--zur-ink);
    }
    .segment:focus-visible {
      outline: none;
      box-shadow: var(--zur-focus-ring);
    }
    .segment:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
  `,
})
export class ZurSegmented implements ControlValueAccessor {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly label = input('');
  readonly options = input<ZurSegmentedOption[]>([]);
  readonly size = input<ZurSegmentedSize>('md');
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly value = signal<string | null>(null);
  protected readonly cvaDisabled = signal(false);

  protected onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

  protected isDisabled(): boolean {
    return this.disabled() || this.cvaDisabled();
  }

  /** O item marcado (ou o primeiro, se nenhum) recebe o Tab. */
  protected isTabStop(i: number): boolean {
    const selected = this.options().findIndex((o) => o.value === this.value());
    return selected >= 0 ? i === selected : i === 0;
  }

  select(value: string): void {
    if (this.isDisabled() || value === this.value()) return;
    this.value.set(value);
    this.onChange(value);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const opts = this.options();
    if (!opts.length || this.isDisabled()) return;
    const current = Math.max(0, opts.findIndex((o) => o.value === this.value()));
    let next = current;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (current + 1) % opts.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (current - 1 + opts.length) % opts.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = opts.length - 1;
    else return;
    event.preventDefault();
    this.select(opts[next].value);
    this.host.nativeElement.querySelectorAll<HTMLElement>('.segment')[next]?.focus();
  }

  writeValue(value: string | null): void {
    this.value.set(value ?? null);
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
