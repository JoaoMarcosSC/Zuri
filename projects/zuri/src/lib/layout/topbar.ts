import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  OnInit,
  booleanAttribute,
  inject,
  input,
  signal,
} from '@angular/core';
import { ZUR_I18N } from '../i18n/i18n';
import { ZurShellState } from './shell-state';

/**
 * Topbar de layout: fica fixa (sticky) no topo; com `hideOnScroll` (padrão)
 * some ao rolar para baixo e volta ao rolar para cima. Dentro de um layout com
 * sidebar, mostra o botão de menu (recolher no desktop, gaveta no mobile).
 *
 * Slots: `[zurTopbarStart]` (logo/título), `[zurTopbarLinks]`, `[zurTopbarActions]`.
 */
@Component({
  selector: 'zur-topbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'banner',
    '[attr.data-hidden]': 'hidden()',
    '(window:scroll)': 'onScroll()',
  },
  template: `
    @if (shell?.hasSidebar()) {
      <button
        type="button"
        class="menu"
        [attr.aria-label]="i18n.toggleNav"
        [attr.aria-expanded]="expanded()"
        (click)="shell?.toggle()"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>
    }
    <div class="slot start"><ng-content select="[zurTopbarStart]" /></div>
    <nav class="slot links" [attr.aria-label]="i18n.topNav"><ng-content select="[zurTopbarLinks]" /></nav>
    <div class="slot actions"><ng-content select="[zurTopbarActions]" /></div>
  `,
  styles: `
    :host {
      position: sticky;
      top: 0;
      z-index: 30;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: var(--zur-space-md);
      height: 64px;
      padding: 0 var(--zur-space-lg);
      background: var(--zur-canvas);
      border-bottom: 1px solid var(--zur-hairline-soft);
      transition:
        transform 200ms ease,
        background-color 200ms ease;
    }
    :host([data-hidden='true']) {
      transform: translateY(-100%);
    }
    .slot {
      display: flex;
      align-items: center;
      gap: var(--zur-space-md);
    }
    .start {
      font: var(--zur-font-title);
      color: var(--zur-ink);
    }
    .links {
      flex: 1;
      gap: var(--zur-space-lg);
      font: var(--zur-font-body);
      font-weight: 600;
      color: var(--zur-ink);
    }
    .actions {
      margin-inline-start: auto;
    }
    .menu {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      padding: 0;
      border: 1px solid var(--zur-hairline);
      border-radius: var(--zur-radius-sm);
      background: transparent;
      color: var(--zur-ink);
      cursor: pointer;
      transition: background-color 120ms ease;
    }
    .menu:hover {
      background: var(--zur-surface-strong);
    }
    .menu:focus-visible {
      outline: none;
      box-shadow: var(--zur-focus-ring);
    }
    @media (max-width: 767px) {
      :host {
        padding: 0 var(--zur-space-md);
      }
      .links {
        display: none;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      :host {
        transition: none;
      }
    }
  `,
})
export class ZurTopbar implements OnInit {
  protected readonly i18n = inject(ZUR_I18N);

  private readonly doc = inject(DOCUMENT);
  protected readonly shell = inject(ZurShellState, { optional: true });

  /** Esconde ao rolar para baixo e reaparece ao rolar para cima. */
  readonly hideOnScroll = input(true, { transform: booleanAttribute });

  protected readonly hidden = signal(false);
  private lastY = 0;

  protected expanded(): boolean {
    if (!this.shell) return false;
    return this.shell.viewport() === 'mobile'
      ? this.shell.drawerOpen()
      : !this.shell.collapsed();
  }

  ngOnInit(): void {
    this.lastY = this.doc.defaultView?.scrollY ?? 0;
  }

  protected onScroll(): void {
    const y = this.doc.defaultView?.scrollY ?? 0;
    const delta = y - this.lastY;
    this.lastY = y;
    if (!this.hideOnScroll() || this.shell?.drawerOpen()) {
      this.hidden.set(false);
      return;
    }
    if (y < 80 || delta < -4) {
      this.hidden.set(false);
    } else if (delta > 4) {
      this.hidden.set(true);
    }
  }
}
