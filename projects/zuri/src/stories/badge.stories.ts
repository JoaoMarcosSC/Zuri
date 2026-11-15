import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { ZurBadge } from '../lib/badge/badge';

const meta: Meta<ZurBadge> = {
  title: 'Fundamentos/Badge',
  component: ZurBadge,
  decorators: [moduleMetadata({ imports: [ZurBadge] })],
  argTypes: {
    color: {
      control: 'select',
      options: ['mint', 'success', 'warning', 'error', 'info', 'neutral'],
    },
  },
  args: { color: 'mint' },
  render: (args) => ({
    props: args,
    template: `<zur-badge [color]="color">NOVO</zur-badge>`,
  }),
};
export default meta;

type Story = StoryObj<ZurBadge>;

export const Mint: Story = {};

export const Todas: Story = {
  render: () => ({
    template: `
      <div style="display:flex; gap:12px; flex-wrap:wrap;">
        <zur-badge color="mint">NOVO</zur-badge>
        <zur-badge color="success">Confirmado</zur-badge>
        <zur-badge color="warning">Pendente</zur-badge>
        <zur-badge color="error">Cancelado</zur-badge>
        <zur-badge color="info">Info</zur-badge>
        <zur-badge color="neutral">Rascunho</zur-badge>
      </div>
    `,
  }),
};
