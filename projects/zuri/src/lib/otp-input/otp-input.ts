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
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ZUR_I18N } from '../i18n/i18n';

let nextId = 0;

/**
 * Código de verificação em caixinhas (SMS, e-mail, 2FA). Digitar avança, Backspace volta,
 * ←/→ andam entre as caixas e colar distribui os caracteres. O valor é a string digitada;
 * `completed` dispara quando todas as caixas estão preenchidas. As caixas sempre seguem a
 * ordem esquerda→direita, mesmo em páginas RTL (números não se invertem).
 *
 * ```html
 * <zur-otp-input label="Código enviado por SMS" [length]="6" (completed)="verificar($event)" />
 * ```
 */
@Component({
  selector: 'zur-otp-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ZurOtpInput), multi: true }],
  template: `
    @if (label()) {
      <span class="label" [id]="id + '-label'">{{ label() }}</span>
    }
    <div
      class="boxes"
      dir="ltr"
      role="group"
      [attr.aria-labelledby]="label() ? id + '-label' : null"
      [attr.aria-label]="label() ? null : i18n.otpGroup"
      (paste)="onPaste($event)"
    >
      @for (box of boxes(); track $index; let i = $index) {
        <input
          class="box"
          [class.has-error]="!!error()"
          [attr.maxlength]="i === 0 ? length() : 1"
          [attr.inputmode]="mode() === 'numeric' ? 'numeric' : 'text'"
          [attr.autocomplete]="i === 0 ? 'one-time-code' : 'off'"
          autocapitalize="off"
          [attr.aria-label]="i18n.otpDigit(i + 1, length())"
          [attr.aria-invalid]="error() ? true : null"
          [attr.aria-describedby]="error() ? id + '-error' : null"
          [type]="masked() ? 'password' : 'text'"
          [value]="box"
          [disabled]="isDisabled()"
          (input)="onInput(i, $event)"
          (keydown)="onKeydown(i, $event)"
          (focus)="$any($event.target).select()"
          (blur)="onTouched()"
        />
      }
    </div>
    @if (error()) {
      <p class="help error" [id]="id + '-error'">{{ error() }}</p>
    } @else if (hint()) {
      <p class="help">{{ hint() }}</p>
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
    .boxes {
      display: flex;
      gap: var(--zur-space-xs);
    }
    .box {
      width: 48px;
      height: var(--zur-control-height-lg);
      box-sizing: border-box;
      padding: 0;
      text-align: center;
      font: var(--zur-font-title);
      font-variant-numeric: tabular-nums;
      color: var(--zur-ink);
      background: var(--zur-canvas);
      border: 1px solid var(--zur-hairline);
      border-radius: var(--zur-radius-sm);
      transition: border-color 120ms ease;
    }
    .box:focus {
      outline: none;
      border: 2px solid var(--zur-ink);
    }
    .box:disabled {
      background: var(--zur-surface-soft);
      color: var(--zur-muted);
      cursor: not-allowed;
    }
    .box.has-error {
      border-color: var(--zur-error);
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
export class ZurOtpInput implements ControlValueAccessor {
  protected readonly i18n = inject(ZUR_I18N);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly label = input('');
  readonly hint = input('');
  readonly error = input('');
  readonly length = input(6, { transform: numberAttribute });
  /** `numeric` aceita só dígitos; `text` aceita letras e números. */
  readonly mode = input<'numeric' | 'text'>('numeric');
  /** Esconde os caracteres como numa senha. */
  readonly masked = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Todas as caixas preenchidas: emite o código. */
  readonly completed = output<string>();

  protected readonly id = `zur-otp-${nextId++}`;
  private readonly chars = signal<string[]>([]);
  protected readonly cvaDisabled = signal(false);

  protected readonly boxes = computed(() => Array.from({ length: this.length() }, (_, i) => this.chars()[i] ?? ''));
  readonly value = computed(() => this.boxes().join(''));

  protected onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

  protected isDisabled(): boolean {
    return this.disabled() || this.cvaDisabled();
  }

  private accept(text: string): string[] {
    const pattern = this.mode() === 'numeric' ? /\d/ : /[A-Za-z0-9]/;
    return Array.from(text).filter((c) => pattern.test(c));
  }

  private focusBox(i: number): void {
    const boxes = this.host.nativeElement.querySelectorAll<HTMLInputElement>('.box');
    boxes[Math.max(0, Math.min(i, boxes.length - 1))]?.focus();
  }

  /** Escreve `chars` a partir da caixa `start` e devolve a próxima caixa livre. */
  private fill(start: number, incoming: string[]): number {
    const next = this.boxes().slice();
    let i = start;
    for (const c of incoming) {
      if (i >= this.length()) break;
      next[i++] = c;
    }
    this.chars.set(next);
    this.emit();
    return i;
  }

  private emit(): void {
    const code = this.value();
    this.onChange(code);
    if (code.length === this.length() && this.boxes().every(Boolean)) this.completed.emit(code);
  }

  protected onInput(i: number, event: Event): void {
    const field = event.target as HTMLInputElement;
    // A 1ª caixa aceita o código inteiro (preenchimento automático de SMS corta no maxlength).
    // Se já tinha um caractere e vieram mais, o que ficou é o antigo + o novo: só vale o novo.
    const previous = this.boxes()[i];
    let text = field.value;
    if (previous && text.length > 1) text = text.startsWith(previous) ? text.slice(previous.length) : text.endsWith(previous) ? text.slice(0, -previous.length) : text;
    const incoming = this.accept(text);
    if (!incoming.length) {
      // caractere não aceito: volta ao que estava
      field.value = this.boxes()[i];
      return;
    }
    // vários caracteres de uma vez (preenchimento automático do SMS): distribui
    const nextIndex = this.fill(i, incoming);
    field.value = this.boxes()[i];
    this.focusBox(nextIndex);
  }

  protected onKeydown(i: number, event: KeyboardEvent): void {
    switch (event.key) {
      case 'Backspace': {
        event.preventDefault();
        const next = this.boxes().slice();
        if (next[i]) {
          next[i] = '';
          this.chars.set(next);
          this.emit();
        } else if (i > 0) {
          next[i - 1] = '';
          this.chars.set(next);
          this.emit();
          this.focusBox(i - 1);
        }
        break;
      }
      case 'Delete': {
        event.preventDefault();
        const next = this.boxes().slice();
        next[i] = '';
        this.chars.set(next);
        this.emit();
        break;
      }
      case 'ArrowLeft':
        event.preventDefault();
        this.focusBox(i - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.focusBox(i + 1);
        break;
      case 'Home':
        event.preventDefault();
        this.focusBox(0);
        break;
      case 'End':
        event.preventDefault();
        this.focusBox(this.length() - 1);
        break;
    }
  }

  protected onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const incoming = this.accept(event.clipboardData?.getData('text') ?? '');
    if (!incoming.length) return;
    const target = event.target as HTMLElement;
    const boxes = Array.from(this.host.nativeElement.querySelectorAll('.box'));
    const start = Math.max(0, boxes.indexOf(target));
    this.focusBox(this.fill(start, incoming));
  }

  writeValue(value: string | null): void {
    this.chars.set(Array.from(value ?? '').slice(0, this.length()));
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
