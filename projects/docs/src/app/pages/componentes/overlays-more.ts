import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ZurButton, ZurDrawer, ZurToastService } from '@juau/zuri';
import { CodeBlock } from '../../shared/code-block/code-block';

/** Bottom sheet e toast com ação. */
@Component({
  selector: 'docs-overlays-more',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CodeBlock, ZurButton, ZurDrawer],
  templateUrl: './overlays-more.html',
  styleUrl: './componentes.css',
  styles: `
    :host {
      max-width: none;
      margin: 0;
    }
    .readout {
      margin: 0 0 0 var(--zur-space-xs);
      font: var(--zur-font-caption);
      color: var(--zur-muted);
    }
  `,
})
export class OverlaysMore {
  private readonly toast = inject(ZurToastService);

  protected readonly sheet = signal(false);
  protected readonly status = signal('nenhuma ação ainda');

  protected remover(): void {
    this.status.set('planta removida');
    this.toast.show('Planta removida', 'neutral', {
      action: { label: 'Desfazer', handler: () => this.status.set('removida e desfeita') },
    });
  }

  protected offline(): void {
    this.toast.show('Sem conexão. Tentando de novo…', 'error', { persistent: true });
  }

  protected limpar(): void {
    this.toast.dismissAll();
  }

  protected readonly codeSheet = `<button zur-button (click)="aberto = true">Compartilhar</button>

<zur-drawer [(open)]="aberto" side="bottom" title="Compartilhar planta">
  <p>Envie a Monstera deliciosa para um amigo.</p>
  <button zur-button>Copiar link</button>
</zur-drawer>

// Mesmo componente do drawer: foco preso, Esc e fundo fecham e o foco volta ao gatilho.
// No bottom sheet há uma alça: arrastar para baixo (mais de 100 px) fecha.`;

  protected readonly codeToast = `private toast = inject(ZurToastService);

// ação ("Desfazer"): fica 8 s por padrão e fecha depois do handler
this.toast.show('Planta removida', 'neutral', {
  action: { label: 'Desfazer', handler: () => this.restaurar() },
});

// persistente: só fecha pelo ✕, pela ação ou por dismiss(id)
const id = this.toast.show('Sem conexão', 'error', { persistent: true });
this.toast.dismiss(id);          // show agora devolve o id
this.toast.dismissAll();

this.toast.show('Salvo', 'success', 2000);   // forma curta: só a duração

// O tempo de todos os toasts pausa enquanto o ponteiro ou o foco estão sobre a pilha.`;
}
