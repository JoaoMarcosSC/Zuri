import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import {
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
      ],
    },
    {
      label: 'Dados',
      items: [
        { id: 'table', label: 'Table' },
        { id: 'pagination', label: 'Pagination' },
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
      label: 'Feedback',
      items: [
        { id: 'modal', label: 'Modal' },
        { id: 'toast', label: 'Toast' },
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
      ],
    },
  ];
}
