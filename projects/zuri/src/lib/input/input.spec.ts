import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ZurInput } from './input';

@Component({
  imports: [ZurInput, ReactiveFormsModule],
  template: `<zur-input label="Nome" hint="Dica" [formControl]="ctrl" />`,
})
class Host {
  ctrl = new FormControl('Ana');
}

describe('ZurInput', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const field = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    return { fixture, field, host: fixture.componentInstance };
  }

  it('mostra o label e o valor vindo do formulário (writeValue)', async () => {
    const { fixture, field } = await setup();
    expect(fixture.nativeElement.querySelector('label')?.textContent).toContain('Nome');
    expect(field.value).toBe('Ana');
  });

  it('propaga o que é digitado para o formulário (registerOnChange)', async () => {
    const { field, host } = await setup();
    field.value = 'Bia';
    field.dispatchEvent(new Event('input'));
    expect(host.ctrl.value).toBe('Bia');
  });

  it('desabilita o campo pelo formulário (setDisabledState)', async () => {
    const { fixture, field, host } = await setup();
    host.ctrl.disable();
    await fixture.whenStable();
    expect(field.disabled).toBe(true);
  });
});
