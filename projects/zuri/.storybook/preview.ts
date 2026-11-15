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
  },
  initialGlobals: {
    theme: 'light',
  },
  decorators: [
    (story, context) => {
      const theme = (context.globals['theme'] as string) ?? 'light';
      document.documentElement.setAttribute('data-theme', theme);
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
    a11y: {
      test: 'todo',
    },
  },
};

export default preview;
