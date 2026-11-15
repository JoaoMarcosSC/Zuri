import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, computed, inject, input, signal } from '@angular/core';
import { ZUR_I18N } from '../i18n/i18n';
import { ZurPopover, ZurPopoverTrigger } from '../popover/popover';
import { ZurTable } from './table';

/**
 * Botão de filtro para o cabeçalho de uma coluna. Abre um painel com um campo de texto e
 * emite `filterChange` na tabela (depois de uma pausa ao digitar, ou no Enter); filtrar as
 * linhas é com você. Dentro de uma coluna ordenável, fica ao lado do botão de ordenar.
 *
 * ```html
 * <th zurSortable="cliente">Cliente <zur-column-filter key="cliente" /></th>
 * ```
 */
@Component({
  selector: 'zur-column-filter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ZurPopover, ZurPopoverTrigger],
  template: `
    <zur-popover placement="bottom-end" [label]="i18n.filterColumn(name())">
      <button
        type="button"
        class="filter"
        zurPopoverTrigger
        [class.active]="!!value()"
        [attr.aria-label]="i18n.filterColumn(name())"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 5h18l-7 8v6l-4-2v-4z" /></svg>
      </button>
      <div class="panel">
        <input
          class="field"
          type="text"
          autocomplete="off"
          [attr.aria-label]="i18n.filterColumn(name())"
          [value]="value()"
          (input)="onInput($event)"
          (keydown.enter)="flush()"
        />
        @if (value()) {
          <button type="button" class="clear" (click)="clear()">{{ i18n.clearFilter }}</button>
        }
      </div>
    </zur-popover>
  `,
  styles: `
    :host {
      display: inline-block;
      margin-inline-start: var(--zur-space-xxs);
      vertical-align: middle;
      text-transform: none;
      letter-spacing: normal;
    }
    .filter {
      position: relative;
      width: 24px;
      height: 24px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      border: none;
      border-radius: var(--zur-radius-xs);
      background: none;
      color: var(--zur-muted);
      cursor: pointer;
    }
    .filter:hover {
      color: var(--zur-ink);
      background: var(--zur-surface-strong);
    }
    .filter:focus-visible {
      outline: none;
      box-shadow: var(--zur-focus-ring);
    }
    .filter.active {
      color: var(--zur-ink);
    }
    .filter.active::after {
      content: '';
      position: absolute;
      inset-block-start: 1px;
      inset-inline-end: 1px;
      width: 7px;
      height: 7px;
      border-radius: var(--zur-radius-full);
      background: var(--zur-primary);
      border: 1px solid var(--zur-canvas);
    }
    .panel {
      display: grid;
      gap: var(--zur-space-xs);
      min-width: 200px;
    }
    .field {
      height: 40px;
      box-sizing: border-box;
      padding: 0 var(--zur-space-sm);
      font: var(--zur-font-body-sm);
      color: var(--zur-ink);
      background: var(--zur-canvas);
      border: 1px solid var(--zur-hairline);
      border-radius: var(--zur-radius-sm);
    }
    .field:focus {
      outline: none;
      border: 2px solid var(--zur-ink);
      padding: 0 calc(var(--zur-space-sm) - 1px);
    }
    .clear {
      justify-self: start;
      padding: 0;
      border: none;
      background: none;
      font: var(--zur-font-caption);
      font-weight: 700;
      color: var(--zur-ink);
      text-decoration: underline;
      text-underline-offset: 3px;
      cursor: pointer;
    }
    .clear:focus-visible {
      outline: none;
      box-shadow: var(--zur-focus-ring);
    }
  `,
})
export class ZurColumnFilter {
  protected readonly i18n = inject(ZUR_I18N);
  private readonly table = inject(ZurTable);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private timer: ReturnType<typeof setTimeout> | null = null;

  /** Chave da coluna, a mesma enviada no `filterChange`. */
  readonly key = input.required<string>();
  /** Nome da coluna para leitores de tela; padrão: o texto do cabeçalho. */
  readonly label = input('');
  /** Pausa (ms) depois da digitação antes de emitir. */
  readonly debounce = input(250);

  /** Texto digitado agora (ainda pode não ter sido emitido). */
  private readonly draft = signal<string | null>(null);
  protected readonly value = computed(() => this.draft() ?? this.table.filters()[this.key()] ?? '');

  constructor() {
    inject(DestroyRef).onDestroy(() => this.timer && clearTimeout(this.timer));
  }

  protected name(): string {
    if (this.label()) return this.label();
    const th = this.host.nativeElement.closest('th');
    return (th?.querySelector('.zur-sort, :scope')?.textContent ?? th?.textContent ?? this.key()).replace(/\s+/g, ' ').trim() || this.key();
  }

  protected onInput(event: Event): void {
    this.draft.set((event.target as HTMLInputElement).value);
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(), this.debounce());
  }

  protected flush(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    const value = this.draft();
    if (value === null || value === (this.table.filters()[this.key()] ?? '')) return;
    this.table.setFilter(this.key(), value);
    this.draft.set(null);
  }

  protected clear(): void {
    this.draft.set(null);
    this.table.setFilter(this.key(), '');
  }
}
