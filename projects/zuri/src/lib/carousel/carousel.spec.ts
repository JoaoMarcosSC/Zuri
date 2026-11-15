import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZurCarousel, ZurCarouselSlide } from './carousel';

@Component({
  imports: [ZurCarousel, ZurCarouselSlide],
  template: `
    <zur-carousel label="Destaques" [loop]="loop()" [autoplay]="autoplay()" [(index)]="i">
      <zur-carousel-slide>Um</zur-carousel-slide>
      <zur-carousel-slide>Dois</zur-carousel-slide>
      <zur-carousel-slide>Três</zur-carousel-slide>
    </zur-carousel>
  `,
})
class Host {
  i = signal(0);
  loop = signal(false);
  autoplay = signal(0);
}

async function setup(dir?: 'rtl') {
  const fixture = TestBed.createComponent(Host);
  if (dir) document.body.setAttribute('dir', dir);
  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const carousel = el.querySelector('zur-carousel') as HTMLElement;
  const click = async (sel: string) => {
    (el.querySelector(sel) as HTMLElement).click();
    await fixture.whenStable();
  };
  return { fixture, el, carousel, click, host: () => fixture.componentInstance };
}

afterEach(() => document.body.removeAttribute('dir'));

describe('ZurCarousel', () => {
  it('é uma região de carrossel com slides numerados', async () => {
    const { el, carousel } = await setup();
    expect(carousel.getAttribute('role')).toBe('region');
    expect(carousel.getAttribute('aria-roledescription')).toBe('carousel');
    expect(carousel.getAttribute('aria-label')).toBe('Destaques');
    const slides = Array.from(el.querySelectorAll('zur-carousel-slide'));
    expect(slides.map((s) => s.getAttribute('aria-label'))).toEqual(['Slide 1 de 3', 'Slide 2 de 3', 'Slide 3 de 3']);
    expect(slides.map((s) => s.hasAttribute('inert'))).toEqual([false, true, true]);
  });

  it('setas, pontos e teclado trocam o slide e movem a trilha', async () => {
    const ctx = await setup();
    const { el, click, host, carousel } = ctx;
    await click('.next');
    expect(host().i()).toBe(1);
    expect((el.querySelector('.track') as HTMLElement).style.transform).toBe('translateX(-100%)');
    await click('.dot:nth-child(3)');
    expect(host().i()).toBe(2);
    expect((el.querySelector('.next') as HTMLButtonElement).disabled).toBe(true);
    const { fixture } = ctx;
    carousel.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true }));
    await fixture.whenStable();
    expect(host().i()).toBe(1);
    expect(el.querySelector('.dot[aria-current=true]')).toBe(el.querySelectorAll('.dot')[1]);
  });

  it('com loop volta ao início', async () => {
    const { fixture, click, host } = await setup();
    host().loop.set(true);
    await fixture.whenStable();
    await click('.prev');
    expect(host().i()).toBe(2);
    await click('.next');
    expect(host().i()).toBe(0);
  });

  it('em RTL as setas se invertem e a trilha anda para o outro lado', async () => {
    const { fixture, el, host, carousel } = await setup('rtl');
    carousel.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true }));
    await fixture.whenStable();
    expect(host().i()).toBe(1); // ← avança em RTL
    expect((el.querySelector('.track') as HTMLElement).style.transform).toBe('translateX(100%)');
  });

  it('autoplay avança sozinho e para ao focar ou pausar', async () => {
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const { fixture, el, host } = await setup();
    const carousel = el.querySelector('zur-carousel')!;
    host().autoplay.set(40);
    await fixture.whenStable();
    // observa o índice por um tempo: ele precisa sair do 0 (e dá a volta no fim)
    const seen = new Set<number>();
    for (let t = 0; t < 140; t += 10) {
      seen.add(host().i());
      await wait(10);
    }
    expect(Math.max(...seen)).toBeGreaterThan(0);

    // foco dentro: não avança
    carousel.dispatchEvent(new Event('focusin', { bubbles: true }));
    await fixture.whenStable();
    const parado = host().i();
    await wait(200);
    expect(host().i()).toBe(parado);

    // sai do foco, mas o usuário pausou: continua parado
    carousel.dispatchEvent(new Event('focusout', { bubbles: true }));
    (el.querySelector('.pause') as HTMLButtonElement).click();
    await fixture.whenStable();
    await wait(200);
    expect(host().i()).toBe(parado);
    expect((el.querySelector('.pause') as HTMLElement).getAttribute('aria-label')).toBe('Retomar rotação automática');
  });
});
