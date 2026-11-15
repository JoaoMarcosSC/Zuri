import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { ZurCard } from '../lib/card/card';
import { ZurBadge } from '../lib/badge/badge';
import { ZurButton } from '../lib/button/button';

const meta: Meta<ZurCard> = {
  title: 'Fundamentos/Card',
  component: ZurCard,
  decorators: [moduleMetadata({ imports: [ZurCard, ZurBadge, ZurButton] })],
  args: { interactive: false },
  render: (args) => ({
    props: args,
    template: `
      <zur-card [interactive]="interactive" style="max-width:360px;">
        <zur-badge color="mint">DESTAQUE</zur-badge>
        <h3 style="font:var(--zur-font-title); color:var(--zur-ink); margin:12px 0 4px;">
          Chalé na serra
        </h3>
        <p style="margin:0 0 16px;">
          Vista para o vale, lareira e café da manhã incluso.
        </p>
        <button zur-button size="sm">Ver detalhes</button>
      </zur-card>
    `,
  }),
};
export default meta;

type Story = StoryObj<ZurCard>;

export const Padrao: Story = {};

export const Interativo: Story = { args: { interactive: true } };
