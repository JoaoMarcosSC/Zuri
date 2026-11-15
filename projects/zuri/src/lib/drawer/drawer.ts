import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  effect,
  inject,
  input,
  model,
  untracked,
  viewChild,
} from '@angular/core';
import { ZUR_I18N } from '../i18n/i18n';
import { zurFocusFirst, zurTrapFocus } from '../shared/focus-trap';

/** `start`/`end` seguem a direção de leitura (em RTL trocam de lado); `left`/`right` são físicos. */
export type ZurDrawerSide = 'start' | 'end' | 'left' | 'right';

/**
 * Painel lateral deslizante (gaveta) sobre a página, para filtros, detalhes ou
 * formulários curtos. Fecha com ESC, clique no fundo ou no botão de fechar; o foco
 * fica preso dentro dele enquanto aberto e volta para quem o abriu ao fechar.
 *
 * ```html
 * <button zur-button (click)="filtros = true">Filtros</button>
 * <zur-drawer [(open)]="filtros" title="Filtros">…</zur-drawer>
 * ```
 */
@Component({
  selector: 'zur-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-side]': 'side()',
    '(document:keydown.escape)': 'open() && close()',
  },
  template: `
    @if (open()) {
      <div class="scrim" (click)="close()"></div>
      <div
        #panel
        class="panel"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="title() || null"
        tabindex="-1"
        (keydown)="trapFocus($event)"
      >
        <header class="head">
          @if (title()) {
            <h2 class="title">{{ title() }}</h2>
          }
          <button type="button" class="x" [attr.aria-label]="i18n.close" (click)="close()">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </header>
        <div class="content"><ng-content /></div>
        <footer class="foot"><ng-content select="[zurDrawerActions]" /></footer>
      </div>
    }
  `,
  styles: `
    .scrim {
      position: fixed;
      inset: 0;
      z-index: 200;
      background: var(--zur-scrim);
      animation: zur-drawer-fade 200ms ease;
    }
    .panel {
      position: fixed;
      top: 0;
      bottom: 0;
      inset-inline-end: 0;
      z-index: 201;
      display: flex;
      flex-direction: column;
      width: min(400px, 100vw);
      box-sizing: border-box;
      padding: var(--zur-space-lg);
      background: var(--zur-surface-raised);
      box-shadow: var(--zur-shadow-float);
      overflow-y: auto;
      animation: zur-drawer-in-end 200ms ease;
    }
    :host([data-side='start']) .panel {
      inset-inline-end: auto;
      inset-inline-start: 0;
      animation-name: zur-drawer-in-start;
    }
    /* lados físicos: não mudam com a direção */
    :host([data-side='right']) .panel {
      right: 0;
      left: auto;
      animation-name: zur-drawer-in-right;
    }
    :host([data-side='left']) .panel {
      left: 0;
      right: auto;
      animation-name: zur-drawer-in-left;
    }
    .panel:focus {
      outline: none;
    }
    .head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--zur-space-md);
      margin-bottom: var(--zur-space-lg);
    }
    .title {
      margin: 0;
      font: var(--zur-font-title);
      color: var(--zur-ink);
    }
    .x {
      width: 36px;
      height: 36px;
      flex-shrink: 0;
      margin-inline-start: auto;
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
      flex: 1;
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
    @keyframes zur-drawer-fade {
      from { opacity: 0; }
    }
    @keyframes zur-drawer-in-end {
      from { transform: translateX(calc(100% * var(--zur-dir))); }
    }
    @keyframes zur-drawer-in-start {
      from { transform: translateX(calc(-100% * var(--zur-dir))); }
    }
    @keyframes zur-drawer-in-right {
      from { transform: translateX(100%); }
    }
    @keyframes zur-drawer-in-left {
      from { transform: translateX(-100%); }
    }
    @media (prefers-reduced-motion: reduce) {
      .scrim,
      .panel {
        animation: none;
      }
    }
  `,
})
export class ZurDrawer {
  protected readonly i18n = inject(ZUR_I18N);
  private readonly doc = inject(DOCUMENT);

  readonly open = model(false);
  readonly title = input('');
  readonly side = input<ZurDrawerSide>('end');

  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  private returnFocusTo: HTMLElement | null = null;

  constructor() {
    effect(() => {
      const isOpen = this.open();
      const panel = this.panel();
      untracked(() => {
        if (isOpen && panel) {
          // abriu: guarda quem tinha o foco e leva o foco para dentro do painel
          this.returnFocusTo ??= this.doc.activeElement as HTMLElement | null;
          this.doc.body.style.overflow = 'hidden';
          zurFocusFirst(panel.nativeElement);
        } else if (!isOpen && this.returnFocusTo) {
          // fechou: devolve o foco
          this.doc.body.style.overflow = '';
          this.returnFocusTo.focus?.();
          this.returnFocusTo = null;
        }
      });
    });
  }

  close(): void {
    this.open.set(false);
  }

  /** Mantém o Tab circulando dentro do painel. */
  protected trapFocus(event: KeyboardEvent): void {
    const panel = this.panel()?.nativeElement;
    if (panel) zurTrapFocus(event, panel);
  }
}
