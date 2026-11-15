import { ChangeDetectionStrategy, Component, booleanAttribute, inject, input, model } from '@angular/core';
import { ZUR_I18N } from '../i18n/i18n';

export type ZurBannerKind = 'info' | 'success' | 'warning' | 'error';

/**
 * Faixa de aviso de largura total, para o topo da página ou de uma seção (manutenção,
 * promoção, erro de conexão). Diferente do `zur-alert`, que é um aviso inline dentro do
 * conteúdo. Com `dismissible`, mostra o botão de fechar e atualiza `[(open)]`.
 *
 * ```html
 * <zur-banner kind="warning" dismissible [(open)]="aviso">
 *   Manutenção hoje às 22h.
 *   <a zurBannerAction href="#">Saiba mais</a>
 * </zur-banner>
 * ```
 */
@Component({
  selector: 'zur-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-kind]': 'kind()',
    '[attr.role]': 'kind() === "error" ? "alert" : "status"',
    '[hidden]': '!open()',
  },
  template: `
    <span class="icon" aria-hidden="true">
      @switch (kind()) {
        @case ('success') {
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" /><path d="m8.5 12.5 2.5 2.5 4.5-5.5" /></svg>
        }
        @case ('warning') {
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2.5 20h19L12 3Z" /><path d="M12 10v4M12 17.5v.1" /></svg>
        }
        @case ('error') {
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9" /><path d="M9 9l6 6M15 9l-6 6" /></svg>
        }
        @default {
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 7.5v.1" /></svg>
        }
      }
    </span>
    <div class="text"><ng-content /></div>
    <div class="action"><ng-content select="[zurBannerAction]" /></div>
    @if (dismissible()) {
      <button type="button" class="close" [attr.aria-label]="i18n.close" (click)="open.set(false)">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
      </button>
    }
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: var(--zur-space-sm);
      padding: var(--zur-space-sm) var(--zur-space-lg);
      font: var(--zur-font-body-sm);
    }
    :host([hidden]) {
      display: none;
    }
    .icon {
      display: inline-flex;
      flex-shrink: 0;
    }
    .text {
      flex: 1;
      min-width: 0;
    }
    .action {
      display: inline-flex;
      flex-shrink: 0;
      font-weight: 700;
    }
    .action:empty {
      display: none;
    }
    .action ::ng-deep a,
    .action ::ng-deep button {
      color: inherit;
      text-decoration: underline;
      text-underline-offset: 3px;
    }
    .close {
      width: 32px;
      height: 32px;
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      border-radius: var(--zur-radius-full);
      background: transparent;
      color: inherit;
      cursor: pointer;
    }
    .close:hover {
      background: rgba(0, 0, 0, 0.08);
    }
    .close:focus-visible {
      outline: none;
      box-shadow: var(--zur-focus-ring);
    }
    :host([data-kind='info']) { background: var(--zur-info-soft); color: var(--zur-info-text); }
    :host([data-kind='success']) { background: var(--zur-success-soft); color: var(--zur-success-text); }
    :host([data-kind='warning']) { background: var(--zur-warning-soft); color: var(--zur-warning-text); }
    :host([data-kind='error']) { background: var(--zur-error-soft); color: var(--zur-error-text); }
  `,
})
export class ZurBanner {
  protected readonly i18n = inject(ZUR_I18N);

  readonly kind = input<ZurBannerKind>('info');
  readonly dismissible = input(false, { transform: booleanAttribute });
  readonly open = model(true);
}
