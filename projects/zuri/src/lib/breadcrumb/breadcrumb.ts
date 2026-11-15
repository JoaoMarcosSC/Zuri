import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface ZurBreadcrumbItem {
  label: string;
  href?: string;
}

/** Breadcrumb em caption muted com separador "/". */
@Component({
  selector: 'zur-breadcrumb',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav aria-label="breadcrumb">
      <ol class="list">
        @for (item of items(); track item.label; let last = $last) {
          <li class="item">
            @if (item.href && !last) {
              <a [href]="item.href" class="link">{{ item.label }}</a>
            } @else {
              <span class="current" [attr.aria-current]="last ? 'page' : null">
                {{ item.label }}
              </span>
            }
            @if (!last) {
              <span class="sep" aria-hidden="true">/</span>
            }
          </li>
        }
      </ol>
    </nav>
  `,
  styles: `
    .list {
      display: flex;
      align-items: center;
      gap: var(--zur-space-xs);
      list-style: none;
      margin: 0;
      padding: 0;
      font: var(--zur-font-caption);
    }
    .item {
      display: inline-flex;
      align-items: center;
      gap: var(--zur-space-xs);
    }
    .link {
      color: var(--zur-muted);
      text-decoration: none;
    }
    .link:hover {
      color: var(--zur-ink);
      text-decoration: underline;
    }
    .current {
      color: var(--zur-ink);
      font-weight: 600;
    }
    .sep {
      color: var(--zur-muted);
    }
  `,
})
export class ZurBreadcrumb {
  readonly items = input<ZurBreadcrumbItem[]>([]);
}
