import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Placeholder pulsante em surface-strong. */
@Component({
  selector: 'zur-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.width]': 'width()',
    '[style.height]': 'height()',
    '[style.border-radius]':
      'circle() ? "var(--zur-radius-full)" : "var(--zur-radius-sm)"',
    'aria-hidden': 'true',
  },
  template: ``,
  styles: `
    :host {
      display: block;
      background: var(--zur-surface-strong);
      animation: zur-pulse 1.4s ease-in-out infinite;
    }
    @keyframes zur-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.45; }
    }
  `,
})
export class ZurSkeleton {
  readonly width = input('100%');
  readonly height = input('16px');
  readonly circle = input(false);
}
