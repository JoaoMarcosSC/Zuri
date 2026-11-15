import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  ZurButton,
  ZurChat,
  ZurChatComposer,
  ZurChatDivider,
  ZurChatMessage,
  ZurChatTyping,
  ZurCommand,
  ZurCommandPalette,
  ZurKanban,
  ZurKanbanCard,
  ZurKanbanColumn,
  ZurKanbanMove,
  ZurNotification,
  ZurNotificationCenter,
  ZurThemeService,
  ZurToastService,
} from '@juau/zuri';
import { CodeBlock } from '../../shared/code-block/code-block';

interface Msg {
  from: 'me' | 'them';
  text: string;
  time: string;
}

/** Seções de Chat, Command palette, Notificações e Kanban da página Componentes. */
@Component({
  selector: 'docs-patterns',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CodeBlock,
    ZurButton,
    ZurChat,
    ZurChatMessage,
    ZurChatDivider,
    ZurChatTyping,
    ZurChatComposer,
    ZurCommandPalette,
    ZurNotificationCenter,
    ZurKanban,
    ZurKanbanCard,
  ],
  templateUrl: './patterns.html',
  styleUrl: './componentes.css',
  styles: `
    :host {
      max-width: none;
      margin: 0;
    }
    .demo-chat {
      padding: 0;
      overflow: hidden;
    }
    .demo-chat zur-chat {
      width: 100%;
      height: 480px;
      border: none;
      border-radius: 0;
    }
    .demo-notifications {
      justify-content: flex-end;
      align-items: center;
    }
    .demo-kanban {
      display: block;
      padding: var(--zur-space-lg);
    }
    .kanban-title {
      display: block;
      color: var(--zur-ink);
      font-weight: 700;
    }
    .kanban-meta {
      font: var(--zur-font-caption);
      color: var(--zur-muted);
    }
    kbd {
      padding: 1px 6px;
      border: 1px solid var(--zur-hairline);
      border-bottom-width: 2px;
      border-radius: var(--zur-radius-xs);
      background: var(--zur-canvas);
      font: var(--zur-font-caption);
    }
  `,
})
export class Patterns {
  private readonly toast = inject(ZurToastService);
  private readonly theme = inject(ZurThemeService);
  private readonly router = inject(Router);
  private readonly timers: ReturnType<typeof setTimeout>[] = [];

  constructor() {
    inject(DestroyRef).onDestroy(() => this.timers.forEach((t) => clearTimeout(t)));
  }

  // ── Chat ──
  protected readonly messages = signal<Msg[]>([
    { from: 'them', text: 'Oi! Sou a Ana, da Casa Verde 🌿', time: '10:02' },
    { from: 'them', text: 'Como posso ajudar com suas plantas hoje?', time: '10:02' },
    { from: 'me', text: 'As folhas da minha jiboia estão ficando amarelas.', time: '10:03' },
  ]);
  protected readonly typing = signal(false);

  private readonly replies = [
    'Folha amarela costuma ser excesso de água. Deixe o substrato secar uns 3 cm antes de regar de novo e confira se o vaso tem furo de drenagem.',
    'Se as folhas novas também amarelarem, pode ser falta de luz. A jiboia gosta de claridade, mas sem sol direto.',
    'Quer que eu separe um adubo de folhagem para você? Ele chega junto com o próximo pedido.',
  ];
  private replyIndex = 0;

  private now(): string {
    return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  protected send(text: string): void {
    this.messages.update((l) => [...l, { from: 'me', text, time: this.now() }]);
    this.typing.set(true);
    const reply = this.replies[this.replyIndex++ % this.replies.length];
    this.timers.push(
      setTimeout(() => {
        this.typing.set(false);
        this.messages.update((l) => [...l, { from: 'them', text: '', time: this.now() }]);
        this.stream(reply.split(' '), 1);
      }, 1100),
    );
  }

  /** Simula a resposta chegando aos poucos, como num assistente de IA. */
  private stream(words: string[], count: number): void {
    this.messages.update((l) => {
      const copy = [...l];
      copy[copy.length - 1] = { ...copy[copy.length - 1], text: words.slice(0, count).join(' ') };
      return copy;
    });
    if (count < words.length) this.timers.push(setTimeout(() => this.stream(words, count + 1), 55));
  }

  protected attached(files: File[]): void {
    this.toast.show(`${files.length} anexo(s) pronto(s) para enviar.`);
  }

  // ── Command palette ──
  protected readonly paletteOpen = signal(false);
  protected readonly commands: ZurCommand[] = [
    { id: 'componentes', label: 'Ir para Componentes', group: 'Páginas', icon: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z' },
    { id: 'tokens', label: 'Ir para Tokens', group: 'Páginas', keywords: ['cores', 'tipografia'], icon: 'M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z' },
    { id: 'layouts', label: 'Ir para Layouts', group: 'Páginas', icon: 'M3 4h18v16H3zM9 4v16M9 9h12' },
    { id: 'tema', label: 'Alternar tema', group: 'Ações', description: 'Claro ou escuro', shortcut: ['T'], icon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z' },
    { id: 'pedido', label: 'Novo pedido', group: 'Ações', keywords: ['comprar'], shortcut: ['N'], icon: 'M12 5v14M5 12h14' },
    { id: 'ajuda', label: 'Falar com a Ana', group: 'Ajuda', description: 'Atendimento sobre cuidados com plantas', icon: 'M4 5h16v11H8l-4 4V5Z' },
  ];

  protected runCommand(command: ZurCommand): void {
    switch (command.id) {
      case 'componentes':
      case 'tokens':
      case 'layouts':
        void this.router.navigate(['/', command.id]);
        break;
      case 'tema':
        this.theme.toggle();
        break;
      default:
        this.toast.show(`Comando: ${command.label}`);
    }
  }

  // ── Notificações ──
  private readonly today = new Date();
  protected readonly notifications = signal<ZurNotification[]>([
    { id: '1', title: 'Seu pedido saiu para entrega', body: 'Monstera deliciosa · chega hoje até 18h', date: this.today, time: 'há 5 min', read: false, kind: 'success' },
    { id: '2', title: 'Hora de regar a jiboia', body: 'Última rega há 6 dias', date: this.today, time: 'há 2 h', read: false },
    { id: '3', title: 'Cupom VERDE10 expira amanhã', body: '10% em vasos e cachepôs', date: new Date(this.today.getTime() - 86_400_000), time: 'ontem', read: true, kind: 'warning' },
    { id: '4', title: 'Avalie sua compra', date: new Date(this.today.getTime() - 3 * 86_400_000), time: 'há 3 dias', read: true },
  ]);

  protected markRead(n: ZurNotification): void {
    this.notifications.update((l) => l.map((i) => (i.id === n.id ? { ...i, read: true } : i)));
  }

  protected markAllRead(): void {
    this.notifications.update((l) => l.map((i) => ({ ...i, read: true })));
  }

  protected addNotification(): void {
    this.notifications.update((l) => [
      { id: crypto.randomUUID(), title: 'Nova planta no estoque: Calathea', body: 'Você pediu para ser avisado', date: new Date(), time: 'agora', read: false },
      ...l,
    ]);
  }

  // ── Kanban ──
  protected readonly board = signal<ZurKanbanColumn<{ id: string; title: string; client: string }>[]>([
    {
      id: 'novos',
      title: 'Novos pedidos',
      items: [
        { id: '1042', title: 'Monstera deliciosa', client: 'Ana' },
        { id: '1043', title: 'Kit suculentas', client: 'Bruno' },
      ],
    },
    { id: 'separando', title: 'Separando', items: [{ id: '1039', title: 'Orquídea branca', client: 'Carla' }] },
    { id: 'enviados', title: 'Enviados', items: [{ id: '1031', title: 'Jiboia em cachepô', client: 'Diego' }] },
  ]);
  private nextOrder = 1044;

  protected onMoved(move: ZurKanbanMove): void {
    const to = this.board().find((c) => c.id === move.to)?.title;
    if (move.from !== move.to) this.toast.show(`Pedido #${move.item.id} movido para ${to}.`, 'success');
  }

  protected addOrder(column: string): void {
    const id = String(this.nextOrder++);
    this.board.update((cols) =>
      cols.map((c) => (c.id === column ? { ...c, items: [...c.items, { id, title: 'Pedido novo', client: 'Cliente' }] } : c)),
    );
  }

  // ── Código ──
  protected readonly codeChat = `<zur-chat style="height: 480px">
  <zur-chat-divider>Hoje</zur-chat-divider>
  @for (m of mensagens(); track m.id; let i = $index) {
    <zur-chat-message [from]="m.from" [author]="m.autor" [time]="m.hora"
      [continued]="i > 0 && mensagens()[i - 1].from === m.from">{{ m.texto }}</zur-chat-message>
  }
  @if (digitando()) {
    <zur-chat-typing name="Ana" />
  }
  <zur-chat-composer attach (send)="enviar($event)" (attached)="anexar($event)" />
</zur-chat>`;

  protected readonly codePalette = `<!-- Abre com Ctrl+K / ⌘K, ou por [(open)] -->
<zur-command-palette [commands]="comandos" (selected)="executar($event)" />

comandos: ZurCommand[] = [
  { id: 'tokens', label: 'Ir para Tokens', group: 'Páginas', keywords: ['cores'] },
  { id: 'tema', label: 'Alternar tema', group: 'Ações', shortcut: ['T'], icon: 'M21 12.8A9…' },
];`;

  protected readonly codeNotifications = `<zur-notification-center
  [notifications]="avisos()"
  (read)="marcarLida($event)"
  (readAll)="marcarTodas()"
/>

// { id, title, body?, date: Date, time?: 'há 5 min', read: boolean, kind?: 'success' | … }`;

  protected readonly codeKanban = `<zur-kanban [(columns)]="quadro" addLabel="Adicionar pedido"
  (moved)="salvar($event)" (add)="novoPedido($event)">
  <ng-template zurKanbanCard let-item>
    <strong>{{ item.title }}</strong>
    <span>#{{ item.id }} · {{ item.client }}</span>
  </ng-template>
</zur-kanban>`;
}
