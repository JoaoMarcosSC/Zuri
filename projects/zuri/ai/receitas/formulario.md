# Receita: formulário de cadastro/edição

**Quando usar:** criar ou editar um registro, configurações, wizard curto.
**Layout:** `zur-form-layout` (coluna de leitura, barra de ações fixa no rodapé).

```ts
// arquivo: src/app/clientes/cliente-form.page.ts
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormField, email, form, required, submit } from '@angular/forms/signals';
import {
  ZurButton, ZurCheckbox, ZurCombobox, ZurComboboxOption, ZurDatePicker, ZurFormLayout, ZurInput,
  ZurPageHeader, ZurSegmented, ZurTextarea, ZurToastService,
} from '@juau/zuri';

interface Cliente {
  nome: string;
  email: string;
  tipo: string;
  cidade: string | null;
  nascimento: Date | null;
  observacoes: string;
  receberNovidades: boolean;
}

@Component({
  selector: 'app-cliente-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField, ZurFormLayout, ZurPageHeader, ZurInput, ZurSegmented, ZurCombobox, ZurDatePicker, ZurTextarea,
    ZurCheckbox, ZurButton,
  ],
  template: `
    <zur-form-layout>
      <zur-page-header title="Novo cliente" description="Os campos com * são obrigatórios." />
      <form class="stack" id="cliente" (submit)="salvar($event)" novalidate>
        <zur-input label="Nome *" [formField]="f.nome" [error]="erro(f.nome)" />
        <zur-input label="E-mail *" type="email" [formField]="f.email" [error]="erro(f.email)" />
        <zur-segmented label="Tipo" [options]="tipos" [formField]="f.tipo" />
        <zur-combobox label="Cidade" [options]="cidades" [formField]="f.cidade" />
        <zur-date-picker label="Nascimento" [formField]="f.nascimento" />
        <zur-textarea label="Observações" [formField]="f.observacoes" />
        <zur-checkbox [formField]="f.receberNovidades">Receber novidades por e-mail</zur-checkbox>
      </form>
      <div zurLayoutActions>
        <button zur-button variant="ghost" type="button" (click)="cancelar()">Cancelar</button>
        <button zur-button variant="primary" type="submit" form="cliente" [disabled]="f().submitting()">Salvar</button>
      </div>
    </zur-form-layout>
  `,
  styles: `.stack { display: grid; gap: var(--zur-space-lg); }`,
})
export class ClienteFormPage {
  private readonly toast = inject(ZurToastService);

  protected readonly tipos = [
    { value: 'pf', label: 'Pessoa física' },
    { value: 'pj', label: 'Empresa' },
  ];
  protected readonly cidades: ZurComboboxOption[] = [
    { value: 'sp', label: 'São Paulo' },
    { value: 'rj', label: 'Rio de Janeiro' },
    { value: 'bh', label: 'Belo Horizonte' },
  ];

  protected readonly cliente = signal<Cliente>({
    nome: '', email: '', tipo: 'pf', cidade: null, nascimento: null, observacoes: '', receberNovidades: false,
  });
  protected readonly f = form(this.cliente, (p) => {
    required(p.nome, { message: 'Informe o nome.' });
    required(p.email, { message: 'Informe o e-mail.' });
    email(p.email, { message: 'E-mail inválido.' });
  });

  /** Mensagem do primeiro erro, só depois que o campo foi tocado. */
  protected erro(campo: typeof this.f.nome): string {
    const s = campo();
    return s.touched() && s.invalid() ? (s.errors()[0]?.message ?? '') : '';
  }

  protected async salvar(event: Event): Promise<void> {
    event.preventDefault();
    await submit(this.f, async () => {
      // await this.api.criar(this.cliente());  ← chamada real
      this.toast.show('Cliente salvo', 'success');
      return undefined;
    });
  }

  protected cancelar(): void {
    history.back();
  }
}
```

**Notas**
- `zur-form-layout` com `[steps]` e `[current]` vira wizard; para etapas com conteúdo próprio use `zur-stepper`.
- Escolha única entre 2–4 opções: `zur-segmented` ou `zur-radio`; listas longas: `zur-combobox` (`multiple` para várias).
- O app precisa de `<zur-toast-container />` uma vez no componente raiz para os toasts aparecerem.
