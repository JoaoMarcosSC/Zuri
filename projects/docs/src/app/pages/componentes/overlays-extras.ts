import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ZurButton, ZurContextMenu, ZurContextMenuTrigger, ZurDialog, ZurMenuItem } from '@juau/zuri';
import { CodeBlock } from '../../shared/code-block/code-block';

/** Seções de Dialog e Context menu. */
@Component({
  selector: 'docs-overlays-extras',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CodeBlock, ZurButton, ZurContextMenu, ZurContextMenuTrigger, ZurMenuItem],
  templateUrl: './overlays-extras.html',
  styleUrl: './componentes.css',
  styles: `
    :host {
      max-width: none;
      margin: 0;
    }
    .area {
      display: grid;
      place-items: center;
      width: 100%;
      height: 140px;
      border: 2px dashed var(--zur-hairline);
      border-radius: var(--zur-radius-md);
      color: var(--zur-body);
      text-align: center;
      padding: var(--zur-space-md);
    }
    .area:focus-visible {
      outline: none;
      box-shadow: var(--zur-focus-ring);
    }
    .readout {
      margin: var(--zur-space-sm) 0 0;
      font: var(--zur-font-caption);
      color: var(--zur-muted);
    }
  `,
})
export class OverlaysExtras {
  private readonly dialog = inject(ZurDialog);

  protected readonly resultado = signal('—');
  protected readonly acao = signal('—');

  protected async salvar(): Promise<void> {
    const ok = await this.dialog.confirm({ title: 'Salvar alterações?', message: 'O endereço de entrega será atualizado.' });
    this.resultado.set(ok ? 'confirmado' : 'cancelado');
  }

  protected async excluir(): Promise<void> {
    const ok = await this.dialog.confirm({
      title: 'Excluir pedido #1042?',
      message: 'Esta ação não pode ser desfeita.',
      confirmLabel: 'Excluir',
      destructive: true,
    });
    this.resultado.set(ok ? 'excluído' : 'cancelado');
  }

  protected async avisar(): Promise<void> {
    await this.dialog.alert({ title: 'Pedido enviado', message: 'Você receberá o código de rastreio por e-mail.' });
    this.resultado.set('aviso fechado');
  }

  protected readonly codeDialog = `private dialog = inject(ZurDialog);

async excluir() {
  const ok = await this.dialog.confirm({
    title: 'Excluir pedido #1042?',
    message: 'Esta ação não pode ser desfeita.',
    confirmLabel: 'Excluir',
    destructive: true,        // botão vermelho; o foco começa em "Cancelar"
  });
  if (ok) this.apagar();
}

await this.dialog.alert({ title: 'Pedido enviado' });   // um só botão`;

  protected readonly codeContextMenu = `<div [zurContextMenu]="menu" tabindex="0">Área com menu de contexto</div>

<zur-context-menu #menu>
  <zur-menu-item (selected)="renomear()">Renomear</zur-menu-item>
  <zur-menu-item (selected)="excluir()">Excluir</zur-menu-item>
</zur-context-menu>`;
}
