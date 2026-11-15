import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ZurButton } from '@juau/zuri';
import { CodeBlock } from '../../shared/code-block/code-block';

type Viewport = 'desktop' | 'tablet' | 'mobile';

interface LayoutInfo {
  id: string;
  nome: string;
  componente: string;
  descricao: string;
  quando: string;
  largura: string;
  codigo: string;
}

const LAYOUTS: Omit<LayoutInfo, 'codigo'>[] = [
  {
    id: 'landing',
    nome: 'Landing / descritiva',
    componente: 'zur-landing-layout',
    descricao: 'Topbar no topo, seções longas e rodapé. Conteúdo centralizado.',
    quando: 'Página pública de apresentação, produto ou campanha, para qualquer visitante.',
    largura: 'wide · ~1100px',
  },
  {
    id: 'dashboard',
    nome: 'Dashboard / admin',
    componente: 'zur-dashboard-layout',
    descricao: 'Sidebar recolhível + topbar + área fluida para cartões, tabelas e gráficos.',
    quando: 'Área logada com várias seções e uso frequente: painéis, back-office, CRM.',
    largura: 'fluid · 100%',
  },
  {
    id: 'lista-detalhe',
    nome: 'Lista e detalhe',
    componente: 'zur-list-detail-layout',
    descricao: 'Lista à esquerda, detalhe à direita. No mobile, um painel por vez.',
    quando: 'Caixa de entrada, reservas, tickets: escolher um item e ver/editar sem trocar de página.',
    largura: 'fluid · lista 360px',
  },
  {
    id: 'formulario',
    nome: 'Formulário e wizard',
    componente: 'zur-form-layout',
    descricao: 'Coluna estreita, etapas opcionais e barra de ações fixa no rodapé.',
    quando: 'Cadastros longos, checkout ou qualquer fluxo com campos e etapas.',
    largura: 'reading · ~760px',
  },
  {
    id: 'documentacao',
    nome: 'Documentação',
    componente: 'zur-docs-layout',
    descricao: 'Sidebar de navegação + coluna de leitura. É o layout desta própria docs.',
    quando: 'Guias, manuais e bases de conhecimento com muita navegação e texto corrido.',
    largura: 'reading · ~760px',
  },
  {
    id: 'autenticacao',
    nome: 'Autenticação',
    componente: 'zur-auth-layout',
    descricao: 'Card centralizado, com marca acima e links abaixo.',
    quando: 'Login, cadastro, recuperação de senha: uma tarefa só, sem distração.',
    largura: 'narrow · ~440px',
  },
  {
    id: 'erro',
    nome: 'Erro e 404',
    componente: 'zur-error-layout',
    descricao: 'Código grande, título, descrição e ações de saída.',
    quando: 'Página não encontrada, sem permissão ou erro do servidor.',
    largura: 'narrow · ~440px',
  },
];

const CODIGOS: Record<string, string> = {
  landing: `<zur-landing-layout>
  <zur-topbar>
    <a zurTopbarStart href="/"><zur-logo /></a>
    <ng-container zurTopbarActions><zur-theme-toggle /></ng-container>
  </zur-topbar>

  <section>…</section>

  <zur-footer>© 2026 Zuri</zur-footer>
</zur-landing-layout>`,
  dashboard: `<zur-dashboard-layout>
  <zur-sidebar>
    <zur-logo zurSidebarHeader variant="auto" />
    <zur-sidenav>
      <a zur-sidenav-item routerLink="/" routerLinkActive="active">
        <svg zurSidenavIcon>…</svg>Início
      </a>
    </zur-sidenav>
  </zur-sidebar>

  <zur-topbar>
    <ng-container zurTopbarActions><zur-theme-toggle /></ng-container>
  </zur-topbar>

  <zur-page-header title="Visão geral">
    <zur-breadcrumb [items]="trilha" />
    <button zurPageHeaderActions zur-button>Nova reserva</button>
  </zur-page-header>
  …
</zur-dashboard-layout>`,
  'lista-detalhe': `<zur-list-detail-layout [(detailOpen)]="aberto">
  <zur-topbar>…</zur-topbar>

  <div zurList>
    <button (click)="aberto = true">Ana Silva</button>
  </div>

  <article zurDetail>
    <zur-page-header title="Ana Silva" />
  </article>
</zur-list-detail-layout>`,
  formulario: `<zur-form-layout [steps]="['Dados', 'Pagamento', 'Revisão']" [current]="1">
  <zur-page-header title="Nova reserva" />
  <zur-input label="Nome completo" />

  <div zurLayoutActions>
    <button zur-button variant="ghost">Voltar</button>
    <button zur-button variant="primary">Continuar</button>
  </div>
</zur-form-layout>`,
  documentacao: `<zur-docs-layout>
  <zur-sidebar>
    <zur-logo zurSidebarHeader variant="auto" />
    <zur-sidenav>…</zur-sidenav>
  </zur-sidebar>
  <zur-topbar>…</zur-topbar>

  <router-outlet />
</zur-docs-layout>`,
  autenticacao: `<zur-auth-layout>
  <zur-logo zurAuthBrand />
  <h1>Entrar</h1>
  <zur-input label="E-mail" />
  <zur-input label="Senha" type="password" />
  <button zur-button variant="primary">Entrar</button>
  <span zurAuthFooter>Não tem conta? <a href="/cadastro">Criar conta</a></span>
</zur-auth-layout>`,
  erro: `<zur-error-layout
  code="404"
  title="Página não encontrada"
  description="O endereço não existe ou foi movido."
>
  <a zur-button variant="primary" routerLink="/">Voltar ao início</a>
</zur-error-layout>`,
};

@Component({
  selector: 'docs-layouts',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ZurButton, CodeBlock],
  templateUrl: './layouts.html',
  styleUrl: './layouts.css',
})
export class Layouts {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly doc = inject(DOCUMENT);

  protected readonly viewport = signal<Viewport>('desktop');
  protected readonly viewports: { id: Viewport; label: string }[] = [
    { id: 'desktop', label: 'Desktop' },
    { id: 'tablet', label: 'Tablet · 768' },
    { id: 'mobile', label: 'Mobile · 390' },
  ];

  protected readonly layouts: (LayoutInfo & { url: SafeResourceUrl })[] = LAYOUTS.map((l) => ({
    ...l,
    codigo: CODIGOS[l.id],
    // new URL(..., baseURI) respeita o <base href> (ex.: /Zuri/ no GitHub Pages)
    url: this.sanitizer.bypassSecurityTrustResourceUrl(new URL(`demo/${l.id}`, this.doc.baseURI).href),
  }));
}
