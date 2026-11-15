import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { ZUR_I18N } from '../i18n/i18n';
import { ZUR_SR_ONLY, zurMatches } from '../shared/search';

export interface ZurCommand {
  id: string;
  label: string;
  /** Título do grupo em que o comando aparece. */
  group?: string;
  description?: string;
  /** Atalho exibido à direita, ex.: `['G', 'P']` ou `['Ctrl', 'N']`. */
  shortcut?: string[];
  /** Atributo `d` de um path SVG 24×24 (traço), desenhado como ícone. */
  icon?: string;
  /** Termos extras que também acham o comando na busca. */
  keywords?: string[];
}

interface ZurCommandGroup {
  name: string;
  items: { command: ZurCommand; index: number }[];
}

let nextId = 0;

/**
 * Busca global de páginas e ações (estilo Linear/Raycast). Abre com Ctrl+K / ⌘K
 * (desligue com `[hotkey]="false"`) ou por `[(open)]`; filtra ignorando acentos e por
 * iniciais; setas navegam, Enter executa, Esc fecha e devolve o foco.
 *
 * ```html
 * <zur-command-palette [commands]="comandos" (selected)="executar($event)" />
 * ```
 */
@Component({
  selector: 'zur-command-palette',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown)': 'onDocumentKeydown($event)',
  },
  template: `
    @if (open()) {
      <div class="scrim" (click)="close()">
        <div
          class="dialog"
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="i18n.commandPalette"
          (click)="$event.stopPropagation()"
          (keydown)="onKeydown($event)"
        >
          <div class="search">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input
              #field
              class="field"
              type="text"
              role="combobox"
              autocomplete="off"
              aria-autocomplete="list"
              aria-expanded="true"
              [attr.aria-controls]="listId"
              [attr.aria-activedescendant]="flat().length ? optionId(active()) : null"
              [attr.aria-label]="i18n.commandPalette"
              [placeholder]="placeholder() || i18n.commandPlaceholder"
              [value]="query()"
              (input)="onInput($event)"
            />
            <kbd class="esc" aria-hidden="true">Esc</kbd>
          </div>
          <div class="list" role="listbox" [id]="listId" [attr.aria-label]="i18n.commandPalette">
            @for (group of groups(); track group.name) {
              <div role="group" [attr.aria-labelledby]="group.name ? listId + '-g-' + $index : null">
                @if (group.name) {
                  <div class="group" role="presentation" [id]="listId + '-g-' + $index">{{ group.name }}</div>
                }
                @for (entry of group.items; track entry.command.id) {
                  <div
                    role="option"
                    class="option"
                    [id]="optionId(entry.index)"
                    [class.active]="entry.index === active()"
                    [attr.aria-selected]="entry.index === active()"
                    (mousemove)="active.set(entry.index)"
                    (click)="run(entry.command)"
                  >
                    <span class="icon" aria-hidden="true">
                      @if (entry.command.icon) {
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path [attr.d]="entry.command.icon" /></svg>
                      }
                    </span>
                    <span class="text">
                      <span class="label">{{ entry.command.label }}</span>
                      @if (entry.command.description) {
                        <span class="desc">{{ entry.command.description }}</span>
                      }
                    </span>
                    @if (entry.command.shortcut?.length) {
                      <span class="keys" aria-hidden="true">
                        @for (key of entry.command.shortcut; track $index) {
                          <kbd>{{ key }}</kbd>
                        }
                      </span>
                    }
                  </div>
                }
              </div>
            } @empty {
              <p class="empty">{{ i18n.noResults }}</p>
            }
          </div>
          <span class="sr-only" aria-live="polite">{{ flat().length === 0 ? i18n.noResults : '' }}</span>
        </div>
      </div>
    }
  `,
  styles: [
    ZUR_SR_ONLY,
    `
    .scrim {
      position: fixed;
      inset: 0;
      z-index: 200;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 12vh var(--zur-space-md) var(--zur-space-md);
      background: var(--zur-scrim);
    }
    .dialog {
      width: min(640px, 100%);
      max-height: 70vh;
      display: flex;
      flex-direction: column;
      background: var(--zur-surface-raised);
      border: 1px solid var(--zur-hairline);
      border-radius: var(--zur-radius-lg);
      box-shadow: var(--zur-shadow-float);
      overflow: hidden;
    }
    .search {
      display: flex;
      align-items: center;
      gap: var(--zur-space-sm);
      padding: 0 var(--zur-space-lg);
      border-bottom: 1px solid var(--zur-hairline);
      color: var(--zur-muted);
    }
    .field {
      flex: 1;
      height: 60px;
      border: none;
      background: transparent;
      font: var(--zur-font-body-lg);
      color: var(--zur-ink);
      outline: none;
    }
    .field::placeholder {
      color: var(--zur-muted);
    }
    kbd {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 22px;
      height: 22px;
      padding: 0 6px;
      box-sizing: border-box;
      border: 1px solid var(--zur-hairline);
      border-bottom-width: 2px;
      border-radius: var(--zur-radius-xs);
      background: var(--zur-canvas);
      font: var(--zur-font-caption);
      font-size: 11px;
      color: var(--zur-body);
    }
    .list {
      overflow-y: auto;
      padding: var(--zur-space-xs);
    }
    .group {
      padding: var(--zur-space-sm) var(--zur-space-sm) var(--zur-space-xxs);
      font: var(--zur-font-caption);
      font-size: 11px;
      letter-spacing: 0.4px;
      text-transform: uppercase;
      color: var(--zur-muted);
    }
    .option {
      display: flex;
      align-items: center;
      gap: var(--zur-space-sm);
      min-height: 48px;
      padding: 6px var(--zur-space-sm);
      border-radius: var(--zur-radius-sm);
      cursor: pointer;
    }
    .option.active {
      background: var(--zur-surface-soft);
    }
    .option.active .icon {
      background: var(--zur-primary-soft);
      color: var(--zur-on-primary-soft);
    }
    .icon {
      width: 32px;
      height: 32px;
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--zur-radius-sm);
      background: var(--zur-surface-strong);
      color: var(--zur-body);
    }
    .text {
      flex: 1;
      display: grid;
      gap: 1px;
      min-width: 0;
    }
    .label {
      font: var(--zur-font-body);
      font-size: 15px;
      font-weight: 600;
      color: var(--zur-ink);
    }
    .desc {
      font: var(--zur-font-caption);
      color: var(--zur-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .keys {
      display: inline-flex;
      gap: 4px;
    }
    .empty {
      margin: 0;
      padding: var(--zur-space-xl) var(--zur-space-md);
      text-align: center;
      font: var(--zur-font-body-sm);
      color: var(--zur-muted);
    }
  `,
  ],
})
export class ZurCommandPalette {
  protected readonly i18n = inject(ZUR_I18N);
  private readonly doc = inject(DOCUMENT);

  readonly commands = input<ZurCommand[]>([]);
  readonly open = model(false);
  readonly placeholder = input('');
  /** Abre/fecha com Ctrl+K / ⌘K. */
  readonly hotkey = input(true, { transform: booleanAttribute });

  readonly selected = output<ZurCommand>();

  protected readonly listId = `zur-command-palette-${nextId++}`;
  protected readonly query = signal('');
  protected readonly active = signal(0);
  private readonly field = viewChild<ElementRef<HTMLInputElement>>('field');
  private returnFocus: HTMLElement | null = null;

  /** Comandos filtrados, na ordem em que aparecem (agrupados). */
  protected readonly flat = computed(() => {
    const q = this.query();
    const matches = this.commands().filter(
      (c) =>
        zurMatches(c.label, q) ||
        (!!q && (zurMatches(c.description ?? '', q) || (c.keywords ?? []).some((k) => zurMatches(k, q)))),
    );
    const order: string[] = [];
    for (const c of matches) if (!order.includes(c.group ?? '')) order.push(c.group ?? '');
    return order.flatMap((g) => matches.filter((c) => (c.group ?? '') === g));
  });

  protected readonly groups = computed<ZurCommandGroup[]>(() => {
    const groups: ZurCommandGroup[] = [];
    this.flat().forEach((command, index) => {
      const name = command.group ?? '';
      let group = groups.find((g) => g.name === name);
      if (!group) groups.push((group = { name, items: [] }));
      group.items.push({ command, index });
    });
    return groups;
  });

  constructor() {
    effect(() => {
      const field = this.field();
      if (!field) return;
      untracked(() => {
        // Aberta por [(open)] sem passar por show(): guarda quem tinha o foco.
        this.returnFocus ??= this.doc.activeElement as HTMLElement | null;
        field.nativeElement.focus();
      });
    });
  }

  protected optionId(i: number): string {
    return `${this.listId}-opt-${i}`;
  }

  show(): void {
    if (this.open()) return;
    this.returnFocus = this.doc.activeElement as HTMLElement | null;
    this.open.set(true);
  }

  close(): void {
    if (!this.open()) return;
    this.open.set(false);
    this.query.set('');
    this.active.set(0);
    this.returnFocus?.focus?.();
    this.returnFocus = null;
  }

  protected run(command: ZurCommand): void {
    this.close();
    this.selected.emit(command);
  }

  protected onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.active.set(0);
  }

  protected onDocumentKeydown(event: KeyboardEvent): void {
    if (!this.hotkey()) return;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (this.open()) this.close();
      else this.show();
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    const count = this.flat().length;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (count) this.active.update((i) => (i + 1) % count);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (count) this.active.update((i) => (i - 1 + count) % count);
        break;
      case 'Enter': {
        const command = this.flat()[this.active()];
        if (command) {
          event.preventDefault();
          this.run(command);
        }
        break;
      }
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        this.close();
        break;
      case 'Tab':
        // O campo é o único ponto de foco: mantém o foco dentro do diálogo.
        event.preventDefault();
        break;
      default:
        return;
    }
    this.scrollActiveIntoView();
  }

  private scrollActiveIntoView(): void {
    queueMicrotask(() =>
      this.doc.getElementById(this.optionId(this.active()))?.scrollIntoView?.({ block: 'nearest' }),
    );
  }
}
