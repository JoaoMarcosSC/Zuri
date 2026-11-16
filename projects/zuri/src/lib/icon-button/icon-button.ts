import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';

export type ZurIconButtonVariant = 'ghost' | 'secondary' | 'primary';
export type ZurIconButtonSize = 'sm' | 'md' | 'lg';

/**
 * Botão quadrado só com ícone. O `label` é obrigatório: vira o `aria-label`, já que o botão
 * não tem texto. O tamanho acompanha a densidade (`--zur-control-height-*`).
 *
 * ```html
 * <button zur-icon-button label="Excluir"><zur-icon [icon]="lixeira" /></button>
 * ```
 */
@Component({
  selector: 'button[zur-icon-button]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    type: 'button',
    '[attr.aria-label]': 'label()',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
  },
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      padding: 0;
      border: 1px solid transparent;
      border-radius: var(--zur-radius-sm);
      cursor: pointer;
      transition: background-color 150ms ease, border-color 150ms ease;
    }
    :host(:focus-visible) {
      outline: none;
      box-shadow: var(--zur-focus-ring);
    }
    :host(:disabled) {
      opacity: 0.45;
      cursor: not-allowed;
    }
    :host([data-size='sm']) {
      width: var(--zur-control-height-sm);
      height: var(--zur-control-height-sm);
    }
    :host([data-size='md']) {
      width: var(--zur-control-height-md);
      height: var(--zur-control-height-md);
    }
    :host([data-size='lg']) {
      width: var(--zur-control-height-lg);
      height: var(--zur-control-height-lg);
    }
    :host([data-variant='ghost']) {
      background: transparent;
      color: var(--zur-ink);
    }
    :host([data-variant='ghost']:hover:not(:disabled)) {
      background: var(--zur-surface-soft);
    }
    :host([data-variant='secondary']) {
      background: var(--zur-canvas);
      color: var(--zur-ink);
      border-color: var(--zur-hairline);
    }
    :host([data-variant='secondary']:hover:not(:disabled)) {
      background: var(--zur-surface-soft);
    }
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
  `,
})
export class ZurIconButton {
  /** Nome acessível do botão (obrigatório: não há texto visível). */
  readonly label = input.required<string>();
  readonly variant = input<ZurIconButtonVariant>('ghost');
  readonly size = input<ZurIconButtonSize>('md');
}

/**
 * Botão de ação flutuante: o atalho para a ação principal da tela. É circular, menta
 * e usa a sombra única do sistema. `extended` mostra o texto ao lado do ícone; sem ele,
 * informe `label` para o leitor de tela. O posicionamento (fixo no canto) é da aplicação.
 *
 * ```html
 * <button zur-fab label="Novo pedido"><zur-icon [icon]="mais" size="24" /></button>
 * <button zur-fab extended><zur-icon [icon]="mais" /> Novo pedido</button>
 * ```
 */
@Component({
  selector: 'button[zur-fab]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    type: 'button',
    '[attr.aria-label]': 'label() || null',
    '[attr.data-extended]': 'extended() ? "" : null',
  },
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--zur-space-xs);
      width: 56px;
      height: 56px;
      padding: 0;
      border: none;
      border-radius: var(--zur-radius-full);
      background: var(--zur-primary);
      color: var(--zur-on-primary);
      box-shadow: var(--zur-shadow-float);
      font: var(--zur-font-button);
      cursor: pointer;
      transition: background-color 150ms ease;
    }
    :host([data-extended]) {
      width: auto;
      padding-inline: var(--zur-space-lg);
      white-space: nowrap;
    }
    :host(:hover:not(:disabled)) {
      background: var(--zur-primary-hover);
    }
    :host(:active:not(:disabled)) {
      background: var(--zur-primary-active);
    }
    :host(:focus-visible) {
      outline: none;
      box-shadow: var(--zur-shadow-float), var(--zur-focus-ring);
    }
    :host(:disabled) {
      opacity: 0.45;
      cursor: not-allowed;
    }
  `,
})
export class ZurFab {
  readonly label = input('');
  readonly extended = input(false, { transform: booleanAttribute });
}
