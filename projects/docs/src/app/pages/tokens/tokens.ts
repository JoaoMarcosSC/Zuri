import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlock } from '../../shared/code-block/code-block';

interface Swatch {
  token: string;
  label: string;
}

interface TypeSample {
  token: string;
  tracking?: string;
  label: string;
  sample: string;
}

@Component({
  selector: 'docs-tokens',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CodeBlock],
  templateUrl: './tokens.html',
  styleUrl: './tokens.css',
})
export class Tokens {
  protected readonly brand: Swatch[] = [
    { token: '--zur-primary', label: 'primary' },
    { token: '--zur-primary-hover', label: 'primary-hover' },
    { token: '--zur-primary-active', label: 'primary-active' },
    { token: '--zur-primary-soft', label: 'primary-soft' },
    { token: '--zur-on-primary', label: 'on-primary' },
  ];

  protected readonly surfaces: Swatch[] = [
    { token: '--zur-canvas', label: 'canvas' },
    { token: '--zur-surface-soft', label: 'surface-soft' },
    { token: '--zur-surface-strong', label: 'surface-strong' },
    { token: '--zur-hairline', label: 'hairline' },
    { token: '--zur-ink', label: 'ink' },
    { token: '--zur-body', label: 'body' },
    { token: '--zur-muted', label: 'muted' },
  ];

  protected readonly semantic: Swatch[] = [
    { token: '--zur-success', label: 'success' },
    { token: '--zur-warning', label: 'warning' },
    { token: '--zur-error', label: 'error' },
    { token: '--zur-info', label: 'info' },
  ];

  protected readonly typeScale: TypeSample[] = [
    { token: '--zur-font-display-xl', tracking: '--zur-tracking-display-xl', label: 'display-xl', sample: 'Zuri' },
    { token: '--zur-font-display-lg', tracking: '--zur-tracking-display-lg', label: 'display-lg', sample: 'Zuri' },
    { token: '--zur-font-display-md', tracking: '--zur-tracking-display-md', label: 'display-md', sample: 'Zuri' },
    { token: '--zur-font-headline', label: 'headline', sample: 'Design system amigável' },
    { token: '--zur-font-title', label: 'title', sample: 'Chalé na serra' },
    { token: '--zur-font-body-lg', label: 'body-lg', sample: 'Lead editorial com respiro generoso.' },
    { token: '--zur-font-body', label: 'body', sample: 'Texto padrão do sistema.' },
    { token: '--zur-font-caption', label: 'caption', sample: 'LABEL DE CAMPO' },
  ];

  protected readonly radii = ['xs', 'sm', 'md', 'lg', 'xl'];

  protected readonly cssSnippet = `:root {
  --zur-primary: #35d49b;
  --zur-canvas: #f6faf8;
  --zur-radius-md: 14px;
  --zur-shadow-float: 0 0 0 1px rgba(0,0,0,.02), 0 2px 6px rgba(0,0,0,.04), 0 4px 8px rgba(0,0,0,.10);
}

[data-theme='dark'] {
  --zur-primary: #3ee6a8;
  --zur-canvas: #151a17; /* quase-preto, leve tintura verde */
}`;
}
