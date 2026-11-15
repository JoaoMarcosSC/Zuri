import { Component, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';
import { ZurButton } from '../lib/button/button';
import {
  ZurChat,
  ZurChatComposer,
  ZurChatDivider,
  ZurChatMessage,
  ZurChatTyping,
} from '../lib/chat/chat';
import { ZurCommand, ZurCommandPalette } from '../lib/command-palette/command-palette';
import { ZurKanban, ZurKanbanCard, ZurKanbanColumn } from '../lib/kanban/kanban';
import { ZurNotification, ZurNotificationCenter } from '../lib/notifications/notification-center';

interface Msg {
  from: 'me' | 'them';
  text: string;
  time: string;
}

/** Atendimento da loja com resposta simulada em streaming. */
@Component({
  selector: 'demo-chat',
  imports: [ZurChat, ZurChatMessage, ZurChatDivider, ZurChatTyping, ZurChatComposer],
  template: `
    <zur-chat style="height: 460px; max-width: 520px">
      <zur-chat-divider>Hoje</zur-chat-divider>
      @for (m of messages(); track $index; let i = $index) {
        <zur-chat-message
          [from]="m.from"
          [author]="m.from === 'them' ? 'Ana · Casa Verde' : ''"
          [time]="m.time"
          [continued]="i > 0 && messages()[i - 1].from === m.from"
        >{{ m.text }}</zur-chat-message>
      }
      @if (typing()) {
        <zur-chat-typing name="Ana" />
      }
      <zur-chat-composer attach (send)="send($event)" />
    </zur-chat>
  `,
})
class DemoChat {
  protected readonly messages = signal<Msg[]>([
    { from: 'them', text: 'Oi! Sou a Ana, da Casa Verde 🌿', time: '10:02' },
    { from: 'them', text: 'Como posso ajudar com suas plantas hoje?', time: '10:02' },
    { from: 'me', text: 'As folhas da minha jiboia estão ficando amarelas.', time: '10:03' },
  ]);
  protected readonly typing = signal(false);

  private now(): string {
    return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  protected send(text: string): void {
    this.messages.update((l) => [...l, { from: 'me', text, time: this.now() }]);
    this.typing.set(true);
    const reply =
      'Folha amarela costuma ser excesso de água. Deixe o substrato secar uns 3 cm antes de regar de novo e veja se o vaso tem furo de drenagem.';
    setTimeout(() => {
      this.typing.set(false);
      this.messages.update((l) => [...l, { from: 'them', text: '', time: this.now() }]);
      const words = reply.split(' ');
      let i = 0;
      const timer = setInterval(() => {
        i++;
        this.messages.update((l) => {
          const copy = [...l];
          copy[copy.length - 1] = { ...copy[copy.length - 1], text: words.slice(0, i).join(' ') };
          return copy;
        });
        if (i >= words.length) clearInterval(timer);
      }, 60);
    }, 1200);
  }
}

const meta: Meta = {
  title: 'Padrões',
  decorators: [
    moduleMetadata({
      imports: [
        DemoChat,
        ZurButton,
        ZurCommandPalette,
        ZurNotificationCenter,
        ZurKanban,
        ZurKanbanCard,
      ],
    }),
  ],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

export const Chat: Story = {
  render: () => ({ template: `<demo-chat />` }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox', { name: 'Escreva uma mensagem…' }), 'E a rega?{enter}');
    await expect(canvas.getByText('E a rega?')).toBeTruthy();
  },
};

const commands: ZurCommand[] = [
  { id: 'plantas', label: 'Ver plantas', group: 'Páginas', icon: 'M12 22V12m0 0C12 7 8 4 3 4c0 5 4 8 9 8Zm0 0c0-5 4-8 9-8 0 5-4 8-9 8Z' },
  { id: 'pedidos', label: 'Meus pedidos', group: 'Páginas', keywords: ['compras'], icon: 'M6 7h12l-1 13H7L6 7Zm3 0V5a3 3 0 0 1 6 0v2' },
  { id: 'novo', label: 'Novo pedido', group: 'Ações', shortcut: ['N'], icon: 'M12 5v14M5 12h14' },
  { id: 'tema', label: 'Alternar tema', group: 'Ações', description: 'Claro ou escuro', shortcut: ['Ctrl', 'J'], icon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z' },
  { id: 'ajuda', label: 'Falar com a Ana', group: 'Ajuda', description: 'Atendimento sobre cuidados', icon: 'M4 5h16v11H8l-4 4V5Z' },
];

export const CommandPalette: Story = {
  name: 'Command palette',
  render: () => ({
    props: { open: false, commands, ultimo: '' },
    template: `
      <button zur-button variant="secondary" (click)="open = true">Abrir paleta (Ctrl+K)</button>
      @if (ultimo) { <p style="color:var(--zur-body)">Executado: <strong>{{ ultimo }}</strong></p> }
      <zur-command-palette [commands]="commands" [(open)]="open" (selected)="ultimo = $event.label" />
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Abrir paleta/ }));
    await expect(canvas.getByRole('dialog', { name: 'Paleta de comandos' })).toBeTruthy();
  },
};

const today = new Date();
const notifications: ZurNotification[] = [
  { id: '1', title: 'Seu pedido saiu para entrega', body: 'Monstera deliciosa · chega hoje', date: today, time: 'há 5 min', read: false, kind: 'success' },
  { id: '2', title: 'Hora de regar a jiboia', body: 'Última rega há 6 dias', date: today, time: 'há 2 h', read: false },
  { id: '3', title: 'Cupom VERDE10 expira amanhã', date: new Date(today.getTime() - 86400000), time: 'ontem', read: true, kind: 'warning' },
];

export const Notifications: Story = {
  name: 'Central de notificações',
  render: () => ({
    props: { notifications },
    template: `
      <div style="display:flex; justify-content:flex-end; max-width:520px; min-height:380px;">
        <zur-notification-center
          [notifications]="notifications"
          (read)="notifications = notifications.map(n => n.id === $event.id ? { ...n, read: true } : n)"
          (readAll)="notifications = notifications.map(n => ({ ...n, read: true }))"
        />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Notificações, 2 não lidas/ }));
    await expect(canvas.getByRole('dialog', { name: 'Notificações' })).toBeTruthy();
  },
};

const board: ZurKanbanColumn[] = [
  { id: 'novo', title: 'Novos pedidos', items: [{ id: 'p1', title: 'Monstera · Ana' }, { id: 'p2', title: 'Kit suculentas · Bruno' }] },
  { id: 'separando', title: 'Separando', items: [{ id: 'p3', title: 'Orquídea · Carla' }] },
  { id: 'enviado', title: 'Enviados', items: [{ id: 'p4', title: 'Jiboia · Diego' }] },
];

export const Kanban: Story = {
  render: () => ({
    props: { board },
    template: `
      <zur-kanban [(columns)]="board" addLabel="Adicionar pedido">
        <ng-template zurKanbanCard let-item>
          <strong style="display:block; color:var(--zur-ink)">{{ item.title }}</strong>
          <span style="font:var(--zur-font-caption); color:var(--zur-muted)">#{{ item.id }}</span>
        </ng-template>
      </zur-kanban>
    `,
  }),
};
