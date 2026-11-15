import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Instalacao } from './pages/instalacao/instalacao';
import { Tokens } from './pages/tokens/tokens';
import { Componentes } from './pages/componentes/componentes';
import { Layouts } from './pages/layouts/layouts';
import { LayoutDemo } from './pages/layouts/layout-demo';

export const routes: Routes = [
  { path: '', component: Home, title: 'Zuri — Design System' },
  { path: 'instalacao', component: Instalacao, title: 'Instalação · Zuri' },
  { path: 'tokens', component: Tokens, title: 'Tokens · Zuri' },
  { path: 'componentes', component: Componentes, title: 'Componentes · Zuri' },
  { path: 'layouts', component: Layouts, title: 'Layouts · Zuri' },
  { path: 'demo/:layout', component: LayoutDemo, title: 'Demonstração de layout · Zuri' },
  { path: '**', redirectTo: '' },
];
