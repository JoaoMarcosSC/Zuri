import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { FormsModule } from '@angular/forms';
import { ZurInput } from '../lib/input/input';
import { ZurSelect } from '../lib/select/select';
import { ZurCheckbox } from '../lib/checkbox/checkbox';
import { ZurRadio } from '../lib/radio/radio';
import { ZurSwitch } from '../lib/switch/switch';
import { ZurTextarea } from '../lib/textarea/textarea';
import { ZurCombobox } from '../lib/combobox/combobox';
import { ZurDatePicker } from '../lib/date-picker/date-picker';
import { ZurFileUpload } from '../lib/file-upload/file-upload';
import { ZurChips } from '../lib/chips/chips';
import { ZurSlider } from '../lib/slider/slider';
import { ZurSegmented } from '../lib/segmented/segmented';
import { expect, userEvent, within } from 'storybook/test';

const meta: Meta = {
  title: 'Formulários/Controles',
  decorators: [
    moduleMetadata({
      imports: [
        FormsModule,
        ZurInput,
        ZurSelect,
        ZurCheckbox,
        ZurRadio,
        ZurSwitch,
        ZurTextarea,
        ZurCombobox,
        ZurDatePicker,
        ZurFileUpload,
        ZurChips,
        ZurSlider,
        ZurSegmented,
      ],
    }),
  ],
};
export default meta;

type Story = StoryObj;

export const Input: Story = {
  render: () => ({
    props: { email: '' },
    template: `
      <div style="display:grid; gap:24px; max-width:360px;">
        <zur-input label="E-mail" placeholder="voce@exemplo.com" [(ngModel)]="email"
          hint="Nunca compartilharemos seu e-mail." />
        <zur-input label="Senha" type="password" error="A senha precisa de 8 caracteres." />
        <zur-input label="Desabilitado" placeholder="Indisponível" disabled />
      </div>
    `,
  }),
};

export const Select: Story = {
  render: () => ({
    props: {
      categoria: '',
      opcoes: [
        { value: 'folhagem', label: 'Folhagens' },
        { value: 'suculenta', label: 'Suculentas' },
        { value: 'ervas', label: 'Ervas e temperos' },
      ],
    },
    template: `
      <div style="max-width:360px;">
        <zur-select label="Categoria" placeholder="Escolha uma categoria"
          [options]="opcoes" [(ngModel)]="categoria" />
      </div>
    `,
  }),
};

export const CheckboxRadioSwitch: Story = {
  name: 'Checkbox · Radio · Switch',
  render: () => ({
    props: { aceito: true, plano: 'mensal', notificacoes: true },
    template: `
      <div style="display:grid; gap:24px;">
        <zur-checkbox [(ngModel)]="aceito">Aceito os termos de uso</zur-checkbox>
        <div style="display:grid; gap:12px;">
          <zur-radio name="plano" value="mensal" [(ngModel)]="plano">Plano mensal</zur-radio>
          <zur-radio name="plano" value="anual" [(ngModel)]="plano">Plano anual (2 meses grátis)</zur-radio>
        </div>
        <zur-switch [(ngModel)]="notificacoes">Receber notificações</zur-switch>
      </div>
    `,
  }),
};

export const Textarea: Story = {
  render: () => ({
    props: { mensagem: '' },
    template: `
      <div style="display:grid; gap:24px; max-width:420px;">
        <zur-textarea label="Mensagem" placeholder="Escreva um recado para quem vai receber" [maxlength]="200" [(ngModel)]="mensagem" />
        <zur-textarea label="Observações" hint="Opcional." [rows]="3" />
        <zur-textarea label="Com erro" error="Escreva pelo menos 10 caracteres." />
      </div>
    `,
  }),
};

const plantas = [
  { value: 'jiboia', label: 'Jiboia', description: 'Meia-sombra · fácil' },
  { value: 'costela', label: 'Costela-de-adão', description: 'Luz indireta · média' },
  { value: 'orquidea', label: 'Orquídea', description: 'Luz filtrada · exigente' },
  { value: 'zamioculca', label: 'Zamioculca', description: 'Pouca luz · muito fácil' },
  { value: 'espada', label: 'Espada-de-são-jorge', description: 'Qualquer luz · muito fácil' },
];

export const Combobox: Story = {
  render: () => ({
    props: { planta: null, plantas },
    template: `
      <div style="max-width:360px; min-height:340px;">
        <zur-combobox label="Planta" placeholder="Busque pelo nome" [options]="plantas" [(ngModel)]="planta"
          hint="Aceita sem acento e por iniciais (ex.: cda)." />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('combobox', { name: 'Planta' });
    await userEvent.type(field, 'orq');
    await expect(canvas.getByRole('option', { name: /Orquídea/ })).toBeTruthy();
  },
};

export const DatePicker: Story = {
  name: 'Date picker',
  render: () => ({
    props: { entrega: null, periodo: null, hoje: new Date() },
    template: `
      <div style="display:grid; gap:24px; max-width:360px; min-height:460px;">
        <zur-date-picker label="Entrega" placeholder="Escolha a data" [min]="hoje" [(ngModel)]="entrega" />
        <zur-date-picker label="Férias (quem rega?)" placeholder="Início e fim" mode="range" [(ngModel)]="periodo" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Entrega/ }));
    await expect(canvas.getByRole('grid')).toBeTruthy();
  },
};

export const FileUpload: Story = {
  name: 'Upload de arquivos',
  render: () => ({
    props: {
      fotos: [
        { id: 'f1', file: new File(['x'.repeat(240000)], 'monstera-folha-nova.jpg'), progress: null, status: 'done' },
        { id: 'f2', file: new File(['x'.repeat(1800000)], 'jiboia-varanda.png'), progress: 62, status: 'uploading' },
        { id: 'f3', file: new File(['x'.repeat(90000)], 'nota-fiscal.pdf'), progress: null, status: 'error', error: 'Falha no envio. Tente de novo.' },
      ],
    },
    template: `
      <div style="max-width:480px;">
        <zur-file-upload label="Fotos da sua planta" accept="image/*,.pdf" [maxSize]="5242880" multiple
          hint="PNG, JPG ou PDF até 5 MB." [(files)]="fotos" />
      </div>
    `,
  }),
};

export const ChipsSliderSegmented: Story = {
  name: 'Chips · Slider · Segmented',
  render: () => ({
    props: {
      ambientes: ['Sala', 'Varanda'],
      altura: 40,
      preco: [50, 300],
      visao: 'grade',
      visoes: [
        { value: 'grade', label: 'Grade' },
        { value: 'lista', label: 'Lista' },
        { value: 'mapa', label: 'Mapa' },
      ],
      reais: (v: number) => 'R$ ' + v,
    },
    template: `
      <div style="display:grid; gap:32px; max-width:420px;">
        <zur-chips label="Ambientes" placeholder="Digite e tecle Enter" [(ngModel)]="ambientes" />
        <zur-slider label="Altura máxima (cm)" [min]="10" [max]="200" [step]="5" [(ngModel)]="altura" />
        <zur-slider label="Faixa de preço" range [min]="0" [max]="500" [step]="10" [format]="reais" [(ngModel)]="preco" />
        <zur-segmented label="Visualização" [options]="visoes" [(ngModel)]="visao" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('Ambientes'), 'Cozinha{enter}');
    await expect(canvas.getByText('Cozinha')).toBeTruthy();
  },
};
