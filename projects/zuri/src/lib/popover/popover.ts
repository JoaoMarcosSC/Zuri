import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  Directive,
  ElementRef,
  effect,
  forwardRef,
  inject,
  input,
  model,
  untracked,
  viewChild,
} from '@angular/core';

export type ZurPopoverPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

let nextId = 0;

/**
 * Conteúdo flutuante ancorado a um gatilho (filtros, detalhes, ações). Abre no
 * clique do elemento marcado com `zurPopoverTrigger`, fecha com ESC ou clique fora,
 * e devolve o foco ao gatilho.
 *
 * ```html
 * <zur-popover label="Filtros">
 *   <button zur-button variant="secondary" zurPopoverTrigger>Filtros</button>
 *   …conteúdo…
 * </zur-popover>
 * ```
 */
@Component({
  selector: 'zur-popover',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'open() && close(true)',
    '(document:click)': 'onDocumentClick($event)',
  },
  template: `
    <ng-content select="[zurPopoverTrigger]" />
    @if (open()) {
      <div
        #panel
        class="panel"
        role="dialog"
        tabindex="-1"
        [id]="panelId"
        [attr.aria-label]="label() || null"
        [attr.data-placement]="placement()"
      >
        <ng-content />
      </div>
    }
  `,
  styles: `
    :host {
      position: relative;
      display: inline-block;
    }
    .panel {
      position: absolute;
      top: calc(100% + 8px);
      inset-inline-start: 0;
      z-index: 150;
      min-width: 220px;
      max-width: min(360px, 90vw);
      box-sizing: border-box;
      padding: var(--zur-space-md);
      background: var(--zur-surface-raised);
      border: 1px solid var(--zur-hairline);
      border-radius: var(--zur-radius-md);
      box-shadow: var(--zur-shadow-float);
      font: var(--zur-font-body-sm);
      color: var(--zur-body);
    }
    .panel:focus {
      outline: none;
    }
    .panel[data-placement='bottom-end'] {
      inset-inline-start: auto;
      inset-inline-end: 0;
    }
    .panel[data-placement='top-start'],
    .panel[data-placement='top-end'] {
      top: auto;
      bottom: calc(100% + 8px);
    }
    .panel[data-placement='top-end'] {
      inset-inline-start: auto;
      inset-inline-end: 0;
    }
  `,
})
export class ZurPopover {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly doc = inject(DOCUMENT);

  readonly open = model(false);
  readonly placement = input<ZurPopoverPlacement>('bottom-start');
  /** Nome do painel para leitores de tela. */
  readonly label = input('');

  readonly panelId = `zur-popover-${nextId++}`;
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  /** Preenchido pela diretiva do gatilho. */
  trigger: HTMLElement | null = null;

  constructor() {
    effect(() => {
      const panel = this.panel();
      if (!panel) return;
      untracked(() => {
        const first = panel.nativeElement.querySelector<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        (first ?? panel.nativeElement).focus();
      });
    });
  }

  toggle(): void {
    this.open.update((v) => !v);
  }

  /** Fecha; com `returnFocus`, devolve o foco ao gatilho (ex.: ao apertar ESC). */
  close(returnFocus = false): void {
    this.open.set(false);
    if (returnFocus) this.trigger?.focus();
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }
}

/** Marca o elemento que abre o `zur-popover` e liga os atributos ARIA a ele. */
@Directive({
  selector: '[zurPopoverTrigger]',
  host: {
    'aria-haspopup': 'dialog',
    '[attr.aria-expanded]': 'popover.open()',
    '[attr.aria-controls]': 'popover.open() ? popover.panelId : null',
    '(click)': 'popover.toggle()',
  },
})
export class ZurPopoverTrigger {
  protected readonly popover = inject(forwardRef(() => ZurPopover));

  constructor() {
    this.popover.trigger = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  }
}
