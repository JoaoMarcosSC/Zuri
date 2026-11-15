import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideZuriI18n } from '../i18n/i18n';
import { ZurPagination } from './pagination';

@Component({
  imports: [ZurPagination],
  template: `<zur-pagination [total]="200" [pageSize]="10" [(page)]="pagina" />`,
})
class Host {
  pagina = signal(1);
}

function labels(el: HTMLElement) {
  return Array.from(el.querySelectorAll('li')).map((li) => li.textContent?.trim() || 'btn');
}

describe('ZurPagination', () => {
  it('mostra primeira, vizinhas, reticências e última', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.pagina.set(10);
    await fixture.whenStable();
    expect(labels(fixture.nativeElement)).toEqual(['btn', '1', '…', '9', '10', '11', '…', '20', 'btn']);
  });

  it('marca a página atual e navega com anterior/próxima e números', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const prev = el.querySelector('[aria-label="Página anterior"]') as HTMLButtonElement;
    const next = el.querySelector('[aria-label="Próxima página"]') as HTMLButtonElement;
    expect(prev.disabled).toBe(true);
    expect(el.querySelector('[aria-current=page]')?.textContent?.trim()).toBe('1');
    next.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.pagina()).toBe(2);
    (el.querySelector('[aria-label="Página 20"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(fixture.componentInstance.pagina()).toBe(20);
    expect((el.querySelector('[aria-label="Próxima página"]') as HTMLButtonElement).disabled).toBe(true);
  });

  it('usa os textos do i18n em inglês', async () => {
    TestBed.configureTestingModule({ providers: [provideZuriI18n('en')] });
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('nav')?.getAttribute('aria-label')).toBe('Pagination');
    expect(el.querySelector('[aria-label="Next page"]')).toBeTruthy();
    expect(el.querySelector('[aria-label="Page 2"]')).toBeTruthy();
  });
});
