import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/angular-vite';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding"
  ],
  "framework": {
    "name": "@storybook/angular-vite",
    "options": {
      // Caminho absoluto: o plugin do Angular resolveria "./.storybook/tsconfig.json" a partir
      // da pasta em que o comando roda, o que falha nos testes (vitest roda da raiz).
      "tsconfig": fileURLToPath(new URL('./tsconfig.json', import.meta.url))
    }
  }
};
export default config;
