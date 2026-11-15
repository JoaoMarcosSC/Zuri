import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Estado vazio: ícone, título, descrição e ações, centralizados. Use em listas,
 * buscas sem resultado ou telas que ainda não têm conteúdo.
 *
 * ```html
 * <zur-empty-state title="Nenhuma reserva" description="Quando você reservar, ela aparece aqui.">
 *   <svg zurEmptyIcon …></svg>
 *   <button zur-button>Explorar</button>
 * </zur-empty-state>
 * ```
 */
@Component({
  selector: 'zur-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="icon" aria-hidden="true"><ng-content select="[zurEmptyIcon]" /></div>
    <p class="title">{{ title() }}</p>
    @if (description()) {
      <p class="description">{{ description() }}</p>
    }
    <div class="actions"><ng-content /></div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: var(--zur-space-xs);
      padding: var(--zur-space-xxl) var(--zur-space-lg);
    }
    .icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      margin-bottom: var(--zur-space-xs);
      border-radius: var(--zur-radius-full);
      background: var(--zur-primary-soft);
      color: var(--zur-on-primary-soft);
    }
    .icon:empty {
      display: none;
    }
    .title {
      margin: 0;
      font: var(--zur-font-title);
      color: var(--zur-ink);
    }
    .description {
      margin: 0;
      max-width: 420px;
      font: var(--zur-font-body);
      color: var(--zur-body);
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: var(--zur-space-sm);
      margin-top: var(--zur-space-sm);
    }
    .actions:empty {
      display: none;
    }
  `,
})
export class ZurEmptyState {
  readonly title = input.required<string>();
  readonly description = input('');
}
