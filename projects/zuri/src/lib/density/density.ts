import { ChangeDetectionStrategy, Component, DOCUMENT, Directive, Injectable, computed, inject, input, signal } from '@angular/core';
import { ZUR_I18N } from '../i18n/i18n';

export type ZurDensity = 'comfortable' | 'compact';

const STORAGE_KEY = 'zur-density';

/**
 * Densidade da página inteira: aplica `data-density` no `<html>` (controles mais baixos no
 * `compact`), persiste em `localStorage` e começa no confortável. Para uma área só, use a
 * diretiva `zurDensity`.
 */
@Injectable({ providedIn: 'root' })
export class ZurDensityService {
  private readonly doc = inject(DOCUMENT);

  readonly density = signal<ZurDensity>(this.initial());

  constructor() {
    this.apply(this.density());
  }

  set(density: ZurDensity): void {
    this.density.set(density);
    this.apply(density);
    try {
      this.doc.defaultView?.localStorage?.setItem(STORAGE_KEY, density);
    } catch {
      /* sem storage (privacidade, SSR): a escolha vale só nesta sessão */
    }
  }

  toggle(): void {
    this.set(this.density() === 'compact' ? 'comfortable' : 'compact');
  }

  private initial(): ZurDensity {
    try {
      const stored = this.doc.defaultView?.localStorage?.getItem(STORAGE_KEY);
      if (stored === 'compact' || stored === 'comfortable') return stored;
    } catch {
      /* ignora */
    }
    return 'comfortable';
  }

  private apply(density: ZurDensity): void {
    const root = this.doc.documentElement;
    if (density === 'compact') root.setAttribute('data-density', 'compact');
    else root.removeAttribute('data-density');
  }
}

/**
 * Densidade só da área marcada: tudo dentro dela usa os controles compactos, sem mexer no
 * resto da página.
 *
 * ```html
 * <section zurDensity>…formulário denso…</section>
 * <section zurDensity="comfortable">…volta ao tamanho normal dentro de uma área compacta…</section>
 * ```
 */
@Directive({
  selector: '[zurDensity]',
  host: { '[attr.data-density]': 'value()' },
})
export class ZurDensityScope {
  readonly zurDensity = input<ZurDensity | ''>('');
  protected readonly value = computed<ZurDensity>(() => (this.zurDensity() === 'comfortable' ? 'comfortable' : 'compact'));
}

/** Botão que alterna a densidade da página (`ZurDensityService`). */
@Component({
  selector: 'zur-density-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" class="toggle" [attr.aria-pressed]="compact()" [attr.aria-label]="compact() ? i18n.densityToComfortable : i18n.densityToCompact" (click)="service.toggle()">
      @if (compact()) {
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
      } @else {
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
      }
    </button>
  `,
  styles: `
    .toggle {
      width: 44px;
      height: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--zur-hairline);
      border-radius: var(--zur-radius-full);
      background: var(--zur-canvas);
      color: var(--zur-ink);
      cursor: pointer;
      transition: background-color 150ms ease;
    }
    .toggle:hover {
      background: var(--zur-surface-soft);
    }
    .toggle[aria-pressed='true'] {
      background: var(--zur-surface-strong);
    }
    .toggle:focus-visible {
      outline: none;
      box-shadow: var(--zur-focus-ring);
    }
  `,
})
export class ZurDensityToggle {
  protected readonly i18n = inject(ZUR_I18N);
  protected readonly service = inject(ZurDensityService);
  protected readonly compact = computed(() => this.service.density() === 'compact');
}
