import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZurAvatarGroup } from './avatar-group';

@Component({
  imports: [ZurAvatarGroup],
  template: `<zur-avatar-group label="Equipe" [people]="people" [max]="3" />`,
})
class Host {
  people = ['Ana Silva', 'Bruno Costa', 'Carla Dias', 'Diego Melo', 'Eva Lima'].map((name) => ({ name }));
}

describe('ZurAvatarGroup', () => {
  it('mostra só `max` avatares e resume o resto', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('zur-avatar').length).toBe(3);
    expect(el.querySelector('.more')?.textContent).toContain('+2');
    expect(el.querySelector('.more .sr-only')?.textContent?.trim()).toBe('mais 2 pessoas');
    expect(el.querySelector('zur-avatar-group')?.getAttribute('role')).toBe('group');
  });

  it('sem excedente não mostra o contador', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.people = fixture.componentInstance.people.slice(0, 2);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.more')).toBeNull();
  });
});
