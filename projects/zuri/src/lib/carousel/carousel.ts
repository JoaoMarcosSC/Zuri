import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  model,
  numberAttribute,
  signal,
} from '@angular/core';
import { ZUR_I18N } from '../i18n/i18n';
import { zurInlineStep, zurIsRtl } from '../shared/direction';

/** Um slide do `zur-carousel`; só o slide atual é focável e lido. */
@Component({
  selector: 'zur-carousel-slide',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'group',
    'aria-roledescription': 'slide',
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.inert]': 'active() ? null : ""',
  },
  template: `<ng-content />`,
  styles: `
    :host {
      flex: 0 0 100%;
      min-width: 0;
      box-sizing: border-box;
    }
  `,
})
export class ZurCarouselSlide {
  private readonly i18n = inject(ZUR_I18N);
  /** Preenchidos pelo `zur-carousel`. */
  readonly active = signal(false);
  readonly position = signal<{ n: number; total: number }>({ n: 1, total: 1 });
  protected readonly ariaLabel = computed(() => this.i18n.slideOf(this.position().n, this.position().total));
}

/**
 * Carrossel de slides com setas, indicadores e deslize por toque. Teclado: ←→ trocam o slide
 * (invertidas em RTL). O `autoplay` (ms) para sozinho ao passar o mouse ou focar, tem botão
 * de pausa e **fica desligado quando o usuário pede menos movimento**.
 *
 * ```html
 * <zur-carousel label="Destaques" [(index)]="i" [autoplay]="5000" loop>
 *   <zur-carousel-slide>…</zur-carousel-slide>
 * </zur-carousel>
 * ```
 */
@Component({
  selector: 'zur-carousel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'region',
    'aria-roledescription': 'carousel',
    '[attr.aria-label]': 'label() || i18n.carousel',
    '(keydown)': 'onKeydown($event)',
    '(mouseenter)': 'hovered.set(true)',
    '(mouseleave)': 'hovered.set(false)',
    '(focusin)': 'focused.set(true)',
    '(focusout)': 'focused.set(false)',
  },
  template: `
    <div class="viewport" (pointerdown)="onPointerDown($event)" (pointerup)="onPointerUp($event)" (pointercancel)="dragStart = null">
      <div class="track" [style.transform]="transform()" [attr.aria-live]="running() ? 'off' : 'polite'">
        <ng-content />
      </div>
    </div>

    @if (count() > 1) {
      <button type="button" class="nav prev" [attr.aria-label]="i18n.previousSlide" [disabled]="!canPrev()" (click)="previous()">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 6-6 6 6 6" /></svg>
      </button>
      <button type="button" class="nav next" [attr.aria-label]="i18n.nextSlide" [disabled]="!canNext()" (click)="next()">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
      </button>

      <div class="controls">
        @if (autoplay() > 0) {
          <button type="button" class="pause" [attr.aria-label]="userPaused() ? i18n.playCarousel : i18n.pauseCarousel" (click)="userPaused.set(!userPaused())">
            @if (userPaused()) {
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M7 5v14l12-7z" /></svg>
            } @else {
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /></svg>
            }
          </button>
        }
        <div class="dots">
          @for (s of slides(); track $index; let i = $index) {
            <button
              type="button"
              class="dot"
              [attr.aria-label]="i18n.goToSlide(i + 1)"
              [attr.aria-current]="i === index() ? 'true' : null"
              (click)="goTo(i)"
            ></button>
          }
        </div>
      </div>
    }
  `,
  styles: `
    :host {
      position: relative;
      display: block;
      border-radius: var(--zur-radius-md);
    }
    .viewport {
      overflow: hidden;
      border-radius: inherit;
      touch-action: pan-y;
    }
    .track {
      display: flex;
      transition: transform 400ms cubic-bezier(0.22, 1, 0.36, 1);
    }
    @media (prefers-reduced-motion: reduce) {
      .track {
        transition: none;
      }
    }
    .nav {
      position: absolute;
      inset-block-start: 50%;
      width: 44px;
      height: 44px;
      margin-block-start: -22px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--zur-hairline);
      border-radius: var(--zur-radius-full);
      background: var(--zur-surface-raised);
      color: var(--zur-ink);
      box-shadow: var(--zur-shadow-float);
      cursor: pointer;
    }
    .nav.prev {
      inset-inline-start: var(--zur-space-sm);
    }
    .nav.next {
      inset-inline-end: var(--zur-space-sm);
    }
    :host([data-rtl]) .nav svg {
      transform: scaleX(-1);
    }
    .nav:hover:not(:disabled) {
      background: var(--zur-surface-soft);
    }
    .nav:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
    .nav:focus-visible,
    .pause:focus-visible,
    .dot:focus-visible {
      outline: none;
      box-shadow: var(--zur-focus-ring);
    }
    .controls {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--zur-space-sm);
      padding-block-start: var(--zur-space-sm);
    }
    .dots {
      display: flex;
      gap: 6px;
    }
    .dot {
      width: 8px;
      height: 8px;
      padding: 0;
      border: none;
      border-radius: var(--zur-radius-full);
      background: var(--zur-hairline);
      cursor: pointer;
      position: relative;
    }
    .dot::before {
      /* área de toque de 24px sem aumentar o ponto */
      content: '';
      position: absolute;
      inset: -8px;
    }
    .dot[aria-current='true'] {
      width: 24px;
      background: var(--zur-ink);
    }
    .pause {
      width: 28px;
      height: 28px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      border-radius: var(--zur-radius-full);
      background: var(--zur-surface-strong);
      color: var(--zur-ink);
      cursor: pointer;
    }
  `,
})
export class ZurCarousel {
  protected readonly i18n = inject(ZUR_I18N);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly label = input('');
  readonly index = model(0);
  /** Volta ao primeiro depois do último (e vice-versa). */
  readonly loop = input(false, { transform: booleanAttribute });
  /** Intervalo da troca automática em ms; `0` desliga. */
  readonly autoplay = input(0, { transform: numberAttribute });

  protected readonly slides = contentChildren(ZurCarouselSlide);
  protected readonly count = computed(() => this.slides().length);
  protected readonly hovered = signal(false);
  protected readonly focused = signal(false);
  protected readonly userPaused = signal(false);
  private readonly reducedMotion = signal(false);
  private readonly rtl = signal(false);
  protected dragStart: number | null = null;

  protected readonly running = computed(
    () => this.autoplay() > 0 && !this.userPaused() && !this.hovered() && !this.focused() && !this.reducedMotion(),
  );
  protected readonly canPrev = computed(() => this.loop() || this.index() > 0);
  protected readonly canNext = computed(() => this.loop() || this.index() < this.count() - 1);
  protected readonly transform = computed(
    () => `translateX(${(this.rtl() ? 1 : -1) * this.index() * 100}%)`,
  );

  constructor() {
    effect(() => {
      const total = this.count();
      this.slides().forEach((slide, i) => {
        slide.active.set(i === this.index());
        slide.position.set({ n: i + 1, total });
      });
    });

    // troca automática
    effect((onCleanup) => {
      if (!this.running()) return;
      const timer = setInterval(() => this.advance(), this.autoplay());
      onCleanup(() => clearInterval(timer));
    });

    afterNextRender(() => {
      this.syncDirection();
      const query = this.host.nativeElement.ownerDocument.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)');
      if (!query) return;
      this.reducedMotion.set(query.matches);
      const listener = (e: MediaQueryListEvent) => this.reducedMotion.set(e.matches);
      query.addEventListener?.('change', listener);
      this.destroyRef.onDestroy(() => query.removeEventListener?.('change', listener));
    });
  }

  private syncDirection(): void {
    const rtl = zurIsRtl(this.host.nativeElement);
    this.rtl.set(rtl);
    if (rtl) this.host.nativeElement.setAttribute('data-rtl', '');
    else this.host.nativeElement.removeAttribute('data-rtl');
  }

  private advance(): void {
    if (this.canNext()) this.next();
    else this.goTo(0);
  }

  goTo(i: number): void {
    const total = this.count();
    if (!total) return;
    this.syncDirection();
    this.index.set(this.loop() ? ((i % total) + total) % total : Math.max(0, Math.min(i, total - 1)));
  }

  next(): void {
    this.goTo(this.index() + 1);
  }

  previous(): void {
    this.goTo(this.index() - 1);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const step = zurInlineStep(event, this.host.nativeElement);
    if (step === 0) return;
    event.preventDefault();
    this.goTo(this.index() + step);
  }

  protected onPointerDown(event: PointerEvent): void {
    this.dragStart = event.clientX;
  }

  protected onPointerUp(event: PointerEvent): void {
    if (this.dragStart === null) return;
    const dx = event.clientX - this.dragStart;
    this.dragStart = null;
    if (Math.abs(dx) < 50) return;
    // arrastar para a esquerda avança em LTR; em RTL é o contrário
    const forward = dx < 0 !== this.rtl();
    this.goTo(this.index() + (forward ? 1 : -1));
  }
}
