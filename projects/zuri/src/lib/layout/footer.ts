import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ZUR_I18N } from '../i18n/i18n';

/** Rodapé simples: conteúdo à esquerda (ex.: copyright), `[zurFooterLinks]` à direita. */
@Component({
  selector: 'zur-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'contentinfo' },
  template: `
    <div class="left"><ng-content /></div>
    <nav class="links" [attr.aria-label]="i18n.footerNav"><ng-content select="[zurFooterLinks]" /></nav>
  `,
  styles: `
    :host {
      box-sizing: border-box;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--zur-space-md);
      padding: var(--zur-space-xl) var(--zur-space-lg);
      border-top: 1px solid var(--zur-hairline);
      background: var(--zur-surface-soft);
      color: var(--zur-muted);
      font: var(--zur-font-body-sm);
    }
    .links {
      display: flex;
      flex-wrap: wrap;
      gap: var(--zur-space-lg);
    }
  `,
})
export class ZurFooter {
  protected readonly i18n = inject(ZUR_I18N);
}
