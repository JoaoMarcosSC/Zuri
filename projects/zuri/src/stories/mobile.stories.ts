import { Component, inject } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ZurBottomNav, ZurBottomNavItem } from '../lib/bottom-nav/bottom-nav';
import { ZurButton } from '../lib/button/button';
import { ZurDrawer } from '../lib/drawer/drawer';
import { ZurIcon } from '../lib/icon/icon';
import { zurIconBell, zurIconHeart, zurIconHome, zurIconUser } from '../lib/icon/icons';
import { ZurToastContainer } from '../lib/toast/toast-container';
import { ZurToastService } from '../lib/toast/toast.service';

@Component({
  selector: 'demo-toasts-acao',
  imports: [ZurToastContainer, ZurButton],
  template: `
    <div style="display:flex; gap:12px; flex-wrap:wrap">
      <button zur-button size="sm" (click)="remover()">Remover planta</button>
      <button zur-button size="sm" variant="secondary" (click)="offline()">Simular queda de conexão</button>
    </div>
    <p id="status" style="margin-top:16px">{{ status }}</p>
    <zur-toast-container />
  `,
})
class DemoToastsAcao {
  private readonly toast = inject(ZurToastService);
  status = 'pronto';

  remover(): void {
    this.status = 'removida';
    this.toast.show('Planta removida', 'neutral', {
      action: { label: 'Desfazer', handler: () => (this.status = 'restaurada') },
    });
  }

  offline(): void {
    this.toast.show('Sem conexão. Tentando de novo…', 'error', { persistent: true });
  }
}

const meta: Meta = {
  title: 'Mobile',
  decorators: [
    moduleMetadata({
      imports: [DemoToastsAcao, ZurBottomNav, ZurBottomNavItem, ZurButton, ZurDrawer, ZurIcon],
    }),
  ],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

export const BarraInferior: Story = {
  render: () => ({
    props: { casa: zurIconHome, coracao: zurIconHeart, sino: zurIconBell, usuario: zurIconUser },
    template: `
      <div style="max-width:390px; border:1px solid var(--zur-hairline); border-radius:var(--zur-radius-lg); overflow:hidden">
        <div style="height:160px; padding:16px; color:var(--zur-body)">Conteúdo da tela</div>
        <zur-bottom-nav [fixed]="false" [responsive]="false" label="Navegação principal">
          <a zur-bottom-nav-item href="#inicio" active><zur-icon zurBottomNavIcon [icon]="casa" [size]="24" /> Início</a>
          <a zur-bottom-nav-item href="#favoritos"><zur-icon zurBottomNavIcon [icon]="coracao" [size]="24" /> Favoritos</a>
          <a zur-bottom-nav-item href="#avisos" [badge]="3"><zur-icon zurBottomNavIcon [icon]="sino" [size]="24" /> Avisos</a>
          <a zur-bottom-nav-item href="#perfil" badge="dot"><zur-icon zurBottomNavIcon [icon]="usuario" [size]="24" /> Perfil</a>
        </zur-bottom-nav>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole('navigation', { name: 'Navegação principal' });
    await expect(within(nav).getByRole('link', { name: /Início/ }).getAttribute('aria-current')).toBe('page');
    await expect(within(nav).getByRole('link', { name: /Avisos/ }).textContent).toContain('3 novos');
  },
};

export const BottomSheet: Story = {
  render: () => ({
    props: { aberto: false },
    template: `
      <button zur-button (click)="aberto = true">Compartilhar</button>
      <zur-drawer [(open)]="aberto" side="bottom" title="Compartilhar planta">
        <p style="margin:0 0 16px">Envie a Monstera deliciosa para um amigo.</p>
        <button zur-button style="width:100%">Copiar link</button>
      </zur-drawer>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Compartilhar' }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog', { name: 'Compartilhar planta' });
    await expect(dialog.querySelector('.grabber')).not.toBeNull();
    await expect(canvasElement.querySelector('zur-drawer')?.getAttribute('data-side')).toBe('bottom');
  },
};

export const ToastComAcao: Story = {
  render: () => ({ template: `<demo-toasts-acao />` }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Remover planta' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Simular queda de conexão' }));
    await userEvent.click(await canvas.findByRole('button', { name: 'Desfazer' }));
    await waitFor(() => expect(canvasElement.querySelector('#status')?.textContent).toBe('restaurada'));
    // o toast persistente continua na tela depois da ação do outro
    await expect(canvas.getByText(/Sem conexão/)).toBeTruthy();
  },
};
