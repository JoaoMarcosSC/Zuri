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
          @if (toast.kind === 'success') {
            <svg class="icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="m8.5 12.5 2.5 2.5 4.5-5.5" /></svg>
          } @else if (toast.kind === 'error') {
            <svg class="icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M9 9l6 6M15 9l-6 6" /></svg>
          }
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
    /* Sucesso e erro usam o fundo suave com o texto semântico (contraste ≥ 4,5:1 nos dois temas),
       como o alert e o banner; só o neutro é um bloco sólido. */
    .toast[data-kind='success'] {
      background: var(--zur-success-soft);
      color: var(--zur-success-text);
      border: 1px solid color-mix(in srgb, var(--zur-success-text) 30%, transparent);
    }
    .toast[data-kind='error'] {
      background: var(--zur-error-soft);
      color: var(--zur-error-text);
      border: 1px solid color-mix(in srgb, var(--zur-error-text) 30%, transparent);
    }
    .icon {
      flex-shrink: 0;
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
