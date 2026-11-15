import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ZurSelect } from './select';

@Component({
  imports: [ZurSelect, ReactiveFormsModule],
  template: `<zur-select label="Destino" [options]="options" [formControl]="ctrl" />`,
})
class Host {
  options = [
    { value: 'serra', label: 'Serra' },
    { value: 'praia', label: 'Praia' },
  ];
  ctrl = new FormControl('praia');
}

describe('ZurSelect', () => {
  it('renderiza as opções e seleciona o valor do formulário', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    const labels = Array.from(select.options).map((o) => o.textContent?.trim());
    expect(labels).toContain('Serra');
    expect(labels).toContain('Praia');
    expect(select.value).toBe('praia');
  });

  it('propaga a escolha para o formulário', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    select.value = 'serra';
    select.dispatchEvent(new Event('change'));
    expect(fixture.componentInstance.ctrl.value).toBe('serra');
  });
});
