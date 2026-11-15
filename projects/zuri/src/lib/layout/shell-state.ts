import { DOCUMENT, DestroyRef, Injectable, inject, signal } from '@angular/core';

export type ZurViewport = 'mobile' | 'tablet' | 'desktop';

/** Breakpoints do Zuri: mobile < 768 ≤ tablet < 1024 ≤ desktop. */
export const ZUR_BREAKPOINTS = { tablet: 768, desktop: 1024 } as const;

/**
 * Estado compartilhado entre um layout e seus filhos (`zur-sidebar`, `zur-topbar`).
 * É provido por cada layout com sidebar — não use diretamente.
 *
 * - desktop: sidebar fixa, recolhível pelo usuário;
 * - tablet: começa recolhida (só ícones), expansível;
 * - mobile: sidebar vira gaveta (`drawerOpen`).
 */
@Injectable()
export class ZurShellState {
  private readonly doc = inject(DOCUMENT);

  readonly viewport = signal<ZurViewport>(this.measure());
  readonly collapsed = signal(this.viewport() === 'tablet');
  readonly drawerOpen = signal(false);
  /** Preenchido pelo `zur-sidebar` ao existir — o topbar usa para mostrar o botão de menu. */
  readonly hasSidebar = signal(false);

  constructor() {
    const win = this.doc.defaultView;
    if (!win?.matchMedia) return;
    const queries = [
      win.matchMedia(`(min-width: ${ZUR_BREAKPOINTS.tablet}px)`),
      win.matchMedia(`(min-width: ${ZUR_BREAKPOINTS.desktop}px)`),
    ];
    const update = () => {
      const next = this.measure();
      if (next === this.viewport()) return;
      this.viewport.set(next);
      this.drawerOpen.set(false);
      this.collapsed.set(next === 'tablet');
    };
    queries.forEach((q) => q.addEventListener('change', update));
    inject(DestroyRef).onDestroy(() =>
      queries.forEach((q) => q.removeEventListener('change', update)),
    );
  }

  /** Mobile: abre/fecha a gaveta. Demais telas: recolhe/expande a sidebar. */
  toggle(): void {
    if (this.viewport() === 'mobile') {
      this.drawerOpen.update((v) => !v);
    } else {
      this.collapsed.update((v) => !v);
    }
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  private measure(): ZurViewport {
    const win = this.doc.defaultView;
    const width = win?.innerWidth ?? ZUR_BREAKPOINTS.desktop;
    if (width < ZUR_BREAKPOINTS.tablet) return 'mobile';
    if (width < ZUR_BREAKPOINTS.desktop) return 'tablet';
    return 'desktop';
  }
}
