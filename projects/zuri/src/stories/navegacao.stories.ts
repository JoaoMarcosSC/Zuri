import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { ZurNavbar } from '../lib/navbar/navbar';
import { ZurThemeToggle } from '../lib/theme/theme-toggle';
import { ZurButton } from '../lib/button/button';
import { ZurTabs, ZurTab } from '../lib/tabs/tabs';
import { ZurMenu, ZurMenuItem } from '../lib/menu/menu';
import { ZurBreadcrumb } from '../lib/breadcrumb/breadcrumb';
import { ZurAvatar } from '../lib/avatar/avatar';
import { ZurLogo } from '../lib/logo/logo';

const meta: Meta = {
  title: 'Navegação',
  decorators: [
    moduleMetadata({
      imports: [
        ZurNavbar,
        ZurThemeToggle,
        ZurButton,
        ZurTabs,
        ZurTab,
        ZurMenu,
        ZurMenuItem,
        ZurBreadcrumb,
        ZurAvatar,
        ZurLogo,
      ],
    }),
  ],
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj;

export const Navbar: Story = {
  render: () => ({
    template: `
      <zur-navbar>
        <strong zurNavbarLogo style="font:var(--zur-font-title); color:var(--zur-primary-active);">
          <zur-logo [size]="28" />
        </strong>
        <ng-container zurNavbarLinks>
          <a style="color:var(--zur-ink); text-decoration:none;">Início</a>
          <a style="color:var(--zur-muted); text-decoration:none;">Plantas</a>
          <a style="color:var(--zur-muted); text-decoration:none;">Favoritos</a>
        </ng-container>
        <ng-container zurNavbarActions>
          <zur-theme-toggle />
          <button zur-button variant="pill" size="sm">Entrar</button>
        </ng-container>
      </zur-navbar>
      <p style="padding:24px 32px; margin:0;">
        O botão sol/lua acima alterna o tema de verdade — experimente!
      </p>
    `,
  }),
};

export const Tabs: Story = {
  render: () => ({
    template: `
      <div style="padding:32px; max-width:560px;">
        <zur-tabs>
          <zur-tab label="Descrição">Folhas grandes e recortadas, ótima para luz indireta.</zur-tab>
          <zur-tab label="Cuidados">Rega a cada 7 dias, luz indireta e vaso com furo no fundo.</zur-tab>
          <zur-tab label="Avaliações">4,91 — "Simplesmente perfeito", diz a Ana.</zur-tab>
        </zur-tabs>
      </div>
    `,
  }),
};

export const Menu: Story = {
  render: () => ({
    template: `
      <div style="padding:32px; display:flex; justify-content:flex-end;">
        <zur-menu>
          <button zur-button variant="secondary" size="sm" zurMenuTrigger>Conta ▾</button>
          <zur-menu-item>Perfil</zur-menu-item>
          <zur-menu-item>Meus pedidos</zur-menu-item>
          <zur-menu-item>Sair</zur-menu-item>
        </zur-menu>
      </div>
    `,
  }),
};

export const Breadcrumb: Story = {
  render: () => ({
    props: {
      itens: [
        { label: 'Início', href: '#' },
        { label: 'Folhagens', href: '#' },
        { label: 'Monstera deliciosa' },
      ],
    },
    template: `<div style="padding:32px;"><zur-breadcrumb [items]="itens" /></div>`,
  }),
};
