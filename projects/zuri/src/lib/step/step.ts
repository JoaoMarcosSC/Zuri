import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Passo numerado (círculo verde + título) com conteúdo projetado abaixo.
 *
 * ```html
 * <zur-step number="1" title="Instale o pacote">
 *   <p>Conteúdo do passo…</p>
 * </zur-step>
 * ```
 */
@Component({
  selector: 'zur-step',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 class="title">
      <span class="num" aria-hidden="true">{{ number() }}</span>
      {{ title() }}
    </h2>
    <ng-content />
  `,
  styles: `
    :host {
      display: block;
      margin-bottom: var(--zur-space-xxl);
    }
    .title {
      display: flex;
      align-items: center;
      gap: var(--zur-space-sm);
      margin: 0 0 var(--zur-space-xs);
      font: var(--zur-font-headline);
      color: var(--zur-ink);
    }
    .num {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 28px;
      height: 28px;
      border-radius: var(--zur-radius-full);
      background: var(--zur-primary);
      color: var(--zur-on-primary);
      font: var(--zur-font-badge);
    }
  `,
})
export class ZurStep {
  readonly number = input.required<number | string>();
  readonly title = input.required<string>();
}
