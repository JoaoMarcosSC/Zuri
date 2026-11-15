import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ZurRadio } from './radio';

@Component({
  imports: [ZurRadio, ReactiveFormsModule],
  template: `
    <zur-radio name="plano" value="mensal" [formControl]="ctrl">Mensal</zur-radio>
    <zur-radio name="plano" value="anual" [formControl]="ctrl">Anual</zur-radio>
  `,
})
class Host {
  ctrl = new FormControl('mensal');
}

describe('ZurRadio', () => {
  it('marca o radio do valor atual e troca ao selecionar outro', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [mensal, anual] = Array.from(
      fixture.nativeElement.querySelectorAll('input[type=radio]'),
    ) as HTMLInputElement[];
    expect(mensal.checked).toBe(true);
    expect(anual.checked).toBe(false);
    anual.checked = true;
    anual.dispatchEvent(new Event('change'));
    expect(fixture.componentInstance.ctrl.value).toBe('anual');
  });
});
