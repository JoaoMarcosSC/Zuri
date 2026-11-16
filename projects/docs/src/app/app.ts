import { Location } from '@angular/common';
import { Component, DOCUMENT, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import {
  ZurButton,
  ZurDensityToggle,
  ZurDocsLayout,
  ZurLogo,
  ZurSidebar,
  ZurSidenav,
  ZurSidenavItem,
  ZurSidenavLabel,
  ZurThemeToggle,
  ZurToastContainer,
  ZurTopbar,
} from '@juau/zuri';

interface ComponentLink {
  id: string;
  label: string;
}

interface ComponentGroup {
  label: string;
  items: ComponentLink[];
}

@Component({
  selector: 'docs-root',
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    ZurButton,
    ZurDensityToggle,
    ZurDocsLayout,
    ZurLogo,
    ZurSidebar,
    ZurTopbar,
    ZurSidenav,
    ZurSidenavItem,
    ZurSidenavLabel,
    ZurThemeToggle,
    ZurToastContainer,
  ],
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly doc = inject(DOCUMENT);

  /** Direção de leitura da página (para testar RTL na própria documentação). */
  protected readonly rtl = signal(this.doc.documentElement.dir === 'rtl');

  protected toggleRtl(): void {
    const next = !this.rtl();
    this.rtl.set(next);
    this.doc.documentElement.dir = next ? 'rtl' : 'ltr';
  }

  /** Rotas /demo/* (iframes da página Layouts) renderizam sem o shell da docs. */
  protected readonly isDemo = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.router.url.startsWith('/demo')),
    ),
    { initialValue: this.location.path().startsWith('/demo') },
  );

  protected readonly layoutLinks: ComponentLink[] = [
    { id: 'landing', label: 'Landing' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'lista-detalhe', label: 'Lista e detalhe' },
    { id: 'formulario', label: 'Formulário e wizard' },
    { id: 'documentacao', label: 'Documentação' },
    { id: 'autenticacao', label: 'Autenticação' },
    { id: 'erro', label: 'Erro e 404' },
  ];

  protected readonly componentGroups: ComponentGroup[] = [
    {
      label: 'Fundamentos',
      items: [
        { id: 'button', label: 'Button' },
        { id: 'logo', label: 'Logo' },
        { id: 'theme-scope', label: 'Theme scope' },
        { id: 'badge', label: 'Badge' },
        { id: 'card', label: 'Card' },
        { id: 'avatar', label: 'Avatar' },
        { id: 'icon', label: 'Ícones' },
        { id: 'icon-button', label: 'Botão de ícone e FAB' },
        { id: 'link', label: 'Link' },
        { id: 'divider', label: 'Divider' },
      ],
    },
    {
      label: 'Formulários',
      items: [
        { id: 'input', label: 'Input' },
        { id: 'select', label: 'Select' },
        { id: 'checkbox', label: 'Checkbox' },
        { id: 'radio', label: 'Radio' },
        { id: 'switch', label: 'Switch' },
        { id: 'textarea', label: 'Textarea' },
        { id: 'combobox', label: 'Combobox' },
        { id: 'date-picker', label: 'Date picker' },
        { id: 'file-upload', label: 'Upload de arquivos' },
        { id: 'chips', label: 'Chips (campo de tags)' },
        { id: 'slider', label: 'Slider' },
        { id: 'segmented', label: 'Segmented' },
        { id: 'multiselect', label: 'Multiselect' },
        { id: 'chip', label: 'Chips interativos' },
        { id: 'search', label: 'Busca' },
        { id: 'inline-edit', label: 'Edição no lugar' },
      ],
    },
    {
      label: 'Navegação',
      items: [
        { id: 'navbar', label: 'Navbar' },
        { id: 'tabs', label: 'Tabs' },
        { id: 'menu', label: 'Menu' },
        { id: 'breadcrumb', label: 'Breadcrumb' },
        { id: 'sidenav', label: 'Sidenav' },
        { id: 'bottom-nav', label: 'Barra inferior' },
      ],
    },
    {
      label: 'Dados',
      items: [
        { id: 'table', label: 'Table' },
        { id: 'pagination', label: 'Pagination' },
        { id: 'table-advanced', label: 'Tabela avançada' },
        { id: 'chart', label: 'Gráficos' },
        { id: 'stat', label: 'KPI e sparkline' },
        { id: 'timeline', label: 'Timeline' },
        { id: 'tree', label: 'Tree' },
        { id: 'list', label: 'Lista' },
        { id: 'table-extras', label: 'Tabela: colunas e lote' },
        { id: 'code-snippet', label: 'Code snippet' },
      ],
    },
    {
      label: 'Conteúdo',
      items: [
        { id: 'step', label: 'Step' },
        { id: 'accordion', label: 'Accordion' },
        { id: 'empty-state', label: 'Empty state' },
      ],
    },
    {
      label: 'Interface',
      items: [
        { id: 'number-input', label: 'Number input' },
        { id: 'otp-input', label: 'OTP' },
        { id: 'rating', label: 'Rating' },
        { id: 'time-picker', label: 'Time picker' },
        { id: 'stepper', label: 'Stepper' },
        { id: 'carousel', label: 'Carousel' },
        { id: 'avatar-group', label: 'Avatar group' },
        { id: 'banner', label: 'Banner' },
      ],
    },
    {
      label: 'Feedback',
      items: [
        { id: 'modal', label: 'Modal' },
        { id: 'toast', label: 'Toast' },
        { id: 'toast-actions', label: 'Toast com ação' },
        { id: 'tooltip', label: 'Tooltip' },
        { id: 'alert', label: 'Alert' },
        { id: 'spinner', label: 'Spinner & Skeleton' },
        { id: 'progress', label: 'Progress' },
      ],
    },
    {
      label: 'Sobreposição',
      items: [
        { id: 'drawer', label: 'Drawer' },
        { id: 'popover', label: 'Popover' },
        { id: 'dialog', label: 'Dialog' },
        { id: 'context-menu', label: 'Context menu' },
        { id: 'bottom-sheet', label: 'Bottom sheet' },
      ],
    },
    {
      label: 'Padrões',
      items: [
        { id: 'chat', label: 'Chat' },
        { id: 'command-palette', label: 'Command palette' },
        { id: 'notifications', label: 'Notificações' },
        { id: 'kanban', label: 'Kanban' },
      ],
    },
  ];
}
