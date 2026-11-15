import {
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  effect,
  input,
  model,
  signal,
} from '@angular/core';

/** Painel individual dentro de <zur-tabs>. */
@Component({
  selector: 'zur-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (active()) {
      <div class="pane" role="tabpanel"><ng-content /></div>
    }
  `,
  styles: `
    .pane {
      padding-top: var(--zur-space-lg);
      font: var(--zur-font-body);
      color: var(--zur-body);
    }
  `,
})
export class ZurTab {
  readonly label = input.required<string>();
  readonly active = signal(false);
}

/** Tabs com sublinhado 2px ink na aba ativa (Airbnb product-tabs). */
@Component({
  selector: 'zur-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bar" role="tablist">
      @for (tab of tabs(); track $index) {
        <button
          type="button"
          class="tab"
          role="tab"
          [class.active]="$index === index()"
          [attr.aria-selected]="$index === index()"
          (click)="index.set($index)"
        >
          {{ tab.label() }}
        </button>
      }
    </div>
    <ng-content />
  `,
  styles: `
    :host {
      display: block;
    }
    .bar {
      display: flex;
      gap: var(--zur-space-lg);
      border-bottom: 1px solid var(--zur-hairline);
    }
    .tab {
      background: none;
      border: none;
      padding: var(--zur-space-sm) var(--zur-space-xxs);
      font: var(--zur-font-body);
      font-weight: 600;
      color: var(--zur-muted);
      cursor: pointer;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      transition: color 120ms ease, border-color 120ms ease;
    }
    .tab:hover {
      color: var(--zur-ink);
    }
    .tab.active {
      color: var(--zur-ink);
      border-bottom-color: var(--zur-ink);
    }
    .tab:focus-visible {
      outline: none;
      box-shadow: var(--zur-focus-ring);
      border-radius: var(--zur-radius-xs);
    }
  `,
})
export class ZurTabs {
  readonly index = model(0);
  protected readonly tabs = contentChildren(ZurTab);

  constructor() {
    effect(() => {
      const current = this.index();
      this.tabs().forEach((tab, i) => tab.active.set(i === current));
    });
  }
}
