import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ZurCheckbox } from './checkbox';

@Component({
  imports: [ZurCheckbox, ReactiveFormsModule],
  template: `<zur-checkbox [formControl]="ctrl">Aceito</zur-checkbox>`,
})
class Host {
  ctrl = new FormControl(true);
}

describe('ZurCheckbox', () => {
  it('reflete o valor do formulário e propaga a mudança', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const box = fixture.nativeElement.querySelector('input[type=checkbox]') as HTMLInputElement;
    expect(box.checked).toBe(true);
    box.checked = false;
    box.dispatchEvent(new Event('change'));
    expect(fixture.componentInstance.ctrl.value).toBe(false);
  });

  it('desabilita pelo formulário', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.ctrl.disable();
    await fixture.whenStable();
    expect((fixture.nativeElement.querySelector('input') as HTMLInputElement).disabled).toBe(true);
  });
});
