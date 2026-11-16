import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  Injector,
  Renderer2,
  afterNextRender,
  computed,
  inject,
  input,
  numberAttribute,
  output,
} from '@angular/core';
import { ZUR_I18N } from '../i18n/i18n';
import { zurInlineStep, zurIsRtl } from '../shared/direction';
import { ZUR_SR_ONLY } from '../shared/search';
import { ZurSkeleton } from '../skeleton/skeleton';
import { ZurTable } from './table';

/**
 * Torna a coluna redimensionável: uma alça no fim da célula do cabeçalho arrasta com o mouse ou o
 * toque e também funciona pelo teclado (←/→ mudam 8 px, com Shift 32 px). O valor é a chave da
 * coluna; a largura nova sai em `columnResize` da tabela. Convive com `zurSortable`.
 *
 * ```html
 * <th zurSortable="nome" zurResizable="nome">Nome</th>
 * ```
 */
@Directive({
  selector: 'th[zurResizable]',
  host: { class: 'zur-resizable' },
})
export class ZurResizable {
  private readonly table = inject(ZurTable);
  private readonly i18n = inject(ZUR_I18N);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly injector = inject(Injector);

  readonly zurResizable = input.required<string>();
  readonly minWidth = input(64, { transform: numberAttribute });
  readonly maxWidth = input(640, { transform: numberAttribute });

  private handle: HTMLElement | null = null;

  constructor() {
    this.table.resizableCount.update((n) => n + 1);
    inject(DestroyRef).onDestroy(() => this.table.resizableCount.update((n) => n - 1));
    afterNextRender(() => this.createHandle(), { injector: this.injector });
  }

  private clamp(width: number): number {
    return Math.min(this.maxWidth(), Math.max(this.minWidth(), Math.round(width)));
  }

  private apply(width: number, emit: boolean): void {
    const w = this.clamp(width);
    this.renderer.setStyle(this.el.nativeElement, 'width', `${w}px`);
    this.handle?.setAttribute('aria-valuenow', String(w));
    if (emit) this.table.columnResize.emit({ key: this.zurResizable(), width: w });
  }

  private createHandle(): void {
    const th = this.el.nativeElement;
    const handle = this.renderer.createElement('span') as HTMLElement;
    this.handle = handle;
    const name = (th.textContent ?? '').trim() || this.zurResizable();
    handle.className = 'zur-resize-handle';
    handle.setAttribute('role', 'separator');
    handle.setAttribute('aria-orientation', 'vertical');
    handle.setAttribute('tabindex', '0');
    handle.setAttribute('aria-label', this.i18n.resizeColumn(name));
    handle.setAttribute('aria-valuemin', String(this.minWidth()));
    handle.setAttribute('aria-valuemax', String(this.maxWidth()));
    handle.setAttribute('aria-valuenow', String(this.clamp(th.offsetWidth)));
    this.renderer.appendChild(th, handle);

    let startX = 0;
    let startWidth = 0;
    let direction = 1;
    handle.addEventListener('pointerdown', (e: PointerEvent) => {
      e.preventDefault();
      handle.setPointerCapture(e.pointerId);
      startX = e.clientX;
      startWidth = th.offsetWidth;
      direction = zurIsRtl(th) ? -1 : 1;
      handle.setAttribute('data-active', '');
    });
    handle.addEventListener('pointermove', (e: PointerEvent) => {
      if (!handle.hasPointerCapture(e.pointerId)) return;
      this.apply(startWidth + (e.clientX - startX) * direction, false);
    });
    const end = (e: PointerEvent) => {
      if (!handle.hasPointerCapture(e.pointerId)) return;
      handle.releasePointerCapture(e.pointerId);
      handle.removeAttribute('data-active');
      this.apply(th.offsetWidth, true);
    };
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
    handle.addEventListener('click', (e) => e.stopPropagation()); // não aciona a ordenação
    handle.addEventListener('keydown', (e: KeyboardEvent) => {
      const step = zurInlineStep(e, th);
      if (!step) return;
      e.preventDefault();
      this.apply(th.offsetWidth + step * (e.shiftKey ? 32 : 8), true);
    });
  }
}

/**
 * Barra acima da tabela. Em repouso mostra o que você projetar (busca, filtros, botão de
 * exportar); com linhas selecionadas (`[selectedCount]`) troca para a barra de lote: contagem, as
 * ações de `[zurTableToolbarBatch]` e "Limpar seleção". A contagem é anunciada para leitores de tela.
 *
 * ```html
 * <zur-table-toolbar [selectedCount]="marcadas().length" (clearSelection)="marcadas.set([])">
 *   <zur-search label="Buscar pedidos" />
 *   <button zurTableToolbarBatch zur-button size="sm" variant="danger">Excluir</button>
 * </zur-table-toolbar>
 * ```
 */
@Component({
  selector: 'zur-table-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-batch]': 'batch() ? "" : null' },
  template: `
    <span class="sr-only" aria-live="polite">{{ batch() ? i18n.selectedCount(selectedCount()) : '' }}</span>
    @if (batch()) {
      <span class="count" aria-hidden="true">{{ i18n.selectedCount(selectedCount()) }}</span>
      <div class="actions"><ng-content select="[zurTableToolbarBatch]" /></div>
      <button type="button" class="clear" (click)="clearSelection.emit()">{{ i18n.clearSelection }}</button>
    } @else {
      <div class="normal"><ng-content /></div>
    }
  `,
  styles: [
    ZUR_SR_ONLY,
    `
    :host {
      display: flex;
      align-items: center;
      gap: var(--zur-space-md);
      box-sizing: border-box;
      min-height: 64px;
      padding: var(--zur-space-xs) var(--zur-space-md);
      background: var(--zur-canvas);
      border-block-end: 1px solid var(--zur-hairline);
    }
    :host([data-batch]) {
      background: var(--zur-primary-soft);
      color: var(--zur-on-primary-soft);
    }
    .normal,
    .actions {
      display: flex;
      align-items: center;
      gap: var(--zur-space-sm);
      flex: 1;
      min-width: 0;
    }
    .count {
      font: var(--zur-font-button);
    }
    .actions {
      justify-content: flex-start;
    }
    .clear {
      margin-inline-start: auto;
      padding: var(--zur-space-xs) var(--zur-space-sm);
      border: none;
      border-radius: var(--zur-radius-sm);
      background: transparent;
      color: inherit;
      font: var(--zur-font-button);
      text-decoration: underline;
      text-underline-offset: 3px;
      cursor: pointer;
    }
    .clear:hover {
      background: rgba(0, 0, 0, 0.06);
    }
    .clear:focus-visible {
      outline: none;
      box-shadow: var(--zur-focus-ring);
    }
  `,
  ],
})
export class ZurTableToolbar {
  protected readonly i18n = inject(ZUR_I18N);

  /** Linhas selecionadas; maior que zero liga a barra de lote. */
  readonly selectedCount = input(0, { transform: numberAttribute });
  readonly clearSelection = output<void>();

  protected readonly batch = computed(() => this.selectedCount() > 0);
}

/**
 * Corpo de carregamento: `rows` linhas de `columns` células em skeleton, e a tabela fica com
 * `aria-busy` e um aviso "Carregando dados" para leitores de tela. Troque pelo `tbody` real
 * quando os dados chegarem.
 *
 * ```html
 * @if (carregando()) { <tbody zurTableSkeleton [rows]="5" [columns]="4"></tbody> } @else { <tbody>…</tbody> }
 * ```
 */
@Component({
  selector: 'tbody[zurTableSkeleton]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ZurSkeleton],
  template: `
    <tr>
      <td class="zur-sr-only" [attr.colspan]="columns()" role="status">{{ i18n.tableLoading }}</td>
    </tr>
    @for (r of rowList(); track r) {
      <tr aria-hidden="true">
        @for (c of colList(); track c) {
          <td><zur-skeleton [width]="widths[(r + c) % widths.length]" height="14px" /></td>
        }
      </tr>
    }
  `,
})
export class ZurTableSkeleton {
  protected readonly i18n = inject(ZUR_I18N);
  private readonly table = inject(ZurTable);

  readonly rows = input(5, { transform: numberAttribute });
  readonly columns = input(4, { transform: numberAttribute });

  protected readonly widths = ['80%', '60%', '70%', '45%'];
  protected readonly rowList = computed(() => Array.from({ length: this.rows() }, (_, i) => i));
  protected readonly colList = computed(() => Array.from({ length: this.columns() }, (_, i) => i));

  constructor() {
    this.table.busy.set(true);
    inject(DestroyRef).onDestroy(() => this.table.busy.set(false));
  }
}
