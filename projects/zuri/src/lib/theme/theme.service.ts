import {
  DOCUMENT,
  DestroyRef,
  ElementRef,
  EnvironmentProviders,
  Injectable,
  InjectionToken,
  effect,
  inject,
  isDevMode,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
  signal,
} from '@angular/core';

export type ZurTheme = 'light' | 'dark';

/**
 * Como o tema da aplicação funciona: `system` segue o sistema operacional até a pessoa escolher
 * no `zur-theme-toggle` (e guarda a escolha); `light` e `dark` fixam o tema.
 */
export type ZurThemeMode = 'system' | 'light' | 'dark';

/** Modo de tema da aplicação. Configure com `provideZuriTheme`. Padrão: `system`. */
export const ZUR_THEME_MODE = new InjectionToken<ZurThemeMode>('ZUR_THEME_MODE', {
  providedIn: 'root',
  factory: () => 'system',
});

/**
 * Liga o tema do Zuri na partida da aplicação (mesmo em telas sem botão de tema) e define o modo.
 *
 * ```ts
 * bootstrapApplication(App, { providers: [provideZuriTheme({ mode: 'system' })] });
 * provideZuriTheme({ mode: 'dark' }); // só escuro: sem botão sol/lua
 * ```
 */
export function provideZuriTheme(config: { mode?: ZurThemeMode } = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: ZUR_THEME_MODE, useValue: config.mode ?? 'system' },
    provideEnvironmentInitializer(() => {
      inject(ZurThemeService);
    }),
  ]);
}

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

  /** Modo da aplicação (`provideZuriTheme`). Num `zurThemeScope` a troca local continua livre. */
  readonly mode = inject(ZUR_THEME_MODE);

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

    // Tema fixo: nada de storage, sistema ou sincronização.
    if (this.isFixed()) return;

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

    // Segue a troca de tema do sistema enquanto a pessoa não escolheu no botão.
    const media = win?.matchMedia?.('(prefers-color-scheme: dark)');
    const onSystem = (event: MediaQueryListEvent) => {
      if (this.storedChoice()) return;
      const next: ZurTheme = event.matches ? 'dark' : 'light';
      this.theme.set(next);
      this.apply(next);
    };
    media?.addEventListener?.('change', onSystem);

    inject(DestroyRef).onDestroy(() => {
      win?.removeEventListener('storage', onStorage);
      media?.removeEventListener?.('change', onSystem);
    });
  }

  /** Tema fixo pela aplicação (`provideZuriTheme({ mode: 'light' | 'dark' })`), fora de um escopo. */
  isFixed(): boolean {
    return !this.scope && this.mode !== 'system';
  }

  /** Se faz sentido mostrar um botão de trocar tema aqui. */
  canToggle(): boolean {
    return !this.isFixed();
  }

  private storedChoice(): ZurTheme | null {
    try {
      const stored = this.doc.defaultView?.localStorage?.getItem(STORAGE_KEY);
      return stored === 'light' || stored === 'dark' ? stored : null;
    } catch {
      return null;
    }
  }

  toggle(): void {
    this.set(this.theme() === 'dark' ? 'light' : 'dark');
  }

  set(theme: ZurTheme): void {
    if (this.isFixed()) {
      if (isDevMode()) console.warn(`[Zuri] O tema está fixo em "${this.mode}" (provideZuriTheme); set("${theme}") foi ignorado.`);
      return;
    }
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
    const mode = inject(ZUR_THEME_MODE);
    if (!this.scope && mode !== 'system') return mode;
    try {
      const stored = this.storedChoice();
      if (stored) return stored;
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
