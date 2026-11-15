import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { ZUR_I18N } from '../i18n/i18n';
import { zurInlineStep } from '../shared/direction';
import { ZUR_SR_ONLY } from '../shared/search';

export type ZurStepperOrientation = 'horizontal' | 'vertical';
export type ZurStepStatus = 'done' | 'current' | 'upcoming' | 'error';

/** Conteúdo de uma etapa do `zur-stepper`; só a etapa atual é mostrada. */
@Component({
  selector: 'zur-stepper-step',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (active()) {
      <div class="panel" role="group" [attr.aria-label]="label()"><ng-content /></div>
    }
  `,
  styles: `
    :host {
      display: block;
    }
    .panel {
      padding-block-start: var(--zur-space-lg);
      font: var(--zur-font-body);
      color: var(--zur-body);
    }
  `,
})
export class ZurStepperStep {
  readonly label = input.required<string>();
  readonly description = input('');
  /** Marca a etapa com erro (ex.: validação falhou), qualquer que seja a posição. */
  readonly error = input(false, { transform: booleanAttribute });
  /** Preenchido pelo `zur-stepper`. */
  readonly active = signal(false);
}

/**
 * Etapas de um fluxo (cadastro, checkout, wizard). O estado de cada etapa vem da posição:
 * as anteriores à atual estão concluídas. Com `linear`, só dá para voltar ou ir à etapa
 * atual pelo cabeçalho — avançar é com `next()`. Setas (←→ ou ↑↓ no vertical, invertidas em
 * RTL) movem o foco entre etapas; Enter ou Espaço ativa.
 *
 * ```html
 * <zur-stepper #s linear [(index)]="etapa">
 *   <zur-stepper-step label="Endereço">…</zur-stepper-step>
 *   <zur-stepper-step label="Pagamento">…</zur-stepper-step>
 * </zur-stepper>
 * <button zur-button (click)="s.next()">Continuar</button>
 * ```
 */
@Component({
  selector: 'zur-stepper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-orientation]': 'orientation()' },
  template: `
    <ol class="steps" (keydown)="onKeydown($event)">
      @for (step of steps(); track $index; let i = $index) {
        <li class="item" [attr.data-status]="status(i)">
          <button
            type="button"
            class="head"
            [attr.aria-current]="i === index() ? 'step' : null"
            [attr.aria-disabled]="!canGo(i) || null"
            [tabindex]="i === index() ? 0 : -1"
            (click)="go(i)"
          >
            <span class="dot" aria-hidden="true">
              @switch (status(i)) {
                @case ('done') {
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 13 4 4L19 7" /></svg>
                }
                @case ('error') {
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 6v7M12 18v.01" /></svg>
                }
                @default {
                  {{ i + 1 }}
                }
              }
            </span>
            <span class="text">
              <!-- o nome do botão vem do conteúdo: o texto visível fica contido nele (WCAG 2.5.3) -->
              <span class="sr-only">{{ i18n.stepOf(i + 1, steps().length) }}: </span>
              <span class="label">{{ step.label() }}</span>
              @if (step.description()) {
                <span class="desc">{{ step.description() }}</span>
              }
              @if (statusText(i)) {
                <span class="sr-only">, {{ statusText(i) }}</span>
              }
            </span>
          </button>
          @if (!$last) {
            <span class="line" aria-hidden="true"></span>
          }
        </li>
      }
    </ol>
    <div class="panels"><ng-content /></div>
  `,
  styles: [
    ZUR_SR_ONLY,
    `
    :host {
      display: block;
    }
    :host([data-orientation='vertical']) {
      display: grid;
      grid-template-columns: minmax(180px, 260px) 1fr;
      gap: var(--zur-space-xl);
    }
    .steps {
      display: flex;
      gap: var(--zur-space-xs);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    :host([data-orientation='vertical']) .steps {
      flex-direction: column;
      gap: 0;
    }
    .item {
      position: relative;
      display: flex;
      align-items: flex-start;
      flex: 1;
      min-width: 0;
    }
    :host([data-orientation='horizontal']) .item:last-child {
      flex: 0 0 auto;
    }
    :host([data-orientation='vertical']) .item {
      display: block;
      flex: none;
      padding-block-end: var(--zur-space-lg);
    }
    /* linha que liga uma etapa à seguinte: ocupa o espaço que sobra depois do rótulo */
    .line {
      flex: 1;
      min-width: 24px;
      height: 2px;
      margin: 15px var(--zur-space-sm) 0;
      background: var(--zur-hairline);
    }
    :host([data-orientation='vertical']) .line {
      position: absolute;
      inset-block: 36px 4px;
      inset-inline-start: 15px;
      width: 2px;
      height: auto;
      min-width: 0;
      margin: 0;
    }
    .item[data-status='done'] .line {
      background: var(--zur-primary);
    }
    .head {
      display: flex;
      align-items: flex-start;
      gap: var(--zur-space-sm);
      flex: 0 1 auto;
      padding: 0;
      border: none;
      background: none;
      text-align: start;
      font: inherit;
      color: inherit;
      cursor: pointer;
      border-radius: var(--zur-radius-sm);
    }
    .head[aria-disabled='true'] {
      cursor: not-allowed;
    }
    .head:focus-visible {
      outline: none;
      box-shadow: var(--zur-focus-ring);
    }
    .dot {
      width: 32px;
      height: 32px;
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--zur-radius-full);
      background: var(--zur-surface-strong);
      color: var(--zur-body);
      font: var(--zur-font-badge);
      font-size: 14px;
      position: relative;
      z-index: 1;
    }
    .item[data-status='current'] .dot {
      background: var(--zur-primary);
      color: var(--zur-on-primary);
    }
    .item[data-status='done'] .dot {
      background: var(--zur-primary-soft);
      color: var(--zur-on-primary-soft);
    }
    .item[data-status='error'] .dot {
      background: var(--zur-error-soft);
      color: var(--zur-error-text);
    }
    .text {
      display: grid;
      gap: 2px;
      padding-block-start: 4px;
      min-width: 0;
    }
    .label {
      font: var(--zur-font-body-sm);
      font-weight: 700;
      color: var(--zur-ink);
    }
    .item[data-status='upcoming'] .label {
      color: var(--zur-muted);
      font-weight: 600;
    }
    .item[data-status='error'] .label {
      color: var(--zur-error-text);
    }
    .desc {
      font: var(--zur-font-caption);
      color: var(--zur-muted);
    }
    @media (max-width: 640px) {
      /* sem espaço para o texto: some da vista mas continua sendo o nome do botão */
      :host([data-orientation='horizontal']) .item:not([data-status='current']) .text {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
      }
      :host([data-orientation='vertical']) {
        grid-template-columns: 1fr;
      }
    }
  `,
  ],
})
export class ZurStepper {
  protected readonly i18n = inject(ZUR_I18N);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly index = model(0);
  readonly orientation = input<ZurStepperOrientation>('horizontal');
  /** Só deixa ir para etapas já alcançadas; avançar é com `next()`. */
  readonly linear = input(false, { transform: booleanAttribute });

  protected readonly steps = contentChildren(ZurStepperStep);
  /** Etapa mais distante já alcançada (libera o clique no modo linear). */
  private readonly reached = signal(0);

  constructor() {
    effect(() => {
      const current = this.index();
      this.steps().forEach((step, i) => step.active.set(i === current));
      this.reached.update((r) => Math.max(r, current));
    });
  }

  protected status(i: number): ZurStepStatus {
    if (this.steps()[i]?.error()) return 'error';
    if (i < this.index()) return 'done';
    return i === this.index() ? 'current' : 'upcoming';
  }

  /** Estado da etapa em palavras, para leitores de tela ("concluída", "etapa atual"…). */
  protected statusText(i: number): string {
    const status = this.status(i);
    return status === 'done' ? this.i18n.stepDone : status === 'current' ? this.i18n.stepCurrent : status === 'error' ? this.i18n.stepError : '';
  }

  protected canGo(i: number): boolean {
    return !this.linear() || i <= this.reached();
  }

  go(i: number): void {
    if (i < 0 || i >= this.steps().length || !this.canGo(i)) return;
    this.index.set(i);
  }

  /** Avança uma etapa. No modo linear é o único jeito de liberar a etapa seguinte. */
  next(): void {
    const target = Math.min(this.index() + 1, this.steps().length - 1);
    this.reached.update((r) => Math.max(r, target));
    this.go(target);
  }

  previous(): void {
    this.go(Math.max(this.index() - 1, 0));
  }

  protected onKeydown(event: KeyboardEvent): void {
    const vertical = this.orientation() === 'vertical';
    let step = 0;
    if (vertical) step = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0;
    else step = zurInlineStep(event, this.host.nativeElement);
    const buttons = Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>('.head'));
    const current = buttons.indexOf(document.activeElement as HTMLElement);
    let target = -1;
    if (step !== 0) target = current + step;
    else if (event.key === 'Home') target = 0;
    else if (event.key === 'End') target = buttons.length - 1;
    else return;
    event.preventDefault();
    buttons[Math.max(0, Math.min(target, buttons.length - 1))]?.focus();
  }
}
