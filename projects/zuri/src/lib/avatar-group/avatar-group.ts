import { ChangeDetectionStrategy, Component, computed, inject, input, numberAttribute } from '@angular/core';
import { ZurAvatar, ZurAvatarSize } from '../avatar/avatar';
import { ZUR_I18N } from '../i18n/i18n';

export interface ZurAvatarPerson {
  name: string;
  src?: string | null;
}

/**
 * Pilha de avatares sobrepostos com contador do excedente ("+3"). Mostra os `max`
 * primeiros; o resto vira o contador, que também é anunciado por extenso.
 *
 * ```html
 * <zur-avatar-group [people]="equipe" [max]="4" />
 * ```
 */
@Component({
  selector: 'zur-avatar-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ZurAvatar],
  host: { role: 'group', '[attr.aria-label]': 'label() || null', '[attr.data-size]': 'size()' },
  template: `
    @for (person of visible(); track $index) {
      <zur-avatar class="item" [name]="person.name" [src]="person.src ?? null" [size]="size()" />
    }
    @if (extra() > 0) {
      <span class="item more" [title]="i18n.moreAvatars(extra())">
        <span aria-hidden="true">+{{ extra() }}</span>
        <span class="sr-only">{{ i18n.moreAvatars(extra()) }}</span>
      </span>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
    }
    .item {
      box-shadow: 0 0 0 2px var(--zur-canvas);
    }
    .item + .item {
      margin-inline-start: -8px;
    }
    .more {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--zur-radius-full);
      background: var(--zur-surface-strong);
      color: var(--zur-ink);
      font: var(--zur-font-badge);
      flex-shrink: 0;
    }
    :host([data-size='sm']) .more { width: 32px; height: 32px; font-size: 12px; }
    :host([data-size='md']) .more { width: 40px; height: 40px; font-size: 14px; }
    :host([data-size='lg']) .more { width: 56px; height: 56px; font-size: 18px; }
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
  `,
})
export class ZurAvatarGroup {
  protected readonly i18n = inject(ZUR_I18N);

  readonly people = input<ZurAvatarPerson[]>([]);
  readonly max = input(4, { transform: numberAttribute });
  readonly size = input<ZurAvatarSize>('md');
  readonly label = input('');

  protected readonly visible = computed(() => this.people().slice(0, Math.max(0, this.max())));
  protected readonly extra = computed(() => Math.max(0, this.people().length - this.visible().length));
}
