import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZurAvatar } from './avatar';

@Component({
  imports: [ZurAvatar],
  template: `<zur-avatar name="Ana Silva" size="lg" />`,
})
class Host {}

describe('ZurAvatar', () => {
  it('mostra as iniciais do nome, o tamanho e o nome como title', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el = fixture.nativeElement.querySelector('zur-avatar') as HTMLElement;
    expect(el.textContent?.trim()).toBe('AS');
    expect(el.dataset['size']).toBe('lg');
    expect(el.getAttribute('title')).toBe('Ana Silva');
  });
});
