import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

/** Bloco de código com botão de copiar — usado nas páginas de documentação. */
@Component({
  selector: 'docs-code-block',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="block">
      <button type="button" class="copy" (click)="copy()">
        {{ copied() ? 'Copiado!' : 'Copiar' }}
      </button>
      <pre><code>{{ code() }}</code></pre>
    </div>
  `,
  styles: `
    .block {
      position: relative;
      background: var(--zur-ink);
      border-radius: var(--zur-radius-md);
      overflow: hidden;
    }
    pre {
      margin: 0;
      padding: var(--zur-space-lg);
      overflow-x: auto;
      color: var(--zur-ink-inverse);
      font-size: 13px;
      line-height: 1.6;
    }
    .copy {
      position: absolute;
      top: var(--zur-space-sm);
      right: var(--zur-space-sm);
      height: 30px;
      padding: 0 var(--zur-space-sm);
      background: rgba(255, 255, 255, 0.12);
      color: var(--zur-ink-inverse);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: var(--zur-radius-sm);
      font: var(--zur-font-caption);
      cursor: pointer;
      transition: background-color 120ms ease;
    }
    .copy:hover {
      background: rgba(255, 255, 255, 0.22);
    }
    .copy:focus-visible {
      outline: none;
      box-shadow: var(--zur-focus-ring);
    }
  `,
})
export class CodeBlock {
  readonly code = input.required<string>();

  protected readonly copied = signal(false);

  protected async copy(): Promise<void> {
    await navigator.clipboard.writeText(this.code());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1500);
  }
}
