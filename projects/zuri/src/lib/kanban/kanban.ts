import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  TemplateRef,
  contentChild,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ZUR_I18N } from '../i18n/i18n';
import { zurInlineStep } from '../shared/direction';
import { ZUR_SR_ONLY } from '../shared/search';

export interface ZurKanbanItem {
  id: string;
  title?: string;
}

export interface ZurKanbanColumn<T extends ZurKanbanItem = ZurKanbanItem> {
  id: string;
  title: string;
  items: T[];
}

export interface ZurKanbanMove<T extends ZurKanbanItem = ZurKanbanItem> {
  item: T;
  from: string;
  to: string;
  fromIndex: number;
  toIndex: number;
}

/** Template do cartão: `<ng-template zurKanbanCard let-item let-column="column">`. */
@Directive({ selector: 'ng-template[zurKanbanCard]' })
export class ZurKanbanCard {
  readonly template = inject<TemplateRef<{ $implicit: ZurKanbanItem; column: ZurKanbanColumn }>>(TemplateRef);
}

let nextId = 0;

interface Grab {
  itemId: string;
  /** Posição antes do arrasto por teclado, para o Esc desfazer. */
  origin: { column: string; index: number };
}

/** Move um item entre colunas devolvendo um novo array (imutável). */
export function zurKanbanMove<T extends ZurKanbanItem>(
  columns: ZurKanbanColumn<T>[],
  itemId: string,
  to: string,
  toIndex: number,
): { columns: ZurKanbanColumn<T>[]; move: ZurKanbanMove<T> } | null {
  const fromCol = columns.find((c) => c.items.some((i) => i.id === itemId));
  const toCol = columns.find((c) => c.id === to);
  if (!fromCol || !toCol) return null;
  const fromIndex = fromCol.items.findIndex((i) => i.id === itemId);
  const item = fromCol.items[fromIndex];
  const next = columns.map((c) => ({ ...c, items: c.items.filter((i) => i.id !== itemId) }));
  const target = next.find((c) => c.id === to)!;
  const index = Math.max(0, Math.min(toIndex, target.items.length));
  target.items.splice(index, 0, item);
  if (fromCol.id === to && fromIndex === index) return null;
  return { columns: next, move: { item, from: fromCol.id, to, fromIndex, toIndex: index } };
}

/**
 * Quadro de colunas com cartões arrastáveis. Arrasta com mouse/toque (drag and drop
 * nativo) ou teclado: Espaço pega o cartão, setas movem (↑↓ na coluna, ←→ entre
 * colunas), Espaço solta e Esc desfaz — cada passo é anunciado a leitores de tela.
 * `columns` é two-way e `moved` informa cada movimento.
 *
 * ```html
 * <zur-kanban [(columns)]="colunas" (moved)="salvar($event)">
 *   <ng-template zurKanbanCard let-item>{{ item.title }}</ng-template>
 * </zur-kanban>
 * ```
 */
@Component({
  selector: 'zur-kanban',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  template: `
    <p class="sr-only" [id]="instructionsId">{{ i18n.kanbanInstructions }}</p>
    <div class="board">
      @for (column of columns(); track column.id) {
        <section class="column" [attr.aria-labelledby]="instructionsId + '-' + column.id">
          <header class="column-head">
            <h3 class="column-title" [id]="instructionsId + '-' + column.id">{{ column.title }}</h3>
            <span class="column-count">{{ column.items.length }}</span>
          </header>
          <ul
            class="cards"
            [class.over]="dropTarget()?.column === column.id"
            (dragover)="onDragOver($event, column.id)"
            (dragleave)="onDragLeave($event)"
            (drop)="onDrop($event, column.id)"
          >
            @for (item of column.items; track item.id; let i = $index) {
              @if (dropTarget()?.column === column.id && dropTarget()?.index === i) {
                <li class="drop-line" aria-hidden="true"></li>
              }
              <li
                class="card"
                tabindex="0"
                draggable="true"
                [attr.data-id]="item.id"
                [attr.aria-describedby]="instructionsId"
                [class.dragging]="dragId() === item.id"
                [class.grabbed]="grab()?.itemId === item.id"
                (dragstart)="onDragStart($event, item.id)"
                (dragend)="onDragEnd()"
                (keydown)="onKeydown($event, item, column.id)"
                (blur)="onBlur(item)"
              >
                @if (cardTemplate(); as tpl) {
                  <ng-container *ngTemplateOutlet="tpl.template; context: { $implicit: item, column: column }" />
                } @else {
                  {{ labelOf(item) }}
                }
              </li>
            }
            @if (dropTarget()?.column === column.id && dropTarget()?.index === column.items.length) {
              <li class="drop-line" aria-hidden="true"></li>
            }
          </ul>
          @if (addLabel()) {
            <button type="button" class="add" (click)="add.emit(column.id)">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
              {{ addLabel() }}
            </button>
          }
        </section>
      }
    </div>
    <span class="sr-only" aria-live="assertive">{{ announcement() }}</span>
  `,
  styles: [
    ZUR_SR_ONLY,
    `
    :host {
      display: block;
    }
    .board {
      display: flex;
      gap: var(--zur-space-md);
      overflow-x: auto;
      padding-bottom: var(--zur-space-xs);
      align-items: flex-start;
    }
    .column {
      flex: 1 0 240px;
      max-width: 340px;
      display: flex;
      flex-direction: column;
      gap: var(--zur-space-xs);
      padding: var(--zur-space-sm);
      background: var(--zur-surface-soft);
      border: 1px solid var(--zur-hairline-soft);
      border-radius: var(--zur-radius-md);
    }
    .column-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--zur-space-xxs) var(--zur-space-xs);
    }
    .column-title {
      margin: 0;
      font: var(--zur-font-body-sm);
      font-weight: 700;
      color: var(--zur-ink);
    }
    .column-count {
      min-width: 24px;
      height: 22px;
      padding: 0 8px;
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--zur-radius-full);
      background: var(--zur-surface-strong);
      font: var(--zur-font-badge);
      color: var(--zur-body);
    }
    .cards {
      display: flex;
      flex-direction: column;
      gap: var(--zur-space-xs);
      min-height: 64px;
      margin: 0;
      padding: 2px;
      list-style: none;
      border-radius: var(--zur-radius-sm);
      transition: background-color 120ms ease;
    }
    .cards.over {
      background: var(--zur-primary-soft);
    }
    .card {
      padding: var(--zur-space-sm) var(--zur-space-md);
      background: var(--zur-surface-raised);
      border: 1px solid var(--zur-hairline);
      border-radius: var(--zur-radius-md);
      font: var(--zur-font-body-sm);
      color: var(--zur-ink);
      cursor: grab;
      transition: box-shadow 150ms ease, transform 150ms ease, opacity 150ms ease;
    }
    .card:hover {
      box-shadow: var(--zur-shadow-float);
    }
    .card:focus-visible {
      outline: none;
      box-shadow: var(--zur-focus-ring);
    }
    .card.dragging {
      opacity: 0.4;
    }
    .card.grabbed {
      transform: rotate(-1.5deg);
      box-shadow: var(--zur-shadow-float), var(--zur-focus-ring);
      cursor: grabbing;
    }
    .drop-line {
      height: 3px;
      margin: -2px 0;
      border-radius: var(--zur-radius-full);
      background: var(--zur-primary);
    }
    .add {
      display: inline-flex;
      align-items: center;
      gap: var(--zur-space-xxs);
      height: 36px;
      padding: 0 var(--zur-space-sm);
      border: none;
      border-radius: var(--zur-radius-sm);
      background: transparent;
      font: var(--zur-font-body-sm);
      font-weight: 600;
      color: var(--zur-body);
      cursor: pointer;
    }
    .add:hover {
      background: var(--zur-surface-strong);
      color: var(--zur-ink);
    }
    .add:focus-visible {
      outline: none;
      box-shadow: var(--zur-focus-ring);
    }
    @media (prefers-reduced-motion: reduce) {
      .card,
      .card.grabbed {
        transition: none;
        transform: none;
      }
    }
  `,
  ],
})
export class ZurKanban {
  protected readonly i18n = inject(ZUR_I18N);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly columns = model<ZurKanbanColumn[]>([]);
  /** Rótulo do botão "adicionar" no pé de cada coluna; vazio esconde o botão. */
  readonly addLabel = input('');
  /** Texto usado nos anúncios do teclado. Padrão: `title` ou `id` do item. */
  readonly cardLabel = input<(item: ZurKanbanItem) => string>((item) => item.title ?? item.id);

  readonly moved = output<ZurKanbanMove>();
  readonly add = output<string>();

  protected readonly cardTemplate = contentChild(ZurKanbanCard);
  protected readonly instructionsId = `zur-kanban-${nextId++}`;

  protected readonly dragId = signal<string | null>(null);
  protected readonly dropTarget = signal<{ column: string; index: number } | null>(null);
  protected readonly grab = signal<Grab | null>(null);
  protected readonly announcement = signal('');

  protected labelOf(item: ZurKanbanItem): string {
    return this.cardLabel()(item);
  }

  private columnTitle(id: string): string {
    return this.columns().find((c) => c.id === id)?.title ?? id;
  }

  private locate(itemId: string): { column: string; index: number } | null {
    for (const c of this.columns()) {
      const index = c.items.findIndex((i) => i.id === itemId);
      if (index >= 0) return { column: c.id, index };
    }
    return null;
  }

  /** Aplica o movimento; retorna se algo mudou. */
  moveItem(itemId: string, to: string, toIndex: number): boolean {
    const result = zurKanbanMove(this.columns(), itemId, to, toIndex);
    if (!result) return false;
    this.columns.set(result.columns);
    this.moved.emit(result.move);
    return true;
  }

  // ── Mouse / toque (drag and drop nativo) ──

  protected onDragStart(event: DragEvent, itemId: string): void {
    this.grab.set(null);
    this.dragId.set(itemId);
    event.dataTransfer?.setData('text/plain', itemId);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  }

  protected onDragOver(event: DragEvent, column: string): void {
    if (!this.dragId()) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    const list = event.currentTarget as HTMLElement;
    const cards = Array.from(list.querySelectorAll<HTMLElement>('.card:not(.dragging)'));
    let index = cards.findIndex((c) => {
      const rect = c.getBoundingClientRect();
      return event.clientY < rect.top + rect.height / 2;
    });
    if (index < 0) index = cards.length;
    // O índice ignora o próprio cartão arrastado; converte para o índice real da coluna.
    const items = this.columns().find((c) => c.id === column)?.items ?? [];
    const visible = items.filter((i) => i.id !== this.dragId());
    const before = visible[index];
    const real = before ? items.findIndex((i) => i.id === before.id) : items.length;
    this.dropTarget.set({ column, index: real });
  }

  protected onDragLeave(event: DragEvent): void {
    const list = event.currentTarget as HTMLElement;
    if (!list.contains(event.relatedTarget as Node | null)) this.dropTarget.set(null);
  }

  protected onDrop(event: DragEvent, column: string): void {
    event.preventDefault();
    const itemId = this.dragId() ?? event.dataTransfer?.getData('text/plain');
    const target = this.dropTarget();
    if (itemId) {
      const from = this.locate(itemId);
      let index = target?.column === column ? target.index : Number.MAX_SAFE_INTEGER;
      // Na mesma coluna, remover o item desloca o índice dos que vêm depois.
      if (from && from.column === column && from.index < index) index--;
      this.moveItem(itemId, column, index);
    }
    this.onDragEnd();
  }

  protected onDragEnd(): void {
    this.dragId.set(null);
    this.dropTarget.set(null);
  }

  // ── Teclado ──

  protected onKeydown(event: KeyboardEvent, item: ZurKanbanItem, column: string): void {
    const grab = this.grab();
    const label = this.labelOf(item);

    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      const pos = this.locate(item.id)!;
      if (grab?.itemId === item.id) {
        this.grab.set(null);
        this.announcement.set(this.i18n.cardDropped(label, this.columnTitle(pos.column), pos.index + 1));
      } else {
        this.grab.set({ itemId: item.id, origin: pos });
        this.announcement.set(this.i18n.cardGrabbed(label, this.columnTitle(pos.column), pos.index + 1));
      }
      return;
    }

    if (!grab || grab.itemId !== item.id) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      this.moveItem(item.id, grab.origin.column, grab.origin.index);
      this.grab.set(null);
      this.announcement.set(this.i18n.cardCancelled(label));
      this.refocus(item.id);
      return;
    }

    const pos = this.locate(item.id)!;
    const cols = this.columns();
    const colIndex = cols.findIndex((c) => c.id === column);
    let to = pos.column;
    let index = pos.index;
    // ←→ andam entre colunas no sentido de leitura (em RTL as colunas espelham)
    const inline = zurInlineStep(event, this.host.nativeElement);
    if (inline !== 0) {
      const target = cols[colIndex + inline];
      if (!target) return;
      to = target.id;
    } else if (event.key === 'ArrowUp') {
      index = pos.index - 1;
    } else if (event.key === 'ArrowDown') {
      index = pos.index + 1;
    } else {
      return;
    }
    event.preventDefault();
    if (index < 0) return;
    if (this.moveItem(item.id, to, index)) {
      const now = this.locate(item.id)!;
      this.announcement.set(this.i18n.cardMoved(label, this.columnTitle(now.column), now.index + 1));
      this.refocus(item.id);
    }
  }

  /** Soltar ao sair do cartão (Tab) para não deixar um cartão "preso". */
  protected onBlur(item: ZurKanbanItem): void {
    const grab = this.grab();
    if (grab?.itemId !== item.id) return;
    // O cartão é recriado ao trocar de coluna; só solta se o foco foi para fora de verdade.
    setTimeout(() => {
      const active = this.host.nativeElement.ownerDocument.activeElement as HTMLElement | null;
      if (this.grab()?.itemId === item.id && active?.getAttribute('data-id') !== item.id) {
        this.grab.set(null);
      }
    });
  }

  private refocus(itemId: string): void {
    setTimeout(() => this.host.nativeElement.querySelector<HTMLElement>(`.card[data-id="${itemId}"]`)?.focus());
  }
}
