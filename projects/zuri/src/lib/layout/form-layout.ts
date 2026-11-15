import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ZUR_LAYOUT_WIDTH_STYLES, ZurLayoutWidth } from './layout-width';

/**
 * Formulário e wizard: coluna centralizada (~760px), indicador de etapas
 * opcional (`steps` + `current`) e barra de ações fixa no rodapé da tela.
 *
 * Slots: `zur-topbar`, conteúdo (campos), `[zurLayoutActions]` (botões).
 *
 * ```html
 * <zur-form-layout [steps]="['Dados', 'Pagamento', 'Revisão']" [current]="1">
 *   <zur-page-header title="Nova reserva" />
 *   <zur-input label="Nome" />
 *   <div zurLayoutActions><button zur-button>Continuar</button></div>
 * </zur-form-layout>
 * ```
 */
@Component({
  selector: 'zur-form-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-width]': 'width()' },
  template: `
    <ng-content select="zur-topbar" />
    <main class="main">
      <div class="container">
        @if (steps().length) {
          <ol class="steps" aria-label="Etapas">
            @for (label of steps(); track label; let i = $index) {
              <li
                class="step"
                [attr.data-state]="i < current() ? 'done' : i === current() ? 'current' : 'todo'"
                [attr.aria-current]="i === current() ? 'step' : null"
              >
                <span class="num">{{ i + 1 }}</span>
                <span class="label">{{ label }}</span>
              </li>
            }
          </ol>
        }
        <ng-content />
      </div>
    </main>
    <div class="actions"><div class="actions-inner"><ng-content select="[zurLayoutActions]" /></div></div>
  `,
  styles: `
    ${ZUR_LAYOUT_WIDTH_STYLES}
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: var(--zur-canvas);
    }
    .main {
      flex: 1;
    }
    .container {
      box-sizing: border-box;
      width: 100%;
      max-width: var(--zur-layout-max);
      margin: 0 auto;
      padding: var(--zur-space-xxl) var(--zur-space-lg);
    }
    .steps {
      display: flex;
      gap: var(--zur-space-md);
      margin: 0 0 var(--zur-space-xl);
      padding: 0;
      list-style: none;
    }
    .step {
      flex: 1;
      display: flex;
      align-items: center;
      gap: var(--zur-space-xs);
      padding-top: var(--zur-space-sm);
      border-top: 3px solid var(--zur-hairline);
      color: var(--zur-muted);
      font: var(--zur-font-caption);
    }
    .step[data-state='done'],
    .step[data-state='current'] {
      border-top-color: var(--zur-primary);
      color: var(--zur-ink);
    }
    .num {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      border-radius: var(--zur-radius-full);
      border: 1px solid var(--zur-hairline);
      font: var(--zur-font-badge);
    }
    .step[data-state='done'] .num,
    .step[data-state='current'] .num {
      background: var(--zur-primary);
      border-color: var(--zur-primary);
      color: var(--zur-on-primary);
    }
    .actions {
      position: sticky;
      bottom: 0;
      z-index: 10;
      background: var(--zur-canvas);
      border-top: 1px solid var(--zur-hairline);
    }
    .actions:has(.actions-inner:empty) {
      display: none;
    }
    .actions-inner {
      box-sizing: border-box;
      display: flex;
      justify-content: flex-end;
      gap: var(--zur-space-sm);
      width: 100%;
      max-width: var(--zur-layout-max);
      margin: 0 auto;
      padding: var(--zur-space-md) var(--zur-space-lg);
    }
    @media (max-width: 767px) {
      .container {
        padding: var(--zur-space-lg) var(--zur-space-md);
      }
      .label {
        display: none;
      }
      .step[data-state='current'] .label {
        display: inline;
      }
      .actions-inner {
        padding: var(--zur-space-sm) var(--zur-space-md);
      }
    }
  `,
})
export class ZurFormLayout {
  readonly width = input<ZurLayoutWidth>('reading');
  /** Rótulos das etapas do wizard; vazio = formulário simples. */
  readonly steps = input<string[]>([]);
  /** Índice (0-based) da etapa atual. */
  readonly current = input(0);
}
