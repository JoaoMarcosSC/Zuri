import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  contentChildren,
  forwardRef,
  inject,
  input,
  model,
} from '@angular/core';

let nextId = 0;

/**
 * Seções expansíveis. Por padrão só uma fica aberta por vez; com `multi`, várias.
 * Setas ↑/↓, Home e End movem o foco entre os cabeçalhos.
 *
 * ```html
 * <zur-accordion>
 *   <zur-accordion-item title="Como cuidar da planta?">…</zur-accordion-item>
 *   <zur-accordion-item title="Posso cancelar?">…</zur-accordion-item>
 * </zur-accordion>
 * ```
 */
@Component({
  selector: 'zur-accordion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(keydown)': 'onKeydown($event)' },
  template: `<ng-content />`,
  styles: `
    :host {
      display: block;
      border-top: 1px solid var(--zur-hairline);
    }
  `,
})
export class ZurAccordion {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Permite várias seções abertas ao mesmo tempo. */
  readonly multi = input(false, { transform: booleanAttribute });

  private readonly items = contentChildren(forwardRef(() => ZurAccordionItem));

  /** Chamado por um item ao abrir: fecha os outros quando não é `multi`. */
  itemOpened(opened: ZurAccordionItem): void {
    if (this.multi()) return;
    for (const item of this.items()) {
      if (item !== opened) item.open.set(false);
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    const headers = Array.from(
      this.host.nativeElement.querySelectorAll<HTMLButtonElement>('.zur-accordion-header'),
    );
    const index = headers.indexOf(event.target as HTMLButtonElement);
    if (index < 0) return;
    const target =
      event.key === 'ArrowDown'
        ? headers[(index + 1) % headers.length]
        : event.key === 'ArrowUp'
          ? headers[(index - 1 + headers.length) % headers.length]
          : event.key === 'Home'
            ? headers[0]
            : event.key === 'End'
              ? headers[headers.length - 1]
              : null;
    if (target) {
      event.preventDefault();
      target.focus();
    }
  }
}

@Component({
  selector: 'zur-accordion-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-open]': 'open() ? "" : null' },
  template: `
    <h3 class="heading">
      <button
        type="button"
        class="zur-accordion-header"
        [id]="id + '-header'"
        [attr.aria-expanded]="open()"
        [attr.aria-controls]="id + '-panel'"
        (click)="toggle()"
      >
        <span>{{ title() }}</span>
        <svg class="chevron" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </button>
    </h3>
    <div
      class="panel"
      role="region"
      [id]="id + '-panel'"
      [attr.aria-labelledby]="id + '-header'"
      [hidden]="!open()"
    >
      <ng-content />
    </div>
  `,
  styles: `
    :host {
      display: block;
      border-bottom: 1px solid var(--zur-hairline);
    }
    .heading {
      margin: 0;
    }
    .zur-accordion-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--zur-space-md);
      width: 100%;
      padding: var(--zur-space-md) var(--zur-space-xs);
      border: 0;
      background: none;
      font: var(--zur-font-body);
      font-weight: 600;
      color: var(--zur-ink);
      text-align: left;
      cursor: pointer;
    }
    .zur-accordion-header:hover {
      background: var(--zur-surface-soft);
    }
    .zur-accordion-header:focus-visible {
      outline: none;
      border-radius: var(--zur-radius-sm);
      box-shadow: var(--zur-focus-ring);
    }
    .chevron {
      flex-shrink: 0;
      color: var(--zur-muted);
      transition: transform 200ms ease;
    }
    :host([data-open]) .chevron {
      transform: rotate(180deg);
    }
    .panel {
      padding: 0 var(--zur-space-xs) var(--zur-space-md);
      font: var(--zur-font-body);
      color: var(--zur-body);
    }
    @media (prefers-reduced-motion: reduce) {
      .chevron {
        transition: none;
      }
    }
  `,
})
export class ZurAccordionItem {
  private readonly accordion = inject(ZurAccordion, { optional: true });

  readonly title = input.required<string>();
  readonly open = model(false);

  protected readonly id = `zur-accordion-${nextId++}`;

  toggle(): void {
    const next = !this.open();
    this.open.set(next);
    if (next) this.accordion?.itemOpened(this);
  }
}
