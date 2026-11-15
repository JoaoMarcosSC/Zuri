import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZurSort, ZurSortable, ZurTable } from './table';

@Component({
  imports: [ZurTable, ZurSortable],
  template: `
    <table zur-table density="compact" (sortChange)="ultima = $event">
      <thead><tr><th zurSortable="nome">Nome</th><th>Destino</th></tr></thead>
      <tbody><tr><td>Ana</td><td>Serra</td></tr></tbody>
    </table>
  `,
})
class Host {
  ultima: ZurSort | null = null;
}

describe('ZurTable + zurSortable', () => {
  it('aplica a classe e a densidade', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const table = fixture.nativeElement.querySelector('table') as HTMLElement;
    expect(table.classList).toContain('zur-table');
    expect(table.dataset['density']).toBe('compact');
  });

  it('ordena ao clicar: asc, depois desc, com aria-sort e sortChange', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const th = fixture.nativeElement.querySelector('th[zurSortable]') as HTMLElement;
    const btn = th.querySelector('button') as HTMLButtonElement;
    expect(th.getAttribute('aria-sort')).toBe('none');
    btn.click();
    await fixture.whenStable();
    expect(th.getAttribute('aria-sort')).toBe('ascending');
    expect(fixture.componentInstance.ultima).toEqual({ key: 'nome', direction: 'asc' });
    btn.click();
    await fixture.whenStable();
    expect(th.getAttribute('aria-sort')).toBe('descending');
    expect(fixture.componentInstance.ultima).toEqual({ key: 'nome', direction: 'desc' });
  });
});
