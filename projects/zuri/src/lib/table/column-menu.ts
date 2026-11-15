import { ChangeDetectionStrategy, Component, computed, inject, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ZurCheckbox } from '../checkbox/checkbox';
import { ZUR_I18N } from '../i18n/i18n';
import { ZurPopover, ZurPopoverTrigger } from '../popover/popover';

export interface ZurTableColumn {
  key: string;
  label: string;
}

/**
 * Menu para mostrar e ocultar colunas da tabela. `visible` (two-way) tem as chaves
 * das colunas à mostra; renderizar ou não cada coluna é com você. Nunca deixa a tabela
 * sem nenhuma coluna.
 *
 * ```html
 * <zur-column-menu [columns]="colunas" [(visible)]="visiveis" />
 * <th>…</th> @if (visiveis().includes('produto')) { <th>Produto</th> }
 * ```
 */
@Component({
  selector: 'zur-column-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ZurCheckbox, ZurPopover, ZurPopoverTrigger],
  template: `
    <zur-popover placement="bottom-end" [label]="i18n.visibleColumns">
      <button type="button" class="trigger" zurPopoverTrigger>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16M15 4v16" /></svg>
        {{ i18n.visibleColumns }}
      </button>
      <div class="list" role="group" [attr.aria-label]="i18n.visibleColumns">
        @for (col of columns(); track col.key) {
          <zur-checkbox
            [disabled]="isLast(col.key)"
            [ngModel]="visible().includes(col.key)"
            (ngModelChange)="toggle(col.key, $event)"
          >{{ col.label }}</zur-checkbox>
        }
      </div>
    </zur-popover>
  `,
  styles: `
    :host {
      display: inline-block;
    }
    .trigger {
      height: 36px;
      display: inline-flex;
      align-items: center;
      gap: var(--zur-space-xs);
      padding: 0 var(--zur-space-md);
      border: 1px solid var(--zur-ink);
      border-radius: var(--zur-radius-sm);
      background: var(--zur-canvas);
      font: var(--zur-font-button);
      font-size: 14px;
      color: var(--zur-ink);
      cursor: pointer;
    }
    .trigger:hover {
      background: var(--zur-surface-soft);
    }
    .trigger:focus-visible {
      outline: none;
      box-shadow: var(--zur-focus-ring);
    }
    .list {
      display: grid;
      gap: var(--zur-space-sm);
    }
  `,
})
export class ZurColumnMenu {
  protected readonly i18n = inject(ZUR_I18N);

  readonly columns = input<ZurTableColumn[]>([]);
  /** Chaves das colunas visíveis (two-way). */
  readonly visible = model<string[]>([]);

  private readonly onlyOne = computed(() => this.visible().length <= 1);

  protected isLast(key: string): boolean {
    return this.onlyOne() && this.visible().includes(key);
  }

  protected toggle(key: string, on: boolean): void {
    if (on) {
      // mantém a ordem original das colunas
      const next = new Set([...this.visible(), key]);
      this.visible.set(this.columns().map((c) => c.key).filter((k) => next.has(k)));
    } else if (this.visible().length > 1) {
      this.visible.set(this.visible().filter((k) => k !== key));
    }
  }
}
