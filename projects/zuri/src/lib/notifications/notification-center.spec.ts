import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZurNotification, ZurNotificationCenter } from './notification-center';

const today = new Date();
const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 12);

@Component({
  imports: [ZurNotificationCenter],
  template: `
    <zur-notification-center
      [notifications]="items()"
      (read)="markRead($event)"
      (readAll)="items.update(l => l.map(n => ({ ...n, read: true })))"
    />
  `,
})
class Host {
  items = signal<ZurNotification[]>([
    { id: '1', title: 'Pedido enviado', date: today, read: false, kind: 'success' },
    { id: '2', title: 'Rega da jiboia', date: today, read: false },
    { id: '3', title: 'Cupom expirando', date: yesterday, read: true },
  ]);
  markRead(n: ZurNotification) {
    this.items.update((l) => l.map((i) => (i.id === n.id ? { ...i, read: true } : i)));
  }
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const bell = el.querySelector('.bell') as HTMLButtonElement;
  const openPanel = async () => {
    bell.click();
    await fixture.whenStable();
  };
  return { fixture, el, bell, openPanel };
}

describe('ZurNotificationCenter', () => {
  it('o sino anuncia e mostra o total de não lidas', async () => {
    const { bell } = await setup();
    expect(bell.getAttribute('aria-label')).toBe('Notificações, 2 não lidas');
    expect(bell.querySelector('.count')?.textContent?.trim()).toBe('2');
  });

  it('agrupa em Hoje e Anteriores', async () => {
    const { el, openPanel } = await setup();
    await openPanel();
    expect(Array.from(el.querySelectorAll('.group')).map((g) => g.textContent?.trim())).toEqual(['Hoje', 'Anteriores']);
    expect(el.querySelectorAll('.item.unread').length).toBe(2);
  });

  it('clique marca como lida e "marcar todas" zera o contador', async () => {
    const { fixture, el, bell, openPanel } = await setup();
    await openPanel();
    (el.querySelector('.item.unread') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(bell.getAttribute('aria-label')).toBe('Notificações, 1 não lida');
    (el.querySelector('.mark-all') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(bell.querySelector('.count')).toBeNull();
    expect(el.querySelector('.mark-all')).toBeNull();
  });

  it('mostra o estado vazio', async () => {
    const { fixture, el, openPanel } = await setup();
    fixture.componentInstance.items.set([]);
    await openPanel();
    expect(el.querySelector('zur-empty-state')?.textContent).toContain('Nada por aqui');
  });
});
