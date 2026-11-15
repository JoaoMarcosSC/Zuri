import { Component, inject } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ZurModal } from '../lib/modal/modal';
import { ZurToastService } from '../lib/toast/toast.service';
import { ZurToastContainer } from '../lib/toast/toast-container';
import { ZurTooltip } from '../lib/tooltip/tooltip';
import { ZurAlert } from '../lib/alert/alert';
import { ZurSpinner } from '../lib/spinner/spinner';
import { ZurSkeleton } from '../lib/skeleton/skeleton';
import { ZurProgress } from '../lib/progress/progress';
import { ZurButton } from '../lib/button/button';

@Component({
  selector: 'demo-toasts',
  imports: [ZurToastContainer, ZurButton],
  template: `
    <div style="display:flex; gap:12px;">
      <button zur-button size="sm" (click)="toast.show('Pedido confirmado!', 'success')">
        Toast de sucesso
      </button>
      <button zur-button variant="secondary" size="sm" (click)="toast.show('Algo deu errado.', 'error')">
        Toast de erro
      </button>
      <button zur-button variant="ghost" size="sm" (click)="toast.show('Link copiado.')">
        Toast neutro
      </button>
    </div>
    <zur-toast-container />
  `,
})
class DemoToasts {
  protected readonly toast = inject(ZurToastService);
}

const meta: Meta = {
  title: 'Feedback',
  decorators: [
    moduleMetadata({
      imports: [
        ZurModal,
        ZurTooltip,
        ZurAlert,
        ZurSpinner,
        ZurSkeleton,
        ZurProgress,
        ZurButton,
        DemoToasts,
      ],
    }),
  ],
};
export default meta;

type Story = StoryObj;

export const Modal: Story = {
  render: () => ({
    props: { aberto: false },
    template: `
      <button zur-button (click)="aberto = true">Abrir modal</button>
      <zur-modal [(open)]="aberto" title="Confirmar pedido">
        <p style="margin:0;">
          Monstera deliciosa · 2 unidades · entrega em até 2 dias úteis.
          Deseja confirmar o pedido?
        </p>
        <div zurModalActions>
          <button zur-button variant="ghost" (click)="aberto = false">Voltar</button>
          <button zur-button variant="primary" (click)="aberto = false">Confirmar</button>
        </div>
      </zur-modal>
    `,
  }),
};

export const Toasts: Story = {
  render: () => ({ template: `<demo-toasts />` }),
  // Abre os três tipos: o axe roda depois do play e avalia o contraste de cada toast.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const name of [/confirmar|sucesso/i, /erro|errado/i, /copiar|neutro/i]) {
      const botao = canvas.queryAllByRole('button').find((b) => name.test(b.textContent ?? ''));
      if (botao) await userEvent.click(botao);
    }
    await waitFor(() => {
      const toasts = canvasElement.ownerDocument.querySelectorAll('.toast');
      expect(toasts.length).toBe(3);
      // sucesso e erro levam ícone (a cor não é o único sinal); o neutro não
      expect(canvasElement.ownerDocument.querySelectorAll('.toast svg.icon').length).toBe(2);
    });
  },
};

export const Tooltip: Story = {
  render: () => ({
    template: `
      <div style="padding:48px;">
        <button zur-button variant="secondary" zurTooltip="Salvar nos favoritos">♥ Favoritar</button>
      </div>
    `,
  }),
};

export const Alertas: Story = {
  render: () => ({
    template: `
      <div style="display:grid; gap:12px; max-width:480px;">
        <zur-alert kind="success">Pedido confirmado com sucesso.</zur-alert>
        <zur-alert kind="info">A entrega sai em até 2 dias úteis.</zur-alert>
        <zur-alert kind="warning">Restam apenas 2 unidades.</zur-alert>
        <zur-alert kind="error">Não foi possível processar o pagamento.</zur-alert>
      </div>
    `,
  }),
};

export const Carregamento: Story = {
  name: 'Spinner · Skeleton',
  render: () => ({
    template: `
      <div style="display:flex; gap:32px; align-items:center; margin-bottom:32px;">
        <zur-spinner size="sm" />
        <zur-spinner size="md" />
        <zur-spinner size="lg" />
      </div>
      <div style="display:grid; gap:12px; max-width:360px;">
        <div style="display:flex; gap:12px; align-items:center;">
          <zur-skeleton width="40px" height="40px" [circle]="true" />
          <div style="flex:1; display:grid; gap:8px;">
            <zur-skeleton height="14px" width="60%" />
            <zur-skeleton height="12px" width="40%" />
          </div>
        </div>
        <zur-skeleton height="120px" />
      </div>
    `,
  }),
};

export const Progresso: Story = {
  render: () => ({
    template: `
      <div style="display:grid; gap:20px; max-width:420px; padding:24px;">
        <zur-progress [value]="25" label="Enviando fotos" />
        <zur-progress [value]="70" size="sm" label="Sincronizando" />
        <zur-progress label="Carregando" />
      </div>
    `,
  }),
};
