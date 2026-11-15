import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';

export type ZurTimelineStatus = 'neutral' | 'active' | 'success' | 'warning' | 'error' | 'info';

/**
 * Linha do tempo vertical (histórico de pedido, auditoria, feed de atividade). É uma `<ol>`
 * nativa: cada evento é um `li[zur-timeline-item]` e os grupos por dia usam
 * `li[zur-timeline-heading]`.
 *
 * ```html
 * <ol zur-timeline label="Histórico do pedido">
 *   <li zur-timeline-heading>Hoje</li>
 *   <li zur-timeline-item title="Saiu para entrega" time="10:42" status="success">
 *     O entregador está a caminho.
 *   </li>
 *   <li zur-timeline-item title="Pedido confirmado" time="09:15">Pagamento aprovado.</li>
 * </ol>
 * ```
 */
@Component({
  selector: 'ol[zur-timeline]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Os itens vêm do template de quem usa: estilos globais, presos a `.zur-timeline`.
  encapsulation: ViewEncapsulation.None,
  host: { class: 'zur-timeline', '[attr.aria-label]': 'label() || null' },
  template: `<ng-content />`,
  styles: `
    ol.zur-timeline {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .zur-timeline > li[zur-timeline-heading] {
      margin: var(--zur-space-lg) 0 var(--zur-space-sm);
      padding-inline-start: 0;
      font: var(--zur-font-caption);
      font-size: 12px;
      letter-spacing: 0.4px;
      text-transform: uppercase;
      color: var(--zur-muted);
    }
    .zur-timeline > li[zur-timeline-heading]:first-child {
      margin-block-start: 0;
    }
  `,
})
export class ZurTimeline {
  /** Nome da lista para leitores de tela. */
  readonly label = input('');
}

/** Um evento da linha do tempo. */
@Component({
  selector: 'li[zur-timeline-item]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-status]': 'status()' },
  template: `
    <span class="marker" aria-hidden="true"><ng-content select="[zurTimelineIcon]" /></span>
    <div class="body">
      <div class="head">
        <span class="title">{{ title() }}</span>
        @if (time()) {
          <time class="time" [attr.datetime]="datetime() || null">{{ time() }}</time>
        }
      </div>
      <div class="content"><ng-content /></div>
    </div>
  `,
  styles: `
    :host {
      position: relative;
      display: flex;
      gap: var(--zur-space-md);
      padding-block-end: var(--zur-space-lg);
    }
    :host(:last-child) {
      padding-block-end: 0;
    }
    /* linha que liga um evento ao seguinte */
    :host::before {
      content: '';
      position: absolute;
      inset-block: 28px 0;
      inset-inline-start: 11px;
      width: 2px;
      background: var(--zur-hairline);
    }
    :host(:last-child)::before {
      display: none;
    }
    .marker {
      position: relative;
      z-index: 1;
      width: 24px;
      height: 24px;
      flex-shrink: 0;
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--zur-radius-full);
      background: var(--zur-surface-strong);
      border: 2px solid var(--zur-canvas);
      box-shadow: 0 0 0 1px var(--zur-hairline);
      color: var(--zur-body);
    }
    /* sem ícone, o marcador é um ponto */
    .marker:empty::after {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: var(--zur-radius-full);
      background: currentColor;
    }
    :host([data-status='active']) .marker { background: var(--zur-primary); color: var(--zur-on-primary); box-shadow: none; }
    :host([data-status='success']) .marker { background: var(--zur-success-soft); color: var(--zur-success-text); box-shadow: none; }
    :host([data-status='warning']) .marker { background: var(--zur-warning-soft); color: var(--zur-warning-text); box-shadow: none; }
    :host([data-status='error']) .marker { background: var(--zur-error-soft); color: var(--zur-error-text); box-shadow: none; }
    :host([data-status='info']) .marker { background: var(--zur-info-soft); color: var(--zur-info-text); box-shadow: none; }
    .body {
      flex: 1;
      min-width: 0;
      padding-block-start: 2px;
    }
    .head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--zur-space-sm);
    }
    .title {
      font: var(--zur-font-body-sm);
      font-weight: 700;
      color: var(--zur-ink);
    }
    .time {
      font: var(--zur-font-caption);
      font-variant-numeric: tabular-nums;
      color: var(--zur-muted);
      white-space: nowrap;
    }
    .content {
      margin-block-start: 2px;
      font: var(--zur-font-body-sm);
      color: var(--zur-body);
    }
    .content:empty {
      display: none;
    }
  `,
})
export class ZurTimelineItem {
  readonly title = input.required<string>();
  /** Texto de data/hora já formatado ("10:42", "ontem"). */
  readonly time = input('');
  /** Valor máquina opcional para o `<time datetime>`. */
  readonly datetime = input('');
  readonly status = input<ZurTimelineStatus>('neutral');
}
