import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  contentChildren,
  forwardRef,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type ZurListSelection = 'none' | 'single' | 'multiple';

/**
 * Lista vertical de itens com área para ícone/avatar, texto principal, texto secundário e ação.
 * Com `selection="single" | "multiple"` vira um `listbox`: setas movem o foco, Espaço/Enter escolhem
 * e o valor (`string` ou `string[]`) funciona com `ngModel`, formulários reativos e `[formField]`.
 *
 * ```html
 * <zur-list label="Pedidos" selection="single" contained divided [(ngModel)]="pedido">
 *   <zur-list-item value="42">
 *     <zur-avatar zurListLeading name="Ana Silva" size="sm" />
 *     Pedido 42
 *     <span zurListSecondary>Monstera e vaso</span>
 *     <zur-badge zurListTrailing>Enviado</zur-badge>
 *   </zur-list-item>
 * </zur-list>
 * ```
 */
@Component({
  selector: 'zur-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ZurList), multi: true }],
  host: {
    '[attr.role]': 'selectable() ? "listbox" : "list"',
    '[attr.aria-label]': 'label() || null',
    '[attr.aria-multiselectable]': 'selection() === "multiple" ? true : null',
    '[attr.aria-disabled]': 'isDisabled() || null',
    '[attr.data-contained]': 'contained() ? "" : null',
    '[attr.data-divided]': 'divided() ? "" : null',
    '(keydown)': 'onKeydown($event)',
    '(focusin)': 'onFocusIn($event)',
  },
  template: `<ng-content />`,
  styles: `
    :host {
      display: block;
    }
    :host([data-divided]) {
      --zur-list-rule: 1px solid var(--zur-hairline);
    }
    :host([data-contained]) {
      border: 1px solid var(--zur-hairline);
      border-radius: var(--zur-radius-md);
      background: var(--zur-canvas);
      overflow: hidden;
    }
  `,
})
export class ZurList implements ControlValueAccessor {
  readonly label = input('');
  readonly selection = input<ZurListSelection>('none');
  /** Borda e raio de 14 px em volta da lista. */
  readonly contained = input(false, { transform: booleanAttribute });
  /** Fio entre os itens. */
  readonly divided = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly value = model<string | string[] | null>(null);

  protected readonly items = contentChildren(forwardRef(() => ZurListItem));
  protected readonly cvaDisabled = signal(false);
  private readonly focused = signal<string | null>(null);

  protected onChange: (value: string | string[] | null) => void = () => {};
  protected onTouched: () => void = () => {};

  readonly selectable = computed(() => this.selection() !== 'none');

  isDisabled(): boolean {
    return this.disabled() || this.cvaDisabled();
  }

  isSelected(value: string): boolean {
    const v = this.value();
    return this.selection() === 'multiple' ? Array.isArray(v) && v.includes(value) : v === value;
  }

  /** Valor do item que recebe o Tab: o último focado, o escolhido ou o primeiro habilitado. */
  readonly tabValue = computed(() => {
    const enabled = this.items().filter((i) => !i.isDisabled());
    const wanted = this.focused() ?? (() => {
      const v = this.value();
      return Array.isArray(v) ? v[0] : v;
    })();
    return enabled.find((i) => i.value() === wanted)?.value() ?? enabled[0]?.value() ?? null;
  });

  select(value: string): void {
    if (!this.selectable() || this.isDisabled()) return;
    let next: string | string[];
    if (this.selection() === 'multiple') {
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

  protected onFocusIn(event: FocusEvent): void {
    const item = this.items().find((i) => i.el.nativeElement === event.target);
    if (item) this.focused.set(item.value());
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (!this.selectable()) return;
    const enabled = this.items().filter((i) => !i.isDisabled());
    const index = enabled.findIndex((i) => i.el.nativeElement === event.target);
    if (index < 0) return;
    let next = index;
    if (event.key === 'ArrowDown') next = Math.min(index + 1, enabled.length - 1);
    else if (event.key === 'ArrowUp') next = Math.max(index - 1, 0);
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = enabled.length - 1;
    else if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.select(enabled[index].value());
      return;
    } else return;
    event.preventDefault();
    enabled[next].el.nativeElement.focus();
  }

  writeValue(value: string | string[] | null): void {
    this.value.set(value ?? (this.selection() === 'multiple' ? [] : null));
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
 * Item da lista. Slots: `[zurListLeading]` (ícone, avatar), o texto principal, `[zurListSecondary]`
 * e `[zurListTrailing]` (badge, botão). Com `interactive` (fora de uma lista selecionável) a linha
 * vira um botão e o `(click)` do item funciona.
 */
@Component({
  selector: 'zur-list-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  host: {
    '[attr.role]': 'list?.selectable() ? "option" : "listitem"',
    '[attr.aria-selected]': 'list?.selectable() ? selected() : null',
    '[attr.aria-disabled]': 'isDisabled() || null',
    '[attr.tabindex]': 'list?.selectable() && !isDisabled() ? (isTabStop() ? 0 : -1) : null',
    '[attr.data-selected]': 'selected() ? "" : null',
    '[attr.data-selectable]': 'list?.selectable() ? "" : null',
    '(click)': 'onClick()',
  },
  template: `
    <ng-template #inner>
      <span class="leading"><ng-content select="[zurListLeading]" /></span>
      <span class="body">
        <span class="primary"><ng-content /></span>
        <span class="secondary"><ng-content select="[zurListSecondary]" /></span>
      </span>
      <span class="trailing"><ng-content select="[zurListTrailing]" /></span>
    </ng-template>
    @if (interactive() && !list?.selectable()) {
      <button type="button" class="row" [disabled]="isDisabled()"><ng-container [ngTemplateOutlet]="inner" /></button>
    } @else {
      <div class="row"><ng-container [ngTemplateOutlet]="inner" /></div>
    }
  `,
  styles: `
    :host {
      display: block;
      color: var(--zur-ink);
    }
    :host([data-selectable]) {
      cursor: pointer;
    }
    :host(:not(:last-child)) {
      border-block-end: var(--zur-list-rule, none);
    }
    :host(:focus-visible) {
      outline: 2px solid var(--zur-primary);
      outline-offset: -2px;
    }
    :host([aria-disabled='true']) {
      opacity: 0.45;
      cursor: not-allowed;
    }
    .row {
      display: flex;
      align-items: center;
      gap: var(--zur-space-md);
      box-sizing: border-box;
      width: 100%;
      min-height: calc(var(--zur-control-height-md) + 8px);
      padding: var(--zur-space-xs) var(--zur-space-md);
      border: none;
      border-inline-start: 3px solid transparent;
      background: transparent;
      color: inherit;
      font: inherit;
      text-align: start;
    }
    button.row {
      cursor: pointer;
    }
    button.row:focus-visible {
      outline: 2px solid var(--zur-primary);
      outline-offset: -2px;
    }
    button.row:hover:not(:disabled),
    :host([data-selectable]:not([aria-disabled='true'])) .row:hover {
      background: var(--zur-surface-soft);
    }
    :host([data-selected]) .row {
      background: var(--zur-surface-soft);
      border-inline-start-color: var(--zur-ink);
    }
    :host([data-selected]) .primary {
      font-weight: 700;
    }
    .leading,
    .trailing {
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
      color: var(--zur-muted);
    }
    .leading:empty,
    .trailing:empty,
    .secondary:empty {
      display: none;
    }
    .body {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
      gap: 2px;
    }
    .primary {
      font: var(--zur-font-body);
      overflow-wrap: anywhere;
    }
    .secondary {
      font: var(--zur-font-body-sm);
      color: var(--zur-muted);
    }
  `,
})
export class ZurListItem {
  readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly list = inject(ZurList, { optional: true });

  /** Identifica o item nas listas selecionáveis (obrigatório lá). */
  readonly value = input('');
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Linha clicável (botão), para listas que não são de seleção. */
  readonly interactive = input(false, { transform: booleanAttribute });

  isDisabled(): boolean {
    return this.disabled() || !!this.list?.isDisabled();
  }

  protected selected(): boolean {
    return !!this.list?.selectable() && this.list.isSelected(this.value());
  }

  protected isTabStop(): boolean {
    return this.list?.tabValue() === this.value();
  }

  protected onClick(): void {
    if (this.list?.selectable() && !this.isDisabled()) this.list.select(this.value());
  }
}
