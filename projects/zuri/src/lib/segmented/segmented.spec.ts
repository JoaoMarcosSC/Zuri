import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ZurSegmented } from './segmented';

@Component({
  imports: [ZurSegmented, ReactiveFormsModule],
  template: `<zur-segmented label="Visualização" [options]="opts" [formControl]="ctrl" />`,
})
class Host {
  opts = [
    { value: 'grade', label: 'Grade' },
    { value: 'lista', label: 'Lista' },
    { value: 'mapa', label: 'Mapa' },
  ];
  ctrl = new FormControl('lista');
}

describe('ZurSegmented', () => {
  it('é um radiogroup com roving tabindex', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const host = fixture.nativeElement.querySelector('zur-segmented') as HTMLElement;
    expect(host.getAttribute('role')).toBe('radiogroup');
    const radios = Array.from(host.querySelectorAll('[role=radio]')) as HTMLElement[];
    expect(radios.map((r) => r.getAttribute('aria-checked'))).toEqual(['false', 'true', 'false']);
    expect(radios.map((r) => r.tabIndex)).toEqual([-1, 0, -1]);
  });

  it('setas trocam a opção (com volta) e clique escolhe', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const host = fixture.nativeElement.querySelector('zur-segmented') as HTMLElement;
    host.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    host.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.ctrl.value).toBe('grade');
    (host.querySelectorAll('[role=radio]')[2] as HTMLElement).click();
    await fixture.whenStable();
    expect(fixture.componentInstance.ctrl.value).toBe('mapa');
  });
});
