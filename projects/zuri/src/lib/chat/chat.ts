import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  numberAttribute,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ZurAvatar } from '../avatar/avatar';
import { ZUR_I18N } from '../i18n/i18n';
import { ZUR_SR_ONLY } from '../shared/search';

/** Distância do fim (px) em que o chat ainda "gruda" no fim quando chega conteúdo. */
const STICK_THRESHOLD = 80;

/**
 * Contêiner de conversa. A área de mensagens é um `role="log"` que rola sozinha para
 * o fim quando chega mensagem nova ou o texto cresce (streaming) — a menos que o
 * usuário tenha subido para ler o histórico. O compositor vai por último.
 *
 * ```html
 * <zur-chat style="height: 480px">
 *   <zur-chat-divider>Hoje</zur-chat-divider>
 *   <zur-chat-message from="them" author="Ana" time="10:02">Oi! Como posso ajudar?</zur-chat-message>
 *   <zur-chat-message from="me" time="10:03">Minha jiboia está amarelando.</zur-chat-message>
 *   <zur-chat-typing name="Ana" />
 *   <zur-chat-composer (send)="enviar($event)" />
 * </zur-chat>
 * ```
 */
@Component({
  selector: 'zur-chat',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #log class="log" role="log" aria-live="polite" [attr.aria-label]="label() || i18n.chatLog" tabindex="0" (scroll)="onScroll()">
      <ng-content />
    </div>
    <ng-content select="zur-chat-composer" />
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-height: 0;
      background: var(--zur-canvas);
      border: 1px solid var(--zur-hairline);
      border-radius: var(--zur-radius-md);
      overflow: hidden;
    }
    .log {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: var(--zur-space-lg);
      overscroll-behavior: contain;
    }
    .log:focus-visible {
      outline: none;
      box-shadow: inset var(--zur-focus-ring);
    }
  `,
})
export class ZurChat {
  protected readonly i18n = inject(ZUR_I18N);
  readonly label = input('');

  private readonly log = viewChild.required<ElementRef<HTMLElement>>('log');
  private stick = true;

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const el = this.log().nativeElement;
      this.scrollToBottom();
      if (typeof MutationObserver === 'undefined') return;
      const observer = new MutationObserver(() => {
        if (this.stick) this.scrollToBottom();
      });
      observer.observe(el, { childList: true, subtree: true, characterData: true });
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  /** Rola até a última mensagem. */
  scrollToBottom(): void {
    const el = this.log().nativeElement;
    el.scrollTop = el.scrollHeight;
    this.stick = true;
  }

  protected onScroll(): void {
    const el = this.log().nativeElement;
    this.stick = el.scrollHeight - el.scrollTop - el.clientHeight < STICK_THRESHOLD;
  }
}

/** Uma mensagem. `continued` agrupa com a anterior do mesmo autor (esconde avatar e nome). */
@Component({
  selector: 'zur-chat-message',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ZurAvatar],
  host: {
    '[attr.data-from]': 'from()',
    '[class.continued]': 'continued()',
  },
  template: `
    @if (from() === 'them') {
      <div class="avatar-slot">
        @if (!continued()) {
          <zur-avatar size="sm" [name]="author()" [src]="avatar()" />
        }
      </div>
    }
    <div class="body">
      @if (!continued() && (author() || time())) {
        <div class="meta">
          @if (from() === 'them' && author()) {
            <span class="author">{{ author() }}</span>
          }
          @if (time()) {
            <time class="time">{{ time() }}</time>
          }
        </div>
      }
      <div class="bubble"><ng-content /></div>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      align-items: flex-end;
      gap: var(--zur-space-xs);
      max-width: min(80%, 560px);
      margin-top: var(--zur-space-sm);
    }
    :host(.continued) {
      margin-top: 2px;
    }
    :host([data-from='me']) {
      align-self: flex-end;
      justify-content: flex-end;
    }
    .avatar-slot {
      width: 32px;
      flex-shrink: 0;
    }
    .body {
      display: grid;
      gap: 4px;
      min-width: 0;
    }
    :host([data-from='me']) .body {
      justify-items: end;
    }
    .meta {
      display: flex;
      gap: var(--zur-space-xs);
      align-items: baseline;
      padding: 0 var(--zur-space-xs);
    }
    .author {
      font: var(--zur-font-caption);
      font-weight: 700;
      color: var(--zur-ink);
    }
    .time {
      font: var(--zur-font-caption);
      font-size: 12px;
      color: var(--zur-muted);
    }
    .bubble {
      padding: 10px 14px;
      font: var(--zur-font-body);
      font-size: 15px;
      line-height: 1.5;
      color: var(--zur-ink);
      background: var(--zur-surface-soft);
      border: 1px solid var(--zur-hairline-soft);
      border-radius: var(--zur-radius-md);
      border-bottom-left-radius: var(--zur-radius-xs);
      white-space: pre-line;
      overflow-wrap: anywhere;
    }
    :host([data-from='me']) .bubble {
      background: var(--zur-primary-soft);
      border-color: transparent;
      color: var(--zur-on-primary-soft);
      border-bottom-left-radius: var(--zur-radius-md);
      border-bottom-right-radius: var(--zur-radius-xs);
    }
  `,
})
export class ZurChatMessage {
  readonly from = input<'me' | 'them'>('them');
  readonly author = input('');
  readonly avatar = input<string | null>(null);
  /** Texto curto de horário, já formatado ("10:42"). */
  readonly time = input('');
  readonly continued = input(false, { transform: booleanAttribute });
}

/** Separador de data/assunto entre grupos de mensagens. */
@Component({
  selector: 'zur-chat-divider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span><ng-content /></span>`,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: var(--zur-space-sm);
      margin: var(--zur-space-md) 0 var(--zur-space-xs);
      font: var(--zur-font-caption);
      color: var(--zur-muted);
    }
    :host::before,
    :host::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--zur-hairline-soft);
    }
  `,
})
export class ZurChatDivider {}

/** Indicador "digitando…" com três pontos (parados se o usuário pede menos movimento). */
@Component({
  selector: 'zur-chat-typing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ZurAvatar],
  template: `
    <zur-avatar size="sm" [name]="name()" [src]="avatar()" />
    <div class="bubble" aria-hidden="true"><span></span><span></span><span></span></div>
    <span class="sr-only">{{ i18n.typing(name()) }}</span>
  `,
  styles: [
    ZUR_SR_ONLY,
    `
    :host {
      display: flex;
      align-items: flex-end;
      gap: var(--zur-space-xs);
      margin-top: var(--zur-space-sm);
    }
    .bubble {
      display: inline-flex;
      gap: 4px;
      padding: 14px 16px;
      background: var(--zur-surface-soft);
      border: 1px solid var(--zur-hairline-soft);
      border-radius: var(--zur-radius-md);
      border-bottom-left-radius: var(--zur-radius-xs);
    }
    .bubble span {
      width: 7px;
      height: 7px;
      border-radius: var(--zur-radius-full);
      background: var(--zur-muted);
      animation: zur-typing 1.2s ease-in-out infinite;
    }
    .bubble span:nth-child(2) {
      animation-delay: 0.15s;
    }
    .bubble span:nth-child(3) {
      animation-delay: 0.3s;
    }
    @keyframes zur-typing {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
      30% { transform: translateY(-4px); opacity: 1; }
    }
    @media (prefers-reduced-motion: reduce) {
      .bubble span {
        animation: none;
      }
    }
  `,
  ],
})
export class ZurChatTyping {
  protected readonly i18n = inject(ZUR_I18N);
  readonly name = input.required<string>();
  readonly avatar = input<string | null>(null);
}

/**
 * Campo de envio: cresce com o texto até `maxRows`, Enter envia, Shift+Enter quebra
 * linha. Com `attach`, mostra o botão de anexo e emite os arquivos escolhidos.
 */
@Component({
  selector: 'zur-chat-composer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (attach()) {
      <button type="button" class="icon-btn" [attr.aria-label]="i18n.attachFile" [disabled]="disabled()" (click)="files.click()">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21 11-8.5 8.5a5 5 0 0 1-7-7L14 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L15 7" /></svg>
      </button>
      <input #files type="file" multiple hidden [accept]="accept()" (change)="onFiles($event)" />
    }
    <textarea
      #field
      class="field"
      rows="1"
      [attr.aria-label]="placeholder() || i18n.messagePlaceholder"
      [placeholder]="placeholder() || i18n.messagePlaceholder"
      [value]="text()"
      [disabled]="disabled()"
      (input)="onInput($event)"
      (keydown)="onKeydown($event)"
    ></textarea>
    <button type="button" class="send" [attr.aria-label]="i18n.sendMessage" [disabled]="disabled() || !canSend()" (click)="submit()">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5m0 0-6 6m6-6 6 6" /></svg>
    </button>
  `,
  styles: `
    :host {
      display: flex;
      align-items: flex-end;
      gap: var(--zur-space-xs);
      padding: var(--zur-space-sm);
      border-top: 1px solid var(--zur-hairline);
      background: var(--zur-canvas);
    }
    .field {
      flex: 1;
      min-height: 44px;
      box-sizing: border-box;
      padding: 10px var(--zur-space-md);
      font: var(--zur-font-body);
      color: var(--zur-ink);
      background: var(--zur-surface-soft);
      border: 1px solid transparent;
      border-radius: 22px;
      resize: none;
      /* A barra só aparece quando passa de maxRows (ver resize()). */
      overflow-y: hidden;
    }
    .field::placeholder {
      color: var(--zur-muted);
    }
    .field:focus {
      outline: none;
      background: var(--zur-canvas);
      border-color: var(--zur-ink);
    }
    .send,
    .icon-btn {
      width: 44px;
      height: 44px;
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      border-radius: var(--zur-radius-full);
      cursor: pointer;
    }
    .send {
      background: var(--zur-primary);
      color: var(--zur-on-primary);
    }
    .send:hover:not(:disabled) {
      background: var(--zur-primary-hover);
    }
    .send:disabled {
      background: var(--zur-surface-strong);
      color: var(--zur-muted);
      cursor: not-allowed;
    }
    .icon-btn {
      background: transparent;
      color: var(--zur-body);
    }
    .icon-btn:hover:not(:disabled) {
      background: var(--zur-surface-strong);
      color: var(--zur-ink);
    }
    .send:focus-visible,
    .icon-btn:focus-visible {
      outline: none;
      box-shadow: var(--zur-focus-ring);
    }
  `,
})
export class ZurChatComposer {
  protected readonly i18n = inject(ZUR_I18N);

  readonly placeholder = input('');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly attach = input(false, { transform: booleanAttribute });
  readonly accept = input('');
  /** Linhas máximas antes de rolar. */
  readonly maxRows = input(6, { transform: numberAttribute });

  readonly send = output<string>();
  readonly attached = output<File[]>();

  protected readonly text = signal('');
  protected readonly canSend = computed(() => this.text().trim().length > 0);
  private readonly field = viewChild.required<ElementRef<HTMLTextAreaElement>>('field');

  protected onInput(event: Event): void {
    this.text.set((event.target as HTMLTextAreaElement).value);
    this.resize();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      this.submit();
    }
  }

  submit(): void {
    const message = this.text().trim();
    if (!message || this.disabled()) return;
    this.send.emit(message);
    this.text.set('');
    const field = this.field().nativeElement;
    field.value = '';
    this.resize();
    field.focus();
  }

  protected onFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.attached.emit(Array.from(input.files));
    input.value = '';
  }

  private resize(): void {
    const field = this.field().nativeElement;
    const style = getComputedStyle(field);
    const lineHeight = parseFloat(style.lineHeight) || 24;
    // box-sizing: border-box → soma a borda ao scrollHeight, senão sobra 1–2px e surge a barra.
    const border = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const max = lineHeight * this.maxRows() + padding + border;
    field.style.height = 'auto';
    const wanted = field.scrollHeight + border;
    field.style.height = `${Math.min(wanted, max)}px`;
    field.style.overflowY = wanted > max ? 'auto' : 'hidden';
  }
}
