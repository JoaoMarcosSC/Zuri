import { RenderMode, ServerRoute } from '@angular/ssr';

/** Ids dos layouts de demonstração (`/demo/:layout`). */
const LAYOUTS = ['landing', 'dashboard', 'lista-detalhe', 'formulario', 'documentacao', 'autenticacao', 'erro'];

export const serverRoutes: ServerRoute[] = [
  {
    path: 'demo/:layout',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => LAYOUTS.map((layout) => ({ layout })),
  },
  { path: '**', renderMode: RenderMode.Prerender },
];
