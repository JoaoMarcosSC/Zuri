import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ZUR_I18N } from '../i18n/i18n';
import { zurInlineStep } from '../shared/direction';

export type ZurChipVariant = 'assist' | 'filter' | 'choice';
export type ZurChipGroupMode = 'single' | 'multiple';

/**
 * Grupo de chips selecionáveis. `mode="single"` é um `radiogroup` (setas trocam a escolha, Tab sai do
 * grupo); `mode="multiple"` é um conjunto de botões de alternar (filtros). O valor é `string` ou
 * `string[]`, conforme o modo, e funciona com `ngModel`, formulários reativos, `[formField]` e
 * `[(value)]`.
 *
 * ```html
 * <zur-chip-group label="Ambiente" mode="single" [(ngModel)]="ambiente">
 *   <zur-chip value="sala">Sala</zur-chip>
 *   <zur-chip value="varanda">Varanda</zur-chip>
 * </zur-chip-group>
 * ```
 *
 * Não confundir com `zur-chips`, o campo em que a pessoa digita para criar tags.
 */
@Component({
  selector: 'zur-chip-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ZurChipGroup), multi: true }],
  host: {
    '[attr.role]': 'mode() === "single" ? "radiogroup" : "group"',
    '[attr.aria-label]': 'label() || null',
    '[attr.aria-disabled]': 'isDisabled() || null',
    '(keydown)': 'onKeydown($event)',
  },
  template: `<ng-content />`,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      gap: var(--zur-space-xs);
    }
  `,
})
export class ZurChipGroup implements ControlValueAccessor {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly label = input('');
  readonly mode = input<ZurChipGroupMode>('single');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly value = model<string | string[] | null>(null);

  protected readonly cvaDisabled = signal(false);
  protected onChange: (value: string | string[] | null) => void = () => {};
  protected onTouched: () => void = () => {};

  isDisabled(): boolean {
    return this.disabled() || this.cvaDisabled();
  }

  isSelected(value: string): boolean {
    const v = this.value();
    return this.mode() === 'multiple' ? Array.isArray(v) && v.includes(value) : v === value;
  }

  /** Escolhe (single) ou alterna (multiple) um valor. */
  toggle(value: string): void {
    if (this.isDisabled()) return;
    let next: string | string[];
    if (this.mode() === 'multiple') {
      const current = Array.isArray(this.value()) ? (this.value() as string[]) : [];
      next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    } else {
      if (this.value() === value) return;
      next = value;
    }
    this.value.set(next);
    this.onChange(next);
    this.onTouched();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.mode() !== 'single' || this.isDisabled()) return;
    const buttons = Array.from(this.host.nativeElement.querySelectorAll<HTMLButtonElement>('button.body:not(:disabled)'));
    const index = buttons.indexOf(event.target as HTMLButtonElement);
    if (index < 0) return;
    let next = index;
    const inline = zurInlineStep(event, this.host.nativeElement);
    if (inline === 1 || event.key === 'ArrowDown') next = (index + 1) % buttons.length;
    else if (inline === -1 || event.key === 'ArrowUp') next = (index - 1 + buttons.length) % buttons.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = buttons.length - 1;
    else return;
    event.preventDefault();
    buttons[next].focus();
    this.toggle(buttons[next].dataset['value'] ?? '');
  }

  writeValue(value: string | string[] | null): void {
    this.value.set(value ?? (this.mode() === 'multiple' ? [] : null));
  }
  registerOnChange(fn: (value: string | string[] | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }
}

/**
 * Chip interativo: `assist` (ação rápida, use `(click)`), `filter` (liga e desliga, `[(selected)]`) e
 * `choice` (dentro de um `zur-chip-group`, com `value`). O estado selecionado tem ✓ e borda de ink,
 * não só cor. Com `removable`, mostra um ✕ que emite `removed`.
 *
 * ```html
 * <zur-chip variant="filter" [(selected)]="soSol">Pleno sol</zur-chip>
 * <zur-chip removable label="Sala" (removed)="tirar('sala')">Sala</zur-chip>
 * ```
 */
@Component({
  selector: 'zur-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-selected]': 'isSelected() ? "" : null',
    '[attr.data-disabled]': 'isDisabled() ? "" : null',
  },
  template: `
    <button
      type="button"
      class="body"
      [attr.role]="role()"
      [attr.aria-pressed]="pressed()"
      [attr.aria-checked]="role() === 'radio' ? isSelected() : null"
      [attr.data-value]="value()"
      [attr.tabindex]="tabStop() ? 0 : -1"
      [disabled]="isDisabled()"
      (click)="onClick()"
    >
      @if (selectable() && isSelected()) {
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 13 4 4L19 7" /></svg>
      }
      <span class="text"><ng-content /></span>
    </button>
    @if (removable() && !isDisabled()) {
      <button type="button" class="remove" [attr.aria-label]="i18n.removeChip(label() || host.nativeElement.textContent.trim())" (click)="removed.emit()">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
      </button>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      box-sizing: border-box;
      height: calc(var(--zur-control-height-sm) - 4px);
      border: 1px solid var(--zur-hairline);
      border-radius: var(--zur-radius-full);
      background: var(--zur-canvas);
      color: var(--zur-ink);
      font: var(--zur-font-body-sm);
      transition: background-color 120ms ease, border-color 120ms ease;
    }
    :host(:hover:not([data-disabled])) {
      background: var(--zur-surface-soft);
    }
    :host([data-selected]) {
      border-color: var(--zur-ink);
      box-shadow: inset 0 0 0 1px var(--zur-ink);
      background: var(--zur-surface-soft);
    }
    :host(:has(:focus-visible)) {
      box-shadow: var(--zur-focus-ring);
    }
    :host([data-selected]:has(:focus-visible)) {
      box-shadow: inset 0 0 0 1px var(--zur-ink), var(--zur-focus-ring);
    }
    :host([data-disabled]) {
      opacity: 0.45;
    }
    .body {
      display: inline-flex;
      align-items: center;
      gap: var(--zur-space-xxs);
      height: 100%;
      padding-block: 0;
      padding-inline: var(--zur-space-sm);
      border: none;
      border-radius: inherit;
      background: transparent;
      color: inherit;
      font: inherit;
      cursor: pointer;
      white-space: nowrap;
    }
    .body:focus-visible,
    .remove:focus-visible {
      outline: none;
    }
    .body:disabled {
      cursor: not-allowed;
    }
    .remove {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      margin-inline-end: 4px;
      padding: 0;
      border: none;
      border-radius: var(--zur-radius-full);
      background: transparent;
      color: var(--zur-muted);
      cursor: pointer;
    }
    .remove:hover {
      background: var(--zur-hairline);
      color: var(--zur-ink);
    }
    :host(:has(.remove)) .body {
      padding-inline-end: var(--zur-space-xxs);
    }
  `,
})
export class ZurChip {
  protected readonly i18n = inject(ZUR_I18N);
  protected readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly group = inject(ZurChipGroup, { optional: true });

  readonly variant = input<ZurChipVariant>('assist');
  /** Valor do chip dentro de um `zur-chip-group` (obrigatório lá). */
  readonly value = input('');
  /** Nome para o botão de remover; sem ele usa o texto do chip. */
  readonly label = input('');
  readonly selected = model(false);
  readonly removable = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly removed = output<void>();

  protected selectable(): boolean {
    return !!this.group || this.variant() !== 'assist';
  }

  protected isDisabled(): boolean {
    return this.disabled() || !!this.group?.isDisabled();
  }

  protected isSelected(): boolean {
    if (this.group) return this.group.isSelected(this.value());
    return this.variant() !== 'assist' && this.selected();
  }

  protected role(): string | null {
    return this.group?.mode() === 'single' ? 'radio' : null;
  }

  protected pressed(): boolean | null {
    return this.selectable() && this.role() !== 'radio' ? this.isSelected() : null;
  }

  /** Em grupo `single`, só a escolha atual (ou todos, se nada foi escolhido) recebe o Tab. */
  protected tabStop(): boolean {
    if (this.role() !== 'radio') return true;
    const has = this.group!.value() != null;
    return !has || this.isSelected();
  }

  protected onClick(): void {
    if (this.group) this.group.toggle(this.value());
    else if (this.variant() !== 'assist') this.selected.update((v) => !v);
  }
}
