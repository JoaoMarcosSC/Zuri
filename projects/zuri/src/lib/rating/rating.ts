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
import { zurInlineStep } from '../shared/direction';

let nextId = 0;

const STAR = 'M12 2.8l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.7 6.1 20.8l1.2-6.5L2.5 9.7l6.6-.9z';

/**
 * Avaliação por estrelas. Editável, é um `radiogroup` (setas trocam a nota) e funciona com
 * `ngModel`/formulários. Com `readonly`, é uma imagem com texto ("4,5 de 5") e aceita
 * valores fracionários. As estrelas são em ink (como no Airbnb): menta fica para ação.
 *
 * ```html
 * <zur-rating label="Sua nota" [(ngModel)]="nota" />
 * <zur-rating readonly [value]="4.5" />
 * ```
 */
@Component({
  selector: 'zur-rating',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ZurRating), multi: true }],
  host: {
    '[attr.role]': 'readonly() ? "img" : "radiogroup"',
    '[attr.aria-label]': 'readonly() ? summary() : (label() || null)',
    '[attr.aria-disabled]': 'isDisabled() || null',
    '[attr.data-size]': 'size()',
    '(keydown)': 'onKeydown($event)',
    '(mouseleave)': 'hover.set(0)',
  },
  template: `
    @for (n of stars(); track n) {
      @if (readonly()) {
        <span class="star" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="1em" height="1em">
            <defs>
              <clipPath [id]="uid + '-' + n"><rect x="0" y="0" [attr.width]="fill(n) * 24" height="24" /></clipPath>
            </defs>
            <path class="empty" [attr.d]="path" />
            <path class="full" [attr.d]="path" [attr.clip-path]="'url(#' + uid + '-' + n + ')'" />
          </svg>
        </span>
      } @else {
        <button
          type="button"
          class="star"
          role="radio"
          [attr.aria-checked]="value() === n"
          [attr.aria-label]="i18n.ratingStar(n)"
          [tabindex]="isTabStop(n) ? 0 : -1"
          [disabled]="isDisabled()"
          (click)="choose(n)"
          (mouseenter)="hover.set(n)"
          (blur)="onTouched()"
        >
          <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
            <path [class.full]="n <= shown()" [class.empty]="n > shown()" [attr.d]="path" />
          </svg>
        </button>
      }
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      gap: 2px;
      font-size: 24px;
      color: var(--zur-ink);
    }
    :host([data-size='sm']) {
      font-size: 16px;
    }
    :host([data-size='lg']) {
      font-size: 32px;
    }
    .star {
      display: inline-flex;
      padding: 0;
      border: none;
      background: none;
      font-size: inherit;
      line-height: 1;
      color: inherit;
    }
    button.star {
      cursor: pointer;
      border-radius: var(--zur-radius-xs);
    }
    button.star:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
    button.star:focus-visible {
      outline: none;
      box-shadow: var(--zur-focus-ring);
    }
    svg {
      display: block;
    }
    .full {
      fill: currentColor;
      stroke: currentColor;
      stroke-width: 1.2;
      stroke-linejoin: round;
    }
    .empty {
      fill: none;
      stroke: var(--zur-muted);
      stroke-width: 1.4;
      stroke-linejoin: round;
    }
  `,
})
export class ZurRating implements ControlValueAccessor {
  protected readonly i18n = inject(ZUR_I18N);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly label = input('');
  readonly max = input(5, { transform: numberAttribute });
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  /** Só mostra a nota (aceita fração, ex.: 4,5). */
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Nota exibida no modo `readonly` quando não há formulário ligado. */
  readonly valueInput = input<number | null, unknown>(null, {
    alias: 'value',
    transform: (v: unknown) => (v === null || v === undefined || v === '' ? null : numberAttribute(v)),
  });

  protected readonly uid = `zur-rating-${nextId++}`;
  protected readonly path = STAR;
  private readonly model = signal<number | null>(null);
  protected readonly hover = signal(0);
  protected readonly cvaDisabled = signal(false);

  protected onChange: (value: number) => void = () => {};
  protected onTouched: () => void = () => {};

  readonly value = computed(() => this.model() ?? this.valueInput() ?? 0);
  protected readonly stars = computed(() => Array.from({ length: this.max() }, (_, i) => i + 1));
  protected readonly shown = computed(() => (this.hover() > 0 ? this.hover() : this.value()));
  protected readonly summary = computed(() => this.i18n.ratingValue(this.value(), this.max()));

  protected isDisabled(): boolean {
    return this.disabled() || this.cvaDisabled();
  }

  /** Quanto da estrela `n` é preenchido (0–1), para notas fracionárias. */
  protected fill(n: number): number {
    return Math.max(0, Math.min(1, this.value() - (n - 1)));
  }

  protected isTabStop(n: number): boolean {
    const v = Math.round(this.value());
    return v > 0 ? n === v : n === 1;
  }

  choose(n: number): void {
    if (this.isDisabled() || this.readonly()) return;
    this.model.set(n);
    this.onChange(n);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.readonly() || this.isDisabled()) return;
    const current = Math.round(this.value());
    let next = current;
    const step = zurInlineStep(event, this.host.nativeElement);
    if (step !== 0) next = current + step;
    else if (event.key === 'ArrowUp') next = current + 1;
    else if (event.key === 'ArrowDown') next = current - 1;
    else if (event.key === 'Home') next = 1;
    else if (event.key === 'End') next = this.max();
    else return;
    event.preventDefault();
    next = Math.max(1, Math.min(this.max(), next));
    this.choose(next);
    this.host.nativeElement.querySelectorAll<HTMLElement>('[role=radio]')[next - 1]?.focus();
  }

  writeValue(value: number | null): void {
    this.model.set(typeof value === 'number' ? value : null);
  }
  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }
}
