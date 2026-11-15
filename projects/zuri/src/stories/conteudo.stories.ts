import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { ZurAccordion, ZurAccordionItem } from '../lib/accordion/accordion';
import { ZurButton } from '../lib/button/button';
import { ZurEmptyState } from '../lib/empty-state/empty-state';

const meta: Meta = {
  title: 'Conteúdo',
  decorators: [moduleMetadata({ imports: [ZurAccordion, ZurAccordionItem, ZurEmptyState, ZurButton] })],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

export const Accordion: Story = {
  render: () => ({
    template: `
      <div style="max-width:560px;">
        <zur-accordion>
          <zur-accordion-item title="Como funciona o check-in?" [open]="true">
            A partir das 14h, com o código enviado por e-mail no dia da chegada.
          </zur-accordion-item>
          <zur-accordion-item title="Posso cancelar a reserva?">
            Sim, sem custo até 48 horas antes do check-in.
          </zur-accordion-item>
          <zur-accordion-item title="Aceita animais?">
            Depende da hospedagem.
          </zur-accordion-item>
        </zur-accordion>
      </div>
    `,
  }),
};

export const EstadoVazio: Story = {
  name: 'Empty state',
  render: () => ({
    template: `
      <zur-empty-state title="Nenhuma reserva ainda" description="Quando você reservar uma hospedagem, ela aparece aqui.">
        <svg zurEmptyIcon viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></svg>
        <button zur-button variant="primary" size="sm">Explorar hospedagens</button>
      </zur-empty-state>
    `,
  }),
};
