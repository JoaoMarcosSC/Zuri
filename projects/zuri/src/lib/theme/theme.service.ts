import {
  DOCUMENT,
  DestroyRef,
  ElementRef,
  Injectable,
  InjectionToken,
  effect,
  inject,
  signal,
} from '@angular/core';

export type ZurTheme = 'light' | 'dark';

const STORAGE_KEY = 'zur-theme';

/**
 * Elemento cujo `data-theme` o serviço controla. Fornecido por `zurThemeScope`
 * para criar um tema isolado; sem ele, o serviço controla o `<html>`.
 */
export const ZUR_THEME_SCOPE = new InjectionToken<ElementRef<HTMLElement>>('ZUR_THEME_SCOPE');

/**
 * Controla o tema claro/escuro do Zuri.
 *
 * - Global (padrão): aplica `data-theme` no `<html>`, persiste em localStorage e usa
 *   `prefers-color-scheme` como padrão na primeira visita.
 * - Escopo (`zurThemeScope`): aplica `data-theme` só no elemento do escopo, não persiste
 *   e segue o tema global até o usuário alternar localmente.
 */
@Injectable({ providedIn: 'root' })
export class ZurThemeService {
  private readonly doc = inject(DOCUMENT);
  private readonly scope = inject(ZUR_THEME_SCOPE, { optional: true });
  /** Serviço do nível acima, quando este é um escopo (ver `zurThemeScope`). */
  private readonly parent: ZurThemeService | null = this.scope
    ? inject(ZurThemeService, { skipSelf: true, optional: true })
    : null;

  readonly theme = signal<ZurTheme>(this.initialTheme());

  constructor() {
    this.apply(this.theme());

    if (this.scope) {
      // Escopo: acompanha o tema do nível acima sempre que ele mudar.
      const parent = this.parent;
      if (parent) {
        effect(() => {
          const next = parent.theme();
          this.theme.set(next);
          this.apply(next);
        });
      }
      return;
    }

    // Global: sincroniza o tema entre abas/iframes.
    const win = this.doc.defaultView;
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      if (event.newValue === 'light' || event.newValue === 'dark') {
        this.theme.set(event.newValue);
        this.apply(event.newValue);
      }
    };
    win?.addEventListener('storage', onStorage);
    inject(DestroyRef).onDestroy(() => win?.removeEventListener('storage', onStorage));
  }

  toggle(): void {
    this.set(this.theme() === 'dark' ? 'light' : 'dark');
  }

  set(theme: ZurTheme): void {
    this.theme.set(theme);
    this.apply(theme);
    if (this.scope) return; // escopo não persiste
    try {
      this.doc.defaultView?.localStorage?.setItem(STORAGE_KEY, theme);
    } catch {
      /* storage indisponível (SSR/privacidade) — tema segue em memória */
    }
  }

  private initialTheme(): ZurTheme {
    if (this.parent) return this.parent.theme();
    try {
      const stored = this.doc.defaultView?.localStorage?.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
      return this.doc.defaultView?.matchMedia?.('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';
    } catch {
      return 'light';
    }
  }

  private apply(theme: ZurTheme): void {
    const target = this.scope?.nativeElement ?? this.doc.documentElement;
    target.setAttribute('data-theme', theme);
  }
}
