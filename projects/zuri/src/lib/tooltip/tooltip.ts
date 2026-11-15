import {
  DOCUMENT,
  Directive,
  ElementRef,
  OnDestroy,
  inject,
  input,
} from '@angular/core';

/**
 * Tooltip — bolha ink 8px com caption invertida, posicionada acima
 * do elemento no hover/focus.
 *
 * ```html
 * <button zur-button zurTooltip="Salvar nos favoritos">♥</button>
 * ```
 */
@Directive({
  selector: '[zurTooltip]',
  host: {
    '(mouseenter)': 'show()',
    '(mouseleave)': 'hide()',
    '(focus)': 'show()',
    '(blur)': 'hide()',
  },
})
export class ZurTooltip implements OnDestroy {
  readonly zurTooltip = input.required<string>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly doc = inject(DOCUMENT);
  private bubble: HTMLElement | null = null;

  protected show(): void {
    if (this.bubble || !this.zurTooltip()) {
      return;
    }
    const rect = this.host.nativeElement.getBoundingClientRect();
    const el = this.doc.createElement('div');
    el.textContent = this.zurTooltip();
    el.setAttribute('role', 'tooltip');
    Object.assign(el.style, {
      position: 'fixed',
      left: `${rect.left + rect.width / 2}px`,
      top: `${rect.top - 8}px`,
      transform: 'translate(-50%, -100%)',
      background: 'var(--zur-ink)',
      color: 'var(--zur-ink-inverse)',
      font: 'var(--zur-font-caption)',
      padding: '6px 10px',
      borderRadius: 'var(--zur-radius-sm)',
      boxShadow: 'var(--zur-shadow-float)',
      whiteSpace: 'nowrap',
      zIndex: '300',
      pointerEvents: 'none',
    });
    this.doc.body.appendChild(el);
    this.bubble = el;
  }

  protected hide(): void {
    this.bubble?.remove();
    this.bubble = null;
  }

  ngOnDestroy(): void {
    this.hide();
  }
}
