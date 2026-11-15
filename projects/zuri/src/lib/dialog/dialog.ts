import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  EnvironmentInjector,
  Injectable,
  afterNextRender,
  computed,
  createComponent,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { ZurButton } from '../button/button';
import { ZUR_I18N } from '../i18n/i18n';
import { zurTrapFocus } from '../shared/focus-trap';

export interface ZurDialogOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Ação destrutiva: botão vermelho e foco inicial em "Cancelar". */
  destructive?: boolean;
}

let nextId = 0;

/** Caixa de diálogo criada por `ZurDialog`; não é usada diretamente no template. */
@Component({
  selector: 'zur-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ZurButton],
  host: { '(document:keydown.escape)': 'finish(false)' },
  template: `
    <div class="scrim" (click)="finish(false)">
      <div
        #dialog
        class="dialog"
        role="alertdialog"
        aria-modal="true"
        tabindex="-1"
        [attr.aria-labelledby]="id + '-title'"
        [attr.aria-describedby]="options().message ? id + '-message' : null"
        (click)="$event.stopPropagation()"
        (keydown)="trap($event)"
      >
        <h2 class="title" [id]="id + '-title'">{{ options().title }}</h2>
        @if (options().message) {
          <p class="message" [id]="id + '-message'">{{ options().message }}</p>
        }
        <div class="actions">
          @if (mode() === 'confirm') {
            <button #cancel zur-button variant="ghost" (click)="finish(false)">
              {{ options().cancelLabel ?? i18n.cancel }}
            </button>
          }
          <button #confirm zur-button [variant]="options().destructive ? 'danger' : 'primary'" (click)="finish(true)">
            {{ options().confirmLabel ?? (mode() === 'confirm' ? i18n.confirm : i18n.ok) }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: `
    .scrim {
      position: fixed;
      inset: 0;
      z-index: 300;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--zur-space-lg);
      background: var(--zur-scrim);
    }
    .dialog {
      width: 100%;
      max-width: 440px;
      box-sizing: border-box;
      padding: var(--zur-space-xl);
      background: var(--zur-surface-raised);
      border-radius: var(--zur-radius-lg);
      box-shadow: var(--zur-shadow-float);
    }
    .dialog:focus {
      outline: none;
    }
    .title {
      margin: 0;
      font: var(--zur-font-headline);
      color: var(--zur-ink);
    }
    .message {
      margin: var(--zur-space-sm) 0 0;
      font: var(--zur-font-body);
      color: var(--zur-body);
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--zur-space-sm);
      margin-block-start: var(--zur-space-xl);
    }
  `,
})
export class ZurDialogComponent {
  protected readonly i18n = inject(ZUR_I18N);

  readonly options = input.required<ZurDialogOptions>();
  readonly mode = input<'confirm' | 'alert'>('confirm');
  readonly result = output<boolean>();

  protected readonly id = `zur-dialog-${nextId++}`;
  private readonly dialog = viewChild.required<ElementRef<HTMLElement>>('dialog');
  private readonly confirmBtn = viewChild('confirm', { read: ElementRef<HTMLElement> });
  private readonly cancelBtn = viewChild('cancel', { read: ElementRef<HTMLElement> });
  private done = false;

  protected readonly safeFirst = computed(() => !!this.options().destructive);

  constructor() {
    afterNextRender(() => {
      // Em ação destrutiva o foco começa em "Cancelar" (o caminho seguro).
      const target = this.safeFirst() && this.cancelBtn() ? this.cancelBtn()! : this.confirmBtn();
      (target ?? this.dialog()).nativeElement.focus();
    });
  }

  protected trap(event: KeyboardEvent): void {
    zurTrapFocus(event, this.dialog().nativeElement);
  }

  protected finish(value: boolean): void {
    if (this.done) return;
    this.done = true;
    this.result.emit(value);
  }
}

/**
 * Diálogos de confirmação e aviso sem precisar montar um `zur-modal` em cada tela. O foco
 * fica preso no diálogo e volta ao elemento anterior ao fechar; Esc e clique fora cancelam.
 *
 * ```ts
 * private dialog = inject(ZurDialog);
 *
 * if (await this.dialog.confirm({ title: 'Excluir pedido?', message: 'Não dá para desfazer.',
 *     confirmLabel: 'Excluir', destructive: true })) {
 *   this.excluir();
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class ZurDialog {
  private readonly appRef = inject(ApplicationRef);
  private readonly env = inject(EnvironmentInjector);
  private readonly doc = inject(DOCUMENT);

  /** Pergunta sim/não. Resolve `true` ao confirmar e `false` ao cancelar (botão, Esc ou fora). */
  confirm(options: ZurDialogOptions): Promise<boolean> {
    return this.open('confirm', options);
  }

  /** Aviso com um único botão. Resolve quando o usuário fecha. */
  async alert(options: ZurDialogOptions): Promise<void> {
    await this.open('alert', options);
  }

  private open(mode: 'confirm' | 'alert', options: ZurDialogOptions): Promise<boolean> {
    return new Promise((resolve) => {
      const previous = this.doc.activeElement as HTMLElement | null;
      const ref = createComponent(ZurDialogComponent, { environmentInjector: this.env });
      ref.setInput('options', options);
      ref.setInput('mode', mode);
      this.appRef.attachView(ref.hostView);
      this.doc.body.appendChild(ref.location.nativeElement);
      const overflow = this.doc.body.style.overflow;
      this.doc.body.style.overflow = 'hidden';

      const sub = ref.instance.result.subscribe((value) => {
        sub.unsubscribe();
        this.doc.body.style.overflow = overflow;
        this.appRef.detachView(ref.hostView);
        ref.destroy();
        previous?.focus?.();
        resolve(value);
      });
      ref.changeDetectorRef.detectChanges();
    });
  }
}
