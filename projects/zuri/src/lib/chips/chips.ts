import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  forwardRef,
  inject,
  input,
  numberAttribute,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ZUR_I18N } from '../i18n/i18n';
import { ZUR_SR_ONLY, zurNormalize } from '../shared/search';

let nextId = 0;

/**
 * Campo de tags: o usuário digita e Enter (ou vírgula) vira um chip; Backspace no
 * campo vazio remove o último. Ignora repetidos (sem diferenciar acento/caixa).
 * O valor é `string[]` e funciona com `ngModel` e formulários reativos.
 *
 * ```html
 * <zur-chips label="Ambientes" placeholder="Sala, varanda…" [(ngModel)]="ambientes" />
 * ```
 */
@Component({
  selector: 'zur-chips',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ZurChips), multi: true }],
  template: `
    @if (label()) {
      <label class="label" [for]="id">{{ label() }}</label>
    }
    <div class="control" [class.has-error]="!!error()" [class.disabled]="isDisabled()" (click)="field.focus()">
      <ul class="chips" role="list">
        @for (chip of value(); track chip) {
          <li class="chip">
            <span>{{ chip }}</span>
            @if (!isDisabled()) {
              <button type="button" class="remove" [attr.aria-label]="i18n.removeChip(chip)" (click)="remove(chip); $event.stopPropagation()">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
              </button>
            }
          </li>
        }
      </ul>
      <input
        #field
        [id]="id"
        class="field"
        type="text"
        enterkeyhint="enter"
        [placeholder]="value().length ? '' : placeholder()"
        [value]="draft()"
        [disabled]="isDisabled() || full()"
        [attr.aria-describedby]="error() ? id + '-error' : hint() ? id + '-hint' : null"
        [attr.aria-invalid]="error() ? true : null"
        (input)="onInput($event)"
        (keydown)="onKeydown($event)"
        (blur)="commit(); onTouched()"
      />
    </div>
    <span class="sr-only" aria-live="polite">{{ announcement() }}</span>
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
    }
    .label {
      display: block;
      font: var(--zur-font-caption);
      color: var(--zur-ink);
      margin-bottom: var(--zur-space-xxs);
    }
    .control {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--zur-space-xs);
      min-height: var(--zur-control-height-lg);
      box-sizing: border-box;
      padding: 8px var(--zur-space-sm);
      background: var(--zur-canvas);
      border: 1px solid var(--zur-hairline);
      border-radius: var(--zur-radius-sm);
      cursor: text;
    }
    .control:focus-within {
      border: 2px solid var(--zur-ink);
      padding: 7px calc(var(--zur-space-sm) - 1px);
    }
    .control.has-error {
      border-color: var(--zur-error);
    }
    .control.disabled {
      background: var(--zur-surface-soft);
      cursor: not-allowed;
    }
    .chips {
      display: contents;
      list-style: none;
    }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      height: 30px;
      padding: 0 6px 0 12px;
      border-radius: var(--zur-radius-full);
      background: var(--zur-primary-soft);
      color: var(--zur-on-primary-soft);
      font: var(--zur-font-body-sm);
      font-weight: 600;
    }
    .disabled .chip {
      padding-right: 12px;
    }
    .remove {
      width: 22px;
      height: 22px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      border-radius: var(--zur-radius-full);
      background: transparent;
      color: inherit;
      cursor: pointer;
    }
    .remove:hover {
      background: rgba(0, 0, 0, 0.08);
    }
    .remove:focus-visible {
      outline: none;
      box-shadow: var(--zur-focus-ring);
    }
    .field {
      flex: 1;
      min-width: 120px;
      height: 30px;
      border: none;
      background: transparent;
      font: var(--zur-font-body);
      color: var(--zur-ink);
      outline: none;
    }
    .field::placeholder {
      color: var(--zur-muted);
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
export class ZurChips implements ControlValueAccessor {
  protected readonly i18n = inject(ZUR_I18N);

  readonly label = input('');
  readonly placeholder = input('');
  readonly hint = input('');
  readonly error = input('');
  /** Quantidade máxima de chips; `0` = sem limite. */
  readonly max = input(0, { transform: numberAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly id = `zur-chips-${nextId++}`;
  readonly value = signal<string[]>([]);
  protected readonly draft = signal('');
  protected readonly announcement = signal('');
  protected readonly cvaDisabled = signal(false);

  protected onChange: (value: string[]) => void = () => {};
  protected onTouched: () => void = () => {};

  protected isDisabled(): boolean {
    return this.disabled() || this.cvaDisabled();
  }

  protected full(): boolean {
    return this.max() > 0 && this.value().length >= this.max();
  }

  protected onInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    if (text.includes(',')) {
      const parts = text.split(',');
      this.draft.set(parts.pop() ?? '');
      parts.forEach((p) => this.add(p));
    } else {
      this.draft.set(text);
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.commit();
    } else if (event.key === 'Backspace' && this.draft() === '' && this.value().length) {
      this.remove(this.value()[this.value().length - 1]);
    }
  }

  /** Transforma o texto digitado em chip. */
  protected commit(): void {
    this.add(this.draft());
    this.draft.set('');
  }

  add(text: string): void {
    const chip = text.trim();
    if (!chip || this.full()) return;
    const key = zurNormalize(chip);
    if (this.value().some((v) => zurNormalize(v) === key)) return;
    this.value.update((v) => [...v, chip]);
    this.onChange(this.value());
  }

  remove(chip: string): void {
    this.value.update((v) => v.filter((c) => c !== chip));
    this.onChange(this.value());
    this.announcement.set(this.i18n.removeChip(chip));
  }

  writeValue(value: string[] | null): void {
    this.value.set(value ? [...value] : []);
  }
  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }
}
