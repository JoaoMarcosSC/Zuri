import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZurEmptyState } from './empty-state';

@Component({
  imports: [ZurEmptyState],
  template: `
    <zur-empty-state title="Nenhuma reserva" description="Elas aparecem aqui.">
      <svg zurEmptyIcon viewBox="0 0 24 24"></svg>
      <button>Explorar</button>
    </zur-empty-state>
  `,
})
class Host {}

describe('ZurEmptyState', () => {
  it('mostra ícone, título, descrição e ações', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.icon svg')).toBeTruthy();
    expect(el.querySelector('.title')?.textContent).toBe('Nenhuma reserva');
    expect(el.querySelector('.description')?.textContent).toBe('Elas aparecem aqui.');
    expect(el.querySelector('.actions button')?.textContent).toBe('Explorar');
  });
});
