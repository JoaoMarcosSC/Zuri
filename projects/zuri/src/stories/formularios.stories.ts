import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { FormsModule } from '@angular/forms';
import { ZurInput } from '../lib/input/input';
import { ZurSelect } from '../lib/select/select';
import { ZurCheckbox } from '../lib/checkbox/checkbox';
import { ZurRadio } from '../lib/radio/radio';
import { ZurSwitch } from '../lib/switch/switch';
import { ZurTextarea } from '../lib/textarea/textarea';

const meta: Meta = {
  title: 'Formulários/Controles',
  decorators: [
    moduleMetadata({
      imports: [FormsModule, ZurInput, ZurSelect, ZurCheckbox, ZurRadio, ZurSwitch, ZurTextarea],
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
