import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZurTable, ZurSortable, ZurColumnResize } from './table';
import { ZurResizable, ZurTableSkeleton, ZurTableToolbar } from './table-extras';

@Component({
  imports: [ZurTable, ZurSortable, ZurResizable, ZurTableSkeleton, ZurTableToolbar],
  template: `
    <zur-table-toolbar [selectedCount]="marcadas()" (clearSelection)="limpou = limpou + 1">
      <span id="busca">busca</span>
      <button zurTableToolbarBatch id="excluir">Excluir</button>
    </zur-table-toolbar>
    <div dir="{{ dir() }}">
      <table zur-table [stickyHeader]="true" [stickyFirstColumn]="true" (columnResize)="resizes.push($event)" (sortChange)="ordenou = ordenou + 1">
        <thead>
          <tr>
            <th id="nome" zurSortable="nome" zurResizable="nome">Nome</th>
            <th id="qtd" zurResizable="qtd" [minWidth]="80" [maxWidth]="120">Qtd</th>
            <th>Preço</th>
          </tr>
        </thead>
        @if (carregando()) {
          <tbody zurTableSkeleton [rows]="3" [columns]="3"></tbody>
        } @else {
          <tbody><tr><td>x</td><td>1</td><td>2</td></tr></tbody>
        }
      </table>
    </div>
  `,
})
class Host {
  marcadas = signal(0);
  carregando = signal(true);
  dir = signal('ltr');
  limpou = 0;
  ordenou = 0;
  resizes: ZurColumnResize[] = [];
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  await new Promise((r) => setTimeout(r, 10)); // afterNextRender cria as alças
  const el = fixture.nativeElement as HTMLElement;
  const table = el.querySelector('table') as HTMLTableElement;
  const th = (id: string) => el.querySelector(`#${id}`) as HTMLElement;
  const handle = (id: string) => th(id).querySelector('.zur-resize-handle') as HTMLElement;
  // jsdom não calcula layout: a largura vem do style
  for (const id of ['nome', 'qtd']) {
    th(id).style.width = '100px';
    Object.defineProperty(th(id), 'offsetWidth', { configurable: true, get: () => parseInt(th(id).style.width || '100', 10) });
  }
  const key = async (id: string, k: string, init: KeyboardEventInit = {}) => {
    handle(id).dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, ...init }));
    await fixture.whenStable();
  };
  return { fixture, el, host: fixture.componentInstance, table, th, handle, key };
}

describe('tabela: cabeçalho e coluna fixos', () => {
  it('marca a tabela para o CSS sticky e para o layout fixo das colunas redimensionáveis', async () => {
    const { table } = await setup();
    expect(table.hasAttribute('data-sticky-header')).toBe(true);
    expect(table.hasAttribute('data-sticky-first')).toBe(true);
    expect(table.hasAttribute('data-resizable')).toBe(true);
  });
});

describe('th[zurResizable]', () => {
  it('cria uma alça acessível (separator com valores) em cada coluna marcada', async () => {
    const { th, handle } = await setup();
    const h = handle('nome');
    expect(h.getAttribute('role')).toBe('separator');
    expect(h.getAttribute('aria-orientation')).toBe('vertical');
    expect(h.getAttribute('aria-label')).toBe('Redimensionar coluna Nome');
    expect(h.getAttribute('tabindex')).toBe('0');
    expect(th('nome').querySelectorAll('.zur-resize-handle').length).toBe(1);
    expect(th('qtd').querySelector('.zur-resize-handle')?.getAttribute('aria-valuemin')).toBe('80');
    expect(th('qtd').querySelector('.zur-resize-handle')?.getAttribute('aria-valuemax')).toBe('120');
    expect(document.querySelector('th:not([zurResizable]) .zur-resize-handle')).toBeNull();
  });

  it('as setas mudam 8 px (Shift 32), emitem a largura e respeitam mínimo e máximo', async () => {
    const { host, th, key, handle } = await setup();
    await key('nome', 'ArrowRight');
    expect(th('nome').style.width).toBe('108px');
    await key('nome', 'ArrowRight', { shiftKey: true });
    expect(th('nome').style.width).toBe('140px');
    await key('nome', 'ArrowLeft');
    expect(host.resizes.at(-1)).toEqual({ key: 'nome', width: 132 });
    expect(handle('nome').getAttribute('aria-valuenow')).toBe('132');
    for (let i = 0; i < 6; i++) await key('qtd', 'ArrowRight', { shiftKey: true });
    expect(th('qtd').style.width).toBe('120px'); // máximo
    for (let i = 0; i < 6; i++) await key('qtd', 'ArrowLeft', { shiftKey: true });
    expect(th('qtd').style.width).toBe('80px'); // mínimo
  });

  it('em RTL a seta para a esquerda alarga a coluna', async () => {
    const { fixture, host, th, key } = await setup();
    host.dir.set('rtl');
    await fixture.whenStable();
    await key('nome', 'ArrowLeft');
    expect(th('nome').style.width).toBe('108px');
    await key('nome', 'ArrowRight');
    expect(th('nome').style.width).toBe('100px');
  });

  it('clicar na alça não aciona a ordenação', async () => {
    const { fixture, host, handle } = await setup();
    handle('nome').click();
    await fixture.whenStable();
    expect(host.ordenou).toBe(0);
  });
});

describe('zur-table-toolbar', () => {
  it('em repouso mostra o conteúdo normal e esconde as ações em lote', async () => {
    const { el } = await setup();
    expect(el.querySelector('#busca')).not.toBeNull();
    expect(el.querySelector('#excluir')).toBeNull();
    expect(el.querySelector('zur-table-toolbar')?.hasAttribute('data-batch')).toBe(false);
  });

  it('com seleção vira barra de lote: contagem, ações, anúncio e limpar', async () => {
    const { fixture, el, host } = await setup();
    host.marcadas.set(3);
    await fixture.whenStable();
    const bar = el.querySelector('zur-table-toolbar') as HTMLElement;
    expect(bar.hasAttribute('data-batch')).toBe(true);
    expect(bar.querySelector('.count')?.textContent).toBe('3 selecionadas');
    expect(bar.querySelector('[aria-live=polite]')?.textContent).toBe('3 selecionadas');
    expect(getComputedStyle(bar.querySelector('[aria-live=polite]')!).position).toBe('absolute'); // não duplica a contagem na tela
    expect(el.querySelector('#busca')).toBeNull();
    expect(el.querySelector('#excluir')).not.toBeNull();
    (bar.querySelector('.clear') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(host.limpou).toBe(1);
    host.marcadas.set(1);
    await fixture.whenStable();
    expect(bar.querySelector('.count')?.textContent).toBe('1 selecionada');
  });
});

describe('tbody[zurTableSkeleton]', () => {
  it('renderiza as linhas em skeleton, avisa carregamento e marca a tabela como ocupada', async () => {
    const { fixture, el, host, table } = await setup();
    expect(table.getAttribute('aria-busy')).toBe('true');
    expect(el.querySelectorAll('tbody tr[aria-hidden=true]').length).toBe(3);
    expect(el.querySelectorAll('tbody tr[aria-hidden=true] zur-skeleton').length).toBe(9);
    expect(el.querySelector('tbody td[role=status]')?.textContent).toContain('Carregando dados');
    host.carregando.set(false);
    await fixture.whenStable();
    expect(table.hasAttribute('aria-busy')).toBe(false);
    expect(el.querySelector('zur-skeleton')).toBeNull();
  });
});
