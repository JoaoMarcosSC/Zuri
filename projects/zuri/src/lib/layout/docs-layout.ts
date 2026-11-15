import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ZUR_LAYOUT_WIDTH_STYLES, ZurLayoutWidth } from './layout-width';
import { ZurShellState } from './shell-state';

/**
 * Documentação: sidebar de navegação (recolhível; gaveta no mobile) e texto
 * centralizado em coluna de leitura (~760px). Slots: `zur-sidebar`,
 * `zur-topbar`, conteúdo, `zur-footer`.
 */
@Component({
  selector: 'zur-docs-layout',
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
      padding: var(--zur-space-section) var(--zur-space-xl) var(--zur-space-section-lg);
    }
    @media (max-width: 767px) {
      .container {
        padding: var(--zur-space-xxl) var(--zur-space-md);
      }
    }
  `,
})
export class ZurDocsLayout {
  readonly width = input<ZurLayoutWidth>('reading');
}
