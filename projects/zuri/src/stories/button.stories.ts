import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { ZurButton } from '../lib/button/button';

const meta: Meta<ZurButton> = {
  title: 'Fundamentos/Button',
  component: ZurButton,
  decorators: [moduleMetadata({ imports: [ZurButton] })],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'pill'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
  args: { variant: 'primary', size: 'md' },
  render: (args) => ({
    props: args,
    template: `<button zur-button [variant]="variant" [size]="size">Reservar agora</button>`,
  }),
};
export default meta;

type Story = StoryObj<ZurButton>;

export const Primary: Story = {};

export const Secondary: Story = { args: { variant: 'secondary' } };

export const Ghost: Story = { args: { variant: 'ghost' } };

export const Pill: Story = { args: { variant: 'pill' } };

export const Tamanhos: Story = {
  render: () => ({
    template: `
      <div style="display:flex; gap:16px; align-items:center;">
        <button zur-button size="sm">Pequeno</button>
        <button zur-button size="md">Médio</button>
        <button zur-button size="lg">Grande</button>
        <button zur-button disabled>Desabilitado</button>
      </div>
    `,
  }),
};
