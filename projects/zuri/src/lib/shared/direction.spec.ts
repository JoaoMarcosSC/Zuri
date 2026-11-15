import { zurInlineStep, zurIsRtl } from './direction';

const key = (k: string) => new KeyboardEvent('keydown', { key: k });

describe('direção (LTR/RTL)', () => {
  afterEach(() => (document.body.innerHTML = ''));

  it('lê o atributo dir do ancestral mais próximo', () => {
    document.body.innerHTML = `<div dir="rtl"><section dir="ltr"><i id="a"></i></section><i id="b"></i></div>`;
    expect(zurIsRtl(document.getElementById('a')!)).toBe(false);
    expect(zurIsRtl(document.getElementById('b')!)).toBe(true);
  });

  it('sem dir, é LTR', () => {
    document.body.innerHTML = `<i id="a"></i>`;
    expect(zurIsRtl(document.getElementById('a')!)).toBe(false);
  });

  it('inverte as setas em RTL', () => {
    document.body.innerHTML = `<div id="l"></div><div dir="rtl" id="r"></div>`;
    const ltr = document.getElementById('l')!;
    const rtl = document.getElementById('r')!;
    expect(zurInlineStep(key('ArrowRight'), ltr)).toBe(1);
    expect(zurInlineStep(key('ArrowLeft'), ltr)).toBe(-1);
    expect(zurInlineStep(key('ArrowRight'), rtl)).toBe(-1);
    expect(zurInlineStep(key('ArrowLeft'), rtl)).toBe(1);
    expect(zurInlineStep(key('ArrowUp'), rtl)).toBe(0);
  });
});
