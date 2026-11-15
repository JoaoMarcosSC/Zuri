import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ZurShellState } from '../layout/shell-state';

export type ZurLogoVariant = 'horizontal' | 'symbol' | 'auto';

/**
 * Logo do Zuri: o Z com broto é a primeira letra de "zuri". As cores vêm dos tokens
 * (`--zur-primary`, `--zur-primary-active`, `--zur-ink`), então acompanha o tema
 * claro/escuro sozinho.
 *
 * - `horizontal`: símbolo + "zuri";
 * - `symbol`: só o símbolo (favicon, sidebar recolhida);
 * - `auto`: horizontal, mas vira símbolo quando a sidebar do layout está recolhida.
 *
 * ```html
 * <zur-logo />
 * <zur-logo variant="symbol" [size]="24" />
 * ```
 */
@Component({
  selector: 'zur-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'img', 'aria-label': 'Zuri' },
  template: `
    @if (symbolOnly()) {
      <svg viewBox="0 0 64 64" [attr.width]="size()" [attr.height]="size()" aria-hidden="true">
        <path
          d="M15 19 H42 L15 47 H49"
          fill="none"
          stroke="var(--zur-primary-active)"
          stroke-width="9"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path d="M44 17 C44 8 51 3.5 60.5 3.5 C60.5 12.5 54 18 44 17 Z" fill="var(--zur-primary)" />
      </svg>
    } @else {
      <svg
        viewBox="8 0 130 64"
        [attr.width]="size() * 2.031"
        [attr.height]="size()"
        aria-hidden="true"
      >
        <path
          d="M15 20 H50.1 L15 56 H59.2"
          fill="none"
          stroke="var(--zur-primary-active)"
          stroke-width="9"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path d="M44 17 C44 8 51 3.5 60.5 3.5 C60.5 12.5 54 18 44 17 Z" transform="translate(50.1 20) scale(1.1) translate(-42 -19)" fill="var(--zur-primary)" />
        <g
          fill="none"
          stroke="var(--zur-ink)"
          stroke-width="8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M73 28 V46 A10 10 0 0 0 93 46 V28" />
          <path d="M105 28 V56 M105 43 C105 33 110 28 118 29" />
          <path d="M131 28 V56" />
        </g>
        <circle cx="131" cy="16" r="4.4" fill="var(--zur-primary)" />
      </svg>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      line-height: 0;
    }
    svg {
      display: block;
    }
  `,
})
export class ZurLogo {
  private readonly shell = inject(ZurShellState, { optional: true });

  readonly variant = input<ZurLogoVariant>('horizontal');
  /** Altura em px (a largura segue a proporção do logo). */
  readonly size = input(32);

  protected readonly symbolOnly = computed(() => {
    const v = this.variant();
    if (v === 'symbol') return true;
    if (v === 'auto') {
      return !!this.shell && this.shell.collapsed() && this.shell.viewport() !== 'mobile';
    }
    return false;
  });
}
