import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZurBadge } from './badge';

@Component({
  imports: [ZurBadge],
  template: `<zur-badge>Novo</zur-badge><zur-badge color="error">Erro</zur-badge>`,
})
class Host {}

describe('ZurBadge', () => {
  it('usa mint por padrão e aceita outras cores', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [a, b] = Array.from(fixture.nativeElement.querySelectorAll('zur-badge')) as HTMLElement[];
    expect(a.dataset['color']).toBe('mint');
    expect(b.dataset['color']).toBe('error');
    expect(b.textContent?.trim()).toBe('Erro');
  });
});
