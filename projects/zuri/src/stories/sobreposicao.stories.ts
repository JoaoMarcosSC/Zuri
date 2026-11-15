import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';
import { ZurButton } from '../lib/button/button';
import { ZurCheckbox } from '../lib/checkbox/checkbox';
import { ZurDrawer } from '../lib/drawer/drawer';
import { ZurInput } from '../lib/input/input';
import { ZurPopover, ZurPopoverTrigger } from '../lib/popover/popover';

const meta: Meta = {
  title: 'Sobreposição',
  decorators: [
    moduleMetadata({ imports: [ZurDrawer, ZurPopover, ZurPopoverTrigger, ZurButton, ZurInput, ZurCheckbox] }),
  ],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

export const Drawer: Story = {
  render: () => ({
    props: { aberto: false },
    template: `
      <button zur-button variant="primary" (click)="aberto = true">Abrir filtros</button>
      <zur-drawer [(open)]="aberto" title="Filtros">
        <div style="display:grid; gap:16px;">
          <zur-input label="Categoria" placeholder="Folhagem, suculenta…" />
          <zur-checkbox>Segura para pets</zur-checkbox>
        </div>
        <div zurDrawerActions>
          <button zur-button variant="primary" (click)="aberto = false">Aplicar</button>
        </div>
      </zur-drawer>
    `,
  }),
  // Abre o drawer no teste, para a checagem de acessibilidade cobrir o painel aberto.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Abrir filtros' }));
    await expect(within(document.body).getByRole('dialog', { name: 'Filtros' })).toBeTruthy();
  },
};

export const Popover: Story = {
  render: () => ({
    template: `
      <zur-popover label="Quantidade">
        <button zur-button variant="secondary" zurPopoverTrigger>Quantidade</button>
        <p style="margin:0; color:var(--zur-ink);">Unidades: 2 · Crianças: 0</p>
      </zur-popover>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Quantidade' }));
    await expect(canvas.getByRole('dialog', { name: 'Quantidade' })).toBeTruthy();
  },
};
