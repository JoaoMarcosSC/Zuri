import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Cabeçalho de página: breadcrumb opcional, título, descrição e ações.
 *
 * ```html
 * <zur-page-header title="Reservas" description="Gerencie as reservas.">
 *   <zur-breadcrumb [items]="trilha" />
 *   <button zurPageHeaderActions zur-button>Nova reserva</button>
 * </zur-page-header>
 * ```
 */
@Component({
  selector: 'zur-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-content select="zur-breadcrumb" />
    <div class="row">
      <div class="text">
        <h1 class="title">{{ title() }}</h1>
        @if (description()) {
          <p class="description">{{ description() }}</p>
        }
      </div>
      <div class="actions"><ng-content select="[zurPageHeaderActions]" /></div>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--zur-space-sm);
      margin-bottom: var(--zur-space-xl);
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      justify-content: space-between;
      gap: var(--zur-space-md);
    }
    .title {
      margin: 0;
      font: var(--zur-font-display-md);
      color: var(--zur-ink);
    }
    .description {
      margin: var(--zur-space-xxs) 0 0;
      font: var(--zur-font-body-lg);
      color: var(--zur-body);
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--zur-space-xs);
    }
    .actions:empty {
      display: none;
    }
    @media (max-width: 767px) {
      .title {
        font: var(--zur-font-headline);
      }
    }
  `,
})
export class ZurPageHeader {
  readonly title = input.required<string>();
  readonly description = input<string>('');
}
