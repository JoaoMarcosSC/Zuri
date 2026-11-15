import type { Preview } from '@storybook/angular-vite';
import '../src/styles/tokens.css';

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Tema do Zuri (sol/lua)',
      toolbar: {
        title: 'Tema',
        icon: 'mirror',
        items: [
          { value: 'light', title: '☀️ Claro' },
          { value: 'dark', title: '🌙 Escuro' },
        ],
        dynamicTitle: true,
      },
    },
    dir: {
      description: 'Direção de leitura (LTR/RTL)',
      toolbar: {
        title: 'Direção',
        icon: 'transfer',
        items: [
          { value: 'ltr', title: 'Esquerda → direita (LTR)' },
          { value: 'rtl', title: 'Direita → esquerda (RTL)' },
        ],
        dynamicTitle: true,
      },
    },
    density: {
      description: 'Densidade da interface',
      toolbar: {
        title: 'Densidade',
        icon: 'component',
        items: [
          { value: 'comfortable', title: 'Confortável' },
          { value: 'compact', title: 'Compacta' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
    dir: 'ltr',
    density: 'comfortable',
  },
  decorators: [
    (story, context) => {
      const theme = (context.globals['theme'] as string) ?? 'light';
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.setAttribute('dir', (context.globals['dir'] as string) ?? 'ltr');
      if (context.globals['density'] === 'compact') document.documentElement.setAttribute('data-density', 'compact');
      else document.documentElement.removeAttribute('data-density');
      document.body.style.background = 'var(--zur-canvas)';
      document.body.style.color = 'var(--zur-body)';
      document.body.style.fontFamily = 'var(--zur-font-family)';
      document.body.style.transition = 'background-color 200ms ease';
      return story();
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: { disable: true },
    // Regressão visual (Chromatic): cada story é capturada nestes modos.
    chromatic: {
      pauseAnimationAtEnd: true,
      modes: {
        light: { theme: 'light' },
        dark: { theme: 'dark' },
        rtl: { theme: 'light', dir: 'rtl' },
        compact: { theme: 'light', density: 'compact' },
      },
    },
    a11y: {
      // Violações de acessibilidade (axe) fazem a story falhar no teste.
      test: 'error',
    },
  },
};

export default preview;
