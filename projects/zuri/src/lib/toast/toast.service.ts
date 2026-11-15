import { Injectable, signal } from '@angular/core';

export type ZurToastKind = 'neutral' | 'success' | 'error';

export interface ZurToast {
  id: number;
  message: string;
  kind: ZurToastKind;
}

let nextId = 0;

/** Fila de toasts — use junto com <zur-toast-container>. */
@Injectable({ providedIn: 'root' })
export class ZurToastService {
  readonly toasts = signal<ZurToast[]>([]);

  show(message: string, kind: ZurToastKind = 'neutral', durationMs = 4000): void {
    const toast: ZurToast = { id: nextId++, message, kind };
    this.toasts.update((list) => [...list, toast]);
    setTimeout(() => this.dismiss(toast.id), durationMs);
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((toast) => toast.id !== id));
  }
}
