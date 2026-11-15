import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ZurSwitch } from './switch';

@Component({
  imports: [ZurSwitch, ReactiveFormsModule],
  template: `<zur-switch [formControl]="ctrl">Notificações</zur-switch>`,
})
class Host {
  ctrl = new FormControl(false);
}

describe('ZurSwitch', () => {
  it('usa role="switch" com aria-checked e alterna no clique', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const btn = fixture.nativeElement.querySelector('[role=switch]') as HTMLButtonElement;
    expect(btn.getAttribute('aria-checked')).toBe('false');
    btn.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.ctrl.value).toBe(true);
    expect(btn.getAttribute('aria-checked')).toBe('true');
  });

  it('não alterna quando desabilitado', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.ctrl.disable();
    await fixture.whenStable();
    const btn = fixture.nativeElement.querySelector('[role=switch]') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    btn.click();
    expect(fixture.componentInstance.ctrl.value).toBe(false);
  });

  it('o texto projetado é o nome acessível do botão', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const btn = fixture.nativeElement.querySelector('[role=switch]') as HTMLButtonElement;
    const label = document.getElementById(btn.getAttribute('aria-labelledby')!);
    expect(label?.textContent?.trim()).toBe('Notificações');
  });
});
