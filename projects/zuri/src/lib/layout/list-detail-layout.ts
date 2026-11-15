import { ChangeDetectionStrategy, Component, model } from '@angular/core';

/**
 * Lista e detalhe (master-detail): lista à esquerda (360px) e detalhe à direita.
 * No mobile mostra um painel por vez — `detailOpen` decide qual, e o botão
 * "Voltar" fecha o detalhe.
 *
 * Slots: `zur-topbar`, `[zurList]` (lista), `[zurDetail]` (detalhe).
 *
 * ```html
 * <zur-list-detail-layout [(detailOpen)]="aberto">
 *   <zur-topbar>…</zur-topbar>
 *   <ul zurList>…</ul>
 *   <article zurDetail>…</article>
 * </zur-list-detail-layout>
 * ```
 */
@Component({
  selector: 'zur-list-detail-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-detail-open]': 'detailOpen()' },
  template: `
    <ng-content select="zur-topbar" />
    <div class="panes">
      <section class="list" aria-label="Lista"><ng-content select="[zurList]" /></section>
      <section class="detail" aria-label="Detalhe">
        <button type="button" class="back" (click)="detailOpen.set(false)">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Voltar
        </button>
        <div class="detail-body"><ng-content select="[zurDetail]" /></div>
      </section>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: var(--zur-canvas);
    }
    .panes {
      flex: 1;
      display: grid;
      grid-template-columns: 360px minmax(0, 1fr);
    }
    .list {
      position: sticky;
      top: 64px;
      align-self: start;
      height: calc(100vh - 64px);
      overflow-y: auto;
      background: var(--zur-surface-soft);
      border-right: 1px solid var(--zur-hairline);
    }
    .detail {
      min-width: 0;
    }
    .detail-body {
      box-sizing: border-box;
      padding: var(--zur-space-xl) var(--zur-space-lg);
    }
    .back {
      display: none;
      align-items: center;
      gap: var(--zur-space-xxs);
      margin: var(--zur-space-md) var(--zur-space-md) 0;
      padding: var(--zur-space-xs) var(--zur-space-sm);
      border: 0;
      border-radius: var(--zur-radius-sm);
      background: transparent;
      color: var(--zur-ink);
      font: var(--zur-font-button);
      font-size: 14px;
      cursor: pointer;
    }
    .back:hover {
      background: var(--zur-surface-strong);
    }
    .back:focus-visible {
      outline: none;
      box-shadow: var(--zur-focus-ring);
    }
    @media (max-width: 1023px) {
      .panes {
        grid-template-columns: 300px minmax(0, 1fr);
      }
    }
    @media (max-width: 767px) {
      .panes {
        grid-template-columns: minmax(0, 1fr);
      }
      .list {
        position: static;
        height: auto;
        border-right: 0;
      }
      .detail {
        display: none;
      }
      :host([data-detail-open='true']) .list {
        display: none;
      }
      :host([data-detail-open='true']) .detail {
        display: block;
      }
      .back {
        display: inline-flex;
      }
      .detail-body {
        padding: var(--zur-space-lg) var(--zur-space-md);
      }
    }
  `,
})
export class ZurListDetailLayout {
  /** Mobile: `true` mostra o detalhe; `false` mostra a lista. */
  readonly detailOpen = model(false);
}
