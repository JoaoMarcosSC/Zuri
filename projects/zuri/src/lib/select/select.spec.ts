import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ZurSelect } from './select';

@Component({
  imports: [ZurSelect, ReactiveFormsModule],
  template: `<zur-select label="Categoria" [options]="options" [formControl]="ctrl" />`,
})
class Host {
  options = [
    { value: 'folhagem', label: 'Folhagem' },
    { value: 'suculenta', label: 'Suculenta' },
  ];
  ctrl = new FormControl('suculenta');
}

describe('ZurSelect', () => {
  it('renderiza as opções e seleciona o valor do formulário', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    const labels = Array.from(select.options).map((o) => o.textContent?.trim());
    expect(labels).toContain('Folhagem');
    expect(labels).toContain('Suculenta');
    expect(select.value).toBe('suculenta');
  });

  it('propaga a escolha para o formulário', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    select.value = 'folhagem';
    select.dispatchEvent(new Event('change'));
    expect(fixture.componentInstance.ctrl.value).toBe('folhagem');
  });
});
