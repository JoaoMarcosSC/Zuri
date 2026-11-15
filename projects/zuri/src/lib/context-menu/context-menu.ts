import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  Directive,
  ElementRef,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { ZUR_I18N } from '../i18n/i18n';

const LONG_PRESS_MS = 500;
const MARGIN = 8;

/**
 * Menu de clique direito. Declare o menu uma vez e ligue-o a qualquer elemento com
 * `[zurContextMenu]`; os itens são `zur-menu-item`.
 *
 * ```html
 * <div [zurContextMenu]="menu">Clique com o botão direito aqui</div>
 * <zur-context-menu #menu>
 *   <zur-menu-item (selected)="renomear()">Renomear</zur-menu-item>
 *   <zur-menu-item (selected)="excluir()">Excluir</zur-menu-item>
 * </zur-context-menu>
 * ```
 *
 * Abre com o botão direito, **Shift+F10 / tecla Menu** ou toque longo. ↑↓/Home/End navegam,
 * Esc fecha e devolve o foco ao elemento de origem.
 */
@Component({
  selector: 'zur-context-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onOutside($event)',
    '(document:contextmenu)': 'onOutside($event)',
    '(window:resize)': 'close()',
    '(window:blur)': 'close()',
  },
  template: `
    @if (open()) {
      <div
        #panel
        class="panel"
        role="menu"
        [attr.aria-label]="i18n.contextMenu"
        [style.left.px]="position().x"
        [style.top.px]="position().y"
        (keydown)="onKeydown($event)"
      >
        <ng-content />
      </div>
    }
  `,
  styles: `
    .panel {
      /* coordenadas do ponteiro são físicas (esquerda/topo da tela), não lógicas */
      position: fixed;
      z-index: 250;
      min-width: 200px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: var(--zur-space-xs);
      background: var(--zur-surface-raised);
      border: 1px solid var(--zur-hairline);
      border-radius: var(--zur-radius-md);
      box-shadow: var(--zur-shadow-float);
    }
  `,
})
export class ZurContextMenu {
  protected readonly i18n = inject(ZUR_I18N);
  private readonly doc = inject(DOCUMENT);

  readonly open = signal(false);
  protected readonly position = signal({ x: 0, y: 0 });
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  private origin: HTMLElement | null = null;
  private returnFocusTo: HTMLElement | null = null;

  constructor() {
    effect(() => {
      const panel = this.panel();
      if (!panel) return;
      untracked(() => {
        // mantém o menu dentro da janela e leva o foco ao primeiro item
        const el = panel.nativeElement;
        const win = this.doc.defaultView;
        if (win) {
          const { x, y } = this.position();
          const rect = el.getBoundingClientRect();
          const fitX = Math.max(MARGIN, Math.min(x, win.innerWidth - rect.width - MARGIN));
          const fitY = Math.max(MARGIN, Math.min(y, win.innerHeight - rect.height - MARGIN));
          if (fitX !== x || fitY !== y) this.position.set({ x: fitX, y: fitY });
        }
        el.querySelector<HTMLElement>('[role=menuitem]')?.focus();
      });
    });
  }

  /** Abre o menu nas coordenadas da janela. `origin` recebe o foco de volta ao fechar. */
  show(x: number, y: number, origin: HTMLElement | null = null): void {
    this.origin = origin;
    this.returnFocusTo = (this.doc.activeElement as HTMLElement | null) ?? origin;
    this.position.set({ x, y });
    this.open.set(true);
  }

  close(returnFocus = false): void {
    if (!this.open()) return;
    this.open.set(false);
    if (returnFocus) (this.returnFocusTo ?? this.origin)?.focus?.();
  }

  protected onOutside(event: Event): void {
    if (!this.open()) return;
    const panel = this.panel()?.nativeElement;
    if (panel && panel.contains(event.target as Node)) {
      // clicar num item executa e fecha
      if ((event.target as HTMLElement).closest('[role=menuitem]')) this.close(true);
      return;
    }
    // (o gatilho para a propagação do próprio contextmenu, então isto vem de fora dele)
    this.close();
  }

  protected onKeydown(event: KeyboardEvent): void {
    const items = Array.from(this.panel()!.nativeElement.querySelectorAll<HTMLElement>('[role=menuitem]'));
    const current = items.indexOf(this.doc.activeElement as HTMLElement);
    let target = -1;
    switch (event.key) {
      case 'ArrowDown':
        target = (current + 1) % items.length;
        break;
      case 'ArrowUp':
        target = (current - 1 + items.length) % items.length;
        break;
      case 'Home':
        target = 0;
        break;
      case 'End':
        target = items.length - 1;
        break;
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        this.close(true);
        return;
      case 'Tab':
        this.close();
        return;
      default:
        return;
    }
    event.preventDefault();
    items[target]?.focus();
  }
}

/** Liga um elemento a um `zur-context-menu`: botão direito, Shift+F10, tecla Menu e toque longo. */
@Directive({
  selector: '[zurContextMenu]',
  host: {
    '(contextmenu)': 'onContextMenu($event)',
    '(keydown)': 'onKeydown($event)',
    '(pointerdown)': 'onPointerDown($event)',
    '(pointerup)': 'cancelPress()',
    '(pointermove)': 'cancelPress()',
    '(pointercancel)': 'cancelPress()',
    '[attr.aria-haspopup]': '"menu"',
  },
})
export class ZurContextMenuTrigger {
  readonly zurContextMenu = input.required<ZurContextMenu>();
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private timer: ReturnType<typeof setTimeout> | null = null;

  protected onContextMenu(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation(); // o contextmenu de outro menu aberto não deve fechar este
    const menu = this.zurContextMenu();
    menu.close();
    menu.show(event.clientX, event.clientY, this.host.nativeElement);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'ContextMenu' && !(event.key === 'F10' && event.shiftKey)) return;
    event.preventDefault();
    const rect = this.host.nativeElement.getBoundingClientRect();
    this.zurContextMenu().show(rect.left + Math.min(rect.width / 2, 32), rect.top + Math.min(rect.height, 40), this.host.nativeElement);
  }

  protected onPointerDown(event: PointerEvent): void {
    if (event.pointerType === 'mouse') return;
    const { clientX, clientY } = event;
    this.cancelPress();
    this.timer = setTimeout(() => this.zurContextMenu().show(clientX, clientY, this.host.nativeElement), LONG_PRESS_MS);
  }

  protected cancelPress(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }
}
