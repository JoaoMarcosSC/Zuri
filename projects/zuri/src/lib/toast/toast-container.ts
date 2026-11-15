import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ZUR_I18N } from '../i18n/i18n';
import { ZurToastService } from './toast.service';

/**
 * Container fixo (inferior central) que renderiza os toasts do
 * ZurToastService. Coloque uma única instância no shell da aplicação.
 */
@Component({
  selector: 'zur-toast-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stack" role="status" aria-live="polite">
      @for (toast of service.toasts(); track toast.id) {
        <div class="toast" [attr.data-kind]="toast.kind">
          <span>{{ toast.message }}</span>
          <button
            type="button"
            class="x"
            [attr.aria-label]="i18n.close"
            (click)="service.dismiss(toast.id)"
          >
            ✕
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .stack {
      position: fixed;
      bottom: var(--zur-space-lg);
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      gap: var(--zur-space-xs);
      z-index: 200;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: var(--zur-space-md);
      background: var(--zur-ink);
      color: var(--zur-ink-inverse);
      font: var(--zur-font-body);
      font-size: 15px;
      padding: 14px 20px;
      border-radius: var(--zur-radius-md);
      box-shadow: var(--zur-shadow-float);
      animation: zur-toast-in 200ms ease;
    }
    .toast[data-kind='success'] {
      background: var(--zur-success);
      color: #ffffff;
    }
    .toast[data-kind='error'] {
      background: var(--zur-error);
      color: #ffffff;
    }
    .x {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      font-size: 13px;
      opacity: 0.7;
      padding: 2px;
    }
    .x:hover {
      opacity: 1;
    }
    @keyframes zur-toast-in {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
})
export class ZurToastContainer {
  protected readonly i18n = inject(ZUR_I18N);

  protected readonly service = inject(ZurToastService);
}
