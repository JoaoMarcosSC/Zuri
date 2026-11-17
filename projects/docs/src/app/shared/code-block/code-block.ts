import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, signal } from '@angular/core';
import { ZurIcon, zurIconCheck, zurIconCopy } from '@juau/zuri';

/**
 * Bloco de código com botão de copiar, usado nas páginas da documentação.
 * O botão fica numa barra própria, acima do código, para nunca cobrir o texto em telas estreitas.
 */
@Component({
  selector: 'docs-code-block',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ZurIcon],
  template: `
    <div class="block">
      <div class="bar">
        <button type="button" class="copy" [class.done]="state() === 'copied'" (click)="copy()">
          <span class="icons" aria-hidden="true">
            <zur-icon class="i-copy" [icon]="iconCopy" [size]="16" />
            <zur-icon class="i-check" [icon]="iconCheck" [size]="16" />
          </span>
          <span>{{ state() === 'copied' ? 'Copiado' : state() === 'failed' ? 'Não copiou' : 'Copiar' }}</span>
        </button>
      </div>
      <pre dir="ltr"><code>{{ code() }}</code></pre>
      <span class="sr-only" aria-live="polite">{{ state() === 'copied' ? 'Código copiado' : state() === 'failed' ? 'Não foi possível copiar' : '' }}</span>
    </div>
  `,
  styles: `
    .block {
      background: var(--zur-ink);
      border-radius: var(--zur-radius-md);
      overflow: hidden;
    }
    .bar {
      display: flex;
      justify-content: flex-end;
      padding: var(--zur-space-xs) var(--zur-space-xs) 0;
    }
    pre {
      margin: 0;
      padding: var(--zur-space-xs) var(--zur-space-lg) var(--zur-space-lg);
      overflow-x: auto;
      text-align: left;
      color: var(--zur-ink-inverse);
      font-size: 13px;
      line-height: 1.6;
    }
    .copy {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 30px;
      padding: 0 var(--zur-space-sm);
      background: transparent;
      color: var(--zur-ink-inverse);
      border: 1px solid transparent;
      border-radius: var(--zur-radius-sm);
      font: var(--zur-font-caption);
      cursor: pointer;
      opacity: 0.8;
      transition: background-color 150ms ease, opacity 150ms ease, color 150ms ease;
    }
    .copy:hover {
      background: rgba(127, 127, 127, 0.22);
      opacity: 1;
    }
    .copy:focus-visible {
      outline: none;
      opacity: 1;
      box-shadow: var(--zur-focus-ring);
    }
    /* menta com texto escuro: legível nos dois temas (o bloco é escuro no claro e claro no escuro) */
    .copy.done {
      opacity: 1;
      background: var(--zur-primary);
      color: var(--zur-on-primary);
    }
    /* os dois ícones ocupam o mesmo lugar; um some enquanto o outro aparece */
    .icons {
      display: inline-grid;
      width: 16px;
      height: 16px;
    }
    .icons zur-icon {
      grid-area: 1 / 1;
      transition: opacity 160ms ease, transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .i-check {
      opacity: 0;
      transform: scale(0.4);
    }
    .done .i-copy {
      opacity: 0;
      transform: scale(0.4);
    }
    .done .i-check {
      opacity: 1;
      transform: scale(1);
    }
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
    @media (prefers-reduced-motion: reduce) {
      .icons zur-icon,
      .copy {
        transition: none;
      }
    }
  `,
})
export class CodeBlock {
  readonly code = input.required<string>();

  protected readonly iconCopy = zurIconCopy;
  protected readonly iconCheck = zurIconCheck;
  protected readonly state = signal<'idle' | 'copied' | 'failed'>('idle');
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected async copy(): Promise<void> {
    clearTimeout(this.timer);
    try {
      await navigator.clipboard.writeText(this.code());
      this.state.set('copied');
    } catch {
      this.state.set('failed');
    }
    this.timer = setTimeout(() => this.state.set('idle'), 1800);
  }
}
