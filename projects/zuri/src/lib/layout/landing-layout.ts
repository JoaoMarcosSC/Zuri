import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ZUR_LAYOUT_WIDTH_STYLES, ZurLayoutWidth } from './layout-width';

/**
 * Landing / página descritiva: topbar no topo, seções longas centralizadas
 * (~1100px) e rodapé. Slots por elemento: `zur-topbar`, conteúdo, `zur-footer`.
 *
 * ```html
 * <zur-landing-layout>
 *   <zur-topbar>…</zur-topbar>
 *   <section>…</section>
 *   <zur-footer>…</zur-footer>
 * </zur-landing-layout>
 * ```
 */
@Component({
  selector: 'zur-landing-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-width]': 'width()' },
  template: `
    <ng-content select="zur-topbar" />
    <main class="main"><div class="container"><ng-content /></div></main>
    <ng-content select="zur-footer" />
  `,
  styles: `
    ${ZUR_LAYOUT_WIDTH_STYLES}
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: var(--zur-canvas);
    }
    .main {
      flex: 1;
    }
    .container {
      box-sizing: border-box;
      width: 100%;
      max-width: var(--zur-layout-max);
      margin: 0 auto;
      padding: var(--zur-space-section) var(--zur-space-lg);
    }
    @media (max-width: 767px) {
      .container {
        padding: var(--zur-space-xxl) var(--zur-space-md);
      }
    }
  `,
})
export class ZurLandingLayout {
  readonly width = input<ZurLayoutWidth>('wide');
}
