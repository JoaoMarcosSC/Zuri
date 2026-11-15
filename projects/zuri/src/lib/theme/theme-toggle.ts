import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ZurThemeService } from './theme.service';

/**
 * Botão circular sol/lua que alterna entre os temas claro e escuro.
 * Mostra a lua no tema claro ("ir para o escuro") e o sol no escuro.
 */
@Component({
  selector: 'zur-theme-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="toggle"
      [attr.aria-label]="label()"
      [attr.aria-pressed]="isDark()"
      (click)="themeService.toggle()"
    >
      @if (isDark()) {
        <!-- sol -->
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7" />
        </svg>
      } @else {
        <!-- lua -->
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
          <path d="M20.4 14.4A8.5 8.5 0 0 1 9.6 3.6a.7.7 0 0 0-.9-.9 10 10 0 1 0 12.6 12.6.7.7 0 0 0-.9-.9Z" />
        </svg>
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
      transition: background-color 150ms ease, transform 150ms ease;
    }
    .toggle:hover {
      background: var(--zur-surface-soft);
      transform: scale(1.05);
    }
    .toggle:focus-visible {
      outline: none;
      box-shadow: var(--zur-focus-ring);
    }
  `,
})
export class ZurThemeToggle {
  protected readonly themeService = inject(ZurThemeService);

  protected readonly isDark = computed(() => this.themeService.theme() === 'dark');
  protected readonly label = computed(() =>
    this.isDark() ? 'Ativar tema claro' : 'Ativar tema escuro',
  );
}
