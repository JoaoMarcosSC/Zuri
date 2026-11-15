import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ZUR_LAYOUT_WIDTH_STYLES, ZurLayoutWidth } from './layout-width';

/**
 * Autenticação: card centralizado (~440px) sobre o fundo da página.
 * Slots: `[zurAuthBrand]` (logo acima), conteúdo (formulário no card),
 * `[zurAuthFooter]` (links abaixo).
 */
@Component({
  selector: 'zur-auth-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-width]': 'width()' },
  template: `
    <div class="wrap">
      <div class="brand"><ng-content select="[zurAuthBrand]" /></div>
      <main class="card"><ng-content /></main>
      <div class="footer"><ng-content select="[zurAuthFooter]" /></div>
    </div>
  `,
  styles: `
    ${ZUR_LAYOUT_WIDTH_STYLES}
    :host {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: var(--zur-space-xl) var(--zur-space-md);
      background: var(--zur-surface-soft);
    }
    .wrap {
      display: flex;
      flex-direction: column;
      gap: var(--zur-space-lg);
      width: 100%;
      max-width: var(--zur-layout-max);
    }
    .brand,
    .footer {
      display: flex;
      justify-content: center;
      text-align: center;
      color: var(--zur-muted);
      font: var(--zur-font-body-sm);
    }
    .brand {
      font: var(--zur-font-title);
      color: var(--zur-ink);
    }
    .brand:empty,
    .footer:empty {
      display: none;
    }
    .card {
      box-sizing: border-box;
      padding: var(--zur-space-xl);
      background: var(--zur-surface-raised);
      border: 1px solid var(--zur-hairline);
      border-radius: var(--zur-radius-lg);
      box-shadow: var(--zur-shadow-float);
    }
    @media (max-width: 767px) {
      .card {
        padding: var(--zur-space-lg);
      }
    }
  `,
})
export class ZurAuthLayout {
  readonly width = input<ZurLayoutWidth>('narrow');
}
