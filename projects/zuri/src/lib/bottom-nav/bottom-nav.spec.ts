import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZurBottomNav, ZurBottomNavItem } from './bottom-nav';

@Component({
  imports: [ZurBottomNav, ZurBottomNavItem],
  template: `
    <zur-bottom-nav [fixed]="fixo()" [responsive]="false">
      <a zur-bottom-nav-item id="a" href="#a" active><i zurBottomNavIcon></i> Início</a>
      <a zur-bottom-nav-item id="b" href="#b" [badge]="3"><i zurBottomNavIcon></i> Pedidos</a>
      <button zur-bottom-nav-item id="c" badge="dot"><i zurBottomNavIcon></i> Alertas</button>
      <a zur-bottom-nav-item id="d" href="#d" [badge]="0">Perfil</a>
    </zur-bottom-nav>
  `,
})
class Host {
  fixo = signal(true);
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  return { fixture, el, nav: el.querySelector('zur-bottom-nav') as HTMLElement, q: (id: string) => el.querySelector(`#${id}`) as HTMLElement };
}

describe('ZurBottomNav', () => {
  it('é uma região de navegação com nome padrão', async () => {
    const { nav } = await setup();
    expect(nav.getAttribute('role')).toBe('navigation');
    expect(nav.getAttribute('aria-label')).toBe('Navegação inferior');
  });

  it('o item ativo leva aria-current="page" e os outros não', async () => {
    const { q } = await setup();
    expect(q('a').getAttribute('aria-current')).toBe('page');
    expect(q('b').hasAttribute('aria-current')).toBe(false);
  });

  it('o badge numérico mostra o número com texto para leitor de tela; zero não mostra', async () => {
    const { q } = await setup();
    expect(q('b').querySelector('.badge')?.textContent).toBe('3');
    expect(q('b').querySelector('.sr-only')?.textContent).toBe('3 novos');
    expect(getComputedStyle(q('b').querySelector('.sr-only')!).position).toBe('absolute'); // oculto de verdade
    expect(q('d').querySelector('.badge')).toBeNull();
  });

  it('o ponto não tem número mas é anunciado', async () => {
    const { q } = await setup();
    expect(q('c').querySelector('.badge.dot')).not.toBeNull();
    expect(q('c').querySelector('.badge')?.textContent).toBe('');
    expect(q('c').querySelector('.sr-only')?.textContent).toBe('1 novo');
  });

  it('fixed liga o posicionamento na base e responsive desliga a regra de esconder', async () => {
    const { fixture, nav } = await setup();
    expect(nav.hasAttribute('data-fixed')).toBe(true);
    expect(nav.hasAttribute('data-responsive')).toBe(false);
    fixture.componentInstance.fixo.set(false);
    await fixture.whenStable();
    expect(nav.hasAttribute('data-fixed')).toBe(false);
  });
});
