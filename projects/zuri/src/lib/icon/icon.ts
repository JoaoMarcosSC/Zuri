import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ZurIconDef } from './icons';

/**
 * Ícone SVG do Zuri. Sem `label` é decorativo (`aria-hidden`); com `label` vira `role="img"`.
 * Os ícones direcionais (setas, chevrons) se espelham sozinhos em RTL.
 *
 * ```html
 * <zur-icon [icon]="lupa" />
 * <zur-icon [icon]="alerta" label="Atenção" [size]="24" />
 * ```
 */
@Component({
  selector: 'zur-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.role]': 'label() ? "img" : null',
    '[attr.aria-label]': 'label() || null',
    '[attr.aria-hidden]': 'label() ? null : "true"',
    '[attr.data-mirror]': 'icon().mirror ? "" : null',
    '[style.width.px]': 'size()',
    '[style.height.px]': 'size()',
  },
  template: `
    <svg
      [attr.viewBox]="'0 0 24 24'"
      [attr.width]="size()"
      [attr.height]="size()"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path [attr.d]="path()" />
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex-shrink: 0;
      color: inherit;
    }
    :host([data-mirror]) svg {
      transform: scaleX(var(--zur-dir, 1));
    }
    svg {
      display: block;
    }
  `,
})
export class ZurIcon {
  readonly icon = input.required<ZurIconDef>();
  /** Lado em px (16, 20 ou 24 seguem a grade do sistema). */
  readonly size = input(20);
  /** Texto acessível; sem ele o ícone é decorativo. */
  readonly label = input('');

  protected readonly path = computed(() => this.icon().d);
}
