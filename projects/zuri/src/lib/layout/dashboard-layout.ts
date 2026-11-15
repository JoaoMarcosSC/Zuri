import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ZUR_LAYOUT_WIDTH_STYLES, ZurLayoutWidth } from './layout-width';
import { ZurShellState } from './shell-state';

/**
 * Dashboard / admin: sidebar à esquerda (recolhível; gaveta no mobile), topbar
 * sticky e área principal fluida. Slots: `zur-sidebar`, `zur-topbar`, conteúdo.
 *
 * ```html
 * <zur-dashboard-layout>
 *   <zur-sidebar>…</zur-sidebar>
 *   <zur-topbar>…</zur-topbar>
 *   <zur-page-header title="Visão geral" />
 * </zur-dashboard-layout>
 * ```
 */
@Component({
  selector: 'zur-dashboard-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ZurShellState],
  host: { '[attr.data-width]': 'width()' },
  template: `
    <ng-content select="zur-sidebar" />
    <div class="column">
      <ng-content select="zur-topbar" />
      <main class="main"><div class="container"><ng-content /></div></main>
      <ng-content select="zur-footer" />
    </div>
  `,
  styles: `
    ${ZUR_LAYOUT_WIDTH_STYLES}
    :host {
      display: flex;
      min-height: 100vh;
      background: var(--zur-canvas);
    }
    .column {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }
    .main {
      flex: 1;
    }
    .container {
      box-sizing: border-box;
      width: 100%;
      max-width: var(--zur-layout-max);
      margin: 0 auto;
      padding: var(--zur-space-xl) var(--zur-space-lg);
    }
    @media (max-width: 767px) {
      .container {
        padding: var(--zur-space-lg) var(--zur-space-md);
      }
    }
  `,
})
export class ZurDashboardLayout {
  readonly width = input<ZurLayoutWidth>('fluid');
}
