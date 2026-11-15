import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ZurShellState } from '../layout/shell-state';

export type ZurSidenavItemLevel = 'primary' | 'secondary';

/**
 * Navegação lateral do Zuri. Agrupa links (`zur-sidenav-item`) e rótulos de
 * seção (`zur-sidenav-label`).
 *
 * ```html
 * <zur-sidenav aria-label="Principal">
 *   <a zur-sidenav-item routerLink="/" routerLinkActive="active">Home</a>
 * </zur-sidenav>
 * ```
 */
@Component({
  selector: 'zur-sidenav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'navigation' },
  template: `<ng-content />`,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--zur-space-xxs);
    }
  `,
})
export class ZurSidenav {}

/**
 * Item da navegação lateral, aplicado a `<a>` ou `<button>`.
 * Fica destacado (verde sólido) quando `active` é verdadeiro ou quando o
 * elemento recebe a classe `active` (ex.: via `routerLinkActive="active"`).
 */
@Component({
  selector: 'a[zur-sidenav-item], button[zur-sidenav-item]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="icon"><ng-content select="[zurSidenavIcon]" /></span>
    <span class="text"><ng-content /></span>
  `,
  host: {
    '[attr.data-level]': 'level()',
    '[attr.data-collapsed]': 'collapsed()',
    '[attr.aria-current]': 'active() ? "page" : null',
    '[class.active]': 'active()',
  },
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: var(--zur-space-sm);
      box-sizing: border-box;
      width: 100%;
      padding: var(--zur-space-xs) var(--zur-space-sm);
      border: 0;
      border-radius: var(--zur-radius-sm);
      background: transparent;
      color: var(--zur-body);
      font: var(--zur-font-body);
      font-size: 15px;
      font-weight: 600;
      text-align: start;
      text-decoration: none;
      cursor: pointer;
      transition: background-color 120ms ease, color 120ms ease;
    }
    :host([data-level='secondary']) {
      padding-block: 6px;
      padding-inline: calc(var(--zur-space-sm) + 8px) var(--zur-space-sm);
      color: var(--zur-muted);
      font-size: 14px;
      font-weight: 400;
    }
    .icon {
      display: inline-flex;
      flex-shrink: 0;
    }
    .icon:empty {
      display: none;
    }
    /* Recolhido (sidebar só com ícones): esconde o texto, mantém acessível. */
    :host([data-collapsed='true']) {
      justify-content: center;
      padding-inline: var(--zur-space-xs);
    }
    :host([data-collapsed='true']) .text {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
    :host([data-collapsed='true'][data-level='secondary']) {
      display: none;
    }
    :host(:hover) {
      background: var(--zur-surface-strong);
      color: var(--zur-ink);
    }
    :host(:focus-visible) {
      outline: none;
      box-shadow: var(--zur-focus-ring);
    }
    :host(.active),
    :host(.active:hover) {
      background: var(--zur-primary);
      color: var(--zur-on-primary);
      font-weight: 600;
    }
  `,
})
export class ZurSidenavItem {
  private readonly shell = inject(ZurShellState, { optional: true });

  readonly level = input<ZurSidenavItemLevel>('primary');
  readonly active = input(false);

  /** `true` quando a sidebar do layout está recolhida (só ícones). */
  protected readonly collapsed = computed(
    () => !!this.shell && this.shell.collapsed() && this.shell.viewport() !== 'mobile',
  );
}

/** Rótulo de seção da navegação lateral (caption em caixa alta). */
@Component({
  selector: 'zur-sidenav-label',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[hidden]': 'collapsed()' },
  template: `<ng-content />`,
  styles: `
    :host([hidden]) {
      display: none;
    }
    :host {
      display: block;
      margin-block: var(--zur-space-sm) 2px;
      margin-inline: var(--zur-space-sm) 0;
      font: var(--zur-font-caption);
      font-size: 11px;
      color: var(--zur-muted);
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    :host(:first-child) {
      margin-top: 0;
    }
  `,
})
export class ZurSidenavLabel {
  private readonly shell = inject(ZurShellState, { optional: true });
  protected readonly collapsed = computed(
    () => !!this.shell && this.shell.collapsed() && this.shell.viewport() !== 'mobile',
  );
}
