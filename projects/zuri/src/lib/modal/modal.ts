import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from '@angular/core';

/**
 * Modal — superfície 20px com padding 32px sobre scrim 50%.
 * Fecha por ESC, clique no scrim ou no botão ×.
 *
 * ```html
 * <zur-modal [(open)]="aberto" title="Confirmar reserva">…</zur-modal>
 * ```
 */
@Component({
  selector: 'zur-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'close()' },
  template: `
    @if (open()) {
      <div class="scrim" (click)="close()">
        <div
          class="dialog"
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="title()"
          (click)="$event.stopPropagation()"
        >
          <header class="head">
            @if (title()) {
              <h2 class="title">{{ title() }}</h2>
            }
            <button
              type="button"
              class="x"
              aria-label="Fechar"
              (click)="close()"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </header>
          <div class="content"><ng-content /></div>
          <footer class="foot"><ng-content select="[zurModalActions]" /></footer>
        </div>
      </div>
    }
  `,
  styles: `
    .scrim {
      position: fixed;
      inset: 0;
      background: var(--zur-scrim);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--zur-space-lg);
      z-index: 100;
    }
    .dialog {
      background: var(--zur-surface-raised);
      border-radius: var(--zur-radius-lg);
      box-shadow: var(--zur-shadow-float);
      padding: var(--zur-space-xl);
      width: 100%;
      max-width: 480px;
      max-height: 85vh;
      overflow: auto;
    }
    .head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--zur-space-md);
      margin-bottom: var(--zur-space-md);
    }
    .title {
      margin: 0;
      font: var(--zur-font-headline);
      color: var(--zur-ink);
    }
    .x {
      width: 36px;
      height: 36px;
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      border-radius: var(--zur-radius-full);
      background: var(--zur-surface-strong);
      color: var(--zur-ink);
      cursor: pointer;
    }
    .x:hover {
      background: var(--zur-hairline);
    }
    .x:focus-visible {
      outline: none;
      box-shadow: var(--zur-focus-ring);
    }
    .content {
      font: var(--zur-font-body);
      color: var(--zur-body);
    }
    .foot {
      display: flex;
      justify-content: flex-end;
      gap: var(--zur-space-sm);
      margin-top: var(--zur-space-lg);
    }
    .foot:empty {
      display: none;
    }
  `,
})
export class ZurModal {
  readonly open = model(false);
  readonly title = input('');

  close(): void {
    this.open.set(false);
  }
}
