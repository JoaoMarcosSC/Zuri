import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZurTab, ZurTabs } from './tabs';

@Component({
  imports: [ZurTabs, ZurTab],
  template: `
    <zur-tabs [(index)]="i">
      <zur-tab label="Um">Painel um</zur-tab>
      <zur-tab label="Dois">Painel dois</zur-tab>
    </zur-tabs>
  `,
})
class Host {
  i = signal(0);
}

describe('ZurTabs', () => {
  it('mostra a primeira aba e troca ao clicar', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const tabs = Array.from(fixture.nativeElement.querySelectorAll('[role=tab]')) as HTMLElement[];
    expect(tabs.length).toBe(2);
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(fixture.nativeElement.textContent).toContain('Painel um');
    tabs[1].click();
    await fixture.whenStable();
    expect(fixture.componentInstance.i()).toBe(1);
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    expect(fixture.nativeElement.textContent).toContain('Painel dois');
  });
});
