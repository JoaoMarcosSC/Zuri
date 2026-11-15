import { ChangeDetectionStrategy, Component, computed, inject, input, model, output } from '@angular/core';
import { ZurEmptyState } from '../empty-state/empty-state';
import { ZUR_I18N } from '../i18n/i18n';
import { ZurPopover, ZurPopoverPlacement, ZurPopoverTrigger } from '../popover/popover';

export type ZurNotificationKind = 'info' | 'success' | 'warning' | 'error';

export interface ZurNotification {
  id: string;
  title: string;
  body?: string;
  /** Quando aconteceu — decide o grupo (Hoje / Anteriores). */
  date: Date;
  /** Texto curto de horário já formatado ("há 5 min", "ontem"). */
  time?: string;
  read: boolean;
  kind?: ZurNotificationKind;
}

/**
 * Sino com contador de não lidas que abre um painel com as notificações agrupadas
 * em Hoje e Anteriores. Os dados vêm de fora: o componente avisa `read` (clique em
 * um item) e `readAll`, e quem usa atualiza a lista.
 *
 * ```html
 * <zur-notification-center [notifications]="avisos()"
 *   (read)="marcarLida($event)" (readAll)="marcarTodas()" />
 * ```
 */
@Component({
  selector: 'zur-notification-center',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ZurPopover, ZurPopoverTrigger, ZurEmptyState],
  template: `
    <zur-popover [placement]="placement()" [label]="i18n.notifications" [(open)]="open">
      <button type="button" class="bell" zurPopoverTrigger [attr.aria-label]="i18n.unreadNotifications(unread())">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" /></svg>
        @if (unread() > 0) {
          <span class="count" aria-hidden="true">{{ unread() > 9 ? '9+' : unread() }}</span>
        }
      </button>

      <div class="inner">
        <div class="head">
          <h2 class="title">{{ i18n.notifications }}</h2>
          @if (unread() > 0) {
            <button type="button" class="mark-all" (click)="readAll.emit()">{{ i18n.markAllRead }}</button>
          }
        </div>
        @for (group of groups(); track group.name) {
          <h3 class="group">{{ group.name }}</h3>
          <ul class="list">
            @for (item of group.items; track item.id) {
              <li>
                <button type="button" class="item" [class.unread]="!item.read" [attr.data-kind]="item.kind ?? 'info'" (click)="onItem(item)">
                  <span class="dot" aria-hidden="true"></span>
                  <span class="text">
                    <span class="item-title">{{ item.title }}</span>
                    @if (item.body) {
                      <span class="body">{{ item.body }}</span>
                    }
                    @if (item.time) {
                      <span class="time">{{ item.time }}</span>
                    }
                  </span>
                </button>
              </li>
            }
          </ul>
        } @empty {
          <zur-empty-state [title]="i18n.noNotifications" [description]="emptyDescription()">
            <svg zurEmptyIcon viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" /></svg>
          </zur-empty-state>
        }
      </div>
    </zur-popover>
  `,
  styles: `
    :host {
      display: inline-block;
    }
    .bell {
      position: relative;
      width: 44px;
      height: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--zur-hairline);
      border-radius: var(--zur-radius-full);
      background: var(--zur-canvas);
      color: var(--zur-ink);
      cursor: pointer;
    }
    .bell:hover {
      background: var(--zur-surface-soft);
    }
    .bell:focus-visible {
      outline: none;
      box-shadow: var(--zur-focus-ring);
    }
    .count {
      position: absolute;
      top: -4px;
      inset-inline-end: -4px;
      min-width: 20px;
      height: 20px;
      padding: 0 5px;
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--zur-canvas);
      border-radius: var(--zur-radius-full);
      background: var(--zur-primary);
      color: var(--zur-on-primary);
      font: var(--zur-font-badge);
      font-size: 11px;
    }
    .inner {
      width: min(340px, 84vw);
      max-height: 420px;
      overflow-y: auto;
    }
    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--zur-space-sm);
      margin-bottom: var(--zur-space-xs);
    }
    .title {
      margin: 0;
      font: var(--zur-font-title);
      font-size: 17px;
      color: var(--zur-ink);
    }
    .mark-all {
      padding: 4px 8px;
      border: none;
      border-radius: var(--zur-radius-sm);
      background: transparent;
      font: var(--zur-font-caption);
      font-weight: 700;
      color: var(--zur-ink);
      text-decoration: underline;
      text-underline-offset: 3px;
      cursor: pointer;
    }
    .mark-all:hover {
      background: var(--zur-surface-soft);
    }
    .mark-all:focus-visible {
      outline: none;
      box-shadow: var(--zur-focus-ring);
    }
    .group {
      margin: var(--zur-space-sm) 0 var(--zur-space-xxs);
      font: var(--zur-font-caption);
      font-size: 11px;
      letter-spacing: 0.4px;
      text-transform: uppercase;
      color: var(--zur-muted);
    }
    .list {
      display: grid;
      gap: 2px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .item {
      width: 100%;
      display: flex;
      gap: var(--zur-space-sm);
      padding: var(--zur-space-sm);
      border: none;
      border-radius: var(--zur-radius-sm);
      background: transparent;
      text-align: start;
      cursor: pointer;
    }
    .item:hover {
      background: var(--zur-surface-soft);
    }
    .item:focus-visible {
      outline: none;
      box-shadow: var(--zur-focus-ring);
    }
    .dot {
      width: 8px;
      height: 8px;
      margin-top: 7px;
      flex-shrink: 0;
      border-radius: var(--zur-radius-full);
      background: transparent;
    }
    .item.unread .dot {
      background: var(--zur-primary);
    }
    .item.unread[data-kind='success'] .dot { background: var(--zur-success); }
    .item.unread[data-kind='warning'] .dot { background: var(--zur-warning); }
    .item.unread[data-kind='error'] .dot { background: var(--zur-error); }
    .text {
      display: grid;
      gap: 2px;
      min-width: 0;
    }
    .item-title {
      font: var(--zur-font-body-sm);
      color: var(--zur-body);
    }
    .item.unread .item-title {
      font-weight: 700;
      color: var(--zur-ink);
    }
    .body {
      font: var(--zur-font-caption);
      color: var(--zur-muted);
    }
    .time {
      font: var(--zur-font-caption);
      font-size: 12px;
      color: var(--zur-muted);
    }
    zur-empty-state {
      padding: var(--zur-space-lg) var(--zur-space-sm);
    }
  `,
})
export class ZurNotificationCenter {
  protected readonly i18n = inject(ZUR_I18N);

  readonly notifications = input<ZurNotification[]>([]);
  readonly placement = input<ZurPopoverPlacement>('bottom-end');
  readonly open = model(false);
  /** Texto abaixo de "Nada por aqui" quando a lista está vazia. */
  readonly emptyDescription = input('');

  /** Clique em uma notificação (para marcá-la como lida e navegar). */
  readonly read = output<ZurNotification>();
  readonly readAll = output<void>();

  protected readonly unread = computed(() => this.notifications().filter((n) => !n.read).length);

  protected readonly groups = computed(() => {
    const now = new Date();
    const isToday = (d: Date) =>
      d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
    const sorted = [...this.notifications()].sort((a, b) => b.date.getTime() - a.date.getTime());
    const today = sorted.filter((n) => isToday(n.date));
    const earlier = sorted.filter((n) => !isToday(n.date));
    return [
      { name: this.i18n.today, items: today },
      { name: this.i18n.earlier, items: earlier },
    ].filter((g) => g.items.length > 0);
  });

  protected onItem(item: ZurNotification): void {
    this.read.emit(item);
  }
}
