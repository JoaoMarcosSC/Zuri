import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ZurSlider } from './slider';

@Component({
  imports: [ZurSlider, ReactiveFormsModule],
  template: `
    <zur-slider label="Altura" [min]="0" [max]="100" [step]="5" [formControl]="single" />
    <zur-slider label="Preço" range [min]="0" [max]="500" [step]="10" [format]="reais" [formControl]="faixa" />
  `,
})
class Host {
  single = new FormControl<number | null>(20);
  faixa = new FormControl<[number, number] | null>(null);
  reais = (v: number) => `R$ ${v}`;
}

const press = (el: Element, key: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));

describe('ZurSlider', () => {
  it('expõe role=slider e responde ao teclado', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [single] = Array.from(fixture.nativeElement.querySelectorAll('zur-slider')) as HTMLElement[];
    const thumb = single.querySelector('[role=slider]')!;
    expect(thumb.getAttribute('aria-valuenow')).toBe('20');
    expect(single.querySelector('.readout')?.textContent?.trim()).toBe('20');
    press(thumb, 'ArrowRight');
    press(thumb, 'PageUp');
    await fixture.whenStable();
    expect(fixture.componentInstance.single.value).toBe(75);
    press(thumb, 'End');
    await fixture.whenStable();
    expect(thumb.getAttribute('aria-valuenow')).toBe('100');
  });

  it('modo faixa: começa na trilha toda e os controles não se cruzam', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const range = fixture.nativeElement.querySelectorAll('zur-slider')[1] as HTMLElement;
    const [low, high] = Array.from(range.querySelectorAll('[role=slider]'));
    expect(low.getAttribute('aria-valuenow')).toBe('0');
    expect(high.getAttribute('aria-valuenow')).toBe('500');
    expect(low.getAttribute('aria-label')).toBe('Preço: Mínimo');
    expect(high.getAttribute('aria-valuetext')).toBe('R$ 500');
    expect(range.querySelector('.readout')?.textContent?.trim()).toBe('R$ 0 – R$ 500');
    press(high, 'Home');
    await fixture.whenStable();
    press(low, 'End');
    await fixture.whenStable();
    expect(fixture.componentInstance.faixa.value).toEqual([0, 0]);
  });
});
