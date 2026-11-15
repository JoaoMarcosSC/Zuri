import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { ZurAvatar } from '../lib/avatar/avatar';

const meta: Meta<ZurAvatar> = {
  title: 'Fundamentos/Avatar',
  component: ZurAvatar,
  decorators: [moduleMetadata({ imports: [ZurAvatar] })],
  args: { name: 'João Marcos', size: 'md' },
  argTypes: { size: { control: 'select', options: ['sm', 'md', 'lg'] } },
  render: (args) => ({
    props: args,
    template: `<zur-avatar [name]="name" [src]="src" [size]="size" />`,
  }),
};
export default meta;

type Story = StoryObj<ZurAvatar>;

export const Iniciais: Story = {};

export const Tamanhos: Story = {
  render: () => ({
    template: `
      <div style="display:flex; gap:16px; align-items:center;">
        <zur-avatar name="Ana Silva" size="sm" />
        <zur-avatar name="João Marcos" size="md" />
        <zur-avatar name="Maria Oliveira Costa" size="lg" />
      </div>
    `,
  }),
};
