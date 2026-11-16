import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZurDivider } from './divider';

@Component({
  imports: [ZurDivider],
  template: `
    <zur-divider id="a" />
    <zur-divider id="b" label="ou" />
    <zur-divider id="c" orientation="vertical" />
  `,
})
class Host {}

describe('ZurDivider', () => {
  it('é um separador; o rótulo vira nome acessível e a vertical declara a orientação', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const q = (id: string) => fixture.nativeElement.querySelector(`#${id}`) as HTMLElement;
    expect(q('a').getAttribute('role')).toBe('separator');
    expect(q('a').getAttribute('aria-label')).toBeNull();
    expect(q('a').getAttribute('aria-orientation')).toBeNull();
    expect(q('b').getAttribute('aria-label')).toBe('ou');
    expect(q('b').querySelector('.text')?.getAttribute('aria-hidden')).toBe('true');
    expect(q('c').getAttribute('aria-orientation')).toBe('vertical');
  });
});
