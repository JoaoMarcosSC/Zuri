import type { Meta, StoryObj } from '@storybook/angular-vite';

const meta: Meta = {
  title: 'Design Tokens',
};
export default meta;

type Story = StoryObj;

const swatch = (token: string, label: string) => `
  <div style="display:grid; gap:6px; justify-items:center;">
    <div style="width:72px; height:72px; border-radius:var(--zur-radius-md);
      background:var(${token}); border:1px solid var(--zur-hairline);"></div>
    <code style="font-size:11px; color:var(--zur-muted);">${label}</code>
  </div>
`;

export const Cores: Story = {
  render: () => ({
    template: `
      <div style="display:grid; gap:32px;">
        <section>
          <h3 style="font:var(--zur-font-title); color:var(--zur-ink);">Marca</h3>
          <div style="display:flex; gap:16px; flex-wrap:wrap;">
            ${swatch('--zur-primary', 'primary')}
            ${swatch('--zur-primary-hover', 'hover')}
            ${swatch('--zur-primary-active', 'active')}
            ${swatch('--zur-primary-soft', 'soft')}
            ${swatch('--zur-on-primary', 'on-primary')}
          </div>
        </section>
        <section>
          <h3 style="font:var(--zur-font-title); color:var(--zur-ink);">Superfícies e texto</h3>
          <div style="display:flex; gap:16px; flex-wrap:wrap;">
            ${swatch('--zur-canvas', 'canvas')}
            ${swatch('--zur-surface-soft', 'surface-soft')}
            ${swatch('--zur-surface-strong', 'surface-strong')}
            ${swatch('--zur-hairline', 'hairline')}
            ${swatch('--zur-ink', 'ink')}
            ${swatch('--zur-body', 'body')}
            ${swatch('--zur-muted', 'muted')}
          </div>
        </section>
        <section>
          <h3 style="font:var(--zur-font-title); color:var(--zur-ink);">Semânticas</h3>
          <div style="display:flex; gap:16px; flex-wrap:wrap;">
            ${swatch('--zur-success', 'success')}
            ${swatch('--zur-warning', 'warning')}
            ${swatch('--zur-error', 'error')}
            ${swatch('--zur-info', 'info')}
          </div>
        </section>
      </div>
    `,
  }),
};

export const Tipografia: Story = {
  render: () => ({
    template: `
      <div style="display:grid; gap:20px; color:var(--zur-ink);">
        <div style="font:var(--zur-font-display-xl); letter-spacing:var(--zur-tracking-display-xl);">Display XL</div>
        <div style="font:var(--zur-font-display-lg); letter-spacing:var(--zur-tracking-display-lg);">Display LG</div>
        <div style="font:var(--zur-font-display-md); letter-spacing:var(--zur-tracking-display-md);">Display MD</div>
        <div style="font:var(--zur-font-headline);">Headline</div>
        <div style="font:var(--zur-font-title);">Title</div>
        <div style="font:var(--zur-font-body-lg); color:var(--zur-body);">Body LG — lead editorial com line-height generoso.</div>
        <div style="font:var(--zur-font-body); color:var(--zur-body);">Body — texto padrão do sistema, caloroso e legível.</div>
        <div style="font:var(--zur-font-caption); color:var(--zur-muted);">Caption — labels e metadados.</div>
      </div>
    `,
  }),
};

export const Formas: Story = {
  name: 'Raios e sombra',
  render: () => ({
    template: `
      <div style="display:flex; gap:24px; flex-wrap:wrap; align-items:flex-end;">
        ${['xs', 'sm', 'md', 'lg', 'xl']
          .map(
            (r) => `
          <div style="display:grid; gap:6px; justify-items:center;">
            <div style="width:88px; height:88px; background:var(--zur-primary-soft);
              border:1px solid var(--zur-hairline); border-radius:var(--zur-radius-${r});"></div>
            <code style="font-size:11px; color:var(--zur-muted);">radius-${r}</code>
          </div>`,
          )
          .join('')}
        <div style="display:grid; gap:6px; justify-items:center;">
          <div style="width:88px; height:88px; background:var(--zur-surface-raised);
            border-radius:var(--zur-radius-md); box-shadow:var(--zur-shadow-float);"></div>
          <code style="font-size:11px; color:var(--zur-muted);">shadow-float</code>
        </div>
      </div>
    `,
  }),
};

/**
 * Documenta o redesign do tema escuro (filosofia de imersão do Spotify,
 * sem copiar valores — tema claro permanece intocado). Abre direto em dark.
 */
export const RedesignTemaEscuro: Story = {
  name: 'Redesign do tema escuro',
  globals: { theme: 'dark' },
  render: () => ({
    template: `
      <div style="display:grid; gap:32px; max-width:640px;">
        <p style="font:var(--zur-font-body); color:var(--zur-body); margin:0;">
          Esta story já abre no tema escuro. O claro não foi alterado — compare pelo
          toggle ☀️/🌙 na toolbar. Inspiração: filosofia de imersão quase-preta do
          <strong>Spotify</strong> (conteúdo em primeiro plano, UI quase invisível),
          sem copiar nenhum valor — mantendo a identidade Zuri.
        </p>

        <section>
          <h3 style="font:var(--zur-font-title); color:var(--zur-ink); margin:0 0 12px;">
            1 · Fundo — quase-preto, tintura verde sutil
          </h3>
          <div style="display:flex; gap:16px; flex-wrap:wrap;">
            ${swatch('--zur-canvas', 'canvas')}
          </div>
        </section>

        <section>
          <h3 style="font:var(--zur-font-title); color:var(--zur-ink); margin:0 0 12px;">
            2 · Camadas — escada sutil, degraus próximos
          </h3>
          <div style="display:flex; gap:16px; flex-wrap:wrap;">
            ${swatch('--zur-canvas', 'canvas')}
            ${swatch('--zur-surface-soft', 'surface-soft')}
            ${swatch('--zur-surface-strong', 'surface-strong')}
          </div>
        </section>

        <section>
          <h3 style="font:var(--zur-font-title); color:var(--zur-ink); margin:0 0 12px;">
            3 · Texto — quase neutro
          </h3>
          <div style="display:grid; gap:4px;">
            <span style="font:var(--zur-font-body); color:var(--zur-ink);">ink — quase branco</span>
            <span style="font:var(--zur-font-body); color:var(--zur-body);">body — quase cinza</span>
            <span style="font:var(--zur-font-caption); color:var(--zur-muted);">muted — legendas</span>
          </div>
        </section>

        <section>
          <h3 style="font:var(--zur-font-title); color:var(--zur-ink); margin:0 0 12px;">
            4 · Acento verde — vibrante e multiuso (sem alteração)
          </h3>
          <div style="display:flex; gap:16px; flex-wrap:wrap;">
            ${swatch('--zur-primary', 'primary')}
            ${swatch('--zur-primary-soft', 'primary-soft')}
          </div>
        </section>

        <section>
          <h3 style="font:var(--zur-font-title); color:var(--zur-ink); margin:0 0 12px;">
            7 · Sombra única — mais pesada (borda hairline mantida)
          </h3>
          <div style="width:88px; height:88px; background:var(--zur-surface-raised);
            border-radius:var(--zur-radius-md); box-shadow:var(--zur-shadow-float);"></div>
        </section>

        <section>
          <h3 style="font:var(--zur-font-title); color:var(--zur-ink); margin:0 0 12px;">
            8 · Foco — anel único, mais discreto
          </h3>
          <button style="height:48px; padding:0 24px; border-radius:var(--zur-radius-sm);
            background:var(--zur-primary); color:var(--zur-on-primary); border:none;
            font:var(--zur-font-button); box-shadow:var(--zur-focus-ring);">
            Botão com foco simulado
          </button>
        </section>
      </div>
    `,
  }),
};
