import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';

/**
 * Card do Zuri — superfície 14px com hairline.
 * Com `interactive`, eleva ao tier único de sombra no hover (Airbnb).
 */
@Component({
  selector: 'zur-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: { '[attr.data-interactive]': 'interactive() ? "" : null' },
  styles: `
    :host {
      display: block;
      background: var(--zur-surface-raised);
      color: var(--zur-body);
      border: 1px solid var(--zur-hairline);
      border-radius: var(--zur-radius-md);
      padding: var(--zur-space-lg);
      transition: box-shadow 180ms ease, transform 180ms ease;
    }
    :host([data-interactive]) {
      cursor: pointer;
    }
    :host([data-interactive]:hover) {
      box-shadow: var(--zur-shadow-float);
      transform: translateY(-2px);
    }
  `,
})
export class ZurCard {
  readonly interactive = input(false, { transform: booleanAttribute });
}
