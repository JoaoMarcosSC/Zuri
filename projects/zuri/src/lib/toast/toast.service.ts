import { Injectable, signal } from '@angular/core';

export type ZurToastKind = 'neutral' | 'success' | 'error';

export interface ZurToastAction {
  /** Texto do botão ("Desfazer"). */
  label: string;
  /** Roda ao clicar; o toast fecha em seguida. */
  handler: () => void;
}

export interface ZurToastOptions {
  /** Tempo na tela em ms. Padrão: 4000, ou 8000 quando há ação. */
  durationMs?: number;
  /** Botão de texto dentro do toast, para desfazer ou abrir algo. */
  action?: ZurToastAction;
  /** Não fecha sozinho: só pelo ✕, pela ação ou por `dismiss`. */
  persistent?: boolean;
}

export interface ZurToast {
  id: number;
  message: string;
  kind: ZurToastKind;
  action?: ZurToastAction;
  persistent: boolean;
}

interface Timer {
  handle: ReturnType<typeof setTimeout> | undefined;
  remaining: number;
  startedAt: number;
}

let nextId = 0;

/**
 * Fila de toasts — use junto com <zur-toast-container>.
 *
 * O tempo de cada toast pausa enquanto o ponteiro ou o foco estão sobre a pilha (WCAG 2.2.1) e
 * continua de onde parou. `show` devolve o id, para fechar por `dismiss(id)`.
 *
 * ```ts
 * toast.show('Planta removida', 'neutral', { action: { label: 'Desfazer', handler: () => restaurar() } });
 * toast.show('Sem conexão', 'error', { persistent: true });
 * toast.show('Salvo', 'success', 2000); // forma curta: só a duração
 * ```
 */
@Injectable({ providedIn: 'root' })
export class ZurToastService {
  readonly toasts = signal<ZurToast[]>([]);

  private readonly timers = new Map<number, Timer>();
  private paused = false;

  show(message: string, kind: ZurToastKind = 'neutral', options: number | ZurToastOptions = {}): number {
    const opts: ZurToastOptions = typeof options === 'number' ? { durationMs: options } : options;
    const toast: ZurToast = {
      id: nextId++,
      message,
      kind,
      action: opts.action,
      persistent: !!opts.persistent,
    };
    this.toasts.update((list) => [...list, toast]);
    if (!toast.persistent) {
      const timer: Timer = { handle: undefined, remaining: opts.durationMs ?? (opts.action ? 8000 : 4000), startedAt: 0 };
      this.timers.set(toast.id, timer);
      if (!this.paused) this.start(toast.id, timer);
    }
    return toast.id;
  }

  dismiss(id: number): void {
    const timer = this.timers.get(id);
    if (timer) clearTimeout(timer.handle);
    this.timers.delete(id);
    this.toasts.update((list) => list.filter((toast) => toast.id !== id));
  }

  dismissAll(): void {
    this.timers.forEach((timer) => clearTimeout(timer.handle));
    this.timers.clear();
    this.toasts.set([]);
  }

  /** Congela o tempo de todos os toasts (o container chama com ponteiro ou foco sobre a pilha). */
  pauseAll(): void {
    this.paused = true;
    this.timers.forEach((timer) => {
      if (timer.handle === undefined) return;
      clearTimeout(timer.handle);
      timer.handle = undefined;
      timer.remaining = Math.max(0, timer.remaining - (Date.now() - timer.startedAt));
    });
  }

  /** Retoma o tempo que faltava de cada toast. */
  resumeAll(): void {
    this.paused = false;
    this.timers.forEach((timer, id) => {
      if (timer.handle === undefined) this.start(id, timer);
    });
  }

  private start(id: number, timer: Timer): void {
    timer.startedAt = Date.now();
    timer.handle = setTimeout(() => this.dismiss(id), timer.remaining);
  }
}
