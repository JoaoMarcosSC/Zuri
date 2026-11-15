import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZurStep } from './step';

@Component({
  imports: [ZurStep],
  template: `<zur-step number="2" title="Importe os tokens"><p>Texto</p></zur-step>`,
})
class Host {}

describe('ZurStep', () => {
  it('mostra número, título e o conteúdo projetado', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h2')?.textContent).toContain('Importe os tokens');
    expect(el.querySelector('.num')?.textContent?.trim()).toBe('2');
    expect(el.querySelector('p')?.textContent).toBe('Texto');
  });
});
