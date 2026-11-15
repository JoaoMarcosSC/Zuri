import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  TemplateRef,
  computed,
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
import { zurNormalize } from '../shared/search';

export interface ZurTreeNode {
  id: string;
  label: string;
  children?: ZurTreeNode[];
  disabled?: boolean;
}

export type ZurTreeSelection = 'none' | 'single' | 'multiple';

interface FlatNode {
  node: ZurTreeNode;
  level: number;
  posInSet: number;
  setSize: number;
  parentId: string | null;
  expandable: boolean;
  expanded: boolean;
}

/** Template de cada nó: `<ng-template zurTreeNode let-node>…</ng-template>`. */
@Directive({ selector: 'ng-template[zurTreeNode]' })
export class ZurTreeNodeTemplate {
  readonly template = inject<TemplateRef<{ $implicit: ZurTreeNode; expanded: boolean }>>(TemplateRef);
}

/**
 * Árvore expansível (pastas, categorias, estrutura de menu) no padrão ARIA `tree`:
 * ↑↓ andam pelos nós visíveis, → abre (ou desce ao primeiro filho), ← fecha (ou sobe ao pai;
 * invertidas em RTL), Home/End, `*` abre os irmãos, Enter/Espaço seleciona e digitar uma letra
 * pula para o próximo nó que começa com ela.
 *
 * ```html
 * <zur-tree label="Categorias" [nodes]="categorias" selection="single" [(selected)]="escolhida" />
 * ```
 */
@Component({
  selector: 'zur-tree',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  template: `
    <ul
      class="tree"
      role="tree"
      [attr.aria-label]="label() || i18n.tree"
      [attr.aria-multiselectable]="selection() === 'multiple' ? true : null"
      (keydown)="onKeydown($event)"
    >
      @for (row of rows(); track row.node.id) {
        <li
          class="item"
          role="treeitem"
          [attr.data-id]="row.node.id"
          [attr.aria-level]="row.level"
          [attr.aria-setsize]="row.setSize"
          [attr.aria-posinset]="row.posInSet"
          [attr.aria-expanded]="row.expandable ? row.expanded : null"
          [attr.aria-selected]="selection() === 'none' ? null : isSelected(row.node.id)"
          [attr.aria-disabled]="row.node.disabled || null"
          [class.selected]="isSelected(row.node.id)"
          [class.disabled]="row.node.disabled"
          [tabindex]="row.node.id === tabStop() ? 0 : -1"
          [style.--zur-tree-level]="row.level - 1"
          (click)="onRowClick($event, row)"
          (focus)="focused.set(row.node.id)"
        >
          <span class="row">
            @if (row.expandable) {
              <svg class="chevron" [class.open]="row.expanded" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
            } @else {
              <span class="spacer"></span>
            }
            @if (nodeTemplate(); as tpl) {
              <ng-container *ngTemplateOutlet="tpl.template; context: { $implicit: row.node, expanded: row.expanded }" />
            } @else {
              <span class="label">{{ row.node.label }}</span>
            }
          </span>
        </li>
      }
    </ul>
  `,
  styles: `
    :host {
      display: block;
    }
    .tree {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .item {
      outline: none;
    }
    .row {
      display: flex;
      align-items: center;
      gap: var(--zur-space-xs);
      min-height: 36px;
      padding-block: 2px;
      padding-inline: calc(var(--zur-space-xs) + var(--zur-tree-level, 0) * 20px) var(--zur-space-sm);
      border-radius: var(--zur-radius-sm);
      font: var(--zur-font-body-sm);
      color: var(--zur-ink);
      cursor: pointer;
    }
    .item:hover > .row {
      background: var(--zur-surface-soft);
    }
    .item.selected > .row {
      background: var(--zur-primary-soft);
      color: var(--zur-on-primary-soft);
      font-weight: 700;
    }
    .item:focus-visible > .row {
      box-shadow: var(--zur-focus-ring);
    }
    .item.disabled > .row {
      opacity: 0.45;
      cursor: not-allowed;
    }
    .chevron {
      flex-shrink: 0;
      color: var(--zur-muted);
      transition: transform 120ms ease;
    }
    .chevron {
      transform: scaleX(var(--zur-dir));
    }
    .chevron.open {
      transform: rotate(90deg);
    }
    .spacer {
      width: 16px;
      flex-shrink: 0;
    }
    @media (prefers-reduced-motion: reduce) {
      .chevron {
        transition: none;
      }
    }
  `,
})
export class ZurTree {
  protected readonly i18n = inject(ZUR_I18N);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly nodes = input<ZurTreeNode[]>([]);
  readonly label = input('');
  readonly selection = input<ZurTreeSelection>('none');
  /** Ids dos nós selecionados (two-way). */
  readonly selected = model<string[]>([]);
  /** Ids dos nós abertos (two-way). */
  readonly expanded = model<string[]>([]);

  /** Abriu ou fechou um nó. */
  readonly nodeToggle = output<{ node: ZurTreeNode; expanded: boolean }>();

  protected readonly nodeTemplate = contentChild(ZurTreeNodeTemplate);
  protected readonly focused = signal<string | null>(null);
  private typeahead = '';
  private typeaheadTimer: ReturnType<typeof setTimeout> | null = null;

  /** Nós visíveis (os filhos de nós fechados ficam de fora), já "achatados". */
  protected readonly rows = computed<FlatNode[]>(() => {
    const open = new Set(this.expanded());
    const out: FlatNode[] = [];
    const walk = (list: ZurTreeNode[], level: number, parentId: string | null) => {
      list.forEach((node, i) => {
        const expandable = !!node.children?.length;
        const isOpen = expandable && open.has(node.id);
        out.push({ node, level, posInSet: i + 1, setSize: list.length, parentId, expandable, expanded: isOpen });
        if (isOpen) walk(node.children!, level + 1, node.id);
      });
    };
    walk(this.nodes(), 1, null);
    return out;
  });

  /** Só um nó está no Tab: o focado, ou o selecionado, ou o primeiro. */
  protected readonly tabStop = computed(() => {
    const rows = this.rows();
    const ids = new Set(rows.map((r) => r.node.id));
    const focused = this.focused();
    if (focused && ids.has(focused)) return focused;
    const selected = this.selected().find((id) => ids.has(id));
    return selected ?? rows[0]?.node.id ?? null;
  });

  protected isSelected(id: string): boolean {
    return this.selected().includes(id);
  }

  private setOpen(row: FlatNode, open: boolean): void {
    if (!row.expandable || row.expanded === open) return;
    this.expanded.update((ids) => (open ? [...ids, row.node.id] : ids.filter((i) => i !== row.node.id)));
    this.nodeToggle.emit({ node: row.node, expanded: open });
  }

  private select(row: FlatNode): void {
    if (this.selection() === 'none' || row.node.disabled) return;
    if (this.selection() === 'single') this.selected.set([row.node.id]);
    else this.selected.update((ids) => (ids.includes(row.node.id) ? ids.filter((i) => i !== row.node.id) : [...ids, row.node.id]));
  }

  private focusRow(id: string | undefined): void {
    if (!id) return;
    this.focused.set(id);
    queueMicrotask(() => this.host.nativeElement.querySelector<HTMLElement>(`[data-id="${CSS.escape(id)}"]`)?.focus());
  }

  protected onRowClick(event: MouseEvent, row: FlatNode): void {
    if (row.node.disabled) return;
    this.focused.set(row.node.id);
    const onChevron = !!(event.target as Element).closest('.chevron');
    if (row.expandable && (onChevron || this.selection() === 'none')) this.setOpen(row, !row.expanded);
    else this.select(row);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const rows = this.rows();
    const id = (event.target as HTMLElement).closest('[data-id]')?.getAttribute('data-id');
    const index = rows.findIndex((r) => r.node.id === id);
    if (index < 0) return;
    const row = rows[index];
    const next = (delta: number) => rows[Math.max(0, Math.min(rows.length - 1, index + delta))]?.node.id;
    const step = zurInlineStep(event, this.host.nativeElement);

    if (step === 1) {
      // avança no sentido da leitura: abre ou desce ao primeiro filho
      event.preventDefault();
      if (row.expandable && !row.expanded) this.setOpen(row, true);
      else if (row.expandable) this.focusRow(rows[index + 1]?.node.id);
      return;
    }
    if (step === -1) {
      event.preventDefault();
      if (row.expandable && row.expanded) this.setOpen(row, false);
      else if (row.parentId) this.focusRow(row.parentId);
      return;
    }
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusRow(next(1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusRow(next(-1));
        break;
      case 'Home':
        event.preventDefault();
        this.focusRow(rows[0].node.id);
        break;
      case 'End':
        event.preventDefault();
        this.focusRow(rows[rows.length - 1].node.id);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (this.selection() === 'none') this.setOpen(row, !row.expanded);
        else this.select(row);
        break;
      case '*': {
        event.preventDefault();
        rows.filter((r) => r.parentId === row.parentId).forEach((r) => this.setOpen(r, true));
        break;
      }
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) this.jumpTo(event.key, index);
    }
  }

  /** Digitar letras salta para o próximo nó cujo texto começa com elas. */
  private jumpTo(char: string, from: number): void {
    this.typeahead += char;
    if (this.typeaheadTimer) clearTimeout(this.typeaheadTimer);
    this.typeaheadTimer = setTimeout(() => (this.typeahead = ''), 600);
    const query = zurNormalize(this.typeahead);
    const rows = this.rows();
    const order = [...rows.slice(from + (this.typeahead.length === 1 ? 1 : 0)), ...rows.slice(0, from + 1)];
    const hit = order.find((r) => zurNormalize(r.node.label).startsWith(query));
    this.focusRow(hit?.node.id);
  }
}
