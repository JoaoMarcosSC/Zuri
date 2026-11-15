import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ZUR_I18N } from '../i18n/i18n';
import { ZUR_SR_ONLY, zurMatches } from '../shared/search';

export interface ZurComboboxOption {
  value: string;
  label: string;
  /** Linha secundária, mostrada em muted abaixo do rótulo. */
  description?: string;
}

let nextId = 0;

/**
 * Select com busca: o usuário digita e a lista filtra (ignora acentos e aceita
 * iniciais). Navegação por setas, Enter escolhe, Esc fecha. Funciona com
 * `ngModel` e formulários reativos; o valor é o `value` da opção (ou `null`).
 *
 * ```html
 * <zur-combobox label="Planta" [options]="plantas" [(ngModel)]="planta" />
 * ```
 */
@Component({
  selector: 'zur-combobox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ZurCombobox), multi: true }],
  host: { '(focusout)': 'onFocusOut($event)' },
  template: `
    @if (label()) {
      <label class="label" [for]="id">{{ label() }}</label>
    }
    <div class="control" [class.has-error]="!!error()" [class.disabled]="isDisabled()">
      <input
        [id]="id"
        class="field"
        type="text"
        role="combobox"
        autocomplete="off"
        aria-autocomplete="list"
        [attr.aria-expanded]="open()"
        [attr.aria-controls]="listId"
        [attr.aria-activedescendant]="open() && activeIndex() >= 0 ? optionId(activeIndex()) : null"
        [attr.aria-invalid]="error() ? true : null"
        [attr.aria-describedby]="error() ? id + '-error' : hint() ? id + '-hint' : null"
        [placeholder]="placeholder()"
        [value]="query()"
        [disabled]="isDisabled()"
        (input)="onInput($event)"
        (keydown)="onKeydown($event)"
        (click)="openList()"
      />
      @if (value() !== null && !isDisabled()) {
        <button type="button" class="clear" [attr.aria-label]="i18n.clear" (click)="clear()">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
      }
      <svg class="chevron" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
    </div>
    <ul class="list" role="listbox" [id]="listId" [attr.aria-label]="label() || null" [hidden]="!open()">
      @for (opt of filtered(); track opt.value; let i = $index) {
        <li
          role="option"
          class="option"
          [id]="optionId(i)"
          [class.active]="i === activeIndex()"
          [attr.aria-selected]="opt.value === value()"
          (mousedown)="$event.preventDefault()"
          (click)="select(opt)"
          (mouseenter)="activeIndex.set(i)"
        >
          <span class="option-label">{{ opt.label }}</span>
          @if (opt.description) {
            <span class="option-desc">{{ opt.description }}</span>
          }
          @if (opt.value === value()) {
            <svg class="check" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 13 4 4L19 7" /></svg>
          }
        </li>
      } @empty {
        <li class="empty" role="presentation">{{ i18n.noResults }}</li>
      }
    </ul>
    <span class="sr-only" aria-live="polite">{{ open() && filtered().length === 0 ? i18n.noResults : '' }}</span>
    @if (error()) {
      <p class="help error" [id]="id + '-error'">{{ error() }}</p>
    } @else if (hint()) {
      <p class="help" [id]="id + '-hint'">{{ hint() }}</p>
    }
  `,
  styles: [
    ZUR_SR_ONLY,
    `
    :host {
      display: block;
      position: relative;
    }
    .label {
      display: block;
      font: var(--zur-font-caption);
      color: var(--zur-ink);
      margin-bottom: var(--zur-space-xxs);
    }
    .control {
      position: relative;
      display: flex;
      align-items: center;
    }
    .field {
      width: 100%;
      box-sizing: border-box;
      height: var(--zur-control-height-lg);
      padding-block: 0;
      padding-inline: var(--zur-space-md) 76px;
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
      padding-inline-start: calc(var(--zur-space-md) - 1px);
    }
    .field:disabled {
      background: var(--zur-surface-soft);
      color: var(--zur-muted);
      cursor: not-allowed;
    }
    .has-error .field {
      border-color: var(--zur-error);
    }
    .clear {
      position: absolute;
      inset-inline-end: 42px;
      width: 28px;
      height: 28px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
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
    .chevron {
      position: absolute;
      inset-inline-end: var(--zur-space-md);
      color: var(--zur-muted);
      pointer-events: none;
    }
    .list {
      position: absolute;
      inset-inline: 0;
      z-index: 160;
      margin: var(--zur-space-xs) 0 0;
      padding: var(--zur-space-xs);
      list-style: none;
      max-height: 280px;
      overflow-y: auto;
      box-sizing: border-box;
      background: var(--zur-surface-raised);
      border: 1px solid var(--zur-hairline);
      border-radius: var(--zur-radius-md);
      box-shadow: var(--zur-shadow-float);
    }
    .list[hidden] {
      display: none;
    }
    .option {
      position: relative;
      display: grid;
      gap: 2px;
      padding-block: 10px;
      padding-inline: var(--zur-space-md) 40px;
      border-radius: var(--zur-radius-sm);
      cursor: pointer;
    }
    .option.active {
      background: var(--zur-surface-soft);
    }
    .option-label {
      font: var(--zur-font-body);
      font-size: 15px;
      color: var(--zur-ink);
    }
    .option-desc {
      font: var(--zur-font-caption);
      color: var(--zur-muted);
    }
    .option[aria-selected='true'] .option-label {
      font-weight: 700;
    }
    .check {
      position: absolute;
      inset-inline-end: var(--zur-space-md);
      top: 50%;
      transform: translateY(-50%);
      color: var(--zur-primary-active);
    }
    .empty {
      padding: var(--zur-space-md);
      font: var(--zur-font-body-sm);
      color: var(--zur-muted);
      text-align: center;
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
  ],
})
export class ZurCombobox implements ControlValueAccessor {
  protected readonly i18n = inject(ZUR_I18N);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly label = input('');
  readonly placeholder = input('');
  readonly hint = input('');
  readonly error = input('');
  readonly options = input<ZurComboboxOption[]>([]);
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly id = `zur-combobox-${nextId++}`;
  protected readonly listId = `${this.id}-list`;

  readonly value = signal<string | null>(null);
  /** Texto digitado; `null` quando o campo só mostra o rótulo escolhido. */
  private readonly typed = signal<string | null>(null);
  readonly open = signal(false);
  protected readonly activeIndex = signal(-1);
  protected readonly cvaDisabled = signal(false);

  private readonly selectedLabel = computed(
    () => this.options().find((o) => o.value === this.value())?.label ?? '',
  );

  protected readonly query = computed(() => this.typed() ?? this.selectedLabel());

  /** Enquanto o usuário não digita, mostra todas as opções. */
  protected readonly filtered = computed(() => {
    const q = this.typed();
    if (q === null || q === '') return this.options();
    return this.options().filter((o) => zurMatches(o.label, q) || zurMatches(o.description ?? '', q));
  });

  protected onChange: (value: string | null) => void = () => {};
  protected onTouched: () => void = () => {};

  protected optionId(i: number): string {
    return `${this.id}-opt-${i}`;
  }

  protected isDisabled(): boolean {
    return this.disabled() || this.cvaDisabled();
  }

  protected openList(): void {
    if (this.isDisabled()) return;
    if (!this.open()) {
      this.open.set(true);
      const i = this.filtered().findIndex((o) => o.value === this.value());
      this.activeIndex.set(i >= 0 ? i : 0);
    }
  }

  protected onInput(event: Event): void {
    this.typed.set((event.target as HTMLInputElement).value);
    this.open.set(true);
    this.activeIndex.set(this.filtered().length ? 0 : -1);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const count = this.filtered().length;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.open()) return this.openList();
        if (count) this.activeIndex.update((i) => (i + 1) % count);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!this.open()) return this.openList();
        if (count) this.activeIndex.update((i) => (i <= 0 ? count - 1 : i - 1));
        break;
      case 'Home':
        if (this.open() && count) {
          event.preventDefault();
          this.activeIndex.set(0);
        }
        break;
      case 'End':
        if (this.open() && count) {
          event.preventDefault();
          this.activeIndex.set(count - 1);
        }
        break;
      case 'Enter': {
        const opt = this.filtered()[this.activeIndex()];
        if (this.open() && opt) {
          event.preventDefault();
          this.select(opt);
        }
        break;
      }
      case 'Escape':
        if (this.open()) {
          event.preventDefault();
          event.stopPropagation();
          this.closeList();
        } else if (this.value() !== null) {
          this.clear();
        }
        break;
    }
  }

  select(option: ZurComboboxOption): void {
    this.value.set(option.value);
    this.typed.set(null);
    this.onChange(option.value);
    this.open.set(false);
  }

  clear(): void {
    this.value.set(null);
    this.typed.set(null);
    this.onChange(null);
    this.host.nativeElement.querySelector('input')?.focus();
  }

  /** Fecha a lista e restaura o texto para o rótulo escolhido. */
  private closeList(): void {
    this.open.set(false);
    this.typed.set(null);
  }

  protected onFocusOut(event: FocusEvent): void {
    if (!this.host.nativeElement.contains(event.relatedTarget as Node | null)) {
      this.closeList();
      this.onTouched();
    }
  }

  writeValue(value: string | null): void {
    this.value.set(value ?? null);
    this.typed.set(null);
  }
  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }
}
