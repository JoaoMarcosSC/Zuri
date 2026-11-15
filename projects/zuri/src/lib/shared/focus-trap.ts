/** Elementos que podem receber foco pelo teclado dentro de um painel. */
export const ZUR_FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Leva o foco ao primeiro elemento focável do painel (ou ao próprio painel). */
export function zurFocusFirst(container: HTMLElement): void {
  (container.querySelector<HTMLElement>(ZUR_FOCUSABLE) ?? container).focus();
}

/**
 * Mantém o Tab circulando dentro de `container`. Chame no `keydown` do painel:
 * no último item o Tab volta ao primeiro, e Shift+Tab no primeiro vai ao último.
 */
export function zurTrapFocus(event: KeyboardEvent, container: HTMLElement): void {
  if (event.key !== 'Tab') return;
  const items = Array.from(container.querySelectorAll<HTMLElement>(ZUR_FOCUSABLE));
  if (!items.length) {
    event.preventDefault();
    container.focus();
    return;
  }
  const first = items[0];
  const last = items[items.length - 1];
  const active = container.ownerDocument.activeElement;
  if (event.shiftKey && (active === first || active === container)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}
