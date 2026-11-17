import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { ZUR_I18N } from '../i18n/i18n';
import { ZurShellState } from './shell-state';

/**
 * Sidebar de layout: fixa no desktop, recolhível (só ícones) e gaveta no mobile.
 * Deve ficar dentro de um layout que a suporte (`zur-dashboard-layout`,
 * `zur-docs-layout`). O botão que a controla vive no `zur-topbar`.
 *
 * Slots: `[zurSidebarHeader]` (logo), conteúdo padrão (`zur-sidenav`),
 * `[zurSidebarFooter]`. No mobile, clicar num link da gaveta a fecha.
 */
@Component({
  selector: 'zur-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-collapsed]': 'collapsed()',
    '[attr.data-viewport]': 'shell.viewport()',
    '[attr.data-open]': 'shell.drawerOpen()',
    '(document:keydown.escape)': 'shell.closeDrawer()',
    '(click)': 'onClick($event)',
  },
  template: `
    <div class="scrim" aria-hidden="true" (click)="shell.closeDrawer()"></div>
    <aside class="panel" [attr.aria-label]="i18n.sideNav">
      <div class="header"><ng-content select="[zurSidebarHeader]" /></div>
      <div class="body"><ng-content /></div>
      <div class="footer"><ng-content select="[zurSidebarFooter]" /></div>
    </aside>
  `,
  styles: `
    :host {
      --_w: 260px;
      display: block;
      flex-shrink: 0;
      width: var(--_w);
      position: sticky;
      top: 0;
      align-self: flex-start;
      height: 100vh;
      transition: width 200ms ease;
      z-index: 20;
    }
    :host([data-collapsed='true']) {
      --_w: 72px;
    }
    .scrim {
      display: none;
    }
    .panel {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: var(--zur-space-lg);
      width: 100%;
      height: 100%;
      padding: var(--zur-space-lg) var(--zur-space-md);
      background: var(--zur-surface-soft);
      border-inline-end: 1px solid var(--zur-hairline);
      overflow-x: hidden;
      overflow-y: auto;
    }
    .header,
    .footer {
      display: flex;
      align-items: center;
      min-height: 0;
    }
    /* Alinha o logo com os ícones dos itens (mesmo padding horizontal do item). */
    .header {
      min-height: 40px;
      padding-inline: var(--zur-space-sm);
    }
    .header:empty,
    .footer:empty {
      display: none;
    }
    .body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--zur-space-lg);
    }
    :host([data-collapsed='true']) .header {
      justify-content: center;
      padding-inline: 0;
      overflow: hidden;
    }

    /* Mobile: gaveta sobre o conteúdo, com scrim. */
    @media (max-width: 767px) {
      :host {
        --_w: min(300px, 86vw);
        position: fixed;
        top: 0;
        inset-inline-start: 0;
        width: 100%;
        height: 100vh;
        height: 100dvh;
        pointer-events: none;
        z-index: 100;
      }
      :host([data-collapsed='true']) {
        --_w: min(300px, 86vw);
      }
      .scrim {
        display: block;
        position: absolute;
        top: 0;
        inset-inline-start: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        opacity: 0;
        transition: opacity 200ms ease;
      }
      .panel {
        position: absolute;
        top: 0;
        inset-inline-start: 0;
        height: 100%;
        width: var(--_w);
        transform: translateX(calc(-100% * var(--zur-dir)));
        transition: transform 200ms ease, box-shadow 200ms ease;
      }
      :host([data-open='true']) {
        pointer-events: auto;
      }
      :host([data-open='true']) .scrim {
        opacity: 1;
      }
      :host([data-open='true']) .panel {
        transform: translateX(0);
        box-shadow: var(--zur-shadow-float);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      :host,
      .scrim,
      .panel {
        transition: none;
      }
    }
  `,
})
export class ZurSidebar implements OnInit {
  protected readonly i18n = inject(ZUR_I18N);

  protected readonly shell = inject(ZurShellState);
  /** Recolhida só vale fora do mobile (a gaveta sempre abre completa). */
  protected readonly collapsed = computed(
    () => this.shell.collapsed() && this.shell.viewport() !== 'mobile',
  );

  ngOnInit(): void {
    this.shell.hasSidebar.set(true);
  }

  /** No mobile, escolher um destino na gaveta a fecha (o conteúdo novo fica visível). */
  protected onClick(event: MouseEvent): void {
    if (this.shell.viewport() !== 'mobile' || !this.shell.drawerOpen()) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest('a[href], [zur-sidenav-item]')) this.shell.closeDrawer();
  }
}
