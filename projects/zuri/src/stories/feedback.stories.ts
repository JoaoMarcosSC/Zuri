import { Component, inject } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { ZurModal } from '../lib/modal/modal';
import { ZurToastService } from '../lib/toast/toast.service';
import { ZurToastContainer } from '../lib/toast/toast-container';
import { ZurTooltip } from '../lib/tooltip/tooltip';
import { ZurAlert } from '../lib/alert/alert';
import { ZurSpinner } from '../lib/spinner/spinner';
import { ZurSkeleton } from '../lib/skeleton/skeleton';
import { ZurButton } from '../lib/button/button';

@Component({
  selector: 'demo-toasts',
  imports: [ZurToastContainer, ZurButton],
  template: `
    <div style="display:flex; gap:12px;">
      <button zur-button size="sm" (click)="toast.show('Reserva confirmada!', 'success')">
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
      <zur-modal [(open)]="aberto" title="Confirmar reserva">
        <p style="margin:0;">
          Chalé na serra · 12–15 de dezembro · 2 hóspedes.
          Deseja confirmar a reserva?
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
        <zur-alert kind="success">Reserva confirmada com sucesso.</zur-alert>
        <zur-alert kind="info">O check-in abre às 14h.</zur-alert>
        <zur-alert kind="warning">Restam apenas 2 datas disponíveis.</zur-alert>
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
