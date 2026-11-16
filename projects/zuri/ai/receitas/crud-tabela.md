# Receita: lista com tabela (CRUD)

**Quando usar:** gerenciar registros vindos de uma API: buscar, ordenar, paginar, selecionar e excluir.
**Peças:** `zur-page-header`, `zur-table-toolbar` (busca e ações em lote), `table[zur-table]`,
`zur-pagination`, `ZurDialog.confirm` para excluir, `zur-empty-state` quando não há dados,
`tbody[zurTableSkeleton]` enquanto carrega. A tabela **avisa** (ordenação, seleção) e você decide.

```ts
// arquivo: src/app/pedidos/pedidos.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface Pedido {
  id: string;
  cliente: string;
  total: number;
  status: 'novo' | 'enviado' | 'entregue';
}

export interface Pagina<T> {
  itens: T[];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class PedidosService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/pedidos';

  listar(q: { busca: string; pagina: number; tamanho: number; ordem?: string }): Observable<Pagina<Pedido>> {
    let params = new HttpParams().set('busca', q.busca).set('pagina', q.pagina).set('tamanho', q.tamanho);
    if (q.ordem) params = params.set('ordem', q.ordem);
    return this.http.get<Pagina<Pedido>>(this.url, { params });
  }

  excluir(ids: string[]): Observable<void> {
    return this.http.post<void>(`${this.url}/excluir`, { ids });
  }
}
```

```ts
// arquivo: src/app/pedidos/pedidos.page.ts
import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import {
  ZurBadge, ZurButton, ZurDialog, ZurEmptyState, ZurPageHeader, ZurPagination, ZurRowSelect, ZurSearch,
  ZurSelectAll, ZurSort, ZurSortable, ZurTable, ZurTableRow, ZurTableSkeleton, ZurTableToolbar, ZurToastService,
} from '@juau/zuri';
import { Pedido, PedidosService } from './pedidos.service';

@Component({
  selector: 'app-pedidos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe, ZurPageHeader, ZurTableToolbar, ZurSearch, ZurButton, ZurTable, ZurSortable, ZurTableRow,
    ZurRowSelect, ZurSelectAll, ZurTableSkeleton, ZurPagination, ZurBadge, ZurEmptyState,
  ],
  template: `
    <zur-page-header title="Pedidos" description="Acompanhe e gerencie os pedidos.">
      <button zurPageHeaderActions zur-button variant="primary" size="sm">Novo pedido</button>
    </zur-page-header>

    <zur-table-toolbar [selectedCount]="selecionados().length" (clearSelection)="selecionados.set([])">
      <zur-search label="Buscar pedidos" [debounceMs]="300" (searchChange)="buscar($event)" />
      <button zurTableToolbarBatch zur-button size="sm" variant="danger" (click)="excluirSelecionados()">Excluir</button>
    </zur-table-toolbar>

    @if (!carregando() && pedidos().length === 0) {
      <zur-empty-state title="Nenhum pedido encontrado" description="Tente outra busca ou crie um pedido." />
    } @else {
      <table zur-table [(selected)]="selecionados" (sortChange)="ordenar($event)">
        <thead>
          <tr>
            <th zurSelectAll></th>
            <th zurSortable="cliente">Cliente</th>
            <th zurSortable="total">Total</th>
            <th>Status</th>
          </tr>
        </thead>
        @if (carregando()) {
          <tbody zurTableSkeleton [rows]="5" [columns]="4"></tbody>
        } @else {
          <tbody>
            @for (p of pedidos(); track p.id) {
              <tr [zurRow]="p.id">
                <td zurSelect></td>
                <td>{{ p.cliente }}</td>
                <td>{{ p.total | currency: 'BRL' }}</td>
                <td><zur-badge [color]="p.status === 'entregue' ? 'success' : p.status === 'enviado' ? 'info' : 'neutral'">{{ p.status }}</zur-badge></td>
              </tr>
            }
          </tbody>
        }
      </table>
      <zur-pagination [total]="total()" [pageSize]="tamanho" [(page)]="pagina" />
    }
  `,
})
export class PedidosPage {
  private readonly api = inject(PedidosService);
  private readonly dialog = inject(ZurDialog);
  private readonly toast = inject(ZurToastService);

  protected readonly tamanho = 20;
  protected readonly pedidos = signal<Pedido[]>([]);
  protected readonly total = signal(0);
  protected readonly carregando = signal(true);
  protected readonly selecionados = signal<string[]>([]);
  protected readonly pagina = signal(1);
  private readonly busca = signal('');
  private readonly ordem = signal<string | undefined>(undefined);

  constructor() {
    // recarrega quando busca, página ou ordem mudam
    effect(() => {
      const q = { busca: this.busca(), pagina: this.pagina(), tamanho: this.tamanho, ordem: this.ordem() };
      void this.carregar(q);
    });
  }

  private async carregar(q: { busca: string; pagina: number; tamanho: number; ordem?: string }): Promise<void> {
    this.carregando.set(true);
    try {
      const r = await firstValueFrom(this.api.listar(q));
      this.pedidos.set(r.itens);
      this.total.set(r.total);
    } catch {
      this.toast.show('Não foi possível carregar os pedidos.', 'error');
    } finally {
      this.carregando.set(false);
    }
  }

  protected buscar(texto: string): void {
    this.busca.set(texto);
    this.pagina.set(1);
  }

  protected ordenar(s: ZurSort): void {
    this.ordem.set(`${s.key},${s.direction}`);
  }

  protected async excluirSelecionados(): Promise<void> {
    const ids = this.selecionados();
    const ok = await this.dialog.confirm({
      title: `Excluir ${ids.length} pedido(s)?`,
      message: 'Esta ação não pode ser desfeita.',
      confirmLabel: 'Excluir',
      destructive: true,
    });
    if (!ok) return;
    await firstValueFrom(this.api.excluir(ids));
    this.selecionados.set([]);
    this.toast.show('Pedidos excluídos', 'success');
    void this.carregar({ busca: this.busca(), pagina: this.pagina(), tamanho: this.tamanho, ordem: this.ordem() });
  }
}
```

**Notas**
- Precisa de `provideHttpClient()` nos providers e de `<zur-toast-container />` no componente raiz.
- **App com SSR:** não pré-renderize telas que buscam dados da API (o build fica esperando a resposta e falha
  por tempo). Em `app.routes.server.ts`, coloque a rota como cliente:
  `{ path: 'pedidos', renderMode: RenderMode.Client }` (ou `RenderMode.Server` se a API for alcançável pelo servidor),
  antes da regra `'**'`.
- Tabela larga: envolva em `<div class="zur-table-scroll" tabindex="0" role="region" aria-label="…">` e use
  `stickyHeader`/`stickyFirstColumn`; colunas redimensionáveis com `th[zurResizable]`.
- Detalhe ao clicar na linha: rota `pedidos/:id` ou o layout de lista e detalhe (`lista-detalhe.md`).
