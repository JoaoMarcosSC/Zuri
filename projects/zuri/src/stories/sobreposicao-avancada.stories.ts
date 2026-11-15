import { Component, inject, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ZurButton } from '../lib/button/button';
import { ZurContextMenu, ZurContextMenuTrigger } from '../lib/context-menu/context-menu';
import { ZurDialog } from '../lib/dialog/dialog';
import { ZurMenuItem } from '../lib/menu/menu';

@Component({
  selector: 'demo-dialog',
  imports: [ZurButton],
  template: `
    <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap">
      <button zur-button variant="secondary" (click)="salvar()">Salvar alterações</button>
      <button zur-button variant="danger" (click)="excluir()">Excluir pedido</button>
      <button zur-button variant="ghost" (click)="avisar()">Aviso</button>
    </div>
    <p style="color:var(--zur-body)" aria-live="polite">Resultado: <strong>{{ resultado() }}</strong></p>
  `,
})
class DemoDialog {
  private readonly dialog = inject(ZurDialog);
  readonly resultado = signal('—');

  async salvar() {
    const ok = await this.dialog.confirm({ title: 'Salvar alterações?', message: 'O endereço de entrega será atualizado.' });
    this.resultado.set(ok ? 'confirmado' : 'cancelado');
  }

  async excluir() {
    const ok = await this.dialog.confirm({
      title: 'Excluir pedido #1042?',
      message: 'Esta ação não pode ser desfeita.',
      confirmLabel: 'Excluir',
      destructive: true,
    });
    this.resultado.set(ok ? 'excluído' : 'cancelado');
  }

  async avisar() {
    await this.dialog.alert({ title: 'Pedido enviado', message: 'Você receberá o código de rastreio por e-mail.' });
    this.resultado.set('aviso fechado');
  }
}

const meta: Meta = {
  title: 'Sobreposição/Avançada',
  decorators: [moduleMetadata({ imports: [DemoDialog, ZurContextMenu, ZurContextMenuTrigger, ZurMenuItem] })],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

export const Dialog: Story = {
  render: () => ({ template: `<demo-dialog />` }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Excluir pedido' }));
    // o diálogo é criado no <body>, fora do canvas da story
    const dialog = await waitFor(() => within(document.body).getByRole('alertdialog', { name: /Excluir pedido/ }));
    await expect(dialog).toBeTruthy();
  },
};

export const ContextMenu: Story = {
  name: 'Context menu',
  render: () => ({
    props: { ultimo: '—' },
    template: `
      <div style="min-height:260px">
        <div [zurContextMenu]="menu" tabindex="0"
          style="display:grid; place-items:center; height:160px; border:2px dashed var(--zur-hairline); border-radius:14px; color:var(--zur-body); font:var(--zur-font-body)">
          Clique com o botão direito (ou Shift+F10) aqui
        </div>
        <zur-context-menu #menu>
          <zur-menu-item (selected)="ultimo = 'Renomear'">Renomear</zur-menu-item>
          <zur-menu-item (selected)="ultimo = 'Duplicar'">Duplicar</zur-menu-item>
          <zur-menu-item (selected)="ultimo = 'Excluir'">Excluir</zur-menu-item>
        </zur-context-menu>
        <p style="color:var(--zur-body)">Última ação: <strong>{{ ultimo }}</strong></p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const area = canvas.getByText(/Clique com o botão direito/);
    area.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 120, clientY: 120 }));
    await expect(await canvas.findByRole('menu', { name: 'Menu de contexto' })).toBeTruthy();
  },
};
