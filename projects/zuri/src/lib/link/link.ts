import { ChangeDetectionStrategy, Component, booleanAttribute, inject, input } from '@angular/core';
import { ZUR_I18N } from '../i18n/i18n';
import { ZurIcon } from '../icon/icon';
import { zurIconExternalLink } from '../icon/icons';
import { ZUR_SR_ONLY } from '../shared/search';

/**
 * Link com o estilo do sistema (ink sublinhado). Com `external`, abre em outra aba com
 * `rel="noopener noreferrer"`, mostra o ícone e avisa os leitores de tela.
 *
 * ```html
 * <a zur-link href="/entregas">Política de entrega</a>
 * <a zur-link external href="https://exemplo.com">Guia de rega</a>
 * ```
 */
@Component({
  selector: 'a[zur-link]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ZurIcon],
  host: {
    '[attr.target]': 'external() ? "_blank" : null',
    '[attr.rel]': 'external() ? "noopener noreferrer" : null',
  },
  template: `<ng-content />@if (external()) {<span class="sr-only"> ({{ i18n.opensInNewTab }})</span><zur-icon class="ext" [icon]="iconExternal" [size]="14" />}`,
  styles: [
    ZUR_SR_ONLY,
    `
    :host {
      display: inline;
      color: var(--zur-ink);
      font-weight: 600;
      text-decoration: underline;
      text-decoration-thickness: 1px;
      text-underline-offset: 3px;
      border-radius: 2px;
      cursor: pointer;
      transition: text-decoration-thickness 120ms ease;
    }
    :host(:hover) {
      text-decoration-thickness: 2px;
    }
    :host(:focus-visible) {
      outline: none;
      box-shadow: var(--zur-focus-ring);
    }
    .ext {
      display: inline-flex;
      vertical-align: -2px;
      margin-inline-start: 2px;
    }
  `,
  ],
})
export class ZurLink {
  protected readonly i18n = inject(ZUR_I18N);
  protected readonly iconExternal = zurIconExternalLink;

  readonly external = input(false, { transform: booleanAttribute });
}
