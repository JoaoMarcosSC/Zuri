import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Navbar 80px — canvas com hairline inferior (Airbnb top-nav).
 * Slots: [zurNavbarLogo], [zurNavbarLinks], [zurNavbarActions].
 * Hospeda o <zur-theme-toggle> no slot de ações.
 */
@Component({
  selector: 'zur-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="slot logo"><ng-content select="[zurNavbarLogo]" /></div>
    <nav class="slot links"><ng-content select="[zurNavbarLinks]" /></nav>
    <div class="slot actions"><ng-content select="[zurNavbarActions]" /></div>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--zur-space-lg);
      height: 80px;
      padding: 0 var(--zur-space-xl);
      background: var(--zur-canvas);
      border-bottom: 1px solid var(--zur-hairline-soft);
      transition: background-color 200ms ease;
    }
    .slot {
      display: flex;
      align-items: center;
      gap: var(--zur-space-md);
    }
    .links {
      gap: var(--zur-space-lg);
      font: var(--zur-font-body);
      font-weight: 600;
      color: var(--zur-ink);
    }
  `,
})
export class ZurNavbar {}
