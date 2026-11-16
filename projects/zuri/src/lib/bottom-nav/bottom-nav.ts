import { ChangeDetectionStrategy, Component, booleanAttribute, inject, input } from '@angular/core';
import { ZUR_I18N } from '../i18n/i18n';
import { ZUR_SR_ONLY } from '../shared/search';

/**
 * Barra de navegação inferior para celular: de 3 a 5 destinos principais, cada um com ícone e
 * rótulo. Respeita a área segura do aparelho (`safe-area-inset-bottom`). Por padrão fica fixa na
 * base da tela e some a partir de 768 px, onde a sidebar ou a navbar assumem.
 *
 * ```html
 * <zur-bottom-nav label="Navegação principal">
 *   <a zur-bottom-nav-item href="/" active>
 *     <zur-icon zurBottomNavIcon [icon]="casa" /> Início
 *   </a>
 *   <a zur-bottom-nav-item href="/pedidos" [badge]="3">
 *     <zur-icon zurBottomNavIcon [icon]="sino" /> Pedidos
 *   </a>
 * </zur-bottom-nav>
 * ```
 */
@Component({
  selector: 'zur-bottom-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'navigation',
    '[attr.aria-label]': 'label() || i18n.bottomNav',
    '[attr.data-fixed]': 'fixed() ? "" : null',
    '[attr.data-responsive]': 'responsive() ? "" : null',
  },
  template: `<ng-content />`,
  styles: `
    :host {
      display: flex;
      box-sizing: border-box;
      background: var(--zur-canvas);
      border-block-start: 1px solid var(--zur-hairline);
      padding-block-end: env(safe-area-inset-bottom);
    }
    :host([data-fixed]) {
      position: fixed;
      inset-inline: 0;
      inset-block-end: 0;
      z-index: 40;
    }
    @media (min-width: 768px) {
      :host([data-responsive]) {
        display: none;
      }
    }
  `,
})
export class ZurBottomNav {
  protected readonly i18n = inject(ZUR_I18N);

  /** Nome acessível da região; sem ele usa "Navegação inferior". */
  readonly label = input('');
  /** Fixa na base da tela. Desligue para posicionar você mesmo. */
  readonly fixed = input(true, { transform: booleanAttribute });
  /** Esconde a barra a partir de 768 px. Desligue para mostrá-la em qualquer largura. */
  readonly responsive = input(true, { transform: booleanAttribute });
}

/**
 * Destino da barra inferior: um `<a>` ou `<button>`. `active` marca a página atual
 * (`aria-current="page"`) e `badge` mostra um número, ou um ponto com `"dot"`.
 */
@Component({
  selector: 'a[zur-bottom-nav-item], button[zur-bottom-nav-item]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.aria-current]': 'active() ? "page" : null',
    '[attr.data-active]': 'active() ? "" : null',
  },
  template: `
    <span class="icon">
      <ng-content select="[zurBottomNavIcon]" />
      @if (badge() === 'dot') {
        <span class="badge dot" aria-hidden="true"></span>
        <span class="sr-only">{{ i18n.badgeCount(1) }}</span>
      } @else if (badge() !== null && badge() !== 0) {
        <span class="badge" aria-hidden="true">{{ badge() }}</span>
        <span class="sr-only">{{ i18n.badgeCount(+badge()!) }}</span>
      }
    </span>
    <span class="label"><ng-content /></span>
  `,
  styles: [
    ZUR_SR_ONLY,
    `
    :host {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      min-width: 0;
      min-height: 64px;
      padding: var(--zur-space-xs) var(--zur-space-xxs);
      border: none;
      background: transparent;
      color: var(--zur-muted);
      font: var(--zur-font-caption);
      text-decoration: none;
      cursor: pointer;
    }
    :host(:hover) {
      color: var(--zur-ink);
    }
    :host([data-active]) {
      color: var(--zur-ink);
      font-weight: 800;
    }
    :host(:focus-visible) {
      outline: 2px solid var(--zur-primary);
      outline-offset: -4px;
      border-radius: var(--zur-radius-sm);
    }
    .icon {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 32px;
      border-radius: var(--zur-radius-full);
      transition: background-color 150ms ease;
    }
    :host([data-active]) .icon {
      background: var(--zur-surface-strong);
    }
    .label {
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .badge {
      position: absolute;
      inset-block-start: 0;
      inset-inline-end: 8px;
      min-width: 16px;
      height: 16px;
      box-sizing: border-box;
      padding: 0 4px;
      border-radius: var(--zur-radius-full);
      background: var(--zur-error-text);
      color: var(--zur-on-error);
      font-size: 11px;
      font-weight: 800;
      line-height: 16px;
      text-align: center;
    }
    .badge.dot {
      min-width: 0;
      width: 8px;
      height: 8px;
      padding: 0;
      inset-inline-end: 14px;
      inset-block-start: 3px;
    }
  `,
  ],
})
export class ZurBottomNavItem {
  protected readonly i18n = inject(ZUR_I18N);

  readonly active = input(false, { transform: booleanAttribute });
  /** Número de novidades, ou `"dot"` para só um ponto. */
  readonly badge = input<number | 'dot' | null>(null);
}
