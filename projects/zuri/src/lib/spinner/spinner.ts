import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type ZurSpinnerSize = 'sm' | 'md' | 'lg';

/** Anel giratório em menta — 20/32/48px. */
@Component({
  selector: 'zur-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-size]': 'size()',
    role: 'progressbar',
    'aria-label': 'Carregando',
  },
  template: `<span class="ring" aria-hidden="true"></span>`,
  styles: `
    :host {
      display: inline-flex;
    }
    .ring {
      border-radius: var(--zur-radius-full);
      border-style: solid;
      border-color: var(--zur-surface-strong);
      border-top-color: var(--zur-primary);
      animation: zur-spin 700ms linear infinite;
      box-sizing: border-box;
    }
    :host([data-size='sm']) .ring { width: 20px; height: 20px; border-width: 2.5px; }
    :host([data-size='md']) .ring { width: 32px; height: 32px; border-width: 3px; }
    :host([data-size='lg']) .ring { width: 48px; height: 48px; border-width: 4px; }
    @keyframes zur-spin {
      to { transform: rotate(360deg); }
    }
  `,
})
export class ZurSpinner {
  readonly size = input<ZurSpinnerSize>('md');
}
