import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ZUR_ICON_CATALOG,
  ZurAvatar,
  ZurBadge,
  ZurBottomNav,
  ZurBottomNavItem,
  ZurFab,
  ZurIcon,
  ZurIconButton,
  ZurList,
  ZurListItem,
  zurIconBell,
  zurIconHeart,
  zurIconHome,
  zurIconPencil,
  zurIconPlus,
  zurIconTrash,
  zurIconUser,
} from '@juau/zuri';
import { CodeBlock } from '../../shared/code-block/code-block';

/** Ícones, botão de ícone e FAB, lista e barra de navegação inferior. */
@Component({
  selector: 'docs-ui-more',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule, CodeBlock, ZurIcon, ZurIconButton, ZurFab, ZurList, ZurListItem, ZurAvatar, ZurBadge,
    ZurBottomNav, ZurBottomNavItem,
  ],
  templateUrl: './ui-more.html',
  styleUrl: './componentes.css',
  styles: `
    :host {
      max-width: none;
      margin: 0;
    }
    .stack {
      display: grid;
      gap: var(--zur-space-lg);
      width: 100%;
      max-width: 480px;
    }
    .readout {
      margin: 0;
      font: var(--zur-font-caption);
      color: var(--zur-muted);
    }
    .catalog {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(112px, 1fr));
      gap: var(--zur-space-sm);
      width: 100%;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .catalog li {
      display: grid;
      justify-items: center;
      gap: var(--zur-space-xs);
      padding: var(--zur-space-md) var(--zur-space-xs);
      border: 1px solid var(--zur-hairline);
      border-radius: var(--zur-radius-md);
      background: var(--zur-canvas);
      color: var(--zur-ink);
    }
    .catalog span {
      font: var(--zur-font-caption);
      color: var(--zur-muted);
      text-align: center;
    }
    .phone {
      width: 100%;
      max-width: 390px;
      overflow: hidden;
      border: 1px solid var(--zur-hairline);
      border-radius: var(--zur-radius-lg);
      background: var(--zur-canvas);
    }
    .phone-body {
      height: 120px;
      padding: var(--zur-space-md);
      color: var(--zur-body);
    }
    .row {
      display: flex;
      gap: var(--zur-space-sm);
      align-items: center;
      flex-wrap: wrap;
    }
  `,
})
export class UiMore {
  protected readonly catalogo = ZUR_ICON_CATALOG;
  protected readonly casa = zurIconHome;
  protected readonly coracao = zurIconHeart;
  protected readonly sino = zurIconBell;
  protected readonly usuario = zurIconUser;
  protected readonly lapis = zurIconPencil;
  protected readonly lixeira = zurIconTrash;
  protected readonly mais = zurIconPlus;

  protected readonly entrega = signal<string | null>('normal');
  protected readonly extras = signal<string[]>(['vaso']);

  protected readonly codeIcon = `import { ZurIcon, zurIconSearch } from '@juau/zuri';

@Component({ imports: [ZurIcon], template: \`<zur-icon [icon]="lupa" />\` })
class Busca { lupa = zurIconSearch; }

<zur-icon [icon]="lupa" />                          <!-- decorativo (aria-hidden) -->
<zur-icon [icon]="alerta" label="Atenção" [size]="24" />  <!-- com nome: role="img" -->

// Cada ícone é uma constante: o bundler descarta os que você não importa.
// Os direcionais (chevron, external-link, undo) se espelham sozinhos em RTL.`;

  protected readonly codeIconButton = `<button zur-icon-button label="Excluir" variant="secondary" size="sm">
  <zur-icon [icon]="lixeira" [size]="16" />
</button>

<button zur-fab label="Novo pedido"><zur-icon [icon]="mais" [size]="24" /></button>
<button zur-fab extended><zur-icon [icon]="mais" /> Novo pedido</button>

// label é obrigatório no botão de ícone (vira o aria-label). O posicionamento do FAB é seu.`;

  protected readonly codeList = `<zur-list label="Pedidos recentes" contained divided>
  <zur-list-item>
    <zur-avatar zurListLeading name="Ana Silva" size="sm" />
    Pedido 42
    <span zurListSecondary>Monstera deliciosa e vaso de barro</span>
    <zur-badge zurListTrailing color="success">Enviado</zur-badge>
  </zur-list-item>
  <zur-list-item interactive (click)="abrirTodos()">Ver todos os pedidos</zur-list-item>
</zur-list>

<!-- selecionável: listbox com roving tabindex; valor string (single) ou string[] (multiple) -->
<zur-list label="Entrega" selection="single" contained divided [(ngModel)]="entrega">
  <zur-list-item value="retirar">Retirar na loja</zur-list-item>
  <zur-list-item value="normal">Entrega normal</zur-list-item>
</zur-list>`;

  protected readonly codeBottomNav = `<zur-bottom-nav label="Navegação principal">
  <a zur-bottom-nav-item href="/" active>
    <zur-icon zurBottomNavIcon [icon]="casa" [size]="24" /> Início
  </a>
  <a zur-bottom-nav-item href="/avisos" [badge]="3">
    <zur-icon zurBottomNavIcon [icon]="sino" [size]="24" /> Avisos
  </a>
  <a zur-bottom-nav-item href="/perfil" badge="dot">…</a>
</zur-bottom-nav>

// Fixa na base e some a partir de 768 px (use [fixed]="false" e [responsive]="false" para controlar).
// Respeita a área segura do aparelho (safe-area-inset-bottom).`;
}
