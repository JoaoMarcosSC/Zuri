import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ZurTextarea } from './textarea';

@Component({
  imports: [ZurTextarea, ReactiveFormsModule],
  template: `<zur-textarea label="Mensagem" [maxlength]="20" [formControl]="ctrl" />`,
})
class Host {
  ctrl = new FormControl('Olá');
}

describe('ZurTextarea', () => {
  it('liga o valor ao formulário e atualiza o contador', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const field = el.querySelector('textarea') as HTMLTextAreaElement;
    expect(field.value).toBe('Olá');
    expect(el.querySelector('.count')?.textContent?.trim()).toBe('3/20');
    field.value = 'Olá, tudo bem?';
    field.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(fixture.componentInstance.ctrl.value).toBe('Olá, tudo bem?');
    expect(el.querySelector('.count')?.textContent?.trim()).toBe('14/20');
  });

  it('anuncia o contador por extenso via aria-describedby', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const field = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    const ids = field.getAttribute('aria-describedby')!.split(' ');
    const texts = ids.map((id) => document.getElementById(id)?.textContent?.trim());
    expect(texts).toContain('3 de 20 caracteres');
    expect(field.getAttribute('maxlength')).toBe('20');
  });

  it('desabilita pelo formulário', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.ctrl.disable();
    await fixture.whenStable();
    expect((fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement).disabled).toBe(true);
  });
});
