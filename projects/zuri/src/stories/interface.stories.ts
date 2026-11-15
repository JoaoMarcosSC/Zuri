import { Component, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { FormsModule } from '@angular/forms';
import { expect, userEvent, within } from 'storybook/test';
import { ZurAvatarGroup } from '../lib/avatar-group/avatar-group';
import { ZurBanner } from '../lib/banner/banner';
import { ZurButton } from '../lib/button/button';
import { ZurCarousel, ZurCarouselSlide } from '../lib/carousel/carousel';
import { ZurNumberInput } from '../lib/number-input/number-input';
import { ZurOtpInput } from '../lib/otp-input/otp-input';
import { ZurRating } from '../lib/rating/rating';
import { ZurStepper, ZurStepperStep } from '../lib/stepper/stepper';
import { ZurTimePicker } from '../lib/time-picker/time-picker';

@Component({
  selector: 'demo-checkout',
  imports: [ZurStepper, ZurStepperStep, ZurButton],
  template: `
    <zur-stepper #s linear [(index)]="etapa">
      <zur-stepper-step label="Endereço" description="Onde entregar">
        <p style="margin:0 0 16px">Rua das Palmeiras, 120 — Vila Verde.</p>
        <button zur-button (click)="s.next()">Continuar</button>
      </zur-stepper-step>
      <zur-stepper-step label="Pagamento" description="Cartão ou Pix">
        <p style="margin:0 0 16px">Pix com 5% de desconto.</p>
        <button zur-button variant="ghost" (click)="s.previous()">Voltar</button>
        <button zur-button (click)="s.next()">Continuar</button>
      </zur-stepper-step>
      <zur-stepper-step label="Revisão">
        <p style="margin:0 0 16px">Monstera deliciosa + vaso de barro.</p>
        <button zur-button variant="ghost" (click)="s.previous()">Voltar</button>
        <button zur-button>Finalizar pedido</button>
      </zur-stepper-step>
    </zur-stepper>
  `,
})
class DemoCheckout {
  etapa = signal(0);
}

const meta: Meta = {
  title: 'Interface',
  decorators: [
    moduleMetadata({
      imports: [
        FormsModule, DemoCheckout, ZurAvatarGroup, ZurBanner, ZurCarousel, ZurCarouselSlide,
        ZurNumberInput, ZurOtpInput, ZurRating, ZurTimePicker, ZurButton,
      ],
    }),
  ],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

export const Stepper: Story = {
  render: () => ({ template: `<div style="max-width:720px"><demo-checkout /></div>` }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Continuar' }));
    await expect(canvas.getByRole('button', { name: /Etapa 2 de 3/ }).getAttribute('aria-current')).toBe('step');
  },
};

export const Carousel: Story = {
  render: () => ({
    props: { i: 0 },
    template: `
      <zur-carousel label="Destaques da semana" [(index)]="i" style="max-width:640px">
        <zur-carousel-slide><div style="height:220px; display:grid; place-items:center; background:var(--zur-primary-soft); color:var(--zur-on-primary-soft); font:var(--zur-font-headline)">Monstera deliciosa</div></zur-carousel-slide>
        <zur-carousel-slide><div style="height:220px; display:grid; place-items:center; background:var(--zur-surface-strong); color:var(--zur-ink); font:var(--zur-font-headline)">Kit de suculentas</div></zur-carousel-slide>
        <zur-carousel-slide><div style="height:220px; display:grid; place-items:center; background:var(--zur-info-soft); color:var(--zur-info-text); font:var(--zur-font-headline)">Vasos de barro</div></zur-carousel-slide>
      </zur-carousel>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Próximo slide' }));
    await expect(canvas.getByRole('button', { name: 'Ir para o slide 2' }).getAttribute('aria-current')).toBe('true');
  },
};

export const AvatarGroup: Story = {
  name: 'Avatar group',
  render: () => ({
    props: { equipe: ['Ana Silva', 'Bruno Costa', 'Carla Dias', 'Diego Melo', 'Eva Lima', 'Fábio Reis'].map((name) => ({ name })) },
    template: `
      <div style="display:grid; gap:20px">
        <zur-avatar-group label="Equipe do pedido" [people]="equipe" [max]="4" />
        <zur-avatar-group label="Equipe pequena" size="sm" [people]="equipe" [max]="3" />
      </div>
    `,
  }),
};

export const Banner: Story = {
  render: () => ({
    props: { aberto: true },
    template: `
      <div style="display:grid; gap:12px; border-radius:14px; overflow:hidden">
        <zur-banner kind="info" dismissible [(open)]="aberto">
          Frete grátis em compras acima de R$ 150.
          <a zurBannerAction href="#">Ver regras</a>
        </zur-banner>
        <zur-banner kind="success">Seu pedido foi confirmado.</zur-banner>
        <zur-banner kind="warning">Manutenção hoje às 22h; o site pode ficar fora do ar por alguns minutos.</zur-banner>
        <zur-banner kind="error">Sem conexão. Tentando reconectar…</zur-banner>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Fechar' }));
    await expect(canvas.queryByText(/Frete grátis/)?.closest('zur-banner')?.hasAttribute('hidden')).toBe(true);
  },
};

export const Rating: Story = {
  render: () => ({
    props: { nota: 4 },
    template: `
      <div style="display:grid; gap:20px">
        <zur-rating label="Sua nota" [(ngModel)]="nota" />
        <zur-rating size="sm" readonly [value]="4.5" />
        <zur-rating size="lg" readonly [value]="3.2" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: '5 estrelas' }));
    await expect(canvas.getByRole('radio', { name: '5 estrelas' }).getAttribute('aria-checked')).toBe('true');
  },
};

export const NumberInput: Story = {
  name: 'Number input',
  render: () => ({
    props: { qtd: 2, preco: 49.9 },
    template: `
      <div style="display:grid; gap:24px; max-width:260px">
        <zur-number-input label="Quantidade" [min]="1" [max]="10" [(ngModel)]="qtd" hint="Entre 1 e 10 unidades." />
        <zur-number-input label="Preço (R$)" [min]="0" [step]="0.1" [(ngModel)]="preco" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getAllByRole('spinbutton')[0];
    await userEvent.click(canvas.getAllByRole('button', { name: 'Aumentar' })[0]);
    await expect(field.getAttribute('aria-valuenow')).toBe('3');
  },
};

export const OtpInput: Story = {
  name: 'OTP',
  render: () => ({
    props: { codigo: '', ok: '' },
    template: `
      <div style="display:grid; gap:12px">
        <zur-otp-input label="Código enviado por SMS" [length]="6" [(ngModel)]="codigo" (completed)="ok = $event" hint="Digite os 6 dígitos." />
        @if (ok) { <p style="margin:0; color:var(--zur-success-text)">Código completo: {{ ok }}</p> }
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox', { name: 'Dígito 1 de 6' }), '123456');
    await expect(canvas.getByText('Código completo: 123456')).toBeTruthy();
  },
};

export const TimePicker: Story = {
  name: 'Time picker',
  render: () => ({
    props: { hora: '10:15' },
    template: `
      <div style="max-width:260px; min-height:340px">
        <zur-time-picker label="Retirada na loja" min="09:00" max="18:00" [minuteStep]="15" [(ngModel)]="hora" hint="Das 9h às 18h." />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Retirada na loja/ }));
    await expect(canvas.getByRole('dialog')).toBeTruthy();
  },
};
