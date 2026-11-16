# Receita: lista e detalhe

**Quando usar:** caixa de entrada, catálogo, conversas: escolher um item à esquerda e ver o detalhe à direita.
**Layout:** `zur-list-detail-layout`. No celular mostra um painel por vez (`detailOpen`).

```ts
// arquivo: src/app/mensagens/mensagens.page.ts
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  ZurAvatar, ZurBadge, ZurEmptyState, ZurList, ZurListDetailLayout, ZurListItem, ZurPageHeader, ZurTopbar,
} from '@juau/zuri';

interface Mensagem {
  id: string;
  de: string;
  assunto: string;
  corpo: string;
  nova: boolean;
}

@Component({
  selector: 'app-mensagens',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ZurListDetailLayout, ZurTopbar, ZurList, ZurListItem, ZurAvatar, ZurBadge, ZurPageHeader, ZurEmptyState],
  template: `
    <zur-list-detail-layout [(detailOpen)]="detalheAberto">
      <zur-topbar><strong zurTopbarStart>Mensagens</strong></zur-topbar>

      <div zurList>
        <zur-list label="Mensagens" selection="single" [value]="selecionada()" (valueChange)="abrir($event)">
          @for (m of mensagens; track m.id) {
            <zur-list-item [value]="m.id">
              <zur-avatar zurListLeading [name]="m.de" size="sm" />
              {{ m.de }}
              <span zurListSecondary>{{ m.assunto }}</span>
              @if (m.nova) { <zur-badge zurListTrailing color="mint">nova</zur-badge> }
            </zur-list-item>
          }
        </zur-list>
      </div>

      <article zurDetail>
        @if (atual(); as m) {
          <zur-page-header [title]="m.assunto" [description]="'De ' + m.de" />
          <p class="corpo">{{ m.corpo }}</p>
        } @else {
          <zur-empty-state title="Escolha uma mensagem" description="O conteúdo aparece aqui." />
        }
      </article>
    </zur-list-detail-layout>
  `,
  styles: `.corpo { font: var(--zur-font-body-lg); color: var(--zur-body); }`,
})
export class MensagensPage {
  protected readonly mensagens: Mensagem[] = [
    { id: '1', de: 'Ana Silva', assunto: 'Entrega da Monstera', corpo: 'Chega amanhã pela manhã.', nova: true },
    { id: '2', de: 'Bruno Costa', assunto: 'Troca de vaso', corpo: 'Posso trocar por um maior?', nova: false },
  ];
  protected readonly selecionada = signal<string | null>(null);
  protected readonly detalheAberto = signal(false);
  protected readonly atual = computed(() => this.mensagens.find((m) => m.id === this.selecionada()) ?? null);

  protected abrir(id: string | string[] | null): void {
    this.selecionada.set(typeof id === 'string' ? id : null);
    this.detalheAberto.set(true);
  }
}
```

**Notas**
- Lista selecionável é um `listbox`: setas movem, Enter/Espaço escolhem, só um item recebe o Tab.
- Para itens que navegam para outra rota, use `zur-list-item interactive` com `(click)` em vez de seleção.
