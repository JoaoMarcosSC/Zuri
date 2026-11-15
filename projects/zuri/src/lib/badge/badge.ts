import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type ZurBadgeColor =
  | 'mint'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral';

/** Badge/tag em pill com as cores soft do sistema. */
@Component({
  selector: 'zur-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: { '[attr.data-color]': 'color()' },
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: var(--zur-space-xxs);
      font: var(--zur-font-badge);
      letter-spacing: 0.2px;
      padding: 4px 10px;
      border-radius: var(--zur-radius-full);
    }
    :host([data-color='mint']) {
      background: var(--zur-primary-soft);
      color: var(--zur-on-primary-soft);
    }
    :host([data-color='success']) {
      background: var(--zur-success-soft);
      color: var(--zur-success-text);
    }
    :host([data-color='warning']) {
      background: var(--zur-warning-soft);
      color: var(--zur-warning-text);
    }
    :host([data-color='error']) {
      background: var(--zur-error-soft);
      color: var(--zur-error-text);
    }
    :host([data-color='info']) {
      background: var(--zur-info-soft);
      color: var(--zur-info-text);
    }
    :host([data-color='neutral']) {
      background: var(--zur-surface-strong);
      color: var(--zur-body);
    }
  `,
})
export class ZurBadge {
  readonly color = input<ZurBadgeColor>('mint');
}
