import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ZurAccordion,
  ZurAccordionItem,
  ZurAlert,
  ZurAvatar,
  ZurBadge,
  ZurBreadcrumb,
  ZurButton,
  ZurCard,
  ZurCheckbox,
  ZurDrawer,
  ZurEmptyState,
  ZurInput,
  ZurLogo,
  ZurMenu,
  ZurMenuItem,
  ZurModal,
  ZurNavbar,
  ZurPagination,
  ZurPopover,
  ZurPopoverTrigger,
  ZurProgress,
  ZurRadio,
  ZurSelect,
  ZurSelectOption,
  ZurSidenav,
  ZurSidenavItem,
  ZurSidenavLabel,
  ZurSkeleton,
  ZurSort,
  ZurSortable,
  ZurSpinner,
  ZurStep,
  ZurSwitch,
  ZurTab,
  ZurTable,
  ZurTabs,
  ZurTextarea,
  ZurThemeScope,
  ZurThemeToggle,
  ZurToastService,
  ZurTooltip,
} from '@juau/zuri';
import { CodeBlock } from '../../shared/code-block/code-block';
import { DataExtras } from './data-extras';
import { FormsAdvanced } from './forms-advanced';
import { InterfaceExtras } from './interface-extras';
import { OverlaysExtras } from './overlays-extras';
import { Patterns } from './patterns';

@Component({
  selector: 'docs-componentes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    CodeBlock,
    FormsAdvanced,
    DataExtras,
    InterfaceExtras,
    OverlaysExtras,
    Patterns,
    ZurButton,
    ZurBadge,
    ZurCard,
    ZurAvatar,
    ZurSelect,
    ZurCheckbox,
    ZurInput,
    ZurLogo,
    ZurRadio,
    ZurSwitch,
    ZurNavbar,
    ZurThemeToggle,
    ZurThemeScope,
    ZurTabs,
    ZurTab,
    ZurMenu,
    ZurMenuItem,
    ZurBreadcrumb,
    ZurSidenav,
    ZurSidenavItem,
    ZurSidenavLabel,
    ZurStep,
    ZurModal,
    ZurTooltip,
    ZurAlert,
    ZurSpinner,
    ZurSkeleton,
    ZurAccordion,
    ZurAccordionItem,
    ZurDrawer,
    ZurEmptyState,
    ZurPagination,
    ZurPopover,
    ZurPopoverTrigger,
    ZurProgress,
    ZurSortable,
    ZurTable,
    ZurTextarea,
  ],
  templateUrl: './componentes.html',
  styleUrl: './componentes.css',
})
export class Componentes {
  private readonly toast = inject(ZurToastService);

  // estado dos demos interativos
  protected readonly email = signal('');
  protected readonly categoria = signal('');
  protected readonly aceito = signal(true);
  protected readonly plano = signal('mensal');
  protected readonly notificacoes = signal(true);
  protected readonly tabIndex = signal(0);
  protected readonly modalOpen = signal(false);

  protected readonly categoriaOptions: ZurSelectOption[] = [
    { value: 'folhagem', label: 'Folhagens' },
    { value: 'suculenta', label: 'Suculentas' },
    { value: 'ervas', label: 'Ervas e temperos' },
  ];

  protected readonly breadcrumbItems = [
    { label: 'Início', href: '#' },
    { label: 'Folhagens', href: '#' },
    { label: 'Monstera deliciosa' },
  ];

  showToast(kind: 'neutral' | 'success' | 'error'): void {
    const messages = {
      neutral: 'Link copiado.',
      success: 'Pedido confirmado!',
      error: 'Algo deu errado.',
    };
    this.toast.show(messages[kind], kind);
  }

  // ── snippets exibidos nos blocos de código ──
  protected readonly codeButton = `<button zur-button variant="primary">Comprar agora</button>
<button zur-button variant="secondary">Cancelar</button>
<button zur-button variant="ghost">Saiba mais</button>
<button zur-button variant="pill" size="sm">Pill</button>`;

  protected readonly codeBadge = `<zur-badge color="mint">NOVO</zur-badge>
<zur-badge color="success">Entregue</zur-badge>
<zur-badge color="warning">Em preparo</zur-badge>
<zur-badge color="error">Cancelado</zur-badge>`;

  protected readonly codeCard = `<zur-card interactive>
  <zur-badge color="mint">DESTAQUE</zur-badge>
  <h3>Monstera deliciosa</h3>
  <p>Folhas grandes, vaso de cerâmica incluso e guia de cuidados.</p>
  <button zur-button size="sm">Ver detalhes</button>
</zur-card>`;

  protected readonly codeAvatar = `<zur-avatar name="Ana Silva" size="sm" />
<zur-avatar name="João Marcos" size="md" />
<zur-avatar src="/foto.jpg" name="Maria Costa" size="lg" />`;

  protected readonly codeInput = `<zur-input
  label="E-mail"
  placeholder="voce@exemplo.com"
  hint="Nunca compartilharemos seu e-mail."
  [(ngModel)]="email"
/>`;

  protected readonly codeSelect = `<zur-select
  label="Categoria"
  placeholder="Escolha uma categoria"
  [options]="categoriaOptions"
  [(ngModel)]="categoria"
/>`;

  protected readonly codeCheckbox = `<zur-checkbox [(ngModel)]="aceito">
  Aceito os termos de uso
</zur-checkbox>`;

  protected readonly codeRadio = `<zur-radio name="plano" value="mensal" [(ngModel)]="plano">Mensal</zur-radio>
<zur-radio name="plano" value="anual" [(ngModel)]="plano">Anual (2 meses grátis)</zur-radio>`;

  protected readonly codeSwitch = `<zur-switch [(ngModel)]="notificacoes">
  Receber notificações
</zur-switch>`;

  protected readonly codeLogo = `<zur-logo />
<zur-logo variant="symbol" [size]="24" />
<!-- na sidebar: vira só o símbolo quando recolhida -->
<zur-logo zurSidebarHeader variant="auto" />`;

  protected readonly codeThemeScope = `<div zurThemeScope>
  <zur-theme-toggle />
  <!-- tudo aqui dentro troca de tema sem afetar a página -->
</div>`;

  protected readonly codeNavbar = `<zur-navbar>
  <strong zurNavbarLogo>Casa Verde</strong>
  <ng-container zurNavbarLinks>
    <a href="#">Início</a>
    <a href="#">Plantas</a>
  </ng-container>
  <ng-container zurNavbarActions>
    <zur-theme-toggle />
  </ng-container>
</zur-navbar>`;

  protected readonly codeTabs = `<zur-tabs>
  <zur-tab label="Descrição">Folhas grandes e recortadas.</zur-tab>
  <zur-tab label="Cuidados">Rega a cada 7 dias, luz indireta.</zur-tab>
  <zur-tab label="Avaliações">4,91 — "Simplesmente perfeito".</zur-tab>
</zur-tabs>`;

  protected readonly codeMenu = `<zur-menu>
  <button zur-button variant="secondary" size="sm" zurMenuTrigger>Conta ▾</button>
  <zur-menu-item>Perfil</zur-menu-item>
  <zur-menu-item>Meus pedidos</zur-menu-item>
  <zur-menu-item>Sair</zur-menu-item>
</zur-menu>`;

  protected readonly codeBreadcrumb = `<zur-breadcrumb [items]="[
  { label: 'Início', href: '#' },
  { label: 'Folhagens', href: '#' },
  { label: 'Monstera deliciosa' },
]" />`;

  protected readonly codeSidenav = `<zur-sidenav aria-label="Principal">
  <a zur-sidenav-item routerLink="/" routerLinkActive="active">Home</a>
  <a zur-sidenav-item routerLink="/instalacao" routerLinkActive="active">Instalação</a>

  <zur-sidenav-label>Fundamentos</zur-sidenav-label>
  <a zur-sidenav-item level="secondary" [routerLink]="['/componentes']" fragment="button">
    Button
  </a>
</zur-sidenav>`;

  protected readonly codeStep = `<zur-step number="1" title="Instale o pacote">
  <p>Conteúdo do passo, qualquer markup.</p>
</zur-step>`;

  protected readonly codeModal = `<button zur-button (click)="aberto = true">Abrir modal</button>

<zur-modal [(open)]="aberto" title="Confirmar pedido">
  <p>Deseja confirmar o pedido?</p>
  <div zurModalActions>
    <button zur-button variant="ghost" (click)="aberto = false">Voltar</button>
    <button zur-button variant="primary" (click)="aberto = false">Confirmar</button>
  </div>
</zur-modal>`;

  protected readonly codeToast = `private toast = inject(ZurToastService);

this.toast.show('Pedido confirmado!', 'success');
this.toast.show('Algo deu errado.', 'error');
this.toast.show('Link copiado.'); // neutro

// uma única vez no shell:
<zur-toast-container />`;

  protected readonly codeTooltip = `<button zur-button variant="secondary" zurTooltip="Salvar nos favoritos">
  ♥ Favoritar
</button>`;

  protected readonly codeAlert = `<zur-alert kind="success">Pedido confirmado com sucesso.</zur-alert>
<zur-alert kind="info">A entrega sai em até 2 dias úteis.</zur-alert>
<zur-alert kind="warning">Restam apenas 2 unidades.</zur-alert>
<zur-alert kind="error">Não foi possível processar o pagamento.</zur-alert>`;

  protected readonly codeSpinner = `<zur-spinner size="sm" />
<zur-spinner size="md" />
<zur-spinner size="lg" />

<zur-skeleton width="40px" height="40px" [circle]="true" />
<zur-skeleton height="14px" width="60%" />`;

  // ── demos novas ──────────────────────────────────────────
  protected readonly mensagem = signal('');
  protected readonly pagina = signal(1);
  protected readonly progresso = signal(40);
  protected readonly drawerOpen = signal(false);
  protected readonly quantidade = signal(2);

  private readonly pedidos = [
    { nome: 'Ana Silva', produto: 'Monstera deliciosa', itens: 3 },
    { nome: 'João Marcos', produto: 'Samambaia americana', itens: 7 },
    { nome: 'Maria Costa', produto: 'Zamioculca', itens: 2 },
    { nome: 'Pedro Alves', produto: 'Monstera deliciosa', itens: 5 },
  ];
  private readonly ordem = signal<ZurSort | null>(null);
  protected readonly pedidosOrdenados = computed(() => {
    const o = this.ordem();
    if (!o) return this.pedidos;
    const key = o.key as keyof (typeof this.pedidos)[number];
    const dir = o.direction === 'asc' ? 1 : -1;
    return [...this.pedidos].sort((a, b) => (a[key] > b[key] ? dir : a[key] < b[key] ? -dir : 0));
  });

  protected ordenar(sort: ZurSort): void {
    this.ordem.set(sort);
  }

  protected avancarProgresso(): void {
    this.progresso.update((v) => (v >= 100 ? 0 : v + 20));
  }

  protected max1(n: number): number {
    return Math.max(1, n);
  }

  protected readonly codeTextarea = `<zur-textarea
  label="Bilhete para o presente"
  [maxlength]="200"
  [(ngModel)]="mensagem"
/>`;

  protected readonly codeTable = `<table zur-table (sortChange)="ordenar($event)">
  <thead>
    <tr>
      <th zurSortable="nome">Cliente</th>
      <th zurSortable="produto">Produto</th>
      <th zurSortable="itens">Itens</th>
    </tr>
  </thead>
  <tbody>
    @for (r of pedidosOrdenados(); track r.nome) {
      <tr><td>{{ r.nome }}</td><td>{{ r.produto }}</td><td>{{ r.itens }}</td></tr>
    }
  </tbody>
</table>`;

  protected readonly codePagination = `<zur-pagination [total]="248" [pageSize]="20" [(page)]="pagina" />`;

  protected readonly codeAccordion = `<zur-accordion>
  <zur-accordion-item title="Como cuidar da planta?" [open]="true">…</zur-accordion-item>
  <zur-accordion-item title="Posso trocar se chegar danificada?">…</zur-accordion-item>
</zur-accordion>

<!-- várias abertas ao mesmo tempo -->
<zur-accordion multi>…</zur-accordion>`;

  protected readonly codeEmptyState = `<zur-empty-state
  title="Seu carrinho está vazio"
  description="Quando você adicionar uma planta, ela aparece aqui."
>
  <svg zurEmptyIcon …></svg>
  <button zur-button variant="primary" size="sm">Ver plantas</button>
</zur-empty-state>`;

  protected readonly codeProgress = `<zur-progress [value]="40" label="Enviando fotos" />
<zur-progress size="sm" />  <!-- sem value: indeterminada -->`;

  protected readonly codeDrawer = `<button zur-button (click)="filtros = true">Abrir filtros</button>

<zur-drawer [(open)]="filtros" title="Filtros">
  …campos…
  <div zurDrawerActions>
    <button zur-button variant="primary">Aplicar</button>
  </div>
</zur-drawer>`;

  protected readonly codePopover = `<zur-popover label="Quantidade">
  <button zur-button variant="secondary" zurPopoverTrigger>Quantidade</button>
  …conteúdo…
</zur-popover>`;
}
