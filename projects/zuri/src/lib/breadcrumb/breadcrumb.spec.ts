import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZurBreadcrumb } from './breadcrumb';

@Component({
  imports: [ZurBreadcrumb],
  template: `<zur-breadcrumb [items]="items" />`,
})
class Host {
  items = [{ label: 'Início', href: '#' }, { label: 'Reservas' }];
}

describe('ZurBreadcrumb', () => {
  it('usa nav com rótulo do i18n e marca o último item como página atual', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const nav = fixture.nativeElement.querySelector('nav') as HTMLElement;
    expect(nav.getAttribute('aria-label')).toBe('Trilha de navegação');
    const current = fixture.nativeElement.querySelector('[aria-current=page]') as HTMLElement;
    expect(current.textContent?.trim()).toBe('Reservas');
  });
});
