import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ZurAlert,
  ZurAvatar,
  ZurBadge,
  ZurBreadcrumb,
  ZurButton,
  ZurCard,
  ZurCheckbox,
  ZurInput,
  ZurLogo,
  ZurMenu,
  ZurMenuItem,
  ZurModal,
  ZurNavbar,
  ZurRadio,
  ZurSelect,
  ZurSelectOption,
  ZurSidenav,
  ZurSidenavItem,
  ZurSidenavLabel,
  ZurStep,
  ZurSkeleton,
  ZurSpinner,
  ZurSwitch,
  ZurTab,
  ZurTabs,
  ZurThemeScope,
  ZurThemeToggle,
  ZurToastService,
  ZurTooltip,
} from 'zuri';
import { CodeBlock } from '../../shared/code-block/code-block';

@Component({
  selector: 'docs-componentes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    CodeBlock,
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
  ],
  templateUrl: './componentes.html',
  styleUrl: './componentes.css',
})
export class Componentes {
  private readonly toast = inject(ZurToastService);

  // estado dos demos interativos
  protected readonly email = signal('');
  protected readonly destino = signal('');
  protected readonly aceito = signal(true);
  protected readonly plano = signal('mensal');
  protected readonly notificacoes = signal(true);
  protected readonly tabIndex = signal(0);
  protected readonly modalOpen = signal(false);

  protected readonly destinoOptions: ZurSelectOption[] = [
    { value: 'serra', label: 'Serra Gaúcha' },
    { value: 'litoral', label: 'Litoral Norte' },
    { value: 'chapada', label: 'Chapada dos Veadeiros' },
  ];

  protected readonly breadcrumbItems = [
    { label: 'Início', href: '#' },
    { label: 'Serra Gaúcha', href: '#' },
    { label: 'Chalé na serra' },
  ];

  showToast(kind: 'neutral' | 'success' | 'error'): void {
    const messages = {
      neutral: 'Link copiado.',
      success: 'Reserva confirmada!',
      error: 'Algo deu errado.',
    };
    this.toast.show(messages[kind], kind);
  }

  // ── snippets exibidos nos blocos de código ──
  protected readonly codeButton = `<button zur-button variant="primary">Reservar agora</button>
<button zur-button variant="secondary">Cancelar</button>
<button zur-button variant="ghost">Saiba mais</button>
<button zur-button variant="pill" size="sm">Pill</button>`;

  protected readonly codeBadge = `<zur-badge color="mint">NOVO</zur-badge>
<zur-badge color="success">Confirmado</zur-badge>
<zur-badge color="warning">Pendente</zur-badge>
<zur-badge color="error">Cancelado</zur-badge>`;

  protected readonly codeCard = `<zur-card interactive>
  <zur-badge color="mint">DESTAQUE</zur-badge>
  <h3>Chalé na serra</h3>
  <p>Vista para o vale, lareira e café da manhã incluso.</p>
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
  label="Destino"
  placeholder="Escolha um destino"
  [options]="destinoOptions"
  [(ngModel)]="destino"
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
  <strong zurNavbarLogo>Minha Marca</strong>
  <ng-container zurNavbarLinks>
    <a href="#">Início</a>
    <a href="#">Explorar</a>
  </ng-container>
  <ng-container zurNavbarActions>
    <zur-theme-toggle />
  </ng-container>
</zur-navbar>`;

  protected readonly codeTabs = `<zur-tabs>
  <zur-tab label="Visão geral">Um refúgio na serra.</zur-tab>
  <zur-tab label="Comodidades">Wi-Fi, lareira, cozinha completa.</zur-tab>
  <zur-tab label="Avaliações">4,91 — "Simplesmente perfeito".</zur-tab>
</zur-tabs>`;

  protected readonly codeMenu = `<zur-menu>
  <button zur-button variant="secondary" size="sm" zurMenuTrigger>Conta ▾</button>
  <zur-menu-item>Perfil</zur-menu-item>
  <zur-menu-item>Minhas reservas</zur-menu-item>
  <zur-menu-item>Sair</zur-menu-item>
</zur-menu>`;

  protected readonly codeBreadcrumb = `<zur-breadcrumb [items]="[
  { label: 'Início', href: '#' },
  { label: 'Serra Gaúcha', href: '#' },
  { label: 'Chalé na serra' },
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

<zur-modal [(open)]="aberto" title="Confirmar reserva">
  <p>Deseja confirmar a reserva?</p>
  <div zurModalActions>
    <button zur-button variant="ghost" (click)="aberto = false">Voltar</button>
    <button zur-button variant="primary" (click)="aberto = false">Confirmar</button>
  </div>
</zur-modal>`;

  protected readonly codeToast = `private toast = inject(ZurToastService);

this.toast.show('Reserva confirmada!', 'success');
this.toast.show('Algo deu errado.', 'error');
this.toast.show('Link copiado.'); // neutro

// uma única vez no shell:
<zur-toast-container />`;

  protected readonly codeTooltip = `<button zur-button variant="secondary" zurTooltip="Salvar nos favoritos">
  ♥ Favoritar
</button>`;

  protected readonly codeAlert = `<zur-alert kind="success">Reserva confirmada com sucesso.</zur-alert>
<zur-alert kind="info">O check-in abre às 14h.</zur-alert>
<zur-alert kind="warning">Restam apenas 2 datas disponíveis.</zur-alert>
<zur-alert kind="error">Não foi possível processar o pagamento.</zur-alert>`;

  protected readonly codeSpinner = `<zur-spinner size="sm" />
<zur-spinner size="md" />
<zur-spinner size="lg" />

<zur-skeleton width="40px" height="40px" [circle]="true" />
<zur-skeleton height="14px" width="60%" />`;
}
