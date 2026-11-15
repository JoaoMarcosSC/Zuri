import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Roda cada story do Storybook como teste num navegador (chromium), incluindo a
 * checagem de acessibilidade do addon-a11y (axe). Os testes unitários da
 * biblioteca rodam à parte, com `ng test zuri`.
 */
export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        plugins: [storybookTest({ configDir: path.join(dirname, 'projects/zuri/.storybook') })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
