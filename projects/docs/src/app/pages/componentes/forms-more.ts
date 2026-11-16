import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ZurChip,
  ZurChipGroup,
  ZurCombobox,
  ZurComboboxOption,
  ZurDivider,
  ZurInlineEdit,
  ZurLink,
  ZurSearch,
} from '@juau/zuri';
import { CodeBlock } from '../../shared/code-block/code-block';

/** Multiselect, chips interativos, busca, edição no lugar, link e divider. */
@Component({
  selector: 'docs-forms-more',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, CodeBlock, ZurCombobox, ZurChip, ZurChipGroup, ZurSearch, ZurInlineEdit, ZurLink, ZurDivider],
  templateUrl: './forms-more.html',
  styleUrl: './componentes.css',
  styles: `
    :host {
      max-width: none;
      margin: 0;
    }
    .stack {
      display: grid;
      gap: var(--zur-space-lg);
      width: 100%;
      max-width: 480px;
    }
    .readout {
      margin: 0;
      font: var(--zur-font-caption);
      color: var(--zur-muted);
    }
  `,
})
export class FormsMore {
  protected readonly ambientes: ZurComboboxOption[] = [
    { value: 'sala', label: 'Sala', description: 'Luz indireta' },
    { value: 'varanda', label: 'Varanda', description: 'Sol da manhã' },
    { value: 'quarto', label: 'Quarto' },
    { value: 'cozinha', label: 'Cozinha' },
    { value: 'escritorio', label: 'Escritório' },
  ];
  protected readonly escolhidos = signal<string[]>(['sala', 'varanda']);

  protected readonly ambiente = signal<string | null>('sala');
  protected readonly luz = signal<string[]>(['sol']);
  protected readonly petFriendly = signal(false);
  protected readonly removidos = signal<string[]>([]);

  protected readonly termo = signal('');
  protected readonly enviado = signal('');

  protected readonly nome = signal('Pedido 42');
  protected readonly notas = signal('Entregar pela manhã.');
  protected readonly salvo = signal('—');

  protected readonly codeMultiselect = `<zur-combobox
  label="Ambientes"
  multiple
  [options]="ambientes"
  [(ngModel)]="escolhidos"   <!-- string[] -->
/>

// escolher mantém a lista aberta; Backspace no campo vazio remove o último chip.
// Para escolha única continue usando <zur-combobox> sem "multiple" ou <zur-select>.`;

  protected readonly codeChips = `<!-- escolha única: radiogroup, setas trocam a opção -->
<zur-chip-group label="Ambiente" mode="single" [(ngModel)]="ambiente">
  <zur-chip value="sala">Sala</zur-chip>
  <zur-chip value="varanda">Varanda</zur-chip>
</zur-chip-group>

<!-- vários: botões de alternar -->
<zur-chip-group label="Luz" mode="multiple" [(ngModel)]="luz">…</zur-chip-group>

<!-- avulsos -->
<zur-chip variant="filter" [(selected)]="petFriendly">Pet friendly</zur-chip>
<zur-chip (click)="abrirGuia()">Ver guia de rega</zur-chip>
<zur-chip removable label="Monstera" (removed)="tirar('monstera')">Monstera</zur-chip>`;

  protected readonly codeSearch = `<zur-search
  label="Buscar plantas"
  placeholder="Monstera, jiboia…"
  [debounceMs]="250"
  (searchChange)="filtrar($event)"
  (submitted)="buscar($event)"
/>`;

  protected readonly codeInlineEdit = `<zur-inline-edit label="Nome do pedido" [(ngModel)]="nome" (saved)="persistir($event)" />
<zur-inline-edit label="Notas" multiline placeholder="Sem notas" [(ngModel)]="notas" />

// Enter salva (Ctrl/⌘+Enter no multiline), Esc cancela, F2 abre, sair do campo salva.`;

  protected readonly codeLink = `<a zur-link href="/entregas">Política de entrega</a>
<a zur-link external href="https://exemplo.com">Guia de rega</a>
<!-- external: target="_blank", rel seguro, ícone e "(abre em nova aba)" para leitor de tela -->`;

  protected readonly codeDivider = `<zur-divider />
<zur-divider label="ou" />
<zur-divider orientation="vertical" />`;

  protected remover(nome: string): void {
    this.removidos.update((r) => [...r, nome]);
  }
}
