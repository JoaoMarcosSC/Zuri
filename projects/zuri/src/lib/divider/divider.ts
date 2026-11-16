import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type ZurDividerOrientation = 'horizontal' | 'vertical';

/**
 * Linha fina que separa grupos de conteúdo. Com `label` mostra um texto no meio ("ou"),
 * que também vira o nome acessível do separador.
 *
 * ```html
 * <zur-divider />
 * <zur-divider label="ou" />
 * <zur-divider orientation="vertical" />
 * ```
 */
@Component({
  selector: 'zur-divider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'separator',
    '[attr.aria-orientation]': 'orientation() === "vertical" ? "vertical" : null',
    '[attr.aria-label]': 'label() || null',
    '[attr.data-orientation]': 'orientation()',
  },
  template: `@if (label()) {<span class="text" aria-hidden="true">{{ label() }}</span>}`,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: var(--zur-space-md);
      color: var(--zur-muted);
      font: var(--zur-font-caption);
    }
    :host([data-orientation='horizontal']) {
      width: 100%;
      min-height: 1px;
    }
    :host([data-orientation='horizontal'])::before,
    :host([data-orientation='horizontal'])::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--zur-hairline);
    }
    :host([data-orientation='horizontal']:not(:has(.text)))::after {
      display: none;
    }
    :host([data-orientation='vertical']) {
      display: inline-flex;
      align-self: stretch;
      width: 1px;
      min-height: 1em;
      background: var(--zur-hairline);
    }
  `,
})
export class ZurDivider {
  readonly orientation = input<ZurDividerOrientation>('horizontal');
  readonly label = input('');
}
