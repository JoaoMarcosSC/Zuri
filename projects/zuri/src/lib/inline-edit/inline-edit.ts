import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  booleanAttribute,
  forwardRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ZUR_I18N } from '../i18n/i18n';
import { ZurIcon } from '../icon/icon';
import { zurIconCheck, zurIconPencil, zurIconX } from '../icon/icons';
import { ZUR_SR_ONLY } from '../shared/search';

/**
 * Texto editável no lugar. Em leitura é um botão com o valor; clique, Enter ou F2 abrem o campo.
 * Enter salva (em `multiline`, Ctrl/⌘+Enter), Esc cancela e sair do campo salva. O foco volta ao
 * botão e um aviso (`aria-live`) diz o que aconteceu.
 *
 * ```html
 * <zur-inline-edit label="Nome do pedido" [(ngModel)]="nome" (saved)="persistir($event)" />
 * ```
 */
@Component({
  selector: 'zur-inline-edit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ZurIcon],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ZurInlineEdit), multi: true }],
  host: { '(focusout)': 'onFocusOut($event)' },
  template: `
    @if (editing()) {
      <div class="editor">
        @if (multiline()) {
          <textarea
            class="field"
            rows="3"
            [attr.aria-label]="label() || null"
            [value]="draft()"
            (input)="draft.set($any($event.target).value)"
            (keydown)="onKeydown($event)"
          ></textarea>
        } @else {
          <input
            class="field"
            type="text"
            [attr.aria-label]="label() || null"
            [value]="draft()"
            (input)="draft.set($any($event.target).value)"
            (keydown)="onKeydown($event)"
          />
        }
        <button type="button" class="act" [attr.aria-label]="i18n.save" (mousedown)="$event.preventDefault()" (click)="commit()">
          <zur-icon [icon]="iconCheck" [size]="18" />
        </button>
        <button type="button" class="act" [attr.aria-label]="i18n.cancel" (mousedown)="$event.preventDefault()" (click)="cancel()">
          <zur-icon [icon]="iconX" [size]="18" />
        </button>
      </div>
    } @else {
      <button type="button" class="read" [disabled]="isDisabled()" (click)="start()" (keydown)="onReadKeydown($event)">
        <span class="value" [class.placeholder]="!value()">{{ value() || placeholder() }}</span>
        <span class="sr-only"> ({{ i18n.edit }})</span>
        <zur-icon class="pencil" [icon]="iconPencil" [size]="16" />
      </button>
    }
    <span class="sr-only" aria-live="polite">{{ announcement() }}</span>
  `,
  styles: [
    ZUR_SR_ONLY,
    `
    :host {
      display: inline-block;
      max-width: 100%;
    }
    .read {
      display: inline-flex;
      align-items: center;
      gap: var(--zur-space-xs);
      max-width: 100%;
      padding: 4px var(--zur-space-xs);
      margin-inline: calc(var(--zur-space-xs) * -1);
      border: 1px solid transparent;
      border-radius: var(--zur-radius-sm);
      background: transparent;
      color: var(--zur-ink);
      font: inherit;
      text-align: start;
      cursor: text;
    }
    .read:hover:not(:disabled) {
      background: var(--zur-surface-soft);
      border-color: var(--zur-hairline);
    }
    .read:focus-visible {
      outline: none;
      box-shadow: var(--zur-focus-ring);
    }
    .read:disabled {
      cursor: default;
    }
    .value {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: pre-wrap;
    }
    .placeholder {
      color: var(--zur-muted);
    }
    .pencil {
      color: var(--zur-muted);
      opacity: 0;
      transition: opacity 120ms ease;
    }
    .read:hover .pencil,
    .read:focus-visible .pencil {
      opacity: 1;
    }
    @media (hover: none) {
      .pencil {
        opacity: 1;
      }
    }
    .editor {
      display: flex;
      align-items: flex-start;
      gap: var(--zur-space-xxs);
    }
    .field {
      flex: 1;
      min-width: 0;
      box-sizing: border-box;
      padding: 8px var(--zur-space-sm);
      font: inherit;
      color: var(--zur-ink);
      background: var(--zur-canvas);
      border: 1px solid var(--zur-ink);
      box-shadow: 0 0 0 1px var(--zur-ink);
      border-radius: var(--zur-radius-sm);
      resize: vertical;
    }
    .field:focus {
      outline: none;
    }
    .act {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      padding: 0;
      border: 1px solid var(--zur-hairline);
      border-radius: var(--zur-radius-sm);
      background: var(--zur-canvas);
      color: var(--zur-ink);
      cursor: pointer;
    }
    .act:hover {
      background: var(--zur-surface-soft);
    }
    .act:focus-visible {
      outline: none;
      box-shadow: var(--zur-focus-ring);
    }
  `,
  ],
})
export class ZurInlineEdit implements ControlValueAccessor {
  protected readonly i18n = inject(ZUR_I18N);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  /** Nome acessível do campo (o que está sendo editado). */
  readonly label = input('');
  /** Texto mostrado, em muted, quando o valor está vazio. */
  readonly placeholder = input('');
  readonly multiline = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Emite o novo valor quando a edição é salva (e só se mudou). */
  readonly saved = output<string>();

  protected readonly iconCheck = zurIconCheck;
  protected readonly iconX = zurIconX;
  protected readonly iconPencil = zurIconPencil;

  readonly value = signal('');
  protected readonly editing = signal(false);
  protected readonly draft = signal('');
  protected readonly announcement = signal('');
  protected readonly cvaDisabled = signal(false);

  protected onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

  protected isDisabled(): boolean {
    return this.disabled() || this.cvaDisabled();
  }

  start(): void {
    if (this.isDisabled() || this.editing()) return;
    this.draft.set(this.value());
    this.announcement.set('');
    this.editing.set(true);
    afterNextRender(
      () => {
        const field = this.host.nativeElement.querySelector<HTMLInputElement | HTMLTextAreaElement>('.field');
        field?.focus();
        field?.select();
      },
      { injector: this.injector },
    );
  }

  commit(): void {
    if (!this.editing()) return;
    const next = this.draft();
    const changed = next !== this.value();
    if (changed) {
      this.value.set(next);
      this.onChange(next);
      this.saved.emit(next);
    }
    this.finish(changed ? this.i18n.inlineEditSaved : '');
  }

  cancel(): void {
    if (!this.editing()) return;
    this.finish(this.i18n.inlineEditCancelled);
  }

  private finish(message: string): void {
    this.editing.set(false);
    this.announcement.set(message);
    this.onTouched();
    afterNextRender(() => this.host.nativeElement.querySelector<HTMLElement>('.read')?.focus(), {
      injector: this.injector,
    });
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.cancel();
    } else if (event.key === 'Enter') {
      if (this.multiline() && !(event.ctrlKey || event.metaKey)) return;
      event.preventDefault();
      this.commit();
    }
  }

  protected onReadKeydown(event: KeyboardEvent): void {
    if (event.key === 'F2') {
      event.preventDefault();
      this.start();
    }
  }

  /**
   * Sair do campo (para fora do componente) salva. Só conta o `focusout` que vem do editor: ao
   * abrir, o botão de leitura que tinha o foco sai do DOM e o navegador também emite `focusout`.
   */
  protected onFocusOut(event: FocusEvent): void {
    if (!this.editing()) return;
    if (!(event.target as HTMLElement).closest('.editor')) return;
    if (!this.host.nativeElement.contains(event.relatedTarget as Node | null)) this.commit();
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
