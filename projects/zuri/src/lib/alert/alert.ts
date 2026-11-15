import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type ZurAlertKind = 'success' | 'warning' | 'error' | 'info';

/** Alert em banda soft da cor semântica, com ícone e raio 14px. */
@Component({
  selector: 'zur-alert',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-kind]': 'kind()',
    role: 'alert',
  },
  template: `
    <span class="icon" aria-hidden="true">
      @switch (kind()) {
        @case ('success') {
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.5 2.5 4.5-5.5"/></svg>
        }
        @case ('warning') {
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2.5 20h19L12 3Z"/><path d="M12 10v4M12 17.5v.1"/></svg>
        }
        @case ('error') {
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg>
        }
        @default {
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5v.1"/></svg>
        }
      }
    </span>
    <div class="text"><ng-content /></div>
  `,
  styles: `
    :host {
      display: flex;
      align-items: flex-start;
      gap: var(--zur-space-sm);
      padding: var(--zur-space-md) var(--zur-space-lg);
      border-radius: var(--zur-radius-md);
      font: var(--zur-font-body);
      font-size: 15px;
    }
    .icon {
      flex-shrink: 0;
      display: inline-flex;
      margin-top: 1px;
    }
    .text {
      min-width: 0;
    }
    :host([data-kind='success']) {
      background: var(--zur-success-soft);
      color: var(--zur-success);
    }
    :host([data-kind='warning']) {
      background: var(--zur-warning-soft);
      color: var(--zur-warning);
    }
    :host([data-kind='error']) {
      background: var(--zur-error-soft);
      color: var(--zur-error);
    }
    :host([data-kind='info']) {
      background: var(--zur-info-soft);
      color: var(--zur-info);
    }
  `,
})
export class ZurAlert {
  readonly kind = input<ZurAlertKind>('info');
}
