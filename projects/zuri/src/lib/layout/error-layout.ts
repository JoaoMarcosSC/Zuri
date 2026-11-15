import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ZUR_LAYOUT_WIDTH_STYLES, ZurLayoutWidth } from './layout-width';

/**
 * Erro e 404: código grande, título, descrição e ações. Conteúdo padrão
 * (botões/links de saída) aparece abaixo da descrição.
 *
 * ```html
 * <zur-error-layout code="404" title="Página não encontrada" description="…">
 *   <a zur-button variant="primary" routerLink="/">Voltar ao início</a>
 * </zur-error-layout>
 * ```
 */
@Component({
  selector: 'zur-error-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-width]': 'width()' },
  template: `
    <main class="wrap">
      <p class="code" aria-hidden="true">{{ code() }}</p>
      <h1 class="title">{{ title() }}</h1>
      @if (description()) {
        <p class="description">{{ description() }}</p>
      }
      <div class="actions"><ng-content /></div>
    </main>
  `,
  styles: `
    ${ZUR_LAYOUT_WIDTH_STYLES}
    :host {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: var(--zur-space-xl) var(--zur-space-md);
      background: var(--zur-canvas);
    }
    .wrap {
      width: 100%;
      max-width: var(--zur-layout-max);
      text-align: center;
    }
    .code {
      margin: 0;
      font: var(--zur-font-display-xl);
      /* verde escuro no claro e menta no escuro: contraste alto nos dois temas */
      color: var(--zur-on-primary-soft);
      letter-spacing: -1px;
    }
    .title {
      margin: var(--zur-space-xs) 0 var(--zur-space-sm);
      font: var(--zur-font-headline);
      color: var(--zur-ink);
    }
    .description {
      margin: 0 0 var(--zur-space-lg);
      font: var(--zur-font-body-lg);
      color: var(--zur-body);
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: var(--zur-space-sm);
    }
  `,
})
export class ZurErrorLayout {
  readonly width = input<ZurLayoutWidth>('narrow');
  /** Código do erro exibido em destaque (ex.: "404"). */
  readonly code = input('404');
  readonly title = input.required<string>();
  readonly description = input<string>('');
}
