import { Routes } from '@angular/router';
import { Home } from './pages/home/home';

export const routes: Routes = [
  { path: '', component: Home, title: 'Zuri — Design System' },
  {
    path: 'instalacao',
    loadComponent: () => import('./pages/instalacao/instalacao').then((m) => m.Instalacao),
    title: 'Instalação · Zuri',
  },
  {
    path: 'tokens',
    loadComponent: () => import('./pages/tokens/tokens').then((m) => m.Tokens),
    title: 'Tokens · Zuri',
  },
  {
    path: 'componentes',
    loadComponent: () => import('./pages/componentes/componentes').then((m) => m.Componentes),
    title: 'Componentes · Zuri',
  },
  {
    path: 'layouts',
    loadComponent: () => import('./pages/layouts/layouts').then((m) => m.Layouts),
    title: 'Layouts · Zuri',
  },
  {
    path: 'demo/:layout',
    loadComponent: () => import('./pages/layouts/layout-demo').then((m) => m.LayoutDemo),
    title: 'Demonstração de layout · Zuri',
  },
  { path: '**', redirectTo: '' },
];
