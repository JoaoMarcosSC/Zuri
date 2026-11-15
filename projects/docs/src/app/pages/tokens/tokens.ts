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
    { token: '--zur-success-text', label: 'success-text' },
    { token: '--zur-warning-text', label: 'warning-text' },
    { token: '--zur-error-text', label: 'error-text' },
    { token: '--zur-info-text', label: 'info-text' },
  ];

  protected readonly charts: Swatch[] = [1, 2, 3, 4, 5, 6].map((n) => ({
    token: `--zur-chart-${n}`,
    label: `chart-${n}`,
  }));

  protected readonly typeScale: TypeSample[] = [
    { token: '--zur-font-display-xl', tracking: '--zur-tracking-display-xl', label: 'display-xl', sample: 'Zuri' },
    { token: '--zur-font-display-lg', tracking: '--zur-tracking-display-lg', label: 'display-lg', sample: 'Zuri' },
    { token: '--zur-font-display-md', tracking: '--zur-tracking-display-md', label: 'display-md', sample: 'Zuri' },
    { token: '--zur-font-headline', label: 'headline', sample: 'Design system amigável' },
    { token: '--zur-font-title', label: 'title', sample: 'Monstera deliciosa' },
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

  protected readonly codeTailwind3 = `// tailwind.config.js (Tailwind v3)
module.exports = {
  presets: [require('@juau/zuri/tailwind.preset.cjs')],
  content: ['./src/**/*.{html,ts}'],
};

// <button class="bg-primary text-on-primary rounded-sm shadow-float">Comprar</button>`;

  protected readonly codeTailwind4 = `/* styles.css (Tailwind v4) */
@import 'tailwindcss';
@import '@juau/zuri/styles/tokens.css';
@import '@juau/zuri/tailwind-theme.css';   /* @theme inline: bg-primary, text-ink, rounded-md… */`;

  protected readonly codeFigma = `// tokens.json — formato W3C Design Tokens; cada token traz os dois temas:
{
  "color": {
    "primary": {
      "$type": "color",
      "$value": "#35d49b",
      "$extensions": { "css": "--zur-primary", "mode": { "light": "#35d49b", "dark": "#3ee6a8" } }
    }
  }
}
// Importe em Figma (Tokens Studio) ou processe com Style Dictionary:
//   import tokens from '@juau/zuri/tokens.json';`;
}
