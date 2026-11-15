import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZurChat, ZurChatComposer, ZurChatDivider, ZurChatMessage, ZurChatTyping } from './chat';

@Component({
  imports: [ZurChat, ZurChatMessage, ZurChatDivider, ZurChatTyping, ZurChatComposer],
  template: `
    <zur-chat style="height: 300px">
      <zur-chat-divider>Hoje</zur-chat-divider>
      @for (m of messages(); track $index) {
        <zur-chat-message [from]="m.from" author="Ana" time="10:00">{{ m.text }}</zur-chat-message>
      }
      @if (typing()) {
        <zur-chat-typing name="Ana" />
      }
      <zur-chat-composer attach (send)="messages.update(l => [...l, { from: 'me', text: $event }])" />
    </zur-chat>
  `,
})
class Host {
  messages = signal<{ from: 'me' | 'them'; text: string }[]>([{ from: 'them', text: 'Oi! Como posso ajudar?' }]);
  typing = signal(true);
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const field = el.querySelector('textarea') as HTMLTextAreaElement;
  const type = async (text: string) => {
    field.value = text;
    field.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  };
  return { fixture, el, field, type };
}

describe('ZurChat', () => {
  it('mensagens ficam num role=log e o compositor fica fora dele', async () => {
    const { el } = await setup();
    const log = el.querySelector('[role=log]')!;
    expect(log.getAttribute('aria-label')).toBe('Mensagens');
    expect(log.querySelectorAll('zur-chat-message').length).toBe(1);
    expect(log.querySelector('zur-chat-composer')).toBeNull();
    expect(el.querySelector('zur-chat-message')?.getAttribute('data-from')).toBe('them');
  });

  it('indicador de digitação anuncia o nome', async () => {
    const { el } = await setup();
    expect(el.querySelector('zur-chat-typing .sr-only')?.textContent?.trim()).toBe('Ana está digitando…');
  });

  it('Enter envia, Shift+Enter não, e o botão fica desabilitado sem texto', async () => {
    const { fixture, el, field, type } = await setup();
    const send = el.querySelector('.send') as HTMLButtonElement;
    expect(send.disabled).toBe(true);
    await type('Minha jiboia está amarelando');
    expect(send.disabled).toBe(false);
    field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true, bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.messages().length).toBe(1);
    field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.messages().at(-1)).toEqual({ from: 'me', text: 'Minha jiboia está amarelando' });
    expect(field.value).toBe('');
    expect(el.querySelectorAll('zur-chat-message[data-from=me]').length).toBe(1);
  });

  it('mostra o botão de anexo com rótulo', async () => {
    const { el } = await setup();
    expect(el.querySelector('.icon-btn')?.getAttribute('aria-label')).toBe('Anexar arquivo');
  });
});
