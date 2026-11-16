import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { FormsModule } from '@angular/forms';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ZurChip, ZurChipGroup } from '../lib/chip/chip';
import { ZurCombobox } from '../lib/combobox/combobox';
import { ZurDivider } from '../lib/divider/divider';
import { ZurInlineEdit } from '../lib/inline-edit/inline-edit';
import { ZurLink } from '../lib/link/link';
import { ZurSearch } from '../lib/search/search';

const meta: Meta = {
  title: 'Formulários extras',
  decorators: [
    moduleMetadata({
      imports: [FormsModule, ZurChip, ZurChipGroup, ZurCombobox, ZurDivider, ZurInlineEdit, ZurLink, ZurSearch],
    }),
  ],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

const ambientes = [
  { value: 'sala', label: 'Sala', description: 'Luz indireta' },
  { value: 'varanda', label: 'Varanda', description: 'Sol da manhã' },
  { value: 'quarto', label: 'Quarto' },
  { value: 'cozinha', label: 'Cozinha' },
];

export const MultiselectNoCombobox: Story = {
  render: () => ({
    props: { ambientes, escolhidos: ['sala'] },
    template: `
      <div style="max-width:420px">
        <zur-combobox label="Ambientes da planta" multiple [options]="ambientes" [(ngModel)]="escolhidos"
          hint="Escolha quantos quiser; Backspace remove o último." />
        <p style="margin-top:12px" id="saida">{{ escolhidos.join(', ') }}</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('combobox', { name: /Ambientes/ }));
    await userEvent.click(await canvas.findByRole('option', { name: /Varanda/ }));
    await waitFor(() => expect(canvasElement.querySelector('#saida')?.textContent).toBe('sala, varanda'));
    await expect(canvas.getByRole('button', { name: 'Remover Varanda' })).toBeTruthy();
    await userEvent.keyboard('{Escape}');
  },
};

export const Chips: Story = {
  render: () => ({
    props: { sol: true, ambiente: 'sala', luz: ['sol'], removidos: [] as string[] },
    template: `
      <div style="display:grid; gap:24px; max-width:560px">
        <p style="margin:0; color:var(--zur-muted); font:var(--zur-font-body-sm)">
          <strong>zur-chip</strong> são os chips que se clicam (filtro, escolha, ação, remover).
          O <strong>zur-chips</strong> é o campo em que a pessoa digita para criar tags.
        </p>

        <zur-chip-group label="Ambiente (escolha única)" mode="single" [(ngModel)]="ambiente">
          <zur-chip value="sala">Sala</zur-chip>
          <zur-chip value="varanda">Varanda</zur-chip>
          <zur-chip value="quarto">Quarto</zur-chip>
        </zur-chip-group>

        <zur-chip-group label="Luz (vários)" mode="multiple" [(ngModel)]="luz">
          <zur-chip value="sol">Pleno sol</zur-chip>
          <zur-chip value="meia">Meia-sombra</zur-chip>
          <zur-chip value="sombra">Sombra</zur-chip>
          <zur-chip value="x" disabled>Indisponível</zur-chip>
        </zur-chip-group>

        <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center">
          <zur-chip variant="filter" [(selected)]="sol">Pet friendly</zur-chip>
          <zur-chip>Ver guia de rega</zur-chip>
          <zur-chip removable label="Monstera" (removed)="removidos.push('Monstera')">Monstera</zur-chip>
        </div>
        <p id="saida" style="margin:0">{{ ambiente }} · {{ luz.join(',') }} · {{ sol ? 'pet' : 'sem pet' }}</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: 'Varanda' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Meia-sombra' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Pet friendly' }));
    await waitFor(() => expect(canvasElement.querySelector('#saida')?.textContent).toBe('varanda · sol,meia · sem pet'));
    await expect(canvas.getByRole('radio', { name: 'Varanda' }).getAttribute('aria-checked')).toBe('true');
  },
};

export const Busca: Story = {
  render: () => ({
    props: { termo: '', enviado: '' },
    template: `
      <div style="max-width:420px">
        <zur-search label="Buscar plantas" placeholder="Monstera, jiboia…" [debounceMs]="150"
          [(ngModel)]="termo" (submitted)="enviado = $event" />
        <p style="margin-top:12px" id="saida">Digitado: {{ termo }} · Enviado: {{ enviado }}</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const campo = canvas.getByRole('searchbox', { name: 'Buscar plantas' });
    await userEvent.type(campo, 'jib{Enter}');
    await waitFor(() => expect(canvasElement.querySelector('#saida')?.textContent).toBe('Digitado: jib · Enviado: jib'));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect((campo as HTMLInputElement).value).toBe(''));
  },
};

export const EdicaoNoLugar: Story = {
  render: () => ({
    props: { nome: 'Pedido 42', notas: 'Entregar pela manhã.', salvo: '' },
    template: `
      <div style="display:grid; gap:16px; max-width:480px">
        <h3 style="margin:0; font:var(--zur-font-title); color:var(--zur-ink)">
          <zur-inline-edit label="Nome do pedido" [(ngModel)]="nome" (saved)="salvo = $event" />
        </h3>
        <zur-inline-edit label="Notas" multiline placeholder="Sem notas" [(ngModel)]="notas" />
        <p id="saida" style="margin:0; color:var(--zur-muted)">Salvo: {{ salvo }}</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Pedido 42/ }));
    const campo = await canvas.findByRole('textbox', { name: 'Nome do pedido' });
    await userEvent.clear(campo);
    await userEvent.type(campo, 'Pedido 43{Enter}');
    await waitFor(() => expect(canvasElement.querySelector('#saida')?.textContent).toBe('Salvo: Pedido 43'));
  },
};

export const LinkEDivider: Story = {
  render: () => ({
    template: `
      <div style="display:grid; gap:20px; max-width:420px; font:var(--zur-font-body); color:var(--zur-body)">
        <p style="margin:0">Leia a <a zur-link href="#entregas">política de entrega</a> antes de comprar.</p>
        <p style="margin:0">O <a zur-link external href="https://example.com/rega">guia de rega</a> abre em outra aba.</p>
        <zur-divider />
        <zur-divider label="ou" />
        <div style="display:flex; gap:16px; align-items:center; height:32px">
          Entrar <zur-divider orientation="vertical" /> Criar conta
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const externo = canvas.getByRole('link', { name: /guia de rega/ });
    await expect(externo.getAttribute('target')).toBe('_blank');
    await expect(externo.getAttribute('rel')).toBe('noopener noreferrer');
    await expect(externo.textContent).toContain('abre em nova aba');
  },
};
