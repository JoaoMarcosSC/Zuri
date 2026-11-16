import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  booleanAttribute,
  forwardRef,
  inject,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ZurIcon } from '../icon/icon';
import { zurIconSearch, zurIconX } from '../icon/icons';
import { ZUR_I18N } from '../i18n/i18n';

let nextId = 0;

/**
 * Campo de busca: ícone de lupa, botão de limpar, Esc limpa e Enter envia. `searchChange` emite
 * enquanto a pessoa digita (com `debounceMs`, espera ela parar) e `submitted` emite no Enter.
 *
 * ```html
 * <zur-search label="Buscar plantas" [debounceMs]="250" (searchChange)="filtrar($event)" />
 * ```
 */
@Component({
  selector: 'zur-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ZurIcon],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ZurSearch), multi: true }],
  template: `
    <div class="control">
      <zur-icon class="lupa" [icon]="iconSearch" [size]="20" />
      <input
        [id]="id"
        class="field"
        type="search"
        autocomplete="off"
        enterkeyhint="search"
        [attr.aria-label]="label() || i18n.searchLabel"
        [placeholder]="placeholder()"
        [value]="value()"
        [disabled]="isDisabled()"
        (input)="onInput($event)"
        (keydown)="onKeydown($event)"
        (blur)="onTouched()"
      />
      @if (value() && !isDisabled()) {
        <button type="button" class="clear" [attr.aria-label]="i18n.clear" (click)="clear()">
          <zur-icon [icon]="iconX" [size]="16" />
        </button>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .control {
      position: relative;
      display: flex;
      align-items: center;
    }
    .lupa {
      position: absolute;
      inset-inline-start: var(--zur-space-md);
      color: var(--zur-muted);
      pointer-events: none;
    }
    .field {
      width: 100%;
      box-sizing: border-box;
      height: var(--zur-control-height-md);
      padding-block: 0;
      padding-inline: 44px 44px;
      font: var(--zur-font-body);
      color: var(--zur-ink);
      background: var(--zur-canvas);
      border: 1px solid var(--zur-hairline);
      border-radius: var(--zur-radius-full);
      transition: border-color 120ms ease;
      appearance: none;
    }
    .field::-webkit-search-cancel-button,
    .field::-webkit-search-decoration {
      appearance: none;
      display: none;
    }
    .field::placeholder {
      color: var(--zur-muted);
    }
    .field:focus {
      outline: none;
      border-color: var(--zur-ink);
      box-shadow: 0 0 0 1px var(--zur-ink);
    }
    .field:disabled {
      background: var(--zur-surface-soft);
      color: var(--zur-muted);
      cursor: not-allowed;
    }
    .clear {
      position: absolute;
      inset-inline-end: var(--zur-space-xs);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      padding: 0;
      border: none;
      border-radius: var(--zur-radius-full);
      background: transparent;
      color: var(--zur-muted);
      cursor: pointer;
    }
    .clear:hover {
      background: var(--zur-surface-strong);
      color: var(--zur-ink);
    }
    .clear:focus-visible {
      outline: none;
      box-shadow: var(--zur-focus-ring);
    }
  `,
})
export class ZurSearch implements ControlValueAccessor {
  protected readonly i18n = inject(ZUR_I18N);
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Nome acessível; sem ele usa "Buscar". */
  readonly label = input('');
  readonly placeholder = input('');
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Espera (ms) depois da última tecla antes de emitir `searchChange`; `0` emite na hora. */
  readonly debounceMs = input(0, { transform: numberAttribute });

  readonly searchChange = output<string>();
  readonly submitted = output<string>();

  protected readonly id = `zur-search-${nextId++}`;
  protected readonly iconSearch = zurIconSearch;
  protected readonly iconX = zurIconX;
  protected readonly value = signal('');
  protected readonly cvaDisabled = signal(false);
  private timer: ReturnType<typeof setTimeout> | undefined;

  protected onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.timer));
  }

  protected isDisabled(): boolean {
    return this.disabled() || this.cvaDisabled();
  }

  protected onInput(event: Event): void {
    const next = (event.target as HTMLInputElement).value;
    this.value.set(next);
    this.onChange(next);
    clearTimeout(this.timer);
    const wait = this.debounceMs();
    if (wait > 0) this.timer = setTimeout(() => this.searchChange.emit(next), wait);
    else this.searchChange.emit(next);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      clearTimeout(this.timer);
      this.searchChange.emit(this.value());
      this.submitted.emit(this.value());
    } else if (event.key === 'Escape' && this.value()) {
      event.preventDefault();
      event.stopPropagation();
      this.clear();
    }
  }

  clear(): void {
    clearTimeout(this.timer);
    this.value.set('');
    this.onChange('');
    this.searchChange.emit('');
    this.host.nativeElement.querySelector('input')?.focus();
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
