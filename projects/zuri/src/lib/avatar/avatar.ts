import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type ZurAvatarSize = 'sm' | 'md' | 'lg';

/** Avatar circular com imagem ou iniciais derivadas do nome. */
@Component({
  selector: 'zur-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (src()) {
      <img [src]="src()" [alt]="name()" />
    } @else {
      <span aria-hidden="true">{{ initials() }}</span>
    }
  `,
  host: {
    '[attr.data-size]': 'size()',
    '[attr.title]': 'name()',
  },
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--zur-radius-full);
      background: var(--zur-primary-soft);
      color: var(--zur-on-primary-soft);
      font: var(--zur-font-badge);
      overflow: hidden;
      flex-shrink: 0;
      user-select: none;
    }
    :host([data-size='sm']) { width: 32px; height: 32px; font-size: 12px; }
    :host([data-size='md']) { width: 40px; height: 40px; font-size: 14px; }
    :host([data-size='lg']) { width: 56px; height: 56px; font-size: 18px; }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    :host-context([data-theme='dark']) {
      color: var(--zur-primary);
    }
  `,
})
export class ZurAvatar {
  readonly name = input('');
  readonly src = input<string | null>(null);
  readonly size = input<ZurAvatarSize>('md');

  protected readonly initials = computed(() => {
    const parts = this.name().trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return '?';
    }
    const first = parts[0][0] ?? '';
    const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : '';
    return (first + last).toUpperCase();
  });
}
