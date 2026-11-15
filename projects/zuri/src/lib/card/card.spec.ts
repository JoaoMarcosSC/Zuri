import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZurCard } from './card';

@Component({
  imports: [ZurCard],
  template: `<zur-card id="a">A</zur-card><zur-card id="b" interactive>B</zur-card>`,
})
class Host {}

describe('ZurCard', () => {
  it('só marca data-interactive quando interactive', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('#a').hasAttribute('data-interactive')).toBe(false);
    expect(fixture.nativeElement.querySelector('#b').hasAttribute('data-interactive')).toBe(true);
  });
});
