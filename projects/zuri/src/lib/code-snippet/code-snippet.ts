import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, signal } from '@angular/core';
import { ZUR_I18N } from '../i18n/i18n';
import { ZurIcon } from '../icon/icon';
import { zurIconCheck, zurIconCopy } from '../icon/icons';
import { ZUR_SR_ONLY } from '../shared/search';

/**
 * Bloco de código com botão de copiar. O texto é sempre da esquerda para a direita (também em RTL),
 * o botão anuncia "Copiado" ou "Não foi possível copiar" para leitores de tela e a área rola na
 * horizontal com o teclado.
 *
 * ```html
 * <zur-code-snippet language="bash" code="npm install @juau/zuri" />
 * ```
 */
@Component({
  selector: 'zur-code-snippet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ZurIcon],
  host: { role: 'group', '[attr.aria-label]': 'label() || language() || null' },
  template: `
    <div class="bar">
      <span class="language">{{ language() }}</span>
      <button type="button" class="copy" (click)="copy()">
        <zur-icon [icon]="copied() ? iconCheck : iconCopy" [size]="16" />
        <span>{{ copied() ? i18n.copied : i18n.copy }}</span>
      </button>
    </div>
    <pre dir="ltr" tabindex="0" [attr.aria-label]="label() || null"><code>{{ code() }}</code></pre>
    <span class="sr-only" aria-live="polite">{{ announcement() }}</span>
  `,
  styles: [
    ZUR_SR_ONLY,
    `
    :host {
      display: block;
      overflow: hidden;
      background: var(--zur-ink);
      color: var(--zur-ink-inverse);
      border-radius: var(--zur-radius-md);
    }
    .bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--zur-space-md);
      padding: var(--zur-space-xs) var(--zur-space-xs) 0 var(--zur-space-lg);
      min-height: 40px;
    }
    .language {
      font: var(--zur-font-caption);
      text-transform: uppercase;
      letter-spacing: 0.4px;
      opacity: 0.75;
    }
    .copy {
      display: inline-flex;
      align-items: center;
      gap: var(--zur-space-xxs);
      height: 32px;
      padding: 0 var(--zur-space-sm);
      border: none;
      border-radius: var(--zur-radius-sm);
      background: rgba(255, 255, 255, 0.12);
      color: inherit;
      font: var(--zur-font-caption);
      cursor: pointer;
      transition: background-color 120ms ease;
    }
    .copy:hover {
      background: rgba(255, 255, 255, 0.22);
    }
    .copy:focus-visible {
      outline: 2px solid var(--zur-ink-inverse);
      outline-offset: 2px;
    }
    pre {
      margin: 0;
      padding: var(--zur-space-xs) var(--zur-space-lg) var(--zur-space-lg);
      overflow-x: auto;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 13px;
      line-height: 1.6;
      tab-size: 2;
    }
    pre:focus-visible {
      outline: 2px solid var(--zur-ink-inverse);
      outline-offset: -4px;
      border-radius: var(--zur-radius-md);
    }
  `,
  ],
})
export class ZurCodeSnippet {
  protected readonly i18n = inject(ZUR_I18N);

  readonly code = input.required<string>();
  /** Rótulo da linguagem mostrado no topo ("bash", "html"…). */
  readonly language = input('');
  /** Nome acessível do bloco; sem ele usa a linguagem. */
  readonly label = input('');

  protected readonly iconCopy = zurIconCopy;
  protected readonly iconCheck = zurIconCheck;
  protected readonly copied = signal(false);
  protected readonly announcement = signal('');
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  async copy(): Promise<void> {
    clearTimeout(this.timer);
    try {
      await navigator.clipboard.writeText(this.code());
      this.copied.set(true);
      this.announcement.set(this.i18n.copied);
      this.timer = setTimeout(() => {
        this.copied.set(false);
        this.announcement.set('');
      }, 2000);
    } catch {
      // sem permissão ou sem a API (contexto inseguro, SSR): avisa em vez de falhar em silêncio
      this.copied.set(false);
      this.announcement.set(this.i18n.copyFailed);
    }
  }
}
