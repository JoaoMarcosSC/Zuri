import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  output,
  signal,
} from '@angular/core';

/** Item clicável dentro de <zur-menu>. */
@Component({
  selector: 'zur-menu-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" class="item" role="menuitem" (click)="selected.emit()">
      <ng-content />
    </button>
  `,
  styles: `
    .item {
      display: flex;
      align-items: center;
      gap: var(--zur-space-sm);
      width: 100%;
      height: 40px;
      padding: 0 var(--zur-space-md);
      background: none;
      border: none;
      border-radius: var(--zur-radius-sm);
      font: var(--zur-font-body);
      font-size: 15px;
      color: var(--zur-ink);
      cursor: pointer;
      text-align: start;
      transition: background-color 100ms ease;
    }
    .item:hover {
      background: var(--zur-surface-soft);
    }
    .item:focus-visible {
      outline: none;
      box-shadow: var(--zur-focus-ring);
    }
  `,
})
export class ZurMenuItem {
  readonly selected = output<void>();
}

/**
 * Menu dropdown — gatilho via slot [zurMenuTrigger], painel no tier
 * único de sombra. Fecha ao clicar fora ou pressionar ESC.
 */
@Component({
  selector: 'zur-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'close()',
  },
  template: `
    <div class="trigger" (click)="toggle()">
      <ng-content select="[zurMenuTrigger]" />
    </div>
    @if (open()) {
      <div class="panel" role="menu">
        <ng-content />
      </div>
    }
  `,
  styles: `
    :host {
      position: relative;
      display: inline-block;
    }
    .trigger {
      display: inline-flex;
    }
    .panel {
      position: absolute;
      top: calc(100% + var(--zur-space-xs));
      inset-inline-end: 0;
      min-width: 200px;
      background: var(--zur-surface-raised);
      border: 1px solid var(--zur-hairline);
      border-radius: var(--zur-radius-md);
      box-shadow: var(--zur-shadow-float);
      padding: var(--zur-space-xs);
      display: flex;
      flex-direction: column;
      gap: 2px;
      z-index: 50;
    }
  `,
})
export class ZurMenu {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly open = signal(false);

  toggle(): void {
    this.open.update((open) => !open);
  }

  close(): void {
    this.open.set(false);
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }
}
