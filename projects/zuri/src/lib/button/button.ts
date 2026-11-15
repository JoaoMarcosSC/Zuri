import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type ZurButtonVariant = 'primary' | 'secondary' | 'ghost' | 'pill';
export type ZurButtonSize = 'sm' | 'md' | 'lg';

/**
 * Botão do Zuri. Aplicado como atributo em <button> ou <a> nativos
 * para preservar semântica e acessibilidade.
 *
 * ```html
 * <button zur-button variant="primary" size="md">Reservar</button>
 * ```
 */
@Component({
  selector: 'button[zur-button], a[zur-button]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
  },
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--zur-space-xs);
      font: var(--zur-font-button);
      border: 1px solid transparent;
      border-radius: var(--zur-radius-sm);
      cursor: pointer;
      text-decoration: none;
      white-space: nowrap;
      transition: background-color 150ms ease, border-color 150ms ease,
        color 150ms ease;
    }
    :host(:focus-visible) {
      outline: none;
      box-shadow: var(--zur-focus-ring);
    }
    :host(:disabled),
    :host([aria-disabled='true']) {
      opacity: 0.45;
      cursor: not-allowed;
    }

    /* tamanhos */
    :host([data-size='sm']) {
      height: var(--zur-control-height-sm);
      padding: 0 var(--zur-space-md);
      font-size: 14px;
    }
    :host([data-size='md']) {
      height: var(--zur-control-height-md);
      padding: 0 var(--zur-space-lg);
    }
    :host([data-size='lg']) {
      height: var(--zur-control-height-lg);
      padding: 0 var(--zur-space-xl);
      font-size: 18px;
    }

    /* variantes */
    :host([data-variant='primary']) {
      background: var(--zur-primary);
      color: var(--zur-on-primary);
    }
    :host([data-variant='primary']:hover:not(:disabled)) {
      background: var(--zur-primary-hover);
    }
    :host([data-variant='primary']:active:not(:disabled)) {
      background: var(--zur-primary-active);
    }

    :host([data-variant='secondary']) {
      background: var(--zur-canvas);
      color: var(--zur-ink);
      border-color: var(--zur-ink);
    }
    :host([data-variant='secondary']:hover:not(:disabled)) {
      background: var(--zur-surface-soft);
    }

    :host([data-variant='ghost']) {
      background: transparent;
      color: var(--zur-ink);
    }
    :host([data-variant='ghost']:hover:not(:disabled)) {
      background: var(--zur-surface-soft);
    }

    :host([data-variant='pill']) {
      background: var(--zur-primary);
      color: var(--zur-on-primary);
      border-radius: var(--zur-radius-full);
    }
    :host([data-variant='pill']:hover:not(:disabled)) {
      background: var(--zur-primary-hover);
    }
  `,
})
export class ZurButton {
  readonly variant = input<ZurButtonVariant>('primary');
  readonly size = input<ZurButtonSize>('md');
}
