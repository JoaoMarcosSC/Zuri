import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import {
  ZurAuthLayout,
  ZurDashboardLayout,
  ZurDocsLayout,
  ZurErrorLayout,
  ZurFooter,
  ZurFormLayout,
  ZurLandingLayout,
  ZurListDetailLayout,
  ZurPageHeader,
  ZurSidebar,
  ZurTopbar,
} from '../lib/layout';
import { ZurSidenav, ZurSidenavItem, ZurSidenavLabel } from '../lib/sidenav/sidenav';
import { ZurBreadcrumb } from '../lib/breadcrumb/breadcrumb';
import { ZurButton } from '../lib/button/button';
import { ZurCard } from '../lib/card/card';
import { ZurBadge } from '../lib/badge/badge';
import { ZurAvatar } from '../lib/avatar/avatar';
import { ZurInput } from '../lib/input/input';
import { ZurThemeToggle } from '../lib/theme/theme-toggle';
import { ZurLogo } from '../lib/logo/logo';

const meta: Meta = {
  title: 'Layouts',
  decorators: [
    moduleMetadata({
      imports: [
        ZurLandingLayout,
        ZurDashboardLayout,
        ZurListDetailLayout,
        ZurFormLayout,
        ZurDocsLayout,
        ZurAuthLayout,
        ZurErrorLayout,
        ZurSidebar,
        ZurTopbar,
        ZurPageHeader,
        ZurFooter,
        ZurSidenav,
        ZurSidenavItem,
        ZurSidenavLabel,
        ZurBreadcrumb,
        ZurButton,
        ZurCard,
        ZurBadge,
        ZurAvatar,
        ZurInput,
        ZurThemeToggle,
        ZurLogo,
      ],
    }),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Shells de página do Zuri. Redimensione a janela (ou use o viewport do Storybook) para ver desktop, tablet e mobile.',
      },
    },
  },
};
export default meta;

type Story = StoryObj;

const ICON =
  '<svg zurSidenavIcon viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></svg>';

const SIDEBAR = `
  <zur-sidebar>
    <span zurSidebarHeader><zur-logo variant="auto" [size]="28" /></span>
    <zur-sidenav aria-label="Principal">
      <a zur-sidenav-item href="#" [active]="true">${ICON}Início</a>
      <a zur-sidenav-item href="#">${ICON}Relatórios</a>
      <a zur-sidenav-item href="#">${ICON}Clientes</a>
      <zur-sidenav-label>Atalhos</zur-sidenav-label>
      <a zur-sidenav-item level="secondary" href="#">Pedidos</a>
      <a zur-sidenav-item level="secondary" href="#">Estoque</a>
    </zur-sidenav>
  </zur-sidebar>`;

const TOPBAR_ACTIONS = `
  <zur-topbar>
    <ng-container zurTopbarActions><zur-theme-toggle /></ng-container>
  </zur-topbar>`;

const PARAGRAPHS = Array.from(
  { length: 10 },
  (_, i) =>
    `<p style="margin:0 0 16px; color:var(--zur-body);">Parágrafo ${i + 1} — role para ver o topbar sumir ao descer e voltar ao subir.</p>`,
).join('');

export const Landing: Story = {
  render: () => ({
    template: `
      <zur-landing-layout>
        <zur-topbar>
          <span zurTopbarStart><zur-logo [size]="28" /></span>
          <ng-container zurTopbarLinks>
            <a style="color:var(--zur-ink); text-decoration:none;">Início</a>
            <a style="color:var(--zur-muted); text-decoration:none;">Recursos</a>
          </ng-container>
          <ng-container zurTopbarActions>
            <zur-theme-toggle />
            <button zur-button variant="pill" size="sm">Começar</button>
          </ng-container>
        </zur-topbar>
        <h1 style="font:var(--zur-font-display-lg); color:var(--zur-ink); margin:0 0 16px;">
          Plantas que fazem a casa respirar
        </h1>
        ${PARAGRAPHS}
        <zur-footer>© 2026 Zuri</zur-footer>
      </zur-landing-layout>
    `,
  }),
};

export const Dashboard: Story = {
  render: () => ({
    template: `
      <zur-dashboard-layout>
        ${SIDEBAR}
        ${TOPBAR_ACTIONS}
        <zur-page-header title="Visão geral" description="Resumo das últimas 4 semanas.">
          <zur-breadcrumb [items]="[{ label: 'Início', href: '#' }, { label: 'Visão geral' }]" />
          <button zurPageHeaderActions zur-button variant="primary" size="sm">Novo pedido</button>
        </zur-page-header>
        <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:16px; margin-bottom:32px;">
          <zur-card><p style="margin:0; color:var(--zur-muted);">Pedidos</p><strong style="font:var(--zur-font-headline); color:var(--zur-ink);">1.284</strong></zur-card>
          <zur-card><p style="margin:0; color:var(--zur-muted);">Receita</p><strong style="font:var(--zur-font-headline); color:var(--zur-ink);">R$ 48 mil</strong></zur-card>
          <zur-card><p style="margin:0; color:var(--zur-muted);">Conversão</p><strong style="font:var(--zur-font-headline); color:var(--zur-ink);">3,8%</strong></zur-card>
        </div>
        ${PARAGRAPHS}
      </zur-dashboard-layout>
    `,
  }),
};

export const ListaDetalhe: Story = {
  name: 'Lista e detalhe',
  render: () => ({
    props: { aberto: false },
    template: `
      <zur-list-detail-layout [(detailOpen)]="aberto">
        <zur-topbar>
          <span zurTopbarStart>Pedidos</span>
          <ng-container zurTopbarActions><zur-theme-toggle /></ng-container>
        </zur-topbar>
        <div zurList>
          <button type="button" (click)="aberto = true"
            style="display:flex; gap:12px; width:100%; padding:12px 16px; border:0; border-bottom:1px solid var(--zur-hairline-soft); background:transparent; color:var(--zur-body); text-align:left; cursor:pointer;">
            <zur-avatar name="Ana Silva" size="sm" /> Ana Silva · Monstera deliciosa
          </button>
          <button type="button" (click)="aberto = true"
            style="display:flex; gap:12px; width:100%; padding:12px 16px; border:0; border-bottom:1px solid var(--zur-hairline-soft); background:transparent; color:var(--zur-body); text-align:left; cursor:pointer;">
            <zur-avatar name="João Marcos" size="sm" /> João Marcos · Samambaia americana
          </button>
        </div>
        <article zurDetail>
          <zur-page-header title="Ana Silva" description="Monstera deliciosa · 12 dez" />
          ${PARAGRAPHS}
        </article>
      </zur-list-detail-layout>
    `,
  }),
};

export const Formulario: Story = {
  name: 'Formulário e wizard',
  render: () => ({
    template: `
      <zur-form-layout [steps]="['Dados', 'Pagamento', 'Revisão']" [current]="0">
        ${TOPBAR_ACTIONS}
        <zur-page-header title="Novo pedido" description="Preencha os dados de entrega." />
        <div style="display:flex; flex-direction:column; gap:16px;">
          <zur-input label="Nome completo" placeholder="Ana Silva" />
          <zur-input label="E-mail" placeholder="voce@exemplo.com" hint="Enviaremos a confirmação." />
          <zur-input label="Telefone" placeholder="(11) 99999-0000" />
        </div>
        <div zurLayoutActions>
          <button zur-button variant="ghost">Voltar</button>
          <button zur-button variant="primary">Continuar</button>
        </div>
      </zur-form-layout>
    `,
  }),
};

export const Documentacao: Story = {
  name: 'Documentação',
  render: () => ({
    template: `
      <zur-docs-layout>
        ${SIDEBAR}
        ${TOPBAR_ACTIONS}
        <zur-page-header title="Primeiros passos" description="Coluna de leitura de ~760px." />
        ${PARAGRAPHS}
      </zur-docs-layout>
    `,
  }),
};

export const Autenticacao: Story = {
  name: 'Autenticação',
  render: () => ({
    template: `
      <zur-auth-layout>
        <span zurAuthBrand><zur-logo [size]="36" /></span>
        <h1 style="font:var(--zur-font-headline); color:var(--zur-ink); margin:0 0 16px;">Entrar</h1>
        <div style="display:flex; flex-direction:column; gap:16px;">
          <zur-input label="E-mail" placeholder="voce@exemplo.com" />
          <zur-input label="Senha" type="password" />
          <button zur-button variant="primary">Entrar</button>
        </div>
        <span zurAuthFooter>Não tem conta? <a href="#">Criar conta</a></span>
      </zur-auth-layout>
    `,
  }),
};

export const Erro404: Story = {
  name: 'Erro e 404',
  render: () => ({
    template: `
      <zur-error-layout
        code="404"
        title="Página não encontrada"
        description="O endereço que você tentou abrir não existe ou foi movido."
      >
        <button zur-button variant="primary">Voltar ao início</button>
        <button zur-button variant="secondary">Falar com o suporte</button>
      </zur-error-layout>
    `,
  }),
};
