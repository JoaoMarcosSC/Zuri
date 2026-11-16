import { Component } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';
import { ZurFab, ZurIconButton } from '../lib/icon-button/icon-button';
import { ZurIcon } from '../lib/icon/icon';
import { ZUR_ICON_CATALOG, zurIconHeart, zurIconPencil, zurIconPlus, zurIconTrash } from '../lib/icon/icons';

@Component({
  selector: 'demo-catalogo',
  imports: [ZurIcon],
  template: `
    <ul style="list-style:none; margin:0; padding:0; display:grid; grid-template-columns:repeat(auto-fill, minmax(112px, 1fr)); gap:12px">
      @for (icone of catalogo; track icone.name) {
        <li style="display:grid; justify-items:center; gap:8px; padding:16px 8px; border:1px solid var(--zur-hairline); border-radius:var(--zur-radius-md); color:var(--zur-ink)">
          <zur-icon [icon]="icone" [size]="24" />
          <span style="font:var(--zur-font-caption); color:var(--zur-muted)">{{ icone.name }}</span>
        </li>
      }
    </ul>
  `,
})
class DemoCatalogo {
  catalogo = ZUR_ICON_CATALOG;
}

const meta: Meta = {
  title: 'Ícones',
  decorators: [moduleMetadata({ imports: [DemoCatalogo, ZurIcon, ZurIconButton, ZurFab] })],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

export const Catalogo: Story = {
  render: () => ({ template: `<demo-catalogo />` }),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('zur-icon').length).toBe(ZUR_ICON_CATALOG.length);
    await expect(canvasElement.querySelectorAll('zur-icon[aria-hidden=true]').length).toBe(ZUR_ICON_CATALOG.length);
  },
};

export const Tamanhos: Story = {
  render: () => ({
    props: { coracao: zurIconHeart },
    template: `
      <div style="display:flex; gap:24px; align-items:center; color:var(--zur-ink)">
        <zur-icon [icon]="coracao" [size]="16" />
        <zur-icon [icon]="coracao" [size]="20" />
        <zur-icon [icon]="coracao" [size]="24" />
        <zur-icon [icon]="coracao" [size]="24" label="Favorito" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('img', { name: 'Favorito' })).toBeTruthy();
  },
};

export const BotaoDeIcone: Story = {
  render: () => ({
    props: { lapis: zurIconPencil, lixeira: zurIconTrash, mais: zurIconPlus },
    template: `
      <div style="display:grid; gap:24px">
        <div style="display:flex; gap:12px; align-items:center">
          <button zur-icon-button label="Editar" size="sm"><zur-icon [icon]="lapis" [size]="16" /></button>
          <button zur-icon-button label="Editar"><zur-icon [icon]="lapis" /></button>
          <button zur-icon-button label="Excluir" variant="secondary"><zur-icon [icon]="lixeira" /></button>
          <button zur-icon-button label="Adicionar" variant="primary"><zur-icon [icon]="mais" /></button>
          <button zur-icon-button label="Indisponível" disabled><zur-icon [icon]="lixeira" /></button>
        </div>
        <div style="display:flex; gap:16px; align-items:center">
          <button zur-fab label="Novo pedido"><zur-icon [icon]="mais" [size]="24" /></button>
          <button zur-fab extended><zur-icon [icon]="mais" /> Novo pedido</button>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('button', { name: 'Editar' }).length).toBe(2);
    await expect(canvas.getAllByRole('button', { name: 'Novo pedido' }).length).toBe(2); // FAB compacto e estendido
  },
};
