import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
} from '@angular/core';
import { ZUR_I18N } from '../i18n/i18n';

type PageItem = number | 'gap';

/**
 * Paginação: anterior, números (com reticências quando são muitos) e próxima.
 * `page` começa em 1 e é two-way.
 *
 * ```html
 * <zur-pagination [total]="248" [pageSize]="20" [(page)]="pagina" />
 * ```
 */
@Component({
  selector: 'zur-pagination',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav [attr.aria-label]="i18n.pagination">
      <ul class="list">
        <li>
          <button
            type="button"
            class="item nav"
            [disabled]="page() <= 1"
            [attr.aria-label]="i18n.previousPage"
            (click)="go(page() - 1)"
          >
            <svg class="flip" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
          </button>
        </li>
        @for (item of items(); track $index) {
          <li>
            @if (item === 'gap') {
              <span class="gap" aria-hidden="true">…</span>
            } @else {
              <button
                type="button"
                class="item"
                [attr.aria-label]="i18n.page(item)"
                [attr.aria-current]="item === page() ? 'page' : null"
                (click)="go(item)"
              >
                {{ item }}
              </button>
            }
          </li>
        }
        <li>
          <button
            type="button"
            class="item nav"
            [disabled]="page() >= pageCount()"
            [attr.aria-label]="i18n.nextPage"
            (click)="go(page() + 1)"
          >
            <svg class="flip" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </li>
      </ul>
    </nav>
  `,
  styles: `
    :host {
      display: block;
    }
    .flip {
      transform: scaleX(var(--zur-dir));
    }
    .list {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--zur-space-xxs);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .item {
      min-width: 36px;
      height: 36px;
      padding: 0 var(--zur-space-xs);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid transparent;
      border-radius: var(--zur-radius-sm);
      background: transparent;
      color: var(--zur-ink);
      font: var(--zur-font-body-sm);
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      cursor: pointer;
      transition: background-color 120ms ease;
    }
    .item:hover:not(:disabled) {
      background: var(--zur-surface-strong);
    }
    .item:focus-visible {
      outline: none;
      box-shadow: var(--zur-focus-ring);
    }
    .item[aria-current='page'] {
      background: var(--zur-primary);
      color: var(--zur-on-primary);
    }
    .item:disabled {
      color: var(--zur-muted);
      cursor: not-allowed;
      opacity: 0.6;
    }
    .nav {
      border-color: var(--zur-hairline);
    }
    .gap {
      min-width: 24px;
      text-align: center;
      color: var(--zur-muted);
    }
  `,
})
export class ZurPagination {
  protected readonly i18n = inject(ZUR_I18N);

  /** Página atual, começando em 1. */
  readonly page = model(1);
  /** Total de itens. */
  readonly total = input.required<number>();
  readonly pageSize = input(10);
  /** Quantas páginas mostrar de cada lado da atual. */
  readonly siblings = input(1);

  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.total() / Math.max(1, this.pageSize()))));

  protected readonly items = computed<PageItem[]>(() => {
    const count = this.pageCount();
    const current = Math.min(Math.max(this.page(), 1), count);
    const s = this.siblings();
    const start = Math.max(2, current - s);
    const end = Math.min(count - 1, current + s);
    const pages: PageItem[] = [1];
    if (start > 2) pages.push('gap');
    for (let p = start; p <= end; p++) pages.push(p);
    if (end < count - 1) pages.push('gap');
    if (count > 1) pages.push(count);
    return pages;
  });

  protected go(p: number): void {
    const next = Math.min(Math.max(p, 1), this.pageCount());
    if (next !== this.page()) this.page.set(next);
  }
}
